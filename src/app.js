const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { createServer } = require('http');
const { Server } = require('socket.io');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler: mainErrorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const websocketService = require('./services/websocket.service');
const performanceService = require('./services/performance.service');
// Enhanced security and Redis imports
const { 
  helmetConfig, 
  corsConfig, 
  rateLimits
} = require('./middleware/security');
const { initRedis } = require('./config/redis');

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  path: '/socket.io'
});

// Initialize Redis
initRedis().then(success => {
  if (success) {
    console.log('✅ Redis connected successfully');
  } else {
    console.log('⚠️  Redis connection failed, using memory cache fallback');
  }
}).catch(err => {
  console.error('❌ Redis initialization error:', err);
});

// Initialize WebSocket service
websocketService.initialize(io);

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// Enhanced security HTTP headers
app.use(helmetConfig);

// Request logging (using morgan)

// parse json request body
app.use(express.json({ limit: '10mb' }));

// parse urlencoded request body
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// Enhanced CORS with security
app.use(cors(corsConfig));
app.options('*', cors(corsConfig));

// Rate limiting
app.use('/api', rateLimits.general);
app.use('/api/violations', rateLimits.strict);
app.use('/api/websocket/test', rateLimits.websocket);
app.use('/api/media', rateLimits.media);

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);

// Serve static files from public directory
app.use(express.static('public'));

// Frigate media proxy - proxy video files to Frigate server
app.use('/media', createProxyMiddleware({
  target: config.frigate.videoServerUrl,
  changeOrigin: true,
  pathRewrite: {
    '^/media': '', // Remove /media prefix when forwarding to Frigate
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add proper headers for video streaming
    proxyReq.setHeader('Accept', 'video/mp4, video/*, */*');
  },
  onProxyRes: (proxyRes, req, res) => {
    // Set proper content type for video files
    if (req.url.includes('.mp4')) {
      proxyRes.headers['content-type'] = 'video/mp4';
    } else if (req.url.includes('.webp')) {
      proxyRes.headers['content-type'] = 'image/webp';
    } else if (req.url.includes('.jpg') || req.url.includes('.jpeg')) {
      proxyRes.headers['content-type'] = 'image/jpeg';
    } else if (req.url.includes('.png')) {
      proxyRes.headers['content-type'] = 'image/png';
    }
    
    // Enable range requests for video streaming
    if (req.url.includes('.mp4')) {
      proxyRes.headers['accept-ranges'] = 'bytes';
      proxyRes.headers['cache-control'] = 'public, max-age=3600';
    }
  },
  onError: (err, req, res) => {
    console.error('Media proxy error:', err);
    res.status(502).json({
      success: false,
      message: 'Media server unavailable',
      error: 'Failed to fetch media file'
    });
  }
}));

// Serve reports directory for downloadable files
app.use('/api/reports/download', express.static('reports', {
  setHeaders: (res, path) => {
    // Set appropriate headers for file downloads
    res.setHeader('Content-Disposition', 'attachment');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// Performance monitoring middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    performanceService.recordRequest(req.method, req.path, responseTime, res.statusCode);
    originalEnd.apply(this, args);
  };
  
  next();
});

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(mainErrorHandler);

module.exports = { app, server, io };
