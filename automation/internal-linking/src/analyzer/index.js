/**
 * Orphaned Page Detector
 * 
 * This module analyzes a site's link graph to identify orphaned and near-orphaned pages.
 * Orphaned pages are those with few or no incoming links, making them difficult for 
 * users and search engines to discover.
 * 
 * Key features:
 * - Identifies completely orphaned pages (no incoming links)
 * - Finds near-orphaned pages (below threshold of incoming links)
 * - Calculates accessibility scores based on incoming link patterns
 * - Prioritizes pages based on content value and orphaned status
 * - Suggests connection strategies for orphaned content
 */

const { performance } = require('perf_hooks');

/**
 * Detects and analyzes orphaned pages within a website
 */
class OrphanedPageDetector {
  /**
   * Create a new OrphanedPageDetector
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.config = config;
    this.orphanThreshold = config.orphanThreshold || 1;
  }

  /**
   * Find orphaned pages in the link graph
   * @param {Object} linkGraph - The website's link graph
   * @param {Array<Object>} pages - Original page content data
   * @returns {Promise<Array<Object>>} Array of orphaned page data
   */
  async findOrphanedPages(linkGraph, pages) {
    console.log('Analyzing site for orphaned pages...');
    const startTime = performance.now();

    // Build a map for quick content lookup
    const pageContentMap = new Map();
    for (const page of pages) {
      pageContentMap.set(page.url, page);
    }

    // Analyze each node in the graph
    const orphanedPages = [];
    const nearOrphanedPages = [];
    
    for (const [url, node] of linkGraph.nodes.entries()) {
      const inLinkCount = node.inLinks.length;
      
      // Skip the homepage
      if (url === linkGraph.homeNode) {
        continue;
      }
      
      // Get page content and metrics
      const pageData = pageContentMap.get(url) || {};
      const contentLength = pageData.content ? pageData.content.length : 0;
      const hasContent = contentLength >= (this.config.minLinkableContent || 200);
      const pageImportance = this._calculatePageImportance(node, pageData);
      
      const orphanData = {
        url,
        title: pageData.title || node.title || url,
        inLinkCount,
        clickDistance: node.metrics.clickDistance,
        pageRank: node.metrics.pageRank,
        contentLength,
        hasContent,
        importance: pageImportance,
        category: this._categorizeOrphanedPage(node, pageData),
        potentialSources: []  // Will be populated later
      };
      
      if (inLinkCount === 0) {
        // Completely orphaned
        orphanedPages.push(orphanData);
      } else if (inLinkCount <= this.orphanThreshold) {
        // Near-orphaned (below threshold)
        nearOrphanedPages.push(orphanData);
      }
    }
    
    // Find potential sources for orphaned pages
    await this._findPotentialSources(orphanedPages.concat(nearOrphanedPages), linkGraph, pageContentMap);
    
    // Sort by importance for prioritization
    const allOrphanedPages = [...orphanedPages, ...nearOrphanedPages].sort((a, b) => b.importance - a.importance);
    
    const duration = ((performance.now() - startTime) / 1000).toFixed(2);
    console.log(`Found ${orphanedPages.length} completely orphaned pages and ${nearOrphanedPages.length} near-orphaned pages in ${duration}s`);
    
    return allOrphanedPages;
  }

