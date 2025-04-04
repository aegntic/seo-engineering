/**
 * Mobile Optimization Scoring Utilities
 * 
 * Provides functions for calculating and normalizing scores for mobile optimization checks.
 */

/**
 * Calculate the overall mobile optimization score based on individual component scores
 * @param {Object} scores - Object containing scores for different mobile optimization checks
 * @returns {number} - The overall mobile optimization score (0-100)
 */
function calculateMobileScore(scores) {
  // Define weights for each component
  const weights = {
    viewportConfig: 0.2,      // 20% - Fundamental for mobile rendering
    touchElements: 0.2,       // 20% - Critical for mobile interaction
    responsiveDesign: 0.3,    // 30% - Most important for mobile optimization
    mobilePerformance: 0.3    // 30% - Critical for user experience and rankings
  };
  
  // Ensure scores exist or use defaults
  const normalizedScores = {
    viewportConfig: scores.viewportConfig !== undefined ? scores.viewportConfig : 0,
    touchElements: scores.touchElements !== undefined ? scores.touchElements : 0,
    responsiveDesign: scores.responsiveDesign !== undefined ? scores.responsiveDesign : 0,
    mobilePerformance: scores.mobilePerformance !== undefined ? scores.mobilePerformance : 0
  };
  
  // Calculate weighted average
  let weightedSum = 0;
  let weightsSum = 0;
  
  for (const [key, score] of Object.entries(normalizedScores)) {
    if (score !== null && score !== undefined) {
      weightedSum += score * weights[key];
      weightsSum += weights[key];
    }
  }
  
  // If no valid scores, return 0
  if (weightsSum === 0) {
    return 0;
  }
  
  // Calculate and round the final score
  const finalScore = Math.round(weightedSum / weightsSum);
  
  // Ensure score is in the range 0-100
  return Math.max(0, Math.min(100, finalScore));
}

/**
 * Normalize scores to ensure they are all on a 0-100 scale
 * @param {Object} scores - Object containing various scores
 * @returns {Object} - Object with normalized scores
 */
function normalizeScores(scores) {
  const normalized = {};
  
  for (const [key, score] of Object.entries(scores)) {
    if (typeof score === 'number') {
      normalized[key] = Math.max(0, Math.min(100, Math.round(score)));
    } else {
      normalized[key] = score;
    }
  }
  
  return normalized;
}

/**
 * Get a qualitative rating based on a score
 * @param {number} score - The numerical score (0-100)
 * @returns {string} - The qualitative rating
 */
function getScoreRating(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Critical';
}

/**
 * Get color coding for a score (useful for reporting)
 * @param {number} score - The numerical score (0-100)
 * @returns {string} - Hex color code for the score
 */
function getScoreColor(score) {
  if (score >= 90) return '#4CAF50'; // Green
  if (score >= 80) return '#8BC34A'; // Light Green
  if (score >= 60) return '#FFEB3B'; // Yellow
  if (score >= 40) return '#FF9800'; // Orange
  return '#F44336'; // Red
}

module.exports = {
  calculateMobileScore,
  normalizeScores,
  getScoreRating,
  getScoreColor
};
