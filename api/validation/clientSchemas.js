/**
 * Client Validation Schemas
 * 
 * Defines validation schemas for client-related operations
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

// Client validation schemas
const clientSchema = {
  // Schema for client creation
  create: Joi.object({
    name: Joi.string().required().min(2).max(100).trim()
      .messages({
        'string.empty': 'Client name is required',
        'string.min': 'Client name must be at least 2 characters',
        'string.max': 'Client name cannot exceed 100 characters',
        'any.required': 'Client name is required'
      }),
    website: Joi.string().required().trim()
      .messages({
        'string.empty': 'Website URL is required',
        'any.required': 'Website URL is required'
      }),
    status: Joi.string().valid('active', 'inactive', 'pending', 'archived').default('active')
      .messages({
        'any.only': 'Status must be one of: active, inactive, pending, archived'
      }),
    contact: Joi.object({
      name: Joi.string().trim().allow('').optional(),
      email: Joi.string().email().trim().allow('').optional()
        .messages({
          'string.email': 'Contact email must be a valid email address'
        }),
      phone: Joi.string().trim().allow('').optional()
    }).optional(),
    plan: Joi.string().valid('basic', 'professional', 'enterprise').default('basic')
      .messages({
        'any.only': 'Plan must be one of: basic, professional, enterprise'
      }),
    notes: Joi.string().trim().allow('').optional(),
    tags: Joi.array().items(Joi.string().trim()).optional()
  }),

  // Schema for client update
  update: Joi.object({
    name: Joi.string().min(2).max(100).trim()
      .messages({
        'string.min': 'Client name must be at least 2 characters',
        'string.max': 'Client name cannot exceed 100 characters'
      }),
    website: Joi.string().trim(),
    status: Joi.string().valid('active', 'inactive', 'pending', 'archived')
      .messages({
        'any.only': 'Status must be one of: active, inactive, pending, archived'
      }),
    contact: Joi.object({
      name: Joi.string().trim().allow('').optional(),
      email: Joi.string().email().trim().allow('').optional()
        .messages({
          'string.email': 'Contact email must be a valid email address'
        }),
      phone: Joi.string().trim().allow('').optional()
    }).optional(),
    plan: Joi.string().valid('basic', 'professional', 'enterprise')
      .messages({
        'any.only': 'Plan must be one of: basic, professional, enterprise'
      }),
    notes: Joi.string().trim().allow('').optional(),
    tags: Joi.array().items(Joi.string().trim()).optional(),
    assignedTo: Joi.array().items(objectIdSchema).optional()
  }),

  // Schema for bulk actions
  bulkAction: Joi.object({
    action: Joi.string().required().valid('scan', 'archive', 'activate', 'generate_reports')
      .messages({
        'any.only': 'Action must be one of: scan, archive, activate, generate_reports',
        'any.required': 'Action is required'
      }),
    clientIds: Joi.array().items(objectIdSchema).min(1).required()
      .messages({
        'array.min': 'At least one client must be selected',
        'any.required': 'Client IDs are required'
      })
  })
};

module.exports = {
  clientSchema
};
