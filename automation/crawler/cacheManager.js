/**
 * SEO.engineering Cache Manager
 * 
 * This file implements a caching system for the crawler to reduce 
 * redundant requests and improve performance.
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class CacheManager {
  /**
   * Create a new cache manager
   * @param {Object} options Cache configuration options
   */
  constructor(options = {}) {
    this.cacheDirectory = options.cacheDirectory || './cache';
    this.cacheTTL = options.cacheTTL || 86400; // 24 hours in seconds
    this.enabled = options.enabled !== undefined ? options.enabled : true;
    this.stats = {
      hits: 0,
      misses: 0,
      stored: 0,
      evicted: 0
    };
  }

  /**
   * Initialize the cache directory
   */
  async initialize() {
    if (!this.enabled) return;
    
    try {
      await fs.mkdir(this.cacheDirectory, { recursive: true });
      console.log(`Cache directory initialized: ${this.cacheDirectory}`);
      
      // Start periodic cache maintenance
      this.startMaintenance();
    } catch (err) {
      console.error(`Failed to initialize cache directory: ${err.message}`);
      throw err;
    }
  }

  /**
   * Generate a cache key from a URL
   * @param {string} url The URL to create a key for
   * @returns {string} The cache key
   */
  generateKey(url) {
    return crypto.createHash('md5').update(url).digest('hex');
  }

  /**
   * Get the file path for a cache key
   * @param {string} key The cache key
   * @returns {string} The file path
   */
  getFilePath(key) {
    return path.join(this.cacheDirectory, `${key}.json`);
  }

  /**
   * Store a response in the cache
   * @param {string} url The URL that was requested
   * @param {Object} response The response to cache
   */
  async set(url, response) {
    if (!this.enabled) return;
    
    try {
      const key = this.generateKey(url);
      const filePath = this.getFilePath(key);
      
      const cacheEntry = {
        url,
        response,
        timestamp: Date.now(),
        expires: Date.now() + (this.cacheTTL * 1000)
      };
      
      await fs.writeFile(filePath, JSON.stringify(cacheEntry));
      this.stats.stored++;
      
      console.log(`Cached response for: ${url}`);
    } catch (err) {
      console.error(`Failed to cache response for ${url}: ${err.message}`);
    }
  }

  /**
   * Get a response from the cache
   * @param {string} url The URL to retrieve
   * @returns {Object|null} The cached response or null if not found/expired
   */
  async get(url) {
    if (!this.enabled) return null;
    
    try {
      const key = this.generateKey(url);
      const filePath = this.getFilePath(key);
      
      const data = await fs.readFile(filePath, 'utf8');
      const cacheEntry = JSON.parse(data);
      
      // Check if cache entry is expired
      if (cacheEntry.expires < Date.now()) {
        await fs.unlink(filePath);
        this.stats.evicted++;
        console.log(`Cache expired for: ${url}`);
        this.stats.misses++;
        return null;
      }
      
      console.log(`Cache hit for: ${url}`);
      this.stats.hits++;
      return cacheEntry.response;
    } catch (err) {
      // If file doesn't exist or can't be read, it's a cache miss
      if (err.code === 'ENOENT') {
        this.stats.misses++;
        return null;
      }
      
      console.error(`Error retrieving cache for ${url}: ${err.message}`);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Check if a URL is cached and not expired
   * @param {string} url The URL to check
   * @returns {boolean} True if the URL is cached and valid
   */
  async isCached(url) {
    if (!this.enabled) return false;
    
    try {
      const key = this.generateKey(url);
      const filePath = this.getFilePath(key);
      
      const data = await fs.readFile(filePath, 'utf8');
      const cacheEntry = JSON.parse(data);
      
      return cacheEntry.expires >= Date.now();
    } catch (err) {
      return false;
    }
  }

  /**
   * Remove an entry from the cache
   * @param {string} url The URL to remove
   */
  async invalidate(url) {
    if (!this.enabled) return;
    
    try {
      const key = this.generateKey(url);
      const filePath = this.getFilePath(key);
      
      await fs.unlink(filePath);
      this.stats.evicted++;
      console.log(`Cache invalidated for: ${url}`);
    } catch (err) {
      // Ignore if file doesn't exist
      if (err.code !== 'ENOENT') {
        console.error(`Error invalidating cache for ${url}: ${err.message}`);
      }
    }
  }

  /**
   * Clear all entries from the cache
   */
  async clear() {
    if (!this.enabled) return;
    
    try {
      const files = await fs.readdir(this.cacheDirectory);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          await fs.unlink(path.join(this.cacheDirectory, file));
          this.stats.evicted++;
        }
      }
      
      console.log(`Cache cleared (${files.length} entries removed)`);
    } catch (err) {
      console.error(`Error clearing cache: ${err.message}`);
    }
  }

  /**
   * Perform cache maintenance by removing expired entries
   */
  async maintenance() {
    if (!this.enabled) return;
    
    try {
      const files = await fs.readdir(this.cacheDirectory);
      let expiredCount = 0;
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.cacheDirectory, file);
          
          try {
            const data = await fs.readFile(filePath, 'utf8');
            const cacheEntry = JSON.parse(data);
            
            if (cacheEntry.expires < Date.now()) {
              await fs.unlink(filePath);
              this.stats.evicted++;
              expiredCount++;
            }
          } catch (err) {
            // If we can't read the file, consider it corrupted and remove it
            try {
              await fs.unlink(filePath);
              this.stats.evicted++;
              expiredCount++;
            } catch (unlinkErr) {
              console.error(`Failed to remove corrupted cache file ${file}: ${unlinkErr.message}`);
            }
          }
        }
      }
      
      console.log(`Cache maintenance completed: ${expiredCount} expired entries removed`);
    } catch (err) {
      console.error(`Error during cache maintenance: ${err.message}`);
    }
  }

  /**
   * Start periodic cache maintenance
   */
  startMaintenance() {
    // Run maintenance once per hour
    const ONE_HOUR = 60 * 60 * 1000;
    setInterval(() => this.maintenance(), ONE_HOUR);
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    return {
      ...this.stats,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      entryCount: this.stats.stored - this.stats.evicted
    };
  }
}

module.exports = CacheManager;