/**
 * Fixed Window Rate Limiting Strategy
 * 
 * Implements a fixed window rate limiting algorithm.
 * Limits are based on a fixed time window (e.g., 60 requests per minute).
 */

/**
 * Create a fixed window rate limiting strategy
 * @param {Object} store - Data store for rate limiting
 * @param {Object} options - Strategy configuration
 * @returns {Object} Strategy implementation
 */
function fixedWindowStrategy(store, options) {
  const windowMs = options.windowMs || 60000; // 1 minute
  const max = options.max || 60; // 60 requests per minute
  
  return {
    /**
     * Check if request is within rate limit
     * @param {String} key - Unique key for request
     * @returns {Promise<Object>} Result with allowed status
     */
    async checkLimit(key) {
      // Get current window data
      const now = Date.now();
      const windowKey = `${key}:${Math.floor(now / windowMs)}`;
      
      // Increment counter for current window
      const data = await store.increment(windowKey, 1, { count: 0, createdAt: now }, windowMs);
      
      // Calculate results
      const count = data.count || 0;
      const remaining = Math.max(0, max - count);
      const reset = Math.ceil(now / windowMs) * windowMs;
      
      return {
        allowed: count <= max,
        remaining,
        reset,
        used: count
      };
    },
    
    /**
     * Decrement counter (for skipSuccessful option)
     * @param {String} key - Unique key for request
     * @returns {Promise<void>}
     */
    async decrementCounter(key) {
      const now = Date.now();
      const windowKey = `${key}:${Math.floor(now / windowMs)}`;
      
      await store.decrement(windowKey, 1, windowMs);
    }
  };
}

module.exports = fixedWindowStrategy;
