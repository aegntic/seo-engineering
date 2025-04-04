/**
 * Rate Limiting Framework
 * 
 * Provides configurable rate limiting strategies to protect API endpoints.
 * Implements a modular approach with strategy pattern for different limiting algorithms.
 */

const { RateLimitError } = require('../../utils/errors');
const MemoryStore = require('./stores/memoryStore');
const RedisStore = require('./stores/redisStore');
const { fixedWindowStrategy, slidingWindowStrategy, tokenBucketStrategy } = require('./strategies');

/**
 * Factory function to create rate limiter middleware with configurable options
 * 
 * @param {Object} options - Configuration options for rate limiter
 * @param {String} options.prefix - Prefix for rate limit keys (default: 'rl')
 * @param {Number} options.windowMs - Time window in milliseconds (default: 60000 - 1 minute)
 * @param {Number} options.max - Maximum number of requests per window (default: 60)
 * @param {String} options.message - Error message when rate limit is exceeded
 * @param {String} options.store - Store type: 'memory' or 'redis' (default: 'memory')
 * @param {Object} options.storeOptions - Options for the selected store
 * @param {String} options.strategy - Rate limiting strategy: 'fixed', 'sliding', 'token' (default: 'fixed')
 * @param {Function} options.keyGenerator - Function to generate unique keys for rate limiting
 * @param {Function} options.handler - Custom response handler for rate limit exceeded
 * @param {Boolean} options.skipSuccessful - Skip successful requests in count (default: false)
 * @param {Function} options.skip - Function to determine if rate limiting should be skipped
 * @returns {Function} Express middleware function
 */
function rateLimit(options = {}) {
  // Default configuration
  const config = {
    prefix: options.prefix || 'rl',
    windowMs: options.windowMs || 60 * 1000, // 1 minute
    max: options.max || 60, // 60 requests per minute
    message: options.message || 'Too many requests, please try again later',
    store: options.store || 'memory',
    storeOptions: options.storeOptions || {},
    strategy: options.strategy || 'fixed',
    skipSuccessful: options.skipSuccessful || false,
    skip: options.skip || (() => false)
  };

  // Initialize store based on configuration
  let store;
  if (config.store === 'redis') {
    store = new RedisStore(config.storeOptions);
  } else {
    store = new MemoryStore(config.storeOptions);
  }

  // Initialize strategy based on configuration
  let strategyImplementation;
  switch (config.strategy) {
    case 'sliding':
      strategyImplementation = slidingWindowStrategy(store, config);
      break;
    case 'token':
      strategyImplementation = tokenBucketStrategy(store, config);
      break;
    case 'fixed':
    default:
      strategyImplementation = fixedWindowStrategy(store, config);
      break;
  }

  // Key generator function
  const keyGenerator = options.keyGenerator || ((req) => {
    // Default: Use IP address and route path
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const path = req.originalUrl || req.url;
    
    // If authenticated, include user ID in key
    const userId = req.user ? req.user._id : '';
    const agencyId = req.agency ? req.agency._id : '';
    
    return `${config.prefix}:${ip}:${path}:${userId}:${agencyId}`;
  });

  // Custom response handler
  const handleRateLimitExceeded = options.handler || ((req, res, next, info) => {
    const error = new RateLimitError(config.message);
    
    // Attach rate limit info to response headers
    res.setHeader('X-RateLimit-Limit', info.limit);
    res.setHeader('X-RateLimit-Remaining', info.remaining);
    res.setHeader('X-RateLimit-Reset', info.reset);
    
    return res.status(429).json({
      success: false,
      message: error.message,
      retryAfter: Math.ceil((info.reset - Date.now()) / 1000)
    });
  });

  // Return middleware function
  return async (req, res, next) => {
    try {
      // Skip rate limiting if configured to do so
      if (config.skip(req, res)) {
        return next();
      }

      // Generate key for this request
      const key = keyGenerator(req);

      // Apply rate limiting strategy
      const result = await strategyImplementation.checkLimit(key);

      // If rate limit exceeded
      if (!result.allowed) {
        return handleRateLimitExceeded(req, res, next, {
          limit: config.max,
          remaining: result.remaining,
          reset: result.reset,
          used: result.used
        });
      }

      // Add headers to response
      res.setHeader('X-RateLimit-Limit', config.max);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', result.reset);

      // If configured to skip successful requests
      if (config.skipSuccessful) {
        // Capture original end method
        const originalEnd = res.end;
        
        // Override end method to decrement counter for successful responses
        res.end = function (chunk, encoding) {
          // Call original end method
          originalEnd.call(this, chunk, encoding);
          
          // If response was successful, decrement counter
          if (this.statusCode < 400) {
            strategyImplementation.decrementCounter(key);
          }
        };
      }

      // Continue to next middleware
      next();
    } catch (error) {
      // In case of internal error, continue to next middleware
      console.error('Rate limit error:', error);
      next();
    }
  };
}

// Export middleware factory
module.exports = rateLimit;
