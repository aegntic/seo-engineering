/**
 * Middleware Utility
 * 
 * Provides middleware functions for the competitor discovery module
 */

const logger = require('./logger');
const { validateRequestBody } = require('./validators');

/**
 * Authentication middleware
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
function authenticateRequest(req, res, next) {
  // In a real implementation, this would check for a valid JWT token
  // For now, we'll just pass through
  
  // Placeholder for token validation logic
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    logger.warn('Missing authentication token');
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // For development, simulate successful authentication
  req.user = {
    id: '123456789',
    role: 'admin'
  };
  
  next();
}

/**
 * Request validation middleware
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
function validateRequest(req, res, next) {
  // Validate request body based on the endpoint
  const path = req.path;
  let schema;
  
  // Define schemas for different endpoints
  if (path === '/discover') {
    schema = {
      required: ['siteId'],
      properties: {
        siteId: {
          type: 'string',
          format: 'objectId'
        },
        options: {
          type: 'object',
          properties: {
            maxCompetitors: {
              type: 'number',
              minimum: 1,
              maximum: 100
            },
            includeSubdomains: {
              type: 'boolean'
            },
            minRelevanceScore: {
              type: 'number',
              minimum: 0,
              maximum: 1
            }
          }
        }
      }
    };
  }
  
  // Skip validation if no schema defined for this endpoint
  if (!schema) {
    return next();
  }
  
  // Validate request body
  const validation = validateRequestBody(req.body, schema);
  
  if (!validation.isValid) {
    logger.warn('Invalid request', {
      path,
      errors: validation.errors,
      body: req.body
    });
    
    return res.status(400).json({
      error: 'Invalid request',
      details: validation.errors
    });
  }
  
  next();
}

/**
 * Error handling middleware
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
function errorHandler(err, req, res, next) {
  logger.error(`Unhandled error: ${err.message}`, {
    path: req.path,
    method: req.method,
    error: err.stack
  });
  
  // Don't expose detailed errors in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(500).json({
    error: 'Internal server error',
    message: isProduction ? 'An unexpected error occurred' : err.message,
    stack: isProduction ? undefined : err.stack
  });
}

/**
 * Rate limiting middleware
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
function rateLimiter(req, res, next) {
  // In a real implementation, this would check for rate limits
  // For now, we'll just pass through
  
  // Get client IP
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  // Placeholder for rate limiting logic
  const isRateLimited = false;
  
  if (isRateLimited) {
    logger.warn('Rate limit exceeded', {
      ip: clientIp,
      path: req.path
    });
    
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests, please try again later'
    });
  }
  
  next();
}

module.exports = {
  authenticateRequest,
  validateRequest,
  errorHandler,
  rateLimiter
};
