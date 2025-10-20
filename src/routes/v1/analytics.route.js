const express = require('express');
const analyticsController = require('../../controllers/analytics.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Advanced analytics, reporting, and insights
 */

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Get Comprehensive Dashboard Data
 *     description: Get comprehensive dashboard with overview, trends, and insights
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *         example: "2025-10-02"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *         example: "2025-10-02"
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           default: 24
 *         description: Hours to look back (fallback if no dates)
 *         example: 24
 *       - in: query
 *         name: camera
 *         schema:
 *           type: string
 *         description: Filter by specific camera
 *         example: "employees_01"
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
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
 *                   example: "Dashboard data retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         total_activity:
 *                           type: integer
 *                           example: 1250
 *                         total_violations:
 *                           type: integer
 *                           example: 15
 *                         active_employees:
 *                           type: integer
 *                           example: 45
 *                         active_cameras:
 *                           type: integer
 *                           example: 12
 *                         period:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date-time
 *                             end:
 *                               type: string
 *                               format: date-time
 *                             duration_hours:
 *                               type: number
 *                               example: 24
 *                     trends:
 *                       type: object
 *                       properties:
 *                         activity:
 *                           type: object
 *                           properties:
 *                             current:
 *                               type: integer
 *                               example: 1250
 *                             previous:
 *                               type: integer
 *                               example: 1100
 *                             change:
 *                               type: integer
 *                               example: 150
 *                             change_percent:
 *                               type: number
 *                               example: 13.64
 *                             direction:
 *                               type: string
 *                               example: "up"
 *                         violations:
 *                           type: object
 *                           properties:
 *                             current:
 *                               type: integer
 *                               example: 15
 *                             previous:
 *                               type: integer
 *                               example: 18
 *                             change:
 *                               type: integer
 *                               example: -3
 *                             change_percent:
 *                               type: number
 *                               example: -16.67
 *                             direction:
 *                               type: string
 *                               example: "down"
 *                     activity:
 *                       type: object
 *                       properties:
 *                         total_events:
 *                           type: integer
 *                           example: 1250
 *                         unique_employees:
 *                           type: integer
 *                           example: 45
 *                         unique_cameras:
 *                           type: integer
 *                           example: 12
 *                         unique_zones:
 *                           type: integer
 *                           example: 64
 *                     violations:
 *                       type: object
 *                       properties:
 *                         total_violations:
 *                           type: integer
 *                           example: 15
 *                         unique_employees:
 *                           type: integer
 *                           example: 8
 *                         unique_cameras:
 *                           type: integer
 *                           example: 5
 *                         average_confidence:
 *                           type: number
 *                           example: 0.85
 *                     employees:
 *                       type: object
 *                       properties:
 *                         unique_employees:
 *                           type: integer
 *                           example: 45
 *                         employees:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "Muhammad Taha"
 *                               activity_count:
 *                                 type: integer
 *                                 example: 156
 *                               work_hours:
 *                                 type: number
 *                                 example: 8.5
 *                               first_seen:
 *                                 type: string
 *                                 format: date-time
 *                               last_seen:
 *                                 type: string
 *                                 format: date-time
 *                     cameras:
 *                       type: object
 *                       properties:
 *                         active_cameras:
 *                           type: integer
 *                           example: 12
 *                         cameras:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "employees_01"
 *                               total_events:
 *                                 type: integer
 *                                 example: 250
 *                               unique_employees:
 *                                 type: integer
 *                                 example: 15
 *                               first_activity:
 *                                 type: string
 *                                 format: date-time
 *                               last_activity:
 *                                 type: string
 *                                 format: date-time
 *                     insights:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: "positive"
 *                           category:
 *                             type: string
 *                             example: "activity"
 *                           message:
 *                             type: string
 *                             example: "Activity increased by 13.64% compared to previous period"
 *                           impact:
 *                             type: string
 *                             example: "high"
 *       500:
 *         description: Internal server error
 */
router.get('/api/analytics/dashboard', analyticsController.getDashboardDataController);

/**
 * @swagger
 * /api/analytics/trends:
 *   get:
 *     summary: Get Trend Analysis
 *     description: Get trend analysis data with customizable granularity
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *         example: "2025-10-02"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *         example: "2025-10-02"
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           default: 24
 *         description: Hours to look back (fallback if no dates)
 *         example: 24
 *       - in: query
 *         name: camera
 *         schema:
 *           type: string
 *         description: Filter by specific camera
 *         example: "employees_01"
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *           enum: [activity, violations, employees]
 *           default: activity
 *         description: Metric to analyze
 *         example: "activity"
 *       - in: query
 *         name: granularity
 *         schema:
 *           type: string
 *           enum: [hourly, daily, weekly]
 *           default: hourly
 *         description: Time granularity for analysis
 *         example: "hourly"
 *     responses:
 *       200:
 *         description: Trend analysis data retrieved successfully
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
 *                   example: "Trend analysis retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     metric:
 *                       type: string
 *                       example: "activity"
 *                     granularity:
 *                       type: string
 *                       example: "hourly"
 *                     period:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date-time
 *                         end:
 *                           type: string
 *                           format: date-time
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           time_period:
 *                             type: string
 *                             example: "10:00"
 *                           count:
 *                             type: integer
 *                             example: 45
 *                           unique_employees:
 *                             type: integer
 *                             example: 12
 *                           unique_cameras:
 *                             type: integer
 *                             example: 3
 *                           total_activity:
 *                             type: integer
 *                             example: 45
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 1250
 *                         average:
 *                           type: number
 *                           example: 52.08
 *                         min:
 *                           type: integer
 *                           example: 5
 *                         max:
 *                           type: integer
 *                           example: 120
 *                         trend:
 *                           type: string
 *                           example: "increasing"
 *                         volatility:
 *                           type: number
 *                           example: 25.5
 *                     insights:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: "positive"
 *                           message:
 *                             type: string
 *                             example: "Strong upward trend detected with 25.5% volatility"
 *                           confidence:
 *                             type: string
 *                             example: "high"
 *       500:
 *         description: Internal server error
 */
router.get('/api/analytics/trends', analyticsController.getTrendAnalysisController);

/**
 * @swagger
 * /api/analytics/performance:
 *   get:
 *     summary: Get Performance Metrics
 *     description: Get comprehensive performance metrics and scoring
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *         example: "2025-10-02"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *         example: "2025-10-02"
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           default: 24
 *         description: Hours to look back (fallback if no dates)
 *         example: 24
 *       - in: query
 *         name: camera
 *         schema:
 *           type: string
 *         description: Filter by specific camera
 *         example: "employees_01"
 *       - in: query
 *         name: employee_name
 *         schema:
 *           type: string
 *         description: Filter by specific employee name
 *         example: "Muhammad Taha"
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Performance metrics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     overall_score:
 *                       type: integer
 *                       example: 85
 *                     productivity:
 *                       type: object
 *                       properties:
 *                         score:
 *                           type: integer
 *                           example: 85
 *                         trend:
 *                           type: string
 *                           example: "stable"
 *                         factors:
 *                           type: array
 *                           items:
 *                             type: string
 *                     efficiency:
 *                       type: object
 *                       properties:
 *                         score:
 *                           type: integer
 *                           example: 78
 *                         trend:
 *                           type: string
 *                           example: "increasing"
 *                         factors:
 *                           type: array
 *                           items:
 *                             type: string
 *                     compliance:
 *                       type: object
 *                       properties:
 *                         score:
 *                           type: integer
 *                           example: 92
 *                         trend:
 *                           type: string
 *                           example: "stable"
 *                         factors:
 *                           type: array
 *                           items:
 *                             type: string
 *                     engagement:
 *                       type: object
 *                       properties:
 *                         score:
 *                           type: integer
 *                           example: 88
 *                         trend:
 *                           type: string
 *                           example: "increasing"
 *                         factors:
 *                           type: array
 *                           items:
 *                             type: string
 *                     period:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date-time
 *                         end:
 *                           type: string
 *                           format: date-time
 *                     insights:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: "info"
 *                           message:
 *                             type: string
 *                             example: "Overall performance score: 85/100"
 *                           confidence:
 *                             type: string
 *                             example: "high"
 *       500:
 *         description: Internal server error
 */
router.get('/api/analytics/performance', analyticsController.getPerformanceMetricsController);

/**
 * @swagger
 * /api/analytics/predictive:
 *   get:
 *     summary: Get Predictive Analytics
 *     description: Get predictive analytics and forecasting data
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *         example: "2025-10-02"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *         example: "2025-10-02"
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           default: 24
 *         description: Hours to look back (fallback if no dates)
 *         example: 24
 *       - in: query
 *         name: camera
 *         schema:
 *           type: string
 *         description: Filter by specific camera
 *         example: "employees_01"
 *       - in: query
 *         name: prediction_type
 *         schema:
 *           type: string
 *           enum: [violations, attendance, productivity]
 *           default: violations
 *         description: Type of prediction to generate
 *         example: "violations"
 *     responses:
 *       200:
 *         description: Predictive analytics data retrieved successfully
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
 *                   example: "Predictive analytics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     prediction_type:
 *                       type: string
 *                       example: "violations"
 *                     historical_data:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items:
 *                             type: object
 *                         patterns:
 *                           type: array
 *                           items:
 *                             type: string
 *                     predictions:
 *                       type: object
 *                       properties:
 *                         next_hour:
 *                           type: integer
 *                           example: 2
 *                         next_day:
 *                           type: integer
 *                           example: 15
 *                         confidence:
 *                           type: number
 *                           example: 0.75
 *                         factors:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example: "time_of_day"
 *                     confidence:
 *                       type: number
 *                       example: 0.75
 *                     period:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date-time
 *                         end:
 *                           type: string
 *                           format: date-time
 *                     insights:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: "info"
 *                           message:
 *                             type: string
 *                             example: "Prediction confidence: 75%"
 *                           confidence:
 *                             type: string
 *                             example: "medium"
 *       500:
 *         description: Internal server error
 */
router.get('/api/analytics/predictive', analyticsController.getPredictiveAnalyticsController);

/**
 * @swagger
 * /api/analytics/reports:
 *   get:
 *     summary: Get Custom Report
 *     description: Generate custom reports with various formats and data
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *         example: "2025-10-02"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *         example: "2025-10-02"
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           default: 24
 *         description: Hours to look back (fallback if no dates)
 *         example: 24
 *       - in: query
 *         name: camera
 *         schema:
 *           type: string
 *         description: Filter by specific camera
 *         example: "employees_01"
 *       - in: query
 *         name: employee_name
 *         schema:
 *           type: string
 *         description: Filter by specific employee name
 *         example: "Muhammad Taha"
 *       - in: query
 *         name: report_type
 *         schema:
 *           type: string
 *           enum: [comprehensive, violations, attendance, productivity]
 *           default: comprehensive
 *         description: Type of report to generate
 *         example: "comprehensive"
 *       - in: query
 *         name: include_charts
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include chart data in the report
 *         example: true
 *     responses:
 *       200:
 *         description: Custom report generated successfully
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
 *                   example: "Custom report generated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     report_type:
 *                       type: string
 *                       example: "comprehensive"
 *                     generated_at:
 *                       type: string
 *                       format: date-time
 *                     period:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date-time
 *                         end:
 *                           type: string
 *                           format: date-time
 *                     data:
 *                       type: object
 *                       properties:
 *                         sections:
 *                           type: array
 *                           items:
 *                             type: object
 *                         metrics:
 *                           type: object
 *                         charts:
 *                           type: array
 *                           items:
 *                             type: object
 *                     summary:
 *                       type: object
 *                       properties:
 *                         key_points:
 *                           type: array
 *                           items:
 *                             type: string
 *                         recommendations:
 *                           type: array
 *                           items:
 *                             type: string
 *       500:
 *         description: Internal server error
 */
router.get('/api/analytics/reports', analyticsController.getCustomReportController);

module.exports = router;

