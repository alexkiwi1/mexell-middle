const moment = require('moment-timezone');
const logger = require('../config/logger');

/**
 * Timezone Service - Handle timezone conversions and utilities
 * 
 * Features:
 * - Convert timestamps to different timezones
 * - Validate timezone strings
 * - Get timezone offset information
 * - Format dates in specific timezones
 */

// Common timezones for easy reference
const COMMON_TIMEZONES = {
  'UTC': 'UTC',
  'EST': 'America/New_York',
  'PST': 'America/Los_Angeles',
  'CST': 'America/Chicago',
  'MST': 'America/Denver',
  'IST': 'Asia/Kolkata',
  'PKT': 'Asia/Karachi',
  'GMT': 'Europe/London',
  'CET': 'Europe/Paris',
  'JST': 'Asia/Tokyo',
  'AEST': 'Australia/Sydney',
  'KST': 'Asia/Seoul',
  'HKT': 'Asia/Hong_Kong',
  'SGT': 'Asia/Singapore',
  'UAE': 'Asia/Dubai'
};

/**
 * Validate if a timezone string is valid
 * @param {string} timezone - Timezone string to validate
 * @returns {boolean} - True if valid timezone
 */
const isValidTimezone = (timezone) => {
  if (!timezone) return false;
  
  // Check if it's a common timezone abbreviation
  if (COMMON_TIMEZONES[timezone.toUpperCase()]) {
    return true;
  }
  
  // Check if it's a valid IANA timezone
  try {
    return moment.tz.zone(timezone) !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Get the full IANA timezone name from abbreviation
 * @param {string} timezone - Timezone string (abbreviation or IANA name)
 * @returns {string} - Full IANA timezone name
 */
const getTimezoneName = (timezone) => {
  if (!timezone) return 'UTC';
  
  const upperTimezone = timezone.toUpperCase();
  return COMMON_TIMEZONES[upperTimezone] || timezone;
};

/**
 * Convert Unix timestamp to timezone-specific date string
 * @param {number} timestamp - Unix timestamp
 * @param {string} timezone - Target timezone
 * @param {string} format - Moment.js format string
 * @returns {string} - Formatted date string in target timezone
 */
const convertTimestamp = (timestamp, timezone = 'UTC', format = 'YYYY-MM-DD HH:mm:ss') => {
  try {
    const tz = getTimezoneName(timezone);
    return moment.unix(timestamp).tz(tz).format(format);
  } catch (error) {
    logger.error(`Error converting timestamp ${timestamp} to timezone ${timezone}:`, error);
    return moment.unix(timestamp).utc().format(format);
  }
};

/**
 * Convert Unix timestamp to ISO string in specific timezone
 * @param {number} timestamp - Unix timestamp
 * @param {string} timezone - Target timezone
 * @returns {string} - ISO string in target timezone
 */
const convertToISO = (timestamp, timezone = 'UTC') => {
  try {
    const tz = getTimezoneName(timezone);
    const momentObj = moment.unix(timestamp).tz(tz);
    // Return the time in the target timezone, not UTC
    return momentObj.format('YYYY-MM-DDTHH:mm:ss.SSS') + momentObj.format('Z');
  } catch (error) {
    logger.error(`Error converting timestamp ${timestamp} to ISO in timezone ${timezone}:`, error);
    return moment.unix(timestamp).utc().toISOString();
  }
};

/**
 * Convert Unix timestamp to readable date string in timezone
 * @param {number} timestamp - Unix timestamp
 * @param {string} timezone - Target timezone
 * @returns {string} - Readable date string
 */
const convertToReadable = (timestamp, timezone = 'UTC') => {
  try {
    const tz = getTimezoneName(timezone);
    return moment.unix(timestamp).tz(tz).format('MMM DD, YYYY HH:mm:ss');
  } catch (error) {
    logger.error(`Error converting timestamp ${timestamp} to readable format in timezone ${timezone}:`, error);
    return moment.unix(timestamp).utc().format('MMM DD, YYYY HH:mm:ss');
  }
};

/**
 * Get timezone offset information
 * @param {string} timezone - Target timezone
 * @returns {Object} - Timezone offset information
 */
const getTimezoneInfo = (timezone = 'UTC') => {
  try {
    const tz = getTimezoneName(timezone);
    const now = moment().tz(tz);
    
    return {
      timezone: tz,
      offset: now.format('Z'),
      offsetMinutes: now.utcOffset(),
      isDST: now.isDST(),
      currentTime: now.format('YYYY-MM-DD HH:mm:ss'),
      abbreviation: now.format('z')
    };
  } catch (error) {
    logger.error(`Error getting timezone info for ${timezone}:`, error);
    return {
      timezone: 'UTC',
      offset: '+00:00',
      offsetMinutes: 0,
      isDST: false,
      currentTime: moment().utc().format('YYYY-MM-DD HH:mm:ss'),
      abbreviation: 'UTC'
    };
  }
};

/**
 * Convert date range to timezone-specific timestamps
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @param {string} timezone - Target timezone
 * @returns {Object} - Object with startTime and endTime Unix timestamps
 */
const convertDateRange = (startDate, endDate, timezone = 'UTC') => {
  try {
    const tz = getTimezoneName(timezone);
    
    const startMoment = moment.tz(startDate, tz);
    const endMoment = moment.tz(endDate, tz);
    
    return {
      startTime: startMoment.unix(),
      endTime: endMoment.unix(),
      timezone: tz,
      startISO: startMoment.toISOString(),
      endISO: endMoment.toISOString()
    };
  } catch (error) {
    logger.error(`Error converting date range ${startDate} to ${endDate} in timezone ${timezone}:`, error);
    // Fallback to UTC
    const startMoment = moment.utc(startDate);
    const endMoment = moment.utc(endDate);
    return {
      startTime: startMoment.unix(),
      endTime: endMoment.unix(),
      timezone: 'UTC',
      startISO: startMoment.toISOString(),
      endISO: endMoment.toISOString()
    };
  }
};

/**
 * Get list of common timezones
 * @returns {Array} - Array of timezone objects
 */
const getCommonTimezones = () => {
  return Object.entries(COMMON_TIMEZONES).map(([abbrev, iana]) => ({
    abbreviation: abbrev,
    iana: iana,
    name: iana.replace('_', ' '),
    offset: moment.tz(iana).format('Z'),
    currentTime: moment.tz(iana).format('YYYY-MM-DD HH:mm:ss')
  }));
};

/**
 * Process employee data with timezone conversion
 * @param {Object} employee - Employee data object
 * @param {string} timezone - Target timezone
 * @returns {Object} - Employee data with timezone-converted timestamps
 */
const processEmployeeTimezone = (employee, timezone = 'UTC') => {
  try {
    const tz = getTimezoneName(timezone);
    
    return {
      ...employee,
      arrival_time: employee.arrival_time ? convertToISO(employee.arrival_time, tz) : null,
      departure_time: employee.departure_time ? convertToISO(employee.departure_time, tz) : null,
      first_seen: employee.first_seen ? convertToISO(employee.first_seen, tz) : null,
      last_seen: employee.last_seen ? convertToISO(employee.last_seen, tz) : null,
      sessions: employee.sessions ? employee.sessions.map(session => ({
        ...session,
        first_seen: convertToISO(session.first_seen, tz),
        last_seen: convertToISO(session.last_seen, tz)
      })) : [],
      timezone_info: getTimezoneInfo(tz)
    };
  } catch (error) {
    logger.error(`Error processing employee timezone for ${employee.employee_name}:`, error);
    return employee;
  }
};

/**
 * Process break sessions with timezone conversion
 * @param {Array} breakSessions - Array of break session objects
 * @param {string} timezone - Target timezone
 * @returns {Array} - Break sessions with timezone-converted timestamps
 */
const processBreakSessionsTimezone = (breakSessions, timezone = 'UTC') => {
  try {
    const tz = getTimezoneName(timezone);
    
    return breakSessions.map(session => ({
      ...session,
      break_start: convertToISO(session.break_start, tz),
      break_end: convertToISO(session.break_end, tz),
      previous_session: {
        ...session.previous_session,
        ended_at: convertToISO(session.previous_session.ended_at, tz)
      },
      next_session: {
        ...session.next_session,
        started_at: convertToISO(session.next_session.started_at, tz)
      }
    }));
  } catch (error) {
    logger.error(`Error processing break sessions timezone:`, error);
    return breakSessions;
  }
};

module.exports = {
  isValidTimezone,
  getTimezoneName,
  convertTimestamp,
  convertToISO,
  convertToReadable,
  getTimezoneInfo,
  convertDateRange,
  getCommonTimezones,
  processEmployeeTimezone,
  processBreakSessionsTimezone
};
