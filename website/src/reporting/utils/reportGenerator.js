/**
 * Utility functions for generating SEO reports
 * 
 * This module handles the creation and formatting of SEO reports
 * based on scan data and selected templates.
 */

/**
 * Generates a report data object from raw scan results
 * @param {Object} scanResults The raw scan results from the SEO analysis
 * @param {Object} options Configuration options for report generation
 * @param {boolean} options.includeRecommendations Whether to include recommendations
 * @param {boolean} options.includeMetrics Whether to include performance metrics
 * @returns {Object} Formatted report data
 */
export const generateReportData = (scanResults, options = {}) => {
  const {
    includeRecommendations = true,
    includeMetrics = true
  } = options;
  
  if (!scanResults) {
    throw new Error('Scan results are required to generate a report');
  }
  
  // Extract basic site info
  const reportData = {
    siteUrl: scanResults.siteUrl || 'Unknown Site',
    scanDate: scanResults.scanDate || new Date().toISOString(),
    score: calculateOverallScore(scanResults),
    issues: formatIssues(scanResults.issues || []),
  };
  
  // Add optional sections based on options
  if (includeMetrics) {
    reportData.metrics = formatMetrics(scanResults.metrics || []);
  }
  
  if (includeRecommendations) {
    reportData.recommendations = generateRecommendations(scanResults);
  }
  
  return reportData;
};

/**
 * Calculates an overall SEO score based on the scan results
 * @param {Object} scanResults The raw scan results
 * @returns {number} Score from 0-100
 */
export const calculateOverallScore = (scanResults) => {
  if (!scanResults || !scanResults.issues) {
    return 0;
  }
  
  // Count issues by severity
  const issueCounts = {
    critical: scanResults.issues.filter(i => i.severity === 'critical').length,
    high: scanResults.issues.filter(i => i.severity === 'high').length,
    medium: scanResults.issues.filter(i => i.severity === 'medium').length,
    low: scanResults.issues.filter(i => i.severity === 'low').length
  };
  
  // Calculate weighted score
  // Formula: 100 - (critical*10 + high*5 + medium*2 + low*1)
  let deductions = 
    (issueCounts.critical * 10) + 
    (issueCounts.high * 5) + 
    (issueCounts.medium * 2) + 
    (issueCounts.low * 1);
  
  // Ensure score is between 0-100
  return Math.max(0, Math.min(100, 100 - deductions));
};

/**
 * Formats raw issues data for display in the report
 * @param {Array} issues Raw issues from scan results
 * @returns {Array} Formatted issues
 */
export const formatIssues = (issues) => {
  if (!Array.isArray(issues)) {
    return [];
  }
  
  return issues.map(issue => ({
    title: issue.title || 'Unknown Issue',
    description: issue.description || '',
    severity: issue.severity || 'medium',
    location: issue.location || issue.url || 'Unknown Location',
    impact: issue.impact || 'May affect SEO performance'
  }));
};

/**
 * Formats raw metrics data for display in the report
 * @param {Array} metrics Raw metrics from scan results
 * @returns {Array} Formatted metrics
 */
export const formatMetrics = (metrics) => {
  if (!Array.isArray(metrics)) {
    return [];
  }
  
  return metrics.map(metric => ({
    name: metric.name || 'Unknown Metric',
    value: metric.value ?? 0,
    unit: metric.unit || '',
    change: metric.change,
    description: metric.description || ''
  }));
};

/**
 * Generates recommendations based on identified issues
 * @param {Object} scanResults Raw scan results
 * @returns {Array} Recommendations for improving SEO
 */
