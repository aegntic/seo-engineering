/**
 * ContentOptimizationEngine.js
 * 
 * Core engine for analyzing content and generating optimization suggestions.
 * This module orchestrates the various analysis components and aggregates
 * their recommendations into a unified suggestion set.
 */

const KeywordAnalyzer = require('./analyzers/KeywordAnalyzer');
const ReadabilityAnalyzer = require('./analyzers/ReadabilityAnalyzer');
const StructureAnalyzer = require('./analyzers/StructureAnalyzer');
const ContentEnhancer = require('./enhancers/ContentEnhancer');
const { extractContent, normalizeText } = require('./utils/contentUtils');
const { prioritizeSuggestions } = require('./utils/prioritizationUtils');

class ContentOptimizationEngine {
  constructor(options = {}) {
    this.options = {
      maxSuggestions: 10,
      minConfidenceScore: 0.7,
      ...options
    };
    
    // Initialize analyzers
    this.keywordAnalyzer = new KeywordAnalyzer(options.keywordOptions);
    this.readabilityAnalyzer = new ReadabilityAnalyzer(options.readabilityOptions);
    this.structureAnalyzer = new StructureAnalyzer(options.structureOptions);
    this.contentEnhancer = new ContentEnhancer(options.enhancerOptions);
  }

  /**
   * Analyzes content and generates optimization suggestions
   * 
   * @param {Object} contentData - Content data to analyze
   * @param {string} contentData.html - HTML content of the page
   * @param {string} contentData.url - URL of the page
   * @param {Object} contentData.metadata - Additional metadata
   * @param {Object} context - Context information for the analysis
   * @param {Array} context.keywords - Target keywords for the page
   * @param {Object} context.competition - Competitive analysis data
   * @param {Object} context.siteData - Site-wide data for context
   * @returns {Object} Analysis results with suggestions
   */
  async analyzeContent(contentData, context = {}) {
    try {
      // Extract and normalize content
      const content = extractContent(contentData.html);
      const normalizedContent = normalizeText(content);
      
      // Run parallel analysis with all analyzers
      const [
        keywordResults,
        readabilityResults,
        structureResults
      ] = await Promise.all([
        this.keywordAnalyzer.analyze(normalizedContent, context),
        this.readabilityAnalyzer.analyze(normalizedContent, context),
        this.structureAnalyzer.analyze(contentData, context)
      ]);
      
      // Generate enhancement suggestions based on analysis results
      const enhancementSuggestions = await this.contentEnhancer.generateSuggestions({
        content: normalizedContent,
        keywordResults,
        readabilityResults,
        structureResults,
        context
      });
      
      // Combine and prioritize all suggestions
      const allSuggestions = [
        ...keywordResults.suggestions,
        ...readabilityResults.suggestions,
        ...structureResults.suggestions,
        ...enhancementSuggestions
      ];
      
      const prioritizedSuggestions = prioritizeSuggestions(
        allSuggestions,
        this.options.maxSuggestions,
        this.options.minConfidenceScore
      );
      
      return {
        url: contentData.url,
        timestamp: new Date().toISOString(),
        scores: {
          keyword: keywordResults.score,
          readability: readabilityResults.score,
          structure: structureResults.score,
          overall: this._calculateOverallScore(keywordResults, readabilityResults, structureResults)
        },
        metrics: {
          ...keywordResults.metrics,
          ...readabilityResults.metrics,
          ...structureResults.metrics
        },
        suggestions: prioritizedSuggestions
      };
    } catch (error) {
      console.error('Error in content optimization analysis:', error);
      throw new Error(`Content optimization failed: ${error.message}`);
    }
  }
  
  /**
   * Calculates an overall content quality score based on component scores
   * 
   * @private
   * @param {Object} keywordResults - Keyword analysis results
   * @param {Object} readabilityResults - Readability analysis results
   * @param {Object} structureResults - Structure analysis results
   * @returns {number} Overall content score (0-100)
   */
  _calculateOverallScore(keywordResults, readabilityResults, structureResults) {
    // Weight the different components based on importance
    const weights = {
      keyword: 0.4,
      readability: 0.3,
      structure: 0.3
    };
    
    return Math.round(
      (keywordResults.score * weights.keyword) +
      (readabilityResults.score * weights.readability) +
      (structureResults.score * weights.structure)
    );
  }
  
  /**
   * Batch processes multiple content items
   * 
   * @param {Array} contentItems - Array of content items to analyze
   * @param {Object} globalContext - Shared context for all items
   * @returns {Array} Analysis results for all content items
   */
  async batchAnalyze(contentItems, globalContext = {}) {
    const results = [];
    
    for (const item of contentItems) {
      // Merge global context with item-specific context
      const itemContext = {
        ...globalContext,
        ...(item.context || {})
      };
      
      const result = await this.analyzeContent(item, itemContext);
      results.push(result);
    }
    
    return results;
  }
}

module.exports = ContentOptimizationEngine;
