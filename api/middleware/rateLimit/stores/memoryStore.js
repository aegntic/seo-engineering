/**
 * Memory-based Store Implementation for Rate Limiting
 * 
 * Provides an in-memory storage mechanism for rate limiting data.
 * Suitable for single-instance deployments or development environments.
 */

/**
 * MemoryStore class for rate limiting data
 */
class MemoryStore {
  /**
   * Create a new memory store
   * @param {Object} options - Store configuration options
   */
  constructor(options = {}) {
    this.data = new Map();
    this.clusterMode = options.clusterMode || false;
    this.checkInterval = options.checkInterval || 60 * 1000; // 1 minute
    
    // Cleanup expired entries periodically
    this.interval = setInterval(() => this.cleanup(), this.checkInterval);
    
    // Ensure cleanup interval doesn't keep process alive
    this.interval.unref();
  }

  /**
   * Get value from store
   * @param {String} key - Unique key
   * @returns {Promise<Object|null>} Stored value or null
   */
  async get(key) {
    const value = this.data.get(key);
    
    // Check if value exists and is not expired
    if (value && value.expiresAt > Date.now()) {
      return value.data;
    }
    
    return null;
  }

  /**
   * Set value in store
   * @param {String} key - Unique key
   * @param {Object} value - Value to store
   * @param {Number} ttlMs - Time to live in milliseconds
   * @returns {Promise<Boolean>} Success status
   */
  async set(key, value, ttlMs) {
    const expiresAt = Date.now() + ttlMs;
    
    this.data.set(key, {
      data: value,
      expiresAt
    });
    
    return true;
  }

  /**
   * Increment a counter in store
   * @param {String} key - Unique key
   * @param {Number} incrementBy - Amount to increment by
   * @param {Object} init - Initial value if key doesn't exist
   * @param {Number} ttlMs - Time to live in milliseconds
   * @returns {Promise<Object>} Updated value
   */
  async increment(key, incrementBy = 1, init = { count: 0 }, ttlMs) {
    let value = await this.get(key) || { ...init };
    
    // Increment counter
    value.count = (value.count || 0) + incrementBy;
    
    // Set updated value in store
    await this.set(key, value, ttlMs);
    
    return value;
  }

  /**
   * Decrement a counter in store
   * @param {String} key - Unique key
   * @param {Number} decrementBy - Amount to decrement by
   * @param {Number} ttlMs - Time to live in milliseconds
   * @returns {Promise<Object|null>} Updated value or null
   */
  async decrement(key, decrementBy = 1, ttlMs) {
    const value = await this.get(key);
    
    if (!value) {
      return null;
    }
    
    // Decrement counter but don't go below 0
    value.count = Math.max(0, (value.count || 0) - decrementBy);
    
    // Set updated value in store
    await this.set(key, value, ttlMs);
    
    return value;
  }

  /**
   * Delete a key from store
   * @param {String} key - Unique key
   * @returns {Promise<Boolean>} Success status
   */
  async delete(key) {
    return this.data.delete(key);
  }

  /**
   * Reset the store (clear all data)
   * @returns {Promise<Boolean>} Success status
   */
  async reset() {
    this.data.clear();
    return true;
  }

  /**
   * Cleanup expired entries
   * @private
   */
  cleanup() {
    const now = Date.now();
    
    for (const [key, value] of this.data.entries()) {
      if (value.expiresAt <= now) {
        this.data.delete(key);
      }
    }
  }

  /**
   * Close the store (cleanup resources)
   */
  async close() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}

module.exports = MemoryStore;
