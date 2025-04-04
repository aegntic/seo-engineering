/**
 * Backlink Analyzer Service
 * 
 * Responsible for discovering competitors based on backlink profile similarity
 */

const logger = require('../utils/logger');
const { extractDomain } = require('../utils/url-utils');

/**
 * BacklinkAnalyzer Class
 * Discovers competitors based on shared backlinks and similar link profiles
 */
class BacklinkAnalyzer {
  /**
   * Constructor
   * 
   * @param {Object} config - Backlink analyzer configuration
   */
  constructor(config) {
    this.config = config;
    this.minSimilarity = config.minSimilarity || 0.2;
    this.maxBacklinks = config.maxBacklinks || 1000;
    this.prioritizeAuthoritySites = config.prioritizeAuthoritySites !== false;
    this.backlinkMetrics = config.backlinkMetrics || {
      domainAuthority: true,
      pageAuthority: true,
      trustFlow: true,
      citationFlow: true
    };
    this.apiEndpoints = config.apiEndpoints || {};
    this.apiKeys = {
      majestic: process.env.MAJESTIC_API_KEY || '',
      moz: process.env.MOZ_API_KEY || '',
      ahrefs: process.env.AHREFS_API_KEY || ''
    };
  }
  
  /**
   * Find competitors based on backlink similarity
   * 
   * @param {Object} siteData - Site data including backlinks
   * @returns {Promise<Array<Object>>} - Discovered competitors
   */
  async findCompetitors(siteData) {
    logger.info(`Finding competitors using backlink analysis for site ${siteData._id}`);
    
    try {
      // 1. Get site backlinks
      const siteBacklinks = await this._getSiteBacklinks(siteData);
      
      if (siteBacklinks.length === 0) {
        logger.warn(`No backlinks found for site ${siteData._id}`);
        return [];
      }
      
      // 2. Find sites with similar backlink profiles
      const similarSites = await this._findSitesWithSimilarBacklinks(siteBacklinks, siteData.domain);
      
      // 3. Calculate similarity scores
      const competitors = this._calculateSimilarityScores(similarSites, siteBacklinks, siteData.domain);
      
      logger.info(`Found ${competitors.length} competitors using backlink analysis for site ${siteData._id}`);
      
      return competitors;
    } catch (error) {
      logger.error(`Error finding competitors using backlink analysis: ${error.message}`, {
        siteId: siteData._id,
        error: error.stack
      });
      
      // Return empty array on error
      return [];
    }
  }
  
  /**
   * Get backlinks for a site
   * 
   * @param {Object} siteData - Site data
   * @returns {Promise<Array<Object>>} - Site backlinks
   * @private
   */
  async _getSiteBacklinks(siteData) {
    // In a real implementation, this would call backlink APIs
    // For now, we'll use the backlinks provided in site data or simulate them
    
    if (siteData.backlinks && Array.isArray(siteData.backlinks)) {
      return siteData.backlinks.slice(0, this.maxBacklinks);
    }
    
    // Simulate backlinks if none provided
    return this._simulateBacklinks(siteData.domain);
  }
  
  /**
   * Simulate backlinks for a domain (for development purposes)
   * 
   * @param {String} domain - Domain to simulate backlinks for
   * @returns {Array<Object>} - Simulated backlinks
   * @private
   */
  _simulateBacklinks(domain) {
    // Generate deterministic but varied backlinks based on domain
    // This is just for development and testing
    
    const domainHash = this._simpleHash(domain);
    const linkCount = 20 + (domainHash % 30); // 20-49 backlinks
    
    const referrerDomains = [
      'blog-site.com',
      'news-portal.com',
      'industry-review.com',
      'tech-blog.net',
      'social-media.com',
      'forum-site.org',
      'review-platform.com',
      'directory-site.net',
      'partner-website.com',
      'professional-blog.org',
      'education-site.edu',
      'government-site.gov',
      'local-business.com',
      'affiliate-site.net',
      'industry-association.org'
    ];
    
    const backlinks = [];
    
    for (let i = 0; i < linkCount; i++) {
      const domainIndex = (domainHash + i * 3) % referrerDomains.length;
      const referrerDomain = referrerDomains[domainIndex];
      
      const authority = 20 + ((domainHash + i) % 80); // Authority between 20-99
      
      backlinks.push({
        domain: referrerDomain,
        url: `https://${referrerDomain}/page-${i}`,
        targetUrl: `https://${domain}/target-page-${i % 5}`,
        anchor: `Anchor text ${i}`,
        authority: authority,
        trustFlow: authority - 10 + (i % 20),
        citationFlow: authority - 5 + (i % 15)
      });
    }
    
    return backlinks;
  }
  
