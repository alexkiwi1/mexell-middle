const express = require('express');
const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const { healthController } = require('../../controllers');
const camerasController = require('../../controllers/cameras.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Frigate Surveillance
 *   description: Frigate surveillance middleware APIs for camera monitoring, violation detection, and employee tracking
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health Check
 *     description: Check API health and database connectivity
 *     tags: [Frigate Surveillance]
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
 *                         frigate_database:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                               example: "healthy"
 *                             responseTime:
 *                               type: string
 *                               example: "45ms"
 *       500:
 *         description: Service unavailable
 */
router.get('/health', healthController.healthCheck);

/**
 * @swagger
 * /api/cameras:
 *   get:
 *     summary: List All Cameras
 *     description: Get list of all available cameras
 *     tags: [Frigate Surveillance]
 *     responses:
 *       200:
 *         description: Cameras retrieved successfully
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
 *                   example: "Cameras retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     cameras:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "employees_01"
 *                           status:
 *                             type: string
 *                             example: "active"
 *                           resolution:
 *                             type: string
 *                             example: "3840x2160"
 *                           fps:
 *                             type: number
 *                             example: 8
 *       500:
 *         description: Internal server error
 */
router.get('/api/cameras', camerasController.listCameras);

/**
 * @swagger
 * /api/cameras/summary:
 *   get:
 *     summary: Camera Summary (All)
 *     description: Get summary of all cameras with activity metrics
 *     tags: [Frigate Surveillance]
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
 *     responses:
 *       200:
 *         description: Camera summary retrieved successfully
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
 *                   example: "Camera summary retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     cameras:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "employees_01"
 *                           status:
 *                             type: string
 *                             example: "active"
 *                           violations:
 *                             type: integer
 *                             example: 15
 *                           activity:
 *                             type: integer
 *                             example: 42
 *                           lastSeen:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-10-02T16:31:49.907Z"
 *                     totalCameras:
 *                       type: integer
 *                       example: 12
 *                     totalViolations:
 *                       type: integer
 *                       example: 156
 *       500:
 *         description: Internal server error
 */
router.get('/api/cameras/summary', camerasController.getCameraSummaryController);

/**
 * @swagger
 * /api/cameras/{camera}/summary:
 *   get:
 *     summary: Camera Summary (Single)
 *     description: Get detailed summary for a specific camera
 *     tags: [Frigate Surveillance]
 *     parameters:
 *       - in: path
 *         name: camera
 *         required: true
 *         schema:
 *           type: string
 *         description: Camera name
 *         example: "employees_01"
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
 *     responses:
 *       200:
 *         description: Camera summary retrieved successfully
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
 *                   example: "Camera summary for employees_01 retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     camera:
 *                       type: string
 *                       example: "employees_01"
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     violations:
 *                       type: integer
 *                       example: 15
 *                     activity:
 *                       type: integer
 *                       example: 42
 *                     lastSeen:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-02T16:31:49.907Z"
 *                     metrics:
 *                       type: object
 *                       properties:
 *                         totalEvents:
 *                           type: integer
 *                           example: 156
 *                         violationRate:
 *                           type: number
 *                           example: 0.15
 *                         activityLevel:
 *                           type: string
 *                           example: "high"
 *       404:
 *         description: Camera not found
 *       500:
 *         description: Internal server error
 */
router.get('/api/cameras/:camera/summary', camerasController.getCameraSummaryByIdController);

/**
 * @swagger
 * /api/cameras/{camera}/activity:
 *   get:
 *     summary: Camera Activity Feed
 *     description: Get real-time activity feed for a specific camera
 *     tags: [Frigate Surveillance]
 *     parameters:
 *       - in: path
 *         name: camera
 *         required: true
 *         schema:
 *           type: string
 *         description: Camera name
 *         example: "employees_01"
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
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of activities to return
 *         example: 20
 *     responses:
 *       200:
 *         description: Camera activity retrieved successfully
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
 *                   example: "Camera activity for employees_01 retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     camera:
 *                       type: string
 *                       example: "employees_01"
 *                     activities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-10-02T16:31:49.907Z"
 *                           type:
 *                             type: string
 *                             example: "person"
 *                           label:
 *                             type: string
 *                             example: "person"
 *                           confidence:
 *                             type: number
 *                             example: 0.85
 *                           zones:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["desk_01", "employee_area"]
 *       404:
 *         description: Camera not found
 *       500:
 *         description: Internal server error
 */
router.get('/api/cameras/:camera/activity', camerasController.getCameraActivityController);

/**
 * @swagger
 * /api/cameras/{camera}/status:
 *   get:
 *     summary: Camera Status
 *     description: Get detailed status information for a specific camera
 *     tags: [Frigate Surveillance]
 *     parameters:
 *       - in: path
 *         name: camera
 *         required: true
 *         schema:
 *           type: string
 *         description: Camera name
 *         example: "employees_01"
 *     responses:
 *       200:
 *         description: Camera status retrieved successfully
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
 *                   example: "Camera status for employees_01 retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     camera:
 *                       type: string
 *                       example: "employees_01"
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     online:
 *                       type: boolean
 *                       example: true
 *                     lastActivity:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-02T16:31:49.907Z"
 *                     details:
 *                       type: object
 *                       properties:
 *                         resolution:
 *                           type: string
 *                           example: "3840x2160"
 *                         fps:
 *                           type: number
 *                           example: 8
 *                         uptime:
 *                           type: string
 *                           example: "2d 14h 32m"
 *       404:
 *         description: Camera not found
 *       500:
 *         description: Internal server error
 */
router.get('/api/cameras/:camera/status', camerasController.getCameraStatusController);

/**
 * @swagger
 * /api/cameras/{camera}/violations:
 *   get:
 *     summary: Camera Violations
 *     description: Get cell phone violations for a specific camera
 *     tags: [Frigate Surveillance]
 *     parameters:
 *       - in: path
 *         name: camera
 *         required: true
 *         schema:
 *           type: string
 *         description: Camera name
 *         example: "employees_01"
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
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of violations to return
 *         example: 10
 *     responses:
 *       200:
 *         description: Camera violations retrieved successfully
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
 *                   example: "Camera violations for employees_01 retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     camera:
 *                       type: string
 *                       example: "employees_01"
 *                     violations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-10-02T16:31:49.907Z"
 *                           timestampRelative:
 *                             type: string
 *                             example: "10/2/2025, 4:31:49 PM"
 *                           camera:
 *                             type: string
 *                             example: "employees_01"
 *                           assignedEmployee:
 *                             type: string
 *                             example: "Muhammad Taha"
 *                           assignmentMethod:
 *                             type: string
 *                             example: "desk_zone"
 *                           assignmentConfidence:
 *                             type: string
 *                             example: "high"
 *                           assignmentReason:
 *                             type: string
 *                             example: "Assigned based on desk zone detection"
 *                           faceEmployeeName:
 *                             type: string
 *                             nullable: true
 *                             example: null
 *                           deskEmployeeName:
 *                             type: string
 *                             nullable: true
 *                             example: "Muhammad Taha"
 *                           zones:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["desk_01", "employee_area"]
 *                           objects:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["cell phone"]
 *                           confidence:
 *                             type: number
 *                             example: 0.85
 *                           type:
 *                             type: string
 *                             example: "cell_phone"
 *                           media:
 *                             type: object
 *                             properties:
 *                               snapshot_url:
 *                                 type: string
 *                                 example: "http://10.0.20.6:8000/clips/employees_01-1759422709.90754-1759422600.60731-ibtg42.jpg"
 *                               clean_snapshot_url:
 *                                 type: string
 *                                 example: "http://10.0.20.6:8000/clips/employees_01-1759422709.90754-1759422600.60731-ibtg42-clean.png"
 *                               thumbnail_url:
 *                                 type: string
 *                                 example: "http://10.0.20.6:8000/clips/review/thumb-employees_01-1759422709.90754-1759422600.60731-ibtg42.webp"
 *                               video_file_url:
 *                                 type: string
 *                                 example: "http://10.0.20.6:8000/recordings/2025-10-02/16/employees_01/31.49.mp4"
 *                               recording_url:
 *                                 type: string
 *                                 example: "http://10.0.20.6:8000/recordings/2025-10-02/16/employees_01/"
 *                               clips_url:
 *                                 type: string
 *                                 example: "http://10.0.20.6:8000/clips/"
 *                               video_server_url:
 *                                 type: string
 *                                 example: "http://10.0.20.6:8000"
 *                               note:
 *                                 type: string
 *                                 example: "URLs generated based on Frigate patterns. Some may not exist due to ID mismatches."
 *                     count:
 *                       type: integer
 *                       example: 10
 *                     filters:
 *                       type: object
 *                       properties:
 *                         start_date:
 *                           type: string
 *                           example: "2025-10-02"
 *                         end_date:
 *                           type: string
 *                           example: "2025-10-02"
 *                         limit:
 *                           type: integer
 *                           example: 10
 *       404:
 *         description: Camera not found
 *       500:
 *         description: Internal server error
 */
router.get('/api/cameras/:camera/violations', camerasController.getCameraViolationsController);

/**
 * @swagger
 * /api/violations/summary:
 *   get:
 *     summary: Violations Summary
 *     description: Get summary of all employee violations
 *     tags: [Frigate Surveillance]
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
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of employees to return
 *         example: 50
 *     responses:
 *       200:
 *         description: Violations summary retrieved successfully
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
 *                   example: "Violations summary retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     employees:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Muhammad Taha"
 *                           violations:
 *                             type: integer
 *                             example: 15
 *                           lastViolation:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-10-02T16:31:49.907Z"
 *                           assignmentMethod:
 *                             type: string
 *                             example: "desk_zone"
 *                           confidence:
 *                             type: string
 *                             example: "high"
 *                     totalViolations:
 *                       type: integer
 *                       example: 156
 *                     totalEmployees:
 *                       type: integer
 *                       example: 66
 *       500:
 *         description: Internal server error
 */
router.get('/api/violations/summary', camerasController.getViolationsSummaryByEmployeeController);

/**
 * @swagger
 * /api/violations/employee/{employee_name}:
 *   get:
 *     summary: Employee Violations
 *     description: Get violations for a specific employee
 *     tags: [Frigate Surveillance]
 *     parameters:
 *       - in: path
 *         name: employee_name
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee name
 *         example: "Muhammad Taha"
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
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of violations to return
 *         example: 20
 *     responses:
 *       200:
 *         description: Employee violations retrieved successfully
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
 *                   example: "Violations for Muhammad Taha retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     employee:
 *                       type: string
 *                       example: "Muhammad Taha"
 *                     violations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-10-02T16:31:49.907Z"
 *                           timestampRelative:
 *                             type: string
 *                             example: "10/2/2025, 4:31:49 PM"
 *                           camera:
 *                             type: string
 *                             example: "employees_01"
 *                           assignedEmployee:
 *                             type: string
 *                             example: "Muhammad Taha"
 *                           assignmentMethod:
 *                             type: string
 *                             example: "desk_zone"
 *                           assignmentConfidence:
 *                             type: string
 *                             example: "high"
 *                           zones:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["desk_01", "employee_area"]
 *                           media:
 *                             type: object
 *                             properties:
 *                               snapshot_url:
 *                                 type: string
 *                                 example: "http://10.0.20.6:8000/clips/employees_01-1759422709.90754-1759422600.60731-ibtg42.jpg"
 *                               video_file_url:
 *                                 type: string
 *                                 example: "http://10.0.20.6:8000/recordings/2025-10-02/16/employees_01/31.49.mp4"
 *                               clips_url:
 *                                 type: string
 *                                 example: "http://10.0.20.6:8000/clips/"
 *                     count:
 *                       type: integer
 *                       example: 20
 *       404:
 *         description: Employee not found
 *       500:
 *         description: Internal server error
 */
router.get('/api/violations/employee/:employee_name', camerasController.getViolationsByEmployeeController);

/**
 * @swagger
 * /api/violations/media/{violation_id}/{camera}/{timestamp}:
 *   get:
 *     summary: Violation Media URLs
 *     description: Get media URLs for a specific violation
 *     tags: [Frigate Surveillance]
 *     parameters:
 *       - in: path
 *         name: violation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Violation ID
 *         example: "1759422600.60731-ibtg42"
 *       - in: path
 *         name: camera
 *         required: true
 *         schema:
 *           type: string
 *         description: Camera name
 *         example: "employees_01"
 *       - in: path
 *         name: timestamp
 *         required: true
 *         schema:
 *           type: string
 *         description: Unix timestamp
 *         example: "1759422709"
 *     responses:
 *       200:
 *         description: Violation media retrieved successfully
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
 *                   example: "Violation media URLs retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     violation_id:
 *                       type: string
 *                       example: "1759422600.60731-ibtg42"
 *                     camera:
 *                       type: string
 *                       example: "employees_01"
 *                     timestamp:
 *                       type: number
 *                       example: 1759422709
 *                     snapshot_url:
 *                       type: string
 *                       example: "http://10.0.20.6:8000/clips/employees_01-1759422709-1759422600.60731-ibtg42.jpg"
 *                     clean_snapshot_url:
 *                       type: string
 *                       example: "http://10.0.20.6:8000/clips/employees_01-1759422709-1759422600.60731-ibtg42-clean.png"
 *                     thumbnail_url:
 *                       type: string
 *                       example: "http://10.0.20.6:8000/clips/review/thumb-employees_01-1759422709-1759422600.60731-ibtg42.webp"
 *                     video_file_url:
 *                       type: string
 *                       example: "http://10.0.20.6:8000/recordings/2025-10-02/16/employees_01/31.49.mp4"
 *                     recording_url:
 *                       type: string
 *                       example: "http://10.0.20.6:8000/recordings/2025-10-02/16/employees_01/"
 *                     clips_url:
 *                       type: string
 *                       example: "http://10.0.20.6:8000/clips/"
 *                     video_server_url:
 *                       type: string
 *                       example: "http://10.0.20.6:8000"
 *                     note:
 *                       type: string
 *                       example: "URLs generated based on Frigate patterns. Some may not exist due to ID mismatches."
 *       400:
 *         description: Missing required parameters
 *       404:
 *         description: Violation not found
 *       500:
 *         description: Internal server error
 */
router.get('/api/violations/media/:violation_id/:camera/:timestamp', camerasController.getViolationMediaController);

/**
 * @swagger
 * /api/cameras/cache:
 *   delete:
 *     summary: Clear Camera Cache
 *     description: Clear camera data cache
 *     tags: [Frigate Surveillance]
 *     responses:
 *       200:
 *         description: Camera cache cleared successfully
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
 *                   example: "Camera cache cleared successfully"
 *       500:
 *         description: Internal server error
 */
router.delete('/api/cameras/cache', camerasController.clearCameraCacheController);

module.exports = router;