export const generateRecommendations = (scanResults) => {
  if (!scanResults || !scanResults.issues || !Array.isArray(scanResults.issues)) {
    return [];
  }
  
  // Group issues by category
  const issuesByCategory = scanResults.issues.reduce((acc, issue) => {
    const category = issue.category || 'technical';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(issue);
    return acc;
  }, {});
  
  // Generate recommendations for each category
  const recommendations = [];
  
  // Process each category and generate appropriate recommendations
  Object.entries(issuesByCategory).forEach(([category, categoryIssues]) => {
    // Sort issues by severity
    const sortedIssues = [...categoryIssues].sort((a, b) => {
      const severityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityWeight[b.severity] - severityWeight[a.severity];
    });
    
    // Generate category-specific recommendations
    if (category === 'performance' && sortedIssues.length > 0) {
      recommendations.push({
        title: 'Improve Site Performance',
        description: 'Enhance site speed and user experience by addressing performance issues',
        category: 'Performance',
        impact: calculateImpactScore(sortedIssues),
        steps: generatePerformanceSteps(sortedIssues),
        resources: [
          { 
            title: 'Google PageSpeed Insights', 
            url: 'https://pagespeed.web.dev/' 
          },
          { 
            title: 'Web.dev Performance Guides', 
            url: 'https://web.dev/learn/#performance' 
          }
        ]
      });
    }
    
    if (category === 'technical' && sortedIssues.length > 0) {
      recommendations.push({
        title: 'Fix Technical SEO Issues',
        description: 'Resolve technical issues that may be hurting your search engine visibility',
        category: 'Technical',
        impact: calculateImpactScore(sortedIssues),
        steps: generateTechnicalSteps(sortedIssues),
        resources: [
          { 
            title: 'Google's SEO Starter Guide', 
            url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide' 
          },
          { 
            title: 'Technical SEO Checklist', 
            url: 'https://moz.com/blog/technical-seo-checklist' 
          }
        ]
      });
    }
    
    // Add more category-specific recommendations as needed
  });
  
  return recommendations;
};

/**
 * Calculate impact score (1-5) based on issue severity
 * @param {Array} issues List of issues
 * @returns {number} Impact score from 1-5
 */
const calculateImpactScore = (issues) => {
  if (!issues || issues.length === 0) return 1;
  
  // Count by severity
  const critical = issues.filter(i => i.severity === 'critical').length;
  const high = issues.filter(i => i.severity === 'high').length;
  const medium = issues.filter(i => i.severity === 'medium').length;
  
  // Calculate impact score
  if (critical > 3 || (critical > 0 && high > 2)) return 5;
  if (critical > 0 || high > 2) return 4;
  if (high > 0 || medium > 3) return 3;
  if (medium > 0) return 2;
  return 1;
};

/**
 * Generate steps for performance recommendations
 * @param {Array} issues Performance issues
 * @returns {Array} Step-by-step guidance
 */
const generatePerformanceSteps = (issues) => {
  const steps = [];
  
  // Check for common performance issues and provide steps
  if (issues.some(i => i.type === 'large-images' || i.title.toLowerCase().includes('image'))) {
    steps.push('Optimize images by compressing and resizing them appropriately');
  }
  
  if (issues.some(i => i.type === 'render-blocking' || i.title.toLowerCase().includes('render'))) {
    steps.push('Eliminate render-blocking resources by deferring non-critical JavaScript and CSS');
  }
  
  if (issues.some(i => i.type === 'server-response' || i.title.toLowerCase().includes('ttfb'))) {
    steps.push('Improve server response time by optimizing server configuration and resources');
  }
  
  // Add general performance steps if no specific ones were added
  if (steps.length === 0) {
    steps.push(
      'Minimize and compress CSS and JavaScript files',
      'Enable browser caching for static assets',
      'Consider using a Content Delivery Network (CDN)'
    );
  }
  
  return steps;
};

/**
 * Generate steps for technical recommendations
 * @param {Array} issues Technical issues
 * @returns {Array} Step-by-step guidance
 */
const generateTechnicalSteps = (issues) => {
  const steps = [];
  
  // Check for common technical issues and provide steps
  if (issues.some(i => i.type === 'missing-meta' || i.title.toLowerCase().includes('meta'))) {
    steps.push('Add or optimize meta title and description tags for all pages');
  }
  
  if (issues.some(i => i.type === 'broken-links' || i.title.toLowerCase().includes('broken'))) {
    steps.push('Fix all broken links and ensure proper internal linking structure');
  }
  
  if (issues.some(i => i.type === 'mobile-friendly' || i.title.toLowerCase().includes('mobile'))) {
    steps.push('Ensure your site is fully responsive and mobile-friendly');
  }
  
  // Add general technical steps if no specific ones were added
  if (steps.length === 0) {
    steps.push(
      'Implement proper HTML structure with semantic elements',
      'Ensure all pages have unique, descriptive titles and meta descriptions',
      'Create and submit an XML sitemap to search engines'
    );
  }
  
  return steps;
};

/**
 * Export a default function that creates a complete report
 * @param {Object} scanResults Raw scan results
 * @param {Object} options Report generation options
 * @returns {Object} Complete report data
 */
export default function createReport(scanResults, options = {}) {
  return generateReportData(scanResults, options);
}
