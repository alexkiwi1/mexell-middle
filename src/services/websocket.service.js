const { query } = require('../config/postgres');
const { unixToISO, unixToReadable } = require('./frigate.service');
const logger = require('../config/logger');

/**
 * WebSocket Service - Real-time event streaming
 * 
 * Features:
 * - Real-time violation detection
 * - Live employee activity tracking
 * - Camera status monitoring
 * - Zone occupancy updates
 * - Custom event filtering
 * - Client subscription management
 */

class WebSocketService {
  constructor() {
    this.io = null;
    this.clients = new Map();
    this.subscriptions = new Map();
    this.pollingInterval = null;
    this.lastPollTime = Date.now() / 1000;
  }

  /**
   * Initialize WebSocket service with Socket.IO instance
   * @param {Object} io - Socket.IO instance
   */
  initialize(io) {
    this.io = io;
    this.setupEventHandlers();
    this.startPolling();
    logger.info('WebSocket service initialized');
  }

  /**
   * Setup Socket.IO event handlers
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);
      
      // Store client information
      this.clients.set(socket.id, {
        id: socket.id,
        connectedAt: Date.now(),
        subscriptions: new Set()
      });

      // Handle subscription requests
      socket.on('subscribe', (data) => {
        this.handleSubscription(socket, data);
      });

      // Handle unsubscription requests
      socket.on('unsubscribe', (data) => {
        this.handleUnsubscription(socket, data);
      });

      // Handle custom filter requests
      socket.on('setFilter', (data) => {
        this.handleFilter(socket, data);
      });

      // Handle ping/pong for connection health
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: Date.now() });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnection(socket);
      });
    });
  }

  /**
   * Handle client subscription to specific events
   * @param {Object} socket - Socket.IO socket instance
   * @param {Object} data - Subscription data
   */
  handleSubscription(socket, data) {
    const { eventType, filters = {} } = data;
    const client = this.clients.get(socket.id);
    
    if (!client) return;

    const subscriptionKey = `${eventType}_${JSON.stringify(filters)}`;
    client.subscriptions.add(subscriptionKey);

    // Store subscription for filtering
    if (!this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.set(subscriptionKey, new Set());
    }
    this.subscriptions.get(subscriptionKey).add(socket.id);

    socket.emit('subscribed', {
      eventType,
      filters,
      subscriptionKey,
      timestamp: Date.now()
    });

    logger.info(`Client ${socket.id} subscribed to ${eventType}`, { filters });
  }

  /**
   * Handle client unsubscription from specific events
   * @param {Object} socket - Socket.IO socket instance
   * @param {Object} data - Unsubscription data
   */
  handleUnsubscription(socket, data) {
    const { eventType, filters = {} } = data;
    const client = this.clients.get(socket.id);
    
    if (!client) return;

    const subscriptionKey = `${eventType}_${JSON.stringify(filters)}`;
    client.subscriptions.delete(subscriptionKey);

    // Remove from subscription tracking
    if (this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.get(subscriptionKey).delete(socket.id);
      if (this.subscriptions.get(subscriptionKey).size === 0) {
        this.subscriptions.delete(subscriptionKey);
      }
    }

    socket.emit('unsubscribed', {
      eventType,
      filters,
      subscriptionKey,
      timestamp: Date.now()
    });

    logger.info(`Client ${socket.id} unsubscribed from ${eventType}`);
  }

  /**
   * Handle custom filter requests
   * @param {Object} socket - Socket.IO socket instance
   * @param {Object} data - Filter data
   */
  handleFilter(socket, data) {
    const { eventType, filters } = data;
    const client = this.clients.get(socket.id);
    
    if (!client) return;

    // Update client filters
    client.filters = filters;

    socket.emit('filterUpdated', {
      eventType,
      filters,
      timestamp: Date.now()
    });

    logger.info(`Client ${socket.id} updated filters for ${eventType}`, { filters });
  }

