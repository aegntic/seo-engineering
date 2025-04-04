/**
 * ContentEnhancer.js
 * 
 * Generates content enhancement suggestions based on analysis results from
 * keyword, readability, and structure analyzers. Provides actionable
 * recommendations for improving content quality and engagement.
 */

const { SuggestionBuilder } = require('../utils/suggestionUtils');
const { generateEnhancementIdeas } = require('../utils/enhancementUtils');

class ContentEnhancer {
  constructor(options = {}) {
    this.options = {
      // Enhancement types to consider
      enhancementTypes: [
        'introduction',
        'conclusion',
        'persuasive_elements',
        'engagement_elements',
        'clarity_improvements',
        'topical_coverage',
        'trust_signals'
      ],
      
      // Weights for different enhancement categories
      typeWeights: {
        introduction: 0.8,
        conclusion: 0.8,
        persuasive_elements: 0.7,
        engagement_elements: 0.9,
        clarity_improvements: 0.8,
        topical_coverage: 0.9,
        trust_signals: 0.6
      },
      
      // Minimum confidence threshold for suggestions
      minConfidence: 0.7,
      
      // Maximum number of enhancement suggestions to return
      maxSuggestions: 5,
      
      // Override with provided options
      ...options
    };
    
    this.suggestionBuilder = new SuggestionBuilder('enhancement');
  }

  /**
   * Generates content enhancement suggestions based on analysis results
   * 
   * @param {Object} data - Analysis data and content
   * @param {string} data.content - Normalized content
   * @param {Object} data.keywordResults - Keyword analysis results
   * @param {Object} data.readabilityResults - Readability analysis results
   * @param {Object} data.structureResults - Structure analysis results
   * @param {Object} data.context - Context information
   * @returns {Array} Array of enhancement suggestions
   */
  async generateSuggestions(data) {
    const {
      content,
      keywordResults,
      readabilityResults,
      structureResults,
      context = {}
    } = data;
    
    // Generate enhancement ideas based on content and analysis
    const enhancementIdeas = generateEnhancementIdeas(
      content,
      {
        keywordMetrics: keywordResults.metrics,
        readabilityMetrics: readabilityResults.metrics,
        structureMetrics: structureResults.metrics
      },
      context
    );
    
    // Filter and prioritize enhancement suggestions
    const prioritizedSuggestions = this._prioritizeSuggestions(
      enhancementIdeas,
      {
        keywordScore: keywordResults.score,
        readabilityScore: readabilityResults.score,
        structureScore: structureResults.score
      },
      context
    );
    
    // Convert enhancement ideas to formal suggestions
    return this._buildSuggestions(prioritizedSuggestions);
  }
  
  /**
   * Prioritizes enhancement ideas based on analysis scores
   * 
   * @private
   * @param {Array} ideas - Raw enhancement ideas
   * @param {Object} scores - Analysis scores
   * @param {Object} context - Analysis context
   * @returns {Array} Prioritized enhancement ideas
   */
  _prioritizeSuggestions(ideas, scores, context) {
    // Filter out low-confidence ideas
    const filteredIdeas = ideas.filter(idea => 
      idea.confidence >= this.options.minConfidence
    );
    
    // Calculate priority score for each idea
    const scoredIdeas = filteredIdeas.map(idea => {
      let priorityScore = idea.confidence;
      
      // Apply weights based on enhancement type
      priorityScore *= this.options.typeWeights[idea.type] || 1.0;
      
      // Adjust priority based on analysis scores
      // Lower scores in related areas increase suggestion priority
      if (idea.type === 'topical_coverage' || idea.type === 'clarity_improvements') {
        priorityScore *= (1 + ((100 - scores.keywordScore) / 100));
      } else if (idea.type === 'clarity_improvements') {
        priorityScore *= (1 + ((100 - scores.readabilityScore) / 100));
      } else if (idea.type === 'engagement_elements') {
        priorityScore *= (1 + ((100 - scores.structureScore) / 100));
      }
      
      // Apply content type specific adjustments
      if (context.contentType === 'product' && idea.type === 'persuasive_elements') {
        priorityScore *= 1.3; // Higher priority for persuasive elements in product content
      } else if (context.contentType === 'article' && idea.type === 'topical_coverage') {
        priorityScore *= 1.2; // Higher priority for complete topic coverage in articles
      }
      
      return {
        ...idea,
        priorityScore
      };
    });
    
    // Sort by priority score (descending)
    const prioritizedIdeas = scoredIdeas.sort(
      (a, b) => b.priorityScore - a.priorityScore
    );
    
    // Limit number of suggestions
    return prioritizedIdeas.slice(0, this.options.maxSuggestions);
  }
  
  /**
   * Converts enhancement ideas to formal suggestion objects
   * 
   * @private
   * @param {Array} prioritizedIdeas - Prioritized enhancement ideas
   * @returns {Array} Formal suggestion objects
   */
  _buildSuggestions(prioritizedIdeas) {
    return prioritizedIdeas.map(idea => {
      return this.suggestionBuilder.create({
        type: idea.type,
        importance: this._mapConfidenceToImportance(idea.priorityScore),
        title: idea.title,
        description: idea.description,
        implementation: idea.implementation,
        confidence: idea.confidence
      });
    });
  }
  
  /**
   * Maps priority score to importance level
   * 
   * @private
   * @param {number} score - Priority score
   * @returns {string} Importance level (high, medium, low)
   */
  _mapConfidenceToImportance(score) {
    if (score >= 0.9) {
      return 'high';
    } else if (score >= 0.7) {
      return 'medium';
    } else {
      return 'low';
    }
  }
}

module.exports = ContentEnhancer;
