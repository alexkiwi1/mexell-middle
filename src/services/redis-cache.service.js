const { redisUtils } = require('../config/redis');
const logger = require('../config/logger');

// Cache configuration
const CACHE_CONFIG = {
  // Default TTL values (in seconds)
  TTL: {
    SHORT: 60,        // 1 minute
    MEDIUM: 300,      // 5 minutes
    LONG: 1800,       // 30 minutes
    VERY_LONG: 3600,  // 1 hour
    EXTREME: 86400,   // 24 hours
  },
  
  // Cache key prefixes
  PREFIXES: {
    CAMERAS: 'cameras:',
    VIOLATIONS: 'violations:',
    EMPLOYEES: 'employees:',
    ZONES: 'zones:',
    ANALYTICS: 'analytics:',
    PERFORMANCE: 'performance:',
    WEBSOCKET: 'websocket:',
    MOBILE: 'mobile:',
    MEDIA: 'media:',
  },
  
  // Cache strategies
  STRATEGIES: {
    CACHE_FIRST: 'cache_first',      // Try cache first, fallback to source
    SOURCE_FIRST: 'source_first',    // Try source first, update cache
    CACHE_ONLY: 'cache_only',        // Only use cache
    SOURCE_ONLY: 'source_only',      // Only use source, no caching
  }
};

