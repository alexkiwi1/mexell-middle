const cacheService = require('./cache.service');
const logger = require('../config/logger');

/**
 * Performance Service - Performance monitoring and optimization
 * 
 * Features:
 * - Request timing and metrics
 * - Database query performance monitoring
 * - Memory usage tracking
 * - Response time analysis
 * - Performance alerts and recommendations
 */

class PerformanceService {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        average_response_time: 0,
        response_times: []
      },
      database: {
        queries: 0,
        average_query_time: 0,
        slow_queries: 0,
        query_times: []
      },
      cache: {
        hits: 0,
        misses: 0,
        hit_rate: 0
      },
      memory: {
        used: 0,
        free: 0,
        total: 0
      },
      errors: {
        total: 0,
        by_type: {}
      }
    };
    
    this.slowQueryThreshold = 1000; // 1 second
    this.maxResponseTimeHistory = 1000;
    this.maxQueryTimeHistory = 1000;
  }

  /**
   * Record request metrics
   * @param {string} method - HTTP method
   * @param {string} path - Request path
   * @param {number} responseTime - Response time in milliseconds
   * @param {number} statusCode - HTTP status code
   */
  recordRequest(method, path, responseTime, statusCode) {
    try {
      this.metrics.requests.total++;
      
      if (statusCode >= 200 && statusCode < 400) {
        this.metrics.requests.successful++;
      } else {
        this.metrics.requests.failed++;
      }

      // Record response time
      this.metrics.requests.response_times.push(responseTime);
      
      // Keep only recent response times
      if (this.metrics.requests.response_times.length > this.maxResponseTimeHistory) {
        this.metrics.requests.response_times.shift();
      }

      // Calculate average response time
      this.metrics.requests.average_response_time = 
        this.metrics.requests.response_times.reduce((a, b) => a + b, 0) / 
        this.metrics.requests.response_times.length;

      // Log slow requests
      if (responseTime > 2000) { // 2 seconds
        logger.warn(`Slow request: ${method} ${path} - ${responseTime}ms`);
      }

    } catch (error) {
      logger.error('Error recording request metrics:', error);
    }
  }

  /**
   * Record database query metrics
   * @param {string} query - SQL query
   * @param {number} queryTime - Query execution time in milliseconds
   * @param {boolean} success - Whether query was successful
   */
  recordDatabaseQuery(query, queryTime, success = true) {
    try {
      this.metrics.database.queries++;
      
      // Record query time
      this.metrics.database.query_times.push(queryTime);
      
      // Keep only recent query times
      if (this.metrics.database.query_times.length > this.maxQueryTimeHistory) {
        this.metrics.database.query_times.shift();
      }

      // Calculate average query time
      this.metrics.database.average_query_time = 
        this.metrics.database.query_times.reduce((a, b) => a + b, 0) / 
        this.metrics.database.query_times.length;

      // Track slow queries
      if (queryTime > this.slowQueryThreshold) {
        this.metrics.database.slow_queries++;
        logger.warn(`Slow query detected: ${queryTime}ms - ${query.substring(0, 100)}...`);
      }

    } catch (error) {
      logger.error('Error recording database query metrics:', error);
    }
  }

  /**
   * Record error metrics
   * @param {string} errorType - Type of error
   * @param {string} message - Error message
   * @param {string} stack - Error stack trace
   */
  recordError(errorType, message, stack) {
    try {
      this.metrics.errors.total++;
      
      if (!this.metrics.errors.by_type[errorType]) {
        this.metrics.errors.by_type[errorType] = 0;
      }
      this.metrics.errors.by_type[errorType]++;

      // Log critical errors
      if (errorType === 'CRITICAL' || errorType === 'FATAL') {
        logger.error(`Critical error: ${message}`, { stack });
      }

    } catch (error) {
      logger.error('Error recording error metrics:', error);
    }
  }

  /**
   * Update cache metrics
   */
  updateCacheMetrics() {
    try {
      const cacheStats = cacheService.getStats();
      this.metrics.cache.hits = cacheStats.hits;
      this.metrics.cache.misses = cacheStats.misses;
      this.metrics.cache.hit_rate = parseFloat(cacheStats.hit_rate);
    } catch (error) {
      logger.error('Error updating cache metrics:', error);
    }
  }

  /**
   * Update memory metrics
   */
  updateMemoryMetrics() {
    try {
      const memUsage = process.memoryUsage();
      this.metrics.memory.used = memUsage.heapUsed;
      this.metrics.memory.free = memUsage.heapTotal - memUsage.heapUsed;
      this.metrics.memory.total = memUsage.heapTotal;
    } catch (error) {
      logger.error('Error updating memory metrics:', error);
    }
  }

  /**
   * Get performance metrics
   * @returns {Object} - Performance metrics
   */
  getMetrics() {
    this.updateCacheMetrics();
    this.updateMemoryMetrics();

    return {
      ...this.metrics,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      node_version: process.version,
      platform: process.platform
    };
  }

  /**
   * Get performance summary
   * @returns {Object} - Performance summary
   */
  getPerformanceSummary() {
    this.updateCacheMetrics();
    this.updateMemoryMetrics();

    const responseTimeP95 = this.calculatePercentile(this.metrics.requests.response_times, 95);
    const responseTimeP99 = this.calculatePercentile(this.metrics.requests.response_times, 99);
    const queryTimeP95 = this.calculatePercentile(this.metrics.database.query_times, 95);
    const queryTimeP99 = this.calculatePercentile(this.metrics.database.query_times, 99);

    return {
      requests: {
        total: this.metrics.requests.total,
        success_rate: this.metrics.requests.total > 0 
          ? ((this.metrics.requests.successful / this.metrics.requests.total) * 100).toFixed(2) + '%'
          : '0%',
        average_response_time: Math.round(this.metrics.requests.average_response_time) + 'ms',
        p95_response_time: Math.round(responseTimeP95) + 'ms',
        p99_response_time: Math.round(responseTimeP99) + 'ms'
      },
      database: {
        total_queries: this.metrics.database.queries,
        average_query_time: Math.round(this.metrics.database.average_query_time) + 'ms',
        slow_queries: this.metrics.database.slow_queries,
        p95_query_time: Math.round(queryTimeP95) + 'ms',
        p99_query_time: Math.round(queryTimeP99) + 'ms'
      },
      cache: {
        hit_rate: this.metrics.cache.hit_rate + '%',
        hits: this.metrics.cache.hits,
        misses: this.metrics.cache.misses
      },
      memory: {
        used_mb: Math.round(this.metrics.memory.used / 1024 / 1024),
        free_mb: Math.round(this.metrics.memory.free / 1024 / 1024),
        total_mb: Math.round(this.metrics.memory.total / 1024 / 1024),
        usage_percentage: Math.round((this.metrics.memory.used / this.metrics.memory.total) * 100) + '%'
      },
      errors: {
        total: this.metrics.errors.total,
        by_type: this.metrics.errors.by_type
      }
    };
  }

  /**
   * Calculate percentile
   * @param {Array} values - Array of values
   * @param {number} percentile - Percentile to calculate
   * @returns {number} - Percentile value
   */
  calculatePercentile(values, percentile) {
    if (!values || values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  /**
   * Get performance recommendations
   * @returns {Array} - Array of recommendations
   */
  getRecommendations() {
    const recommendations = [];
    
    // Response time recommendations
    if (this.metrics.requests.average_response_time > 1000) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Average response time is high. Consider optimizing database queries or adding caching.',
        metric: 'response_time',
        value: this.metrics.requests.average_response_time + 'ms'
      });
    }

    // Database query recommendations
    if (this.metrics.database.slow_queries > 10) {
      recommendations.push({
        type: 'database',
        priority: 'high',
        message: 'High number of slow queries detected. Consider adding database indexes.',
        metric: 'slow_queries',
        value: this.metrics.database.slow_queries
      });
    }

    // Cache recommendations
    if (this.metrics.cache.hit_rate < 50) {
      recommendations.push({
        type: 'caching',
        priority: 'medium',
        message: 'Low cache hit rate. Consider increasing cache TTL or adding more cacheable data.',
        metric: 'cache_hit_rate',
        value: this.metrics.cache.hit_rate + '%'
      });
    }

    // Memory recommendations
    const memoryUsagePercent = (this.metrics.memory.used / this.metrics.memory.total) * 100;
    if (memoryUsagePercent > 80) {
      recommendations.push({
        type: 'memory',
        priority: 'high',
        message: 'High memory usage detected. Consider optimizing memory usage or increasing available memory.',
        metric: 'memory_usage',
        value: Math.round(memoryUsagePercent) + '%'
      });
    }

    return recommendations;
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        average_response_time: 0,
        response_times: []
      },
      database: {
        queries: 0,
        average_query_time: 0,
        slow_queries: 0,
        query_times: []
      },
      cache: {
        hits: 0,
        misses: 0,
        hit_rate: 0
      },
      memory: {
        used: 0,
        free: 0,
        total: 0
      },
      errors: {
        total: 0,
        by_type: {}
      }
    };
    
    logger.info('Performance metrics reset');
  }
}

// Create singleton instance
const performanceService = new PerformanceService();

// Update metrics every 30 seconds
setInterval(() => {
  performanceService.updateCacheMetrics();
  performanceService.updateMemoryMetrics();
}, 30000);

module.exports = performanceService;