  /**
   * Simple string hash function for simulation
   * 
   * @param {String} str - Input string
   * @returns {Number} - Numeric hash
   * @private
   */
  _simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
  
  /**
   * Find sites with similar backlink profiles
   * 
   * @param {Array<Object>} siteBacklinks - Site backlinks
   * @param {String} siteDomain - Site domain to exclude
   * @returns {Promise<Map>} - Map of similar sites
   * @private
   */
  async _findSitesWithSimilarBacklinks(siteBacklinks, siteDomain) {
    // In a real implementation, this would query backlink APIs
    // For now, we'll simulate the results
    
    logger.info(`Finding sites with similar backlinks to ${siteDomain}`);
    
    // Extract referring domains
    const referringDomains = new Set(
      siteBacklinks.map(backlink => backlink.domain)
    );
    
    // Map to store similar sites
    const similarSites = new Map();
    
    // For each referring domain, find other sites it links to
    for (const referringDomain of referringDomains) {
      // Simulate other sites that this domain links to
      const otherSites = this._simulateOtherLinkedSites(referringDomain, siteDomain);
      
      // Process each site linked from this referrer
      for (const site of otherSites) {
        const domain = site.domain;
        
        // Skip the original site
        if (domain === siteDomain) {
          continue;
        }
        
        // Add or update in similar sites map
        if (similarSites.has(domain)) {
          const siteData = similarSites.get(domain);
          
          // Add new shared backlink
          siteData.sharedBacklinks.push({
            referringDomain,
            referringUrl: site.referringUrl,
            targetUrl: site.targetUrl,
            authority: site.authority
          });
          
          // Update metrics
          siteData.totalAuthority += site.authority;
          
          if (site.authority > siteData.maxAuthority) {
            siteData.maxAuthority = site.authority;
            siteData.bestBacklink = {
              referringDomain,
              referringUrl: site.referringUrl,
              targetUrl: site.targetUrl,
              authority: site.authority
            };
          }
        } else {
          // Add new site
          similarSites.set(domain, {
            domain,
            url: site.targetUrl,
            sharedBacklinks: [{
              referringDomain,
              referringUrl: site.referringUrl,
              targetUrl: site.targetUrl,
              authority: site.authority
            }],
            totalAuthority: site.authority,
            maxAuthority: site.authority,
            bestBacklink: {
              referringDomain,
              referringUrl: site.referringUrl,
              targetUrl: site.targetUrl,
              authority: site.authority
            }
          });
        }
      }
    }
    
    return similarSites;
  }
  
  /**
   * Simulate other sites linked from a referring domain (for development purposes)
   * 
   * @param {String} referringDomain - Referring domain
   * @param {String} excludeDomain - Domain to exclude
   * @returns {Array<Object>} - Other linked sites
   * @private
   */
  _simulateOtherLinkedSites(referringDomain, excludeDomain) {
    // Generate deterministic but varied results
    const domainHash = this._simpleHash(referringDomain);
    const siteCount = 3 + (domainHash % 5); // 3-7 sites
    
    const targetDomains = [
      'competitor1.com',
      'competitor2.com',
      'competitor3.com',
      'competitor4.com',
      'competitor5.com',
      'competitor6.com',
      'competitor7.com',
      'competitor8.com',
      'competitor9.com',
      'competitor10.com',
      excludeDomain // Include the original site for filtering later
    ];
    
    const sites = [];
    
    for (let i = 0; i < siteCount; i++) {
      const domainIndex = (domainHash + i * 7) % targetDomains.length;
      const targetDomain = targetDomains[domainIndex];
      
      // Skip if this is the excluded domain
      if (targetDomain === excludeDomain) {
        continue;
      }
      
      const authority = 20 + ((domainHash + i) % 80); // Authority between 20-99
      
      sites.push({
        domain: targetDomain,
        referringDomain,
        referringUrl: `https://${referringDomain}/outbound-${i}`,
        targetUrl: `https://${targetDomain}/inbound-${i}`,
        authority
      });
    }
    
    return sites;
  }
  
