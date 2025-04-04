/**
 * Middleware Index
 * 
 * Exports all middleware functions from a single entry point
 * for simplified imports throughout the application.
 */

const authenticate = require('./authenticate');
const authorizeAgency = require('./authorizeAgency');
const validateSchema = require('./validateSchema');
const errorHandler = require('./errorHandler');

module.exports = {
  authenticate,
  authorizeAgency,
  validateSchema,
  errorHandler
};
