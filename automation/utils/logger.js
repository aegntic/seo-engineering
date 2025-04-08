/**
 * Logger Module
 * 
 * Provides consistent logging across the automation system:
 * - Standardized log formats
 * - Log levels (debug, info, warn, error)
 * - Optional file logging
 * - Context tracking for operations
 */

const fs = require('fs');
const path = require('path');

// Default log level - can be overridden by environment variable
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Log levels and their numeric values for comparison
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// Colors for console output
const COLORS = {
  reset: '\x1b[0m',
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m'  // Red
};

// File logging configuration
const LOG_TO_FILE = process.env.LOG_TO_FILE === 'true';
const LOG_FILE_PATH = process.env.LOG_FILE_PATH || './logs/seo.engineering.log';

// Operational context tracking
let currentContext = null;

/**
 * Logs a message with the specified level
 * @param {string} level - Log level (debug, info, warn, error)
 * @param {string} message - Log message
 * @param {Object} [data] - Additional data to log
 */
function log(level, message, data = null) {
  // Check if this log level should be processed
  if (LOG_LEVELS[level] < LOG_LEVELS[LOG_LEVEL]) {
    return;
  }
  
  const timestamp = new Date().toISOString();
  const contextInfo = currentContext ? `[${currentContext}] ` : '';
  
  // Format log entry
  let formattedMessage = `${timestamp} ${level.toUpperCase()} ${contextInfo}${message}`;
  let consoleMessage = `${COLORS[level]}${timestamp} ${level.toUpperCase()} ${contextInfo}${message}${COLORS.reset}`;
  
  // Add data if available
  if (data) {
    const dataString = typeof data === 'object' 
      ? '\n' + JSON.stringify(data, null, 2) 
      : data;
    
    formattedMessage += dataString;
    consoleMessage += dataString;
  }
  
  // Log to console
  if (level === 'error') {
    console.error(consoleMessage);
  } else if (level === 'warn') {
    console.warn(consoleMessage);
  } else {
    console.log(consoleMessage);
  }
  
  // Log to file if enabled
  if (LOG_TO_FILE) {
    writeToLogFile(`${formattedMessage}\n`);
  }
}

/**
 * Writes a log entry to the log file
 * @param {string} entry - Formatted log entry
 */
function writeToLogFile(entry) {
  try {
    // Ensure log directory exists
    const logDir = path.dirname(LOG_FILE_PATH);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Append to log file
    fs.appendFileSync(LOG_FILE_PATH, entry);
  } catch (error) {
    console.error(`Failed to write to log file: ${error.message}`);
  }
}

/**
 * Sets the current operational context
 * @param {string} context - Context identifier
 */
function setContext(context) {
  currentContext = context;
}

/**
 * Clears the current operational context
 */
function clearContext() {
  currentContext = null;
}

/**
 * Creates a child logger with a fixed context
 * @param {string} context - Context identifier
 * @returns {Object} - Child logger
 */
function createChildLogger(context) {
  return {
    debug: (message, data) => {
      const prevContext = currentContext;
      setContext(context);
      debug(message, data);
      currentContext = prevContext;
    },
    info: (message, data) => {
      const prevContext = currentContext;
      setContext(context);
      info(message, data);
      currentContext = prevContext;
    },
    warn: (message, data) => {
      const prevContext = currentContext;
      setContext(context);
      warn(message, data);
      currentContext = prevContext;
    },
    error: (message, data) => {
      const prevContext = currentContext;
      setContext(context);
      error(message, data);
      currentContext = prevContext;
    }
  };
}

// Convenience methods for different log levels
function debug(message, data) {
  log('debug', message, data);
}

function info(message, data) {
  log('info', message, data);
}

function warn(message, data) {
  log('warn', message, data);
}

function error(message, data) {
  log('error', message, data);
}

module.exports = {
  debug,
  info,
  warn,
  error,
  setContext,
  clearContext,
  createChildLogger
};