  /**
   * Handle client disconnection
   * @param {Object} socket - Socket.IO socket instance
   */
  handleDisconnection(socket) {
    const client = this.clients.get(socket.id);
    
    if (client) {
      // Remove from all subscriptions
      client.subscriptions.forEach(subscriptionKey => {
        if (this.subscriptions.has(subscriptionKey)) {
          this.subscriptions.get(subscriptionKey).delete(socket.id);
          if (this.subscriptions.get(subscriptionKey).size === 0) {
            this.subscriptions.delete(subscriptionKey);
          }
        }
      });

      this.clients.delete(socket.id);
      logger.info(`Client disconnected: ${socket.id}`);
    }
  }

  /**
   * Start polling for new events
   */
  startPolling() {
    // Poll every 5 seconds for new events
    this.pollingInterval = setInterval(async () => {
      try {
        await this.pollForNewEvents();
      } catch (error) {
        logger.error('Error polling for new events:', error);
      }
    }, 5000);

    logger.info('Started polling for new events');
  }

  /**
   * Stop polling for new events
   */
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      logger.info('Stopped polling for new events');
    }
  }

  /**
   * Poll for new events since last poll
   */
  async pollForNewEvents() {
    const currentTime = Date.now() / 1000;
    const timeWindow = 10; // Look back 10 seconds

    try {
      // Get new violations
      await this.pollViolations(currentTime - timeWindow, currentTime);
      
      // Get new employee activity
      await this.pollEmployeeActivity(currentTime - timeWindow, currentTime);
      
      // Get new camera events
      await this.pollCameraEvents(currentTime - timeWindow, currentTime);
      
      // Get new zone events
      await this.pollZoneEvents(currentTime - timeWindow, currentTime);

      this.lastPollTime = currentTime;
    } catch (error) {
      logger.error('Error in pollForNewEvents:', error);
    }
  }

  /**
   * Poll for new violations
   * @param {number} startTime - Start timestamp
   * @param {number} endTime - End timestamp
   */
  async pollViolations(startTime, endTime) {
    const sql = `
      SELECT
        timestamp,
        camera,
        COALESCE(source_id, data->>'id', data->>'event_id', 'unknown') as source_id,
        data->'sub_label'->>0 as face_employee_name,
        data->'zones' as zones,
        data->'objects' as objects,
        data->>'score' as confidence
      FROM timeline
      WHERE timestamp >= $1 AND timestamp <= $2
      AND data->>'label' = 'cell phone'
      ORDER BY timestamp DESC
      LIMIT 50
    `;

    const result = await query(sql, [startTime, endTime]);

    if (result.length > 0) {
      const violations = result.map(violation => ({
        type: 'violation',
        event: 'cell_phone_detected',
        data: {
          timestamp: unixToISO(violation.timestamp),
          camera: violation.camera,
          employee: violation.face_employee_name,
          zones: violation.zones || [],
          confidence: violation.confidence ? parseFloat(violation.confidence) : null,
          source_id: violation.source_id
        }
      }));

      this.broadcastToSubscribers('violations', violations);
    }
  }

  /**
   * Poll for new employee activity
   * @param {number} startTime - Start timestamp
   * @param {number} endTime - End timestamp
   */
  async pollEmployeeActivity(startTime, endTime) {
    const sql = `
      SELECT
        timestamp,
        camera,
        data->'sub_label'->>0 as employee_name,
        data->'zones' as zones,
        class_type,
        data->>'label' as activity_type
      FROM timeline
      WHERE timestamp >= $1 AND timestamp <= $2
      AND data->>'label' = 'person'
      AND data->'sub_label'->>0 IS NOT NULL
      ORDER BY timestamp DESC
      LIMIT 100
    `;

    const result = await query(sql, [startTime, endTime]);

    if (result.length > 0) {
      const activities = result.map(activity => ({
        type: 'employee_activity',
        event: activity.class_type === 'entered_zone' ? 'employee_entered' : 'employee_left',
        data: {
          timestamp: unixToISO(activity.timestamp),
          camera: activity.camera,
          employee: activity.employee_name,
          zones: activity.zones || [],
          activity_type: activity.activity_type
        }
      }));

      this.broadcastToSubscribers('employee_activity', activities);
    }
  }

  /**
   * Poll for new camera events
   * @param {number} startTime - Start timestamp
   * @param {number} endTime - End timestamp
   */
  async pollCameraEvents(startTime, endTime) {
    const sql = `
      SELECT
        camera,
        COUNT(*) as event_count,
        MAX(timestamp) as last_activity,
        COUNT(DISTINCT data->'sub_label'->>0) as unique_employees
      FROM timeline
      WHERE timestamp >= $1 AND timestamp <= $2
      GROUP BY camera
      ORDER BY last_activity DESC
    `;

    const result = await query(sql, [startTime, endTime]);

    if (result.length > 0) {
      const cameraEvents = result.map(camera => ({
        type: 'camera_activity',
        event: 'camera_activity_update',
        data: {
          camera: camera.camera,
          event_count: parseInt(camera.event_count),
          last_activity: unixToISO(camera.last_activity),
          unique_employees: parseInt(camera.unique_employees)
        }
      }));

      this.broadcastToSubscribers('camera_activity', cameraEvents);
    }
  }

  /**
   * Poll for new zone events
   * @param {number} startTime - Start timestamp
   * @param {number} endTime - End timestamp
   */
  async pollZoneEvents(startTime, endTime) {
    const sql = `
      SELECT
        camera,
        data->'zones' as zones,
        data->'sub_label'->>0 as employee_name,
        class_type,
        timestamp
      FROM timeline
      WHERE timestamp >= $1 AND timestamp <= $2
      AND data->'zones' IS NOT NULL
      AND data->'zones' != '[]'::jsonb
      ORDER BY timestamp DESC
      LIMIT 50
    `;

    const result = await query(sql, [startTime, endTime]);

    if (result.length > 0) {
      const zoneEvents = result.map(zone => ({
        type: 'zone_activity',
        event: zone.class_type === 'entered_zone' ? 'zone_entered' : 'zone_left',
        data: {
          timestamp: unixToISO(zone.timestamp),
          camera: zone.camera,
          employee: zone.employee_name,
          zones: zone.zones || [],
          event_type: zone.class_type
        }
      }));

      this.broadcastToSubscribers('zone_activity', zoneEvents);
    }
  }

  /**
   * Broadcast events to subscribers
   * @param {string} eventType - Type of event
   * @param {Array} events - Array of events to broadcast
   */
  broadcastToSubscribers(eventType, events) {
    if (!this.io || events.length === 0) return;

    // Find all subscribers for this event type
    const subscribers = new Set();
    this.subscriptions.forEach((socketIds, subscriptionKey) => {
      if (subscriptionKey.startsWith(eventType)) {
        socketIds.forEach(socketId => subscribers.add(socketId));
      }
    });

    // Broadcast to each subscriber
    subscribers.forEach(socketId => {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit('realtime_event', {
          eventType,
          events,
          timestamp: Date.now()
        });
      }
    });

    logger.debug(`Broadcasted ${events.length} ${eventType} events to ${subscribers.size} subscribers`);
  }

  /**
   * Get current connection statistics
   * @returns {Object} Connection statistics
   */
  getStats() {
    return {
      totalClients: this.clients.size,
      totalSubscriptions: this.subscriptions.size,
      activeSubscriptions: Array.from(this.subscriptions.keys()),
      lastPollTime: this.lastPollTime,
      isPolling: this.pollingInterval !== null
    };
  }

  /**
   * Send custom event to specific client
   * @param {string} socketId - Socket ID
   * @param {string} eventType - Event type
   * @param {Object} data - Event data
   */
  sendToClient(socketId, eventType, data) {
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      socket.emit('custom_event', {
        eventType,
        data,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Broadcast custom event to all clients
   * @param {string} eventType - Event type
   * @param {Object} data - Event data
   */
  broadcastCustomEvent(eventType, data) {
    if (this.io) {
      this.io.emit('custom_event', {
        eventType,
        data,
        timestamp: Date.now()
      });
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

module.exports = websocketService;
