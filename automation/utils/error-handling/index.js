/**
 * Centralized Error Handling System
 * 
 * Provides consistent error handling, reporting, and recovery throughout the system.
 * 
 * Last updated: April 4, 2025
 */

const logger = require('../logger');
const { sendNotification } = require('./notification');
const { CircuitBreaker } = require('./circuit-breaker');
const { retryWithBackoff } = require('./retry');

/**
 * Error types supported by the system
 */
const ErrorTypes = {
  NETWORK: 'network',
  DATABASE: 'database',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  VALIDATION: 'validation',
  RESOURCE_NOT_FOUND: 'resource_not_found',
  INTERNAL: 'internal',
  EXTERNAL_SERVICE: 'external_service',
  RATE_LIMIT: 'rate_limit',
  TIMEOUT: 'timeout'
};

/**
 * Severity levels for errors
 */
const SeverityLevels = {
  CRITICAL: 'critical',   // System is unusable, immediate action required
  HIGH: 'high',           // Major functionality broken, urgent action required
  MEDIUM: 'medium',       // Partial functionality affected, action required soon
  LOW: 'low',             // Minor issues, action can be delayed
  INFO: 'info'            // Informational only, no action required
};

/**
 * Creates a standardized error object with additional metadata
 * 
 * @param {string} message - Error message
 * @param {Object} options - Error options
 * @param {string} options.type - Error type from ErrorTypes
 * @param {string} options.severity - Severity from SeverityLevels
 * @param {Error} options.originalError - Original error that caused this error
 * @param {string} options.module - Module where the error occurred
 * @param {string} options.operation - Operation that was being performed
 * @param {Object} options.data - Additional data related to the error
 * @param {boolean} options.isOperational - Whether this is an operational error
 * @returns {Error} - Enhanced error object
 */
function createError(message, options = {}) {
  const error = new Error(message);
  
  // Add standard properties
  error.type = options.type || ErrorTypes.INTERNAL;
  error.severity = options.severity || SeverityLevels.MEDIUM;
  error.timestamp = new Date();
  error.isOperational = options.isOperational !== undefined ? options.isOperational : true;
  
  // Add additional context if provided
  if (options.originalError) error.originalError = options.originalError;
  if (options.module) error.module = options.module;
  if (options.operation) error.operation = options.operation;
  if (options.data) error.data = options.data;
  
  return error;
}

/**
 * Handles an error centrally, including logging, notifications, and recovery
 * 
 * @param {Error} error - Error to handle
 * @param {Object} options - Handling options
 * @param {boolean} options.notify - Whether to send notifications
 * @param {boolean} options.rethrow - Whether to rethrow the error after handling
 * @param {function} options.recovery - Recovery function to execute
 * @returns {Promise<void>} - Resolves when handling is complete
 */
async function handleError(error, options = {}) {
  const standardizedError = error.type ? error : createError(error.message, { originalError: error });
  
  // Log the error
  logError(standardizedError);
  
  // Send notifications for severe errors
  if (options.notify !== false && 
      (standardizedError.severity === SeverityLevels.CRITICAL || 
       standardizedError.severity === SeverityLevels.HIGH)) {
    await sendNotification(standardizedError);
  }
  
  // Attempt recovery if a recovery function is provided
  if (typeof options.recovery === 'function') {
    try {
      await options.recovery(standardizedError);
    } catch (recoveryError) {
      logError(createError('Recovery failed', {
        type: ErrorTypes.INTERNAL,
        severity: SeverityLevels.HIGH,
        originalError: recoveryError,
        module: 'error-handler',
        operation: 'recovery'
      }));
    }
  }
  
  // Rethrow if specified
  if (options.rethrow) {
    throw standardizedError;
  }
}

/**
 * Logs an error with appropriate level based on severity
 * 
 * @param {Error} error - Error to log
 */
function logError(error) {
  const logData = {
    type: error.type,
    module: error.module,
    operation: error.operation,
    timestamp: error.timestamp,
    isOperational: error.isOperational,
    data: error.data
  };
  
  if (error.originalError) {
    logData.originalError = {
      message: error.originalError.message,
      stack: error.originalError.stack
    };
  }
  
  switch (error.severity) {
    case SeverityLevels.CRITICAL:
    case SeverityLevels.HIGH:
      logger.error(error.message, logData);
      break;
    case SeverityLevels.MEDIUM:
      logger.warn(error.message, logData);
      break;
    case SeverityLevels.LOW:
      logger.info(error.message, logData);
      break;
    case SeverityLevels.INFO:
      logger.debug(error.message, logData);
      break;
    default:
      logger.error(error.message, logData);
  }
}

/**
 * Wraps a function with centralized error handling
 * 
 * @param {function} fn - Function to wrap
 * @param {Object} options - Error handling options
 * @returns {function} - Wrapped function
 */
function withErrorHandling(fn, options = {}) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      await handleError(error, options);
      
      // If we're rethrowing, the error will be caught at a higher level
      if (!options.rethrow) {
        return null;
      }
    }
  };
}

/**
 * Creates a safe version of a module with error handling applied to all methods
 * 
 * @param {Object} module - Module to wrap
 * @param {Object} options - Error handling options
 * @returns {Object} - Wrapped module
 */
function createSafeModule(module, options = {}) {
  const safeModule = {};
  
  for (const [key, value] of Object.entries(module)) {
    if (typeof value === 'function') {
      safeModule[key] = withErrorHandling(value, options);
    } else {
      safeModule[key] = value;
    }
  }
  
  return safeModule;
}

module.exports = {
  ErrorTypes,
  SeverityLevels,
  createError,
  handleError,
  logError,
  withErrorHandling,
  createSafeModule,
  retry: retryWithBackoff,
  CircuitBreaker
};
