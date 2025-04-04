/**
 * KeywordAnalyzer.js
 * 
 * Analyzes content for keyword usage, density, placement, and relevance.
 * Generates keyword optimization recommendations based on best practices
 * and competitive benchmarks.
 */

const { extractKeywords, calculateKeywordDensity } = require('../utils/keywordUtils');
const { SuggestionBuilder } = require('../utils/suggestionUtils');

class KeywordAnalyzer {
  constructor(options = {}) {
    this.options = {
      // Default optimal ranges for keyword density
      minKeywordDensity: 0.5,
      maxKeywordDensity: 2.5,
      
      // Default importance factors for various keyword placements
      placementImportance: {
        title: 1.0,
        headings: 0.8,
        firstParagraph: 0.7,
        url: 0.6,
        imageTags: 0.5
      },
      
      // Weight for LSI keywords vs. exact matches
      lsiKeywordWeight: 0.7,
      
      // Minimum content length for reliable analysis
      minContentLength: 300,
      
      // Override with provided options
      ...options
    };
    
    this.suggestionBuilder = new SuggestionBuilder('keyword');
  }

  /**
   * Analyzes content for keyword optimization opportunities
   * 
   * @param {string} content - Normalized text content to analyze
   * @param {Object} context - Additional context for analysis
   * @param {Array} context.keywords - Target keywords for the page
   * @param {Object} context.competition - Competitive keyword data
   * @returns {Object} Analysis results with keyword-related suggestions
   */
  async analyze(content, context = {}) {
    // If content is too short, provide limited analysis
    if (content.length < this.options.minContentLength) {
      return this._generateLimitedAnalysis(content, context);
    }
    
    // Extract target keywords from context or analyze to find potential ones
    const targetKeywords = context.keywords || 
                          await this._detectPotentialKeywords(content);
    
    // Calculate keyword metrics
    const keywordMetrics = this._calculateKeywordMetrics(content, targetKeywords);
    
    // Analyze keyword placement effectiveness
    const placementAnalysis = this._analyzeKeywordPlacement(content, targetKeywords);
    
    // Generate optimization suggestions
    const suggestions = this._generateSuggestions(
      keywordMetrics, 
      placementAnalysis, 
      targetKeywords, 
      context
    );
    
    // Calculate overall keyword score
    const score = this._calculateScore(keywordMetrics, placementAnalysis);
    
    return {
      score,
      metrics: {
        keywordDensity: keywordMetrics.densities,
        keywordCount: keywordMetrics.counts,
        keywordPlacement: placementAnalysis
      },
      suggestions
    };
  }
  
  /**
   * Generates a limited analysis for short content
   * 
   * @private
   * @param {string} content - Content to analyze
   * @param {Object} context - Analysis context
   * @returns {Object} Limited analysis results
   */
  _generateLimitedAnalysis(content, context) {
    const suggestions = [
      this.suggestionBuilder.create({
        type: 'content_length',
        importance: 'high',
        title: 'Increase content length for better keyword optimization',
        description: `Your content is only ${content.length} characters long, which limits effective keyword optimization. Aim for at least ${this.options.minContentLength} characters.`,
        implementation: 'Expand your content with valuable information related to your target keywords.',
        confidence: 0.95
      })
    ];
    
    return {
      score: 30, // Low score for insufficient content
      metrics: {
        keywordDensity: {},
        keywordCount: {},
        keywordPlacement: {}
      },
      suggestions
    };
  }
  
  /**
   * Detects potential keywords if none are provided
   * 
   * @private
   * @param {string} content - Content to analyze
   * @returns {Array} Detected potential keywords
   */
  async _detectPotentialKeywords(content) {
    return extractKeywords(content, { limit: 5 });
  }
  
