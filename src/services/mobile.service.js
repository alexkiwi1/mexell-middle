const { query } = require('../config/postgres');
const { parseDateTimeRange, unixToISO, unixToReadable } = require('./frigate.service');
const logger = require('../config/logger');

/**
 * Mobile Service - Mobile-optimized API endpoints
 * 
 * Features:
 * - Lightweight data responses for mobile apps
 * - Optimized queries for mobile performance
 * - Push notification data preparation
 * - Offline data synchronization
 * - Mobile-specific data formatting
 */

/**
 * Get mobile dashboard data (lightweight)
 * @param {Object} filters - Filters for the query (start_date, end_date, hours)
 * @returns {Object} - Mobile-optimized dashboard data
 */
const getMobileDashboard = async (filters = {}) => {
  const { start_date, end_date, hours } = filters;
  const { startTime, endTime } = parseDateTimeRange(start_date, end_date, hours);

  try {
    // Get basic stats with optimized queries
    const [violationsCount, employeesCount, camerasCount, recentActivity] = await Promise.all([
      // Violations count - simplified query
      query(`
        SELECT COUNT(*) as count
        FROM timeline
        WHERE timestamp >= $1 AND timestamp <= $2
        AND data->>'label' = 'cell phone'
        LIMIT 1
      `, [startTime, endTime]),

      // Active employees count - simplified query
      query(`
        SELECT COUNT(DISTINCT data->'sub_label'->>0) as count
        FROM timeline
        WHERE timestamp >= $1 AND timestamp <= $2
        AND data->>'label' = 'person'
        AND data->'sub_label'->>0 IS NOT NULL
        LIMIT 1
      `, [startTime, endTime]),

      // Active cameras count - simplified query
      query(`
        SELECT COUNT(DISTINCT camera) as count
        FROM timeline
        WHERE timestamp >= $1 AND timestamp <= $2
        LIMIT 1
      `, [startTime, endTime]),

      // Recent activity (last 5 events) - reduced limit
      query(`
        SELECT 
          timestamp,
          camera,
          data->>'label' as label,
          data->'sub_label'->>0 as employee_name,
          data->'zones' as zones
        FROM timeline
        WHERE timestamp >= $1 AND timestamp <= $2
        ORDER BY timestamp DESC
        LIMIT 5
      `, [startTime, endTime])
    ]);

    return {
      summary: {
        violations: parseInt(violationsCount[0]?.count || 0),
        active_employees: parseInt(employeesCount[0]?.count || 0),
        active_cameras: parseInt(camerasCount[0]?.count || 0),
        period: {
          start: unixToISO(startTime),
          end: unixToISO(endTime),
          hours: hours || 24
        }
      },
      recent_activity: recentActivity.map(activity => ({
        timestamp: unixToISO(activity.timestamp),
        camera: activity.camera,
        type: activity.label,
        employee: activity.employee_name,
        zones: activity.zones || []
      }))
    };
  } catch (error) {
    logger.error('Error getting mobile dashboard:', error);
    throw error;
  }
};

/**
 * Get mobile violations list (optimized for mobile)
 * @param {Object} filters - Filters for the query
 * @returns {Object} - Mobile-optimized violations data
 */
const getMobileViolations = async (filters = {}) => {
  const { start_date, end_date, hours, limit = 50, offset = 0 } = filters;
  const { startTime, endTime } = parseDateTimeRange(start_date, end_date, hours);

  try {
    const violations = await query(`
      SELECT
        timestamp,
        camera,
        COALESCE(source_id, data->>'id', data->>'event_id', 'unknown') as source_id,
        data->'sub_label'->>0 as face_employee_name,
        data->'zones' as zones,
        data->>'score' as confidence
      FROM timeline
      WHERE timestamp >= $1 AND timestamp <= $2
      AND data->>'label' = 'cell phone'
      ORDER BY timestamp DESC
      LIMIT $3 OFFSET $4
    `, [startTime, endTime, Math.min(limit, 50), offset]);

    return {
      violations: violations.map(violation => ({
        id: violation.source_id,
        timestamp: unixToISO(violation.timestamp),
        camera: violation.camera,
        employee: violation.face_employee_name,
        zones: violation.zones || [],
        confidence: violation.confidence ? parseFloat(violation.confidence) : null
      })),
      pagination: {
        limit,
        offset,
        total: violations.length,
        has_more: violations.length === limit
      }
    };
  } catch (error) {
    logger.error('Error getting mobile violations:', error);
    throw error;
  }
};

/**
 * Get mobile employee status (lightweight)
 * @param {Object} filters - Filters for the query
 * @returns {Object} - Mobile-optimized employee data
 */
const getMobileEmployeeStatus = async (filters = {}) => {
  const { start_date, end_date, hours } = filters;
  const { startTime, endTime } = parseDateTimeRange(start_date, end_date, hours);

  try {
    const employees = await query(`
      SELECT
        data->'sub_label'->>0 as employee_name,
        camera,
        MAX(timestamp) as last_seen,
        COUNT(*) as activity_count
      FROM timeline
      WHERE timestamp >= $1 AND timestamp <= $2
      AND data->>'label' = 'person'
      AND data->'sub_label'->>0 IS NOT NULL
      GROUP BY data->'sub_label'->>0, camera
      ORDER BY last_seen DESC
    `, [startTime, endTime]);

    return {
      employees: employees.map(emp => ({
        name: emp.employee_name,
        camera: emp.camera,
        last_seen: unixToISO(emp.last_seen),
        activity_count: parseInt(emp.activity_count),
        status: emp.last_seen > (Date.now() / 1000 - 300) ? 'active' : 'inactive'
      }))
    };
  } catch (error) {
    logger.error('Error getting mobile employee status:', error);
    throw error;
  }
};

