/**
 * Logger Utility
 * 
 * Provides logging functionality for the competitor discovery module
 */

const winston = require('winston');

// Get log level from environment variable or config
const logLevel = process.env.LOG_LEVEL || 'info';

// Create logger
const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'competitor-discovery' },
  transports: [
    // Console logging
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(info => {
          const { timestamp, level, message, ...meta } = info;
          const ts = timestamp.slice(0, 19).replace('T', ' ');
          const metaStr = Object.keys(meta).length > 0 
            ? `\n${JSON.stringify(meta, null, 2)}` 
            : '';
          return `${ts} [${level}]: ${message}${metaStr}`;
        })
      )
    })
  ]
});

// Add file transport if not in test environment
if (process.env.NODE_ENV !== 'test') {
  logger.add(new winston.transports.File({ 
    filename: 'logs/competitor-discovery-error.log', 
    level: 'error' 
  }));
  logger.add(new winston.transports.File({ 
    filename: 'logs/competitor-discovery-combined.log' 
  }));
}

// Create wrapper functions with additional context capabilities
const wrapper = {
  error: (message, context = {}) => {
    logger.error(message, context);
  },
  
  warn: (message, context = {}) => {
    logger.warn(message, context);
  },
  
  info: (message, context = {}) => {
    logger.info(message, context);
  },
  
  debug: (message, context = {}) => {
    logger.debug(message, context);
  },
  
  verbose: (message, context = {}) => {
    logger.verbose(message, context);
  },
  
  // Create a child logger with additional context
  child: (context) => {
    const childLogger = logger.child(context);
    
    return {
      error: (message, additionalContext = {}) => {
        childLogger.error(message, additionalContext);
      },
      warn: (message, additionalContext = {}) => {
        childLogger.warn(message, additionalContext);
      },
      info: (message, additionalContext = {}) => {
        childLogger.info(message, additionalContext);
      },
      debug: (message, additionalContext = {}) => {
        childLogger.debug(message, additionalContext);
      },
      verbose: (message, additionalContext = {}) => {
        childLogger.verbose(message, additionalContext);
      },
      // Allow for nested child loggers
      child: (nestedContext) => {
        return wrapper.child({ ...context, ...nestedContext });
      }
    };
  }
};

module.exports = wrapper;
