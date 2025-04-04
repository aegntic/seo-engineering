/**
 * Internal Linking Optimization Module Entry Point
 * 
 * This module provides a comprehensive system for analyzing and optimizing
 * the internal linking structure of websites to improve SEO performance.
 * 
 * The system uses a modular architecture with four key components:
 * 1. Link Graph Analysis
 * 2. Orphaned Page Detection
 * 3. Link Distribution Optimization
 * 4. Anchor Text Optimization
 * 
 * @module internal-linking
 */

const LinkGraphAnalyzer = require('./src/graph');
const OrphanedPageDetector = require('./src/analyzer');
const LinkDistributionOptimizer = require('./src/optimizer');
const AnchorTextOptimizer = require('./src/text');
const config = require('./config');

/**
 * Main class for internal linking optimization
 */
class InternalLinkingOptimizer {
  /**
   * Create a new InternalLinkingOptimizer
   * @param {Object} options - Configuration options
   * @param {number} options.minLinkableContent - Minimum content length for a page to be considered
   * @param {number} options.maxOutboundLinks - Maximum outbound links per page
   * @param {number} options.minInboundLinks - Minimum recommended inbound links per page
   * @param {number} options.distributionFactor - Factor for balancing link distribution
   * @param {Array<string>} options.excludePatterns - URL patterns to exclude
   */
  constructor(options = {}) {
    this.config = {
      ...config,
      ...options
    };
    
    this.graphAnalyzer = new LinkGraphAnalyzer(this.config);
    this.orphanDetector = new OrphanedPageDetector(this.config);
    this.distributionOptimizer = new LinkDistributionOptimizer(this.config);
    this.anchorTextOptimizer = new AnchorTextOptimizer(this.config);
  }

  /**
   * Analyze a website's internal linking structure
   * @param {string} siteUrl - The website URL to analyze
   * @param {Object} options - Analysis options
   * @returns {Promise<InternalLinkingResult>} Analysis results
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
   * Analyze a set of pages for internal linking optimization
   * @param {Array<Object>} pages - Array of page objects with URL, content, and links
   * @param {Object} options - Analysis options
   * @returns {Promise<InternalLinkingResult>} Analysis results
   */
  async analyzePages(pages, options = {}) {
    try {
      console.log(`Analyzing internal linking structure for ${pages.length} pages...`);
      
      // 1. Build and analyze the link graph
      const linkGraph = await this.graphAnalyzer.buildLinkGraph(pages);
      const graphMetrics = await this.graphAnalyzer.analyzeGraph(linkGraph);
      
      // 2. Detect orphaned pages
      const orphanedPages = await this.orphanDetector.findOrphanedPages(linkGraph, pages);
      
      // 3. Optimize link distribution
      const distributionSuggestions = 
        await this.distributionOptimizer.optimizeDistribution(linkGraph, pages, orphanedPages);
      
      // 4. Generate anchor text suggestions
      const anchorTextSuggestions = 
        await this.anchorTextOptimizer.generateAnchorText(distributionSuggestions, pages);
      
      return new InternalLinkingResult(
        graphMetrics,
        orphanedPages,
        distributionSuggestions,
        anchorTextSuggestions
      );
    } catch (error) {
      console.error('Error analyzing internal linking structure:', error);
      throw error;
    }
  }
}

/**
 * Results from internal linking analysis and optimization
 */
class InternalLinkingResult {
  /**
   * Create a new InternalLinkingResult
   * @param {Object} graphMetrics - Link graph analysis metrics
   * @param {Array<Object>} orphanedPages - Detected orphaned pages
   * @param {Object} distributionSuggestions - Link distribution suggestions
   * @param {Object} anchorTextSuggestions - Anchor text suggestions
   */
  constructor(graphMetrics, orphanedPages, distributionSuggestions, anchorTextSuggestions) {
    this.graphMetrics = graphMetrics;
    this.orphanedPages = orphanedPages;
    this.distributionSuggestions = distributionSuggestions;
    this.anchorTextSuggestions = anchorTextSuggestions;
  }

  /**
   * Get link graph metrics
   * @returns {Object} Link graph metrics and statistics
   */
  getLinkGraphMetrics() {
    return this.graphMetrics;
  }

  /**
   * Get detected orphaned pages
   * @returns {Array<Object>} Orphaned pages with relevant metrics
   */
  getOrphanedPages() {
    return this.orphanedPages;
  }

  /**
   * Get link distribution suggestions
   * @returns {Object} Source and target URLs for suggested new links
   */
  getDistributionSuggestions() {
    return this.distributionSuggestions;
  }

  /**
   * Get anchor text suggestions
   * @returns {Object} Suggested anchor text for each proposed link
   */
  getAnchorTextSuggestions() {
    return this.anchorTextSuggestions;
  }

  /**
   * Get comprehensive report data
   * @returns {Object} Full analysis data
   */
  getFullReport() {
    return {
      graphMetrics: this.graphMetrics,
      orphanedPages: this.orphanedPages,
      linkSuggestions: this.distributionSuggestions,
      anchorTextSuggestions: this.anchorTextSuggestions,
      analysisDate: new Date().toISOString()
    };
  }
}

module.exports = {
  InternalLinkingOptimizer,
  InternalLinkingResult
};
