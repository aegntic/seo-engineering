/**
 * Scoring Algorithms Utility
 * 
 * Advanced algorithms for calculating SEO scores with sophisticated weighting.
 */

/**
 * Calculate weighted score based on weighted factors
 * @param {Object} weightedFactors - Factors with their weights and scores
 * @param {Object} categoryWeights - Category weights for overall scoring
 * @returns {number} - Weighted overall score (0-100)
 */
function calculateWeightedScore(weightedFactors, categoryWeights = null) {
  if (!weightedFactors || Object.keys(weightedFactors).length === 0) {
    return 0;
  }
  
  // If category weights are provided, use category-based weighting
  if (categoryWeights) {
    return calculateCategoryBasedScore(weightedFactors, categoryWeights);
  }
  
  // Otherwise use factor-based weighting
  return calculateFactorBasedScore(weightedFactors);
}

/**
 * Calculate score based on individual factor weights
 * @param {Object} weightedFactors - Factors with their weights and scores
 * @returns {number} - Weighted score (0-100)
 */
function calculateFactorBasedScore(weightedFactors) {
  let weightedSum = 0;
  let totalWeight = 0;
  
  // Calculate weighted sum of all factors
  for (const [factor, data] of Object.entries(weightedFactors)) {
    if (data.score !== null && data.score !== undefined) {
      weightedSum += data.weightedScore;
      totalWeight += data.weight;
    }
  }
  
  // Calculate final weighted score
  const weightedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
  
  // Round to nearest integer and ensure within 0-100 range
  return Math.min(100, Math.max(0, Math.round(weightedScore)));
}

/**
 * Calculate score based on category weights
 * @param {Object} weightedFactors - Factors with their weights and scores
 * @param {Object} categoryWeights - Category weights for overall scoring
 * @returns {number} - Category-weighted score (0-100)
 */
function calculateCategoryBasedScore(weightedFactors, categoryWeights) {
  // Define which factors belong to which categories
  const categoryFactors = {
    technical: ['pageSpeed', 'mobileResponsiveness', 'crawlability', 'ssl', 'brokenLinks', 'javascriptErrors'],
    content: ['contentQuality', 'wordCount', 'readabilityScore', 'keywordDensity'],
    onPage: ['metaTags', 'headingStructure', 'urlStructure', 'internalLinking'],
    performance: ['ttfb', 'lcp', 'cls', 'fid']
  };
  
  // Calculate score for each category
  const categoryScores = {};
  
  for (const [category, factors] of Object.entries(categoryFactors)) {
    // Get all weighted factors in this category
    const categoryWeightedFactors = {};
    
    for (const factor of factors) {
      if (weightedFactors[factor]) {
        categoryWeightedFactors[factor] = weightedFactors[factor];
      }
    }
    
    // Calculate category score
    if (Object.keys(categoryWeightedFactors).length > 0) {
      categoryScores[category] = calculateFactorBasedScore(categoryWeightedFactors);
    } else {
      categoryScores[category] = null;
    }
  }
  
  // Apply category weights to get final score
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const [category, score] of Object.entries(categoryScores)) {
    if (score !== null && categoryWeights[category]) {
      weightedSum += score * categoryWeights[category];
      totalWeight += categoryWeights[category];
    }
  }
  
  // Calculate final weighted score
  const weightedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
  
  // Round to nearest integer and ensure within 0-100 range
  return Math.min(100, Math.max(0, Math.round(weightedScore)));
}

/**
 * Calculate dynamic sigmoid-weighted score
 * This gives more weight to scores in the middle range
 * and less weight to very high or very low scores
 * @param {Object} weightedFactors - Factors with their weights and scores
 * @returns {number} - Sigmoid-weighted score (0-100)
 */
function calculateSigmoidWeightedScore(weightedFactors) {
  let weightedSum = 0;
  let totalWeight = 0;
  
  // Calculate sigmoid-weighted sum of all factors
  for (const [factor, data] of Object.entries(weightedFactors)) {
    if (data.score !== null && data.score !== undefined) {
      // Apply sigmoid function to give more weight to middle scores
      // and less weight to extremes
      const sigmoidWeight = sigmoidFunction(data.score);
      weightedSum += data.score * data.weight * sigmoidWeight;
      totalWeight += data.weight * sigmoidWeight;
    }
  }
  
  // Calculate final weighted score
  const weightedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
  
  // Round to nearest integer and ensure within 0-100 range
  return Math.min(100, Math.max(0, Math.round(weightedScore)));
}

