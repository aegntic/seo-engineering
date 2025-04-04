/**
 * Link Distribution Optimizer
 * 
 * This module analyzes a website's internal linking structure and generates
 * recommendations for optimizing link distribution to improve SEO and user navigation.
 * 
 * Key features:
 * - Identifies opportunities for adding strategic internal links
 * - Balances link equity across the site
 * - Improves content discovery paths
 * - Reduces click distance to important pages
 * - Connects orphaned content to the main site structure
 */

const { performance } = require('perf_hooks');
const { PriorityQueue } = require('../../utils/data-structures');
const urlUtils = require('../../utils/url-utils');

/**
 * Optimizes internal link distribution
 */
class LinkDistributionOptimizer {
  /**
   * Create a new LinkDistributionOptimizer
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.config = config;
    this.distributionFactor = config.distributionFactor || 0.7;
    this.maxSuggestedLinks = config.maxSuggestedLinks || 15;
    this.maxOutboundLinks = config.maxOutboundLinks || 100;
  }

  /**
   * Optimize link distribution across the site
   * @param {Object} linkGraph - The website's link graph
   * @param {Array<Object>} pages - Original page content data
   * @param {Array<Object>} orphanedPages - Detected orphaned pages
   * @returns {Promise<Object>} Link distribution suggestions
   */
  async optimizeDistribution(linkGraph, pages, orphanedPages) {
    console.log('Optimizing internal link distribution...');
    const startTime = performance.now();

    // Build a map for quick content lookup
    const pageContentMap = new Map();
    for (const page of pages) {
      pageContentMap.set(page.url, page);
    }

    // Generate different types of link suggestions
    const orphanRescueSuggestions = await this._generateOrphanRescueSuggestions(orphanedPages, linkGraph);
    const hubSuggestions = await this._generateHubSuggestions(linkGraph, pageContentMap);
    const balancingSuggestions = await this._generateBalancingSuggestions(linkGraph, pageContentMap);
    const siloConnectionSuggestions = await this._generateSiloConnectionSuggestions(linkGraph, pageContentMap);
    
    // Combine and prioritize suggestions
    const allSuggestions = [
      ...orphanRescueSuggestions,
      ...hubSuggestions,
      ...balancingSuggestions,
      ...siloConnectionSuggestions
    ];
    
    // De-duplicate suggestions (same source -> target pair)
    const uniqueSuggestions = this._deduplicate(allSuggestions);
    
    // Sort by descending relevance score
    uniqueSuggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Group suggestions by source page
    const suggestionsBySource = this._groupBySource(uniqueSuggestions);
    
    // Limit suggestions per page and overall
    const limitedSuggestions = this._limitSuggestions(suggestionsBySource);
    
    const duration = ((performance.now() - startTime) / 1000).toFixed(2);
    console.log(`Generated ${limitedSuggestions.length} link distribution suggestions in ${duration}s`);
    
    return {
      suggestions: limitedSuggestions,
      metrics: {
        orphanRescue: orphanRescueSuggestions.length,
        hubConnections: hubSuggestions.length,
        balancing: balancingSuggestions.length,
        siloConnections: siloConnectionSuggestions.length,
        totalGenerated: allSuggestions.length,
        totalUnique: uniqueSuggestions.length,
        totalReturned: limitedSuggestions.length
      }
    };
  }

  /**
   * Generate suggestions for rescuing orphaned pages
   * @param {Array<Object>} orphanedPages - Detected orphaned pages
   * @param {Object} linkGraph - The website's link graph
   * @returns {Promise<Array<Object>>} Orphan rescue suggestions
   * @private
   */
  async _generateOrphanRescueSuggestions(orphanedPages, linkGraph) {
    const suggestions = [];
    
    for (const orphanedPage of orphanedPages) {
      // Skip if no potential sources identified
      if (!orphanedPage.potentialSources || orphanedPage.potentialSources.length === 0) {
        continue;
      }
      
      for (const source of orphanedPage.potentialSources) {
        const sourceNode = linkGraph.nodes.get(source.url);
        const targetNode = linkGraph.nodes.get(orphanedPage.url);
        
        // Skip if source node doesn't exist or already has too many outlinks
        if (!sourceNode || sourceNode.outLinks.length >= this.maxOutboundLinks) {
          continue;
        }
        
        suggestions.push({
          source: source.url,
          target: orphanedPage.url,
          sourceTitle: sourceNode.title || source.url,
          targetTitle: targetNode.title || orphanedPage.url,
          type: 'orphan_rescue',
          priority: 'high',
          relevanceScore: source.relevanceScore,
          reason: `Connect orphaned page (${orphanedPage.inLinkCount} inlinks) with a relevant source`
        });
      }
    }
    
    return suggestions;
  }

