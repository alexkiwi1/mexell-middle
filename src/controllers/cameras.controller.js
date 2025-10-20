const httpStatus = require('http-status');
const { getCameraList } = require('../services/frigate.service');
const { 
  getCameraSummary, 
  getCameraSummaryById, 
  getCameraActivity, 
  getCameraStatus, 
  getCameraViolations 
} = require('../services/cameras.service');
const logger = require('../config/logger');

/**
 * Get list of all cameras (Phase 1)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const listCameras = async (req, res, next) => {
  try {
    const cameras = await getCameraList();
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Cameras retrieved successfully',
      data: {
        cameras,
        count: cameras.length,
        total_cameras: cameras.length
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in listCameras:', error);
    next(error);
  }
};

/**
 * Get live summaries for all cameras
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getCameraSummaryController = async (req, res, next) => {
  try {
    const { hours, start_date, end_date } = req.query;
    const options = {
      hours: parseInt(hours, 10) || undefined,
      start_date: start_date || undefined,
      end_date: end_date || undefined
    };

    const summaries = await getCameraSummary(options);
    
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Camera summaries retrieved successfully',
      data: {
        summaries,
        count: summaries.length,
        filters: {
          hours: options.hours,
          start_date: options.start_date,
          end_date: options.end_date
        }
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in getCameraSummaryController:', error);
    next(error);
  }
};

/**
 * Get detailed summary for a specific camera
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getCameraSummaryByIdController = async (req, res, next) => {
  try {
    const { camera_name } = req.params;
    const { hours, start_date, end_date } = req.query;
    const options = {
      hours: parseInt(hours, 10) || undefined,
      start_date: start_date || undefined,
      end_date: end_date || undefined
    };

    const summary = await getCameraSummaryById(camera_name, options);
    
    res.status(httpStatus.OK).json({
      success: true,
      message: `Camera summary for ${camera_name} retrieved successfully`,
      data: summary,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error in getCameraSummaryByIdController for ${req.params.camera_name}:`, error);
    next(error);
  }
};

/**
 * Get activity feed for a specific camera
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getCameraActivityController = async (req, res, next) => {
  try {
    const { camera_name } = req.params;
    const { hours = 1, limit = 50 } = req.query;
    const options = {
      hours: parseInt(hours, 10),
      limit: parseInt(limit, 10)
    };

    const activities = await getCameraActivity(camera_name, options);
    
    res.status(httpStatus.OK).json({
      success: true,
      message: `Camera activity for ${camera_name} retrieved successfully`,
      data: {
        activities,
        count: activities.length,
        camera: camera_name,
        filters: {
          hours: options.hours,
          limit: options.limit
        }
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error in getCameraActivityController for ${req.params.camera_name}:`, error);
    next(error);
  }
};

/**
 * Get detailed camera status including health metrics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getCameraStatusController = async (req, res, next) => {
  try {
    const { camera_name } = req.params;

    const status = await getCameraStatus(camera_name);
    
    res.status(httpStatus.OK).json({
      success: true,
      message: `Camera status for ${camera_name} retrieved successfully`,
      data: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error in getCameraStatusController for ${req.params.camera_name}:`, error);
    next(error);
  }
};

/**
 * Get camera-specific violations (cell phone detections)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getCameraViolationsController = async (req, res, next) => {
  try {
    const { camera_name } = req.params;
    const { hours, limit, start_date, end_date } = req.query;
    const options = {
      hours: parseInt(hours, 10) || 24,
      limit: parseInt(limit, 10) || 100,
      start_date: start_date || undefined,
      end_date: end_date || undefined,
    };

    const violations = await getCameraViolations(camera_name, options);
    
    res.status(httpStatus.OK).json({
      success: true,
      message: `Camera violations for ${camera_name} retrieved successfully`,
      data: {
        violations,
        count: violations.length,
        camera: camera_name,
        filters: {
          hours: options.hours,
          limit: options.limit,
          start_date: options.start_date,
          end_date: options.end_date
        }
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error in getCameraViolationsController for ${req.params.camera_name}:`, error);
    next(error);
  }
};

/**
 * Clear camera cache (placeholder for future implementation)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const clearCameraCacheController = async (req, res, next) => {
  try {
    // TODO: Implement cache clearing when MongoDB caching is added
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Camera cache cleared successfully',
      data: {
        cleared: true,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in clearCameraCacheController:', error);
    next(error);
  }
};

module.exports = {
  listCameras,
  getCameraSummaryController,
  getCameraSummaryByIdController,
  getCameraActivityController,
  getCameraStatusController,
  getCameraViolationsController,
  clearCameraCacheController,
};