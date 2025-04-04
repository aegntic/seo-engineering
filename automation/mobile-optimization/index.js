/**
 * Mobile Optimization Checks Module
 * 
 * This module provides specialized checks for mobile-specific SEO factors
 * including viewport configuration, touch element sizing, responsive design,
 * and mobile page speed.
 */

const ViewportConfigAnalyzer = require('./analyzers/viewport-config');
const TouchElementValidator = require('./analyzers/touch-elements');
const ResponsiveDesignTester = require('./analyzers/responsive-design');
const MobilePerformanceMeasurer = require('./analyzers/mobile-performance');
const { calculateMobileScore } = require('./utils/scoring');
const { generateMobileReport } = require('./reporting/mobile-report');

/**
 * Runs a comprehensive mobile optimization analysis on a website
 * @param {string} url - The URL of the website to audit
 * @param {Object} options - Configuration options for the audit
 * @returns {Promise<Object>} - The audit results
 */
async function runMobileOptimizationAudit(url, options = {}) {
  try {
    // Default options
    const defaultOptions = {
      userAgent: 'SEOAutomate/1.0 Mobile Optimization Checker',
      timeout: 30000, // 30 seconds
      devices: ['iPhone 12', 'Galaxy S20', 'iPad Mini'], // Default devices to test
      checks: {
        viewportConfig: true,
        touchElements: true,
        responsiveDesign: true,
        mobilePerformance: true
      }
    };

    // Merge default options with user-provided options
    const mergedOptions = { ...defaultOptions, ...options };
    
    if (typeof mergedOptions.checks === 'object') {
      mergedOptions.checks = { ...defaultOptions.checks, ...mergedOptions.checks };
    }

    console.log(`Starting mobile optimization audit for: ${url}`);
    
    // Initialize results object
    const results = {
      url,
      scanDate: new Date().toISOString(),
      scores: {},
      issues: [],
      recommendations: [],
      summary: {}
    };
    
    // Run enabled checks in parallel
    const checkPromises = [];
    
    if (mergedOptions.checks.viewportConfig) {
      checkPromises.push(
        ViewportConfigAnalyzer.analyze(url, mergedOptions)
          .then(data => {
            results.scores.viewportConfig = data.score;
            results.issues = [...results.issues, ...data.issues];
            results.summary.viewportConfig = data.summary;
            return data;
          })
      );
    }
    
    if (mergedOptions.checks.touchElements) {
      checkPromises.push(
        TouchElementValidator.validate(url, mergedOptions)
          .then(data => {
            results.scores.touchElements = data.score;
            results.issues = [...results.issues, ...data.issues];
            results.summary.touchElements = data.summary;
            return data;
          })
      );
    }
    
    if (mergedOptions.checks.responsiveDesign) {
      checkPromises.push(
        ResponsiveDesignTester.test(url, mergedOptions)
          .then(data => {
            results.scores.responsiveDesign = data.score;
            results.issues = [...results.issues, ...data.issues];
            results.summary.responsiveDesign = data.summary;
            return data;
          })
      );
    }
    
    if (mergedOptions.checks.mobilePerformance) {
      checkPromises.push(
        MobilePerformanceMeasurer.measure(url, mergedOptions)
          .then(data => {
            results.scores.mobilePerformance = data.score;
            results.issues = [...results.issues, ...data.issues];
            results.summary.mobilePerformance = data.summary;
            return data;
          })
      );
    }
    
    // Wait for all checks to complete
    await Promise.all(checkPromises);
    
    // Calculate overall mobile optimization score
    results.scores.overall = calculateMobileScore(results.scores);
    
    // Count issues by severity
    const criticalCount = results.issues.filter(issue => issue.severity === 'critical').length;
    const highCount = results.issues.filter(issue => issue.severity === 'high').length;
    const mediumCount = results.issues.filter(issue => issue.severity === 'medium').length;
    const lowCount = results.issues.filter(issue => issue.severity === 'low').length;
    
    // Create overall summary
    results.summary.overall = {
      score: results.scores.overall,
      totalIssues: results.issues.length,
      criticalIssues: criticalCount,
      highIssues: highCount,
      mediumIssues: mediumCount,
      lowIssues: lowCount,
      recommendation: getOverallRecommendation(results.scores.overall)
    };
    
    console.log(`Mobile optimization audit completed for: ${url}`);
    
    return results;
  } catch (error) {
    console.error(`Error running mobile optimization audit for ${url}:`, error);
    throw error;
  }
}

/**
 * Generate a full mobile optimization report
 * @param {Object} auditResults - Results from runMobileOptimizationAudit
 * @param {Object} options - Report options
 * @returns {Object} - Formatted report
 */
function generateReport(auditResults, options = {}) {
  return generateMobileReport(auditResults, options);
}

/**
 * Get an overall recommendation based on the mobile score
 * @param {number} score - The overall mobile optimization score
 * @returns {string} - General recommendation
 */
function getOverallRecommendation(score) {
  if (score >= 90) {
    return 'Your website is well-optimized for mobile devices. Continue monitoring as new devices enter the market.';
  } else if (score >= 70) {
    return 'Your website has good mobile optimization but could benefit from addressing a few issues to improve mobile user experience.';
  } else if (score >= 50) {
    return 'Your website has several mobile optimization issues that should be addressed to improve mobile user experience and search rankings.';
  } else {
    return 'Your website has critical mobile optimization issues that are likely affecting user experience and mobile search rankings. These should be addressed as a high priority.';
  }
}

module.exports = {
  runMobileOptimizationAudit,
  generateReport,
  analyzers: {
    ViewportConfigAnalyzer,
    TouchElementValidator,
    ResponsiveDesignTester,
    MobilePerformanceMeasurer
  }
};
