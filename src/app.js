const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);

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

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