  /**
   * Generate suggestions for connecting to hub pages
   * @param {Object} linkGraph - The website's link graph
   * @param {Map<string, Object>} pageContentMap - Map of URLs to page content
   * @returns {Promise<Array<Object>>} Hub suggestions
   * @private
   */
  async _generateHubSuggestions(linkGraph, pageContentMap) {
    const suggestions = [];
    
    // Find top hub pages (high hub scores)
    const hubPages = Array.from(linkGraph.nodes.entries())
      .map(([url, node]) => ({ url, node }))
      .sort((a, b) => b.node.metrics.hubScore - a.node.metrics.hubScore)
      .slice(0, 10);
    
    for (const { url: hubUrl, node: hubNode } of hubPages) {
      // Find pages that could benefit from linking to this hub
      for (const [pageUrl, pageNode] of linkGraph.nodes.entries()) {
        // Skip if already linked
        if (pageUrl === hubUrl || 
            pageNode.outLinks.some(link => link.target === hubUrl)) {
          continue;
        }
        
        // Skip if node already has too many outlinks
        if (pageNode.outLinks.length >= this.maxOutboundLinks) {
          continue;
        }
        
        // Calculate potential benefit
        const clickDistanceImprovement = 
          this._calculateClickDistanceImprovement(linkGraph, pageUrl, hubUrl);
        
        const hubRelevance = this._calculateContentRelevance(
          pageContentMap.get(pageUrl),
          pageContentMap.get(hubUrl)
        );
        
        const score = (0.6 * hubRelevance) + (0.4 * clickDistanceImprovement);
        
        if (score > 0.4) {  // Minimum threshold
          suggestions.push({
            source: pageUrl,
            target: hubUrl,
            sourceTitle: pageNode.title || pageUrl,
            targetTitle: hubNode.title || hubUrl,
            type: 'hub_connection',
            priority: score > 0.7 ? 'high' : 'medium',
            relevanceScore: score,
            reason: `Connect to hub page to improve site structure`
          });
        }
      }
    }
    
    return suggestions;
  }

  /**
   * Generate suggestions for balancing link equity
   * @param {Object} linkGraph - The website's link graph
   * @param {Map<string, Object>} pageContentMap - Map of URLs to page content
   * @returns {Promise<Array<Object>>} Balancing suggestions
   * @private
   */
  async _generateBalancingSuggestions(linkGraph, pageContentMap) {
    const suggestions = [];
    
    // Identify high and low PageRank pages
    const nodes = Array.from(linkGraph.nodes.entries())
      .map(([url, node]) => ({ url, node }));
    
    // Get top 15% PageRank pages as sources
    const topPageRankPages = [...nodes]
      .sort((a, b) => b.node.metrics.pageRank - a.node.metrics.pageRank)
      .slice(0, Math.max(5, Math.floor(nodes.length * 0.15)));
    
    // Get pages with lower PageRank but good content as targets
    const lowPageRankPages = nodes
      .filter(({ node }) => {
        const contentLength = node.content?.length || 0;
        return node.metrics.pageRank < 0.01 && contentLength >= (this.config.minLinkableContent || 200);
      })
      .sort((a, b) => b.node.content.length - a.node.content.length)
      .slice(0, Math.max(10, Math.floor(nodes.length * 0.2)));
    
    // Generate suggestions from high to low PageRank pages
    for (const { url: sourceUrl, node: sourceNode } of topPageRankPages) {
      // Skip if source already has too many outlinks
      if (sourceNode.outLinks.length >= this.maxOutboundLinks) {
        continue;
      }
      
      for (const { url: targetUrl, node: targetNode } of lowPageRankPages) {
        // Skip if already linked
        if (sourceUrl === targetUrl || 
            sourceNode.outLinks.some(link => link.target === targetUrl)) {
          continue;
        }
        
        const relevance = this._calculateContentRelevance(
          pageContentMap.get(sourceUrl),
          pageContentMap.get(targetUrl)
        );
        
        if (relevance > 0.5) {  // Only suggest if content is related
          suggestions.push({
            source: sourceUrl,
            target: targetUrl,
            sourceTitle: sourceNode.title || sourceUrl,
            targetTitle: targetNode.title || targetUrl,
            type: 'equity_balancing',
            priority: 'medium',
            relevanceScore: relevance,
            reason: `Distribute link equity from high-authority to underlinked content`
          });
        }
      }
    }
    
    return suggestions;
  }

