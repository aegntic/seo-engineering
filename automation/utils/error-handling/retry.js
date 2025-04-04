/**
 * Retry Mechanism with Exponential Backoff
 * 
 * Implements automatic retries with exponential backoff for failed operations.
 * 
 * Last updated: April 4, 2025
 */

const logger = require('../logger');

/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS = {
  maxRetries: 3,            // Maximum number of retry attempts
  initialDelay: 1000,       // Initial delay in milliseconds (1 second)
  maxDelay: 30000,          // Maximum delay in milliseconds (30 seconds)
  factor: 2,                // Exponential backoff factor
  jitter: true,             // Whether to add jitter to delays
  shouldRetry: () => true   // Function to determine if a retry should be attempted
};

/**
 * Waits for a specified number of milliseconds
 * 
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>} - Promise that resolves after the delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculates the next delay with exponential backoff
 * 
 * @param {number} attempt - Current attempt number (1-based)
 * @param {Object} options - Retry options
 * @returns {number} - Delay in milliseconds
 */
function calculateDelay(attempt, options) {
  const { initialDelay, factor, maxDelay, jitter } = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options
  };
  
  // Calculate exponential backoff
  let delay = initialDelay * Math.pow(factor, attempt - 1);
  
  // Apply maximum delay
  delay = Math.min(delay, maxDelay);
  
  // Add jitter if enabled (±20% randomness)
  if (jitter) {
    const jitterFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
    delay = Math.floor(delay * jitterFactor);
  }
  
  return delay;
}

/**
 * Executes a function with retry capability
 * 
 * @param {function} fn - Function to execute
 * @param {Object} options - Retry options
 * @returns {Promise<*>} - Result of the function
 * @throws {Error} - If all retries fail
 */
async function retryWithBackoff(fn, options = {}) {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  const { maxRetries, shouldRetry } = config;
  
  let attempt = 1;
  let lastError = null;
  
  while (attempt <= maxRetries + 1) { // +1 for initial attempt
    try {
      if (attempt > 1) {
        logger.info(`Retry attempt ${attempt - 1} of ${maxRetries}`);
      }
      
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      if (attempt > maxRetries || !shouldRetry(error, attempt)) {
        break;
      }
      
      // Calculate delay for next attempt
      const delay = calculateDelay(attempt, config);
      
      logger.warn(`Operation failed, retrying in ${delay}ms: ${error.message}`);
      
      // Wait before next attempt
      await sleep(delay);
      
      attempt++;
    }
  }
  
  // All retries failed
  if (lastError) {
    logger.error(`All retry attempts failed: ${lastError.message}`);
    throw lastError;
  }
}

/**
 * Creates a wrapped version of a function with retry capability
 * 
 * @param {function} fn - Function to wrap
 * @param {Object} options - Retry options
 * @returns {function} - Wrapped function
 */
function withRetry(fn, options = {}) {
  return async (...args) => {
    return retryWithBackoff(() => fn(...args), options);
  };
}

/**
 * Creates a wrapped version of a module with retry capability on all functions
 * 
 * @param {Object} module - Module to wrap
 * @param {Object} options - Retry options
 * @returns {Object} - Wrapped module
 */
function createRetryableModule(module, options = {}) {
  const retryableModule = {};
  
  for (const [key, value] of Object.entries(module)) {
    if (typeof value === 'function') {
      retryableModule[key] = withRetry(value, options);
    } else {
      retryableModule[key] = value;
    }
  }
  
  return retryableModule;
}

module.exports = {
  retryWithBackoff,
  withRetry,
  createRetryableModule,
  calculateDelay,
  sleep
};
