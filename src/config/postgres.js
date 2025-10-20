const { Pool } = require('pg');
const config = require('./config');
const logger = require('./logger');

// Create PostgreSQL connection pool for Frigate database (READ-ONLY)
const frigatePool = new Pool({
  host: config.frigate.host,
  port: config.frigate.port,
  database: config.frigate.database,
  user: config.frigate.user,
  password: config.frigate.password,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  query_timeout: 30000, // Query timeout in milliseconds
  statement_timeout: 30000, // Statement timeout in milliseconds
  // READ-ONLY configuration
  application_name: 'frigate-middleware-readonly',
});

// Test the connection
frigatePool.on('connect', () => {
  logger.info('Connected to Frigate PostgreSQL database');
});

frigatePool.on('error', (err) => {
  logger.error('Unexpected error on idle Frigate PostgreSQL client', err);
  process.exit(-1);
});

// Helper function to execute queries with error handling
const query = async (text, params = []) => {
  const start = Date.now();
  try {
    const res = await frigatePool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res.rows; // Return rows directly instead of the full result object
  } catch (error) {
    logger.error('Database query error', { text, error: error.message });
    throw error;
  }
};

// Helper function to test database connectivity
const testConnection = async () => {
  try {
    const result = await query('SELECT NOW() as current_time');
    logger.info('Frigate database connection test successful', { 
      currentTime: result[0].current_time 
    });
    return true;
  } catch (error) {
    logger.error('Frigate database connection test failed', { error: error.message });
    return false;
  }
};

// Graceful shutdown
const closePool = async () => {
  try {
    await frigatePool.end();
    logger.info('Frigate PostgreSQL connection pool closed');
  } catch (error) {
    logger.error('Error closing Frigate PostgreSQL connection pool', { error: error.message });
  }
};

module.exports = {
  query,
  testConnection,
  closePool,
  pool: frigatePool,
};
