const mobileService = require('../services/mobile.service');
const logger = require('../config/logger');

/**
 * Mobile Controller - Mobile-optimized API endpoints
 * 
 * Provides lightweight, mobile-friendly endpoints for:
 * - Dashboard data
 * - Violations list
 * - Employee status
 * - Camera status
 * - Notifications
 * - Offline sync
 * - App settings
 */

/**
 * Get mobile dashboard data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMobileDashboardController = async (req, res) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      hours: req.query.hours ? parseInt(req.query.hours) : 24
    };

    const data = await mobileService.getMobileDashboard(filters);

    res.json({
      success: true,
      message: 'Mobile dashboard data retrieved successfully',
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in getMobileDashboardController:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve mobile dashboard data',
      error: error.message
    });
  }
};

/**
 * Get mobile violations list
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMobileViolationsController = async (req, res) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      hours: req.query.hours ? parseInt(req.query.hours) : 24,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    const data = await mobileService.getMobileViolations(filters);

    res.json({
      success: true,
      message: 'Mobile violations data retrieved successfully',
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in getMobileViolationsController:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve mobile violations data',
      error: error.message
    });
  }
};

/**
 * Get mobile employee status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMobileEmployeeStatusController = async (req, res) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      hours: req.query.hours ? parseInt(req.query.hours) : 24
    };

    const data = await mobileService.getMobileEmployeeStatus(filters);

    res.json({
      success: true,
      message: 'Mobile employee status retrieved successfully',
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in getMobileEmployeeStatusController:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve mobile employee status',
      error: error.message
    });
  }
};

/**
 * Get mobile camera status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMobileCameraStatusController = async (req, res) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      hours: req.query.hours ? parseInt(req.query.hours) : 24
    };

    const data = await mobileService.getMobileCameraStatus(filters);

    res.json({
      success: true,
      message: 'Mobile camera status retrieved successfully',
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in getMobileCameraStatusController:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve mobile camera status',
      error: error.message
    });
  }
};

/**
 * Get mobile notifications
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMobileNotificationsController = async (req, res) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      hours: req.query.hours ? parseInt(req.query.hours) : 24,
      limit: req.query.limit ? parseInt(req.query.limit) : 20
    };

    const data = await mobileService.getMobileNotifications(filters);

    res.json({
      success: true,
      message: 'Mobile notifications retrieved successfully',
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in getMobileNotificationsController:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve mobile notifications',
      error: error.message
    });
  }
};

/**
 * Get mobile sync data for offline support
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMobileSyncDataController = async (req, res) => {
  try {
    const filters = {
      last_sync: req.query.last_sync,
      limit: req.query.limit ? parseInt(req.query.limit) : 100
    };

    const data = await mobileService.getMobileSyncData(filters);

    res.json({
      success: true,
      message: 'Mobile sync data retrieved successfully',
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in getMobileSyncDataController:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve mobile sync data',
      error: error.message
    });
  }
};

/**
 * Get mobile app settings
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getMobileSettingsController = async (req, res) => {
  try {
    const data = await mobileService.getMobileSettings();

    res.json({
      success: true,
      message: 'Mobile settings retrieved successfully',
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in getMobileSettingsController:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve mobile settings',
      error: error.message
    });
  }
};

module.exports = {
  getMobileDashboardController,
  getMobileViolationsController,
  getMobileEmployeeStatusController,
  getMobileCameraStatusController,
  getMobileNotificationsController,
  getMobileSyncDataController,
  getMobileSettingsController
};
