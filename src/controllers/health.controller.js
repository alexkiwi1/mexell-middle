const httpStatus = require('http-status');
const { testConnection } = require('../config/postgres');
const logger = require('../config/logger');

/**
 * Health check endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const healthCheck = async (req, res, next) => {
  try {
    const startTime = Date.now();
    
    // Test Frigate PostgreSQL connection
    const frigateDbStatus = await testConnection();
    
    const responseTime = Date.now() - startTime;
    
    const healthStatus = {
      status: frigateDbStatus ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      services: {
        frigate_database: {
          status: frigateDbStatus ? 'connected' : 'disconnected',
          host: process.env.FRIGATE_DB_HOST || 'unknown',
          port: process.env.FRIGATE_DB_PORT || 'unknown',
          database: process.env.FRIGATE_DB_NAME || 'unknown'
        },
        video_server: {
          status: 'external',
          url: process.env.VIDEO_SERVER_URL || 'unknown'
        }
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    const statusCode = frigateDbStatus ? httpStatus.OK : httpStatus.SERVICE_UNAVAILABLE;
    
    res.status(statusCode).json({
      success: frigateDbStatus,
      message: frigateDbStatus ? 'All services healthy' : 'Service unavailable',
      data: healthStatus
    });
  } catch (error) {
    logger.error('Health check error', { error: error.message });
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Health check failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Root endpoint with API information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const root = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Frigate Middleware API',
      data: {
        name: 'Frigate Middleware API',
        version: '1.0.0',
        description: 'A comprehensive middleware service for Frigate surveillance dashboard with real-time phone violation detection, employee tracking, and attendance management.',
        contact: {
          name: 'Frigate Dashboard Middleware',
          email: 'admin@frigate-dashboard.com'
        },
        license: {
          name: 'MIT License',
          url: 'https://opensource.org/licenses/MIT'
        },
        servers: [
          {
            url: 'http://10.0.20.8:5002',
            description: 'Production Server'
          },
          {
            url: 'http://localhost:5002',
            description: 'Development Server'
          }
        ],
        endpoints: {
          health: '/health',
          api_info: '/api/info',
          cameras: '/api/cameras/*',
          violations: '/api/violations/*',
          employees: '/api/employees/*',
          attendance: '/api/attendance/*',
          zones: '/api/zones/*',
          dashboard: '/api/dashboard/*',
          media: '/api/recent-media/*'
        },
        documentation: '/v1/docs'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Root endpoint error', { error: error.message });
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'API information unavailable',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * API information endpoint
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const apiInfo = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'API Information',
      data: {
        api: {
          name: 'Frigate Middleware API',
          version: '1.0.0',
          description: 'Comprehensive middleware service for Frigate surveillance dashboard',
          openapi: '3.1.0'
        },
        features: [
          'Real-time phone violation detection',
          'Employee tracking and attendance management',
          'Camera monitoring and activity tracking',
          'Zone-based analytics and heatmaps',
          'Video and media file serving',
          'Dashboard analytics and reporting'
        ],
        database: {
          frigate_postgresql: {
            status: 'read-only',
            purpose: 'Detection events and media metadata'
          },
          local_mongodb: {
            status: 'read-write',
            purpose: 'Cache, analytics, and user data'
          }
        },
        media: {
          video_server: process.env.VIDEO_SERVER_URL || 'http://10.0.20.6:8000',
          supported_formats: ['mp4', 'webp', 'jpg', 'png']
        },
        limits: {
          max_query_limit: 1000,
          default_query_limit: 100,
          max_hours_lookback: 168 // 1 week
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('API info endpoint error', { error: error.message });
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'API information unavailable',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  healthCheck,
  root,
  apiInfo,
};

