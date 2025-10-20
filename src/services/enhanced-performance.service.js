const os = require('os');
const logger = require('../config/logger');
const { redisCacheService } = require('./redis-cache.service');
const { redisUtils } = require('../config/redis');

// Enhanced performance metrics collection
class EnhancedPerformanceService {
  constructor() {
    this.metrics = {
      requests: [],
      database: [],
      cache: [],
      errors: [],
      memory: [],
      cpu: [],
      network: []
    };
    
    this.maxMetricsCount = 1000;
    this.startTime = Date.now();
    this.requestCount = 0;
    this.errorCount = 0;
    
    // Start system monitoring
    this.startSystemMonitoring();
  }

  // Record request metrics
  recordRequest(method, path, responseTime, statusCode, userAgent = null, ip = null) {
    const metric = {
      method,
      path,
      responseTime,
      statusCode,
      userAgent,
      ip,
      timestamp: Date.now(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };

    this.metrics.requests.push(metric);
    this.requestCount++;

    // Keep only recent metrics
    if (this.metrics.requests.length > this.maxMetricsCount) {
      this.metrics.requests.shift();
    }

    // Record error if status code indicates error
    if (statusCode >= 400) {
      this.errorCount++;
      this.recordError('http_error', `${method} ${path} returned ${statusCode}`, null, {
        method,
        path,
        statusCode,
        responseTime,
        userAgent,
        ip
      });
    }
  }

  // Record database query metrics
  recordDatabaseQuery(query, queryTime, success = true, error = null, rowsAffected = 0) {
    const metric = {
      query: query.substring(0, 200), // Truncate long queries
      queryTime,
      success,
      error: error ? error.message : null,
      rowsAffected,
      timestamp: Date.now()
    };

    this.metrics.database.push(metric);

    if (this.metrics.database.length > this.maxMetricsCount) {
      this.metrics.database.shift();
    }

    if (!success) {
      this.recordError('database_error', 'Database query failed', error, { query, queryTime });
    }
  }

  // Record cache metrics
  recordCacheEvent(type, key, duration = 0, hit = false, size = 0) {
    const metric = {
      type,
      key,
      duration,
      hit,
      size,
      timestamp: Date.now()
    };

    this.metrics.cache.push(metric);

    if (this.metrics.cache.length > this.maxMetricsCount) {
      this.metrics.cache.shift();
    }
  }

  // Record error metrics
  recordError(type, message, stack = null, context = null) {
    const error = {
      type,
      message,
      stack,
      context,
      timestamp: Date.now()
    };

    this.metrics.errors.push(error);
    this.errorCount++;

    if (this.metrics.errors.length > this.maxMetricsCount) {
      this.metrics.errors.shift();
    }

    logger.error(`Performance Error [${type}]:`, { message, context });
  }

  // Start system monitoring
  startSystemMonitoring() {
    setInterval(() => {
      this.recordSystemMetrics();
    }, 30000); // Every 30 seconds
  }

  // Record system metrics
  recordSystemMetrics() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const loadAvg = os.loadavg();
    const freeMemory = os.freemem();
    const totalMemory = os.totalmem();

    const systemMetric = {
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
        free: freeMemory,
        total: totalMemory,
        usagePercent: ((totalMemory - freeMemory) / totalMemory) * 100
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
        loadAverage: loadAvg
      },
      uptime: process.uptime(),
      timestamp: Date.now()
    };

    this.metrics.memory.push(systemMetric);
    this.metrics.cpu.push(systemMetric);

