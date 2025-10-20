const express = require('express');
const websocketController = require('../../controllers/websocket.controller');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     WebSocketStats:
 *       type: object
 *       properties:
 *         totalClients:
 *           type: integer
 *           description: Number of connected WebSocket clients
 *         totalSubscriptions:
 *           type: integer
 *           description: Number of active subscriptions
 *         activeSubscriptions:
 *           type: array
 *           items:
 *             type: string
 *           description: List of active subscription keys
 *         lastPollTime:
 *           type: number
 *           description: Last polling timestamp
 *         isPolling:
 *           type: boolean
 *           description: Whether polling is active
 *     
 *     RealtimeActivity:
 *       type: object
 *       properties:
 *         timeRange:
 *           type: object
 *           properties:
 *             start:
 *               type: string
 *               format: date-time
 *             end:
 *               type: string
 *               format: date-time
 *             hours:
 *               type: integer
 *         violations:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               camera:
 *                 type: string
 *               count:
 *                 type: integer
 *         employeeActivity:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               employee:
 *                 type: string
 *               camera:
 *                 type: string
 *               activityCount:
 *                 type: integer
 *               lastSeen:
 *                 type: string
 *                 format: date-time
 *         cameraStatus:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               camera:
 *                 type: string
 *               totalEvents:
 *                 type: integer
 *               uniqueEmployees:
 *                 type: integer
 *               lastActivity:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *         websocketStats:
 *           $ref: '#/components/schemas/WebSocketStats'
 *     
 *     CustomEventRequest:
 *       type: object
 *       required:
 *         - eventType
 *       properties:
 *         socketId:
 *           type: string
 *           description: Target socket ID (optional for broadcast)
 *         eventType:
 *           type: string
 *           description: Type of event to send
 *         data:
 *           type: object
 *           description: Event data payload
 */

/**
 * @swagger
 * /api/websocket/stats:
 *   get:
 *     summary: Get WebSocket connection statistics
 *     description: Retrieve current WebSocket connection statistics including client count, subscriptions, and polling status
 *     tags: [WebSocket]
 *     responses:
 *       200:
 *         description: WebSocket statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/WebSocketStats'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/api/websocket/stats', websocketController.getWebSocketStats);

/**
 * @swagger
 * /api/websocket/activity:
 *   get:
 *     summary: Get real-time activity summary
 *     description: Get a summary of recent activity including violations, employee activity, and camera status
 *     tags: [WebSocket]
 *     parameters:
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Number of hours to look back for activity data
 *     responses:
 *       200:
 *         description: Real-time activity data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RealtimeActivity'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/api/websocket/activity', websocketController.getRealtimeActivity);

/**
 * @swagger
 * /api/websocket/send:
 *   post:
 *     summary: Send custom event to specific client
 *     description: Send a custom event to a specific WebSocket client by socket ID
 *     tags: [WebSocket]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomEventRequest'
 *     responses:
 *       200:
 *         description: Custom event sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     socketId:
 *                       type: string
 *                     eventType:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/api/websocket/send', websocketController.sendCustomEvent);

/**
 * @swagger
 * /api/websocket/broadcast:
 *   post:
 *     summary: Broadcast custom event to all clients
 *     description: Broadcast a custom event to all connected WebSocket clients
 *     tags: [WebSocket]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventType
 *             properties:
 *               eventType:
 *                 type: string
 *                 description: Type of event to broadcast
 *               data:
 *                 type: object
 *                 description: Event data payload
 *     responses:
 *       200:
 *         description: Custom event broadcasted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     eventType:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/api/websocket/broadcast', websocketController.broadcastCustomEvent);

/**
 * @swagger
 * /api/websocket/test:
 *   post:
 *     summary: Test WebSocket connection
 *     description: Send a test event to all connected WebSocket clients to verify connectivity
 *     tags: [WebSocket]
 *     responses:
 *       200:
 *         description: Test event sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     clients:
 *                       type: integer
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/api/websocket/test', websocketController.testWebSocket);

module.exports = router;