/**
 * Sigmoid function for non-linear weighting
 * @param {number} x - Input value (0-100)
 * @returns {number} - Sigmoid weight (0-1)
 */
function sigmoidFunction(x) {
  // Normalize x to be centered around 50
  const normalized = (x - 50) / 15;
  // Apply sigmoid function: 1 / (1 + e^-x)
  return 1 / (1 + Math.exp(-normalized));
}

/**
 * Calculate geometric mean score
 * This penalizes low outliers more than arithmetic mean
 * @param {Object} weightedFactors - Factors with their weights and scores
 * @returns {number} - Geometric mean score (0-100)
 */
function calculateGeometricMeanScore(weightedFactors) {
  let product = 1;
  let count = 0;
  
  // Calculate product of all factor scores
  for (const [factor, data] of Object.entries(weightedFactors)) {
    if (data.score !== null && data.score !== undefined) {
      // Ensure no zeros (which would make product zero)
      const adjustedScore = Math.max(1, data.score);
      product *= Math.pow(adjustedScore, data.weight);
      count += data.weight;
    }
  }
  
  // Calculate geometric mean
  const geometricMean = count > 0 ? Math.pow(product, 1 / count) : 0;
  
  // Round to nearest integer and ensure within 0-100 range
  return Math.min(100, Math.max(0, Math.round(geometricMean)));
}

/**
 * Calculate harmonic mean score
 * This heavily penalizes low outliers
 * @param {Object} weightedFactors - Factors with their weights and scores
 * @returns {number} - Harmonic mean score (0-100)
 */
function calculateHarmonicMeanScore(weightedFactors) {
  let weightedSum = 0;
  let totalWeight = 0;
  
  // Calculate weighted sum of reciprocals
  for (const [factor, data] of Object.entries(weightedFactors)) {
    if (data.score !== null && data.score !== undefined && data.score > 0) {
      weightedSum += data.weight * (1 / data.score);
      totalWeight += data.weight;
    }
  }
  
  // Calculate harmonic mean
  const harmonicMean = totalWeight > 0 ? totalWeight / weightedSum : 0;
  
  // Round to nearest integer and ensure within 0-100 range
  return Math.min(100, Math.max(0, Math.round(harmonicMean)));
}

/**
 * Calculate competitive score relative to benchmarks
 * This scales scores based on their distance from benchmarks
 * @param {Object} metrics - Normalized metrics
 * @param {Object} benchmarks - Industry benchmark data
 * @returns {number} - Competitive score (0-100)
 */
function calculateCompetitiveScore(metrics, benchmarks) {
  let totalScore = 0;
  let totalPossible = 0;
  
  // For each metric with benchmark data
  for (const [metric, value] of Object.entries(metrics)) {
    if (benchmarks.metrics && benchmarks.metrics[metric]) {
      const benchmark = benchmarks.metrics[metric];
      const importance = getImportanceValue(benchmark.importance);
      
      // Calculate how this metric compares to benchmark
      let metricScore;
      if (benchmark.lowerIsBetter) {
        // For metrics where lower is better (like load times)
        metricScore = benchmark.value > 0 ? Math.min(100, (benchmark.value / value) * 100) : 100;
      } else {
        // For metrics where higher is better (like scores)
        metricScore = benchmark.value > 0 ? Math.min(100, (value / benchmark.value) * 100) : 0;
      }
      
      // Apply importance weighting
      totalScore += metricScore * importance;
      totalPossible += 100 * importance;
    }
  }
  
  // Calculate final score
  const competitiveScore = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
  
  // Round to nearest integer and ensure within 0-100 range
  return Math.min(100, Math.max(0, Math.round(competitiveScore)));
}

/**
 * Get numeric value for importance level
 * @param {string} importance - Importance level
 * @returns {number} - Numeric importance value
 */
function getImportanceValue(importance) {
  switch (importance) {
    case 'critical': return 3;
    case 'high': return 2;
    case 'medium': return 1;
    case 'low': return 0.5;
    default: return 1;
  }
}

module.exports = {
  calculateWeightedScore,
  calculateFactorBasedScore,
  calculateCategoryBasedScore,
  calculateSigmoidWeightedScore,
  calculateGeometricMeanScore,
  calculateHarmonicMeanScore,
  calculateCompetitiveScore
};