    // Keep only recent metrics
    if (this.metrics.memory.length > this.maxMetricsCount) {
      this.metrics.memory.shift();
    }
    if (this.metrics.cpu.length > this.maxMetricsCount) {
      this.metrics.cpu.shift();
    }
  }

  // Calculate statistics for a metric array
  calculateStats(metrics, field) {
    if (metrics.length === 0) {
      return { total: 0, average: 0, min: 0, max: 0, p50: 0, p95: 0, p99: 0 };
    }

    const values = metrics.map(m => m[field]).sort((a, b) => a - b);
    const total = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const average = sum / total;
    const min = values[0];
    const max = values[total - 1];
    const p50 = values[Math.floor(total * 0.5) - 1] || values[total - 1];
    const p95 = values[Math.floor(total * 0.95) - 1] || values[total - 1];
    const p99 = values[Math.floor(total * 0.99) - 1] || values[total - 1];

    return { total, average, min, max, p50, p95, p99 };
  }

  // Get comprehensive metrics
  getMetrics() {
    const now = Date.now();
    const oneHourAgo = now - 3600 * 1000;

    // Filter recent metrics
    const recentRequests = this.metrics.requests.filter(m => m.timestamp > oneHourAgo);
    const recentDbQueries = this.metrics.database.filter(m => m.timestamp > oneHourAgo);
    const recentErrors = this.metrics.errors.filter(m => m.timestamp > oneHourAgo);

    // Calculate request statistics
    const requestStats = this.calculateStats(recentRequests, 'responseTime');
    const successfulRequests = recentRequests.filter(r => r.statusCode >= 200 && r.statusCode < 300).length;
    const successRate = recentRequests.length > 0 ? ((successfulRequests / recentRequests.length) * 100).toFixed(2) : '0';

    // Calculate database statistics
    const dbQueryStats = this.calculateStats(recentDbQueries, 'queryTime');
    const slowQueries = recentDbQueries.filter(q => q.queryTime > 500).length;
    const failedQueries = recentDbQueries.filter(q => !q.success).length;

    // Get cache statistics
    const cacheStats = redisCacheService.getStats();

    // Get current system metrics
    const currentMemory = process.memoryUsage();
    const freeMemory = os.freemem();
    const totalMemory = os.totalmem();
    const memoryUsagePercent = ((totalMemory - freeMemory) / totalMemory) * 100;

    // Get Redis statistics
    const redisInfo = redisUtils.isAvailable() ? 'Available' : 'Unavailable';

    return {
      requests: {
        total: requestStats.total,
        success_rate: `${successRate}%`,
        average_response_time: `${requestStats.average.toFixed(0)}ms`,
        min_response_time: `${requestStats.min.toFixed(0)}ms`,
        max_response_time: `${requestStats.max.toFixed(0)}ms`,
        p50_response_time: `${requestStats.p50.toFixed(0)}ms`,
        p95_response_time: `${requestStats.p95.toFixed(0)}ms`,
        p99_response_time: `${requestStats.p99.toFixed(0)}ms`,
        error_rate: `${((this.errorCount / this.requestCount) * 100).toFixed(2)}%`
      },
      database: {
        total_queries: dbQueryStats.total,
        average_query_time: `${dbQueryStats.average.toFixed(0)}ms`,
        min_query_time: `${dbQueryStats.min.toFixed(0)}ms`,
        max_query_time: `${dbQueryStats.max.toFixed(0)}ms`,
        p95_query_time: `${dbQueryStats.p95.toFixed(0)}ms`,
        p99_query_time: `${dbQueryStats.p99.toFixed(0)}ms`,
        slow_queries: slowQueries,
        failed_queries: failedQueries,
        success_rate: `${((dbQueryStats.total - failedQueries) / dbQueryStats.total * 100).toFixed(2)}%`
      },
      cache: {
        hit_rate: cacheStats.hitRate,
        hits: cacheStats.hits,
        misses: cacheStats.misses,
        memory_cache_size: cacheStats.memoryCacheSize,
        redis_available: cacheStats.redisAvailable,
        total_operations: cacheStats.hits + cacheStats.misses
      },
      memory: {
        used_mb: (currentMemory.heapUsed / (1024 * 1024)).toFixed(0),
        total_mb: (totalMemory / (1024 * 1024)).toFixed(0),
        free_mb: (freeMemory / (1024 * 1024)).toFixed(0),
        usage_percentage: `${memoryUsagePercent.toFixed(1)}%`,
        rss_mb: (currentMemory.rss / (1024 * 1024)).toFixed(0),
        external_mb: (currentMemory.external / (1024 * 1024)).toFixed(0)
      },
      system: {
        uptime_hours: (process.uptime() / 3600).toFixed(1),
        node_version: process.version,
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        load_average: os.loadavg(),
        redis_status: redisInfo
      },
      errors: {
        total: recentErrors.length,
        by_type: recentErrors.reduce((acc, err) => {
          acc[err.type] = (acc[err.type] || 0) + 1;
          return acc;
        }, {}),
        error_rate: `${((this.errorCount / this.requestCount) * 100).toFixed(2)}%`
      }
    };
  }

  // Get system health status
  getSystemHealth() {
    const metrics = this.getMetrics();
    let status = 'healthy';
    const issues = [];
    const recommendations = [];

    // Check memory usage
    const memoryUsage = parseFloat(metrics.memory.usage_percentage);
    if (memoryUsage > 90) {
      status = 'critical';
      issues.push({
        type: 'memory',
        priority: 'high',
        message: 'Critical memory usage detected',
        value: `${memoryUsage}%`,
        recommendation: 'Restart application or increase memory allocation'
      });
    } else if (memoryUsage > 80) {
      status = 'degraded';
      issues.push({
        type: 'memory',
        priority: 'medium',
        message: 'High memory usage detected',
        value: `${memoryUsage}%`,
        recommendation: 'Monitor memory usage and consider optimization'
      });
    }

    // Check request success rate
    const successRate = parseFloat(metrics.requests.success_rate);
    if (successRate < 90 && metrics.requests.total > 0) {
      status = 'critical';
      issues.push({
        type: 'api_errors',
        priority: 'high',
        message: 'Low API success rate',
        value: `${successRate}%`,
        recommendation: 'Investigate recent errors and fix API issues'
      });
    } else if (successRate < 95 && metrics.requests.total > 0) {
      status = 'degraded';
      issues.push({
        type: 'api_errors',
        priority: 'medium',
        message: 'Some API errors detected',
        value: `${successRate}%`,
        recommendation: 'Monitor API errors and investigate patterns'
      });
    }

    // Check slow queries
    if (metrics.database.slow_queries > 10) {
      status = 'critical';
      issues.push({
        type: 'database',
        priority: 'high',
        message: 'High number of slow database queries',
        value: metrics.database.slow_queries,
        recommendation: 'Optimize database queries and check indexes'
      });
    } else if (metrics.database.slow_queries > 5) {
      status = 'degraded';
      issues.push({
        type: 'database',
        priority: 'medium',
        message: 'Some slow database queries detected',
        value: metrics.database.slow_queries,
        recommendation: 'Review and optimize slow queries'
      });
    }

    // Check cache hit rate
    const cacheHitRate = parseFloat(metrics.cache.hit_rate);
    if (cacheHitRate < 50 && metrics.cache.total_operations > 0) {
      issues.push({
        type: 'caching',
        priority: 'low',
        message: 'Low cache hit rate',
        value: `${cacheHitRate}%`,
        recommendation: 'Review caching strategy and TTL settings'
      });
    }

    // Generate recommendations
    if (memoryUsage > 70) {
      recommendations.push('Consider implementing memory optimization strategies');
    }
    if (metrics.database.slow_queries > 0) {
      recommendations.push('Review database query performance and add indexes');
    }
    if (cacheHitRate < 70) {
      recommendations.push('Optimize caching strategy for better performance');
    }
    if (successRate < 98) {
      recommendations.push('Implement better error handling and monitoring');
    }

    return {
      status,
      summary: metrics,
      issues,
      recommendations: {
        total: recommendations.length,
        critical: issues.filter(i => i.priority === 'high').length,
        medium: issues.filter(i => i.priority === 'medium').length,
        low: issues.filter(i => i.priority === 'low').length,
        suggestions: recommendations
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }

  // Get performance recommendations
  getRecommendations() {
    const health = this.getSystemHealth();
    return health.recommendations;
  }

  // Reset all metrics
  resetMetrics() {
    this.metrics = {
      requests: [],
      database: [],
      cache: [],
      errors: [],
      memory: [],
      cpu: [],
      network: []
    };
    this.requestCount = 0;
    this.errorCount = 0;
    this.startTime = Date.now();
    
    // Clear cache
    redisCacheService.clear();
    
    logger.info('Performance metrics reset');
  }

  // Get detailed error analysis
  getErrorAnalysis() {
    const recentErrors = this.metrics.errors.filter(
      e => e.timestamp > Date.now() - 3600 * 1000
    );

    const errorTypes = recentErrors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {});

    const errorMessages = recentErrors.reduce((acc, error) => {
      const key = error.message.substring(0, 100);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return {
      total_errors: recentErrors.length,
      error_types: errorTypes,
      common_messages: Object.entries(errorMessages)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10),
      recent_errors: recentErrors.slice(-10)
    };
  }
}

// Create singleton instance
const enhancedPerformanceService = new EnhancedPerformanceService();

module.exports = enhancedPerformanceService;

