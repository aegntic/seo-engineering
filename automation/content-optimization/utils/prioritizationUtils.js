/**
 * prioritizationUtils.js
 * 
 * Utilities for prioritizing and ranking content optimization suggestions.
 * Provides algorithms for sorting suggestions based on impact, difficulty,
 * and relevance to produce an optimized implementation sequence.
 */

/**
 * Prioritizes a list of suggestions based on multiple factors
 * 
 * @param {Array} suggestions - Raw suggestion objects
 * @param {number} maxSuggestions - Maximum suggestions to return
 * @param {number} minConfidenceScore - Minimum confidence threshold
 * @returns {Array} Prioritized suggestions
 */
function prioritizeSuggestions(suggestions, maxSuggestions = 10, minConfidenceScore = 0.7) {
  // Filter suggestions below confidence threshold
  const filteredSuggestions = suggestions.filter(
    suggestion => suggestion.confidence >= minConfidenceScore
  );
  
  // Calculate priority score for each suggestion
  const scoredSuggestions = filteredSuggestions.map(suggestion => {
    const priorityScore = calculatePriorityScore(suggestion);
    return {
      ...suggestion,
      priorityScore
    };
  });
  
  // Sort by priority score (descending)
  const sortedSuggestions = scoredSuggestions.sort(
    (a, b) => b.priorityScore - a.priorityScore
  );
  
  // Return top suggestions up to maxSuggestions
  return sortedSuggestions.slice(0, maxSuggestions);
}

/**
 * Calculates priority score for a suggestion
 * 
 * @private
 * @param {Object} suggestion - Suggestion object
 * @returns {number} Priority score (0-100)
 */
function calculatePriorityScore(suggestion) {
  // Base score from importance
  const importanceScore = {
    'high': 80,
    'medium': 50,
    'low': 30
  }[suggestion.importance] || 50;
  
  // Adjustment based on confidence
  const confidenceAdjustment = (suggestion.confidence - 0.7) * 50;
  
  // Adjustment based on category
  const categoryWeights = {
    'keyword': 1.2,      // Keywords highly important for SEO
    'structure': 1.1,    // Structure important for usability and indexing
    'readability': 0.9,  // Readability important for engagement
    'enhancement': 0.8   // Enhancements are supplementary
  };
  
  const categoryAdjustment = (categoryWeights[suggestion.category] || 1.0) - 1.0;
  
  // Adjustment based on type (specific to categories)
  const typeAdjustments = {
    // Keyword types
    'keyword_density': 0.2,
    'keyword_stuffing': 0.3,
    'keyword_title': 0.3,
    'keyword_headings': 0.2,
    'keyword_first_paragraph': 0.1,
    'semantic_keywords': 0.0,
    
    // Readability types
    'reading_ease_low': 0.2,
    'reading_ease_high': 0.1,
    'long_sentences': 0.2,
    'long_paragraphs': 0.1,
    'passive_voice': 0.0,
    'complex_words': 0.1,
    
    // Structure types
    'missing_h1': 0.3,
    'heading_hierarchy': 0.2,
    'heading_density': 0.1,
    'missing_images': 0.2,
    'missing_alt_text': 0.3,
    'improve_alt_text': 0.1,
    'add_lists': 0.0,
    'add_links': 0.1,
    'improve_link_text': 0.1,
    
    // Enhancement types
    'introduction': 0.2,
    'conclusion': 0.2,
    'persuasive_elements': 0.1,
    'engagement_elements': 0.1,
    'clarity_improvements': 0.0,
    'topical_coverage': 0.2,
    'trust_signals': 0.1
  };
  
  const typeAdjustment = typeAdjustments[suggestion.type] || 0.0;
  
  // Calculate total score with all adjustments
  let score = importanceScore;
  
  // Apply adjustments (percentage-based)
  score += score * categoryAdjustment;  // Category adjustment
  score += score * typeAdjustment;      // Type adjustment
  score += confidenceAdjustment;        // Confidence adjustment
  
  // Ensure score is within 0-100 range
  return Math.min(100, Math.max(0, score));
}

/**
 * Groups suggestions by category
 * 
 * @param {Array} suggestions - Suggestions to group
 * @returns {Object} Suggestions grouped by category
 */
