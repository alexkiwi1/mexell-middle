const express = require('express');
const timezoneController = require('../../controllers/timezone.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Timezone
 *   description: Timezone conversion and utilities
 */

/**
 * @swagger
 * /api/timezone/list:
 *   get:
 *     summary: Get list of common timezones
 *     description: Retrieve a list of commonly used timezones with their abbreviations and current times
 *     tags: [Timezone]
 *     responses:
 *       200:
 *         description: Timezones retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 message: { type: 'string' }
 *                 data: 
 *                   type: 'object'
 *                   properties:
 *                     timezones: 
 *                       type: 'array'
 *                       items:
 *                         type: 'object'
 *                         properties:
 *                           abbreviation: { type: 'string' }
 *                           iana: { type: 'string' }
 *                           name: { type: 'string' }
 *                           offset: { type: 'string' }
 *                           currentTime: { type: 'string' }
 *                 count: { type: 'number' }
 */
router.get('/api/timezone/list', timezoneController.getTimezonesController);

/**
 * @swagger
 * /api/timezone/info/{timezone}:
 *   get:
 *     summary: Get timezone information
 *     description: Get detailed information about a specific timezone including offset, DST status, and current time
 *     tags: [Timezone]
 *     parameters:
 *       - in: path
 *         name: timezone
 *         required: true
 *         schema: { type: 'string' }
 *         description: Timezone identifier (e.g., 'UTC', 'America/New_York', 'Asia/Karachi')
 *     responses:
 *       200:
 *         description: Timezone information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: 'object'
 *               properties:
 *                 success: { type: 'boolean' }
 *                 message: { type: 'string' }
 *                 data:
 *                   type: 'object'
 *                   properties:
 *                     timezone: { type: 'string' }
 *                     offset: { type: 'string' }
 *                     offsetMinutes: { type: 'number' }
 *                     isDST: { type: 'boolean' }
 *                     currentTime: { type: 'string' }
 *                     abbreviation: { type: 'string' }
 *       400:
 *         description: Invalid timezone
 */
router.get('/api/timezone/info/:timezone', timezoneController.getTimezoneInfoController);

/**
 * @swagger
 * /api/timezone/convert/{timestamp}:
 *   get:
 *     summary: Convert timestamp to timezone
 *     description: Convert a Unix timestamp to a specific timezone with custom formatting
 *     tags: [Timezone]
 *     parameters:
 *       - in: path
 *         name: timestamp
 *         required: true
 *         schema: { type: 'integer' }
 *         description: Unix timestamp to convert
 *       - in: query
 *         name: timezone
 *         schema: { type: 'string', default: 'UTC' }
 *         description: Target timezone (e.g., 'UTC', 'America/New_York', 'Asia/Karachi')
 *       - in: query
 *         name: format
 *         schema: { type: 'string', default: 'YYYY-MM-DD HH:mm:ss' }
 *         description: Moment.js format string for output
 *     responses:
 *       200:
 *         description: Timestamp converted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: 'object'
 *               properties:
 *                 success: { type: 'boolean' }
 *                 message: { type: 'string' }
 *                 data:
 *                   type: 'object'
 *                   properties:
 *                     original_timestamp: { type: 'number' }
 *                     timezone: { type: 'string' }
 *                     converted: { type: 'string' }
 *                     readable: { type: 'string' }
 *                     format: { type: 'string' }
 *       400:
 *         description: Invalid timestamp or timezone
 */
router.get('/api/timezone/convert/:timestamp', timezoneController.convertTimestampController);

/**
 * @swagger
 * /api/timezone/validate/{timezone}:
 *   get:
 *     summary: Validate timezone
 *     description: Check if a timezone string is valid and get its information
 *     tags: [Timezone]
 *     parameters:
 *       - in: path
 *         name: timezone
 *         required: true
 *         schema: { type: 'string' }
 *         description: Timezone identifier to validate
 *     responses:
 *       200:
 *         description: Timezone validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: 'object'
 *               properties:
 *                 success: { type: 'boolean' }
 *                 message: { type: 'string' }
 *                 data:
 *                   type: 'object'
 *                   properties:
 *                     timezone: { type: 'string' }
 *                     valid: { type: 'boolean' }
 *                     info: { type: 'object' }
 */
router.get('/api/timezone/validate/:timezone', timezoneController.validateTimezoneController);

module.exports = router;

