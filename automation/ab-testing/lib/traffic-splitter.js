/**
 * Traffic Splitter Module
 * 
 * Manages the splitting of traffic between different variants.
 * Assigns users to variants and maintains consistent experiences.
 * 
 * Last updated: April 4, 2025
 */

const crypto = require('crypto');
const logger = require('../../utils/logger');

/**
 * Traffic Splitter class for managing traffic allocation
 */
class TrafficSplitter {
  /**
   * Creates a new TrafficSplitter instance
   * 
   * @param {Object} testDefinition - Test definition object
   */
  constructor(testDefinition) {
    this.testId = testDefinition.id;
    this.trafficAllocation = testDefinition.trafficAllocation || new Map();
    this.initialized = false;
    this.logger = logger;
  }
  
  /**
   * Initializes the traffic splitter
   * 
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      this.logger.info(`Initializing traffic splitter for test: ${this.testId}`);
      
      // Validate traffic allocation
      this.validateTrafficAllocation();
      
      // Set up bucketing
      this.setupBuckets();
      
      this.initialized = true;
      this.logger.info(`Traffic splitter initialized for test: ${this.testId}`);
    } catch (error) {
      this.logger.error(`Error initializing traffic splitter: ${error.message}`, { error });
      throw new Error(`Failed to initialize traffic splitter: ${error.message}`);
    }
  }
  
  /**
   * Validates traffic allocation
   * 
   * @throws {Error} If allocation is invalid
   */
  validateTrafficAllocation() {
    if (!this.trafficAllocation || this.trafficAllocation.size === 0) {
      throw new Error('Traffic allocation not defined');
    }
    
    const totalAllocation = Array.from(this.trafficAllocation.values())
      .reduce((sum, val) => sum + val, 0);
    
    if (Math.abs(totalAllocation - 1) > 0.001) {
      throw new Error(`Total traffic allocation must be 1.0, got ${totalAllocation}`);
    }
  }
  
  /**
   * Sets up buckets for traffic allocation
   */
  setupBuckets() {
    this.buckets = [];
    let cumulativeAllocation = 0;
    
    for (const [variantId, allocation] of this.trafficAllocation.entries()) {
      const lowerBound = cumulativeAllocation;
      cumulativeAllocation += allocation;
      const upperBound = cumulativeAllocation;
      
      this.buckets.push({
        variantId,
        lowerBound,
        upperBound
      });
    }
  }
  
  /**
   * Assigns a visitor to a variant
   * 
   * @param {string} visitorId - Unique identifier for the visitor
   * @returns {string} - Assigned variant ID
   */
  assignVariant(visitorId) {
    if (!this.initialized) {
      throw new Error('Traffic splitter not initialized');
    }
    
    // Generate a hash from visitor ID and test ID
    const hash = crypto.createHash('sha256')
      .update(`${visitorId}-${this.testId}`)
      .digest('hex');
    
    // Convert hash to a number between 0 and 1
    const hashNumber = parseInt(hash.substring(0, 8), 16) / 0xffffffff;
    
    // Find the bucket for this hash
    for (const bucket of this.buckets) {
      if (hashNumber >= bucket.lowerBound && hashNumber < bucket.upperBound) {
        return bucket.variantId;
      }
    }
    
    // Fallback to the first bucket (should never happen)
    return this.buckets[0].variantId;
  }
  
  /**
   * Updates traffic allocation for the test
   * 
   * @param {Map} newAllocation - New traffic allocation
   * @returns {Promise<void>}
   */
  async updateAllocation(newAllocation) {
    try {
      this.trafficAllocation = newAllocation;
      
      // Validate and setup buckets again
      this.validateTrafficAllocation();
      this.setupBuckets();
      
      this.logger.info(`Updated traffic allocation for test: ${this.testId}`);
    } catch (error) {
      this.logger.error(`Error updating traffic allocation: ${error.message}`, { error });
      throw new Error(`Failed to update traffic allocation: ${error.message}`);
    }
  }
  
  /**
   * Checks if a visitor has been assigned to a variant
   * 
   * @param {string} visitorId - Unique identifier for the visitor
   * @returns {string} - Assigned variant ID or null if not assigned
   */
  getAssignedVariant(visitorId) {
    if (!this.initialized) {
      throw new Error('Traffic splitter not initialized');
    }
    
    return this.assignVariant(visitorId);
  }
  
  /**
   * Gets all variants and their traffic allocation
   * 
   * @returns {Array} - Array of variant allocations
   */
  getAllocations() {
    if (!this.initialized) {
      throw new Error('Traffic splitter not initialized');
    }
    
    return this.buckets.map(bucket => ({
      variantId: bucket.variantId,
      allocation: bucket.upperBound - bucket.lowerBound
    }));
  }
}

module.exports = {
  TrafficSplitter
};
