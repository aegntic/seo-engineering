/**
 * Agency Validation Schemas
 * 
 * Defines validation schemas for agency-related operations
 * using Joi validation library.
 */

const Joi = require('joi');

// Agency validation schemas
const agencySchema = {
  // Schema for agency creation
  create: Joi.object({
    name: Joi.string().required().min(2).max(100).trim()
      .messages({
        'string.empty': 'Agency name is required',
        'string.min': 'Agency name must be at least 2 characters',
        'string.max': 'Agency name cannot exceed 100 characters',
        'any.required': 'Agency name is required'
      }),
    slug: Joi.string().min(2).max(100).pattern(/^[a-z0-9-]+$/).trim()
      .messages({
        'string.pattern.base': 'Slug can only contain lowercase letters, numbers, and hyphens',
        'string.min': 'Slug must be at least 2 characters',
        'string.max': 'Slug cannot exceed 100 characters'
      }),
    website: Joi.string().uri().trim().allow('').optional()
      .messages({
        'string.uri': 'Website must be a valid URL'
      }),
    email: Joi.string().email().required().trim()
      .messages({
        'string.email': 'Email must be a valid email address',
        'string.empty': 'Email is required',
        'any.required': 'Email is required'
      }),
    phone: Joi.string().trim().allow('').optional(),
    address: Joi.object({
      street: Joi.string().trim().allow('').optional(),
      city: Joi.string().trim().allow('').optional(),
      state: Joi.string().trim().allow('').optional(),
      zipCode: Joi.string().trim().allow('').optional(),
      country: Joi.string().trim().allow('').optional()
    }).optional(),
    plan: Joi.string().valid('basic', 'professional', 'enterprise').default('basic')
      .messages({
        'any.only': 'Plan must be one of: basic, professional, enterprise'
      })
  }),

  // Schema for agency update
  update: Joi.object({
    name: Joi.string().min(2).max(100).trim()
      .messages({
        'string.min': 'Agency name must be at least 2 characters',
        'string.max': 'Agency name cannot exceed 100 characters'
      }),
    slug: Joi.string().min(2).max(100).pattern(/^[a-z0-9-]+$/).trim()
      .messages({
        'string.pattern.base': 'Slug can only contain lowercase letters, numbers, and hyphens',
        'string.min': 'Slug must be at least 2 characters',
        'string.max': 'Slug cannot exceed 100 characters'
      }),
    website: Joi.string().uri().trim().allow('').optional()
      .messages({
        'string.uri': 'Website must be a valid URL'
      }),
    email: Joi.string().email().trim()
      .messages({
        'string.email': 'Email must be a valid email address'
      }),
    phone: Joi.string().trim().allow('').optional(),
    address: Joi.object({
      street: Joi.string().trim().allow('').optional(),
      city: Joi.string().trim().allow('').optional(),
      state: Joi.string().trim().allow('').optional(),
      zipCode: Joi.string().trim().allow('').optional(),
      country: Joi.string().trim().allow('').optional()
    }).optional(),
    plan: Joi.string().valid('basic', 'professional', 'enterprise')
      .messages({
        'any.only': 'Plan must be one of: basic, professional, enterprise'
      }),
    subscription: Joi.object({
      status: Joi.string().valid('active', 'inactive', 'trial', 'past_due', 'canceled'),
      startDate: Joi.date().iso(),
      endDate: Joi.date().iso().min(Joi.ref('startDate')),
      trialEndsAt: Joi.date().iso()
    }).optional(),
    billing: Joi.object({
      method: Joi.string().valid('credit_card', 'paypal', 'bank_transfer', 'invoice'),
      contactName: Joi.string().trim().allow('').optional(),
      contactEmail: Joi.string().email().trim().allow('').optional()
    }).optional()
  }),

  // Schema for white label settings
  whiteLabelSettings: Joi.object({
    enabled: Joi.boolean().default(true),
    brandName: Joi.string().trim().allow('').optional(),
    logoUrl: Joi.string().uri().trim().allow('').optional()
      .messages({
        'string.uri': 'Logo URL must be a valid URL'
      }),
    faviconUrl: Joi.string().uri().trim().allow('').optional()
      .messages({
        'string.uri': 'Favicon URL must be a valid URL'
      }),
    primaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).trim().allow('').optional()
      .messages({
        'string.pattern.base': 'Primary color must be a valid hex color code (e.g. #3B82F6)'
      }),
    accentColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).trim().allow('').optional()
      .messages({
        'string.pattern.base': 'Accent color must be a valid hex color code (e.g. #10B981)'
      }),
    customDomain: Joi.string().trim().allow('').optional(),
    customEmailEnabled: Joi.boolean().default(false),
    customEmail: Joi.string().email().trim().allow('').optional()
      .messages({
        'string.email': 'Custom email must be a valid email address'
      }),
    emailFooter: Joi.string().trim().allow('').optional(),
    hideSeoBranding: Joi.boolean().default(true)
  })
};

module.exports = {
  agencySchema
};
