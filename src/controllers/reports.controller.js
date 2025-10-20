const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { 
  generateEmployeeReport, 
  generateViolationReport, 
  generateComprehensiveReport,
  REPORT_TYPES,
  REPORT_FORMATS
} = require('../services/reports.service');
const { getReport, updateReportDownloadCount, listReports, deleteReport } = require('../config/database');

/**
 * Generate comprehensive employee report with downloadable URLs
 */
const generateEmployeeReportController = catchAsync(async (req, res) => {
  const filters = {
    start_date: req.query.start_date,
    end_date: req.query.end_date,
    hours: req.query.hours ? parseInt(req.query.hours) : undefined,
    employee_name: req.query.employee_name,
    camera: req.query.camera,
    timezone: req.query.timezone || 'UTC',
    format: req.query.format || 'json',
    include_media: req.query.include_media !== 'false',
    include_breakdown: req.query.include_breakdown !== 'false'
  };

  const result = await generateEmployeeReport(filters);
  
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Employee report generated successfully',
    data: result.data
  });
});

/**
 * Generate violation report with media URLs
 */
const generateViolationReportController = catchAsync(async (req, res) => {
  const filters = {
    start_date: req.query.start_date,
    end_date: req.query.end_date,
    hours: req.query.hours ? parseInt(req.query.hours) : undefined,
    employee_name: req.query.employee_name,
    camera: req.query.camera,
    timezone: req.query.timezone || 'UTC',
    format: req.query.format || 'json',
    severity: req.query.severity,
    include_media: req.query.include_media !== 'false'
  };

  const result = await generateViolationReport(filters);
  
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Violation report generated successfully',
    data: result.data
  });
});

/**
 * Generate comprehensive dashboard report
 */
const generateComprehensiveReportController = catchAsync(async (req, res) => {
  const filters = {
    start_date: req.query.start_date,
    end_date: req.query.end_date,
    hours: req.query.hours ? parseInt(req.query.hours) : undefined,
    timezone: req.query.timezone || 'UTC',
    format: req.query.format || 'json',
    include_media: req.query.include_media !== 'false'
  };

  const result = await generateComprehensiveReport(filters);
  
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Comprehensive report generated successfully',
    data: result.data
  });
});

/**
 * Get available report types
 */
const getReportTypesController = catchAsync(async (req, res) => {
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Report types retrieved successfully',
    data: {
      report_types: Object.values(REPORT_TYPES),
      report_formats: Object.values(REPORT_FORMATS),
      descriptions: {
        employee_summary: 'Detailed employee work hours, productivity, and attendance report',
        violation_report: 'Cell phone violations with media URLs and analysis',
        attendance_report: 'Employee attendance patterns and statistics',
        productivity_report: 'Productivity metrics and performance analysis',
        comprehensive_dashboard: 'Complete dashboard with all metrics and insights',
        custom_report: 'Custom report based on specific criteria'
      }
    }
  });
});

/**
 * Download report file
 */
const downloadReportController = catchAsync(async (req, res) => {
  const { filename } = req.params;
  const fs = require('fs');
  const path = require('path');
  
  // Extract report ID from filename
  const reportId = filename.replace(/\.[^/.]+$/, '');
  
  // Check if report exists in database
  const report = await getReport(reportId);
  if (!report) {
    return res.status(httpStatus.NOT_FOUND).send({
      success: false,
      message: 'Report not found or expired'
    });
  }
  
  // Check if report has expired
  if (new Date(report.expires_at) < new Date()) {
    return res.status(httpStatus.NOT_FOUND).send({
      success: false,
      message: 'Report has expired'
    });
  }
  
  const reportsDir = path.join(__dirname, '../../reports');
  const filePath = path.join(reportsDir, filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(httpStatus.NOT_FOUND).send({
      success: false,
      message: 'Report file not found'
    });
  }
  
  // Update download count
  await updateReportDownloadCount(reportId);
  
  // Set appropriate headers
  const ext = path.extname(filename).toLowerCase();
  let contentType = 'application/octet-stream';
  
  switch (ext) {
    case '.json':
      contentType = 'application/json';
      break;
    case '.csv':
      contentType = 'text/csv';
      break;
    case '.pdf':
      contentType = 'application/pdf';
      break;
    case '.xlsx':
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      break;
  }
  
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
  // Stream the file
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

/**
 * Get report metadata
 */
const getReportMetadataController = catchAsync(async (req, res) => {
  const { reportId } = req.params;
  
  const report = await getReport(reportId);
  if (!report) {
    return res.status(httpStatus.NOT_FOUND).send({
      success: false,
      message: 'Report not found'
    });
  }
  
  res.status(httpStatus.OK).send({
    success: true,
    message: 'Report metadata retrieved successfully',
    data: {
      report_id: report.report_id,
      report_type: report.report_type,
      generated_at: report.generated_at,
      expires_at: report.expires_at,
      timezone: report.timezone,
      filters: report.filters,
      summary: report.summary,
      file_size: report.file_size,
      download_count: report.download_count,
      created_at: report.created_at,
      updated_at: report.updated_at
    }
  });
});

/**
 * List all available reports
 */
const listReportsController = catchAsync(async (req, res) => {
  const { limit = 50, offset = 0 } = req.query;
  
  try {
    const reports = await listReports(parseInt(limit), parseInt(offset));
    
    const formattedReports = reports.map(report => ({
      report_id: report.report_id,
      report_type: report.report_type,
      generated_at: report.generated_at,
      expires_at: report.expires_at,
      timezone: report.timezone,
      file_size: report.file_size,
      download_count: report.download_count,
      download_url: `/api/reports/download/${report.report_id}.json`
    }));
    
    res.status(httpStatus.OK).send({
      success: true,
      message: 'Reports list retrieved successfully',
      data: {
        reports: formattedReports,
        total: formattedReports.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      success: false,
      message: 'Error listing reports'
    });
  }
});

/**
 * Delete report
 */
const deleteReportController = catchAsync(async (req, res) => {
  const { reportId } = req.params;
  const fs = require('fs');
  const path = require('path');
  
  // Delete from database
  const deleted = await deleteReport(reportId);
  if (!deleted) {
    return res.status(httpStatus.NOT_FOUND).send({
      success: false,
      message: 'Report not found in database'
    });
  }
  
  // Delete files
  const reportsDir = path.join(__dirname, '../../reports');
  const files = [
    `${reportId}.json`,
    `${reportId}.csv`,
    `${reportId}.pdf`,
    `${reportId}.xlsx`
  ];
  
  let deletedCount = 0;
  const errors = [];
  
  files.forEach(filename => {
    const filePath = path.join(reportsDir, filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        deletedCount++;
      } catch (error) {
        errors.push(`Failed to delete ${filename}: ${error.message}`);
      }
    }
  });
  
  res.status(httpStatus.OK).send({
    success: true,
    message: `Report deleted successfully. ${deletedCount} files removed.`,
    data: {
      deleted_files: deletedCount,
      errors: errors.length > 0 ? errors : undefined
    }
  });
});

module.exports = {
  generateEmployeeReportController,
  generateViolationReportController,
  generateComprehensiveReportController,
  getReportTypesController,
  downloadReportController,
  getReportMetadataController,
  listReportsController,
  deleteReportController
};
