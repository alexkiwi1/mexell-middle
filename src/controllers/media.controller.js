const httpStatus = require('http-status');
const { query } = require('../config/postgres');
const { generateMediaURL } = require('../services/frigate.service');
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

module.exports = {
  getRecentClips,
  testMediaUrls,
};
