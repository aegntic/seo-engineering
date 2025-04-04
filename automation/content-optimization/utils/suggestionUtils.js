/**
 * suggestionUtils.js
 * 
 * Utilities for creating standardized suggestion objects across all analyzers.
 * Ensures consistent suggestion format and metadata for frontend presentation
 * and implementation tracking.
 */

/**
 * Builder class for creating standardized suggestion objects
 */
class SuggestionBuilder {
  /**
   * Creates a new suggestion builder
   * 
   * @param {string} category - Suggestion category (keyword, readability, structure, enhancement)
   */
  constructor(category) {
    this.category = category;
    this.idCounter = 1;
  }

  /**
   * Creates a standardized suggestion object
   * 
   * @param {Object} data - Suggestion data
   * @param {string} data.type - Specific suggestion type within category
   * @param {string} data.importance - Importance level (high, medium, low)
   * @param {string} data.title - Suggestion title
   * @param {string} data.description - Detailed description of the issue
   * @param {string} data.implementation - Implementation guidance
   * @param {number} data.confidence - Confidence score (0-1)
   * @returns {Object} Standardized suggestion object
   */
  create(data) {
    const {
      type,
      importance = 'medium',
      title,
      description,
      implementation,
      confidence = 0.8,
      metadata = {}
    } = data;
    
    // Generate timestamp and unique ID
    const timestamp = new Date().toISOString();
    const id = `${this.category}-${type}-${this.idCounter++}`;
    
    // Map importance to numeric value for sorting
    const importanceValue = {
      'high': 3,
      'medium': 2,
      'low': 1
    }[importance] || 2;
    
    return {
      id,
      category: this.category,
      type,
      importance,
      importanceValue,  // Numeric value for sorting
      title,
      description,
      implementation,
      confidence,
      timestamp,
      status: 'pending',
      metadata: {
        ...metadata,
        generationMethod: 'automated'
      }
    };
  }
  
  /**
   * Creates multiple suggestions at once
   * 
   * @param {Array} suggestionsData - Array of suggestion data objects
   * @returns {Array} Array of standardized suggestion objects
   */
  createMany(suggestionsData) {
    return suggestionsData.map(data => this.create(data));
  }
}

/**
 * Formats suggestions for API response
 * 
 * @param {Array} suggestions - Raw suggestion objects
 * @param {Object} options - Formatting options
 * @returns {Array} Formatted suggestions
 */
function formatSuggestionsForResponse(suggestions, options = {}) {
  const {
    includeMeta = false,
    includeExamples = true,
    format = 'default'
  } = options;
  
  return suggestions.map(suggestion => {
    const formatted = {
      id: suggestion.id,
      category: suggestion.category,
      type: suggestion.type,
      importance: suggestion.importance,
      title: suggestion.title,
      description: suggestion.description,
      implementation: suggestion.implementation
    };
    
    // Include metadata if requested
    if (includeMeta) {
      formatted.metadata = suggestion.metadata;
      formatted.confidence = suggestion.confidence;
      formatted.timestamp = suggestion.timestamp;
    }
    
    // Include examples if available and requested
    if (includeExamples && suggestion.metadata && suggestion.metadata.examples) {
      formatted.examples = suggestion.metadata.examples;
    }
    
    // Format for specific systems if needed
    if (format === 'dashboard') {
      formatted.color = getColorForImportance(suggestion.importance);
      formatted.icon = getIconForCategory(suggestion.category);
    }
    
    return formatted;
  });
}

/**
 * Gets color code for importance level
 * 
 * @private
 * @param {string} importance - Importance level
 * @returns {string} Color code
 */
function getColorForImportance(importance) {
  const colors = {
    'high': '#e53e3e',    // Red
    'medium': '#ed8936',  // Orange
    'low': '#48bb78'      // Green
  };
  
  return colors[importance] || '#4299e1'; // Default blue
}

/**
 * Gets icon name for suggestion category
 * 
 * @private
 * @param {string} category - Suggestion category
 * @returns {string} Icon name
 */
function getIconForCategory(category) {
  const icons = {
    'keyword': 'tag',
    'readability': 'book-open',
    'structure': 'layout',
    'enhancement': 'award'
  };
  
  return icons[category] || 'info';
}

/**
 * Filters suggestions based on criteria
 * 
 * @param {Array} suggestions - Suggestions to filter
 * @param {Object} criteria - Filter criteria
 * @returns {Array} Filtered suggestions
 */
function filterSuggestions(suggestions, criteria = {}) {
  const {
    categories,
    importance,
    minConfidence,
    types,
    status
  } = criteria;
  
  return suggestions.filter(suggestion => {
    // Filter by categories if specified
    if (categories && !categories.includes(suggestion.category)) {
      return false;
    }
    
    // Filter by importance if specified
    if (importance && !importance.includes(suggestion.importance)) {
      return false;
    }
    
    // Filter by minimum confidence if specified
    if (minConfidence && suggestion.confidence < minConfidence) {
      return false;
    }
    
    // Filter by specific types if specified
    if (types && !types.includes(suggestion.type)) {
      return false;
    }
    
    // Filter by status if specified
    if (status && suggestion.status !== status) {
      return false;
    }
    
    return true;
  });
}

module.exports = {
  SuggestionBuilder,
  formatSuggestionsForResponse,
  filterSuggestions
};
