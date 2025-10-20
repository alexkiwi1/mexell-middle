const { Pool } = require('pg');
const logger = require('./logger');

// Frigate PostgreSQL (Read-only)
const frigatePool = new Pool({
  host: '10.0.20.6',
  port: 5433,
  database: 'frigate_db',
  user: 'frigate',
  password: 'frigate_secure_pass_2024',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Application PostgreSQL (Read-write for reports, cache, etc.)
const appPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mexell_reports',
  user: process.env.DB_USER || 'mexell_user',
  password: process.env.DB_PASSWORD || 'mexell_secure_pass_2024',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connections
const testConnections = async () => {
  try {
    // Test Frigate connection
    const frigateClient = await frigatePool.connect();
    await frigateClient.query('SELECT 1');
    frigateClient.release();
    logger.info('✅ Connected to Frigate PostgreSQL (read-only)');
    
    // Test App connection (optional)
    try {
      const appClient = await appPool.connect();
      await appClient.query('SELECT 1');
      appClient.release();
      logger.info('✅ Connected to Application PostgreSQL (read-write)');
    } catch (appError) {
      logger.warn('⚠️  Application PostgreSQL connection failed, using memory storage:', appError.message);
    }
    
    return true;
  } catch (error) {
    logger.error('❌ Frigate database connection failed:', error.message);
    return false;
  }
};

// Initialize application database
const initializeAppDatabase = async () => {
  try {
    const client = await appPool.connect();
    
    // Create reports table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        report_id VARCHAR(255) UNIQUE NOT NULL,
        report_type VARCHAR(100) NOT NULL,
        generated_at TIMESTAMP WITH TIME ZONE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        timezone VARCHAR(50) NOT NULL,
        filters JSONB,
        summary JSONB,
        data JSONB,
        file_size INTEGER DEFAULT 0,
        download_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_reports_report_id ON reports(report_id);
      CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
      CREATE INDEX IF NOT EXISTS idx_reports_generated_at ON reports(generated_at);
      CREATE INDEX IF NOT EXISTS idx_reports_expires_at ON reports(expires_at);
    `);
    
    // Create cache table for performance
    await client.query(`
      CREATE TABLE IF NOT EXISTS cache (
        id SERIAL PRIMARY KEY,
        cache_key VARCHAR(255) UNIQUE NOT NULL,
        cache_data JSONB NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    
    // Create cache index
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_cache_key ON cache(cache_key);
      CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON cache(expires_at);
    `);
    
    client.release();
    logger.info('✅ Application database initialized');
    return true;
  } catch (error) {
    logger.error('❌ Failed to initialize application database:', error.message);
    return false;
  }
};

// Query functions
const queryFrigate = async (text, params = []) => {
  const client = await frigatePool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

const queryApp = async (text, params = []) => {
  const client = await appPool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

// Cache functions
const setCache = async (key, data, ttlSeconds = 3600) => {
  try {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    await queryApp(
      'INSERT INTO cache (cache_key, cache_data, expires_at) VALUES ($1, $2, $3) ON CONFLICT (cache_key) DO UPDATE SET cache_data = $2, expires_at = $3',
      [key, JSON.stringify(data), expiresAt]
    );
  } catch (error) {
    logger.error('Cache set error:', error.message);
  }
};

const getCache = async (key) => {
  try {
    const result = await queryApp(
      'SELECT cache_data FROM cache WHERE cache_key = $1 AND expires_at > NOW()',
      [key]
    );
    return result.rows.length > 0 ? JSON.parse(result.rows[0].cache_data) : null;
  } catch (error) {
    logger.error('Cache get error:', error.message);
    return null;
  }
};

const clearExpiredCache = async () => {
  try {
    await queryApp('DELETE FROM cache WHERE expires_at <= NOW()');
  } catch (error) {
    logger.error('Cache cleanup error:', error.message);
  }
};

// Report functions
const saveReport = async (reportData) => {
  try {
    const result = await queryApp(
      `INSERT INTO reports (report_id, report_type, generated_at, expires_at, timezone, filters, summary, data, file_size)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        reportData.report_id,
        reportData.report_type,
        reportData.generated_at,
        reportData.expires_at,
        reportData.timezone,
        JSON.stringify(reportData.filters || {}),
        JSON.stringify(reportData.summary || {}),
        JSON.stringify(reportData.data || {}),
        reportData.file_size || 0
      ]
    );
    return result.rows[0].id;
  } catch (error) {
    logger.error('Save report error:', error.message);
    throw error;
  }
};

const getReport = async (reportId) => {
  try {
    const result = await queryApp(
      'SELECT * FROM reports WHERE report_id = $1',
      [reportId]
    );
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Get report error:', error.message);
    return null;
  }
};

const updateReportDownloadCount = async (reportId) => {
  try {
    await queryApp(
      'UPDATE reports SET download_count = download_count + 1, updated_at = NOW() WHERE report_id = $1',
      [reportId]
    );
  } catch (error) {
    logger.error('Update download count error:', error.message);
  }
};

const listReports = async (limit = 50, offset = 0) => {
  try {
    const result = await queryApp(
      'SELECT * FROM reports ORDER BY generated_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  } catch (error) {
    logger.error('List reports error:', error.message);
    return [];
  }
};

const deleteReport = async (reportId) => {
  try {
    const result = await queryApp(
      'DELETE FROM reports WHERE report_id = $1 RETURNING id',
      [reportId]
    );
    return result.rows.length > 0;
  } catch (error) {
    logger.error('Delete report error:', error.message);
    return false;
  }
};

// Cleanup expired reports
const cleanupExpiredReports = async () => {
  try {
    const result = await queryApp(
      'DELETE FROM reports WHERE expires_at <= NOW() RETURNING id'
    );
    if (result.rows.length > 0) {
      logger.info(`Cleaned up ${result.rows.length} expired reports`);
    }
  } catch (error) {
    logger.error('Cleanup expired reports error:', error.message);
  }
};

// Graceful shutdown
const closeConnections = async () => {
  try {
    await frigatePool.end();
    await appPool.end();
    logger.info('Database connections closed');
  } catch (error) {
    logger.error('Error closing database connections:', error.message);
  }
};

module.exports = {
  // Pools
  frigatePool,
  appPool,
  
  // Connection functions
  testConnections,
  initializeAppDatabase,
  closeConnections,
  
  // Query functions
  queryFrigate,
  queryApp,
  
  // Cache functions
  setCache,
  getCache,
  clearExpiredCache,
  
  // Report functions
  saveReport,
  getReport,
  updateReportDownloadCount,
  listReports,
  deleteReport,
  cleanupExpiredReports
};