function groupSuggestionsByCategory(suggestions) {
  const grouped = {};
  
  suggestions.forEach(suggestion => {
    const category = suggestion.category;
    
    if (!grouped[category]) {
      grouped[category] = [];
    }
    
    grouped[category].push(suggestion);
  });
  
  return grouped;
}

/**
 * Creates a balanced set of suggestions across categories
 * 
 * @param {Array} suggestions - All available suggestions
 * @param {number} totalCount - Desired total suggestion count
 * @returns {Array} Balanced suggestion set
 */
function createBalancedSuggestionSet(suggestions, totalCount = 10) {
  // Group by category
  const grouped = groupSuggestionsByCategory(suggestions);
  const categories = Object.keys(grouped);
  
  // Define ideal distribution percentages
  const idealDistribution = {
    'keyword': 0.3,      // 30% keyword suggestions
    'readability': 0.3,  // 30% readability suggestions
    'structure': 0.3,    // 30% structure suggestions
    'enhancement': 0.1   // 10% enhancement suggestions
  };
  
  // Calculate ideal counts per category
  const targetCounts = {};
  categories.forEach(category => {
    const percentage = idealDistribution[category] || (1 / categories.length);
    targetCounts[category] = Math.round(totalCount * percentage);
  });
  
  // Select top N suggestions from each category
  const selected = [];
  
  categories.forEach(category => {
    const categoryCount = targetCounts[category];
    
    // Sort category suggestions by priority score
    const sortedCategorySuggestions = [...grouped[category]].sort(
      (a, b) => (b.priorityScore || 0) - (a.priorityScore || 0)
    );
    
    // Select top suggestions up to category count
    const selectedCategorySuggestions = sortedCategorySuggestions.slice(0, categoryCount);
    selected.push(...selectedCategorySuggestions);
  });
  
  // Sort final set by priority score
  return selected.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
}

/**
 * Creates an implementation plan with ordered suggestions
 * 
 * @param {Array} suggestions - Prioritized suggestions
 * @returns {Object} Implementation plan with stages
 */
function createImplementationPlan(suggestions) {
  // Create a deep copy to avoid modifying the original
  const workingSuggestions = [...suggestions];
  
  // Divide suggestions into implementation stages
  const plan = {
    critical: [],  // High priority, high impact
    standard: [],  // Medium priority
    optional: []   // Low priority enhancements
  };
  
  workingSuggestions.forEach(suggestion => {
    // Sort into stages based on importance and score
    if (suggestion.importance === 'high' && (suggestion.priorityScore || 0) >= 70) {
      plan.critical.push(suggestion);
    } else if (suggestion.importance === 'low' || (suggestion.priorityScore || 0) < 40) {
      plan.optional.push(suggestion);
    } else {
      plan.standard.push(suggestion);
    }
  });
  
  // Calculate estimated implementation time for each stage
  const implementationTimes = {
    critical: estimateImplementationTime(plan.critical),
    standard: estimateImplementationTime(plan.standard),
    optional: estimateImplementationTime(plan.optional)
  };
  
  return {
    stages: plan,
    implementationTimes,
    totalSuggestions: workingSuggestions.length,
    totalImplementationTime: Object.values(implementationTimes).reduce((a, b) => a + b, 0)
  };
}

/**
 * Estimates implementation time for a set of suggestions
 * 
 * @private
 * @param {Array} suggestions - Suggestions to implement
 * @returns {number} Estimated minutes to implement
 */
function estimateImplementationTime(suggestions) {
  // Baseline time estimates by category (minutes)
  const baselineTime = {
    'keyword': 10,
    'readability': 15,
    'structure': 20,
    'enhancement': 30
  };
  
  // Calculate total estimated time
  return suggestions.reduce((total, suggestion) => {
    const baseTime = baselineTime[suggestion.category] || 15;
    
    // Adjust based on importance (higher importance might take more time)
    const importanceMultiplier = {
      'high': 1.2,
      'medium': 1.0,
      'low': 0.8
    }[suggestion.importance] || 1.0;
    
    return total + (baseTime * importanceMultiplier);
  }, 0);
}

module.exports = {
  prioritizeSuggestions,
  groupSuggestionsByCategory,
  createBalancedSuggestionSet,
  createImplementationPlan
};
