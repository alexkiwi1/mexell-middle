const performanceService = require('../services/performance.service');
const cacheService = require('../services/cache.service');
const logger = require('../config/logger');

/**
 * Performance Controller - Performance monitoring and optimization endpoints
 * 
 * Provides endpoints for:
 * - Performance metrics
 * - Cache statistics
 * - Performance recommendations
 * - System health monitoring
 */

/**
 * Get performance metrics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPerformanceMetricsController = async (req, res) => {
  try {
    const metrics = performanceService.getMetrics();

    res.json({
      success: true,
      message: 'Performance metrics retrieved successfully',
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in getPerformanceMetricsController:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve performance metrics',
      error: error.message
    });
  }
};

/**
 * Get performance summary
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPerformanceSummaryController = async (req, res) => {
  try {
    const summary = performanceService.getPerformanceSummary();

    res.json({
      success: true,
      message: 'Performance summary retrieved successfully',
      data: summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in getPerformanceSummaryController:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve performance summary',
      error: error.message
    });
  }
};

/**
 * Get performance recommendations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPerformanceRecommendationsController = async (req, res) => {
  try {
    const recommendations = performanceService.getRecommendations();

    res.json({
      success: true,
      message: 'Performance recommendations retrieved successfully',
      data: {
        recommendations,
        count: recommendations.length,
        high_priority: recommendations.filter(r => r.priority === 'high').length,
        medium_priority: recommendations.filter(r => r.priority === 'medium').length,
        low_priority: recommendations.filter(r => r.priority === 'low').length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in getPerformanceRecommendationsController:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve performance recommendations',
      error: error.message
    });
  }
};

/**
 * Get cache statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCacheStatsController = async (req, res) => {
  try {
    const stats = cacheService.getStats();

    res.json({
      success: true,
      message: 'Cache statistics retrieved successfully',
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in getCacheStatsController:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cache statistics',
      error: error.message
    });
  }
};

/**
 * Get cache entry details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCacheEntryController = async (req, res) => {
  try {
    const { key } = req.params;
    const entry = cacheService.getEntryDetails(key);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Cache entry not found',
        data: null
      });
    }

    res.json({
      success: true,
      message: 'Cache entry details retrieved successfully',
      data: entry,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in getCacheEntryController:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cache entry details',
      error: error.message
    });
  }
};

/**
 * Get all cache keys
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCacheKeysController = async (req, res) => {
  try {
    const keys = cacheService.getKeys();

    res.json({
      success: true,
      message: 'Cache keys retrieved successfully',
      data: {
        keys,
        count: keys.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in getCacheKeysController:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cache keys',
      error: error.message
    });
  }
};

/**
 * Clear cache
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const clearCacheController = async (req, res) => {
  try {
    cacheService.clear();

    res.json({
      success: true,
      message: 'Cache cleared successfully',
      data: {
        cleared_at: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in clearCacheController:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error.message
    });
  }
};

/**
 * Delete specific cache entry
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteCacheEntryController = async (req, res) => {
  try {
    const { key } = req.params;
    const existed = cacheService.has(key);
    
    cacheService.delete(key);

    res.json({
      success: true,
      message: existed ? 'Cache entry deleted successfully' : 'Cache entry not found',
      data: {
        key,
        existed,
        deleted_at: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in deleteCacheEntryController:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete cache entry',
      error: error.message
    });
  }
};

/**
 * Reset performance metrics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const resetPerformanceMetricsController = async (req, res) => {
  try {
    performanceService.reset();

    res.json({
      success: true,
      message: 'Performance metrics reset successfully',
      data: {
        reset_at: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in resetPerformanceMetricsController:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset performance metrics',
      error: error.message
    });
  }
};

/**
 * Get system health
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getSystemHealthController = async (req, res) => {
  try {
    const summary = performanceService.getPerformanceSummary();
    const recommendations = performanceService.getRecommendations();
    const cacheStats = cacheService.getStats();

    // Determine overall health status
    let healthStatus = 'healthy';
    const criticalIssues = recommendations.filter(r => r.priority === 'high');
    
    if (criticalIssues.length > 0) {
      healthStatus = 'degraded';
    }
    
    if (summary.memory.usage_percentage > '90%') {
      healthStatus = 'critical';
    }

    res.json({
      success: true,
      message: 'System health retrieved successfully',
      data: {
        status: healthStatus,
        summary,
        cache: cacheStats,
        recommendations: {
          total: recommendations.length,
          critical: criticalIssues.length,
          issues: recommendations
        },
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in getSystemHealthController:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve system health',
      error: error.message
    });
  }
};

module.exports = {
  getPerformanceMetricsController,
  getPerformanceSummaryController,
  getPerformanceRecommendationsController,
  getCacheStatsController,
  getCacheEntryController,
  getCacheKeysController,
  clearCacheController,
  deleteCacheEntryController,
  resetPerformanceMetricsController,
  getSystemHealthController
};

