const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { 
  getCommonTimezones, 
  getTimezoneInfo, 
  isValidTimezone,
  convertTimestamp,
  convertToReadable
} = require('../services/timezone.service');

/**
 * Get list of common timezones
 */
const getTimezonesController = catchAsync(async (req, res) => {
  const timezones = getCommonTimezones();
  res.status(httpStatus.OK).send({ 
    success: true, 
    message: 'Common timezones retrieved successfully',
    data: { timezones },
    count: timezones.length
  });
});

/**
 * Get timezone information
 */
const getTimezoneInfoController = catchAsync(async (req, res) => {
  const { timezone = 'UTC' } = req.params;
  
  if (!isValidTimezone(timezone)) {
    return res.status(httpStatus.BAD_REQUEST).send({
      success: false,
      message: `Invalid timezone: ${timezone}`,
      data: null
    });
  }
  
  const info = getTimezoneInfo(timezone);
  res.status(httpStatus.OK).send({ 
    success: true, 
    message: `Timezone information for ${timezone}`,
    data: info
  });
});

/**
 * Convert timestamp to timezone
 */
const convertTimestampController = catchAsync(async (req, res) => {
  const { timestamp } = req.params;
  const { timezone = 'UTC', format = 'YYYY-MM-DD HH:mm:ss' } = req.query;
  
  if (!isValidTimezone(timezone)) {
    return res.status(httpStatus.BAD_REQUEST).send({
      success: false,
      message: `Invalid timezone: ${timezone}`,
      data: null
    });
  }
  
  const unixTimestamp = parseInt(timestamp);
  if (isNaN(unixTimestamp)) {
    return res.status(httpStatus.BAD_REQUEST).send({
      success: false,
      message: 'Invalid timestamp. Must be a Unix timestamp.',
      data: null
    });
  }
  
  const converted = convertTimestamp(unixTimestamp, timezone, format);
  const readable = convertToReadable(unixTimestamp, timezone);
  
  res.status(httpStatus.OK).send({ 
    success: true, 
    message: `Timestamp converted to ${timezone}`,
    data: {
      original_timestamp: unixTimestamp,
      timezone: timezone,
      converted: converted,
      readable: readable,
      format: format
    }
  });
});

/**
 * Validate timezone
 */
const validateTimezoneController = catchAsync(async (req, res) => {
  const { timezone } = req.params;
  
  const isValid = isValidTimezone(timezone);
  const info = isValid ? getTimezoneInfo(timezone) : null;
  
  res.status(httpStatus.OK).send({ 
    success: true, 
    message: isValid ? `Timezone ${timezone} is valid` : `Timezone ${timezone} is invalid`,
    data: {
      timezone: timezone,
      valid: isValid,
      info: info
    }
  });
});

module.exports = {
  getTimezonesController,
  getTimezoneInfoController,
  convertTimestampController,
  validateTimezoneController
};

