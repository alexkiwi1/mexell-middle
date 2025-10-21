const express = require('express');
const { getRecentClips, testMediaUrls, getRecordingAtTimestamp } = require('../../controllers/media.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Media
 *   description: Media file management and streaming
 */

/**
 * @swagger
 * /api/recent-media/clips:
 *   get:
 *     summary: Get Recent Media Clips
 *     description: Get recent media clips with metadata and streaming URLs
 *     tags: [Media]
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
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of clips to return
 *         example: 50
 *     responses:
 *       200:
 *         description: Recent clips retrieved successfully
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
 *                   example: "Recent clips retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     clips:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "clip_12345"
 *                           camera:
 *                             type: string
 *                             example: "employees_01"
 *                           start_time:
 *                             type: string
 *                             format: date-time
 *                           end_time:
 *                             type: string
 *                             format: date-time
 *                           duration:
 *                             type: number
 *                             example: 30.5
 *                           video_url:
 *                             type: string
 *                             example: "/media/clips/employees_01/2025-10-02/clip_12345.mp4"
 *                           thumbnail_url:
 *                             type: string
 *                             example: "/media/thumbnails/employees_01/2025-10-02/clip_12345.jpg"
 *                           objects:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["person", "cell phone"]
 *                           zones:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["desk_01"]
 *                     total_clips:
 *                       type: integer
 *                       example: 25
 *       500:
 *         description: Internal server error
 */
router.get('/api/recent-media/clips', getRecentClips);

// Test media URLs
router.get('/api/recent-media/test-media', testMediaUrls);

/**
 * @swagger
 * /api/recordings/at-time:
 *   get:
 *     summary: Get Recording at Specific Timestamp
 *     description: |
 *       Get a video URL for a specific timestamp on a camera with customizable time window.
 *       Supports multiple date/time formats: Unix timestamp, ISO date strings, date+time combinations, and hours lookback.
 *     tags: [Media]
 *     parameters:
 *       - in: query
 *         name: camera
 *         required: true
 *         schema:
 *           type: string
 *         description: Camera name
 *         example: "employees_01"
 *       - in: query
 *         name: timestamp
 *         schema:
 *           type: string
 *         description: Unix timestamp or ISO date string (e.g., "2025-10-20T12:47:50")
 *         example: 1760915899
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date in YYYY-MM-DD format
 *         example: "2025-10-20"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date in YYYY-MM-DD format (optional, defaults to start_date)
 *         example: "2025-10-20"
 *       - in: query
 *         name: start_time
 *         schema:
 *           type: string
 *         description: Start time in HH:MM:SS format (optional, defaults to 00:00:00)
 *         example: "12:47:50"
 *       - in: query
 *         name: end_time
 *         schema:
 *           type: string
 *         description: End time in HH:MM:SS format (optional)
 *         example: "12:47:50"
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *         description: Hours to look back from current time
 *         example: 24
 *       - in: query
 *         name: timezone
 *         schema:
 *           type: string
 *           default: "UTC"
 *         description: Timezone for date/time conversion (e.g., "Asia/Karachi", "America/New_York")
 *         example: "Asia/Karachi"
 *       - in: query
 *         name: window
 *         schema:
 *           type: integer
 *           default: 2
 *           minimum: 1
 *           maximum: 60
 *         description: Time window in seconds (before and after event)
 *         example: 2
 *     responses:
 *       200:
 *         description: Recording found successfully
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
 *                   example: "Recording found successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     video_url:
 *                       type: string
 *                       example: "http://10.0.20.6:8000/recordings/2025-10-19/23/employees_02/18.19.mp4#t=2.6,6.6"
 *                     recording_id:
 *                       type: string
 *                       example: "1760915899.0-teptn7"
 *                     camera:
 *                       type: string
 *                       example: "employees_02"
 *                     exact_timestamp:
 *                       type: number
 *                       example: 1760915899
 *                     timestamp_iso:
 *                       type: string
 *                       example: "2025-10-20T12:47:52.674Z"
 *                     timezone:
 *                       type: string
 *                       example: "UTC"
 *                     time_window:
 *                       type: object
 *                       properties:
 *                         start_seconds:
 *                           type: number
 *                           example: 2.6
 *                         end_seconds:
 *                           type: number
 *                           example: 6.6
 *                         duration_seconds:
 *                           type: number
 *                           example: 4.0
 *                     playback_info:
 *                       type: object
 *                       properties:
 *                         event_at_seconds:
 *                           type: number
 *                           example: 4.6
 *                         window_seconds:
 *                           type: number
 *                           example: 2
 *                         total_clip_duration:
 *                           type: number
 *                           example: 4.0
 *                     input_parameters:
 *                       type: object
 *                       description: Input parameters used for the query
 *                       properties:
 *                         method:
 *                           type: string
 *                           example: "unix_timestamp"
 *                         window:
 *                           type: number
 *                           example: 2
 *       400:
 *         description: Bad request - missing or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Camera parameter is required"
 *                 error:
 *                   type: string
 *                   example: "Missing required parameter: camera"
 *       404:
 *         description: Recording not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "No recording found for camera 'employees_01' at timestamp 1760915899"
 *                 data:
 *                   type: object
 *                   properties:
 *                     camera:
 *                       type: string
 *                       example: "employees_01"
 *                     timestamp:
 *                       type: number
 *                       example: 1760915899
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Check if the camera name is correct", "Verify the timestamp is within recording range"]
 *       500:
 *         description: Internal server error
 */
router.get('/api/recordings/at-time', getRecordingAtTimestamp);

module.exports = router;

