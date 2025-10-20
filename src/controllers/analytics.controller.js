const httpStatus = require('http-status');
const logger = require('../config/logger');
const analyticsService = require('../services/analytics.service');

/**
 * Get comprehensive dashboard data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getDashboardDataController = async (req, res, next) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      hours: req.query.hours ? parseInt(req.query.hours, 10) : 24,
      camera: req.query.camera
    };

    const dashboardData = await analyticsService.getDashboardData(filters);

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: dashboardData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error in getDashboardDataController:`, error);
    next(error);
  }
};

/**
 * Get trend analysis data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getTrendAnalysisController = async (req, res, next) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      hours: req.query.hours ? parseInt(req.query.hours, 10) : 24,
      camera: req.query.camera,
      metric: req.query.metric || 'activity',
      granularity: req.query.granularity || 'hourly'
    };

    const trendData = await analyticsService.getTrendAnalysis(filters);

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Trend analysis retrieved successfully',
      data: trendData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error in getTrendAnalysisController:`, error);
    next(error);
  }
};

/**
 * Get performance metrics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getPerformanceMetricsController = async (req, res, next) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      hours: req.query.hours ? parseInt(req.query.hours, 10) : 24,
      camera: req.query.camera,
      employee_name: req.query.employee_name
    };

    const performanceData = await analyticsService.getPerformanceMetrics(filters);

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Performance metrics retrieved successfully',
      data: performanceData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error in getPerformanceMetricsController:`, error);
    next(error);
  }
};

/**
 * Get predictive analytics data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getPredictiveAnalyticsController = async (req, res, next) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      hours: req.query.hours ? parseInt(req.query.hours, 10) : 24,
      camera: req.query.camera,
      prediction_type: req.query.prediction_type || 'violations'
    };

    const predictiveData = await analyticsService.getPredictiveAnalytics(filters);

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Predictive analytics retrieved successfully',
      data: predictiveData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error in getPredictiveAnalyticsController:`, error);
    next(error);
  }
};

/**
 * Get custom report data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getCustomReportController = async (req, res, next) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      hours: req.query.hours ? parseInt(req.query.hours, 10) : 24,
      camera: req.query.camera,
      employee_name: req.query.employee_name,
      report_type: req.query.report_type || 'comprehensive',
      include_charts: req.query.include_charts === 'true'
    };

    const reportData = await analyticsService.getCustomReport(filters);

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Custom report generated successfully',
      data: reportData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error in getCustomReportController:`, error);
    next(error);
  }
};

module.exports = {
  getDashboardDataController,
  getTrendAnalysisController,
  getPerformanceMetricsController,
  getPredictiveAnalyticsController,
  getCustomReportController
};
