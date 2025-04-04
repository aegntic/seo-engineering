/**
 * Test Definition Module
 * 
 * Manages the creation and management of A/B test definitions,
 * including parameters, duration, and success metrics.
 * 
 * Last updated: April 4, 2025
 */

const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const logger = require('../../utils/logger');
const { validateConfig } = require('../utils/validators');
const { calculateTestDuration } = require('../utils/test-utils');
const db = require('../../utils/db-connection');

// Define test definition schema
const TestDefinitionSchema = new mongoose.Schema({
  id: { type: String, default: () => uuidv4(), unique: true },
  name: { type: String, required: true },
  description: { type: String },
  siteId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['created', 'running', 'paused', 'stopped', 'completed'],
    default: 'created'
  },
  startDate: { type: Date },
  endDate: { type: Date },
  duration: { type: Number, required: true }, // in days
  trafficAllocation: { type: Map, of: Number },
  metrics: {
    primary: { type: String, required: true },
    secondary: [{ type: String }]
  },
  confidenceThreshold: { type: Number, default: 0.95 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const TestDefinition = mongoose.model('TestDefinition', TestDefinitionSchema);

/**
 * Creates a new test definition
 * 
 * @param {Object} config - Test configuration
 * @returns {Object} - Created test definition
 */
async function createTestDefinition(config) {
  try {
    // Validate configuration
    validateConfig(config, 'test');
    
    // Calculate duration if not provided
    const duration = config.duration || calculateTestDuration(config);
    
    // Generate traffic allocation if not provided
    const trafficAllocation = config.trafficAllocation || generateTrafficAllocation(config.variants);
    
    // Create test definition
    const testDefinition = new TestDefinition({
      name: config.name,
      description: config.description,
      siteId: config.siteId,
      duration,
      trafficAllocation,
      metrics: {
        primary: config.metrics.primary,
        secondary: config.metrics.secondary || []
      },
      confidenceThreshold: config.confidenceThreshold || 0.95
    });
    
    // Save to database
    await testDefinition.save();
    
    logger.info(`Created test definition: ${testDefinition.id}`);
    
    return testDefinition;
  } catch (error) {
    logger.error(`Error creating test definition: ${error.message}`, { error });
    throw new Error(`Failed to create test definition: ${error.message}`);
  }
}

/**
 * Generates traffic allocation for variants
 * 
 * @param {Array} variants - Array of variant configs
 * @returns {Map} - Map of variant IDs to traffic allocation percentages
 */
function generateTrafficAllocation(variants) {
  const allocation = new Map();
  const count = variants.length;
  const baseAllocation = Math.floor(100 / count) / 100;
  
  // Distribute allocation evenly
  variants.forEach((variant, index) => {
    allocation.set(variant.id || `variant-${index}`, baseAllocation);
  });
  
  // Adjust for rounding errors
  const totalAllocated = Array.from(allocation.values()).reduce((sum, val) => sum + val, 0);
  if (totalAllocated < 1) {
    const firstKey = allocation.keys().next().value;
    allocation.set(firstKey, allocation.get(firstKey) + (1 - totalAllocated));
  }
  
  return allocation;
}

/**
 * Retrieves a test definition by ID
 * 
 * @param {string} id - Test definition ID
 * @returns {Object} - Test definition
 */
async function getById(id) {
  try {
    const testDefinition = await TestDefinition.findOne({ id }).lean();
    
    if (!testDefinition) {
      logger.warn(`Test definition not found: ${id}`);
      return null;
    }
    
    return testDefinition;
  } catch (error) {
    logger.error(`Error retrieving test definition: ${error.message}`, { error });
    throw new Error(`Failed to retrieve test definition: ${error.message}`);
  }
}

/**
 * Updates a test definition
 * 
 * @param {string} id - Test definition ID
 * @param {Object} updates - Updates to apply
 * @returns {Object} - Updated test definition
 */
async function update(id, updates) {
  try {
    const testDefinition = await TestDefinition.findOne({ id });
    
    if (!testDefinition) {
      throw new Error(`Test definition not found: ${id}`);
    }
    
    // Apply updates
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'createdAt') {
        testDefinition[key] = updates[key];
      }
    });
    
    testDefinition.updatedAt = new Date();
    
    // Save changes
    await testDefinition.save();
    
    logger.info(`Updated test definition: ${id}`);
    
    return testDefinition;
  } catch (error) {
    logger.error(`Error updating test definition: ${error.message}`, { error });
    throw new Error(`Failed to update test definition: ${error.message}`);
  }
}

/**
 * Starts a test
 * 
 * @param {string} id - Test definition ID
 * @returns {Object} - Updated test definition
 */
async function startTest(id) {
  try {
    const testDefinition = await TestDefinition.findOne({ id });
    
    if (!testDefinition) {
      throw new Error(`Test definition not found: ${id}`);
    }
    
    // Check if test can be started
    if (testDefinition.status !== 'created' && testDefinition.status !== 'paused') {
      throw new Error(`Cannot start test with status: ${testDefinition.status}`);
    }
    
    // Update test status
    testDefinition.status = 'running';
    testDefinition.startDate = testDefinition.startDate || new Date();
    testDefinition.endDate = new Date(testDefinition.startDate.getTime() + testDefinition.duration * 86400000);
    testDefinition.updatedAt = new Date();
    
    // Save changes
    await testDefinition.save();
    
    logger.info(`Started test: ${id}`);
    
    return testDefinition;
  } catch (error) {
    logger.error(`Error starting test: ${error.message}`, { error });
    throw new Error(`Failed to start test: ${error.message}`);
  }
}

/**
 * Lists all test definitions for a site
 * 
 * @param {string} siteId - Site ID
 * @param {Object} filters - Optional filters
 * @returns {Array} - List of test definitions
 */
async function listBySite(siteId, filters = {}) {
  try {
    const query = { siteId, ...filters };
    const testDefinitions = await TestDefinition.find(query).lean();
    
    return testDefinitions;
  } catch (error) {
    logger.error(`Error listing test definitions: ${error.message}`, { error });
    throw new Error(`Failed to list test definitions: ${error.message}`);
  }
}

// Attach getById to createTestDefinition function for convenience
createTestDefinition.getById = getById;
createTestDefinition.update = update;
createTestDefinition.startTest = startTest;
createTestDefinition.listBySite = listBySite;

module.exports = {
  createTestDefinition,
  getById,
  update,
  startTest,
  listBySite
};
