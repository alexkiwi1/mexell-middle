const { query } = require('../config/postgres');
const { unixToISO, unixToReadable, generateMediaURL, parseDateTimeRange } = require('./frigate.service');
const logger = require('../config/logger');

/**
 * Get live summaries for all cameras
 * @param {Object} options - Query options
 * @param {number} [options.hours=1] - Hours to look back for activity (fallback)
 * @param {string} [options.start_date] - Start date (ISO string or YYYY-MM-DD)
 * @param {string} [options.end_date] - End date (ISO string or YYYY-MM-DD)
 * @returns {Promise<Array<Object>>} Camera summaries with activity data
 */
const getCameraSummary = async (options = {}) => {
  try {
    const { startTime, endTime } = parseDateTimeRange(options);
    
    // Get recent activity for all cameras
    const activityQuery = `
      SELECT 
        camera,
        data->>'label' as label,
        COUNT(*) as count,
        MAX(timestamp) as last_seen
      FROM timeline 
      WHERE timestamp > $1
      GROUP BY camera, data->>'label'
      ORDER BY camera, count DESC
    `;
    
    let activities = await query(activityQuery, [startTime]);
    
    // Get latest recording for each camera
    const recordingsQuery = `
      SELECT 
        camera,
        MAX(start_time) as last_recording,
        COUNT(*) as total_recordings
      FROM recordings 
      WHERE start_time > $1
      GROUP BY camera
    `;
    
    let recordings = await query(recordingsQuery, [startTime]);
    
    // Ensure recordings is an array
    if (!Array.isArray(recordings)) {
      logger.error('Recordings query did not return an array:', recordings);
      recordings = [];
    }
    
    // Get unique cameras
    const camerasQuery = 'SELECT DISTINCT camera FROM recordings ORDER BY camera';
    let cameras = await query(camerasQuery);
    
    // Ensure cameras is an array
    if (!Array.isArray(cameras)) {
      logger.error('Cameras query did not return an array:', cameras);
      return [];
    }
    
    // Build summary for each camera
    const summaries = cameras.map(cam => {
      const camera = cam.camera;
      const cameraActivities = activities.filter(a => a.camera === camera);
      const cameraRecordings = recordings.find(r => r.camera === camera);
      
      // Count different types of detections
      const personDetections = cameraActivities.find(a => a.label === 'person')?.count || 0;
      const cellPhoneDetections = cameraActivities.find(a => a.label === 'cell phone')?.count || 0;
      const otherDetections = cameraActivities
        .filter(a => !['person', 'cell phone'].includes(a.label))
        .reduce((sum, a) => sum + parseInt(a.count), 0);
      
      // Get most recent activity
      const lastActivity = cameraActivities.length > 0 
        ? Math.max(...cameraActivities.map(a => parseFloat(a.last_seen)))
        : null;
      
      return {
        camera,
        status: cameraRecordings ? 'active' : 'inactive',
        lastActivity: lastActivity ? unixToISO(lastActivity) : null,
        lastActivityRelative: lastActivity ? unixToReadable(lastActivity) : null,
        lastRecording: cameraRecordings ? unixToISO(cameraRecordings.last_recording) : null,
        totalRecordings: cameraRecordings?.total_recordings || 0,
        detections: {
          person: personDetections,
          cellPhone: cellPhoneDetections,
          other: otherDetections,
          total: personDetections + cellPhoneDetections + otherDetections
        },
        activityLevel: personDetections > 10 ? 'high' : personDetections > 3 ? 'medium' : 'low'
      };
    });
    
    return summaries;
  } catch (error) {
    logger.error('Error fetching camera summary:', error);
    throw error;
  }
};

/**
 * Get detailed summary for a specific camera
 * @param {string} cameraName - Name of the camera
 * @param {Object} options - Query options
 * @param {number} [options.hours=24] - Hours to look back
 * @returns {Promise<Object>} Detailed camera summary
 */
