/**
 * Rate Limiting Strategies
 * 
 * Exports various rate limiting strategies for use with the rate limiter middleware.
 */

const fixedWindowStrategy = require('./fixedWindowStrategy');
const slidingWindowStrategy = require('./slidingWindowStrategy');
const tokenBucketStrategy = require('./tokenBucketStrategy');

module.exports = {
  fixedWindowStrategy,
  slidingWindowStrategy,
  tokenBucketStrategy
};
