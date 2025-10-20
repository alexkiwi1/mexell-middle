const websocketService = require('../services/websocket.service');
const logger = require('../config/logger');

/**
 * WebSocket Controller - API endpoints for WebSocket management
 * 
 * Provides REST API endpoints to:
 * - Get WebSocket connection statistics
 * - Send custom events to clients
 * - Manage WebSocket subscriptions
 * - Monitor real-time activity
 */

/**
 * Get WebSocket connection statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getWebSocketStats = async (req, res) => {
  try {
    const stats = websocketService.getStats();
    
    res.json({
      success: true,
      data: {
        ...stats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error getting WebSocket stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get WebSocket statistics',
      error: error.message
    });
  }
};

/**
 * Send custom event to specific client
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendCustomEvent = async (req, res) => {
  try {
    const { socketId, eventType, data } = req.body;

    if (!socketId || !eventType) {
      return res.status(400).json({
        success: false,
        message: 'socketId and eventType are required'
      });
    }

    websocketService.sendToClient(socketId, eventType, data);

    res.json({
      success: true,
      message: 'Custom event sent successfully',
      data: {
        socketId,
        eventType,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error sending custom event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send custom event',
      error: error.message
    });
  }
};

/**
 * Broadcast custom event to all clients
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const broadcastCustomEvent = async (req, res) => {
  try {
    const { eventType, data } = req.body;

    if (!eventType) {
      return res.status(400).json({
        success: false,
        message: 'eventType is required'
      });
    }

    websocketService.broadcastCustomEvent(eventType, data);

    res.json({
      success: true,
      message: 'Custom event broadcasted successfully',
      data: {
        eventType,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error broadcasting custom event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to broadcast custom event',
      error: error.message
    });
  }
};

/**
 * Get real-time activity summary
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRealtimeActivity = async (req, res) => {
  try {
    const { hours = 1 } = req.query;
    const endTime = Date.now() / 1000;
    const startTime = endTime - (parseInt(hours) * 3600);

    // Get recent violations
    const violationsSql = `
      SELECT COUNT(*) as count, camera
      FROM timeline
      WHERE timestamp >= $1 AND timestamp <= $2
      AND data->>'label' = 'cell phone'
      GROUP BY camera
      ORDER BY count DESC
    `;

    const { query } = require('../config/postgres');
    const violations = await query(violationsSql, [startTime, endTime]);

    // Get recent employee activity
    const activitySql = `
      SELECT 
        data->'sub_label'->>0 as employee_name,
        camera,
        COUNT(*) as activity_count,
        MAX(timestamp) as last_seen
      FROM timeline
      WHERE timestamp >= $1 AND timestamp <= $2
      AND data->>'label' = 'person'
      AND data->'sub_label'->>0 IS NOT NULL
      GROUP BY data->'sub_label'->>0, camera
      ORDER BY last_seen DESC
      LIMIT 20
    `;

    const activity = await query(activitySql, [startTime, endTime]);

    // Get camera status
    const cameraSql = `
      SELECT 
        camera,
        COUNT(*) as total_events,
        COUNT(DISTINCT data->'sub_label'->>0) as unique_employees,
        MAX(timestamp) as last_activity
      FROM timeline
      WHERE timestamp >= $1 AND timestamp <= $2
      GROUP BY camera
      ORDER BY last_activity DESC
    `;

    const cameras = await query(cameraSql, [startTime, endTime]);

    res.json({
      success: true,
      data: {
        timeRange: {
          start: new Date(startTime * 1000).toISOString(),
          end: new Date(endTime * 1000).toISOString(),
          hours: parseInt(hours)
        },
        violations: violations.map(v => ({
          camera: v.camera,
          count: parseInt(v.count)
        })),
        employeeActivity: activity.map(a => ({
          employee: a.employee_name,
          camera: a.camera,
          activityCount: parseInt(a.activity_count),
          lastSeen: new Date(a.last_seen * 1000).toISOString()
        })),
        cameraStatus: cameras.map(c => ({
          camera: c.camera,
          totalEvents: parseInt(c.total_events),
          uniqueEmployees: parseInt(c.unique_employees),
          lastActivity: new Date(c.last_activity * 1000).toISOString(),
          status: c.last_activity > (endTime - 300) ? 'active' : 'inactive'
        })),
        websocketStats: websocketService.getStats()
      }
    });
  } catch (error) {
    logger.error('Error getting real-time activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get real-time activity',
      error: error.message
    });
  }
};

/**
 * Test WebSocket connection
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const testWebSocket = async (req, res) => {
  try {
    // Send a test event to all connected clients
    websocketService.broadcastCustomEvent('test', {
      message: 'WebSocket test from API',
      timestamp: new Date().toISOString(),
      server: 'mexell-middleware'
    });

    res.json({
      success: true,
      message: 'Test event sent to all WebSocket clients',
      data: {
        timestamp: new Date().toISOString(),
        clients: websocketService.getStats().totalClients
      }
    });
  } catch (error) {
    logger.error('Error testing WebSocket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test WebSocket',
      error: error.message
    });
  }
};

module.exports = {
  getWebSocketStats,
  sendCustomEvent,
  broadcastCustomEvent,
  getRealtimeActivity,
  testWebSocket
};
