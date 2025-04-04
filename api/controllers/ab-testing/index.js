/**
 * A/B Testing Controller
 * 
 * Handles business logic for A/B Testing API routes.
 * 
 * Last updated: April 4, 2025
 */

const abTesting = require('../../../automation/ab-testing');
const logger = require('../../../utils/logger');

/**
 * Gets all A/B tests for a site
 * 
 * @param {string} siteId - ID of the site
 * @returns {Promise<Array>} - Array of A/B tests
 */
async function getTests(siteId) {
  try {
    if (!siteId) {
      throw new Error('Site ID is required');
    }
    
    const tests = await abTesting.components.createTestDefinition.listBySite(siteId);
    
    return tests;
  } catch (error) {
    logger.error(`Error getting A/B tests: ${error.message}`, { error });
    throw new Error(`Failed to get A/B tests: ${error.message}`);
  }
}

/**
 * Gets a specific A/B test by ID
 * 
 * @param {string} id - ID of the A/B test
 * @returns {Promise<Object>} - A/B test details
 */
async function getTest(id) {
  try {
    if (!id) {
      throw new Error('Test ID is required');
    }
    
    const test = await abTesting.getTestStatus(id);
    
    if (!test) {
      throw new Error(`A/B test not found: ${id}`);
    }
    
    return test;
  } catch (error) {
    logger.error(`Error getting A/B test: ${error.message}`, { error });
    throw new Error(`Failed to get A/B test: ${error.message}`);
  }
}

/**
 * Creates a new A/B test
 * 
 * @param {Object} testConfig - Test configuration
 * @returns {Promise<Object>} - Created A/B test
 */
async function createTest(testConfig) {
  try {
    if (!testConfig.name || !testConfig.siteId || !testConfig.metrics) {
      throw new Error('Invalid test configuration');
    }
    
    const test = await abTesting.createTest(testConfig);
    
    return test;
  } catch (error) {
    logger.error(`Error creating A/B test: ${error.message}`, { error });
    throw new Error(`Failed to create A/B test: ${error.message}`);
  }
}

/**
 * Starts an A/B test
 * 
 * @param {string} id - ID of the A/B test
 * @returns {Promise<Object>} - Updated A/B test
 */
async function startTest(id) {
  try {
    if (!id) {
      throw new Error('Test ID is required');
    }
    
    const result = await abTesting.components.createTestDefinition.startTest(id);
    
    return result;
  } catch (error) {
    logger.error(`Error starting A/B test: ${error.message}`, { error });
    throw new Error(`Failed to start A/B test: ${error.message}`);
  }
}

/**
 * Stops an A/B test
 * 
 * @param {string} id - ID of the A/B test
 * @param {Object} options - Stop options
 * @returns {Promise<Object>} - Stop result
 */
async function stopTest(id, options = {}) {
  try {
    if (!id) {
      throw new Error('Test ID is required');
    }
    
    const result = await abTesting.stopTest(id, options);
    
    return result;
  } catch (error) {
    logger.error(`Error stopping A/B test: ${error.message}`, { error });
    throw new Error(`Failed to stop A/B test: ${error.message}`);
  }
}

/**
 * Gets all variants for an A/B test
 * 
 * @param {string} testId - ID of the A/B test
 * @returns {Promise<Array>} - Array of variants
 */
async function getVariants(testId) {
  try {
    if (!testId) {
      throw new Error('Test ID is required');
    }
    
    const variants = await abTesting.components.createVariant.getByTestId(testId);
    
    return variants;
  } catch (error) {
    logger.error(`Error getting variants: ${error.message}`, { error });
    throw new Error(`Failed to get variants: ${error.message}`);
  }
}

/**
 * Creates a new variant for an A/B test
 * 
 * @param {string} testId - ID of the A/B test
 * @param {Object} variantConfig - Variant configuration
 * @returns {Promise<Object>} - Created variant
 */
async function createVariant(testId, variantConfig) {
  try {
    if (!testId) {
      throw new Error('Test ID is required');
    }
    
    if (!variantConfig.name) {
      throw new Error('Variant name is required');
    }
    
    const variant = await abTesting.components.createVariant(testId, variantConfig);
    
    return variant;
  } catch (error) {
    logger.error(`Error creating variant: ${error.message}`, { error });
    throw new Error(`Failed to create variant: ${error.message}`);
  }
}

/**
 * Gets a specific variant by ID
 * 
 * @param {string} variantId - ID of the variant
 * @returns {Promise<Object>} - Variant details
 */
async function getVariant(variantId) {
  try {
    if (!variantId) {
      throw new Error('Variant ID is required');
    }
    
    const variant = await abTesting.components.createVariant.getById(variantId);
    
    if (!variant) {
      throw new Error(`Variant not found: ${variantId}`);
    }
    
    return variant;
  } catch (error) {
    logger.error(`Error getting variant: ${error.message}`, { error });
    throw new Error(`Failed to get variant: ${error.message}`);
  }
}

/**
 * Implements changes for a variant
 * 
 * @param {string} variantId - ID of the variant
 * @param {Array} changes - Array of changes to implement
 * @returns {Promise<Object>} - Implementation result
 */
async function implementChanges(variantId, changes) {
  try {
    if (!variantId) {
      throw new Error('Variant ID is required');
    }
    
    if (!changes || !Array.isArray(changes)) {
      throw new Error('Invalid changes array');
    }
    
    const result = await abTesting.components.createVariant.implementChanges(variantId, changes);
    
    return result;
  } catch (error) {
    logger.error(`Error implementing changes: ${error.message}`, { error });
    throw new Error(`Failed to implement changes: ${error.message}`);
  }
}

/**
 * Rolls back changes for a variant
 * 
 * @param {string} variantId - ID of the variant
 * @returns {Promise<Object>} - Rollback result
 */
async function rollbackChanges(variantId) {
  try {
    if (!variantId) {
      throw new Error('Variant ID is required');
    }
    
    const result = await abTesting.components.createVariant.rollback(variantId);
    
    return result;
  } catch (error) {
    logger.error(`Error rolling back changes: ${error.message}`, { error });
    throw new Error(`Failed to roll back changes: ${error.message}`);
  }
}

/**
 * Gets analysis for an A/B test
 * 
 * @param {string} testId - ID of the A/B test
 * @returns {Promise<Object>} - Analysis results
 */
async function getAnalysis(testId) {
  try {
    if (!testId) {
      throw new Error('Test ID is required');
    }
    
    const analysis = await abTesting.components.analyzeSplitTestData(testId);
    
    return analysis;
  } catch (error) {
    logger.error(`Error getting analysis: ${error.message}`, { error });
    throw new Error(`Failed to get analysis: ${error.message}`);
  }
}

/**
 * Gets metrics for an A/B test
 * 
 * @param {string} testId - ID of the A/B test
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Metrics data
 */
async function getMetrics(testId, options = {}) {
  try {
    if (!testId) {
      throw new Error('Test ID is required');
    }
    
    const metrics = await abTesting.components.trackPerformance.getByTestId(testId, options);
    
    return metrics;
  } catch (error) {
    logger.error(`Error getting metrics: ${error.message}`, { error });
    throw new Error(`Failed to get metrics: ${error.message}`);
  }
}

module.exports = {
  getTests,
  getTest,
  createTest,
  startTest,
  stopTest,
  getVariants,
  createVariant,
  getVariant,
  implementChanges,
  rollbackChanges,
  getAnalysis,
  getMetrics
};
