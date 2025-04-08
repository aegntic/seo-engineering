/**
 * Logger Module
 * 
 * Provides a centralized logging interface for the SEO.engineering system
 * with different log levels, formatting, and storage capabilities.
 */

const winston = require('winston');
const config = require('../../config');
const path = require('path');

// Configure log formats
const formats = {
  console: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  
  file: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  )
};

// Get log level from config
const logLevel = config.logging?.level || 'info';

// Create log directory if it doesn't exist
const logDir = config.logging?.directory || 'logs';
const fs = require('fs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Create the logger instance
const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.json(),
  defaultMeta: { service: 'seo.engineering' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: formats.console
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: formats.file
    }),
    
    // File transport for error logs
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: formats.file
    }),
    
    // File transport for verification logs
    new winston.transports.File({
      filename: path.join(logDir, 'verification.log'),
      format: formats.file
    })
  ]
});

// Add custom verification logger
logger.verification = function(message, metadata) {
  this.log({
    level: 'info',
    message,
    ...metadata,
    category: 'verification'
  });
};

// Add request logger for API calls
logger.request = function(req, res, metadata = {}) {
  this.log({
    level: 'debug',
    message: `${req.method} ${req.originalUrl} - ${res.statusCode}`,
    ...metadata,
    category: 'request',
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    userAgent: req.get('user-agent'),
    ip: req.ip,
    responseTime: metadata.responseTime
  });
};

// Add structured logging for verification operations
logger.verificationStart = function(siteId, options = {}) {
  this.verification(`Starting verification for site ${siteId}`, {
    event: 'verification_start',
    siteId,
    options
  });
};

logger.verificationComplete = function(siteId, result) {
  this.verification(`Verification completed for site ${siteId}, success: ${result.success}`, {
    event: 'verification_complete',
    siteId,
    success: result.success,
    summary: result.summary
  });
};

logger.verificationError = function(siteId, error) {
  this.verification(`Verification failed for site ${siteId}: ${error.message}`, {
    event: 'verification_error',
    siteId,
    error: {
      message: error.message,
      stack: error.stack
    }
  });
};

// Add method to create a child logger for specific components
logger.createChildLogger = function(component) {
  return this.child({ component });
};

module.exports = logger;
