const httpStatus = require('http-status');
const { query } = require('../config/postgres');
const { generateMediaURL, getRecordingAtTimestamp, parseDateTimeRange, isoToUnix } = require('../services/frigate.service');
const logger = require('../config/logger');

/**
 * Get recent clips from reviewsegment table
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getRecentClips = async (req, res, next) => {
  try {
    const { camera, limit = 50 } = req.query;
    
    let whereConditions = [];
    let params = [];
    let paramCount = 0;

    if (camera) {
      paramCount++;
      whereConditions.push(`camera = $${paramCount}`);
      params.push(camera);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    const limitClause = `LIMIT ${parseInt(limit, 10)}`;

    const sql = `
      SELECT 
        id,
        camera,
        start_time,
        end_time,
        severity,
        thumb_path,
        data
      FROM reviewsegment
      ${whereClause}
      ORDER BY start_time DESC
      ${limitClause}
    `;

    const result = await query(sql, params);
    
    const clips = result.map(clip => ({
      ...clip,
      thumbnail_url: generateMediaURL(clip.thumb_path),
      start_time_iso: new Date(clip.start_time * 1000).toISOString(),
      end_time_iso: clip.end_time ? new Date(clip.end_time * 1000).toISOString() : null,
      duration: clip.end_time ? clip.end_time - clip.start_time : null,
      duration_readable: clip.end_time ? `${Math.round(clip.end_time - clip.start_time)}s` : null
    }));
    
    res.json({
      success: true,
      message: 'Recent clips retrieved successfully',
      data: {
        clips,
        count: clips.length,
        filters: {
          camera: camera || 'all',
          limit: parseInt(limit, 10)
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting recent clips', { error: error.message, query: req.query });
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve recent clips',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Test media URL accessibility
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const testMediaUrls = async (req, res, next) => {
  try {
    const { clip_id, recording_id } = req.query;
    
    const results = {
      video_server_url: process.env.VIDEO_SERVER_URL || 'http://10.0.20.6:8000',
      tests: []
    };

    // Test specific clip if provided
    if (clip_id) {
      try {
        const clipResult = await query('SELECT id, camera, thumb_path FROM reviewsegment WHERE id = $1', [clip_id]);
        if (clipResult.length > 0) {
          const clip = clipResult[0];
          const thumbnailUrl = generateMediaURL(clip.thumb_path);
          results.tests.push({
            type: 'clip',
            id: clip_id,
            camera: clip.camera,
            thumbnail_url: thumbnailUrl,
            status: 'found'
          });
        } else {
          results.tests.push({
            type: 'clip',
            id: clip_id,
            status: 'not_found'
          });
        }
      } catch (error) {
        results.tests.push({
          type: 'clip',
          id: clip_id,
          status: 'error',
          error: error.message
        });
      }
    }

    // Test specific recording if provided
    if (recording_id) {
      try {
        const recordingResult = await query('SELECT id, camera, path FROM recordings WHERE id = $1', [recording_id]);
        if (recordingResult.length > 0) {
          const recording = recordingResult[0];
          const videoUrl = generateMediaURL(recording.path);
          results.tests.push({
            type: 'recording',
            id: recording_id,
            camera: recording.camera,
            video_url: videoUrl,
            status: 'found'
          });
        } else {
          results.tests.push({
            type: 'recording',
            id: recording_id,
            status: 'not_found'
          });
        }
      } catch (error) {
        results.tests.push({
          type: 'recording',
          id: recording_id,
          status: 'error',
          error: error.message
        });
      }
    }

    // If no specific IDs provided, test with recent data
    if (!clip_id && !recording_id) {
      try {
        // Test recent clip
        const recentClip = await query('SELECT id, camera, thumb_path FROM reviewsegment ORDER BY start_time DESC LIMIT 1');
        if (recentClip.length > 0) {
          const clip = recentClip[0];
          const thumbnailUrl = generateMediaURL(clip.thumb_path);
          results.tests.push({
            type: 'recent_clip',
            id: clip.id,
            camera: clip.camera,
            thumbnail_url: thumbnailUrl,
            status: 'found'
          });
        }

        // Test recent recording
        const recentRecording = await query('SELECT id, camera, path FROM recordings ORDER BY start_time DESC LIMIT 1');
        if (recentRecording.length > 0) {
          const recording = recentRecording[0];
          const videoUrl = generateMediaURL(recording.path);
          results.tests.push({
            type: 'recent_recording',
            id: recording.id,
            camera: recording.camera,
            video_url: videoUrl,
            status: 'found'
          });
        }
      } catch (error) {
        results.tests.push({
          type: 'recent_data',
          status: 'error',
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Media URL test completed',
      data: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error testing media URLs', { error: error.message, query: req.query });
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to test media URLs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get recording at specific timestamp
 * Supports multiple date/time formats: Unix timestamp, ISO dates, date+time, timezone
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const getRecordingAtTimestampController = async (req, res, next) => {
  try {
    const { camera, timestamp, start_date, end_date, start_time, end_time, hours, timezone, window } = req.query;

    // Validate required parameters
    if (!camera) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Camera parameter is required',
        error: 'Missing required parameter: camera'
      });
    }

    // Determine timestamp from various input formats
    let calculatedTimestamp;
    let inputMethod;
    let inputParams = {};

    if (timestamp) {
      // Priority 1: Direct timestamp (Unix or ISO string)
      if (timestamp.includes('T') || timestamp.includes('-')) {
        // ISO date string format
        try {
          calculatedTimestamp = isoToUnix(timestamp);
          inputMethod = 'iso_string';
          inputParams = { timestamp, timezone: timezone || 'UTC' };
        } catch (error) {
          return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: 'Invalid ISO date format',
            error: 'Timestamp must be valid ISO date string or Unix timestamp'
          });
        }
      } else {
        // Unix timestamp
        calculatedTimestamp = parseFloat(timestamp);
        if (isNaN(calculatedTimestamp) || calculatedTimestamp <= 0) {
          return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: 'Invalid timestamp format',
            error: 'Timestamp must be a positive number or valid ISO date string'
          });
        }
        inputMethod = 'unix_timestamp';
        inputParams = { timestamp: calculatedTimestamp };
      }
    } else if (start_date) {
      // Priority 2: Date-based parameters (start_date, end_date, start_time, end_time)
      try {
        const dateOptions = {
          start_date,
          end_date: end_date || start_date, // Use start_date if end_date not provided
          start_time,
          end_time,
          timezone: timezone || 'UTC'
        };
        
        const { startTime } = parseDateTimeRange(dateOptions);
        calculatedTimestamp = startTime;
        inputMethod = 'date_time';
        inputParams = dateOptions;
      } catch (error) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Invalid date/time format',
          error: error.message || 'Check date format (YYYY-MM-DD) and time format (HH:MM:SS)'
        });
      }
    } else if (hours) {
      // Priority 3: Hours lookback
      const hoursNum = parseInt(hours, 10);
      if (isNaN(hoursNum) || hoursNum < 1) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Invalid hours parameter',
          error: 'Hours must be a positive number'
        });
      }
      const now = Math.floor(Date.now() / 1000);
      calculatedTimestamp = now - (hoursNum * 3600);
      inputMethod = 'hours_lookback';
      inputParams = { hours: hoursNum };
    } else {
      // No time parameter provided
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Time parameter is required',
        error: 'Provide timestamp, start_date, or hours parameter'
      });
    }

    // Parse window parameter (default to 2 seconds)
    const windowSeconds = window ? parseInt(window, 10) : 2;
    if (isNaN(windowSeconds) || windowSeconds < 1 || windowSeconds > 60) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Window parameter must be a number between 1 and 60 seconds',
        error: 'Invalid window parameter'
      });
    }

    // Call service function with calculated timestamp
    const result = await getRecordingAtTimestamp({
      camera,
      timestamp: calculatedTimestamp,
      window: windowSeconds
    });

    // Handle case where no recording is found
    if (!result.found) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: result.message,
        data: {
          camera,
          timestamp: calculatedTimestamp,
          input_method: inputMethod,
          suggestions: result.suggestions
        },
        error: 'Recording not found'
      });
    }

    // Return successful response with enhanced metadata
    res.json({
      success: true,
      message: 'Recording found successfully',
      data: {
        video_url: result.video_url,
        recording_id: result.recording_id,
        camera: result.camera,
        exact_timestamp: result.exact_timestamp,
        timestamp_iso: new Date(result.exact_timestamp * 1000).toISOString(),
        timezone: timezone || 'UTC',
        time_window: result.time_window,
        playback_info: result.playback_info,
        recording_info: {
          path: result.path,
          start_time: result.recording_start,
          end_time: result.recording_end,
          duration: result.recording_duration,
          offset_in_recording: result.offset_in_recording
        },
        input_parameters: {
          method: inputMethod,
          ...inputParams,
          window: windowSeconds
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error getting recording at timestamp', { 
      error: error.message, 
      query: req.query 
    });
    
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve recording',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getRecentClips,
  testMediaUrls,
  getRecordingAtTimestamp: getRecordingAtTimestampController,
};
