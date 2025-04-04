/**
 * Regression Testing Strategy
 * 
 * Runs tests to verify that applying SEO fixes hasn't broken
 * existing functionality or introduced new issues.
 */

const ComparisonMetric = require('../models/comparisonMetric');
const { getRegressionTests } = require('../../implementation/testRegistry');
const { runTest } = require('../utils/testRunner');
const logger = require('../../common/logger');

class RegressionTesting {
  constructor(options = {}) {
    this.options = {
      // Number of regression tests to run
      testCount: options.regressionTestCount || 3,
      // Whether to run critical path tests
      runCriticalTests: options.runCriticalTests !== undefined ? options.runCriticalTests : true,
      // Whether to run full site tests
      runFullSiteTests: options.runFullSiteTests !== undefined ? options.runFullSiteTests : false,
      // Test timeout in milliseconds
      timeout: options.testTimeout || 30000,
      ...options
    };
  }
  
  /**
   * Verify a fix by running regression tests
   * 
   * @param {string} siteId - The site identifier
   * @param {Object} fix - The fix implementation details
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Verification result
   */
  async verify(siteId, fix, options = {}) {
    logger.info(`Running regression tests for fix: ${fix.id} on site: ${siteId}`);
    
    try {
      // Get regression tests for this site and fix type
      const tests = await this.getApplicableTests(siteId, fix);
      
      if (!tests || tests.length === 0) {
        logger.warn(`No regression tests found for fix: ${fix.id}`);
        return {
          success: true, // No tests to run means no regressions detected
          message: 'No regression tests defined for this fix type',
          tests: []
        };
      }
      
      logger.info(`Found ${tests.length} regression tests to run`);
      
      // Run the tests
      const testResults = await this.runTests(tests, siteId, options);
      
      // Check if all tests passed
      const allPassed = testResults.every(result => result.passed);
      
      // Count passed and failed tests
      const passedCount = testResults.filter(result => result.passed).length;
      const failedCount = testResults.length - passedCount;
      
      return {
        success: allPassed,
        message: allPassed
          ? `All ${testResults.length} regression tests passed`
          : `${failedCount} of ${testResults.length} regression tests failed`,
        tests: testResults
      };
      
    } catch (error) {
      logger.error(`Regression testing failed: ${error.message}`);
      return {
        success: false,
        message: `Regression testing failed: ${error.message}`,
        tests: []
      };
    }
  }
  
  /**
   * Get applicable regression tests for a fix
   * 
   * @param {string} siteId - The site identifier
   * @param {Object} fix - The fix details
   * @returns {Promise<Array>} - Applicable regression tests
   */
  async getApplicableTests(siteId, fix) {
    const combinedOptions = {
      ...this.options,
      fixType: fix.type,
      urls: fix.targetUrls
    };
    
    // Get all regression tests for this site
    const allTests = await getRegressionTests(siteId, combinedOptions);
    
    if (!allTests || allTests.length === 0) {
      return [];
    }
    
    // Filter tests by relevance to this fix type
    const relevantTests = allTests.filter(test => {
      // Critical tests always run
      if (test.critical && this.options.runCriticalTests) {
        return true;
      }
      
      // Full site tests run if enabled
      if (test.fullSite && this.options.runFullSiteTests) {
        return true;
      }
      
      // Tests specific to this fix type
      if (test.fixTypes && test.fixTypes.includes(fix.type)) {
        return true;
      }
      
      // Tests for specific URLs affected by this fix
      if (test.urls && fix.targetUrls.some(url => test.urls.includes(url))) {
        return true;
      }
      
      return false;
    });
    
    // Limit the number of tests if specified
    if (this.options.testCount > 0 && relevantTests.length > this.options.testCount) {
      // Prioritize critical tests
      const criticalTests = relevantTests.filter(test => test.critical);
      const nonCriticalTests = relevantTests.filter(test => !test.critical);
      
      // Take all critical tests and fill the rest with non-critical
      const remaining = Math.max(0, this.options.testCount - criticalTests.length);
      return [
        ...criticalTests,
        ...nonCriticalTests.slice(0, remaining)
      ];
    }
    
    return relevantTests;
  }
  
  /**
   * Run a set of regression tests
   * 
   * @param {Array} tests - Tests to run
   * @param {string} siteId - The site identifier
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} - Test results
   */
  async runTests(tests, siteId, options = {}) {
    const combinedOptions = {
      ...this.options,
      ...options,
      timeout: options.timeout || this.options.timeout
    };
    
    // Run tests in parallel for efficiency
    const results = await Promise.all(
      tests.map(async test => {
        try {
          logger.debug(`Running regression test: ${test.name}`);
          
          // Track test start time
          const startTime = Date.now();
          
          // Run the test
          const result = await runTest(test, siteId, combinedOptions);
          
          // Calculate test duration
          const duration = Date.now() - startTime;
          
          return {
            testId: test.id,
            name: test.name,
            description: test.description,
            passed: result.passed,
            duration,
            critical: test.critical || false,
            details: result.details || {},
            errors: result.errors || []
          };
        } catch (error) {
          logger.error(`Test ${test.name} failed with error: ${error.message}`);
          
          // If a test throws an exception, it's considered failed
          return {
            testId: test.id,
            name: test.name,
            description: test.description,
            passed: false,
            duration: 0,
            critical: test.critical || false,
            details: {},
            errors: [{
              message: error.message,
              stack: error.stack
            }]
          };
        }
      })
    );
    
    return results;
  }
  
  /**
   * Create comparison metrics from test results
   * 
   * @param {Array} testResults - Results of regression tests
   * @returns {Array<ComparisonMetric>} - Comparison metrics
   */
  createMetricsFromTests(testResults) {
    const metrics = [];
    
    // Group tests by category
    const categories = {};
    
    testResults.forEach(result => {
      const category = result.category || 'General';
      
      if (!categories[category]) {
        categories[category] = {
          total: 0,
          passed: 0
        };
      }
      
      categories[category].total++;
      
      if (result.passed) {
        categories[category].passed++;
      }
    });
    
    // Create metrics for each category
    Object.entries(categories).forEach(([category, stats]) => {
      const passRate = (stats.passed / stats.total) * 100;
      
      metrics.push(new ComparisonMetric({
        name: `${category} Tests Pass Rate`,
        beforeValue: 100, // We assume 100% pass rate before
        afterValue: passRate,
        unit: '%',
        higherIsBetter: true,
        threshold: 100 // All tests must pass
      }));
    });
    
    return metrics;
  }
}

module.exports = RegressionTesting;
