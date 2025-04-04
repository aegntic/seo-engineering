/**
 * Sliding Window Rate Limiting Strategy
 * 
 * Implements a sliding window rate limiting algorithm.
 * Provides more accurate rate limiting by considering the previous window.
 */

/**
 * Create a sliding window rate limiting strategy
 * @param {Object} store - Data store for rate limiting
 * @param {Object} options - Strategy configuration
 * @returns {Object} Strategy implementation
 */
function slidingWindowStrategy(store, options) {
  const windowMs = options.windowMs || 60000; // 1 minute
  const max = options.max || 60; // 60 requests per minute
  
  return {
    /**
     * Check if request is within rate limit
     * @param {String} key - Unique key for request
     * @returns {Promise<Object>} Result with allowed status
     */
    async checkLimit(key) {
      const now = Date.now();
      
      // Calculate current and previous window
      const currentWindow = Math.floor(now / windowMs);
      const previousWindow = currentWindow - 1;
      
      // Generate window keys
      const currentKey = `${key}:${currentWindow}`;
      const previousKey = `${key}:${previousWindow}`;
      
      // Get data for both windows
      const currentData = await store.get(currentKey) || { count: 0, createdAt: now };
      const previousData = await store.get(previousKey) || { count: 0, createdAt: now - windowMs };
      
      // Calculate weight for previous window (percentage of time remaining in current window)
      const windowProgress = (now % windowMs) / windowMs;
      const previousWindowWeight = 1 - windowProgress;
      
      // Calculate weighted count from previous window
      const previousWeightedCount = previousData.count * previousWindowWeight;
      
      // Calculate total count
      const totalCount = currentData.count + previousWeightedCount;
      
      // Increment current window
      const updatedData = await store.increment(currentKey, 1, { count: 0, createdAt: now }, windowMs);
      
      // Calculate remaining and reset time
      const remaining = Math.max(0, max - (updatedData.count + previousWeightedCount));
      const reset = (currentWindow + 1) * windowMs;
      
      return {
        allowed: totalCount < max,
        remaining: Math.floor(remaining),
        reset,
        used: Math.ceil(totalCount)
      };
    },
    
    /**
     * Decrement counter (for skipSuccessful option)
     * @param {String} key - Unique key for request
     * @returns {Promise<void>}
     */
    async decrementCounter(key) {
      const now = Date.now();
      const currentWindow = Math.floor(now / windowMs);
      const currentKey = `${key}:${currentWindow}`;
      
      await store.decrement(currentKey, 1, windowMs);
    }
  };
}

module.exports = slidingWindowStrategy;