const getCameraSummaryById = async (cameraName, options = {}) => {
  try {
    const { startTime, endTime } = parseDateTimeRange(options);
    const timeThreshold = startTime;
    
    // Get detailed activity breakdown
    const activityQuery = `
      SELECT 
        data->>'label' as label,
        data->'sub_label'->>0 as employee_name,
        COUNT(*) as count,
        MAX(timestamp) as last_seen,
        MIN(timestamp) as first_seen
      FROM timeline 
      WHERE camera = $1 AND timestamp >= $2 AND timestamp <= $3
      GROUP BY data->>'label', data->'sub_label'->>0
      ORDER BY count DESC
    `;
    
    let activities = await query(activityQuery, [cameraName, timeThreshold, endTime]);
    
    // Get recording statistics
    const recordingsQuery = `
      SELECT 
        COUNT(*) as total_recordings,
        SUM(duration) as total_duration,
        AVG(duration) as avg_duration,
        MAX(start_time) as last_recording,
        MIN(start_time) as first_recording
      FROM recordings 
      WHERE camera = $1 AND start_time >= $2 AND start_time <= $3
    `;
    
    const recordings = await query(recordingsQuery, [cameraName, timeThreshold, endTime]);
    const recordingStats = recordings[0] || {};
    
    // Get recent clips
    const clipsQuery = `
      SELECT 
        id,
        start_time,
        severity,
        data->>'label' as label,
        data->'sub_label'->>0 as employee_name
      FROM reviewsegment 
      WHERE camera = $1 AND start_time >= $2 AND start_time <= $3
      ORDER BY start_time DESC
      LIMIT 10
    `;
    
    let clips = await query(clipsQuery, [cameraName, timeThreshold, endTime]);
    
    // Ensure clips is an array
    if (!Array.isArray(clips)) {
      logger.error('Clips query did not return an array:', clips);
      clips = [];
    }
    
    // Ensure activities is an array
    if (!Array.isArray(activities)) {
      logger.error('Activities query did not return an array:', activities);
      activities = [];
    }
    
    // Calculate statistics
    const totalDetections = activities.reduce((sum, a) => sum + parseInt(a.count), 0);
    const uniqueEmployees = [...new Set(activities
      .filter(a => a.employee_name)
      .map(a => a.employee_name))];
    
    const personDetections = activities
      .filter(a => a.label === 'person')
      .reduce((sum, a) => sum + parseInt(a.count), 0);
    
    const cellPhoneDetections = activities
      .filter(a => a.label === 'cell phone')
      .reduce((sum, a) => sum + parseInt(a.count), 0);
    
    return {
      camera: cameraName,
      status: recordingStats.total_recordings > 0 ? 'active' : 'inactive',
      timeRange: {
        startTime: unixToISO(timeThreshold),
        endTime: unixToISO(endTime),
        startDate: options.start_date || null,
        endDate: options.end_date || null,
        hours: options.hours || null
      },
      recordings: {
        total: parseInt(recordingStats.total_recordings) || 0,
        totalDuration: parseFloat(recordingStats.total_duration) || 0,
        avgDuration: parseFloat(recordingStats.avg_duration) || 0,
        lastRecording: recordingStats.last_recording ? unixToISO(recordingStats.last_recording) : null,
        firstRecording: recordingStats.first_recording ? unixToISO(recordingStats.first_recording) : null
      },
      detections: {
        total: totalDetections,
        person: personDetections,
        cellPhone: cellPhoneDetections,
        other: totalDetections - personDetections - cellPhoneDetections,
        uniqueEmployees: uniqueEmployees.length,
        employeeNames: uniqueEmployees
      },
      recentClips: clips.map(clip => ({
        id: clip.id,
        startTime: unixToISO(clip.start_time),
        severity: clip.severity,
        label: clip.label,
        employeeName: clip.employee_name,
        thumbnailUrl: generateMediaURL(`clips/review/thumb-${cameraName}-${clip.start_time}-${clip.id}.webp`)
      })),
      activityLevel: personDetections > 50 ? 'high' : personDetections > 10 ? 'medium' : 'low'
    };
  } catch (error) {
    logger.error(`Error fetching camera summary for ${cameraName}:`, error);
    throw error;
  }
};

/**
 * Get activity feed for a specific camera
 * @param {string} cameraName - Name of the camera
 * @param {Object} options - Query options
 * @param {number} [options.hours=1] - Hours to look back
 * @param {number} [options.limit=50] - Maximum number of events
 * @returns {Promise<Array<Object>>} Activity feed events
 */
const getCameraActivity = async (cameraName, { hours = 1, limit = 50 } = {}) => {
  try {
    const timeThreshold = Date.now() / 1000 - (hours * 3600);
    
    const activityQuery = `
      SELECT 
        timestamp,
        data->>'label' as label,
        data->'sub_label'->>0 as employee_name,
        data->'sub_label'->>1 as confidence,
        data->'zones' as zones,
        data->'objects' as objects
      FROM timeline 
      WHERE camera = $1 AND timestamp > $2
      ORDER BY timestamp DESC
      LIMIT $3
    `;
    
    let activities = await query(activityQuery, [cameraName, timeThreshold, limit]);
    
    // Ensure activities is an array
    if (!Array.isArray(activities)) {
      logger.error('Activities query did not return an array:', activities);
      return [];
    }
    
    return activities.map(activity => ({
      timestamp: unixToISO(activity.timestamp),
      timestampRelative: unixToReadable(activity.timestamp),
      label: activity.label,
      employeeName: activity.employee_name,
      confidence: activity.confidence ? parseFloat(activity.confidence) : null,
      zones: activity.zones || [],
      objects: activity.objects || [],
      camera: cameraName
    }));
  } catch (error) {
    logger.error(`Error fetching camera activity for ${cameraName}:`, error);
    throw error;
  }
};

/**
 * Get detailed camera status including health metrics
 * @param {string} cameraName - Name of the camera
 * @returns {Promise<Object>} Detailed camera status
 */
