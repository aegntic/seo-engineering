/**
 * SEO.engineering Automation Module
 * 
 * Main entry point for all automation features with error handling.
 * 
 * Last updated: April 4, 2025
 */

const logger = require('./utils/logger');
const errorHandler = require('./utils/error-handling');
const errorIntegration = require('./utils/error-handling/integration');

// Import raw modules
const rawCrawler = require('./crawler');
const rawTechnicalSEO = require('./technical-seo');
const rawFixImplementation = require('./fix-implementation');
const rawGitIntegration = require('./git-integration');
const rawVerification = require('./verification');
const rawMobileOptimization = require('./mobile-optimization');
const rawContentOptimization = require('./content-optimization');
const rawABTesting = require('./ab-testing');

// Apply error handling enhancements
const crawler = errorIntegration.enhanceCrawler(rawCrawler);
const fixImplementation = errorIntegration.enhanceFixImplementation(rawFixImplementation);
const verification = errorIntegration.enhanceVerification(rawVerification);

// Apply general error handling to other modules
const technicalSEO = errorHandler.createSafeModule(rawTechnicalSEO, { rethrow: true });
const gitIntegration = errorHandler.createSafeModule(rawGitIntegration, { rethrow: true });
const mobileOptimization = errorHandler.createSafeModule(rawMobileOptimization, { rethrow: true });
const contentOptimization = errorHandler.createSafeModule(rawContentOptimization, { rethrow: true });
const abTesting = errorHandler.createSafeModule(rawABTesting, { rethrow: true });

/**
 * Runs a complete automation workflow for a site
 * 
 * @param {string} url - Site URL to analyze and fix
 * @param {Object} options - Workflow options
 * @returns {Promise<Object>} - Workflow results
 */
async function runAutomationWorkflow(url, options = {}) {
  try {
    logger.info(`Starting automation workflow for site: ${url}`);
    
    // Step 1: Crawl the site
    const crawlResult = await crawler.crawlSite(url, options.crawl);
    const siteId = crawlResult.siteId;
    
    // Step 2: Analyze technical SEO
    const analysisResult = await technicalSEO.analyzeSite(siteId, options.analysis);
    
    // Step 3: Prioritize issues
    const prioritizedIssues = await technicalSEO.prioritizeIssues(
      analysisResult.issues,
      options.prioritization
    );
    
    // Step 4: Generate fixes
    const fixes = await fixImplementation.generateFixes(
      prioritizedIssues,
      options.fixGeneration
    );
    
    // Skip implementation if in analysis-only mode
    if (options.analysisOnly) {
      return {
        siteId,
        url,
        analysisResult,
        prioritizedIssues,
        fixes,
        analysisOnly: true
      };
    }
    
    // Step 5: Implement fixes
    const implementationResult = await fixImplementation.implementFixes(
      fixes,
      siteId,
      options.fixImplementation
    );
    
    // Step 6: Verify fixes
    const verificationResult = await verification.verifySite({
      siteId,
      ...options.verification
    });
    
    // Rollback if verification failed and rollback is enabled
    if (!verificationResult.success && options.rollbackOnFailure !== false) {
      logger.warn(`Verification failed, rolling back changes for site: ${url}`);
      
      const rollbackResult = await fixImplementation.rollbackFixes(
        implementationResult.appliedFixes,
        siteId
      );
      
      return {
        siteId,
        url,
        analysisResult,
        prioritizedIssues,
        fixes,
        implementationResult,
        verificationResult,
        rollbackResult,
        success: false
      };
    }
    
    logger.info(`Completed automation workflow for site: ${url}`);
    
    return {
      siteId,
      url,
      analysisResult,
      prioritizedIssues,
      fixes,
      implementationResult,
      verificationResult,
      success: verificationResult.success
    };
  } catch (error) {
    // Handle workflow errors
    const enhancedError = errorHandler.createError(
      `Automation workflow failed for site: ${url}`,
      {
        type: errorHandler.ErrorTypes.INTERNAL,
        severity: errorHandler.SeverityLevels.HIGH,
        originalError: error,
        module: 'automation',
        operation: 'runAutomationWorkflow',
        data: { url, options }
      }
    );
    
    // Log and notify
    await errorHandler.handleError(enhancedError, {
      notify: true,
      rethrow: true
    });
    
    // This will never be reached due to rethrow: true above
    return null;
  }
}

/**
 * Gets system status information
 * 
 * @returns {Object} - System status
 */
function getSystemStatus() {
  return {
    errorHandling: errorIntegration.getErrorHandlingStatus(),
    modules: {
      crawler: { active: true },
      technicalSEO: { active: true },
      fixImplementation: { active: true },
      gitIntegration: { active: true },
      verification: { active: true },
      mobileOptimization: { active: true },
      contentOptimization: { active: true },
      abTesting: { active: true }
    }
  };
}

module.exports = {
  // Main workflow
  runAutomationWorkflow,
  getSystemStatus,
  
  // Enhanced modules
  crawler,
  technicalSEO,
  fixImplementation,
  gitIntegration,
  verification,
  mobileOptimization,
  contentOptimization,
  abTesting,
  
  // Error handling utilities
  errorHandler
};
