/**
 * A/B Testing Framework - Main Module
 * 
 * This module serves as the entry point for the A/B Testing Framework,
 * coordinating the various components and providing a unified API.
 * 
 * Last updated: April 4, 2025
 */

const { createTestDefinition } = require('./lib/test-definition');
const { createVariant } = require('./lib/variant-creator');
const { trackPerformance } = require('./lib/performance-tracker');
const { analyzeSplitTestData } = require('./lib/statistical-analysis');
const { implementWinner } = require('./lib/winner-implementation');
const { TrafficSplitter } = require('./lib/traffic-splitter');
const { SessionManager } = require('./lib/session-manager');
const { UserBehaviorTracker } = require('./lib/user-behavior-tracker');
const { DataCollector } = require('./lib/data-collector');
const logger = require('../utils/logger');

/**
 * Creates a new A/B test based on the provided configuration
 * 
 * @param {Object} testConfig - Configuration for the A/B test
 * @param {string} testConfig.name - Name of the test
 * @param {string} testConfig.siteId - ID of the site to test
 * @param {Object} testConfig.variants - Variant configurations
 * @param {number} testConfig.duration - Duration of the test in days
 * @param {Object} testConfig.metrics - Metrics to track for the test
 * @param {number} testConfig.confidenceThreshold - Statistical confidence threshold (default: 0.95)
 * @returns {Object} - Created test object with ID
 */
async function createTest(testConfig) {
  try {
    logger.info(`Creating A/B test: ${testConfig.name}`);
    
    // Create the test definition
    const testDefinition = await createTestDefinition(testConfig);
    
    // Create variants
    const variants = [];
    for (const variant of testConfig.variants) {
      const createdVariant = await createVariant(testDefinition.id, variant);
      variants.push(createdVariant);
    }
    
    // Initialize traffic splitting
    const trafficSplitter = new TrafficSplitter(testDefinition);
    await trafficSplitter.initialize();
    
    // Create session manager
    const sessionManager = new SessionManager(testDefinition.id, variants);
    await sessionManager.initialize();
    
    // Initialize trackers
    await initializeTrackers(testDefinition.id, variants);
    
    logger.info(`A/B test created successfully: ${testDefinition.id}`);
    
    return {
      id: testDefinition.id,
      name: testDefinition.name,
      status: 'created',
      variants: variants.map(v => ({ id: v.id, name: v.name }))
    };
  } catch (error) {
    logger.error(`Error creating A/B test: ${error.message}`, { error });
    throw new Error(`Failed to create A/B test: ${error.message}`);
  }
}

/**
 * Initializes trackers for an A/B test
 * 
 * @param {string} testId - ID of the test
 * @param {Array} variants - Array of variant objects
 * @returns {Promise<void>}
 */
async function initializeTrackers(testId, variants) {
  // Initialize performance tracker
  const performanceTracker = await trackPerformance(testId, variants);
  
  // Initialize user behavior tracker
  const behaviorTracker = new UserBehaviorTracker(testId, variants);
  await behaviorTracker.initialize();
  
  // Initialize data collector
  const dataCollector = new DataCollector(testId);
  await dataCollector.connect(performanceTracker, behaviorTracker);
  
  return {
    performanceTracker,
    behaviorTracker,
    dataCollector
  };
}

/**
 * Retrieves the current status of an A/B test
 * 
 * @param {string} testId - ID of the test to retrieve
 * @returns {Object} - Current test status with metrics
 */
async function getTestStatus(testId) {
  try {
    logger.info(`Retrieving A/B test status: ${testId}`);
    
    // Get test definition
    const testDefinition = await createTestDefinition.getById(testId);
    if (!testDefinition) {
      throw new Error(`Test not found: ${testId}`);
    }
    
    // Get variants
    const variants = await createVariant.getByTestId(testId);
    
    // Get performance data
    const performanceData = await trackPerformance.getByTestId(testId);
    
    // Get statistical analysis
    const analysis = await analyzeSplitTestData(testId);
    
    return {
      id: testDefinition.id,
      name: testDefinition.name,
      status: testDefinition.status,
      startDate: testDefinition.startDate,
      endDate: testDefinition.endDate,
      duration: testDefinition.duration,
      variants: variants.map(v => ({
        id: v.id,
        name: v.name,
        traffic: v.trafficAllocation,
        performance: performanceData.filter(p => p.variantId === v.id)
      })),
      hasWinner: analysis.hasWinner,
      winner: analysis.winner,
      confidenceLevel: analysis.confidenceLevel,
      improvementPercentage: analysis.improvementPercentage
    };
  } catch (error) {
    logger.error(`Error retrieving A/B test status: ${error.message}`, { error });
    throw new Error(`Failed to retrieve A/B test status: ${error.message}`);
  }
}

/**
 * Stops an A/B test and implements the winner if available
 * 
 * @param {string} testId - ID of the test to stop
 * @param {Object} options - Options for stopping the test
 * @param {boolean} options.implementWinner - Whether to implement the winner (default: true)
 * @param {string} options.winnerVariantId - Manually specify winner variant ID (optional)
 * @returns {Object} - Result of stopping the test
 */
async function stopTest(testId, options = { implementWinner: true }) {
  try {
    logger.info(`Stopping A/B test: ${testId}`);
    
    // Get test definition
    const testDefinition = await createTestDefinition.getById(testId);
    if (!testDefinition) {
      throw new Error(`Test not found: ${testId}`);
    }
    
    // Get final analysis
    const analysis = await analyzeSplitTestData(testId);
    
    // Update test status
    await createTestDefinition.update(testId, { status: 'stopped' });
    
    let implementationResult = null;
    
    // Implement winner if requested and available
    if (options.implementWinner) {
      const winnerVariantId = options.winnerVariantId || (analysis.hasWinner ? analysis.winner.id : null);
      
      if (winnerVariantId) {
        logger.info(`Implementing winner variant: ${winnerVariantId}`);
        implementationResult = await implementWinner(testId, winnerVariantId);
      } else {
        logger.info(`No winner determined for test: ${testId}`);
      }
    }
    
    return {
      id: testId,
      status: 'stopped',
      analysis,
      implementationResult
    };
  } catch (error) {
    logger.error(`Error stopping A/B test: ${error.message}`, { error });
    throw new Error(`Failed to stop A/B test: ${error.message}`);
  }
}

module.exports = {
  createTest,
  getTestStatus,
  stopTest,
  // Export component modules for direct access
  components: {
    createTestDefinition,
    createVariant,
    trackPerformance,
    analyzeSplitTestData,
    implementWinner,
    TrafficSplitter,
    SessionManager,
    UserBehaviorTracker,
    DataCollector
  }
};
