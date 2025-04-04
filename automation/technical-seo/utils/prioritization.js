/**
 * Issue Prioritization Utilities
 * 
 * Functions to prioritize and rank technical SEO issues based on severity,
 * impact, and ease of implementation.
 */

/**
 * Prioritize a list of technical SEO issues
 * @param {Array} issues - Array of issues to prioritize
 * @returns {Array} - Prioritized list of issues
 */
function prioritizeIssues(issues) {
  if (!Array.isArray(issues) || issues.length === 0) {
    return [];
  }
  
  // Create a deep copy of the issues to avoid mutating the original
  const prioritizedIssues = JSON.parse(JSON.stringify(issues));
  
  // Assign priority scores to each issue
  prioritizedIssues.forEach(issue => {
    issue.priorityScore = calculatePriorityScore(issue);
  });
  
  // Sort issues by priority score (descending)
  prioritizedIssues.sort((a, b) => b.priorityScore - a.priorityScore);
  
  // Remove priority scores from the final output
  return prioritizedIssues.map(issue => {
    const { priorityScore, ...rest } = issue;
    return rest;
  });
}

/**
 * Calculate a priority score for an issue based on multiple factors
 * @param {Object} issue - Issue object with severity, impact, etc.
 * @returns {number} - Priority score
 */
function calculatePriorityScore(issue) {
  // Base priority by severity
  const severityScores = {
    critical: 100,
    high: 75,
    medium: 50,
    low: 25
  };
  
  // Base score from severity
  let score = severityScores[issue.severity] || 50;
  
  // Adjust based on impact if available
  if (issue.impact) {
    const impactMultipliers = {
      high: 1.2,
      medium: 1,
      low: 0.8,
      'very low': 0.6
    };
    
    const impactMultiplier = impactMultipliers[issue.impact.toLowerCase()] || 1;
    score *= impactMultiplier;
  }
  
  // Adjust based on effort/difficulty if available
  if (issue.effort) {
    const effortMultipliers = {
      low: 1.1,    // Easy fixes get slight priority boost
      medium: 1,
      high: 0.9    // Difficult fixes get slight priority reduction
    };
    
    const effortMultiplier = effortMultipliers[issue.effort.toLowerCase()] || 1;
    score *= effortMultiplier;
  }
  
  // Adjust by category importance
  const categoryImportance = getCategoryImportance(issue.category);
  score *= categoryImportance;
  
  return score;
}

/**
 * Get importance multiplier for an issue category
 * @param {string} category - Issue category
 * @returns {number} - Importance multiplier
 */
function getCategoryImportance(category) {
  // Define category importance (can be adjusted based on specific business needs)
  const importanceMap = {
    'page-speed': 1.1,        // Critical for user experience and rankings
    'ssl': 1.1,               // Critical for security and rankings
    'mobile-responsiveness': 1.1, // Very important for modern SEO
    'meta-tags': 1.05,        // Important for rankings and CTR
    'crawlability': 1.05,     // Important for indexation
    'schema-markup': 0.95,    // Helpful but not critical
    'content-quality': 1,     // Important for engagement
    'url-structure': 0.9,     // Helpful but lower priority
    'site-architecture': 0.9, // Helpful but more complex to fix
    'international-seo': 0.8  // Only important for international sites
  };
  
  // Normalize the category name for lookup
  const normalizedCategory = category ? category.toLowerCase().replace(/_/g, '-') : '';
  
  // Return the importance multiplier or default to 1
  return importanceMap[normalizedCategory] || 1;
}

/**
 * Group issues by page for better organization
 * @param {Array} issues - Array of issues to group
 * @returns {Object} - Issues grouped by page URL
 */
function groupIssuesByPage(issues) {
  return issues.reduce((groups, issue) => {
    const page = issue.location || 'unknown';
    
    if (!groups[page]) {
      groups[page] = [];
    }
    
    groups[page].push(issue);
    
    return groups;
  }, {});
}

/**
 * Group issues by category for better organization
 * @param {Array} issues - Array of issues to group
 * @returns {Object} - Issues grouped by category
 */
function groupIssuesByCategory(issues) {
  return issues.reduce((groups, issue) => {
    const category = issue.category || 'other';
    
    if (!groups[category]) {
      groups[category] = [];
    }
    
    groups[category].push(issue);
    
    return groups;
  }, {});
}

module.exports = {
  prioritizeIssues,
  groupIssuesByPage,
  groupIssuesByCategory
};
