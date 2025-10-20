const logger = require('../config/logger');

/**
 * Cache Service - Performance optimization and caching
 * 
 * Features:
 * - In-memory caching for frequently accessed data
 * - TTL (Time To Live) support
 * - Cache invalidation strategies
 * - Performance metrics and monitoring
 * - Memory usage optimization
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      memory_usage: 0
    };
    this.maxSize = 1000; // Maximum number of cache entries
    this.defaultTTL = 300000; // 5 minutes in milliseconds
  }

  /**
   * Set a cache entry with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  set(key, value, ttl = this.defaultTTL) {
    try {
      // Remove oldest entries if cache is full
      if (this.cache.size >= this.maxSize) {
        this.evictOldest();
      }

      const expiresAt = Date.now() + ttl;
      this.cache.set(key, {
        value,
        expiresAt,
        createdAt: Date.now(),
        accessCount: 0
      });

      this.stats.sets++;
      this.updateMemoryUsage();
      
      logger.debug(`Cache SET: ${key} (TTL: ${ttl}ms)`);
    } catch (error) {
      logger.error('Error setting cache entry:', error);
    }
  }

  /**
   * Get a cache entry
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null if not found/expired
   */
  get(key) {
    try {
      const entry = this.cache.get(key);
      
      if (!entry) {
        this.stats.misses++;
        return null;
      }

      // Check if expired
      if (Date.now() > entry.expiresAt) {
        this.cache.delete(key);
        this.stats.misses++;
        this.stats.deletes++;
        return null;
      }

      // Update access count and return value
      entry.accessCount++;
      this.stats.hits++;
      
      logger.debug(`Cache HIT: ${key} (access count: ${entry.accessCount})`);
      return entry.value;
    } catch (error) {
      logger.error('Error getting cache entry:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Delete a cache entry
   * @param {string} key - Cache key
   */
  delete(key) {
    try {
      if (this.cache.delete(key)) {
        this.stats.deletes++;
        logger.debug(`Cache DELETE: ${key}`);
      }
    } catch (error) {
      logger.error('Error deleting cache entry:', error);
    }
  }

  /**
   * Clear all cache entries
   */
  clear() {
    try {
      this.cache.clear();
      this.stats.deletes += this.cache.size;
      logger.info('Cache cleared');
    } catch (error) {
      logger.error('Error clearing cache:', error);
    }
  }

  /**
   * Check if a key exists and is not expired
   * @param {string} key - Cache key
   * @returns {boolean} - True if key exists and is valid
   */
  has(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.deletes++;
      return false;
    }
    
    return true;
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
      : 0;

    return {
      ...this.stats,
      hit_rate: `${hitRate}%`,
      size: this.cache.size,
      max_size: this.maxSize,
      memory_usage_mb: (this.stats.memory_usage / 1024 / 1024).toFixed(2)
    };
  }

  /**
   * Evict the oldest cache entry
   */
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.deletes++;
      logger.debug(`Cache EVICTED: ${oldestKey} (oldest entry)`);
    }
  }

  /**
   * Clean expired entries
   */
  cleanExpired() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.stats.deletes += cleaned;
      logger.debug(`Cache CLEANED: ${cleaned} expired entries`);
    }
  }

  /**
   * Update memory usage statistics
   */
  updateMemoryUsage() {
    try {
      let totalSize = 0;
      for (const [key, entry] of this.cache.entries()) {
        totalSize += key.length * 2; // Rough estimate for string length
        totalSize += JSON.stringify(entry).length * 2; // Rough estimate for object size
      }
      this.stats.memory_usage = totalSize;
    } catch (error) {
      logger.error('Error calculating memory usage:', error);
    }
  }

  /**
   * Get cache entry details
   * @param {string} key - Cache key
   * @returns {Object|null} - Cache entry details or null
   */
  getEntryDetails(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    return {
      key,
      value: entry.value,
      created_at: new Date(entry.createdAt).toISOString(),
      expires_at: new Date(entry.expiresAt).toISOString(),
      access_count: entry.accessCount,
      is_expired: Date.now() > entry.expiresAt,
      ttl_remaining: Math.max(0, entry.expiresAt - Date.now())
    };
  }

  /**
   * Get all cache keys
   * @returns {Array} - Array of cache keys
   */
  getKeys() {
    return Array.from(this.cache.keys());
  }

  /**
   * Warm up cache with frequently accessed data
   * @param {Function} dataLoader - Function to load data
   * @param {Array} keys - Array of keys to warm up
   */
  async warmUp(dataLoader, keys) {
    try {
      logger.info(`Warming up cache with ${keys.length} keys`);
      
      for (const key of keys) {
        if (!this.has(key)) {
          try {
            const data = await dataLoader(key);
            this.set(key, data, this.defaultTTL);
          } catch (error) {
            logger.error(`Error warming up cache for key ${key}:`, error);
          }
        }
      }
      
      logger.info('Cache warm-up completed');
    } catch (error) {
      logger.error('Error during cache warm-up:', error);
    }
  }
}

// Create singleton instance
const cacheService = new CacheService();

// Clean expired entries every 5 minutes
setInterval(() => {
  cacheService.cleanExpired();
}, 5 * 60 * 1000);

module.exports = cacheService;

