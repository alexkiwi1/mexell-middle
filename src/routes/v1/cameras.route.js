const express = require('express');
const camerasController = require('../../controllers/cameras.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cameras
 *   description: Camera management, monitoring, and violation tracking
 */

/**
 * @swagger
 * /api/cameras/list:
 *   get:
 *     summary: List All Cameras
 *     description: Get list of all available cameras with their status and configuration
 *     tags: [Cameras]
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
 *                           ip:
 *                             type: string
 *                             example: "172.16.5.242"
 *       500:
 *         description: Internal server error
 */
router.get('/api/cameras/list', camerasController.listCameras);

/**
 * @swagger
 * /api/cameras/summary:
 *   get:
 *     summary: Get Camera Summary
 *     description: Get summary of all cameras with activity metrics and violations
 *     tags: [Cameras]
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
router.get('/api/cameras/:camera_name/summary', camerasController.getCameraSummaryByIdController);
router.get('/api/cameras/:camera_name/activity', camerasController.getCameraActivityController);
router.get('/api/cameras/:camera_name/status', camerasController.getCameraStatusController);
router.get('/api/cameras/:camera_name/violations', camerasController.getCameraViolationsController);

// Employee violation endpoints
router.get('/api/violations/summary', camerasController.getViolationsSummaryByEmployeeController);
router.get('/api/violations/employee/:employee_name', camerasController.getViolationsByEmployeeController);

// Media endpoints
router.get('/api/violations/media/:violation_id/:camera/:timestamp', camerasController.getViolationMediaController);

router.delete('/api/cameras/cache', camerasController.clearCameraCacheController);

module.exports = router;