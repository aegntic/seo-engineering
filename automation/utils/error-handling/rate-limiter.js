/**
 * Rate Limiter Implementation
 * 
 * Provides rate limiting functionality to prevent API abuse and throttling.
 * 
 * Last updated: April 4, 2025
 */

const logger = require('../logger');

/**
 * Rate limiter using token bucket algorithm
 */
class RateLimiter {
  /**
   * Creates a new rate limiter
   * 
   * @param {Object} options - Rate limiter options
   * @param {number} options.maxTokens - Maximum number of tokens (default: 60)
   * @param {number} options.refillRate - Tokens per second refill rate (default: 1)
   * @param {number} options.refillInterval - Refill interval in ms (default: 1000)
   * @param {boolean} options.waitForTokens - Whether to wait for tokens (default: false)
   */
  constructor(options = {}) {
    this.maxTokens = options.maxTokens || 60;
    this.refillRate = options.refillRate || 1;
    this.refillInterval = options.refillInterval || 1000;
    this.waitForTokens = options.waitForTokens !== undefined ? options.waitForTokens : false;
    
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
    this.waiting = [];
    
    // Start token refill interval
    this.refillIntervalId = setInterval(() => this.refillTokens(), this.refillInterval);
  }
  
  /**
   * Refills tokens based on elapsed time
   */
  refillTokens() {
    const now = Date.now();
    const elapsedMs = now - this.lastRefill;
    const elapsedSeconds = elapsedMs / 1000;
    const tokensToAdd = Math.floor(elapsedSeconds * this.refillRate);
    
    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.tokens + tokensToAdd, this.maxTokens);
      this.lastRefill = now;
      
      // Process waiting requests
      this.processWaiting();
    }
  }
  
  /**
   * Processes waiting requests when tokens are available
   */
  processWaiting() {
    while (this.waiting.length > 0 && this.tokens > 0) {
      const { resolve, tokensNeeded } = this.waiting.shift();
      
      if (this.tokens >= tokensNeeded) {
        this.tokens -= tokensNeeded;
        resolve(true);
      } else {
        // Not enough tokens yet, put back in queue
        this.waiting.unshift({ resolve, tokensNeeded });
        break;
      }
    }
  }
  
  /**
   * Acquires tokens from the bucket
   * 
   * @param {number} tokensNeeded - Number of tokens needed (default: 1)
   * @returns {Promise<boolean>} - Whether tokens were acquired
   */
  async acquire(tokensNeeded = 1) {
    // Refill tokens first
    this.refillTokens();
    
    // Check if enough tokens are available
    if (this.tokens >= tokensNeeded) {
      this.tokens -= tokensNeeded;
      return true;
    }
    
    // If not waiting for tokens, return false
    if (!this.waitForTokens) {
      return false;
    }
    
    // Wait for tokens to become available
    return new Promise(resolve => {
      this.waiting.push({ resolve, tokensNeeded });
    });
  }
  
  /**
   * Executes a function with rate limiting
   * 
   * @param {function} fn - Function to execute
   * @param {Object} options - Execution options
   * @param {number} options.tokensNeeded - Tokens needed (default: 1)
   * @param {boolean} options.waitForTokens - Override wait setting (optional)
   * @returns {Promise<*>} - Result of the function
   * @throws {Error} - If rate limited and not waiting
   */
  async execute(fn, options = {}) {
    const tokensNeeded = options.tokensNeeded || 1;
    const waitForTokens = options.waitForTokens !== undefined ? 
      options.waitForTokens : this.waitForTokens;
    
    // Try to acquire tokens
    const acquired = await this.acquire(tokensNeeded);
    
    if (!acquired) {
      const error = new Error('Rate limit exceeded');
      error.code = 'RATE_LIMIT_EXCEEDED';
      error.tokensNeeded = tokensNeeded;
      error.tokensAvailable = this.tokens;
      error.waitTime = this.estimateWaitTime(tokensNeeded);
      
      logger.warn(`Rate limit exceeded: ${tokensNeeded} tokens needed, ${this.tokens} available`);
      
      throw error;
    }
    
    // Execute the function
    return fn();
  }
  
  /**
   * Estimates wait time for tokens to become available
   * 
   * @param {number} tokensNeeded - Number of tokens needed
   * @returns {number} - Estimated wait time in milliseconds
   */
  estimateWaitTime(tokensNeeded) {
    const tokensToWaitFor = tokensNeeded - this.tokens;
    
    if (tokensToWaitFor <= 0) {
      return 0;
    }
    
    // Calculate time to refill needed tokens
    const timeToRefill = (tokensToWaitFor / this.refillRate) * 1000;
    return Math.ceil(timeToRefill);
  }
  
  /**
   * Gets the current rate limiter status
   * 
   * @returns {Object} - Current status
   */
  getStatus() {
    return {
      tokens: this.tokens,
      maxTokens: this.maxTokens,
      refillRate: this.refillRate,
      waitingCount: this.waiting.length,
      lastRefill: this.lastRefill
    };
  }
  
  /**
   * Stops the rate limiter
   */
  stop() {
    if (this.refillIntervalId) {
      clearInterval(this.refillIntervalId);
      this.refillIntervalId = null;
    }
  }
}

/**
 * Rate limiter registry to manage multiple rate limiters
 */
class RateLimiterRegistry {
  constructor() {
    this.limiters = new Map();
  }
  
  /**
   * Gets or creates a rate limiter by name
   * 
   * @param {string} name - Rate limiter name
   * @param {Object} options - Rate limiter options
   * @returns {RateLimiter} - Rate limiter instance
   */
  get(name, options = {}) {
    if (!this.limiters.has(name)) {
      this.limiters.set(name, new RateLimiter(options));
    }
    
    return this.limiters.get(name);
  }
  
  /**
   * Gets all rate limiter statuses
   * 
   * @returns {Object} - Map of rate limiter statuses
   */
  getStatuses() {
    const statuses = {};
    
    for (const [name, limiter] of this.limiters.entries()) {
      statuses[name] = limiter.getStatus();
    }
    
    return statuses;
  }
  
  /**
   * Stops all rate limiters
   */
  stopAll() {
    for (const limiter of this.limiters.values()) {
      limiter.stop();
    }
  }
}

// Create a global registry
const globalRegistry = new RateLimiterRegistry();

module.exports = {
  RateLimiter,
  RateLimiterRegistry,
  globalRegistry
};
