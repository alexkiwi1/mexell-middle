const httpStatus = require('http-status');
const logger = require('../config/logger');
const zonesService = require('../services/zones.service');

/**
 * Get desk occupancy analysis
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getDeskOccupancyController = async (req, res, next) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      hours: req.query.hours ? parseInt(req.query.hours, 10) : 24,
      camera: req.query.camera,
      zone: req.query.zone
    };

    const occupancyData = await zonesService.getDeskOccupancy(filters);

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Desk occupancy analysis retrieved successfully',
      data: occupancyData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error in getDeskOccupancyController:`, error);
    next(error);
  }
};

/**
 * Get zone utilization analysis
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getZoneUtilizationController = async (req, res, next) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      hours: req.query.hours ? parseInt(req.query.hours, 10) : 24,
      camera: req.query.camera
    };

    const utilizationData = await zonesService.getZoneUtilization(filters);

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Zone utilization analysis retrieved successfully',
      data: utilizationData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error in getZoneUtilizationController:`, error);
    next(error);
  }
};

/**
 * Get employee zone preferences
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getEmployeeZonePreferencesController = async (req, res, next) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      hours: req.query.hours ? parseInt(req.query.hours, 10) : 24,
      employee_name: req.query.employee_name,
      camera: req.query.camera
    };

    const preferencesData = await zonesService.getEmployeeZonePreferences(filters);

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Employee zone preferences retrieved successfully',
      data: preferencesData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error in getEmployeeZonePreferencesController:`, error);
    next(error);
  }
};

/**
 * Get zone activity patterns
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getZoneActivityPatternsController = async (req, res, next) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      hours: req.query.hours ? parseInt(req.query.hours, 10) : 24,
      camera: req.query.camera,
      zone: req.query.zone
    };

    const patternsData = await zonesService.getZoneActivityPatterns(filters);

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Zone activity patterns retrieved successfully',
      data: patternsData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error in getZoneActivityPatternsController:`, error);
    next(error);
  }
};

module.exports = {
  getDeskOccupancyController,
  getZoneUtilizationController,
  getEmployeeZonePreferencesController,
  getZoneActivityPatternsController
};