  /**
   * Generate suggestions for connecting content silos
   * @param {Object} linkGraph - The website's link graph
   * @param {Map<string, Object>} pageContentMap - Map of URLs to page content
   * @returns {Promise<Array<Object>>} Silo connection suggestions
   * @private
   */
  async _generateSiloConnectionSuggestions(linkGraph, pageContentMap) {
    const suggestions = [];
    
    // Try to identify content silos based on URL structure
    const siloPrefixes = new Map();
    
    for (const [url, _] of linkGraph.nodes.entries()) {
      try {
        const parsedUrl = new URL(url);
        const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
        
        if (pathParts.length > 0) {
          const siloPrefix = pathParts[0].toLowerCase();
          
          if (!siloPrefixes.has(siloPrefix)) {
            siloPrefixes.set(siloPrefix, []);
          }
          
          siloPrefixes.get(siloPrefix).push(url);
        }
      } catch (error) {
        console.warn(`Error parsing URL ${url}: ${error.message}`);
        continue;
      }
    }
    
    // Only consider actual silos (enough pages)
    const validSilos = Array.from(siloPrefixes.entries())
      .filter(([_, urls]) => urls.length >= 5)
      .map(([prefix, urls]) => ({ prefix, urls }));
    
    // Find connecting pages between silos
    for (let i = 0; i < validSilos.length; i++) {
      for (let j = i + 1; j < validSilos.length; j++) {
        const silo1 = validSilos[i];
        const silo2 = validSilos[j];
        
        // Find the best pages in each silo to connect
        const silo1Candidates = this._findTopSiloPages(silo1.urls, linkGraph, pageContentMap);
        const silo2Candidates = this._findTopSiloPages(silo2.urls, linkGraph, pageContentMap);
        
        // Find the best pairs for cross-linking
        for (const source of silo1Candidates) {
          for (const target of silo2Candidates) {
            const sourceNode = linkGraph.nodes.get(source.url);
            const targetNode = linkGraph.nodes.get(target.url);
            
            // Skip if already linked or too many outlinks
            if (sourceNode.outLinks.some(link => link.target === target.url) ||
                sourceNode.outLinks.length >= this.maxOutboundLinks) {
              continue;
            }
            
            const relevance = this._calculateContentRelevance(
              pageContentMap.get(source.url),
              pageContentMap.get(target.url)
            );
            
            if (relevance > 0.4) {
              suggestions.push({
                source: source.url,
                target: target.url,
                sourceTitle: sourceNode.title || source.url,
                targetTitle: targetNode.title || target.url,
                type: 'silo_connection',
                priority: 'medium',
                relevanceScore: relevance,
                reason: `Connect content silos: ${silo1.prefix} → ${silo2.prefix}`
              });
            }
          }
        }
      }
    }
    
    return suggestions;
  }

