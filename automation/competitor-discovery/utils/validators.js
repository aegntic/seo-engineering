/**
 * Validators Utility
 * 
 * Provides validation functions for the competitor discovery module
 */

const mongoose = require('mongoose');

/**
 * Validate MongoDB ObjectId
 * 
 * @param {String} id - ID to validate
 * @returns {Boolean} - True if valid ObjectId
 */
function validateObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Validate URL
 * 
 * @param {String} url - URL to validate
 * @returns {Boolean} - True if valid URL
 */
function validateUrl(url) {
  if (!url) return false;
  
  try {
    // Handle URLs without protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validate domain name
 * 
 * @param {String} domain - Domain name to validate
 * @returns {Boolean} - True if valid domain name
 */
function validateDomain(domain) {
  if (!domain) return false;
  
  // Remove protocol if present
  if (domain.startsWith('http://')) {
    domain = domain.substring(7);
  } else if (domain.startsWith('https://')) {
    domain = domain.substring(8);
  }
  
  // Remove path and query
  const pathIndex = domain.indexOf('/');
  if (pathIndex !== -1) {
    domain = domain.substring(0, pathIndex);
  }
  
  // Basic domain regex pattern
  const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
  return domainPattern.test(domain);
}

/**
 * Validate email address
 * 
 * @param {String} email - Email to validate
 * @returns {Boolean} - True if valid email
 */
function validateEmail(email) {
  if (!email) return false;
  
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
}

/**
 * Validate request body against schema
 * 
 * @param {Object} body - Request body
 * @param {Object} schema - Schema object with field definitions
 * @returns {Object} - Validation result with isValid and errors
 */
function validateRequestBody(body, schema) {
  if (!body || !schema) {
    return {
      isValid: false,
      errors: ['Missing body or schema']
    };
  }
  
  const errors = [];
  
  // Check required fields
  if (schema.required && Array.isArray(schema.required)) {
    for (const field of schema.required) {
      if (body[field] === undefined) {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }
  
  // Validate fields
  if (schema.properties) {
    for (const [field, definition] of Object.entries(schema.properties)) {
      const value = body[field];
      
      // Skip if field not present and not required
      if (value === undefined) {
        if (!schema.required || !schema.required.includes(field)) {
          continue;
        }
      }
      
      // Type check
      if (definition.type) {
        let typeError = false;
        
        switch (definition.type) {
          case 'string':
            if (typeof value !== 'string') {
              typeError = true;
            }
            break;
          case 'number':
            if (typeof value !== 'number') {
              typeError = true;
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              typeError = true;
            }
            break;
          case 'array':
            if (!Array.isArray(value)) {
              typeError = true;
            }
            break;
          case 'object':
            if (typeof value !== 'object' || value === null || Array.isArray(value)) {
              typeError = true;
            }
            break;
        }
        
        if (typeError) {
          errors.push(`Field ${field} should be of type ${definition.type}`);
        }
      }
      
      // Min/max for numbers
      if (typeof value === 'number') {
        if (definition.minimum !== undefined && value < definition.minimum) {
          errors.push(`Field ${field} should be at least ${definition.minimum}`);
        }
        if (definition.maximum !== undefined && value > definition.maximum) {
          errors.push(`Field ${field} should be at most ${definition.maximum}`);
        }
      }
      
      // Min/max length for strings
      if (typeof value === 'string') {
        if (definition.minLength !== undefined && value.length < definition.minLength) {
          errors.push(`Field ${field} should have at least ${definition.minLength} characters`);
        }
        if (definition.maxLength !== undefined && value.length > definition.maxLength) {
          errors.push(`Field ${field} should have at most ${definition.maxLength} characters`);
        }
        // Pattern check
        if (definition.pattern) {
          const regex = new RegExp(definition.pattern);
          if (!regex.test(value)) {
            errors.push(`Field ${field} does not match the required pattern`);
          }
        }
      }
      
      // Min/max items for arrays
      if (Array.isArray(value)) {
        if (definition.minItems !== undefined && value.length < definition.minItems) {
          errors.push(`Field ${field} should have at least ${definition.minItems} items`);
        }
        if (definition.maxItems !== undefined && value.length > definition.maxItems) {
          errors.push(`Field ${field} should have at most ${definition.maxItems} items`);
        }
        // Validate array items
        if (definition.items && definition.items.type) {
          for (let i = 0; i < value.length; i++) {
            const item = value[i];
            let itemTypeError = false;
            
            switch (definition.items.type) {
              case 'string':
                if (typeof item !== 'string') {
                  itemTypeError = true;
                }
                break;
              case 'number':
                if (typeof item !== 'number') {
                  itemTypeError = true;
                }
                break;
              case 'boolean':
                if (typeof item !== 'boolean') {
                  itemTypeError = true;
                }
                break;
              case 'object':
                if (typeof item !== 'object' || item === null || Array.isArray(item)) {
                  itemTypeError = true;
                }
                break;
            }
            
            if (itemTypeError) {
              errors.push(`Item ${i} in field ${field} should be of type ${definition.items.type}`);
            }
          }
        }
      }
      
      // Enum check
      if (definition.enum && Array.isArray(definition.enum)) {
        if (!definition.enum.includes(value)) {
          errors.push(`Field ${field} should be one of: ${definition.enum.join(', ')}`);
        }
      }
      
      // Custom format checks
      if (definition.format) {
        switch (definition.format) {
          case 'email':
            if (!validateEmail(value)) {
              errors.push(`Field ${field} should be a valid email address`);
            }
            break;
          case 'uri':
          case 'url':
            if (!validateUrl(value)) {
              errors.push(`Field ${field} should be a valid URL`);
            }
            break;
          case 'objectId':
            if (!validateObjectId(value)) {
              errors.push(`Field ${field} should be a valid ObjectId`);
            }
            break;
          case 'domain':
            if (!validateDomain(value)) {
              errors.push(`Field ${field} should be a valid domain name`);
            }
            break;
        }
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateObjectId,
  validateUrl,
  validateDomain,
  validateEmail,
  validateRequestBody
};
