const Redis = require('ioredis');
const logger = require('./logger');

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || null,
  db: process.env.REDIS_DB || 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
  retryDelayOnClusterDown: 300,
  enableOfflineQueue: false,
  maxLoadingTimeout: 10000,
  enableReadyCheck: true,
  maxMemoryPolicy: 'allkeys-lru',
  // Connection pool settings
  family: 4, // 4 (IPv4) or 6 (IPv6)
  keyPrefix: 'frigate:',
  // Cluster settings (if using Redis Cluster)
  enableCluster: process.env.REDIS_CLUSTER === 'true',
  clusterNodes: process.env.REDIS_CLUSTER_NODES ? 
    process.env.REDIS_CLUSTER_NODES.split(',') : 
    ['redis://localhost:6379'],
};

// Create Redis client
let redisClient = null;

const createRedisClient = () => {
  try {
    if (redisConfig.enableCluster) {
      redisClient = new Redis.Cluster(redisConfig.clusterNodes, {
        redisOptions: {
          password: redisConfig.password,
          db: redisConfig.db,
        },
        enableOfflineQueue: false,
        maxRedirections: 16,
        retryDelayOnFailover: 100,
        retryDelayOnClusterDown: 300,
        maxRetriesPerRequest: 3,
      });
    } else {
      redisClient = new Redis(redisConfig);
    }

    // Event handlers
    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('error', (err) => {
      logger.error('Redis client error:', err);
    });

    redisClient.on('close', () => {
      logger.warn('Redis client connection closed');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis client reconnecting...');
    });

    redisClient.on('end', () => {
      logger.warn('Redis client connection ended');
    });

    return redisClient;
  } catch (error) {
    logger.error('Failed to create Redis client:', error);
    return null;
  }
};

// Initialize Redis client
const initRedis = async () => {
  try {
    redisClient = createRedisClient();
    if (redisClient) {
      await redisClient.ping();
      logger.info('Redis connection established successfully');
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Failed to initialize Redis:', error);
    return false;
  }
};

// Redis utility functions
const redisUtils = {
  // Get client
  getClient: () => redisClient,

  // Check if Redis is available
  isAvailable: () => redisClient && redisClient.status === 'ready',

  // Set with TTL
  setex: async (key, ttl, value) => {
    if (!redisUtils.isAvailable()) return false;
    try {
      const serializedValue = JSON.stringify(value);
      await redisClient.setex(key, ttl, serializedValue);
      return true;
    } catch (error) {
      logger.error('Redis setex error:', error);
      return false;
    }
  },

  // Get value
  get: async (key) => {
    if (!redisUtils.isAvailable()) return null;
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  },

  // Delete key
  del: async (key) => {
    if (!redisUtils.isAvailable()) return false;
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error('Redis del error:', error);
      return false;
    }
  },

  // Set multiple keys
  mset: async (keyValuePairs) => {
    if (!redisUtils.isAvailable()) return false;
    try {
      const serializedPairs = {};
      for (const [key, value] of Object.entries(keyValuePairs)) {
        serializedPairs[key] = JSON.stringify(value);
      }
      await redisClient.mset(serializedPairs);
      return true;
    } catch (error) {
      logger.error('Redis mset error:', error);
      return false;
    }
  },

  // Get multiple keys
  mget: async (keys) => {
    if (!redisUtils.isAvailable()) return [];
    try {
      const values = await redisClient.mget(keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      logger.error('Redis mget error:', error);
      return [];
    }
  },

  // Increment counter
  incr: async (key, ttl = null) => {
    if (!redisUtils.isAvailable()) return 0;
    try {
      const result = await redisClient.incr(key);
      if (ttl && result === 1) {
        await redisClient.expire(key, ttl);
      }
      return result;
    } catch (error) {
      logger.error('Redis incr error:', error);
      return 0;
    }
  },

  // Set expiration
  expire: async (key, ttl) => {
    if (!redisUtils.isAvailable()) return false;
    try {
      await redisClient.expire(key, ttl);
      return true;
    } catch (error) {
      logger.error('Redis expire error:', error);
      return false;
    }
  },

  // Get TTL
  ttl: async (key) => {
    if (!redisUtils.isAvailable()) return -1;
    try {
      return await redisClient.ttl(key);
    } catch (error) {
      logger.error('Redis ttl error:', error);
      return -1;
    }
  },

  // Clear all keys with prefix
  clearPrefix: async (prefix = 'frigate:') => {
    if (!redisUtils.isAvailable()) return false;
    try {
      const keys = await redisClient.keys(`${prefix}*`);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
      return true;
    } catch (error) {
      logger.error('Redis clearPrefix error:', error);
      return false;
    }
  },

  // Get Redis info
  info: async () => {
    if (!redisUtils.isAvailable()) return null;
    try {
      return await redisClient.info();
    } catch (error) {
      logger.error('Redis info error:', error);
      return null;
    }
  },

  // Close connection
  close: async () => {
    if (redisClient) {
      await redisClient.quit();
      redisClient = null;
      logger.info('Redis connection closed');
    }
  }
};

module.exports = {
  initRedis,
  redisUtils,
  redisConfig
};

