/**
 * Logger utility for the competitor analysis module
 * 
 * This provides consistent logging functionality throughout the module.
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level.toUpperCase()}] ${message}${stack ? '\n' + stack : ''}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'competitor-analysis' },
  transports: [
    // Console logging
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    
    // File logging - errors
    new winston.transports.File({ 
      filename: path.join(logDir, 'competitor-analysis-error.log'),
      level: 'error'
    }),
    
    // File logging - all logs
    new winston.transports.File({ 
      filename: path.join(logDir, 'competitor-analysis.log')
    })
  ]
});

// Add log levels
module.exports = {
  error: (message) => logger.error(message),
  warn: (message) => logger.warn(message),
  info: (message) => logger.info(message),
  debug: (message) => logger.debug(message),
  
  /**
   * Set the log level
   * @param {string} level - Log level (error, warn, info, debug)
   */
  setLevel: (level) => {
    logger.level = level;
  }
};
