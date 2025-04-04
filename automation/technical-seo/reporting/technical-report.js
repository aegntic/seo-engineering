/**
 * Technical SEO Report Generator
 * 
 * Generates comprehensive technical SEO reports based on audit results.
 */
const { getScoreRating } = require('../utils/scoring');
const { groupIssuesByCategory } = require('../utils/prioritization');

/**
 * Generate a technical SEO report from audit results
 * @param {Object} auditResults - Results from the technical SEO audit
 * @param {Object} options - Report generation options
 * @returns {Object} - Formatted report
 */
function generateTechnicalReport(auditResults, options = {}) {
  try {
    // Default options
    const defaultOptions = {
      format: 'json',               // json, html, pdf (pdf requires conversion outside this module)
      includeRecommendations: true, // include detailed recommendations
      detailLevel: 'detailed',      // summary, detailed, comprehensive
      groupBy: 'category',          // category, page, severity
      maxIssues: 1000,              // maximum number of issues to include
    };
    
    // Merge default options with user-provided options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Basic validation
    if (!auditResults || typeof auditResults !== 'object') {
      throw new Error('Invalid audit results provided');
    }
    
    // Initialize report object
    const report = {
      title: `Technical SEO Report for ${auditResults.url}`,
      url: auditResults.url,
      generatedAt: new Date().toISOString(),
      scanDate: auditResults.scanDate || new Date().toISOString(),
      scores: { ...auditResults.scores },
      summary: generateSummarySection(auditResults),
      overview: generateOverviewSection(auditResults),
      issues: [],
      recommendations: []
    };
    
    // Add issues based on detail level and max issues
    if (mergedOptions.detailLevel !== 'summary') {
      let issues = [...auditResults.issues];
      
      // Limit the number of issues
      if (issues.length > mergedOptions.maxIssues) {
        issues = issues.slice(0, mergedOptions.maxIssues);
      }
      
      // Group issues if requested
      if (mergedOptions.groupBy === 'category') {
        report.issuesByCategory = groupIssuesByCategory(issues);
      } else if (mergedOptions.groupBy === 'page') {
        report.issuesByPage = groupIssuesByPage(issues);
      } else if (mergedOptions.groupBy === 'severity') {
        report.issuesBySeverity = groupIssuesBySeverity(issues);
      }
      
      // Include the full issues list regardless of grouping
      report.issues = issues;
    }
    
    // Add recommendations if requested
    if (mergedOptions.includeRecommendations && auditResults.recommendations) {
      report.recommendations = auditResults.recommendations;
    }
    
    // Format the report based on requested format
    if (mergedOptions.format === 'html') {
      return generateHtmlReport(report, mergedOptions);
    } else {
      // For JSON format, return the report object directly
      return report;
    }
  } catch (error) {
    console.error('Error generating technical report:', error);
    
    // Return a minimal error report
    return {
      error: true,
      message: `Failed to generate report: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Generate the summary section of the report
 * @param {Object} auditResults - Audit results
 * @returns {Object} - Summary section
 */
function generateSummarySection(auditResults) {
  const overallScore = auditResults.scores.overall || 0;
  const rating = getScoreRating(overallScore);
  
  // Count issues by severity
  const issuesSeverity = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  };
  
  if (Array.isArray(auditResults.issues)) {
    auditResults.issues.forEach(issue => {
      if (issuesSeverity[issue.severity] !== undefined) {
        issuesSeverity[issue.severity]++;
      }
    });
  }
  
  return {
    score: overallScore,
    rating,
    issuesCount: auditResults.issues ? auditResults.issues.length : 0,
    issuesBySeverity: issuesSeverity,
    topCategories: getTopProblemCategories(auditResults),
    overallAssessment: generateOverallAssessment(overallScore, issuesSeverity)
  };
}

/**
 * Generate the overview section with category scores
 * @param {Object} auditResults - Audit results
 * @returns {Array} - Overview section with category summaries
 */
function generateOverviewSection(auditResults) {
  const categoryOverviews = [];
  
  // Get all categories that were analyzed
  const analyzedCategories = Object.keys(auditResults.scores)
    .filter(key => key !== 'overall');
  
  // Create overview entry for each category
  for (const category of analyzedCategories) {
    // Get score and determine status
    const score = auditResults.scores[category] || 0;
    let status = 'critical';
    if (score >= 90) status = 'excellent';
    else if (score >= 70) status = 'good';
    else if (score >= 50) status = 'needs improvement';
    else if (score >= 30) status = 'poor';
    
    // Get summary for this category if available
    const summary = auditResults.summary[category] || {};
    
    // Create the category overview
    categoryOverviews.push({
      category: formatCategoryName(category),
      score,
      status,
      summary: { ...summary }
    });
  }
  
  // Sort by score ascending (worst categories first)
  return categoryOverviews.sort((a, b) => a.score - b.score);
}

/**
 * Generate an overall assessment based on the score and issues
 * @param {number} score - Overall score
 * @param {Object} issuesBySeverity - Count of issues by severity 
 * @returns {string} - Overall assessment
 */
function generateOverallAssessment(score, issuesBySeverity) {
  if (score >= 90) {
    return 'Your website has excellent technical SEO health. Continue monitoring and maintaining best practices to stay ahead of competitors.';
  } else if (score >= 70) {
    return `Your website has good technical SEO but has room for improvement. Focus on addressing the ${issuesBySeverity.critical + issuesBySeverity.high} high-priority issues to boost your score.`;
  } else if (score >= 50) {
    return `Your website has several technical SEO issues that need attention. Prioritize fixing the ${issuesBySeverity.critical} critical issues first to see the biggest improvements.`;
  } else {
    return `Your website has critical technical SEO problems that are likely hurting your search visibility. Immediate action is recommended to address the ${issuesBySeverity.critical + issuesBySeverity.high} high-priority issues.`;
  }
}

/**
 * Get the top problem categories based on issue counts
 * @param {Object} auditResults - Audit results
 * @returns {Array} - Top problem categories
 */
function getTopProblemCategories(auditResults) {
  if (!Array.isArray(auditResults.issues) || auditResults.issues.length === 0) {
    return [];
  }
  
  // Count issues by category
  const categoryCounts = {};
  
  auditResults.issues.forEach(issue => {
    const category = issue.category || 'other';
    if (!categoryCounts[category]) {
      categoryCounts[category] = 0;
    }
    
    // Weight by severity
    const severityWeight = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1
    };
    
    categoryCounts[category] += severityWeight[issue.severity] || 1;
  });
  
  // Convert to array and sort by count descending
  const sortedCategories = Object.entries(categoryCounts)
    .map(([category, count]) => ({
      category: formatCategoryName(category),
      count,
      score: auditResults.scores[category] || 0
    }))
    .sort((a, b) => b.count - a.count);
  
  // Return top 3 categories
  return sortedCategories.slice(0, 3);
}

/**
 * Format a category name for display
 * @param {string} category - Raw category name
 * @returns {string} - Formatted category name
 */
function formatCategoryName(category) {
  if (!category) return 'Other';
  
  // Map of technical category IDs to display names
  const categoryMap = {
    pageSpeed: 'Page Speed',
    'page-speed': 'Page Speed',
    mobileResponsiveness: 'Mobile Responsiveness',
    'mobile-responsiveness': 'Mobile Responsiveness',
    metaTags: 'Meta Tags',
    'meta-tags': 'Meta Tags',
    schemaMarkup: 'Schema Markup',
    'schema-markup': 'Schema Markup',
    ssl: 'SSL Security',
    crawlability: 'Crawlability',
    contentQuality: 'Content Quality',
    'content-quality': 'Content Quality',
    urlStructure: 'URL Structure',
    'url-structure': 'URL Structure',
    siteArchitecture: 'Site Architecture',
    'site-architecture': 'Site Architecture',
    internationalSeo: 'International SEO',
    'international-seo': 'International SEO'
  };
  
  return categoryMap[category] || 
    category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

/**
 * Group issues by severity
 * @param {Array} issues - Issues to group
 * @returns {Object} - Issues grouped by severity
 */
function groupIssuesBySeverity(issues) {
  return issues.reduce((groups, issue) => {
    const severity = issue.severity || 'other';
    
    if (!groups[severity]) {
      groups[severity] = [];
    }
    
    groups[severity].push(issue);
    
    return groups;
  }, {});
}

/**
 * Generate an HTML report from the report object
 * @param {Object} report - Report data
 * @param {Object} options - Report options
 * @returns {string} - HTML report
 */
function generateHtmlReport(report, options) {
  // This is a placeholder - in a complete implementation, this would generate HTML
  // For now, we'll just convert the report to a string with note that HTML generation is not implemented
  return {
    ...report,
    format: 'html',
    html: '<p>HTML generation not fully implemented yet. Report data is available in the JSON format.</p>'
  };
}

module.exports = {
  generateTechnicalReport
};
