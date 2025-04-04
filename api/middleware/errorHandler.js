/**
 * Global Error Handler Middleware
 * 
 * Centralizes error handling for the API, providing consistent
 * error responses and logging.
 */

const { AppError } = require('../utils/errors');

/**
 * Global error handler middleware
 * Transforms various error types into consistent response format
 * 
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
module.exports = (err, req, res, next) => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal server error';
  let details = null;
  
  // Log error for debugging (would be replaced with proper logger in production)
  console.error(`[ERROR] ${err.name}: ${err.message}`);
  console.error(err.stack);
  
  // Handle custom application errors
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  
  // Handle Mongoose validation errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    
    // Format validation errors
    details = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message
    }));
  }
  
  // Handle Mongoose cast errors (e.g. invalid ObjectId)
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }
  
  // Handle duplicate key errors
  else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate value error';
    
    // Extract the duplicate field
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    
    details = { field, value };
  }
  
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  
  // Handle token expiration
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    details,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
