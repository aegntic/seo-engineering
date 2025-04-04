/**
 * Utility functions for Duplicate Content Analysis
 * 
 * Common utilities used across multiple components of the
 * duplicate content analysis system.
 * 
 * @module duplicate-content/utils
 */

/**
 * Split an array into batches of specified size
 * @param {Array} array - Array to split
 * @param {number} batchSize - Size of each batch
 * @returns {Array<Array>} Array of batches
 */
function splitIntoBatches(array, batchSize) {
  if (!Array.isArray(array)) {
    return [];
  }
  
  const batches = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  
  return batches;
}

/**
 * Create a throttled function that doesn't execute more than once per interval
 * @param {Function} func - Function to throttle
 * @param {number} limit - Minimum time between executions in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      return func.apply(this, args);
    }
  };
}

/**
 * Format bytes to human-readable string
 * @param {number} bytes - Number of bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted string
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format a duration in milliseconds to a human-readable string
 * @param {number} milliseconds - Duration in milliseconds
 * @returns {string} Formatted duration string
 */
function formatDuration(milliseconds) {
  if (!milliseconds || milliseconds < 0) return '0s';
  
  const seconds = Math.floor(milliseconds / 1000) % 60;
  const minutes = Math.floor(milliseconds / (1000 * 60)) % 60;
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Get memory usage statistics
 * @returns {Object} Memory usage info
 */
function getMemoryUsage() {
  const memoryUsage = process.memoryUsage();
  
  return {
    rss: formatBytes(memoryUsage.rss),
    heapTotal: formatBytes(memoryUsage.heapTotal),
    heapUsed: formatBytes(memoryUsage.heapUsed),
    external: formatBytes(memoryUsage.external),
    arrayBuffers: formatBytes(memoryUsage.arrayBuffers || 0)
  };
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
function generateId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Create a logger with consistent formatting
 * @param {string} module - Module name
 * @param {Object} options - Logger options
 * @returns {Object} Logger object
 */
function createLogger(module, options = {}) {
  const logLevel = options.logLevel || 'info';
  const levels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };
  
  const shouldLog = (level) => {
    return levels[level] >= levels[logLevel];
  };
  
  return {
    debug: (message, ...args) => {
      if (shouldLog('debug')) {
        console.debug(`[${module}][DEBUG] ${message}`, ...args);
      }
    },
    info: (message, ...args) => {
      if (shouldLog('info')) {
        console.info(`[${module}][INFO] ${message}`, ...args);
      }
    },
    warn: (message, ...args) => {
      if (shouldLog('warn')) {
        console.warn(`[${module}][WARN] ${message}`, ...args);
      }
    },
    error: (message, ...args) => {
      if (shouldLog('error')) {
        console.error(`[${module}][ERROR] ${message}`, ...args);
      }
    }
  };
}

/**
 * Measure execution time of a function
 * @param {Function} func - Function to measure
 * @param {Array} args - Arguments to pass to the function
 * @returns {Promise<Object>} Result and execution time
 */
async function measureExecutionTime(func, ...args) {
  const startTime = Date.now();
  
  try {
    const result = await func(...args);
    const executionTime = Date.now() - startTime;
    
    return {
      result,
      executionTime,
      formattedTime: formatDuration(executionTime)
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    return {
      error,
      executionTime,
      formattedTime: formatDuration(executionTime)
    };
  }
}

module.exports = {
  splitIntoBatches,
  throttle,
  formatBytes,
  formatDuration,
  getMemoryUsage,
  generateId,
  createLogger,
  measureExecutionTime
};
