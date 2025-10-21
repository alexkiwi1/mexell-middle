const { query } = require('../config/postgres');
const config = require('../config/config');
const logger = require('../config/logger');
const { convertDateRange, isValidTimezone, getTimezoneName } = require('./timezone.service');

/**
 * Convert Unix timestamp to ISO string
 * @param {number} timestamp - Unix timestamp
 * @returns {string} ISO date string
 */
const unixToISO = (timestamp) => {
  return new Date(timestamp * 1000).toISOString();
};

/**
 * Convert ISO date string to Unix timestamp
 * @param {string} isoString - ISO date string
 * @returns {number} Unix timestamp
 */
const isoToUnix = (isoString) => {
  return Math.floor(new Date(isoString).getTime() / 1000);
};

/**
 * Parse date/time parameters and return Unix timestamps
 * @param {Object} params - Parameters object
 * @param {string} [params.start_date] - Start date (ISO string or YYYY-MM-DD)
 * @param {string} [params.end_date] - End date (ISO string or YYYY-MM-DD)
 * @param {string} [params.start_time] - Start time (HH:MM:SS)
 * @param {string} [params.end_time] - End time (HH:MM:SS)
 * @param {number} [params.hours] - Hours to look back (fallback)
 * @param {string} [params.timezone] - Timezone for date conversion (default: 'UTC')
 * @returns {Object} Object with startTime and endTime Unix timestamps
 */
const parseDateTimeRange = (params = {}) => {
  const now = getCurrentUnixTime();
  let timezone = params.timezone || 'UTC';
  let startTime, endTime;

  // Log input parameters for debugging
  logger.debug(`parseDateTimeRange called with:`, {
    start_date: params.start_date,
    end_date: params.end_date,
    hours: params.hours,
    timezone: params.timezone
  });

  // Validate timezone
  if (!isValidTimezone(timezone)) {
    logger.warn(`Invalid timezone: ${timezone}, falling back to UTC`);
    timezone = 'UTC';
  }

  if (params.start_date || params.end_date) {
    // Use specific date range with timezone conversion
    if (params.start_date && params.end_date) {
      // Both dates provided - check if it's a single-day query with date-only format
      let processedStartDate = params.start_date;
      let processedEndDate = params.end_date;
      
      // Detect single-day query with date-only format (no 'T' character)
      if (params.start_date === params.end_date && !params.start_date.includes('T')) {
        logger.info(`Single-day query detected: ${params.start_date}, expanding to full day range`);
        // Expand to full day range: start at 00:00:00, end at 23:59:59.999
        processedStartDate = `${params.start_date}T00:00:00`;
        processedEndDate = `${params.end_date}T23:59:59.999`;
        logger.debug(`Expanded single-day query: start=${processedStartDate}, end=${processedEndDate}`);
      }
      
      // Use timezone-aware conversion
      const dateRange = convertDateRange(processedStartDate, processedEndDate, timezone);
      startTime = dateRange.startTime;
      endTime = dateRange.endTime;
      
      logger.debug(`Date range conversion: startTime=${startTime}, endTime=${endTime}, timezone=${timezone}`);
    } else if (params.start_date) {
      // Only start date provided
      const startDate = params.start_date.includes('T') ? params.start_date : `${params.start_date}T00:00:00`;
      const dateRange = convertDateRange(startDate, startDate, timezone);
      startTime = dateRange.startTime;
      endTime = now; // Default to now if no end date
    } else if (params.end_date) {
      // Only end date provided
      const endDate = params.end_date.includes('T') ? params.end_date : `${params.end_date}T23:59:59`;
      const dateRange = convertDateRange(endDate, endDate, timezone);
      startTime = now - (24 * 3600); // Default to 24 hours ago if no start date
      endTime = dateRange.endTime;
    }
  } else if (params.hours) {
    // Use hours lookback (existing behavior)
    startTime = now - (params.hours * 3600);
    endTime = now;
  } else {
    // Default to 24 hours
    startTime = now - (24 * 3600);
    endTime = now;
  }

  // Log final converted timestamps for debugging
  logger.debug(`parseDateTimeRange result:`, {
    startTime,
    endTime,
    startTimeISO: new Date(startTime * 1000).toISOString(),
    endTimeISO: new Date(endTime * 1000).toISOString(),
    duration_hours: (endTime - startTime) / 3600
  });

  return { startTime, endTime };
};

/**
 * Convert Unix timestamp to readable date string
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Readable date string
 */
const unixToReadable = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString();
};

/**
 * Get current Unix timestamp
 * @returns {number} Current Unix timestamp
 */
const getCurrentUnixTime = () => {
  return Math.floor(Date.now() / 1000);
};

/**
 * Get cameras from recordings table
 * @returns {Promise<Array>} List of unique cameras
 */
const getCameraList = async () => {
  try {
    const result = await query(`
      SELECT DISTINCT camera 
      FROM recordings 
      ORDER BY camera
    `);
    return result.map(row => row.camera);
  } catch (error) {
    logger.error('Error getting camera list', { error: error.message });
    throw error;
  }
};

