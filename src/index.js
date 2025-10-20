const mongoose = require('mongoose');
const { app, server: httpServer, io } = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const { testConnections, initializeAppDatabase } = require('./config/database');

let server;

// Initialize databases and start server
const initializeServer = async () => {
  try {
    // Test database connections
    const dbConnected = await testConnections();
    if (!dbConnected) {
      logger.error('Database connection failed, but continuing with limited functionality');
    }
    
    // Initialize application database
    await initializeAppDatabase();
    
    // Start server
    server = httpServer.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
      logger.info(`WebSocket server running on /socket.io`);
      logger.info('Using PostgreSQL databases (Frigate read-only, App read-write)');
    });
    
    // Optional MongoDB connection
    mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
      logger.info('Connected to MongoDB (optional)');
    }).catch((error) => {
      logger.warn('MongoDB connection failed (optional):', error.message);
    });
    
  } catch (error) {
    logger.error('Server initialization failed:', error);
    process.exit(1);
  }
};

initializeServer();

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
