/**
 * Redis-based Store Implementation for Rate Limiting
 * 
 * Provides a Redis storage mechanism for rate limiting data.
 * Suitable for distributed deployments and production environments.
 */

const Redis = require('ioredis');

/**
 * RedisStore class for rate limiting data
 */
class RedisStore {
  /**
   * Create a new Redis store
   * @param {Object} options - Redis connection options
   */
  constructor(options = {}) {
    // If client is provided, use it
    if (options.client) {
      this.client = options.client;
      this.externalClient = true;
    } else {
      // Create new Redis client
      this.client = new Redis({
        host: options.host || 'localhost',
        port: options.port || 6379,
        password: options.password,
        db: options.db || 0,
        keyPrefix: options.keyPrefix || 'rl:',
        ...options.redisOptions
      });
      this.externalClient = false;
    }
    
    // Set key prefix
    this.prefix = options.keyPrefix || 'rl:';
  }

  /**
   * Get value from store
   * @param {String} key - Unique key
   * @returns {Promise<Object|null>} Stored value or null
   */
  async get(key) {
    const value = await this.client.get(key);
    
    if (!value) {
      return null;
    }
    
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error('Error parsing Redis value:', error);
      return null;
    }
  }

  /**
   * Set value in store
   * @param {String} key - Unique key
   * @param {Object} value - Value to store
   * @param {Number} ttlMs - Time to live in milliseconds
   * @returns {Promise<Boolean>} Success status
   */
  async set(key, value, ttlMs) {
    const ttlSeconds = Math.ceil(ttlMs / 1000);
    const serialized = JSON.stringify(value);
    
    // Set value with expiration
    await this.client.set(key, serialized, 'EX', ttlSeconds);
    
    return true;
  }

  /**
   * Increment a counter in store using Lua script for atomicity
   * @param {String} key - Unique key
   * @param {Number} incrementBy - Amount to increment by
   * @param {Object} init - Initial value if key doesn't exist
   * @param {Number} ttlMs - Time to live in milliseconds
   * @returns {Promise<Object>} Updated value
   */
  async increment(key, incrementBy = 1, init = { count: 0 }, ttlMs) {
    const ttlSeconds = Math.ceil(ttlMs / 1000);
    const initialValue = JSON.stringify(init);
    
    // Lua script for atomic increment operation
    const script = `
      local current = redis.call('get', KEYS[1])
      local value
      
      if current then
        value = cjson.decode(current)
        value.count = value.count + ARGV[1]
      else
        value = cjson.decode(ARGV[2])
        value.count = value.count + ARGV[1]
      end
      
      local serialized = cjson.encode(value)
      redis.call('set', KEYS[1], serialized, 'EX', ARGV[3])
      
      return serialized
    `;
    
    // Execute Lua script
    const result = await this.client.eval(
      script,
      1,
      key,
      incrementBy.toString(),
      initialValue,
      ttlSeconds.toString()
    );
    
    try {
      return JSON.parse(result);
    } catch (error) {
      console.error('Error parsing Redis result:', error);
      return { ...init, count: incrementBy };
    }
  }

  /**
   * Decrement a counter in store using Lua script for atomicity
   * @param {String} key - Unique key
   * @param {Number} decrementBy - Amount to decrement by
   * @param {Number} ttlMs - Time to live in milliseconds
   * @returns {Promise<Object|null>} Updated value or null
   */
  async decrement(key, decrementBy = 1, ttlMs) {
    const ttlSeconds = Math.ceil(ttlMs / 1000);
    
    // Lua script for atomic decrement operation
    const script = `
      local current = redis.call('get', KEYS[1])
      
      if not current then
        return nil
      end
      
      local value = cjson.decode(current)
      value.count = math.max(0, value.count - ARGV[1])
      
      local serialized = cjson.encode(value)
      redis.call('set', KEYS[1], serialized, 'EX', ARGV[2])
      
      return serialized
    `;
    
    // Execute Lua script
    const result = await this.client.eval(
      script,
      1,
      key,
      decrementBy.toString(),
      ttlSeconds.toString()
    );
    
    if (!result) {
      return null;
    }
    
    try {
      return JSON.parse(result);
    } catch (error) {
      console.error('Error parsing Redis result:', error);
      return null;
    }
  }

  /**
   * Delete a key from store
   * @param {String} key - Unique key
   * @returns {Promise<Boolean>} Success status
   */
  async delete(key) {
    await this.client.del(key);
    return true;
  }

  /**
   * Reset the store (clear all data)
   * @returns {Promise<Boolean>} Success status
   */
  async reset() {
    // Get all keys with prefix
    const keys = await this.client.keys(`${this.prefix}*`);
    
    if (keys.length > 0) {
      // Delete all keys
      await this.client.del(...keys);
    }
    
    return true;
  }

  /**
   * Close the store (cleanup resources)
   */
  async close() {
    if (this.client && !this.externalClient) {
      await this.client.quit();
    }
  }
}

module.exports = RedisStore;