// Enhanced cache service with Redis integration
class RedisCacheService {
  constructor() {
    this.memoryCache = new Map(); // Fallback memory cache
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      memoryHits: 0,
      redisHits: 0,
    };
  }

  // Generate cache key with prefix
  generateKey(prefix, ...parts) {
    return `${prefix}${parts.join(':')}`;
  }

  // Set cache with strategy
  async set(key, value, ttl = CACHE_CONFIG.TTL.MEDIUM, strategy = CACHE_CONFIG.STRATEGIES.CACHE_FIRST) {
    try {
      const cacheKey = this.generateKey('frigate:', key);
      
      // Always store in memory cache as fallback
      this.memoryCache.set(cacheKey, {
        value,
        expiry: Date.now() + (ttl * 1000),
        strategy
      });

      // Store in Redis if available
      if (redisUtils.isAvailable()) {
        const success = await redisUtils.setex(cacheKey, ttl, value);
        if (success) {
          this.stats.sets++;
          logger.debug(`Cache SET (Redis): ${cacheKey}, TTL: ${ttl}s`);
        } else {
          logger.warn(`Cache SET failed (Redis): ${cacheKey}`);
          this.stats.errors++;
        }
      } else {
        logger.debug(`Cache SET (Memory only): ${cacheKey}, TTL: ${ttl}s`);
        this.stats.sets++;
      }

      return true;
    } catch (error) {
      logger.error('Cache SET error:', error);
      this.stats.errors++;
      return false;
    }
  }

  // Get cache with strategy
  async get(key, strategy = CACHE_CONFIG.STRATEGIES.CACHE_FIRST) {
    try {
      const cacheKey = this.generateKey('frigate:', key);
      
      // Try Redis first if available
      if (redisUtils.isAvailable()) {
        const redisValue = await redisUtils.get(cacheKey);
        if (redisValue !== null) {
          this.stats.hits++;
          this.stats.redisHits++;
          logger.debug(`Cache HIT (Redis): ${cacheKey}`);
          return redisValue;
        }
      }

      // Fallback to memory cache
      const memoryItem = this.memoryCache.get(cacheKey);
      if (memoryItem && Date.now() < memoryItem.expiry) {
        this.stats.hits++;
        this.stats.memoryHits++;
        logger.debug(`Cache HIT (Memory): ${cacheKey}`);
        return memoryItem.value;
      } else if (memoryItem) {
        // Expired memory cache item
        this.memoryCache.delete(cacheKey);
      }

      this.stats.misses++;
      logger.debug(`Cache MISS: ${cacheKey}`);
      return null;
    } catch (error) {
      logger.error('Cache GET error:', error);
      this.stats.errors++;
      return null;
    }
  }

  // Get or set pattern
  async getOrSet(key, fetchFunction, ttl = CACHE_CONFIG.TTL.MEDIUM, strategy = CACHE_CONFIG.STRATEGIES.CACHE_FIRST) {
    try {
      // Try to get from cache first
      if (strategy === CACHE_CONFIG.STRATEGIES.CACHE_FIRST || strategy === CACHE_CONFIG.STRATEGIES.CACHE_ONLY) {
        const cached = await this.get(key, strategy);
        if (cached !== null) {
          return cached;
        }
      }

      // If cache-only strategy and no cache, return null
      if (strategy === CACHE_CONFIG.STRATEGIES.CACHE_ONLY) {
        return null;
      }

      // Fetch from source
      const value = await fetchFunction();
      
      // Cache the result
      if (strategy !== CACHE_CONFIG.STRATEGIES.SOURCE_ONLY) {
        await this.set(key, value, ttl, strategy);
      }

      return value;
    } catch (error) {
      logger.error('Cache getOrSet error:', error);
      this.stats.errors++;
      throw error;
    }
  }

  // Delete cache
  async del(key) {
    try {
      const cacheKey = this.generateKey('frigate:', key);
      
      // Delete from memory cache
      this.memoryCache.delete(cacheKey);
      
      // Delete from Redis if available
      if (redisUtils.isAvailable()) {
        await redisUtils.del(cacheKey);
      }

      this.stats.deletes++;
      logger.debug(`Cache DEL: ${cacheKey}`);
      return true;
    } catch (error) {
      logger.error('Cache DEL error:', error);
      this.stats.errors++;
      return false;
    }
  }

  // Set multiple keys
  async mset(keyValuePairs, ttl = CACHE_CONFIG.TTL.MEDIUM) {
    try {
      const results = [];
      
      for (const [key, value] of Object.entries(keyValuePairs)) {
        const result = await this.set(key, value, ttl);
        results.push({ key, success: result });
      }

      return results;
    } catch (error) {
      logger.error('Cache mset error:', error);
      this.stats.errors++;
      return [];
    }
  }

  // Get multiple keys
  async mget(keys) {
    try {
      const results = {};
      
      for (const key of keys) {
        const value = await this.get(key);
        results[key] = value;
      }

      return results;
    } catch (error) {
      logger.error('Cache mget error:', error);
      this.stats.errors++;
      return {};
    }
  }

  // Clear cache by prefix
  async clearPrefix(prefix) {
    try {
      // Clear memory cache
      const memoryKeys = Array.from(this.memoryCache.keys()).filter(key => key.includes(prefix));
      memoryKeys.forEach(key => this.memoryCache.delete(key));

      // Clear Redis cache
      if (redisUtils.isAvailable()) {
        await redisUtils.clearPrefix(`frigate:${prefix}`);
      }

      logger.info(`Cache cleared for prefix: ${prefix}`);
      return true;
    } catch (error) {
      logger.error('Cache clearPrefix error:', error);
      this.stats.errors++;
      return false;
    }
  }

  // Clear all cache
  async clear() {
    try {
      // Clear memory cache
      this.memoryCache.clear();

      // Clear Redis cache
      if (redisUtils.isAvailable()) {
        await redisUtils.clearPrefix('frigate:');
      }

      // Reset stats
      this.stats = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        errors: 0,
        memoryHits: 0,
        redisHits: 0,
      };

      logger.info('All cache cleared');
      return true;
    } catch (error) {
      logger.error('Cache clear error:', error);
      this.stats.errors++;
      return false;
    }
  }

  // Get cache statistics
  getStats() {
    const totalAttempts = this.stats.hits + this.stats.misses;
    const hitRate = totalAttempts > 0 ? ((this.stats.hits / totalAttempts) * 100).toFixed(2) : '0';
    
    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      memoryCacheSize: this.memoryCache.size,
      redisAvailable: redisUtils.isAvailable(),
      totalAttempts,
    };
  }

  // Get cache keys
  getKeys() {
    return Array.from(this.memoryCache.keys());
  }

  // Cache warming functions
  async warmCache() {
    try {
      logger.info('Starting cache warming...');
      
      // Warm common endpoints
      const warmingTasks = [
        // Add specific warming tasks here
        // Example: this.warmCameraList(),
        // Example: this.warmViolationStats(),
      ];

      await Promise.all(warmingTasks);
      logger.info('Cache warming completed');
      return true;
    } catch (error) {
      logger.error('Cache warming error:', error);
      return false;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const testKey = 'health:check';
      const testValue = { timestamp: Date.now(), status: 'ok' };
      
      // Test set
      const setResult = await this.set(testKey, testValue, 10);
      if (!setResult) return { status: 'error', message: 'Cache set failed' };

      // Test get
      const getValue = await this.get(testKey);
      if (!getValue || getValue.status !== 'ok') {
        return { status: 'error', message: 'Cache get failed' };
      }

      // Clean up
      await this.del(testKey);

      return {
        status: 'ok',
        redis: redisUtils.isAvailable(),
        memory: this.memoryCache.size,
        stats: this.getStats()
      };
    } catch (error) {
      logger.error('Cache health check error:', error);
      return { status: 'error', message: error.message };
    }
  }
}

// Create singleton instance
const redisCacheService = new RedisCacheService();

module.exports = {
  redisCacheService,
  CACHE_CONFIG
};

