const httpStatus = require('http-status');
const logger = require('../config/logger');
const employeesService = require('../services/employees.service');

/**
 * Get employee work hours
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getEmployeeWorkHoursController = async (req, res, next) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      hours: req.query.hours ? parseInt(req.query.hours, 10) : 24,
      employee_name: req.query.employee_name,
      camera: req.query.camera
    };

    const workHoursData = await employeesService.getEmployeeWorkHours(filters);

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Employee work hours retrieved successfully',
      data: workHoursData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error in getEmployeeWorkHoursController:`, error);
    next(error);
  }
};

/**
 * Get employee break time
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getEmployeeBreakTimeController = async (req, res, next) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      hours: req.query.hours ? parseInt(req.query.hours, 10) : 24,
      employee_name: req.query.employee_name,
      camera: req.query.camera
    };

    const breakTimeData = await employeesService.getEmployeeBreakTime(filters);

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Employee break time retrieved successfully',
      data: breakTimeData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error in getEmployeeBreakTimeController:`, error);
    next(error);
  }
};

/**
 * Get employee attendance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getEmployeeAttendanceController = async (req, res, next) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      hours: req.query.hours ? parseInt(req.query.hours, 10) : 24,
      employee_name: req.query.employee_name
    };

    const attendanceData = await employeesService.getEmployeeAttendance(filters);

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Employee attendance retrieved successfully',
      data: attendanceData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error in getEmployeeAttendanceController:`, error);
    next(error);
  }
};

/**
 * Get employee activity patterns
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getEmployeeActivityPatternsController = async (req, res, next) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      hours: req.query.hours ? parseInt(req.query.hours, 10) : 24,
      employee_name: req.query.employee_name,
      camera: req.query.camera
    };

    const activityPatternsData = await employeesService.getEmployeeActivityPatterns(filters);

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Employee activity patterns retrieved successfully',
      data: activityPatternsData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error in getEmployeeActivityPatternsController:`, error);
    next(error);
  }
};

module.exports = {
  getEmployeeWorkHoursController,
  getEmployeeBreakTimeController,
  getEmployeeAttendanceController,
  getEmployeeActivityPatternsController
};