  /**
   * Calculates keyword metrics from content
   * 
   * @private
   * @param {string} content - Content to analyze
   * @param {Array} keywords - Target keywords
   * @returns {Object} Keyword metrics
   */
  _calculateKeywordMetrics(content, keywords) {
    const counts = {};
    const densities = {};
    
    // Calculate for each keyword
    for (const keyword of keywords) {
      const keywordRegex = new RegExp(keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
      const matches = content.match(keywordRegex) || [];
      counts[keyword] = matches.length;
      
      // Calculate density (% of content)
      const words = content.split(/\s+/).length;
      const keywordWords = keyword.split(/\s+/).length;
      densities[keyword] = (counts[keyword] * keywordWords * 100) / words;
    }
    
    return {
      counts,
      densities
    };
  }
  
  /**
   * Analyzes keyword placement effectiveness
   * 
   * @private
   * @param {string} content - Content to analyze
   * @param {Array} keywords - Target keywords
   * @returns {Object} Placement analysis results
   */
  _analyzeKeywordPlacement(content, keywords) {
    // In a real implementation, this would analyze presence in
    // title, headings, first paragraph, etc. with parsed HTML
    
    // For demo purposes, we'll return simulated results
    const result = {};
    
    for (const keyword of keywords) {
      result[keyword] = {
        title: Math.random() > 0.5,
        headings: Math.random() > 0.3,
        firstParagraph: Math.random() > 0.3,
        url: Math.random() > 0.7,
        imageTags: Math.random() > 0.6
      };
    }
    
    return result;
  }
  
  /**
   * Generates optimization suggestions based on analysis
   * 
   * @private
   * @param {Object} metrics - Keyword metrics
   * @param {Object} placement - Placement analysis
   * @param {Array} keywords - Target keywords
   * @param {Object} context - Analysis context
   * @returns {Array} Optimization suggestions
   */
  _generateSuggestions(metrics, placement, keywords, context) {
    const suggestions = [];
    
    // Check for density issues
    for (const keyword of keywords) {
      const density = metrics.densities[keyword] || 0;
      
      // Keyword density too low
      if (density < this.options.minKeywordDensity) {
        suggestions.push(
          this.suggestionBuilder.create({
            type: 'keyword_density',
            importance: 'medium',
            title: `Increase "${keyword}" keyword density`,
            description: `The keyword "${keyword}" has a density of ${density.toFixed(1)}%, which is below the recommended minimum of ${this.options.minKeywordDensity}%.`,
            implementation: `Naturally incorporate "${keyword}" a few more times in your content, especially in important sections.`,
            confidence: 0.8
          })
        );
      }
      
      // Keyword density too high (keyword stuffing)
      else if (density > this.options.maxKeywordDensity) {
        suggestions.push(
          this.suggestionBuilder.create({
            type: 'keyword_stuffing',
            importance: 'high',
            title: `Reduce "${keyword}" keyword density to avoid keyword stuffing`,
            description: `The keyword "${keyword}" has a density of ${density.toFixed(1)}%, which may be considered keyword stuffing (recommended maximum is ${this.options.maxKeywordDensity}%).`,
            implementation: `Reduce repetition of "${keyword}" and use synonyms or related terms instead.`,
            confidence: 0.9
          })
        );
      }
      
      // Check for placement issues
      const placementData = placement[keyword] || {};
      
      if (!placementData.title) {
        suggestions.push(
          this.suggestionBuilder.create({
            type: 'keyword_title',
            importance: 'high',
            title: `Include "${keyword}" in the page title`,
            description: `Your primary keyword "${keyword}" is missing from the page title, which is crucial for SEO.`,
            implementation: `Add "${keyword}" to the beginning of your page title while keeping it natural and compelling.`,
            confidence: 0.95
          })
        );
      }
      
      if (!placementData.headings) {
        suggestions.push(
          this.suggestionBuilder.create({
            type: 'keyword_headings',
            importance: 'medium',
            title: `Include "${keyword}" in at least one heading`,
            description: `Your keyword "${keyword}" is not used in any headings (H1-H6).`,
            implementation: `Update at least one heading to naturally include "${keyword}" or a close variant.`,
            confidence: 0.85
          })
        );
      }
      
      if (!placementData.firstParagraph) {
        suggestions.push(
          this.suggestionBuilder.create({
            type: 'keyword_first_paragraph',
            importance: 'medium',
            title: `Include "${keyword}" in the first paragraph`,
            description: `Your keyword "${keyword}" doesn't appear in the first paragraph, which is important for both SEO and user engagement.`,
            implementation: `Naturally incorporate "${keyword}" in the introductory paragraph of your content.`,
            confidence: 0.8
          })
        );
      }
    }
    
    // Check if LSI keywords or semantically related terms should be suggested
    if (keywords.length < 3 && context.competition) {
      suggestions.push(
        this.suggestionBuilder.create({
          type: 'semantic_keywords',
          importance: 'medium',
          title: 'Add semantically related keywords',
          description: 'Incorporating semantically related keywords can improve topical relevance.',
          implementation: 'Consider adding these related terms: ' + 
            this._getRelatedKeywordSuggestions(keywords, context.competition).join(', '),
          confidence: 0.75
        })
      );
    }
    
    return suggestions;
  }
  
  /**
   * Calculates overall keyword optimization score
   * 
   * @private
   * @param {Object} metrics - Keyword metrics
   * @param {Object} placement - Placement analysis
   * @returns {number} Score from 0-100
   */
  _calculateScore(metrics, placement) {
    let score = 50; // Base score
    
    // Factor in keyword density
    const densities = Object.values(metrics.densities);
    if (densities.length > 0) {
      const avgDensity = densities.reduce((sum, d) => sum + d, 0) / densities.length;
      
      // Optimal density range gives maximum points
      if (avgDensity >= this.options.minKeywordDensity && 
          avgDensity <= this.options.maxKeywordDensity) {
        score += 20;
      } 
      // Too low or too high reduces score
      else if (avgDensity < this.options.minKeywordDensity) {
        const factor = avgDensity / this.options.minKeywordDensity;
        score += 20 * factor;
      }
      else {
        const excessFactor = (this.options.maxKeywordDensity * 2 - avgDensity) / this.options.maxKeywordDensity;
        score += 20 * Math.max(0, excessFactor);
      }
    }
    
    // Factor in placement effectiveness
    let placementScore = 0;
    let placementCount = 0;
    
    for (const keyword in placement) {
      const keywordPlacement = placement[keyword];
      for (const place in keywordPlacement) {
        if (keywordPlacement[place]) {
          placementScore += this.options.placementImportance[place] || 0.5;
        }
        placementCount++;
      }
    }
    
    // Normalize placement score (max 30 points)
    if (placementCount > 0) {
      const maxPossiblePlacementScore = placementCount; // If all placements had importance 1.0
      const normalizedPlacementScore = (placementScore / maxPossiblePlacementScore) * 30;
      score += normalizedPlacementScore;
    }
    
    return Math.min(100, Math.max(0, Math.round(score)));
  }
  
  /**
   * Gets suggested related keywords based on competition
   * 
   * @private
   * @param {Array} keywords - Current keywords
   * @param {Object} competition - Competitive data
   * @returns {Array} Related keyword suggestions
   */
  _getRelatedKeywordSuggestions(keywords, competition) {
    // In a real implementation, this would analyze competitive content
    // and extract semantically related terms
    
    // Mock implementation for demonstration
    const mockRelatedTerms = {
      'seo': ['search engine optimization', 'google ranking', 'serp', 'organic traffic'],
      'content': ['articles', 'blog posts', 'copywriting', 'content strategy'],
      'marketing': ['digital marketing', 'promotion', 'audience targeting', 'campaign'],
      'automation': ['workflow', 'efficiency', 'tools', 'productivity'],
      'performance': ['speed', 'optimization', 'efficiency', 'metrics', 'analytics']
    };
    
    const suggestions = new Set();
    
    for (const keyword of keywords) {
      const baseTerm = keyword.split(' ')[0].toLowerCase();
      if (mockRelatedTerms[baseTerm]) {
        for (const related of mockRelatedTerms[baseTerm]) {
          if (!keywords.some(k => related.includes(k))) {
            suggestions.add(related);
          }
        }
      }
    }
    
    return Array.from(suggestions).slice(0, 5);
  }
}

module.exports = KeywordAnalyzer;
