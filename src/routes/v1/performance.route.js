const express = require('express');
const performanceController = require('../../controllers/performance.controller');

const router = express.Router();

/**
 * @swagger
 * /api/performance/metrics:
 *   get:
 *     summary: Get performance metrics
 *     description: Get detailed performance metrics including requests, database, cache, and memory statistics
 *     tags: [Performance]
 *     responses:
 *       200:
 *         description: Performance metrics retrieved successfully
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
 *                     requests:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         successful:
 *                           type: integer
 *                         failed:
 *                           type: integer
 *                         average_response_time:
 *                           type: number
 *                         response_times:
 *                           type: array
 *                           items:
 *                             type: number
 *                     database:
 *                       type: object
 *                       properties:
 *                         queries:
 *                           type: integer
 *                         average_query_time:
 *                           type: number
 *                         slow_queries:
 *                           type: integer
 *                         query_times:
 *                           type: array
 *                           items:
 *                             type: number
 *                     cache:
 *                       type: object
 *                       properties:
 *                         hits:
 *                           type: integer
 *                         misses:
 *                           type: integer
 *                         hit_rate:
 *                           type: string
 *                     memory:
 *                       type: object
 *                       properties:
 *                         used:
 *                           type: integer
 *                         free:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                     errors:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         by_type:
 *                           type: object
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     uptime:
 *                       type: number
 *                     node_version:
 *                       type: string
 *                     platform:
 *                       type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/api/performance/metrics', performanceController.getPerformanceMetricsController);

/**
 * @swagger
 * /api/performance/summary:
 *   get:
 *     summary: Get performance summary
 *     description: Get a summary of performance metrics with calculated percentiles and rates
 *     tags: [Performance]
 *     responses:
 *       200:
 *         description: Performance summary retrieved successfully
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
 *                     requests:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         success_rate:
 *                           type: string
 *                         average_response_time:
 *                           type: string
 *                         p95_response_time:
 *                           type: string
 *                         p99_response_time:
 *                           type: string
 *                     database:
 *                       type: object
 *                       properties:
 *                         total_queries:
 *                           type: integer
 *                         average_query_time:
 *                           type: string
 *                         slow_queries:
 *                           type: integer
 *                         p95_query_time:
 *                           type: string
 *                         p99_query_time:
 *                           type: string
 *                     cache:
 *                       type: object
 *                       properties:
 *                         hit_rate:
 *                           type: string
 *                         hits:
 *                           type: integer
 *                         misses:
 *                           type: integer
 *                     memory:
 *                       type: object
 *                       properties:
 *                         used_mb:
 *                           type: integer
 *                         free_mb:
 *                           type: integer
 *                         total_mb:
 *                           type: integer
 *                         usage_percentage:
 *                           type: string
 *                     errors:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         by_type:
 *                           type: object
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/api/performance/summary', performanceController.getPerformanceSummaryController);

/**
 * @swagger
 * /api/performance/recommendations:
 *   get:
 *     summary: Get performance recommendations
 *     description: Get performance optimization recommendations based on current metrics
 *     tags: [Performance]
 *     responses:
 *       200:
 *         description: Performance recommendations retrieved successfully
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
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           priority:
 *                             type: string
 *                             enum: [high, medium, low]
 *                           message:
 *                             type: string
 *                           metric:
 *                             type: string
 *                           value:
 *                             type: string
 *                     count:
 *                       type: integer
 *                     high_priority:
 *                       type: integer
 *                     medium_priority:
 *                       type: integer
 *                     low_priority:
 *                       type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/api/performance/recommendations', performanceController.getPerformanceRecommendationsController);

/**
 * @swagger
 * /api/performance/cache/stats:
 *   get:
 *     summary: Get cache statistics
 *     description: Get detailed cache statistics including hit rate, memory usage, and size
 *     tags: [Performance]
 *     responses:
 *       200:
 *         description: Cache statistics retrieved successfully
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
 *                     hits:
 *                       type: integer
 *                     misses:
 *                       type: integer
 *                     hit_rate:
 *                       type: string
 *                     size:
 *                       type: integer
 *                     max_size:
 *                       type: integer
 *                     memory_usage_mb:
 *                       type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/api/performance/cache/stats', performanceController.getCacheStatsController);

/**
 * @swagger
 * /api/performance/cache/keys:
 *   get:
 *     summary: Get cache keys
 *     description: Get all cache keys currently stored
 *     tags: [Performance]
 *     responses:
 *       200:
 *         description: Cache keys retrieved successfully
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
 *                     keys:
 *                       type: array
 *                       items:
 *                         type: string
 *                     count:
 *                       type: integer
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/api/performance/cache/keys', performanceController.getCacheKeysController);

/**
 * @swagger
 * /api/performance/cache/entry/{key}:
 *   get:
 *     summary: Get cache entry details
 *     description: Get detailed information about a specific cache entry
 *     tags: [Performance]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Cache key
 *     responses:
 *       200:
 *         description: Cache entry details retrieved successfully
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
 *                     key:
 *                       type: string
 *                     value:
 *                       type: any
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     expires_at:
 *                       type: string
 *                       format: date-time
 *                     access_count:
 *                       type: integer
 *                     is_expired:
 *                       type: boolean
 *                     ttl_remaining:
 *                       type: number
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Cache entry not found
 *       500:
 *         description: Internal server error
 */
router.get('/api/performance/cache/entry/:key', performanceController.getCacheEntryController);

/**
 * @swagger
 * /api/performance/cache/clear:
 *   post:
 *     summary: Clear cache
 *     description: Clear all cache entries
 *     tags: [Performance]
 *     responses:
 *       200:
 *         description: Cache cleared successfully
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
 *                     cleared_at:
 *                       type: string
 *                       format: date-time
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 */
router.post('/api/performance/cache/clear', performanceController.clearCacheController);

/**
 * @swagger
 * /api/performance/cache/entry/{key}:
 *   delete:
 *     summary: Delete cache entry
 *     description: Delete a specific cache entry by key
 *     tags: [Performance]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Cache key
 *     responses:
 *       200:
 *         description: Cache entry deleted successfully
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
 *                     key:
 *                       type: string
 *                     existed:
 *                       type: boolean
 *                     deleted_at:
 *                       type: string
 *                       format: date-time
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 */
router.delete('/api/performance/cache/entry/:key', performanceController.deleteCacheEntryController);

/**
 * @swagger
 * /api/performance/reset:
 *   post:
 *     summary: Reset performance metrics
 *     description: Reset all performance metrics to zero
 *     tags: [Performance]
 *     responses:
 *       200:
 *         description: Performance metrics reset successfully
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
 *                     reset_at:
 *                       type: string
 *                       format: date-time
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 */
router.post('/api/performance/reset', performanceController.resetPerformanceMetricsController);

/**
 * @swagger
 * /api/performance/health:
 *   get:
 *     summary: Get system health
 *     description: Get overall system health status with performance summary and recommendations
 *     tags: [Performance]
 *     responses:
 *       200:
 *         description: System health retrieved successfully
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
 *                     status:
 *                       type: string
 *                       enum: [healthy, degraded, critical]
 *                     summary:
 *                       type: object
 *                     cache:
 *                       type: object
 *                     recommendations:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         critical:
 *                           type: integer
 *                         issues:
 *                           type: array
 *                     uptime:
 *                       type: number
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/api/performance/health', performanceController.getSystemHealthController);

module.exports = router;

