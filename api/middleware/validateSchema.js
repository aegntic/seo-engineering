/**
 * Schema Validation Middleware
 * 
 * Validates request data against Joi schemas to ensure data integrity
 * before processing requests.
 */

const { ValidationError } = require('../utils/errors');

/**
 * Schema validation middleware
 * Validates request body against a Joi schema
 * 
 * @param {Object} schema - Joi validation schema
 * @param {String} source - Request property to validate (body, query, params)
 * @returns {Function} Express middleware function
 */
module.exports = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      // Get data to validate based on source
      const data = req[source];
      
      // Skip validation if schema is not provided
      if (!schema) {
        return next();
      }
      
      // Validate data against schema
      const { error, value } = schema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: true
      });
      
      // If validation fails, throw error
      if (error) {
        // Format error details into a readable format
        const errorDetails = error.details.map(detail => ({
          path: detail.path.join('.'),
          message: detail.message
        }));
        
        throw new ValidationError(
          `Validation error: ${errorDetails.map(err => err.message).join(', ')}`
        );
      }
      
      // Attach validated data to request
      req[source] = value;
      
      // Continue to next middleware
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
  };
};
