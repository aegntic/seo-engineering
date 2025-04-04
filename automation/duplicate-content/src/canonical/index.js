/**
 * Canonical URL Suggestion Module
 * 
 * Analyzes duplicate content groups and suggests the most appropriate
 * canonical URL for each group based on various heuristics.
 * 
 * @module duplicate-content/canonical
 */

const url = require('url');
const { parseUrlPath } = require('./url-utils');

/**
 * Class for suggesting canonical URLs for duplicate content
 */
class CanonicalSuggestor {
  /**
   * Create a new CanonicalSuggestor
   * @param {Object} config - Configuration options
   */
  constructor(config) {
    this.config = config;
    this.strategies = this.initializeStrategies();
  }

  /**
   * Initialize canonical selection strategies
   * @returns {Object} Map of strategy implementations
   * @private
   */
  initializeStrategies() {
    return {
      'shortest-url': this.shortestUrlStrategy.bind(this),
      'most-incoming-links': this.mostIncomingLinksStrategy.bind(this),
      'oldest-published': this.oldestPublishedStrategy.bind(this),
      'most-traffic': this.mostTrafficStrategy.bind(this)
    };
  }

  /**
   * Suggest canonical URLs for groups of duplicate content
   * @param {Array<Array<string>>} duplicateGroups - Groups of duplicate URLs
   * @param {Array<Object>} pages - Page objects with URL and metadata
   * @returns {Promise<Object>} Map of page URLs to canonical URLs
   */
  async suggestCanonicals(duplicateGroups, pages) {
    if (!duplicateGroups || duplicateGroups.length === 0) {
      return {};
    }

    // Create a map for easier lookup of page metadata
    const pageMap = new Map();
    pages.forEach(page => {
      pageMap.set(page.url, page);
    });

    const canonicalSuggestions = {};
    
    // Process each duplicate group
    for (const group of duplicateGroups) {
      if (group.length <= 1) continue;
      
      // Find the best canonical URL for this group
      const canonicalUrl = await this.selectCanonicalUrl(group, pageMap);
      
      // Set this URL as canonical for all pages in the group
      group.forEach(url => {
        if (url !== canonicalUrl) {
          canonicalSuggestions[url] = canonicalUrl;
        }
      });
    }
    
    return canonicalSuggestions;
  }

  /**
   * Select the best canonical URL for a group of duplicates
   * @param {Array<string>} group - Group of duplicate URLs
   * @param {Map<string, Object>} pageMap - Map of URLs to page metadata
   * @returns {Promise<string>} Best canonical URL
   * @private
   */
  async selectCanonicalUrl(group, pageMap) {
    // Try each strategy in order until one returns a result
    for (const strategy of this.config.canonicalStrategies) {
      if (this.strategies[strategy]) {
        const canonicalUrl = await this.strategies[strategy](group, pageMap);
        if (canonicalUrl) {
          return canonicalUrl;
        }
      }
    }
    
    // Default: first URL in the group (fallback)
    return group[0];
  }

  /**
   * Strategy: Select the shortest, cleanest URL
   * @param {Array<string>} group - Group of duplicate URLs
   * @returns {Promise<string|null>} Best canonical URL or null
   * @private
   */
  async shortestUrlStrategy(group) {
    let bestUrl = null;
    let bestScore = -Infinity;
    
    for (const pageUrl of group) {
      try {
        const parsedUrl = new URL(pageUrl);
        const path = parsedUrl.pathname;
        
        // Calculate a score based on URL characteristics
        let score = 0;
        
        // Shorter paths are better
        score -= path.length;
        
        // URLs without query parameters are better
        score -= parsedUrl.search.length * 2;
        
        // URLs without fragments are better
        score -= parsedUrl.hash.length * 2;
        
        // URLs with fewer path segments are better
        const pathSegments = path.split('/').filter(s => s.length > 0);
        score -= pathSegments.length * 5;
        
        // URLs without file extensions are often better for canonicals
        const hasExtension = path.match(/\.[a-zA-Z0-9]{2,5}$/);
        if (!hasExtension) {
          score += 10;
        }
        
        // URLs with keywords like "category", "product", etc. might be preferred
        const seoKeywords = ['product', 'category', 'article', 'page'];
        if (seoKeywords.some(keyword => path.includes(keyword))) {
          score += 5;
        }
        
        // Update best URL if this one has a better score
        if (score > bestScore) {
          bestScore = score;
          bestUrl = pageUrl;
        }
      } catch (error) {
        console.error(`Error parsing URL ${pageUrl}:`, error);
      }
    }
    
    return bestUrl;
  }

  /**
   * Strategy: Select URL with most incoming links
   * @param {Array<string>} group - Group of duplicate URLs
   * @param {Map<string, Object>} pageMap - Map of URLs to page metadata
   * @returns {Promise<string|null>} Best canonical URL or null
   * @private
   */
  async mostIncomingLinksStrategy(group, pageMap) {
    let bestUrl = null;
    let maxLinks = -1;
    
    for (const pageUrl of group) {
      const page = pageMap.get(pageUrl);
      
      if (page && page.incomingLinks && page.incomingLinks > maxLinks) {
        maxLinks = page.incomingLinks;
        bestUrl = pageUrl;
      }
    }
    
    return bestUrl;
  }

  /**
   * Strategy: Select the oldest published URL
   * @param {Array<string>} group - Group of duplicate URLs
   * @param {Map<string, Object>} pageMap - Map of URLs to page metadata
   * @returns {Promise<string|null>} Best canonical URL or null
   * @private
   */
  async oldestPublishedStrategy(group, pageMap) {
    let bestUrl = null;
    let oldestDate = null;
    
    for (const pageUrl of group) {
      const page = pageMap.get(pageUrl);
      
      if (page && page.publishDate) {
        const publishDate = new Date(page.publishDate);
        
        if (!oldestDate || publishDate < oldestDate) {
          oldestDate = publishDate;
          bestUrl = pageUrl;
        }
      }
    }
    
    return bestUrl;
  }

  /**
   * Strategy: Select URL with most traffic
   * @param {Array<string>} group - Group of duplicate URLs
   * @param {Map<string, Object>} pageMap - Map of URLs to page metadata
   * @returns {Promise<string|null>} Best canonical URL or null
   * @private
   */
  async mostTrafficStrategy(group, pageMap) {
    let bestUrl = null;
    let maxTraffic = -1;
    
    for (const pageUrl of group) {
      const page = pageMap.get(pageUrl);
      
      if (page && page.traffic && page.traffic > maxTraffic) {
        maxTraffic = page.traffic;
        bestUrl = pageUrl;
      }
    }
    
    return bestUrl;
  }

  /**
   * Generate implementation fixes for canonical tags
   * @param {Object} canonicalSuggestions - Map of page URLs to canonical URLs
   * @returns {Promise<Array<Object>>} Array of fix objects for implementation
   */
  async generateFixes(canonicalSuggestions) {
    const fixes = [];
    
    for (const [pageUrl, canonicalUrl] of Object.entries(canonicalSuggestions)) {
      fixes.push({
        type: 'canonical',
        url: pageUrl,
        canonicalUrl: canonicalUrl,
        implementation: `<link rel="canonical" href="${canonicalUrl}" />`,
        description: `Add canonical tag pointing to ${canonicalUrl}`
      });
    }
    
    return fixes;
  }
}

module.exports = CanonicalSuggestor;
