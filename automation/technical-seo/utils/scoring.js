/**
 * Scoring Utilities
 * 
 * Functions to calculate and normalize scores for technical SEO checks.
 */

/**
 * Calculate an overall technical SEO score based on individual category scores
 * @param {Object} scores - Object containing scores for each category
 * @returns {number} - Overall score between 0-100
 */
function calculateOverallScore(scores) {
  // Define weights for each category
  const weights = {
    pageSpeed: 0.2,
    mobileResponsiveness: 0.15,
    metaTags: 0.15,
    ssl: 0.1,
    crawlability: 0.1,
    schemaMarkup: 0.05,
    contentQuality: 0.1,
    urlStructure: 0.05,
    siteArchitecture: 0.05,
    internationalSeo: 0.05
  };
  
  // Initialize components for weighted average calculation
  let totalScore = 0;
  let totalWeight = 0;
  
  // Process each category if it exists
  for (const [category, weight] of Object.entries(weights)) {
    if (scores[category] !== undefined) {
      totalScore += scores[category] * weight;
      totalWeight += weight;
    }
  }
  
  // If no scores were found, return 0
  if (totalWeight === 0) {
    return 0;
  }
  
  // Calculate weighted average and round to nearest integer
  return Math.round(totalScore / totalWeight);
}

/**
 * Normalize a raw score to a 0-100 scale
 * @param {number} rawScore - The raw score to normalize
 * @param {number} min - Minimum expected value
 * @param {number} max - Maximum expected value
 * @returns {number} - Normalized score between 0-100
 */
function normalizeScore(rawScore, min, max) {
  // Ensure the score is within the min-max range
  const clampedScore = Math.max(min, Math.min(max, rawScore));
  
  // Normalize to 0-100 scale
  return Math.round(((clampedScore - min) / (max - min)) * 100);
}

/**
 * Calculate a score based on the number and severity of issues
 * @param {Array} issues - Array of issues with severity property
 * @returns {number} - Score between 0-100
 */
function calculateScoreFromIssues(issues) {
  // Base score starts at 100
  let score = 100;
  
  // Define severity weights
  const severityWeights = {
    critical: 20,
    high: 10,
    medium: 5,
    low: 2
  };
  
  // Deduct points based on issue severity
  for (const issue of issues) {
    const weight = severityWeights[issue.severity] || 0;
    score -= weight;
  }
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate a letter grade from a numerical score
 * @param {number} score - Numerical score between 0-100
 * @returns {string} - Letter grade (A+, A, A-, B+, etc.)
 */
function calculateGrade(score) {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 63) return 'D';
  if (score >= 60) return 'D-';
  return 'F';
}

/**
 * Get a descriptive rating based on a numerical score
 * @param {number} score - Numerical score between 0-100
 * @returns {string} - Rating description
 */
function getScoreRating(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 70) return 'Satisfactory';
  if (score >= 60) return 'Needs Improvement';
  if (score >= 40) return 'Poor';
  return 'Critical';
}

module.exports = {
  calculateOverallScore,
  normalizeScore,
  calculateScoreFromIssues,
  calculateGrade,
  getScoreRating
};
