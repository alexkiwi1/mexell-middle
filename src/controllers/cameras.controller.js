const httpStatus = require('http-status');
const { getCameraList } = require('../services/frigate.service');
const { 
  getCameraSummary, 
  getCameraSummaryById, 
  getCameraActivity, 
  getCameraStatus, 
  getCameraViolations 
} = require('../services/cameras.service');
const { 
  getCellPhoneViolations,
  getViolationsSummaryByEmployee,
  getViolationsByEmployee,
  getViolationMedia
} = require('../services/violations.service');
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
 * Get camera-specific violations (cell phone detections) with employee assignment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getCameraViolationsController = async (req, res, next) => {
  try {
    const { camera_name } = req.params;
    const { hours, limit, start_date, end_date } = req.query;
    
    // Parse date/time range
    const { parseDateTimeRange } = require('../services/frigate.service');
    const { startTime, endTime } = parseDateTimeRange({
      hours: parseInt(hours, 10) || 24,
      start_date: start_date || undefined,
      end_date: end_date || undefined
    });

    const filters = {
      camera: camera_name,
      startTime,
      endTime,
      limit: parseInt(limit, 10) || 100
    };

    const violations = await getCellPhoneViolations(filters);
    
    res.status(httpStatus.OK).json({
      success: true,
      message: `Camera violations for ${camera_name} retrieved successfully`,
      data: {
        violations,
        count: violations.length,
        camera: camera_name,
        filters: {
          hours: parseInt(hours, 10) || 24,
          limit: parseInt(limit, 10) || 100,
          start_date: start_date || undefined,
          end_date: end_date || undefined
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
 * Get violations summary by employee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getViolationsSummaryByEmployeeController = async (req, res, next) => {
  try {
    const { hours, start_date, end_date, camera } = req.query;
    
    // Parse date/time range
    const { parseDateTimeRange } = require('../services/frigate.service');
    const { startTime, endTime } = parseDateTimeRange({
      hours: parseInt(hours, 10) || 24,
      start_date: start_date || undefined,
      end_date: end_date || undefined
    });

    const filters = {
      camera: camera || undefined,
      startTime,
      endTime
    };

    const summary = await getViolationsSummaryByEmployee(filters);
    
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Violations summary by employee retrieved successfully',
      data: {
        summary,
        count: summary.length,
        filters: {
          hours: parseInt(hours, 10) || 24,
          start_date: start_date || undefined,
          end_date: end_date || undefined,
          camera: camera || undefined
        }
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in getViolationsSummaryByEmployeeController:', error);
    next(error);
  }
};

/**
 * Get violations for specific employee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getViolationsByEmployeeController = async (req, res, next) => {
  try {
    const { employee_name } = req.params;
    const { hours, start_date, end_date, camera, limit } = req.query;
    
    // Parse date/time range
    const { parseDateTimeRange } = require('../services/frigate.service');
    const { startTime, endTime } = parseDateTimeRange({
      hours: parseInt(hours, 10) || 24,
      start_date: start_date || undefined,
      end_date: end_date || undefined
    });

    const filters = {
      camera: camera || undefined,
      startTime,
      endTime,
      limit: parseInt(limit, 10) || 100
    };

    const violations = await getViolationsByEmployee(employee_name, filters);
    
    res.status(httpStatus.OK).json({
      success: true,
      message: `Violations for employee ${employee_name} retrieved successfully`,
      data: {
        violations,
        count: violations.length,
        employee: employee_name,
        filters: {
          hours: parseInt(hours, 10) || 24,
          start_date: start_date || undefined,
          end_date: end_date || undefined,
          camera: camera || undefined,
          limit: parseInt(limit, 10) || 100
        }
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error in getViolationsByEmployeeController for ${req.params.employee_name}:`, error);
    next(error);
  }
};

/**
 * Get media URLs for a specific violation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getViolationMediaController = async (req, res, next) => {
  try {
    const { violation_id, camera, timestamp } = req.params;
    
    // Convert timestamp to number if it's a string
    const timestampNum = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
    
    if (!violation_id || !camera || !timestampNum) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Missing required parameters: violation_id, camera, and timestamp are required',
        data: null,
        timestamp: new Date().toISOString(),
      });
    }

    const mediaData = await getViolationMedia(violation_id, camera, timestampNum);
    
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Violation media URLs retrieved successfully',
      data: mediaData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error in getViolationMediaController:`, error);
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
  getViolationsSummaryByEmployeeController,
  getViolationsByEmployeeController,
  getViolationMediaController,
  clearCameraCacheController,
};