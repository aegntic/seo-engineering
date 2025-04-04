/**
 * Industry Classifier Service
 * 
 * Responsible for discovering competitors based on industry classification
 */

const logger = require('../utils/logger');
const { extractDomain } = require('../utils/url-utils');

/**
 * IndustryClassifier Class
 * Discovers competitors by identifying industry and finding similar sites
 */
class IndustryClassifier {
  /**
   * Constructor
   * 
   * @param {Object} config - Industry classifier configuration
   */
  constructor(config) {
    this.config = config;
    this.useAI = config.useAI !== false;
    this.confidenceThreshold = config.confidenceThreshold || 0.7;
    this.fallbackToSimilarKeywords = config.fallbackToSimilarKeywords !== false;
    this.industries = config.industries || [];
    this.keywordMapping = config.keywordMapping || {};
  }
  
  /**
   * Find competitors based on industry classification
   * 
   * @param {Object} siteData - Site data including domain and content
   * @returns {Promise<Array<Object>>} - Discovered competitors
   */
  async findCompetitors(siteData) {
    logger.info(`Finding competitors using industry classification for site ${siteData._id}`);
    
    try {
      // 1. Determine site industry
      const siteIndustry = await this._determineSiteIndustry(siteData);
      
      if (!siteIndustry) {
        logger.warn(`Could not determine industry for site ${siteData._id}`);
        return [];
      }
      
      logger.info(`Determined industry for site ${siteData._id}: ${siteIndustry}`);
      
      // 2. Find top sites in the same industry
      const industrySites = await this._findTopIndustrySites(siteIndustry, siteData.domain);
      
      // 3. Calculate relevance scores
      const competitors = this._calculateRelevanceScores(industrySites, siteIndustry, siteData.domain);
      
      logger.info(`Found ${competitors.length} competitors using industry classification for site ${siteData._id}`);
      
      return competitors;
    } catch (error) {
      logger.error(`Error finding competitors using industry classification: ${error.message}`, {
        siteId: siteData._id,
        error: error.stack
      });
      
      // Return empty array on error
      return [];
    }
  }
  
  /**
   * Determine site industry
   * 
   * @param {Object} siteData - Site data
   * @returns {Promise<String|null>} - Industry name or null
   * @private
   */
  async _determineSiteIndustry(siteData) {
    // In a real implementation, this would use NLP or ML classification
    // For now, we'll use the industry provided in site data or simulate it
    
    // Use provided industry if available
    if (siteData.industry && typeof siteData.industry === 'string') {
      return siteData.industry;
    }
    
    // Simulate industry classification
    return this._simulateIndustryClassification(siteData);
  }
  
