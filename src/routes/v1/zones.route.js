const express = require('express');
const zonesController = require('../../controllers/zones.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Zones
 *   description: Desk occupancy, zone utilization, and space management
 */

/**
 * @swagger
 * /api/zones/desk-occupancy:
 *   get:
 *     summary: Get Desk Occupancy Analysis
 *     description: Get desk occupancy tracking and utilization analysis
 *     tags: [Zones]
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
 *         name: zone
 *         schema:
 *           type: string
 *         description: Filter by specific zone
 *         example: "desk_01"
 *     responses:
 *       200:
 *         description: Desk occupancy data retrieved successfully
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
 *                   example: "Desk occupancy analysis retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     desks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           camera:
 *                             type: string
 *                             example: "employees_01"
 *                           zone:
 *                             type: string
 *                             example: "desk_01"
 *                           total_occupancy_time:
 *                             type: number
 *                             example: 6.5
 *                           total_sessions:
 *                             type: integer
 *                             example: 8
 *                           unique_employees:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["Muhammad Taha", "Safia Imtiaz"]
 *                           occupancy_sessions:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 employee:
 *                                   type: string
 *                                   example: "Muhammad Taha"
 *                                 entry_time:
 *                                   type: string
 *                                   format: date-time
 *                                 exit_time:
 *                                   type: string
 *                                   format: date-time
 *                                 duration_hours:
 *                                   type: number
 *                                   example: 2.5
 *                                 status:
 *                                   type: string
 *                                   example: "completed"
 *                           utilization_rate:
 *                             type: number
 *                             example: 81.25
 *                           average_session_duration:
 *                             type: number
 *                             example: 0.81
 *                           most_frequent_employee:
 *                             type: string
 *                             example: "Muhammad Taha"
 *                           last_occupied:
 *                             type: string
 *                             format: date-time
 *                           efficiency_score:
 *                             type: integer
 *                             example: 85
 *                           occupancy_trend:
 *                             type: string
 *                             example: "increasing"
 *                     total_desks:
 *                       type: integer
 *                       example: 64
 *                     total_occupancy_time:
 *                       type: number
 *                       example: 416.0
 *                     average_utilization:
 *                       type: number
 *                       example: 75.5
 *                     period_hours:
 *                       type: number
 *                       example: 8.0
 *                     sessions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           camera:
 *                             type: string
 *                           zone:
 *                             type: string
 *                           employee:
 *                             type: string
 *                           entry_time:
 *                             type: string
 *                             format: date-time
 *                           exit_time:
 *                             type: string
 *                             format: date-time
 *                           duration_hours:
 *                             type: number
 *                     insights:
 *                       type: object
 *                       properties:
 *                         total_desks:
 *                           type: integer
 *                           example: 64
 *                         utilization_distribution:
 *                           type: object
 *                           properties:
 *                             high:
 *                               type: integer
 *                               example: 35
 *                             medium:
 *                               type: integer
 *                               example: 25
 *                             low:
 *                               type: integer
 *                               example: 4
 *                         average_utilization:
 *                           type: number
 *                           example: 75.5
 *                         efficiency_insights:
 *                           type: object
 *                           properties:
 *                             most_efficient:
 *                               type: object
 *                             least_efficient:
 *                               type: object
 *       500:
 *         description: Internal server error
 */
router.get('/api/zones/desk-occupancy', zonesController.getDeskOccupancyController);

/**
 * @swagger
 * /api/zones/utilization:
 *   get:
 *     summary: Get Zone Utilization Analysis
 *     description: Get zone utilization and activity analysis
 *     tags: [Zones]
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
 *         description: Zone utilization data retrieved successfully
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
 *                   example: "Zone utilization analysis retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     zones:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           camera:
 *                             type: string
 *                             example: "employees_01"
 *                           zone:
 *                             type: string
 *                             example: "desk_01"
 *                           total_entries:
 *                             type: integer
 *                             example: 15
 *                           total_exits:
 *                             type: integer
 *                             example: 12
 *                           unique_employees:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["Muhammad Taha", "Safia Imtiaz"]
 *                           entry_times:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 employee:
 *                                   type: string
 *                                 timestamp:
 *                                   type: string
 *                                   format: date-time
 *                                 time_of_day:
 *                                   type: integer
 *                                   example: 9
 *                           exit_times:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 employee:
 *                                   type: string
 *                                 timestamp:
 *                                   type: string
 *                                   format: date-time
 *                                 time_of_day:
 *                                   type: integer
 *                                   example: 17
 *                           activity_count:
 *                             type: integer
 *                             example: 27
 *                           utilization_score:
 *                             type: integer
 *                             example: 85
 *                           peak_hours:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 hour:
 *                                   type: integer
 *                                   example: 10
 *                                 entries:
 *                                   type: integer
 *                                   example: 8
 *                           employee_diversity:
 *                             type: integer
 *                             example: 3
 *                           activity_intensity:
 *                             type: integer
 *                             example: 12
 *                           zone_type:
 *                             type: string
 *                             example: "workstation"
 *                           efficiency_rating:
 *                             type: integer
 *                             example: 88
 *                           popularity_rank:
 *                             type: integer
 *                             example: 1
 *                     total_zones:
 *                       type: integer
 *                       example: 64
 *                     most_popular_zone:
 *                       type: object
 *                     least_popular_zone:
 *                       type: object
 *                     average_utilization:
 *                       type: number
 *                       example: 72.5
 *                     insights:
 *                       type: object
 *                       properties:
 *                         total_zones:
 *                           type: integer
 *                           example: 64
 *                         zone_type_distribution:
 *                           type: object
 *                           additionalProperties:
 *                             type: integer
 *                         average_utilization:
 *                           type: number
 *                           example: 72.5
 *                         most_active_zone:
 *                           type: object
 *                         least_active_zone:
 *                           type: object
 *       500:
 *         description: Internal server error
 */
router.get('/api/zones/utilization', zonesController.getZoneUtilizationController);

/**
 * @swagger
 * /api/zones/employee-preferences:
 *   get:
 *     summary: Get Employee Zone Preferences
 *     description: Get employee zone preferences and mobility patterns
 *     tags: [Zones]
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
 *         name: employee_name
 *         schema:
 *           type: string
 *         description: Filter by specific employee name
 *         example: "Muhammad Taha"
 *       - in: query
 *         name: camera
 *         schema:
 *           type: string
 *         description: Filter by specific camera
 *         example: "employees_01"
 *     responses:
 *       200:
 *         description: Employee zone preferences data retrieved successfully
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
 *                   example: "Employee zone preferences retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     employees:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           employee_name:
 *                             type: string
 *                             example: "Muhammad Taha"
 *                           zone_preferences:
 *                             type: object
 *                             additionalProperties:
 *                               type: object
 *                               properties:
 *                                 camera:
 *                                   type: string
 *                                 zone:
 *                                   type: string
 *                                 visits:
 *                                   type: integer
 *                                 total_time:
 *                                   type: number
 *                                 last_visit:
 *                                   type: string
 *                                   format: date-time
 *                                 first_visit:
 *                                   type: string
 *                                   format: date-time
 *                                 preference_score:
 *                                   type: integer
 *                           total_zone_visits:
 *                             type: integer
 *                             example: 45
 *                           preferred_zones:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 zone:
 *                                   type: string
 *                                   example: "desk_01"
 *                                 camera:
 *                                   type: string
 *                                   example: "employees_01"
 *                                 visits:
 *                                   type: integer
 *                                   example: 15
 *                                 preference_score:
 *                                   type: integer
 *                                   example: 85
 *                                 last_visit:
 *                                   type: string
 *                                   format: date-time
 *                           zone_diversity:
 *                             type: integer
 *                             example: 5
 *                           mobility_score:
 *                             type: integer
 *                             example: 75
 *                           zone_loyalty:
 *                             type: integer
 *                             example: 80
 *                           zone_consistency:
 *                             type: integer
 *                             example: 85
 *                     total_employees:
 *                       type: integer
 *                       example: 45
 *                     average_zone_diversity:
 *                       type: number
 *                       example: 4.2
 *                     insights:
 *                       type: object
 *                       properties:
 *                         total_employees:
 *                           type: integer
 *                           example: 45
 *                         average_zone_diversity:
 *                           type: number
 *                           example: 4.2
 *                         mobility_distribution:
 *                           type: object
 *                           properties:
 *                             high:
 *                               type: integer
 *                               example: 30
 *                             medium:
 *                               type: integer
 *                               example: 15
 *                         loyalty_distribution:
 *                           type: object
 *                           properties:
 *                             high:
 *                               type: integer
 *                               example: 25
 *                             medium:
 *                               type: integer
 *                               example: 20
 *       500:
 *         description: Internal server error
 */
router.get('/api/zones/employee-preferences', zonesController.getEmployeeZonePreferencesController);

/**
 * @swagger
 * /api/zones/activity-patterns:
 *   get:
 *     summary: Get Zone Activity Patterns
 *     description: Get zone activity patterns and peak time analysis
 *     tags: [Zones]
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
 *         name: zone
 *         schema:
 *           type: string
 *         description: Filter by specific zone
 *         example: "desk_01"
 *     responses:
 *       200:
 *         description: Zone activity patterns data retrieved successfully
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
 *                   example: "Zone activity patterns retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     zones:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           camera:
 *                             type: string
 *                             example: "employees_01"
 *                           zone:
 *                             type: string
 *                             example: "desk_01"
 *                           hourly_patterns:
 *                             type: object
 *                             additionalProperties:
 *                               type: integer
 *                             example: {"9": 5, "10": 8, "11": 6}
 *                           daily_patterns:
 *                             type: object
 *                             additionalProperties:
 *                               type: integer
 *                             example: {"1": 15, "2": 18, "3": 12}
 *                           peak_hours:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 hour:
 *                                   type: integer
 *                                   example: 10
 *                                 activity:
 *                                   type: integer
 *                                   example: 8
 *                           peak_days:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 day:
 *                                   type: string
 *                                   example: "Tuesday"
 *                                 activity:
 *                                   type: integer
 *                                   example: 18
 *                           activity_consistency:
 *                             type: integer
 *                             example: 82
 *                           utilization_trends:
 *                             type: string
 *                             example: "morning_peak"
 *                           zone_type:
 *                             type: string
 *                             example: "workstation"
 *                           efficiency_rating:
 *                             type: integer
 *                             example: 88
 *                     total_zones:
 *                       type: integer
 *                       example: 64
 *                     insights:
 *                       type: object
 *                       properties:
 *                         total_zones:
 *                           type: integer
 *                           example: 64
 *                         peak_time_distribution:
 *                           type: object
 *                           properties:
 *                             morning:
 *                               type: integer
 *                               example: 25
 *                             afternoon:
 *                               type: integer
 *                               example: 35
 *                             evening:
 *                               type: integer
 *                               example: 15
 *                             balanced:
 *                               type: integer
 *                               example: 25
 *                         average_consistency:
 *                           type: integer
 *                           example: 78
 *       500:
 *         description: Internal server error
 */
router.get('/api/zones/activity-patterns', zonesController.getZoneActivityPatternsController);

module.exports = router;

