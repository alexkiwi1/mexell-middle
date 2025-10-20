const express = require('express');
const mobileController = require('../../controllers/mobile.controller');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     MobileDashboard:
 *       type: object
 *       properties:
 *         summary:
 *           type: object
 *           properties:
 *             violations:
 *               type: integer
 *               description: Number of violations in the period
 *             active_employees:
 *               type: integer
 *               description: Number of active employees
 *             active_cameras:
 *               type: integer
 *               description: Number of active cameras
 *             period:
 *               type: object
 *               properties:
 *                 start:
 *                   type: string
 *                   format: date-time
 *                 end:
 *                   type: string
 *                   format: date-time
 *                 hours:
 *                   type: integer
 *         recent_activity:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               camera:
 *                 type: string
 *               type:
 *                 type: string
 *               employee:
 *                 type: string
 *               zones:
 *                 type: array
 *                 items:
 *                   type: string
 *     
 *     MobileViolation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *         camera:
 *           type: string
 *         employee:
 *           type: string
 *         zones:
 *           type: array
 *           items:
 *             type: string
 *         confidence:
 *           type: number
 *     
 *     MobileEmployee:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         camera:
 *           type: string
 *         last_seen:
 *           type: string
 *           format: date-time
 *         activity_count:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *     
 *     MobileCamera:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *         events:
 *           type: integer
 *         employees:
 *           type: integer
 *         violations:
 *           type: integer
 *         last_activity:
 *           type: string
 *           format: date-time
 *     
 *     MobileNotification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *         type:
 *           type: string
 *         camera:
 *           type: string
 *         employee:
 *           type: string
 *         zones:
 *           type: array
 *           items:
 *             type: string
 *         confidence:
 *           type: number
 *         priority:
 *           type: string
 *           enum: [high, normal]
 *     
 *     MobileSyncData:
 *       type: object
 *       properties:
 *         sync_timestamp:
 *           type: string
 *           format: date-time
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *               camera:
 *                 type: string
 *               type:
 *                 type: string
 *               employee:
 *                 type: string
 *               zones:
 *                 type: array
 *                 items:
 *                   type: string
 *               confidence:
 *                 type: number
 *         has_more:
 *           type: boolean
 *     
 *     MobileSettings:
 *       type: object
 *       properties:
 *         app_version:
 *           type: string
 *         api_version:
 *           type: string
 *         features:
 *           type: object
 *           properties:
 *             real_time_notifications:
 *               type: boolean
 *             offline_sync:
 *               type: boolean
 *             push_notifications:
 *               type: boolean
 *             video_playback:
 *               type: boolean
 *             violation_reporting:
 *               type: boolean
 *         limits:
 *           type: object
 *           properties:
 *             max_violations_per_page:
 *               type: integer
 *             max_sync_items:
 *               type: integer
 *             max_notifications:
 *               type: integer
 *         endpoints:
 *           type: object
 *           properties:
 *             websocket:
 *               type: string
 *             media_proxy:
 *               type: string
 *             api_base:
 *               type: string
 */

/**
 * @swagger
 * /api/mobile/dashboard:
 *   get:
 *     summary: Get mobile dashboard data
 *     description: Get lightweight dashboard data optimized for mobile apps
 *     tags: [Mobile]
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           default: 24
 *         description: Hours to look back (fallback if no dates)
 *     responses:
 *       200:
 *         description: Mobile dashboard data retrieved successfully
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
 *                   $ref: '#/components/schemas/MobileDashboard'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/api/mobile/dashboard', mobileController.getMobileDashboardController);

/**
 * @swagger
 * /api/mobile/violations:
 *   get:
 *     summary: Get mobile violations list
 *     description: Get paginated violations list optimized for mobile apps
 *     tags: [Mobile]
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           default: 24
 *         description: Hours to look back (fallback if no dates)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of violations to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of violations to skip
 *     responses:
 *       200:
 *         description: Mobile violations data retrieved successfully
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
 *                     violations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MobileViolation'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         limit:
 *                           type: integer
 *                         offset:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         has_more:
 *                           type: boolean
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/api/mobile/violations', mobileController.getMobileViolationsController);

/**
 * @swagger
 * /api/mobile/employees:
 *   get:
 *     summary: Get mobile employee status
 *     description: Get employee status data optimized for mobile apps
 *     tags: [Mobile]
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           default: 24
 *         description: Hours to look back (fallback if no dates)
 *     responses:
 *       200:
 *         description: Mobile employee status retrieved successfully
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
 *                     employees:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MobileEmployee'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/api/mobile/employees', mobileController.getMobileEmployeeStatusController);

/**
 * @swagger
 * /api/mobile/cameras:
 *   get:
 *     summary: Get mobile camera status
 *     description: Get camera status data optimized for mobile apps
 *     tags: [Mobile]
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           default: 24
 *         description: Hours to look back (fallback if no dates)
 *     responses:
 *       200:
 *         description: Mobile camera status retrieved successfully
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
 *                     cameras:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MobileCamera'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/api/mobile/cameras', mobileController.getMobileCameraStatusController);

/**
 * @swagger
 * /api/mobile/notifications:
 *   get:
 *     summary: Get mobile notifications
 *     description: Get notifications data optimized for mobile apps
 *     tags: [Mobile]
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           default: 24
 *         description: Hours to look back (fallback if no dates)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of notifications to return
 *     responses:
 *       200:
 *         description: Mobile notifications retrieved successfully
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
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MobileNotification'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/api/mobile/notifications', mobileController.getMobileNotificationsController);

/**
 * @swagger
 * /api/mobile/sync:
 *   get:
 *     summary: Get mobile sync data
 *     description: Get data for offline synchronization in mobile apps
 *     tags: [Mobile]
 *     parameters:
 *       - in: query
 *         name: last_sync
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Last sync timestamp
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of items to sync
 *     responses:
 *       200:
 *         description: Mobile sync data retrieved successfully
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
 *                   $ref: '#/components/schemas/MobileSyncData'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/api/mobile/sync', mobileController.getMobileSyncDataController);

/**
 * @swagger
 * /api/mobile/settings:
 *   get:
 *     summary: Get mobile app settings
 *     description: Get mobile app configuration and settings
 *     tags: [Mobile]
 *     responses:
 *       200:
 *         description: Mobile settings retrieved successfully
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
 *                   $ref: '#/components/schemas/MobileSettings'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/api/mobile/settings', mobileController.getMobileSettingsController);

module.exports = router;