  /**
   * Simulate industry classification (for development purposes)
   * 
   * @param {Object} siteData - Site data
   * @returns {String} - Simulated industry classification
   * @private
   */
  _simulateIndustryClassification(siteData) {
    // Generate deterministic but varied results
    const domainHash = this._simpleHash(siteData.domain);
    
    const industries = this.industries.length > 0 
      ? this.industries 
      : [
          'E-commerce',
          'Finance',
          'Healthcare',
          'Education',
          'Technology',
          'Travel',
          'Real Estate',
          'Food & Beverage',
          'Manufacturing',
          'Entertainment',
          'Media',
          'Professional Services',
          'Non-profit'
        ];
    
    const industryIndex = domainHash % industries.length;
    return industries[industryIndex];
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
   * Find top sites in the same industry
   * 
   * @param {String} industry - Industry name
   * @param {String} siteDomain - Site domain to exclude
   * @returns {Promise<Array<Object>>} - Top industry sites
   * @private
   */
  async _findTopIndustrySites(industry, siteDomain) {
    // In a real implementation, this would query a directory or database
    // For now, we'll simulate the results
    
    logger.info(`Finding top sites in industry: ${industry}`);
    
    // Simulate industry-specific sites
    return this._simulateTopIndustrySites(industry, siteDomain);
  }
  
  /**
   * Simulate top industry sites (for development purposes)
   * 
   * @param {String} industry - Industry name
   * @param {String} excludeDomain - Domain to exclude
   * @returns {Array<Object>} - Simulated top industry sites
   * @private
   */
  _simulateTopIndustrySites(industry, excludeDomain) {
    // Generate deterministic but varied results
    const industryHash = this._simpleHash(industry);
    const siteCount = 8 + (industryHash % 7); // 8-14 sites
    
    // Create industry-specific domain templates
    const domainTemplates = [
      `top-${industry.toLowerCase().replace(/\s+/g, '-')}.com`,
      `best-${industry.toLowerCase().replace(/\s+/g, '-')}.com`,
      `${industry.toLowerCase().replace(/\s+/g, '-')}-leader.com`,
      `${industry.toLowerCase().replace(/\s+/g, '-')}-solutions.com`,
      `${industry.toLowerCase().replace(/\s+/g, '-')}-provider.com`,
      `${industry.toLowerCase().replace(/\s+/g, '-')}-expert.com`,
      `${industry.toLowerCase().replace(/\s+/g, '-')}-services.com`,
      `${industry.toLowerCase().replace(/\s+/g, '-')}-portal.com`,
      `${industry.toLowerCase().replace(/\s+/g, '-')}-hub.com`,
      `${industry.toLowerCase().replace(/\s+/g, '-')}-center.com`
    ];
    
    // Create generic competitor domains
    const competitorDomains = [
      'competitor1.com',
      'competitor2.com',
      'competitor3.com',
      'competitor4.com',
      'competitor5.com',
      'competitor6.com',
      'competitor7.com',
      'competitor8.com',
      'competitor9.com',
      'competitor10.com'
    ];
    
    // Combine industry-specific and generic domains
    const allDomains = [...domainTemplates, ...competitorDomains];
    
    const sites = [];
    
    for (let i = 0; i < siteCount; i++) {
      const domainIndex = (industryHash + i * 3) % allDomains.length;
      const domain = allDomains[domainIndex];
      
      // Skip if this is the excluded domain
      if (domain === excludeDomain) {
        continue;
      }
      
      // Calculate a relevance score - higher for industry-specific domains
      const isIndustrySpecific = domainTemplates.includes(domain);
      const baseScore = isIndustrySpecific ? 0.8 : 0.6;
      const relevanceScore = baseScore - (i * 0.05); // Decrease for lower ranks
      
      sites.push({
        domain,
        url: `https://${domain}`,
        industryRank: i + 1,
        relevanceScore: Math.max(0.3, relevanceScore),
        isIndustrySpecific
      });
    }
    
    return sites;
  }
  
  /**
   * Calculate relevance scores for industry competitors
   * 
   * @param {Array<Object>} industrySites - Industry sites
   * @param {String} industry - Industry name
   * @param {String} siteDomain - Original site domain
   * @returns {Array<Object>} - Competitors with relevance scores
   * @private
   */
  _calculateRelevanceScores(industrySites, industry, siteDomain) {
    // Apply relevance scoring logic
    const competitors = industrySites.map(site => {
      // Adjust score based on industry rank
      const rankFactor = 1 - (Math.min(site.industryRank, 10) / 20); // 0.5-0.95
      
      // Industry-specific domains get a boost
      const specificBoost = site.isIndustrySpecific ? 0.1 : 0;
      
      // Calculate final relevance score
      const relevanceScore = (site.relevanceScore * 0.7) + (rankFactor * 0.2) + specificBoost;
      
      return {
        url: site.url,
        domain: site.domain,
        relevanceScore: Math.min(relevanceScore, 1.0), // Cap at 1.0
        discoveryMethod: 'industry',
        keywordOverlap: 0, // Will be filled by keyword analyzer
        backlinksInCommon: 0, // Will be filled by backlink analyzer
        serpOverlap: 0, // Will be filled by SERP analyzer
        industryMatch: true,
        industry,
        industryRank: site.industryRank
      };
    });
    
    // Sort by relevance score
    return competitors.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
  
  /**
   * Real industry classification implementation (commented out, would be used in production)
   * 
   * @param {Object} siteData - Site data
   * @returns {Promise<String|null>} - Industry classification
   * @private
   */
  /*
  async _classifyIndustryWithAI(siteData) {
    try {
      // Extract key content for classification
      const contentSample = this._extractContentSample(siteData);
      
      if (!contentSample) {
        logger.warn('Insufficient content for industry classification');
        return null;
      }
      
      // Make API call to NLP/ML service
      const response = await axios.post('https://ai-classification-api.example.com/classify', {
        text: contentSample,
        type: 'industry',
        categories: this.industries
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.AI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.data || !response.data.classifications) {
        return null;
      }
      
      // Get top classification
      const topClassification = response.data.classifications[0];
      
      // Check confidence threshold
      if (topClassification.confidence >= this.confidenceThreshold) {
        return topClassification.category;
      }
      
      // Fall back to keyword-based classification if configured
      if (this.fallbackToSimilarKeywords) {
        return this._classifyByKeywords(siteData);
      }
      
      return null;
    } catch (error) {
      logger.error(`Error classifying industry with AI: ${error.message}`, {
        error: error.stack
      });
      
      // Fall back to keyword-based classification if configured
      if (this.fallbackToSimilarKeywords) {
        return this._classifyByKeywords(siteData);
      }
      
      return null;
    }
  }
  
  _extractContentSample(siteData) {
    // Combine relevant text from site data
    const parts = [];
    
    // Add page titles
    if (siteData.pages && Array.isArray(siteData.pages)) {
      const titles = siteData.pages
        .map(page => page.title)
        .filter(Boolean)
        .join(' | ');
      
      if (titles) parts.push(titles);
    }
    
    // Add meta descriptions
    if (siteData.metaDescriptions && Array.isArray(siteData.metaDescriptions)) {
      const descriptions = siteData.metaDescriptions.join(' | ');
      if (descriptions) parts.push(descriptions);
    }
    
    // Add keywords
    if (siteData.keywords && Array.isArray(siteData.keywords)) {
      const keywords = siteData.keywords
        .map(kw => typeof kw === 'string' ? kw : kw.keyword)
        .filter(Boolean)
        .join(', ');
      
      if (keywords) parts.push(keywords);
    }
    
    // Add content samples
    if (siteData.contentSamples && Array.isArray(siteData.contentSamples)) {
      parts.push(...siteData.contentSamples);
    }
    
    return parts.join(' ').slice(0, 5000); // Limit to 5000 chars
  }
  
  _classifyByKeywords(siteData) {
    // Extract keywords from site content
    const siteKeywords = new Set();
    
    // Add explicitly defined keywords
    if (siteData.keywords && Array.isArray(siteData.keywords)) {
      siteData.keywords.forEach(kw => {
        if (typeof kw === 'string') {
          siteKeywords.add(kw.toLowerCase());
        } else if (kw.keyword) {
          siteKeywords.add(kw.keyword.toLowerCase());
        }
      });
    }
    
    // Extract keywords from titles and descriptions
    if (siteData.pages && Array.isArray(siteData.pages)) {
      siteData.pages.forEach(page => {
        if (page.title) {
          page.title.split(/\s+/).forEach(word => {
            if (word.length > 3) siteKeywords.add(word.toLowerCase());
          });
        }
      });
    }
    
    // Match keywords to industries
    const industryCounts = {};
    
    for (const [industry, keywords] of Object.entries(this.keywordMapping)) {
      industryCounts[industry] = 0;
      
      for (const keyword of keywords) {
        if (siteKeywords.has(keyword.toLowerCase())) {
          industryCounts[industry]++;
        }
      }
    }
    
    // Find the industry with the most matches
    let bestIndustry = null;
    let bestCount = 0;
    
    for (const [industry, count] of Object.entries(industryCounts)) {
      if (count > bestCount) {
        bestCount = count;
        bestIndustry = industry;
      }
    }
    
    // Require at least 2 matching keywords
    return bestCount >= 2 ? bestIndustry : null;
  }
  */
}

module.exports = IndustryClassifier;
