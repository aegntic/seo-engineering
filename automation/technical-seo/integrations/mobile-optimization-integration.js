/**
 * Mobile Optimization Integration
 * 
 * Integrates the Mobile Optimization module with the Technical SEO system
 * to provide comprehensive mobile SEO analysis within technical audits.
 */

const mobileOptimization = require('../../mobile-optimization');
const { v4: uuidv4 } = require('uuid');

/**
 * Run mobile optimization checks as part of a technical SEO audit
 * @param {string} url - The URL to analyze
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} - Mobile optimization results
 */
async function runMobileChecks(url, options = {}) {
  try {
    console.log(`Running integrated mobile optimization checks for: ${url}`);
    
    // Run the mobile optimization audit
    const mobileResults = await mobileOptimization.runMobileOptimizationAudit(url, {
      userAgent: options.userAgent || 'SEOAutomate Technical SEO Mobile Checker',
      timeout: options.timeout || 30000,
      devices: options.devices || ['iPhone 12', 'Galaxy S20', 'iPad Mini'],
      checks: options.mobileChecks || {
        viewportConfig: true,
        touchElements: true,
        responsiveDesign: true,
        mobilePerformance: true
      }
    });
    
    // Transform mobile results into technical SEO format
    const technicalSeoResults = {
      score: mobileResults.scores.overall,
      issues: transformIssues(mobileResults.issues),
      summary: {
        score: mobileResults.scores.overall,
        viewportConfigScore: mobileResults.scores.viewportConfig,
        touchElementsScore: mobileResults.scores.touchElements,
        responsiveDesignScore: mobileResults.scores.responsiveDesign,
        mobilePerformanceScore: mobileResults.scores.mobilePerformance,
        issuesCount: mobileResults.issues.length,
        criticalIssues: mobileResults.issues.filter(i => i.severity === 'critical').length,
        highIssues: mobileResults.issues.filter(i => i.severity === 'high').length,
        recommendation: mobileResults.summary.overall.recommendation
      },
      details: mobileResults
    };
    
    return technicalSeoResults;
  } catch (error) {
    console.error(`Error running integrated mobile checks for ${url}:`, error);
    
    // Return graceful failure
    return {
      score: 0,
      issues: [{
        id: uuidv4(),
        title: 'Mobile Optimization Check Failed',
        description: `Failed to run mobile optimization checks: ${error.message}`,
        severity: 'high',
        category: 'mobile-seo',
        recommendation: 'Check if the URL is accessible and properly formatted.'
      }],
      summary: {
        score: 0,
        issuesCount: 1,
        criticalIssues: 0,
        highIssues: 1,
        recommendation: 'Retry the mobile optimization checks or verify the URL is accessible.'
      }
    };
  }
}

/**
 * Transform mobile optimization issues to technical SEO format
 * @param {Array} issues - Mobile optimization issues
 * @returns {Array} - Transformed issues
 */
function transformIssues(issues) {
  return issues.map(issue => ({
    id: issue.id || uuidv4(),
    title: issue.title,
    description: issue.description,
    severity: issue.severity,
    category: 'mobile-seo',
    subcategory: issue.category,
    location: issue.location,
    impact: issue.impact || 'Unknown',
    effort: issue.effort || 'Unknown',
    recommendation: issue.recommendation
  }));
}

/**
 * Generate mobile-specific recommendations based on issues
 * @param {Array} issues - Technical SEO issues
 * @returns {Array} - Mobile optimization recommendations
 */
function generateMobileRecommendations(issues) {
  const mobileIssues = issues.filter(issue => 
    issue.category === 'mobile-seo' || 
    (issue.category === 'performance' && issue.description.toLowerCase().includes('mobile'))
  );
  
  return mobileIssues.map(issue => ({
    id: `rec-${uuidv4()}`,
    title: `Mobile: ${issue.title}`,
    description: issue.recommendation || 'Fix this mobile optimization issue.',
    severity: issue.severity,
    category: 'mobile-seo',
    impact: issue.impact || 'Unknown',
    effort: issue.effort || 'Medium'
  }));
}

module.exports = {
  runMobileChecks,
  generateMobileRecommendations
};
