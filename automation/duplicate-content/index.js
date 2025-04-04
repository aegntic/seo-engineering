/**
 * Duplicate Content Analysis Module Entry Point
 * 
 * This module provides a comprehensive system for identifying duplicate and 
 * near-duplicate content across websites, which is critical for SEO optimization.
 * 
 * The system uses a modular architecture with four key components:
 * 1. Content Fingerprinting
 * 2. Similarity Detection
 * 3. Cross-Page Comparison
 * 4. Canonical URL Suggestion
 * 
 * @module duplicate-content
 */

const ContentFingerprinter = require('./src/fingerprinter');
const SimilarityEngine = require('./src/similarity');
const ContentComparator = require('./src/comparator');
const CanonicalSuggestor = require('./src/canonical');
const config = require('./config');

/**
 * Main class for duplicate content analysis
 */
class DuplicateContentAnalyzer {
  /**
   * Create a new DuplicateContentAnalyzer
   * @param {Object} options - Configuration options
   * @param {number} options.similarityThreshold - Minimum similarity score (0-1)
   * @param {number} options.minContentLength - Minimum content length to analyze
   * @param {number} options.parallelComparisons - Maximum parallel comparisons
   * @param {Array<string>} options.excludePatterns - URL patterns to exclude
   */
  constructor(options = {}) {
    this.config = {
      ...config,
      ...options
    };
    
    this.fingerprinter = new ContentFingerprinter(this.config);
    this.similarityEngine = new SimilarityEngine(this.config);
    this.comparator = new ContentComparator(this.config);
    this.canonicalSuggestor = new CanonicalSuggestor(this.config);
  }

  /**
   * Analyze a website for duplicate content
   * @param {string} siteUrl - The website URL to analyze
   * @param {Object} options - Analysis options
   * @returns {Promise<DuplicateContentResult>} Analysis results
   */
  async analyzeSite(siteUrl, options = {}) {
    try {
      // Get pages from crawler module (assumed to be already crawled)
      const crawlerModule = require('../crawler');
      const pages = await crawlerModule.getPages(siteUrl);
      
      return this.analyzePages(pages, options);
    } catch (error) {
      console.error(`Error analyzing site ${siteUrl}:`, error);
      throw error;
    }
  }

  /**
   * Analyze a set of pages for duplicate content
   * @param {Array<Object>} pages - Array of page objects with URL and content
   * @param {Object} options - Analysis options
   * @returns {Promise<DuplicateContentResult>} Analysis results
   */
  async analyzePages(pages, options = {}) {
    try {
      console.log(`Analyzing ${pages.length} pages for duplicate content...`);
      
      // 1. Generate fingerprints for all pages
      const fingerprints = await this.fingerprinter.generateFingerprints(pages);
      
      // 2. Compare fingerprints to find similarities
      const similarities = await this.similarityEngine.findSimilarities(fingerprints);
      
      // 3. Group similar content into clusters
      const duplicateGroups = await this.comparator.findDuplicateGroups(similarities);
      
      // 4. Generate canonical suggestions
      const canonicalSuggestions = 
        await this.canonicalSuggestor.suggestCanonicals(duplicateGroups, pages);
      
      return new DuplicateContentResult(
        duplicateGroups,
        canonicalSuggestions,
        fingerprints,
        similarities
      );
    } catch (error) {
      console.error('Error analyzing pages for duplicate content:', error);
      throw error;
    }
  }
}

/**
 * Results from duplicate content analysis
 */
class DuplicateContentResult {
  /**
   * Create a new DuplicateContentResult
   * @param {Array<Array<string>>} duplicateGroups - Groups of duplicate page URLs
   * @param {Object} canonicalSuggestions - Suggested canonical URLs
   * @param {Object} fingerprints - Content fingerprints
   * @param {Object} similarities - Similarity scores
   */
  constructor(duplicateGroups, canonicalSuggestions, fingerprints, similarities) {
    this.duplicateGroups = duplicateGroups;
    this.canonicalSuggestions = canonicalSuggestions;
    this.fingerprints = fingerprints;
    this.similarities = similarities;
  }

  /**
   * Get groups of duplicate pages
   * @returns {Array<Array<string>>} Groups of duplicate page URLs
   */
  getDuplicateGroups() {
    return this.duplicateGroups;
  }

  /**
   * Get suggested canonical URLs for duplicate content
   * @returns {Object} Map of page URLs to suggested canonical URLs
   */
  getCanonicalSuggestions() {
    return this.canonicalSuggestions;
  }

  /**
   * Get comprehensive report data
   * @returns {Object} Full analysis data
   */
  getFullReport() {
    return {
      duplicateGroups: this.duplicateGroups,
      canonicalSuggestions: this.canonicalSuggestions,
      similarityDetails: this.similarities,
      analysisDate: new Date().toISOString()
    };
  }
}

module.exports = {
  DuplicateContentAnalyzer,
  DuplicateContentResult
};
