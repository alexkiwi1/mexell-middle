const express = require('express');
const { healthCheck, root, apiInfo } = require('../../controllers/health.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: API health monitoring and system status
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health Check
 *     description: Check API health and database connectivity
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "All services healthy"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "healthy"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     uptime:
 *                       type: number
 *                       example: 450.67
 *                     responseTime:
 *                       type: string
 *                       example: "1013ms"
 *                     services:
 *                       type: object
 *                       properties:
 *                         database:
 *                           type: string
 *                           example: "connected"
 *                         redis:
 *                           type: string
 *                           example: "connected"
 *                         frigate:
 *                           type: string
 *                           example: "connected"
 *       500:
 *         description: Service unhealthy
 */
router.get('/health', healthCheck);

// Root endpoint
router.get('/', root);

// API info endpoint
router.get('/api/info', apiInfo);

module.exports = router;