const getCameraStatus = async (cameraName) => {
  try {
    const now = Date.now() / 1000;
    const fiveMinutesAgo = now - 300;
    const oneHourAgo = now - 3600;
    
    // Check recent activity
    const recentActivityQuery = `
      SELECT COUNT(*) as count
      FROM timeline 
      WHERE camera = $1 AND timestamp > $2
    `;
    
    const recentActivity = await query(recentActivityQuery, [cameraName, fiveMinutesAgo]);
    const hasRecentActivity = recentActivity && recentActivity[0] ? parseInt(recentActivity[0].count) > 0 : false;
    
    // Check recent recordings
    const recentRecordingsQuery = `
      SELECT COUNT(*) as count, MAX(start_time) as last_recording
      FROM recordings 
      WHERE camera = $1 AND start_time > $2
    `;
    
    const recentRecordings = await query(recentRecordingsQuery, [cameraName, oneHourAgo]);
    const hasRecentRecordings = recentRecordings && recentRecordings[0] ? parseInt(recentRecordings[0].count) > 0 : false;
    const lastRecording = recentRecordings && recentRecordings[0] ? recentRecordings[0].last_recording : null;
    
    // Get hourly activity for the last 24 hours
    const hourlyActivityQuery = `
      SELECT 
        EXTRACT(hour FROM to_timestamp(timestamp)) as hour,
        COUNT(*) as detections
      FROM timeline 
      WHERE camera = $1 AND timestamp > $2
      GROUP BY EXTRACT(hour FROM to_timestamp(timestamp))
      ORDER BY hour
    `;
    
    let hourlyActivity = await query(hourlyActivityQuery, [cameraName, now - 86400]);
    
    // Ensure hourlyActivity is an array
    if (!Array.isArray(hourlyActivity)) {
      logger.error('Hourly activity query did not return an array:', hourlyActivity);
      hourlyActivity = [];
    }
    
    // Determine overall status
    let status = 'inactive';
    if (hasRecentActivity && hasRecentRecordings) {
      status = 'active';
    } else if (hasRecentRecordings) {
      status = 'recording_only';
    } else if (hasRecentActivity) {
      status = 'detection_only';
    }
    
    return {
      camera: cameraName,
      status,
      health: {
        hasRecentActivity,
        hasRecentRecordings,
        lastActivity: hasRecentActivity ? unixToISO(now) : null,
        lastRecording: lastRecording ? unixToISO(lastRecording) : null,
        lastRecordingRelative: lastRecording ? unixToReadable(lastRecording) : null
      },
      metrics: {
        recentDetections: recentActivity && recentActivity[0] ? parseInt(recentActivity[0].count) : 0,
        recentRecordings: recentRecordings && recentRecordings[0] ? parseInt(recentRecordings[0].count) : 0,
        hourlyActivity: hourlyActivity.map(h => ({
          hour: parseInt(h.hour),
          detections: parseInt(h.detections)
        }))
      },
      timestamp: unixToISO(now)
    };
  } catch (error) {
    logger.error(`Error fetching camera status for ${cameraName}:`, error);
    throw error;
  }
};

/**
 * Get camera-specific violations (cell phone detections)
 * @param {string} cameraName - Name of the camera
 * @param {Object} options - Query options
 * @param {number} [options.hours=24] - Hours to look back
 * @param {number} [options.limit=100] - Maximum number of violations
 * @returns {Promise<Array<Object>>} Camera-specific violations
 */
const getCameraViolations = async (cameraName, options = {}) => {
  try {
    const { limit = 100 } = options;
    const { startTime, endTime } = parseDateTimeRange(options);
    
    const violationsQuery = `
      SELECT 
        timestamp,
        data->'sub_label'->>0 as employee_name,
        data->'sub_label'->>1 as confidence,
        data->'zones' as zones,
        data->'objects' as objects
      FROM timeline 
      WHERE camera = $1 
        AND data->>'label' = 'cell phone'
        AND timestamp >= $2 AND timestamp <= $3
      ORDER BY timestamp DESC 
      LIMIT $4
    `;
    
    const violations = await query(violationsQuery, [cameraName, startTime, endTime, limit]);
    
    // Ensure violations is an array
    if (!Array.isArray(violations)) {
      logger.error('Violations query did not return an array:', violations);
      return [];
    }
    
    return violations.map(violation => ({
      timestamp: unixToISO(violation.timestamp),
      timestampRelative: unixToReadable(violation.timestamp),
      employeeName: violation.employee_name,
      confidence: violation.confidence ? parseFloat(violation.confidence) : null,
      zones: violation.zones || [],
      objects: violation.objects || [],
      camera: cameraName,
      type: 'cell_phone'
    }));
  } catch (error) {
    logger.error(`Error fetching camera violations for ${cameraName}:`, error);
    throw error;
  }
};

module.exports = {
  getCameraSummary,
  getCameraSummaryById,
  getCameraActivity,
  getCameraStatus,
  getCameraViolations,
};
