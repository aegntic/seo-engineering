/**
 * Variant Creator Module
 * 
 * Creates different versions of website elements for A/B testing.
 * Integrates with Git to implement changes while maintaining version control.
 * 
 * Last updated: April 4, 2025
 */

const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const logger = require('../../utils/logger');
const gitIntegration = require('../../git-integration');
const { validateConfig } = require('../utils/validators');
const db = require('../../utils/db-connection');

// Define variant schema
const VariantSchema = new mongoose.Schema({
  id: { type: String, default: () => uuidv4(), unique: true },
  testId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['control', 'variant'],
    default: 'variant'
  },
  changes: [{
    element: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['meta', 'content', 'schema', 'header', 'image', 'robots'],
      required: true
    },
    original: { type: mongoose.Schema.Types.Mixed },
    modified: { type: mongoose.Schema.Types.Mixed },
    path: { type: String, required: true },
    gitHash: { type: String }
  }],
  trafficAllocation: { type: Number },
  status: { 
    type: String, 
    enum: ['created', 'implemented', 'active', 'paused', 'stopped'],
    default: 'created'
  },
  implementedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Variant = mongoose.model('Variant', VariantSchema);

/**
 * Creates a new variant for an A/B test
 * 
 * @param {string} testId - ID of the test
 * @param {Object} config - Variant configuration
 * @returns {Object} - Created variant
 */
async function createVariant(testId, config) {
  try {
    // Validate configuration
    validateConfig(config, 'variant');
    
    // Create variant
    const variant = new Variant({
      testId,
      name: config.name,
      description: config.description,
      type: config.type || (config.isControl ? 'control' : 'variant'),
      trafficAllocation: config.trafficAllocation
    });
    
    // Save to database
    await variant.save();
    
    logger.info(`Created variant: ${variant.id} for test: ${testId}`);
    
    // If implementation is requested, implement changes
    if (config.implementNow && config.changes) {
      await implementVariantChanges(variant.id, config.changes);
    }
    
    return variant;
  } catch (error) {
    logger.error(`Error creating variant: ${error.message}`, { error });
    throw new Error(`Failed to create variant: ${error.message}`);
  }
}

/**
 * Implements changes for a variant
 * 
 * @param {string} variantId - Variant ID
 * @param {Array} changes - Array of changes to implement
 * @returns {Object} - Updated variant
 */
async function implementVariantChanges(variantId, changes) {
  try {
    const variant = await Variant.findOne({ id: variantId });
    
    if (!variant) {
      throw new Error(`Variant not found: ${variantId}`);
    }
    
    // Process each change
    for (const change of changes) {
      // Validate change
      if (!change.element || !change.type || !change.path || !change.modified) {
        throw new Error(`Invalid change configuration: ${JSON.stringify(change)}`);
      }
      
      // Get original content if not provided
      if (!change.original) {
        change.original = await gitIntegration.getFileContent(change.path);
      }
      
      // Implement change using Git integration
      const gitResult = await gitIntegration.implementChange({
        path: change.path,
        original: change.original,
        modified: change.modified,
        message: `A/B Test: ${variant.name} - ${change.element} (${variant.id})`
      });
      
      // Add git hash to change
      change.gitHash = gitResult.commitHash;
      
      // Add change to variant
      variant.changes.push(change);
    }
    
    // Update variant status
    variant.status = 'implemented';
    variant.implementedAt = new Date();
    variant.updatedAt = new Date();
    
    // Save changes
    await variant.save();
    
    logger.info(`Implemented changes for variant: ${variantId}`);
    
    return variant;
  } catch (error) {
    logger.error(`Error implementing variant changes: ${error.message}`, { error });
    throw new Error(`Failed to implement variant changes: ${error.message}`);
  }
}

/**
 * Retrieves a variant by ID
 * 
 * @param {string} id - Variant ID
 * @returns {Object} - Variant
 */
async function getById(id) {
  try {
    const variant = await Variant.findOne({ id }).lean();
    
    if (!variant) {
      logger.warn(`Variant not found: ${id}`);
      return null;
    }
    
    return variant;
  } catch (error) {
    logger.error(`Error retrieving variant: ${error.message}`, { error });
    throw new Error(`Failed to retrieve variant: ${error.message}`);
  }
}

/**
 * Retrieves all variants for a test
 * 
 * @param {string} testId - Test ID
 * @returns {Array} - Array of variants
 */
async function getByTestId(testId) {
  try {
    const variants = await Variant.find({ testId }).lean();
    return variants;
  } catch (error) {
    logger.error(`Error retrieving variants for test: ${error.message}`, { error });
    throw new Error(`Failed to retrieve variants for test: ${error.message}`);
  }
}

/**
 * Updates a variant
 * 
 * @param {string} id - Variant ID
 * @param {Object} updates - Updates to apply
 * @returns {Object} - Updated variant
 */
async function update(id, updates) {
  try {
    const variant = await Variant.findOne({ id });
    
    if (!variant) {
      throw new Error(`Variant not found: ${id}`);
    }
    
    // Apply updates
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'testId' && key !== 'createdAt' && key !== 'changes') {
        variant[key] = updates[key];
      }
    });
    
    // Handle changes separately if provided
    if (updates.changes) {
      await implementVariantChanges(id, updates.changes);
    }
    
    variant.updatedAt = new Date();
    
    // Save changes
    await variant.save();
    
    logger.info(`Updated variant: ${id}`);
    
    return variant;
  } catch (error) {
    logger.error(`Error updating variant: ${error.message}`, { error });
    throw new Error(`Failed to update variant: ${error.message}`);
  }
}

/**
 * Rollback the changes of a variant
 * 
 * @param {string} id - Variant ID
 * @returns {Object} - Result of rollback operation
 */
async function rollback(id) {
  try {
    const variant = await Variant.findOne({ id });
    
    if (!variant) {
      throw new Error(`Variant not found: ${id}`);
    }
    
    // Rollback each change
    const results = [];
    for (const change of variant.changes) {
      if (change.gitHash) {
        const rollbackResult = await gitIntegration.rollbackChange({
          path: change.path,
          commitHash: change.gitHash,
          original: change.original,
          message: `Rollback A/B Test: ${variant.name} - ${change.element} (${variant.id})`
        });
        
        results.push({
          element: change.element,
          path: change.path,
          success: true,
          commitHash: rollbackResult.commitHash
        });
      }
    }
    
    // Update variant status
    variant.status = 'stopped';
    variant.updatedAt = new Date();
    
    // Save changes
    await variant.save();
    
    logger.info(`Rolled back variant: ${id}`);
    
    return {
      id,
      status: 'stopped',
      rollbackResults: results
    };
  } catch (error) {
    logger.error(`Error rolling back variant: ${error.message}`, { error });
    throw new Error(`Failed to roll back variant: ${error.message}`);
  }
}

// Attach functions to createVariant for convenience
createVariant.getById = getById;
createVariant.getByTestId = getByTestId;
createVariant.update = update;
createVariant.rollback = rollback;
createVariant.implementChanges = implementVariantChanges;

module.exports = {
  createVariant,
  getById,
  getByTestId,
  update,
  rollback,
  implementVariantChanges
};
