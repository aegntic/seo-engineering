/**
 * Token Bucket Rate Limiting Strategy
 * 
 * Implements a token bucket algorithm for rate limiting.
 * Tokens are replenished at a constant rate, allowing bursts of traffic.
 */

/**
 * Create a token bucket rate limiting strategy
 * @param {Object} store - Data store for rate limiting
 * @param {Object} options - Strategy configuration
 * @returns {Object} Strategy implementation
 */
function tokenBucketStrategy(store, options) {
  const windowMs = options.windowMs || 60000; // 1 minute
  const max = options.max || 60; // 60 tokens (bucket capacity)
  const refillRate = options.refillRate || max / windowMs; // Tokens per millisecond
  
  return {
    /**
     * Check if request is within rate limit
     * @param {String} key - Unique key for request
     * @returns {Promise<Object>} Result with allowed status
     */
    async checkLimit(key) {
      const now = Date.now();
      
      // Get current bucket data
      let bucket = await store.get(key) || {
        tokens: max,
        lastRefill: now,
        createdAt: now
      };
      
      // Calculate tokens to refill based on time elapsed
      const elapsed = now - bucket.lastRefill;
      const tokensToAdd = elapsed * refillRate;
      
      // Refill tokens (up to max capacity)
      bucket.tokens = Math.min(max, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now;
      
      // Check if enough tokens for this request
      const allowed = bucket.tokens >= 1;
      
      if (allowed) {
        // Consume one token
        bucket.tokens -= 1;
      }
      
      // Update bucket in store
      await store.set(key, bucket, windowMs * 10); // Longer TTL for token bucket
      
      // Calculate when bucket will be full again
      const tokensNeededForReset = max - bucket.tokens;
      const msUntilReset = tokensNeededForReset / refillRate;
      const reset = now + msUntilReset;
      
      return {
        allowed,
        remaining: Math.floor(bucket.tokens),
        reset: Math.ceil(reset),
        used: max - Math.floor(bucket.tokens)
      };
    },
    
    /**
     * Add token back to bucket (for skipSuccessful option)
     * @param {String} key - Unique key for request
     * @returns {Promise<void>}
     */
    async decrementCounter(key) {
      const bucket = await store.get(key);
      
      if (bucket) {
        // Add token back (up to max capacity)
        bucket.tokens = Math.min(max, bucket.tokens + 1);
        await store.set(key, bucket, windowMs * 10);
      }
    }
  };
}

module.exports = tokenBucketStrategy;
