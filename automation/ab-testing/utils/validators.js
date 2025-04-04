/**
 * Validators Utility
 * 
 * Provides validation functions for various configurations used in the A/B Testing Framework.
 * 
 * Last updated: April 4, 2025
 */

const logger = require('../../utils/logger');

/**
 * Validates a configuration object based on its type
 * 
 * @param {Object} config - Configuration to validate
 * @param {string} type - Type of configuration ('test', 'variant', etc.)
 * @throws {Error} If validation fails
 */
function validateConfig(config, type) {
  if (!config) {
    throw new Error(`No ${type} configuration provided`);
  }
  
  switch (type) {
    case 'test':
      validateTestConfig(config);
      break;
    case 'variant':
      validateVariantConfig(config);
      break;
    case 'tracking':
      validateTrackingConfig(config);
      break;
    case 'implementation':
      validateImplementationConfig(config);
      break;
    default:
      throw new Error(`Unknown configuration type: ${type}`);
  }
}

/**
 * Validates a test configuration
 * 
 * @param {Object} config - Test configuration to validate
 * @throws {Error} If validation fails
 */
function validateTestConfig(config) {
  const requiredFields = ['name', 'siteId', 'metrics'];
  
  // Check required fields
  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`Missing required field for test configuration: ${field}`);
    }
  }
  
  // Validate metrics
  if (!config.metrics.primary) {
    throw new Error('Test configuration must specify a primary metric');
  }
  
  // Validate duration if provided
  if (config.duration !== undefined) {
    if (typeof config.duration !== 'number' || config.duration <= 0) {
      throw new Error('Test duration must be a positive number');
    }
  }
  
  // Validate confidence threshold if provided
  if (config.confidenceThreshold !== undefined) {
    if (typeof config.confidenceThreshold !== 'number' || 
        config.confidenceThreshold <= 0 || 
        config.confidenceThreshold >= 1) {
      throw new Error('Confidence threshold must be a number between 0 and 1');
    }
  }
  
  // Validate traffic allocation if provided
  if (config.trafficAllocation) {
    validateTrafficAllocation(config.trafficAllocation);
  }
  
  // Validate variants if provided
  if (config.variants) {
    if (!Array.isArray(config.variants) || config.variants.length < 2) {
      throw new Error('Test configuration must include at least 2 variants');
    }
    
    // Check if at least one control variant exists
    const hasControl = config.variants.some(v => v.type === 'control' || v.isControl);
    
    if (!hasControl) {
      throw new Error('Test configuration must include a control variant');
    }
    
    // Validate each variant
    for (const variant of config.variants) {
      validateVariantConfig(variant);
    }
  }
}

/**
 * Validates a variant configuration
 * 
 * @param {Object} config - Variant configuration to validate
 * @throws {Error} If validation fails
 */
function validateVariantConfig(config) {
  const requiredFields = ['name'];
  
  // Check required fields
  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`Missing required field for variant configuration: ${field}`);
    }
  }
  
  // Validate changes if provided
  if (config.changes) {
    if (!Array.isArray(config.changes)) {
      throw new Error('Variant changes must be an array');
    }
    
    // Validate each change
    for (const change of config.changes) {
      validateChangeConfig(change);
    }
  }
  
  // Validate traffic allocation if provided
  if (config.trafficAllocation !== undefined) {
    if (typeof config.trafficAllocation !== 'number' || 
        config.trafficAllocation < 0 || 
        config.trafficAllocation > 1) {
      throw new Error('Variant traffic allocation must be a number between 0 and 1');
    }
  }
}

/**
 * Validates a change configuration
 * 
 * @param {Object} change - Change configuration to validate
 * @throws {Error} If validation fails
 */
function validateChangeConfig(change) {
  const requiredFields = ['element', 'type', 'path'];
  
  // Check required fields
  for (const field of requiredFields) {
    if (!change[field]) {
      throw new Error(`Missing required field for change configuration: ${field}`);
    }
  }
  
  // Validate change type
  const validTypes = ['meta', 'content', 'schema', 'header', 'image', 'robots'];
  if (!validTypes.includes(change.type)) {
    throw new Error(`Invalid change type: ${change.type}`);
  }
  
  // Validate modified content is provided
  if (change.implementNow && !change.modified) {
    throw new Error('Change configuration must include modified content for immediate implementation');
  }
}

/**
 * Validates tracking configuration
 * 
 * @param {Object} config - Tracking configuration to validate
 * @throws {Error} If validation fails
 */
function validateTrackingConfig(config) {
  // Check that at least one tracking type is enabled
  if (!config.performance && !config.behavior && !config.search) {
    throw new Error('At least one tracking type must be enabled');
  }
  
  // Validate collection interval if provided
  if (config.collectionInterval !== undefined) {
    if (typeof config.collectionInterval !== 'number' || config.collectionInterval < 0) {
      throw new Error('Collection interval must be a non-negative number');
    }
  }
}

/**
 * Validates implementation configuration
 * 
 * @param {Object} config - Implementation configuration to validate
 * @throws {Error} If validation fails
 */
function validateImplementationConfig(config) {
  const requiredFields = ['testId', 'variantId'];
  
  // Check required fields
  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`Missing required field for implementation configuration: ${field}`);
    }
  }
}

/**
 * Validates traffic allocation
 * 
 * @param {Map|Object} trafficAllocation - Traffic allocation to validate
 * @throws {Error} If validation fails
 */
function validateTrafficAllocation(trafficAllocation) {
  // Convert to Map if it's an object
  const allocation = trafficAllocation instanceof Map ? 
    trafficAllocation : 
    new Map(Object.entries(trafficAllocation));
  
  if (allocation.size === 0) {
    throw new Error('Traffic allocation cannot be empty');
  }
  
  // Calculate total allocation
  let total = 0;
  for (const value of allocation.values()) {
    if (typeof value !== 'number' || value < 0 || value > 1) {
      throw new Error('Traffic allocation values must be numbers between 0 and 1');
    }
    total += value;
  }
  
  // Check total is approximately 1
  if (Math.abs(total - 1) > 0.001) {
    throw new Error(`Total traffic allocation must equal 1, got ${total}`);
  }
}

module.exports = {
  validateConfig,
  validateTestConfig,
  validateVariantConfig,
  validateTrackingConfig,
  validateImplementationConfig,
  validateTrafficAllocation
};
