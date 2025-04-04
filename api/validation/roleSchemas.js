/**
 * Role Validation Schemas
 * 
 * Defines validation schemas for role-related operations
 * using Joi validation library.
 */

const Joi = require('joi');

// Permission schema helper
const permissionSchema = Joi.object({
  dashboard: Joi.object({
    view: Joi.boolean().default(true),
    edit: Joi.boolean().default(false)
  }).default({
    view: true,
    edit: false
  }),
  reports: Joi.object({
    view: Joi.boolean().default(true),
    edit: Joi.boolean().default(false),
    create: Joi.boolean().default(false)
  }).default({
    view: true,
    edit: false,
    create: false
  }),
  settings: Joi.object({
    view: Joi.boolean().default(false),
    edit: Joi.boolean().default(false)
  }).default({
    view: false,
    edit: false
  }),
  clients: Joi.object({
    view: Joi.boolean().default(true),
    edit: Joi.boolean().default(false),
    create: Joi.boolean().default(false),
    delete: Joi.boolean().default(false)
  }).default({
    view: true,
    edit: false,
    create: false,
    delete: false
  }),
  users: Joi.object({
    view: Joi.boolean().default(false),
    edit: Joi.boolean().default(false),
    create: Joi.boolean().default(false),
    delete: Joi.boolean().default(false)
  }).default({
    view: false,
    edit: false,
    create: false,
    delete: false
  }),
  billing: Joi.object({
    view: Joi.boolean().default(false),
    edit: Joi.boolean().default(false)
  }).default({
    view: false,
    edit: false
  })
}).default();

// Role validation schemas
const roleSchema = {
  // Schema for role creation
  create: Joi.object({
    name: Joi.string().required().min(2).max(50).trim()
      .messages({
        'string.empty': 'Role name is required',
        'string.min': 'Role name must be at least 2 characters',
        'string.max': 'Role name cannot exceed 50 characters',
        'any.required': 'Role name is required'
      }),
    description: Joi.string().trim().allow('').optional(),
    permissions: permissionSchema
  }),

  // Schema for role update
  update: Joi.object({
    name: Joi.string().min(2).max(50).trim()
      .messages({
        'string.min': 'Role name must be at least 2 characters',
        'string.max': 'Role name cannot exceed 50 characters'
      }),
    description: Joi.string().trim().allow('').optional(),
    permissions: permissionSchema
  })
};

module.exports = {
  roleSchema
};
