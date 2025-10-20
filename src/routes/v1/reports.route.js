const express = require('express');
const reportsController = require('../../controllers/reports.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: API for generating detailed reports with downloadable URLs
 */

/**
 * @swagger
 * /api/reports/employee:
 *   get:
 *     summary: Generate comprehensive employee report
 *     description: Generate detailed employee report with work hours, productivity, violations, and downloadable URLs
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema: { type: 'string', format: 'date' }
 *         description: Start date (YYYY-MM-DD)
 *         example: "2025-10-20"
 *       - in: query
 *         name: end_date
 *         schema: { type: 'string', format: 'date' }
 *         description: End date (YYYY-MM-DD)
 *         example: "2025-10-20"
 *       - in: query
 *         name: timezone
 *         schema: { type: 'string', default: 'UTC' }
 *         description: Timezone for report data
 *         example: "PKT"
 *       - in: query
 *         name: format
 *         schema: { type: 'string', enum: ['json', 'csv', 'pdf', 'xlsx', 'all'], default: 'json' }
 *         description: Report format
 *       - in: query
 *         name: include_media
 *         schema: { type: 'boolean', default: true }
 *         description: Include media URLs in report
 *       - in: query
 *         name: include_breakdown
 *         schema: { type: 'boolean', default: true }
 *         description: Include detailed breakdown
 *       - in: query
 *         name: employee_name
 *         schema: { type: 'string' }
 *         description: Filter by specific employee
 *       - in: query
 *         name: camera
 *         schema: { type: 'string' }
 *         description: Filter by camera
 *     responses:
 *       200:
 *         description: Employee report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 message: { type: 'string' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     report:
 *                       type: object
 *                       properties:
 *                         report_id: { type: 'string' }
 *                         report_type: { type: 'string' }
 *                         generated_at: { type: 'string' }
 *                         timezone: { type: 'string' }
 *                         summary: { type: 'object' }
 *                         employees: { type: 'array' }
 *                         charts: { type: 'object' }
 *                         insights: { type: 'object' }
 *                         recommendations: { type: 'object' }
 *                     download_urls:
 *                       type: object
 *                       properties:
 *                         json: { type: 'string' }
 *                         csv: { type: 'string' }
 *                         pdf: { type: 'string' }
 *                         excel: { type: 'string' }
 *                     report_metadata:
 *                       type: object
 *                       properties:
 *                         report_id: { type: 'string' }
 *                         generated_at: { type: 'string' }
 *                         expires_at: { type: 'string' }
 *                         file_size: { type: 'number' }
 *                         download_count: { type: 'number' }
 */
router.get('/reports/employee', reportsController.generateEmployeeReportController);

/**
 * @swagger
 * /api/reports/violations:
 *   get:
 *     summary: Generate violation report
 *     description: Generate detailed violation report with media URLs and analysis
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema: { type: 'string', format: 'date' }
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema: { type: 'string', format: 'date' }
 *         description: End date (YYYY-MM-DD)
 *       - in: query
 *         name: timezone
 *         schema: { type: 'string', default: 'UTC' }
 *         description: Timezone for report data
 *       - in: query
 *         name: format
 *         schema: { type: 'string', enum: ['json', 'csv', 'pdf', 'xlsx', 'all'], default: 'json' }
 *         description: Report format
 *       - in: query
 *         name: severity
 *         schema: { type: 'string', enum: ['high', 'medium', 'low'] }
 *         description: Filter by violation severity
 *       - in: query
 *         name: include_media
 *         schema: { type: 'boolean', default: true }
 *         description: Include media URLs in report
 *     responses:
 *       200:
 *         description: Violation report generated successfully
 */
router.get('/reports/violations', reportsController.generateViolationReportController);

/**
 * @swagger
 * /api/reports/comprehensive:
 *   get:
 *     summary: Generate comprehensive dashboard report
 *     description: Generate complete dashboard report with all metrics, insights, and recommendations
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema: { type: 'string', format: 'date' }
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema: { type: 'string', format: 'date' }
 *         description: End date (YYYY-MM-DD)
 *       - in: query
 *         name: timezone
 *         schema: { type: 'string', default: 'UTC' }
 *         description: Timezone for report data
 *       - in: query
 *         name: format
 *         schema: { type: 'string', enum: ['json', 'csv', 'pdf', 'xlsx', 'all'], default: 'json' }
 *         description: Report format
 *       - in: query
 *         name: include_media
 *         schema: { type: 'boolean', default: true }
 *         description: Include media URLs in report
 *     responses:
 *       200:
 *         description: Comprehensive report generated successfully
 */
router.get('/reports/comprehensive', reportsController.generateComprehensiveReportController);

/**
 * @swagger
 * /api/reports/types:
 *   get:
 *     summary: Get available report types and formats
 *     description: Retrieve list of available report types and supported formats
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Report types retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 message: { type: 'string' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     report_types: { type: 'array', items: { type: 'string' } }
 *                     report_formats: { type: 'array', items: { type: 'string' } }
 *                     descriptions: { type: 'object' }
 */
router.get('/reports/types', reportsController.getReportTypesController);

/**
 * @swagger
 * /api/reports/download/{filename}:
 *   get:
 *     summary: Download report file
 *     description: Download a specific report file by filename
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema: { type: 'string' }
 *         description: Report filename (e.g., report-id.json, report-id.pdf)
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Report file not found
 */
router.get('/reports/download/:filename', reportsController.downloadReportController);

/**
 * @swagger
 * /api/reports/metadata/{reportId}:
 *   get:
 *     summary: Get report metadata
 *     description: Get metadata and download URLs for a specific report
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema: { type: 'string' }
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report metadata retrieved successfully
 *       404:
 *         description: Report not found
 */
router.get('/reports/metadata/:reportId', reportsController.getReportMetadataController);

/**
 * @swagger
 * /api/reports/list:
 *   get:
 *     summary: List all available reports
 *     description: Get list of all generated reports with metadata
 *     tags: [Reports]
 *     responses:
 *       200:
 *         description: Reports list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 message: { type: 'string' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     reports:
 *                       type: 'array'
 *                       items:
 *                         type: 'object'
 *                         properties:
 *                           report_id: { type: 'string' }
 *                           filename: { type: 'string' }
 *                           generated_at: { type: 'string' }
 *                           modified_at: { type: 'string' }
 *                           file_size: { type: 'number' }
 *                           download_url: { type: 'string' }
 *                     total: { type: 'number' }
 */
router.get('/reports/list', reportsController.listReportsController);

/**
 * @swagger
 * /api/reports/delete/{reportId}:
 *   delete:
 *     summary: Delete report
 *     description: Delete a specific report and all its associated files
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema: { type: 'string' }
 *         description: Report ID to delete
 *     responses:
 *       200:
 *         description: Report deleted successfully
 *       404:
 *         description: No report files found to delete
 */
router.delete('/api/reports/delete/:reportId', reportsController.deleteReportController);

module.exports = router;