  /**
   * Calculate the importance score of a page
   * @param {Object} node - Page node from link graph
   * @param {Object} pageData - Original page content data
   * @returns {number} Importance score (0-1)
   * @private
   */
  _calculatePageImportance(node, pageData) {
    // Factors that contribute to page importance
    const hasContent = pageData.content && pageData.content.length >= (this.config.minLinkableContent || 200);
    const pageRank = node.metrics.pageRank || 0;
    const hasKeywords = pageData.keywords && pageData.keywords.length > 0;
    const contentLength = pageData.content ? pageData.content.length : 0;
    const contentFactor = Math.min(1, contentLength / 2000); // Cap at 2000 chars
    
    // Calculate weighted score
    let score = 0;
    
    if (hasContent) {
      score += 0.3 * contentFactor;
    }
    
    score += 0.4 * pageRank;
    
    if (hasKeywords) {
      score += 0.2;
    }
    
    // Adjust for updated content
    if (pageData.lastModified) {
      const ageInDays = (Date.now() - new Date(pageData.lastModified).getTime()) / (1000 * 3600 * 24);
      const recencyFactor = Math.max(0, Math.min(1, 1 - (ageInDays / 365))); // Newer is better, cap at 1 year
      score += 0.1 * recencyFactor;
    }
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Categorize an orphaned page based on its characteristics
   * @param {Object} node - Page node from link graph
   * @param {Object} pageData - Original page content data
   * @returns {string} Category label
   * @private
   */
  _categorizeOrphanedPage(node, pageData) {
    // Use available data to categorize the orphaned page
    const path = pageData.url ? new URL(pageData.url).pathname.toLowerCase() : '';
    
    if (path.match(/\/(blog|article|post|news)/)) {
      return 'content';
    } else if (path.match(/\/(product|item|shop)/)) {
      return 'product';
    } else if (path.match(/\/(category|tag|topic)/)) {
      return 'taxonomy';
    } else if (path.match(/\/(about|team|contact|faq)/)) {
      return 'information';
    } else if (path.match(/\/(service|features)/)) {
      return 'offering';
    } else {
      return 'other';
    }
  }

  /**
   * Find potential source pages that could link to orphaned pages
   * @param {Array<Object>} orphanedPages - List of orphaned pages
   * @param {Object} linkGraph - The website's link graph
   * @param {Map<string, Object>} pageContentMap - Map of page URLs to content
   * @private
   */
  async _findPotentialSources(orphanedPages, linkGraph, pageContentMap) {
    for (const orphanedPage of orphanedPages) {
      const potentialSources = [];
      const orphanedUrl = orphanedPage.url;
      const orphanedPageData = pageContentMap.get(orphanedUrl) || {};
      
      // Extract keywords and content from orphaned page
      const orphanedKeywords = orphanedPageData.keywords || [];
      const orphanedContent = orphanedPageData.content || '';
      const orphanCategory = this._categorizeOrphanedPage(linkGraph.nodes.get(orphanedUrl), orphanedPageData);
      
      for (const [url, node] of linkGraph.nodes.entries()) {
        // Skip if this is the orphaned page itself
        if (url === orphanedUrl) {
          continue;
        }
        
        // Skip pages that already link to this orphaned page
        if (node.outLinks.some(link => link.target === orphanedUrl)) {
          continue;
        }
        
        const pageData = pageContentMap.get(url) || {};
        const sourceCategory = this._categorizeOrphanedPage(node, pageData);
        
        // Calculate relevance score for this potential source
        const relevanceScore = this._calculateRelevanceScore(
          orphanedPageData, 
          pageData,
          orphanCategory,
          sourceCategory,
          node.metrics.pageRank || 0
        );
        
        if (relevanceScore > 0.3) {  // Minimum threshold for relevance
          potentialSources.push({
            url,
            title: pageData.title || node.title || url,
            relevanceScore,
            pageRank: node.metrics.pageRank || 0,
            outLinkCount: node.outLinks.length
          });
        }
      }
      
      // Sort potential sources by relevance and limit to top matches
      orphanedPage.potentialSources = potentialSources
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 5);
    }
  }

  /**
   * Calculate relevance score between potential source and orphaned page
   * @param {Object} orphanedPageData - Data for orphaned page
   * @param {Object} sourcePageData - Data for potential source page
   * @param {string} orphanCategory - Category of orphaned page
   * @param {string} sourceCategory - Category of source page
   * @param {number} sourcePageRank - PageRank of source page
   * @returns {number} Relevance score (0-1)
   * @private
   */
  _calculateRelevanceScore(orphanedPageData, sourcePageData, orphanCategory, sourceCategory, sourcePageRank) {
    let score = 0;
    
    // 1. Keyword overlap
    const orphanedKeywords = orphanedPageData.keywords || [];
    const sourceKeywords = sourcePageData.keywords || [];
    
    if (orphanedKeywords.length > 0 && sourceKeywords.length > 0) {
      const commonKeywords = orphanedKeywords.filter(kw => sourceKeywords.includes(kw));
      const keywordOverlap = commonKeywords.length / Math.max(orphanedKeywords.length, sourceKeywords.length);
      score += 0.3 * keywordOverlap;
    }
    
    // 2. Content similarity
    const orphanedContent = orphanedPageData.content || '';
    const sourceContent = sourcePageData.content || '';
    
    if (orphanedContent && sourceContent) {
      // Simple content similarity based on keyword presence
      let contentSimilarity = 0;
      
      if (orphanedKeywords.length > 0) {
        const keywordsInSource = orphanedKeywords.filter(kw => 
          sourceContent.toLowerCase().includes(kw.toLowerCase())
        ).length;
        
        contentSimilarity = keywordsInSource / orphanedKeywords.length;
      }
      
      score += 0.2 * contentSimilarity;
    }
    
    // 3. Category relationship
    if (orphanCategory && sourceCategory) {
      const sameCategoryBonus = orphanCategory === sourceCategory ? 0.2 : 0;
      const relatedCategoryBonus = this._areCategoriesRelated(orphanCategory, sourceCategory) ? 0.1 : 0;
      score += sameCategoryBonus + relatedCategoryBonus;
    }
    
    // 4. Source page authority
    score += 0.2 * sourcePageRank;
    
    // 5. Outlink capacity
    const outLinkCount = sourcePageData.links ? sourcePageData.links.length : 0;
    const outLinkPenalty = Math.max(0, Math.min(0.1, (outLinkCount - 20) / 200));
    score -= outLinkPenalty;
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Check if two content categories are related
   * @param {string} category1 - First category
   * @param {string} category2 - Second category
   * @returns {boolean} Whether the categories are related
   * @private
   */
  _areCategoriesRelated(category1, category2) {
    // Define related category pairs
    const relatedPairs = [
      ['content', 'taxonomy'],
      ['product', 'taxonomy'],
      ['product', 'offering'],
      ['information', 'offering']
    ];
    
    // Check if the pair is in related pairs
    return relatedPairs.some(pair => 
      (pair[0] === category1 && pair[1] === category2) || 
      (pair[0] === category2 && pair[1] === category1)
    );
  }
}

module.exports = OrphanedPageDetector;