  /**
   * Calculate similarity scores for potential competitors
   * 
   * @param {Map} similarSites - Map of similar sites
   * @param {Array<Object>} siteBacklinks - Original site backlinks
   * @param {String} siteDomain - Original site domain
   * @returns {Array<Object>} - Competitors with relevance scores
   * @private
   */
  _calculateSimilarityScores(similarSites, siteBacklinks, siteDomain) {
    // Calculate total authority of original site backlinks
    const totalSiteAuthority = siteBacklinks.reduce(
      (sum, backlink) => sum + (backlink.authority || 0), 
      0
    );
    
    // Convert map to array and calculate similarity scores
    const competitors = Array.from(similarSites.values()).map(site => {
      // Count shared backlinks
      const sharedCount = site.sharedBacklinks.length;
      
      // Calculate shared authority percentage
      const sharedAuthority = site.totalAuthority;
      const authorityPercentage = totalSiteAuthority > 0
        ? sharedAuthority / totalSiteAuthority
        : 0;
      
      // Calculate backlink overlap ratio
      const backlinkOverlap = siteBacklinks.length > 0
        ? sharedCount / siteBacklinks.length
        : 0;
      
      // Calculate relevance score based on shared backlinks and authority
      const relevanceScore = (backlinkOverlap * 0.6) + (authorityPercentage * 0.4);
      
      return {
        url: site.url || `https://${site.domain}`,
        domain: site.domain,
        relevanceScore: Math.min(relevanceScore, 1.0), // Cap at 1.0
        discoveryMethod: 'backlink',
        keywordOverlap: 0, // Will be filled by keyword analyzer
        backlinksInCommon: sharedCount,
        serpOverlap: 0, // Will be filled by SERP analyzer
        industryMatch: false, // Will be filled by industry classifier
        sharedAuthority: Math.round(authorityPercentage * 100) // As percentage
      };
    });
    
    // Filter by minimum similarity and sort
    return competitors
      .filter(competitor => competitor.relevanceScore >= this.minSimilarity)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
  
  /**
   * Real backlink API call implementation (commented out, would be used in production)
   * 
   * @param {String} domain - Domain to get backlinks for
   * @param {String} provider - Backlink data provider (majestic, moz, ahrefs)
   * @returns {Promise<Array<Object>>} - Backlinks
   * @private
   */
  /*
  async _callBacklinkApi(domain, provider = 'majestic') {
    const apiKey = this.apiKeys[provider];
    const endpoint = this.apiEndpoints[provider];
    
    if (!apiKey) {
      throw new Error(`No API key found for provider: ${provider}`);
    }
    
    logger.debug(`Calling ${provider} API for domain: ${domain}`);
    
    try {
      let response;
      
      // Different parameters based on provider
      if (provider === 'majestic') {
        response = await axios.get(endpoint, {
          params: {
            cmd: 'GetBackLinkData',
            item: domain,
            ItemType: 0, // 0 for domain, 1 for URL
            Count: this.maxBacklinks,
            datasource: 'fresh',
            APIKey: apiKey
          }
        });
        
        // Parse Majestic response
        if (response.data && response.data.DataTables && response.data.DataTables.BackLinks) {
          return response.data.DataTables.BackLinks.Data.map(link => ({
            domain: link.SourceHost,
            url: link.SourceURL,
            targetUrl: link.TargetURL,
            anchor: link.AnchorText,
            trustFlow: link.SourceTrustFlow,
            citationFlow: link.SourceCitationFlow
          }));
        }
      } else if (provider === 'moz') {
        // Implement Moz API call
      } else if (provider === 'ahrefs') {
        // Implement Ahrefs API call
      }
      
      return [];
    } catch (error) {
      logger.error(`Error calling ${provider} API: ${error.message}`, {
        domain,
        error: error.stack
      });
      throw error;
    }
  }
  */
}

module.exports = BacklinkAnalyzer;
