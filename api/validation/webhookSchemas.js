/**
 * Webhook Validation Schemas
 * 
 * Defines validation schemas for webhook-related operations
 * using Joi validation library.
 */

const Joi = require('joi');
const mongoose = require('mongoose');

// Object ID validation helper
const objectIdSchema = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}).messages({
  'any.invalid': 'Invalid ID format',
  'string.empty': 'ID cannot be empty'
});

// URL validation pattern
const urlPattern = new RegExp('^(https?)://[^\\s/$.?#].[^\\s]*$');

// Webhook validation schemas
const webhookSchema = {
  // Schema for webhook subscription creation
  create: Joi.object({
    url: Joi.string().required().pattern(urlPattern).trim()
      .messages({
        'string.empty': 'Webhook URL is required',
        'string.pattern.base': 'Webhook URL must be a valid HTTP or HTTPS URL',
        'any.required': 'Webhook URL is required'
      }),
    events: Joi.array().items(Joi.string().trim()).min(1).required()
      .messages({
        'array.min': 'At least one event type is required',
        'any.required': 'Events are required'
      }),
    description: Joi.string().trim().allow('').optional(),
    secret: Joi.string().trim().allow('').optional(),
    active: Joi.boolean().default(true)
  }),

  // Schema for webhook subscription update
  update: Joi.object({
    url: Joi.string().pattern(urlPattern).trim()
      .messages({
        'string.pattern.base': 'Webhook URL must be a valid HTTP or HTTPS URL'
      }),
    events: Joi.array().items(Joi.string().trim()).min(1)
      .messages({
        'array.min': 'At least one event type is required'
      }),
    description: Joi.string().trim().allow('').optional(),
    active: Joi.boolean(),
    regenerateSecret: Joi.boolean().default(false)
  }),

  // Schema for webhook event trigger (testing)
  trigger: Joi.object({
    eventType: Joi.string().required()
      .messages({
        'string.empty': 'Event type is required',
        'any.required': 'Event type is required'
      }),
    payload: Joi.object().default({})
  }),

  // Schema for webhook delivery history filters
  deliveryHistory: Joi.object({
    success: Joi.boolean(),
    event: Joi.string(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  })
};

module.exports = {
  webhookSchema
};
