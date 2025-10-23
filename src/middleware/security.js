const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');

// Rate limiting configurations
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
      res.status(429).json({
        success: false,
        message: message || 'Too many requests, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Different rate limits for different endpoints
const rateLimits = {
  // General API rate limit
  general: createRateLimit(15 * 60 * 1000, 100, 'Too many API requests'), // 100 requests per 15 minutes
  
  // Strict rate limit for sensitive endpoints
  strict: createRateLimit(15 * 60 * 1000, 20, 'Too many requests to sensitive endpoint'), // 20 requests per 15 minutes
  
  // Auth endpoints rate limit
  auth: createRateLimit(15 * 60 * 1000, 5, 'Too many authentication attempts'), // 5 requests per 15 minutes
  
  // WebSocket test rate limit
  websocket: createRateLimit(60 * 1000, 10, 'Too many WebSocket test requests'), // 10 requests per minute
  
  // Media endpoints rate limit
  media: createRateLimit(5 * 60 * 1000, 50, 'Too many media requests'), // 50 requests per 5 minutes
};

// Helmet security configuration
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "blob:", "http://10.0.20.6:8080"],
      connectSrc: ["'self'", "ws:", "wss:", "http://10.0.20.6:8080"],
      mediaSrc: ["'self'", "http://10.0.20.6:8080"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for WebSocket compatibility
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Input validation middleware
const validateInput = (validations) => {
  return async (req, res, next) => {
    try {
      // Run validations
      await Promise.all(validations.map(validation => validation.run(req)));
      
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }
      
      next();
    } catch (error) {
      logger.error('Validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Validation error occurred'
      });
    }
  };
};

// Common validation rules
const validationRules = {
  // Date range validation
  dateRange: [
    body('start_date').optional().isISO8601().withMessage('start_date must be a valid ISO 8601 date'),
    body('end_date').optional().isISO8601().withMessage('end_date must be a valid ISO 8601 date'),
    body('hours').optional().isInt({ min: 1, max: 8760 }).withMessage('hours must be between 1 and 8760')
  ],
  
  // Pagination validation
  pagination: [
    body('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('limit must be between 1 and 1000'),
    body('offset').optional().isInt({ min: 0 }).withMessage('offset must be a non-negative integer')
  ],
  
  // Camera validation
  camera: [
    body('camera').optional().isString().isLength({ min: 1, max: 50 }).withMessage('camera must be a string between 1-50 characters')
  ],
  
  // Employee validation
  employee: [
    body('employee_name').optional().isString().isLength({ min: 1, max: 100 }).withMessage('employee_name must be a string between 1-100 characters')
  ],
  
  // WebSocket event validation
  websocketEvent: [
    body('eventType').isString().isLength({ min: 1, max: 50 }).withMessage('eventType is required and must be 1-50 characters'),
    body('data').isObject().withMessage('data must be an object')
  ],
  
  // Cache validation
  cacheItem: [
    body('value').exists().withMessage('value is required'),
    body('ttl').optional().isInt({ min: 1, max: 86400 }).withMessage('ttl must be between 1 and 86400 seconds')
  ]
};

// JWT utilities
const jwtUtils = {
  // Generate JWT token
  generateToken: (payload, expiresIn = '24h') => {
    return jwt.sign(payload, process.env.JWT_SECRET || 'frigate-secret-key', { expiresIn });
  },
  
  // Verify JWT token
  verifyToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'frigate-secret-key');
    } catch (error) {
      return null;
    }
  },
  
  // Extract token from request
  extractToken: (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = jwtUtils.extractToken(req);
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }
  
  const decoded = jwtUtils.verifyToken(token);
  if (!decoded) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
  
  req.user = decoded;
  next();
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  const token = jwtUtils.extractToken(req);
  if (token) {
    const decoded = jwtUtils.verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  next();
};

// API key validation
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key required'
    });
  }
  
  // Simple API key validation (in production, use a proper key management system)
  const validApiKeys = process.env.VALID_API_KEYS ? 
    process.env.VALID_API_KEYS.split(',') : 
    ['frigate-api-key-2024', 'test-api-key'];
  
  if (!validApiKeys.includes(apiKey)) {
    logger.warn(`Invalid API key attempt from IP: ${req.ip}`);
    return res.status(403).json({
      success: false,
      message: 'Invalid API key'
    });
  }
  
  next();
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
};

// CORS configuration
const corsConfig = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
      process.env.ALLOWED_ORIGINS.split(',') : 
      ['http://localhost:3000', 'http://localhost:8080', 'http://10.0.20.8:5002'];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
};

module.exports = {
  rateLimits,
  helmetConfig,
  validateInput,
  validationRules,
  jwtUtils,
  authenticateToken,
  optionalAuth,
  validateApiKey,
  requestLogger,
  errorHandler,
  corsConfig
};