/**
 * Get timeline events with filters
 * @param {Object} filters - Filter options
 * @param {string} filters.camera - Camera name filter
 * @param {number} filters.startTime - Start timestamp filter
 * @param {number} filters.endTime - End timestamp filter
 * @param {string} filters.label - Label filter (e.g., 'person', 'cell phone')
 * @param {string} filters.classType - Class type filter
 * @param {number} filters.limit - Limit number of results
 * @returns {Promise<Array>} Timeline events
 */
const getTimelineEvents = async (filters = {}) => {
  try {
    let whereConditions = [];
    let params = [];
    let paramCount = 0;

    if (filters.camera) {
      paramCount++;
      whereConditions.push(`camera = $${paramCount}`);
      params.push(filters.camera);
    }

    if (filters.startTime) {
      paramCount++;
      whereConditions.push(`timestamp >= $${paramCount}`);
      params.push(filters.startTime);
    }

    if (filters.endTime) {
      paramCount++;
      whereConditions.push(`timestamp <= $${paramCount}`);
      params.push(filters.endTime);
    }

    if (filters.label) {
      paramCount++;
      whereConditions.push(`data->>'label' = $${paramCount}`);
      params.push(filters.label);
    }

    if (filters.classType) {
      paramCount++;
      whereConditions.push(`class_type = $${paramCount}`);
      params.push(filters.classType);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const limitClause = filters.limit ? `LIMIT ${filters.limit}` : 'LIMIT 100';

    const sql = `
      SELECT 
        timestamp,
        camera,
        source,
        source_id,
        class_type,
        data
      FROM timeline
      ${whereClause}
      ORDER BY timestamp DESC
      ${limitClause}
    `;

    const result = await query(sql, params);
    return result.rows;
  } catch (error) {
    logger.error('Error getting timeline events', { error: error.message, filters });
    throw error;
  }
};

/**
 * Get recordings with filters
 * @param {Object} filters - Filter options
 * @param {string} filters.camera - Camera name filter
 * @param {number} filters.startTime - Start timestamp filter
 * @param {number} filters.endTime - End timestamp filter
 * @param {number} filters.limit - Limit number of results
 * @returns {Promise<Array>} Recordings
 */
const getRecordings = async (filters = {}) => {
  try {
    let whereConditions = [];
    let params = [];
    let paramCount = 0;

    if (filters.camera) {
      paramCount++;
      whereConditions.push(`camera = $${paramCount}`);
      params.push(filters.camera);
    }

    if (filters.startTime) {
      paramCount++;
      whereConditions.push(`start_time >= $${paramCount}`);
      params.push(filters.startTime);
    }

    if (filters.endTime) {
      paramCount++;
      whereConditions.push(`end_time <= $${paramCount}`);
      params.push(filters.endTime);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const limitClause = filters.limit ? `LIMIT ${filters.limit}` : 'LIMIT 100';

    const sql = `
      SELECT 
        id,
        camera,
        path,
        start_time,
        end_time,
        duration,
        objects,
        motion,
        segment_size
      FROM recordings
      ${whereClause}
      ORDER BY start_time DESC
      ${limitClause}
    `;

    const result = await query(sql, params);
    return result.rows;
  } catch (error) {
    logger.error('Error getting recordings', { error: error.message, filters });
    throw error;
  }
};

/**
 * Get events with filters
 * @param {Object} filters - Filter options
 * @param {string} filters.camera - Camera name filter
 * @param {number} filters.startTime - Start timestamp filter
 * @param {number} filters.endTime - End timestamp filter
 * @param {string} filters.label - Label filter
 * @param {string} filters.subLabel - Sub label filter (employee name)
 * @param {number} filters.limit - Limit number of results
 * @returns {Promise<Array>} Events
 */
const getEvents = async (filters = {}) => {
  try {
    let whereConditions = [];
    let params = [];
    let paramCount = 0;

    if (filters.camera) {
      paramCount++;
      whereConditions.push(`camera = $${paramCount}`);
      params.push(filters.camera);
    }

    if (filters.startTime) {
      paramCount++;
      whereConditions.push(`start_time >= $${paramCount}`);
      params.push(filters.startTime);
    }

    if (filters.endTime) {
      paramCount++;
      whereConditions.push(`end_time <= $${paramCount}`);
      params.push(filters.endTime);
    }

    if (filters.label) {
      paramCount++;
      whereConditions.push(`label = $${paramCount}`);
      params.push(filters.label);
    }

    if (filters.subLabel) {
      paramCount++;
      whereConditions.push(`sub_label = $${paramCount}`);
      params.push(filters.subLabel);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const limitClause = filters.limit ? `LIMIT ${filters.limit}` : 'LIMIT 100';

    const sql = `
      SELECT 
        id,
        label,
        camera,
        start_time,
        end_time,
        top_score,
        zones,
        thumbnail,
        has_clip,
        has_snapshot,
        sub_label,
        score,
        data
      FROM event
      ${whereClause}
      ORDER BY start_time DESC
      ${limitClause}
    `;

    const result = await query(sql, params);
    return result.rows;
  } catch (error) {
    logger.error('Error getting events', { error: error.message, filters });
    throw error;
  }
};

/**
 * Generate media URL from path
 * @param {string} path - File path from database
 * @returns {string} Full media URL
 */
const generateMediaURL = (path) => {
  if (!path) return null;
  // Remove /media/frigate/ prefix if present
  const cleanPath = path.replace(/^\/media\/frigate\//, '');
  return `${config.frigate.videoServerUrl}/${cleanPath}`;
};

/**
 * Get recent recordings with media URLs
 * @param {Object} options - Options
 * @param {string} options.camera - Camera filter
 * @param {number} options.limit - Limit results
 * @param {number} options.hours - Hours to look back (fallback)
 * @param {string} options.start_date - Start date (ISO string or YYYY-MM-DD)
 * @param {string} options.end_date - End date (ISO string or YYYY-MM-DD)
 * @returns {Promise<Array>} Recent recordings with URLs
 */
const getRecentRecordings = async (options = {}) => {
  try {
    const { camera, limit = 50 } = options;
    const { startTime, endTime } = parseDateTimeRange(options);

    const filters = {
      startTime,
      endTime,
      limit,
      ...(camera && { camera })
    };

    const recordings = await getRecordings(filters);
    
    return recordings.map(recording => ({
      ...recording,
      video_url: generateMediaURL(recording.path),
      start_time_iso: unixToISO(recording.start_time),
      end_time_iso: unixToISO(recording.end_time),
      duration_readable: `${Math.round(recording.duration)}s`
    }));
  } catch (error) {
    logger.error('Error getting recent recordings', { error: error.message, options });
    throw error;
  }
};

/**
 * Get recording at specific timestamp with time window
 * @param {Object} options - Options
 * @param {string} options.camera - Camera name
 * @param {number} options.timestamp - Unix timestamp
 * @param {number} options.window - Time window in seconds (default: 2)
 * @returns {Promise<Object>} Recording with video URL and time window
 */
const getRecordingAtTimestamp = async (options = {}) => {
  try {
    const { camera, timestamp, window = 2 } = options;

    if (!camera || !timestamp) {
      throw new Error('Camera and timestamp are required');
    }

    // Validate timestamp
    const timestampNum = typeof timestamp === 'string' ? parseFloat(timestamp) : timestamp;
    if (isNaN(timestampNum) || timestampNum <= 0) {
      throw new Error('Invalid timestamp format');
    }

    // Query for recording containing the timestamp
    const sql = `
      SELECT id, camera, path, start_time, end_time, duration
      FROM recordings
      WHERE camera = $1 
        AND start_time <= $2 
        AND end_time >= $2
      LIMIT 1
    `;

    const result = await query(sql, [camera, timestampNum]);
    
    if (result.length === 0) {
      return {
        found: false,
        message: `No recording found for camera '${camera}' at timestamp ${timestampNum}`,
        suggestions: [
          'Check if the camera name is correct',
          'Verify the timestamp is within recording range',
          'Try a different time window'
        ]
      };
    }

    const recording = result[0];
    const startTime = recording.start_time;
    const endTime = recording.end_time;
    const duration = recording.duration;

    // Calculate offset within the recording
    const offset = timestampNum - startTime;
    
    // Calculate time window (2 seconds before and after by default)
    const startWindow = Math.max(0, offset - window);
    const endWindow = Math.min(duration, offset + window);

    // Generate video URL with time fragment
    const videoUrl = `${generateMediaURL(recording.path)}#t=${startWindow.toFixed(1)},${endWindow.toFixed(1)}`;

    return {
      found: true,
      recording_id: recording.id,
      camera: recording.camera,
      path: recording.path,
      video_url: videoUrl,
      exact_timestamp: timestampNum,
      recording_start: startTime,
      recording_end: endTime,
      recording_duration: duration,
      offset_in_recording: offset,
      time_window: {
        start_seconds: startWindow,
        end_seconds: endWindow,
        duration_seconds: endWindow - startWindow,
        start_timestamp: startTime + startWindow,
        end_timestamp: startTime + endWindow
      },
      playback_info: {
        event_at_seconds: offset,
        window_seconds: window,
        total_clip_duration: endWindow - startWindow
      }
    };

  } catch (error) {
    logger.error('Error getting recording at timestamp', { 
      error: error.message, 
      camera: options.camera, 
      timestamp: options.timestamp 
    });
    throw error;
  }
};

module.exports = {
  unixToISO,
  unixToReadable,
  isoToUnix,
  parseDateTimeRange,
  getCurrentUnixTime,
  getCameraList,
  getTimelineEvents,
  getRecordings,
  getEvents,
  generateMediaURL,
  getRecentRecordings,
  getRecordingAtTimestamp,
};
