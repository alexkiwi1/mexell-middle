const express = require('express');
const employeesController = require('../../controllers/employees.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee tracking, work hours, and attendance management
 */

/**
 * @swagger
 * /api/employees/work-hours:
 *   get:
 *     summary: Get Employee Work Hours
 *     description: Get work hours analysis for employees
 *     tags: [Employees]
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
 *         description: Work hours data retrieved successfully
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
 *                   example: "Employee work hours retrieved successfully"
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
 *                           total_work_hours:
 *                             type: number
 *                             example: 8.5
 *                             description: "Office time (productive work time excluding breaks)"
 *                           total_time:
 *                             type: number
 *                             example: 10.5
 *                             description: "Total time at office (arrival to departure)"
 *                           total_break_time:
 *                             type: number
 *                             example: 2.0
 *                             description: "Total break time in hours"
 *                           office_time:
 *                             type: number
 *                             example: 8.5
 *                             description: "Office time (same as total_work_hours for clarity)"
 *                           unaccounted_time:
 *                             type: number
 *                             example: 0
 *                             description: "Unaccounted time (should always be 0 with correct calculation)"
 *                           arrival_time:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-01-15T09:00:00Z"
 *                             description: "Employee arrival time"
 *                           departure_time:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-01-15T19:30:00Z"
 *                             description: "Employee departure time"
 *                           total_activity:
 *                             type: integer
 *                             example: 156
 *                           cameras:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["employees_01", "employees_02"]
 *                           zones:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["desk_01", "employee_area"]
 *                           sessions:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 camera:
 *                                   type: string
 *                                   example: "employees_01"
 *                                 zones:
 *                                   type: array
 *                                   items:
 *                                     type: string
 *                                 first_seen:
 *                                   type: string
 *                                   format: date-time
 *                                 last_seen:
 *                                   type: string
 *                                   format: date-time
 *                                 duration_hours:
 *                                   type: number
 *                                   example: 4.2
 *                                 activity_count:
 *                                   type: integer
 *                                   example: 78
 *                           average_session_duration:
 *                             type: number
 *                             example: 2.1
 *                           productivity_score:
 *                             type: integer
 *                             example: 85
 *                           attendance_status:
 *                             type: string
 *                             example: "full_day"
 *                           work_efficiency:
 *                             type: integer
 *                             example: 95
 *                     total_employees:
 *                       type: integer
 *                       example: 45
 *                     total_work_hours:
 *                       type: number
 *                       example: 382.5
 *                     average_work_hours:
 *                       type: number
 *                       example: 8.5
 *                     period:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date-time
 *                         end:
 *                           type: string
 *                           format: date-time
 *                         duration_hours:
 *                           type: number
 *                           example: 24
 *       500:
 *         description: Internal server error
 */
router.get('/api/employees/work-hours', employeesController.getEmployeeWorkHoursController);

/**
 * @swagger
 * /api/employees/break-time:
 *   get:
 *     summary: Get Employee Break Time
 *     description: Get break time analysis for employees
 *     tags: [Employees]
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
 *         description: Break time data retrieved successfully
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
 *                   example: "Employee break time retrieved successfully"
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
 *                           total_breaks:
 *                             type: integer
 *                             example: 3
 *                           total_break_time:
 *                             type: number
 *                             example: 1.5
 *                           work_hours:
 *                             type: number
 *                             example: 8.5
 *                             description: "Office time (productive work time excluding breaks)"
 *                           office_time:
 *                             type: number
 *                             example: 8.5
 *                             description: "Office time (same as work_hours for clarity)"
 *                           total_time:
 *                             type: number
 *                             example: 10.0
 *                             description: "Total time at office (arrival to departure)"
 *                           arrival_time:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-01-15T09:00:00Z"
 *                             description: "Employee arrival time"
 *                           departure_time:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-01-15T19:00:00Z"
 *                             description: "Employee departure time"
 *                           break_sessions:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 camera:
 *                                   type: string
 *                                   example: "employees_01"
 *                                 zones:
 *                                   type: array
 *                                   items:
 *                                     type: string
 *                                 break_time:
 *                                   type: string
 *                                   format: date-time
 *                                 duration_hours:
 *                                   type: number
 *                                   example: 0.5
 *                                 previous_activity:
 *                                   type: string
 *                                   format: date-time
 *                           average_break_duration:
 *                             type: number
 *                             example: 0.5
 *                           longest_break:
 *                             type: number
 *                             example: 1.0
 *                           shortest_break:
 *                             type: number
 *                             example: 0.25
 *                           break_frequency:
 *                             type: number
 *                             example: 0.125
 *                           break_efficiency:
 *                             type: integer
 *                             example: 88
 *                     total_employees:
 *                       type: integer
 *                       example: 45
 *                     total_break_time:
 *                       type: number
 *                       example: 67.5
 *                     average_break_time:
 *                       type: number
 *                       example: 1.5
 *       500:
 *         description: Internal server error
 */
router.get('/api/employees/break-time', employeesController.getEmployeeBreakTimeController);

/**
 * @swagger
 * /api/employees/attendance:
 *   get:
 *     summary: Get Employee Attendance
 *     description: Get attendance analysis for employees
 *     tags: [Employees]
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
 *     responses:
 *       200:
 *         description: Attendance data retrieved successfully
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
 *                   example: "Employee attendance retrieved successfully"
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
 *                           total_days:
 *                             type: integer
 *                             example: 5
 *                           total_work_hours:
 *                             type: number
 *                             example: 42.5
 *                           attendance_records:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 date:
 *                                   type: string
 *                                   format: date
 *                                 first_seen:
 *                                   type: string
 *                                   format: date-time
 *                                 last_seen:
 *                                   type: string
 *                                   format: date-time
 *                                 work_hours:
 *                                   type: number
 *                                   example: 8.5
 *                                 activity_count:
 *                                   type: integer
 *                                   example: 156
 *                                 status:
 *                                   type: string
 *                                   example: "present"
 *                           attendance_rate:
 *                             type: number
 *                             example: 100.0
 *                           average_daily_hours:
 *                             type: number
 *                             example: 8.5
 *                           attendance_score:
 *                             type: integer
 *                             example: 95
 *                           consistency_rating:
 *                             type: integer
 *                             example: 88
 *                     total_employees:
 *                       type: integer
 *                       example: 45
 *                     period_days:
 *                       type: integer
 *                       example: 5
 *                     overall_attendance_rate:
 *                       type: number
 *                       example: 96.5
 *       500:
 *         description: Internal server error
 */
router.get('/api/employees/attendance', employeesController.getEmployeeAttendanceController);

/**
 * @swagger
 * /api/employees/activity-patterns:
 *   get:
 *     summary: Get Employee Activity Patterns
 *     description: Get activity patterns and work style analysis for employees
 *     tags: [Employees]
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
 *         description: Activity patterns data retrieved successfully
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
 *                   example: "Employee activity patterns retrieved successfully"
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
 *                           hourly_patterns:
 *                             type: object
 *                             additionalProperties:
 *                               type: integer
 *                             example: {"9": 15, "10": 23, "11": 18}
 *                           daily_patterns:
 *                             type: object
 *                             additionalProperties:
 *                               type: integer
 *                             example: {"1": 45, "2": 52, "3": 48}
 *                           zone_preferences:
 *                             type: object
 *                             additionalProperties:
 *                               type: integer
 *                             example: {"desk_01": 25, "employee_area": 18}
 *                           camera_usage:
 *                             type: object
 *                             additionalProperties:
 *                               type: integer
 *                             example: {"employees_01": 30, "employees_02": 15}
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
 *                                   example: 23
 *                           most_active_day:
 *                             type: object
 *                             properties:
 *                               day:
 *                                 type: string
 *                                 example: "Tuesday"
 *                               activity:
 *                                 type: integer
 *                                 example: 52
 *                           activity_consistency:
 *                             type: integer
 *                             example: 85
 *                           productivity_trends:
 *                             type: string
 *                             example: "morning_person"
 *                           work_style:
 *                             type: string
 *                             example: "early_bird"
 *                           zone_diversity:
 *                             type: integer
 *                             example: 3
 *                           camera_diversity:
 *                             type: integer
 *                             example: 2
 *                     total_employees:
 *                       type: integer
 *                       example: 45
 *                     insights:
 *                       type: object
 *                       properties:
 *                         total_employees:
 *                           type: integer
 *                           example: 45
 *                         productivity_distribution:
 *                           type: object
 *                           properties:
 *                             morning_person:
 *                               type: integer
 *                               example: 35
 *                             evening_person:
 *                               type: integer
 *                               example: 20
 *                             balanced:
 *                               type: integer
 *                               example: 45
 *                         work_style_distribution:
 *                           type: object
 *                           properties:
 *                             early_bird:
 *                               type: integer
 *                               example: 30
 *                             night_owl:
 *                               type: integer
 *                               example: 15
 *                             regular_schedule:
 *                               type: integer
 *                               example: 55
 *                         average_consistency:
 *                           type: integer
 *                           example: 82
 *       500:
 *         description: Internal server error
 */
router.get('/api/employees/activity-patterns', employeesController.getEmployeeActivityPatternsController);

module.exports = router;