/**
 * Get mobile camera status (lightweight)
 * @param {Object} filters - Filters for the query
 * @returns {Object} - Mobile-optimized camera data
 */
const getMobileCameraStatus = async (filters = {}) => {
  const { start_date, end_date, hours } = filters;
  const { startTime, endTime } = parseDateTimeRange(start_date, end_date, hours);

  try {
    const cameras = await query(`
      SELECT
        camera,
        COUNT(*) as total_events,
        COUNT(DISTINCT data->'sub_label'->>0) as unique_employees,
        MAX(timestamp) as last_activity,
        COUNT(CASE WHEN data->>'label' = 'cell phone' THEN 1 END) as violations
      FROM timeline
      WHERE timestamp >= $1 AND timestamp <= $2
      GROUP BY camera
      ORDER BY last_activity DESC
    `, [startTime, endTime]);

    return {
      cameras: cameras.map(cam => ({
        name: cam.camera,
        status: cam.last_activity > (Date.now() / 1000 - 300) ? 'active' : 'inactive',
        events: parseInt(cam.total_events),
        employees: parseInt(cam.unique_employees),
        violations: parseInt(cam.violations),
        last_activity: unixToISO(cam.last_activity)
      }))
    };
  } catch (error) {
    logger.error('Error getting mobile camera status:', error);
    throw error;
  }
};

/**
 * Get mobile notifications data
 * @param {Object} filters - Filters for the query
 * @returns {Object} - Mobile notifications data
 */
const getMobileNotifications = async (filters = {}) => {
  const { start_date, end_date, hours, limit = 20 } = filters;
  const { startTime, endTime } = parseDateTimeRange(start_date, end_date, hours);

  try {
    const notifications = await query(`
      SELECT
        timestamp,
        camera,
        data->>'label' as event_type,
        data->'sub_label'->>0 as employee_name,
        data->'zones' as zones,
        data->>'score' as confidence
      FROM timeline
      WHERE timestamp >= $1 AND timestamp <= $2
      AND data->>'label' IN ('cell phone', 'person')
      ORDER BY timestamp DESC
      LIMIT $3
    `, [startTime, endTime, limit]);

    return {
      notifications: notifications.map(notif => ({
        id: `${notif.camera}_${notif.timestamp}`,
        timestamp: unixToISO(notif.timestamp),
        type: notif.event_type,
        camera: notif.camera,
        employee: notif.employee_name,
        zones: notif.zones || [],
        confidence: notif.confidence ? parseFloat(notif.confidence) : null,
        priority: notif.event_type === 'cell phone' ? 'high' : 'normal'
      }))
    };
  } catch (error) {
    logger.error('Error getting mobile notifications:', error);
    throw error;
  }
};

/**
 * Get mobile sync data for offline support
 * @param {Object} filters - Filters for the query
 * @returns {Object} - Mobile sync data
 */
const getMobileSyncData = async (filters = {}) => {
  const { last_sync, limit = 100 } = filters;
  const startTime = last_sync ? new Date(last_sync).getTime() / 1000 : Date.now() / 1000 - 3600; // Default to last hour

  try {
    const syncData = await query(`
      SELECT
        timestamp,
        camera,
        data->>'label' as event_type,
        data->'sub_label'->>0 as employee_name,
        data->'zones' as zones,
        data->>'score' as confidence,
        COALESCE(source_id, data->>'id', data->>'event_id', 'unknown') as source_id
      FROM timeline
      WHERE timestamp >= $1
      ORDER BY timestamp DESC
      LIMIT $2
    `, [startTime, limit]);

    return {
      sync_timestamp: new Date().toISOString(),
      data: syncData.map(item => ({
        id: item.source_id,
        timestamp: unixToISO(item.timestamp),
        camera: item.camera,
        type: item.event_type,
        employee: item.employee_name,
        zones: item.zones || [],
        confidence: item.confidence ? parseFloat(item.confidence) : null
      })),
      has_more: syncData.length === limit
    };
  } catch (error) {
    logger.error('Error getting mobile sync data:', error);
    throw error;
  }
};

/**
 * Get mobile settings and configuration
 * @returns {Object} - Mobile app settings
 */
const getMobileSettings = async () => {
  return {
    app_version: '1.0.0',
    api_version: 'v1',
    features: {
      real_time_notifications: true,
      offline_sync: true,
      push_notifications: true,
      video_playback: true,
      violation_reporting: true
    },
    limits: {
      max_violations_per_page: 100,
      max_sync_items: 1000,
      max_notifications: 50
    },
    endpoints: {
      websocket: 'ws://10.100.6.2:5002/socket.io/',
      media_proxy: 'http://10.100.6.2:5002/media/',
      api_base: 'http://10.100.6.2:5002/v1'
    }
  };
};

module.exports = {
  getMobileDashboard,
  getMobileViolations,
  getMobileEmployeeStatus,
  getMobileCameraStatus,
  getMobileNotifications,
  getMobileSyncData,
  getMobileSettings
};
