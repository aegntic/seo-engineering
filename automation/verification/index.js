/**
 * Verification System - Core Controller
 * 
 * This module orchestrates the verification process to confirm that
 * SEO fixes have been successfully implemented and are effective.
 * It integrates with the Implementation Module and provides results
 * to the Client Dashboard.
 */

const BeforeAfterComparison = require('./strategies/beforeAfterComparison');
const PerformanceImpact = require('./strategies/performanceImpact');
const RegressionTesting = require('./strategies/regressionTesting');
const VisualComparison = require('./strategies/visualComparison');
const VerificationResult = require('./models/verificationResult');
const logger = require('../common/logger');
const { getFixesForSite } = require('../implementation/fixTracker');

class VerificationSystem {
  constructor(options = {}) {
    this.strategies = {
      beforeAfter: new BeforeAfterComparison(options),
      performance: new PerformanceImpact(options),
      regression: new RegressionTesting(options),
      visual: new VisualComparison(options)
    };
    
    this.config = {
      screenshotComparisons: options.screenshotComparisons ?? true,
      performanceThreshold: options.performanceThreshold ?? 5, // 5% improvement required
      regressionTestCount: options.regressionTestCount ?? 3,
      ...options
    };
    
    logger.info('Verification System initialized');
  }
  
  /**
   * Verify all implemented fixes for a specific site
   * 
   * @param {string} siteId - The unique identifier for the site
   * @param {Object} options - Additional verification options
   * @returns {Promise<VerificationResult>} - The verification results
   */
  async verifySite(siteId, options = {}) {
    logger.info(`Starting verification for site: ${siteId}`);
    
    try {
      // Get all implemented fixes from the Implementation System
      const implementedFixes = await getFixesForSite(siteId);
      
      if (!implementedFixes || implementedFixes.length === 0) {
        logger.warn(`No implemented fixes found for site: ${siteId}`);
        return new VerificationResult({
          siteId,
          success: false,
          message: 'No implemented fixes to verify',
          fixes: []
        });
      }
      
      logger.info(`Found ${implementedFixes.length} fixes to verify`);
      
      // Run verification for each fix using all applicable strategies
      const verifiedFixes = await Promise.all(
        implementedFixes.map(fix => this.verifyFix(siteId, fix, options))
      );
      
      // Aggregate results
      const allSuccess = verifiedFixes.every(result => result.success);
      const overallResult = new VerificationResult({
        siteId,
        success: allSuccess,
        message: allSuccess 
          ? 'All fixes successfully verified' 
          : 'Some fixes failed verification',
        fixes: verifiedFixes,
        timestamp: new Date()
      });
      
      logger.info(`Verification complete for site ${siteId}, Success: ${allSuccess}`);
      return overallResult;
      
    } catch (error) {
      logger.error(`Verification failed for site ${siteId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Verify a specific fix implementation
   * 
   * @param {string} siteId - The site identifier
   * @param {Object} fix - The fix implementation details
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - The verification result for this fix
   */
  async verifyFix(siteId, fix, options = {}) {
    logger.info(`Verifying fix: ${fix.id} (${fix.type}) for site: ${siteId}`);
    
    // Determine which strategies apply to this fix type
    const applicableStrategies = this.getApplicableStrategies(fix.type);
    
    // Run all applicable verification strategies
    const strategyResults = {};
    
    for (const [strategyName, strategy] of Object.entries(applicableStrategies)) {
      logger.debug(`Running ${strategyName} verification for fix: ${fix.id}`);
      strategyResults[strategyName] = await strategy.verify(siteId, fix, options);
    }
    
    // Determine overall success based on strategy results
    const success = Object.values(strategyResults).every(result => result.success);
    
    return {
      fixId: fix.id,
      fixType: fix.type,
      success,
      strategyResults,
      timestamp: new Date()
    };
  }
  
  /**
   * Determine which verification strategies apply to a given fix type
   * 
   * @param {string} fixType - The type of fix implemented
   * @returns {Object} - Map of applicable strategy instances
   */
  getApplicableStrategies(fixType) {
    // Strategy applicability rules based on fix type
    const applicableStrategies = {};
    
    // Before/After comparison applies to all fixes
    applicableStrategies.beforeAfter = this.strategies.beforeAfter;
    
    // Performance impact only applies to performance-related fixes
    if (['speed', 'image-optimization', 'resource-minification', 'caching'].includes(fixType)) {
      applicableStrategies.performance = this.strategies.performance;
    }
    
    // Regression testing applies to all fixes
    applicableStrategies.regression = this.strategies.regression;
    
    // Visual comparison only applies to layout/visual fixes
    if (['layout', 'mobile-responsive', 'visual-elements'].includes(fixType)) {
      applicableStrategies.visual = this.strategies.visual;
    }
    
    return applicableStrategies;
  }
}

module.exports = VerificationSystem;