  /**
   * Find the top pages in a silo for cross-linking
   * @param {Array<string>} siloUrls - URLs in the silo
   * @param {Object} linkGraph - The website's link graph
   * @param {Map<string, Object>} pageContentMap - Map of URLs to page content
   * @returns {Array<Object>} Top pages in the silo
   * @private
   */
  _findTopSiloPages(siloUrls, linkGraph, pageContentMap) {
    return siloUrls
      .map(url => {
        const node = linkGraph.nodes.get(url);
        const pageData = pageContentMap.get(url) || {};
        
        return {
          url,
          pageRank: node.metrics.pageRank || 0,
          contentLength: pageData.content ? pageData.content.length : 0,
          score: (node.metrics.pageRank || 0) * 0.7 + 
                 (pageData.content ? Math.min(1, pageData.content.length / 2000) * 0.3 : 0)
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);  // Top 3 pages from each silo
  }

  /**
   * Calculate improvements in click distance from adding a link
   * @param {Object} linkGraph - The website's link graph
   * @param {string} sourceUrl - Source URL
   * @param {string} targetUrl - Target URL
   * @returns {number} Normalized improvement value (0-1)
   * @private
   */
  _calculateClickDistanceImprovement(linkGraph, sourceUrl, targetUrl) {
    const sourceNode = linkGraph.nodes.get(sourceUrl);
    const targetNode = linkGraph.nodes.get(targetUrl);
    
    if (!sourceNode || !targetNode) {
      return 0;
    }
    
    // Get current click distances
    const sourceDistance = sourceNode.metrics.clickDistance || Infinity;
    const targetDistance = targetNode.metrics.clickDistance || Infinity;
    
    // If target is already closer to home, no improvement
    if (targetDistance <= sourceDistance) {
      return 0;
    }
    
    // Calculate potential new distance
    const potentialNewDistance = sourceDistance + 1;
    
    // Improvement is the difference in click distance
    const improvement = targetDistance - potentialNewDistance;
    
    // Normalize the improvement (0-1)
    return Math.min(1, improvement / 5);  // Cap at 5 clicks improvement
  }

  /**
   * Calculate content relevance between two pages
   * @param {Object} sourcePage - Source page data
   * @param {Object} targetPage - Target page data
   * @returns {number} Relevance score (0-1)
   * @private
   */
  _calculateContentRelevance(sourcePage, targetPage) {
    // Default to minimum relevance if data is missing
    if (!sourcePage || !targetPage) {
      return 0.1;
    }
    
    let score = 0;
    
    // 1. Title similarity
    if (sourcePage.title && targetPage.title) {
      const sourceWords = sourcePage.title.toLowerCase().split(/\s+/);
      const targetWords = targetPage.title.toLowerCase().split(/\s+/);
      
      const commonWords = sourceWords.filter(word => 
        word.length > 3 && targetWords.includes(word)
      );
      
      const titleSimilarity = commonWords.length / Math.max(sourceWords.length, 1);
      score += 0.3 * titleSimilarity;
    }
    
    // 2. Keyword overlap
    if (sourcePage.keywords && targetPage.keywords) {
      const sourceKeywords = sourcePage.keywords;
      const targetKeywords = targetPage.keywords;
      
      const commonKeywords = sourceKeywords.filter(kw => targetKeywords.includes(kw));
      const keywordOverlap = commonKeywords.length / 
        Math.max(Math.min(sourceKeywords.length, targetKeywords.length), 1);
      
      score += 0.4 * keywordOverlap;
    }
    
    // 3. URL path similarity
    try {
      const sourcePathSegments = new URL(sourcePage.url).pathname.split('/').filter(Boolean);
      const targetPathSegments = new URL(targetPage.url).pathname.split('/').filter(Boolean);
      
      if (sourcePathSegments.length > 0 && targetPathSegments.length > 0) {
        let commonSegments = 0;
        const minSegments = Math.min(sourcePathSegments.length, targetPathSegments.length);
        
        for (let i = 0; i < minSegments; i++) {
          if (sourcePathSegments[i] === targetPathSegments[i]) {
            commonSegments++;
          } else {
            break;
          }
        }
        
        const pathSimilarity = commonSegments / Math.max(minSegments, 1);
        score += 0.3 * pathSimilarity;
      }
    } catch (error) {
      // Skip URL similarity on error
    }
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Remove duplicate suggestions (same source -> target pair)
   * @param {Array<Object>} suggestions - All generated suggestions
   * @returns {Array<Object>} Deduplicated suggestions
   * @private
   */
  _deduplicate(suggestions) {
    const seen = new Set();
    const unique = [];
    
    for (const suggestion of suggestions) {
      const key = `${suggestion.source}|${suggestion.target}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(suggestion);
      }
    }
    
    return unique;
  }

  /**
   * Group suggestions by source page URL
   * @param {Array<Object>} suggestions - All suggestions
   * @returns {Map<string, Array<Object>>} Suggestions grouped by source URL
   * @private
   */
  _groupBySource(suggestions) {
    const bySource = new Map();
    
    for (const suggestion of suggestions) {
      if (!bySource.has(suggestion.source)) {
        bySource.set(suggestion.source, []);
      }
      
      bySource.get(suggestion.source).push(suggestion);
    }
    
    return bySource;
  }

  /**
   * Limit the number of suggestions per page and overall
   * @param {Map<string, Array<Object>>} suggestionsBySource - Suggestions grouped by source
   * @returns {Array<Object>} Limited suggestions
   * @private
   */
  _limitSuggestions(suggestionsBySource) {
    const limitedSuggestions = [];
    
    // Apply per-page limits
    for (const [source, suggestions] of suggestionsBySource.entries()) {
      // Sort by relevance score descending
      suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      // Take top suggestions per page
      const topSuggestions = suggestions.slice(0, this.maxSuggestedLinks);
      limitedSuggestions.push(...topSuggestions);
    }
    
    // Sort overall by relevance score
    limitedSuggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    return limitedSuggestions;
  }
}

module.exports = LinkDistributionOptimizer;
