/**
 * User Validation Schemas
 * 
 * Defines validation schemas for user-related operations
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

// User validation schemas
const userSchema = {
  // Schema for user creation
  create: Joi.object({
    firstName: Joi.string().required().min(2).max(50).trim()
      .messages({
        'string.empty': 'First name is required',
        'string.min': 'First name must be at least 2 characters',
        'string.max': 'First name cannot exceed 50 characters',
        'any.required': 'First name is required'
      }),
    lastName: Joi.string().required().min(2).max(50).trim()
      .messages({
        'string.empty': 'Last name is required',
        'string.min': 'Last name must be at least 2 characters',
        'string.max': 'Last name cannot exceed 50 characters',
        'any.required': 'Last name is required'
      }),
    email: Joi.string().email().required().trim()
      .messages({
        'string.email': 'Email must be a valid email address',
        'string.empty': 'Email is required',
        'any.required': 'Email is required'
      }),
    role: Joi.string().valid('admin', 'manager', 'specialist', 'viewer', 'client').default('viewer')
      .messages({
        'any.only': 'Role must be one of: admin, manager, specialist, viewer, client'
      }),
    roleCustomId: Joi.string().allow('', null).custom((value, helpers) => {
      if (value && value !== 'null' && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }).messages({
      'any.invalid': 'Invalid role ID format'
    }),
    clientIds: Joi.array().items(objectIdSchema).optional(),
    sendInvite: Joi.boolean().default(true)
  }),

  // Schema for user update
  update: Joi.object({
    firstName: Joi.string().min(2).max(50).trim()
      .messages({
        'string.min': 'First name must be at least 2 characters',
        'string.max': 'First name cannot exceed 50 characters'
      }),
    lastName: Joi.string().min(2).max(50).trim()
      .messages({
        'string.min': 'Last name must be at least 2 characters',
        'string.max': 'Last name cannot exceed 50 characters'
      }),
    role: Joi.string().valid('admin', 'manager', 'specialist', 'viewer', 'client')
      .messages({
        'any.only': 'Role must be one of: admin, manager, specialist, viewer, client'
      }),
    roleCustomId: Joi.string().allow('', null).custom((value, helpers) => {
      if (value && value !== 'null' && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }).messages({
      'any.invalid': 'Invalid role ID format'
    }),
    clientIds: Joi.array().items(objectIdSchema).optional(),
    status: Joi.string().valid('active', 'inactive', 'invited', 'suspended')
      .messages({
        'any.only': 'Status must be one of: active, inactive, invited, suspended'
      }),
    permissions: Joi.object({
      dashboard: Joi.object({
        view: Joi.boolean(),
        edit: Joi.boolean()
      }).optional(),
      reports: Joi.object({
        view: Joi.boolean(),
        edit: Joi.boolean(),
        create: Joi.boolean()
      }).optional(),
      settings: Joi.object({
        view: Joi.boolean(),
        edit: Joi.boolean()
      }).optional(),
      clients: Joi.object({
        view: Joi.boolean(),
        edit: Joi.boolean(),
        create: Joi.boolean(),
        delete: Joi.boolean()
      }).optional(),
      users: Joi.object({
        view: Joi.boolean(),
        edit: Joi.boolean(),
        create: Joi.boolean(),
        delete: Joi.boolean()
      }).optional(),
      billing: Joi.object({
        view: Joi.boolean(),
        edit: Joi.boolean()
      }).optional()
    }).optional()
  })
};

module.exports = {
  userSchema
};
