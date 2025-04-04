/**
 * Profile Generator Service
 * 
 * Responsible for generating detailed competitor profiles
 */

const logger = require('../utils/logger');
const { extractDomain } = require('../utils/url-utils');
const CompetitorProfile = require('../models/competitor-profile');
const mongoose = require('mongoose');

/**
 * ProfileGenerator Class
 * Generates detailed profiles for discovered competitors
 */
class ProfileGenerator {
  /**
   * Constructor
   * 
   * @param {Object} config - Profile generator configuration
   */
  constructor(config) {
    this.config = config;
    this.includeDomainMetrics = config.includeDomainMetrics !== false;
    this.includeKeywordData = config.includeKeywordData !== false;
    this.includeBacklinks = config.includeBacklinks !== false;
    this.includeContentAnalysis = config.includeContentAnalysis !== false;
    this.includeSocialMedia = config.includeSocialMedia !== false;
    this.includeTechnologies = config.includeTechnologies !== false;
    this.maxTopKeywords = config.maxTopKeywords || 20;
    this.maxBacklinksInProfile = config.maxBacklinksInProfile || 50;
  }
  
  /**
   * Generate or update competitor profile
   * 
   * @param {String} siteId - Site ID
   * @param {Object} competitor - Competitor data
   * @param {Object} siteData - Original site data
   * @returns {Promise<Object>} - Generated profile
   */
  async generateProfile(siteId, competitor, siteData) {
    logger.info(`Generating profile for competitor ${competitor.domain} for site ${siteId}`);
    
    try {
      // 1. Check if profile already exists
      let profile = await CompetitorProfile.findOne({
        siteId,
        domain: competitor.domain
      });
      
      // 2. Create profile ID if new
      const competitorId = competitor._id || new mongoose.Types.ObjectId();
      
      // 3. Generate profile data
      const profileData = await this._generateProfileData(competitor, siteData);
      
      // 4. Create or update profile
      if (profile) {
        // Update existing profile
        logger.info(`Updating existing profile for ${competitor.domain}`);
        profile.competitorId = competitorId;
        Object.assign(profile, profileData);
        await profile.save();
      } else {
        // Create new profile
        logger.info(`Creating new profile for ${competitor.domain}`);
        profile = new CompetitorProfile({
          siteId,
          competitorId,
          ...profileData
        });
        await profile.save();
      }
      
      return profile;
    } catch (error) {
      logger.error(`Error generating profile for competitor ${competitor.domain}: ${error.message}`, {
        siteId,
        competitor: competitor.domain,
        error: error.stack
      });
      
      throw error;
    }
  }
  
  /**
   * Generate profile data for a competitor
   * 
   * @param {Object} competitor - Competitor data
   * @param {Object} siteData - Original site data
   * @returns {Promise<Object>} - Profile data
   * @private
   */
  async _generateProfileData(competitor, siteData) {
    // Initialize profile data
    const profileData = {
      url: competitor.url,
      domain: competitor.domain,
      lastCrawledAt: new Date()
    };
    
    // Add domain metrics if enabled
    if (this.includeDomainMetrics) {
      profileData.domainMetrics = await this._getDomainMetrics(competitor);
    }
    
    // Add keyword data if enabled
    if (this.includeKeywordData) {
      profileData.keywordData = await this._getKeywordData(competitor, siteData);
    }
    
    // Add backlinks if enabled
    if (this.includeBacklinks) {
      profileData.backlinks = await this._getBacklinkData(competitor, siteData);
    }
    
    // Add content analysis if enabled
    if (this.includeContentAnalysis) {
      profileData.content = await this._getContentAnalysis(competitor);
    }
    
    // Add social media profiles if enabled
    if (this.includeSocialMedia) {
      profileData.socialMedia = await this._getSocialMediaProfiles(competitor);
    }
    
    // Add technologies if enabled
    if (this.includeTechnologies) {
      profileData.technologies = await this._getTechnologies(competitor);
    }
    
    // Add SEO data
    profileData.seo = await this._getSeoData(competitor);
    
    // Add performance data
    profileData.performance = await this._getPerformanceData(competitor);
    
    return profileData;
  }
  
  /**
   * Get domain metrics for a competitor
   * 
   * @param {Object} competitor - Competitor data
   * @returns {Promise<Object>} - Domain metrics
   * @private
   */
  async _getDomainMetrics(competitor) {
    // In a real implementation, this would call APIs for domain metrics
    // For now, we'll simulate this data
    
    const domainHash = this._simpleHash(competitor.domain);
    
    return {
      domainAuthority: competitor.domainAuthority || (20 + (domainHash % 80)), // 20-99
      pageAuthority: competitor.pageAuthority || (10 + (domainHash % 90)), // 10-99
      trustFlow: competitor.trustFlow || (10 + (domainHash % 90)), // 10-99
      citationFlow: competitor.citationFlow || (10 + (domainHash % 90)), // 10-99
      domainAge: 1 + (domainHash % 20), // 1-20 years
      estimatedTraffic: competitor.trafficEstimate || this._simulateTrafficEstimate(competitor.domain),
      dataSource: 'simulation', // Would be 'majestic', 'moz', etc. in production
      dataTimestamp: new Date()
    };
  }
  
  /**
   * Get keyword data for a competitor
   * 
   * @param {Object} competitor - Competitor data
   * @param {Object} siteData - Original site data
   * @returns {Promise<Object>} - Keyword data
   * @private
   */
  async _getKeywordData(competitor, siteData) {
    // In a real implementation, this would fetch actual keyword data
    // For now, we'll simulate this data
    
    const domainHash = this._simpleHash(competitor.domain);
    const totalKeywords = 100 + (domainHash % 900); // 100-999
    
    // Generate top keywords
    const topKeywords = [];
    for (let i = 0; i < Math.min(this.maxTopKeywords, 20); i++) {
      topKeywords.push({
        keyword: `${competitor.domain}-keyword-${i + 1}`,
        volume: 500 + ((domainHash + i) % 9500), // 500-9999
        position: 1 + ((domainHash + i) % 10), // 1-10
        url: `${competitor.url}/page-${i + 1}`
      });
    }
    
    // Generate keywords in common with the original site
    const keywordsInCommon = [];
    if (siteData.keywords && Array.isArray(siteData.keywords)) {
      // Use some of the site's actual keywords
      const keywordCount = Math.min(siteData.keywords.length, 10);
      
      for (let i = 0; i < keywordCount; i++) {
        const keyword = siteData.keywords[i];
        const keywordText = typeof keyword === 'string' ? keyword : keyword.keyword;
        
        if (keywordText) {
          keywordsInCommon.push({
            keyword: keywordText,
            competitorPosition: 1 + ((domainHash + i) % 20), // 1-20
            sitePosition: 1 + ((domainHash + i + 5) % 20), // 1-20 (different from competitor)
            volume: 500 + ((domainHash + i) % 9500) // 500-9999
          });
        }
      }
    }
    
    // Generate keyword gaps (keywords competitor ranks for but the site doesn't)
    const keywordGaps = [];
    for (let i = 0; i < 10; i++) {
      keywordGaps.push({
        keyword: `gap-keyword-${i + 1}`,
        volume: 500 + ((domainHash + i) % 9500), // 500-9999
        position: 1 + ((domainHash + i) % 10), // 1-10
        url: `${competitor.url}/gap-page-${i + 1}`
      });
    }
    
    return {
      totalKeywords,
      topKeywords,
      keywordsInCommon,
      keywordGaps
    };
  }
  
  /**
   * Get backlink data for a competitor
   * 
   * @param {Object} competitor - Competitor data
   * @param {Object} siteData - Original site data
   * @returns {Promise<Object>} - Backlink data
   * @private
   */
  async _getBacklinkData(competitor, siteData) {
    // In a real implementation, this would fetch actual backlink data
    // For now, we'll simulate this data
    
    const domainHash = this._simpleHash(competitor.domain);
    const totalBacklinks = 1000 + (domainHash % 9000); // 1,000-9,999
    const backlinkDomains = 100 + (domainHash % 900); // 100-999
    
    // Generate common backlinks
    const commonBacklinks = [];
    if (siteData.backlinks && Array.isArray(siteData.backlinks)) {
      // Use some of the site's actual backlinks
      const backlinkCount = Math.min(siteData.backlinks.length, 
                                      this.maxBacklinksInProfile / 2);
      
      for (let i = 0; i < backlinkCount; i++) {
        const backlink = siteData.backlinks[i];
        if (backlink && backlink.domain) {
          commonBacklinks.push({
            domain: backlink.domain,
            url: backlink.url || `https://${backlink.domain}/link-${i}`,
            authority: 20 + ((domainHash + i) % 80) // 20-99
          });
        }
      }
    }
    
    // Generate unique backlinks
    const uniqueBacklinks = [];
    for (let i = 0; i < Math.min(this.maxBacklinksInProfile / 2, 25); i++) {
      uniqueBacklinks.push({
        domain: `unique-backlink-${i + 1}.com`,
        url: `https://unique-backlink-${i + 1}.com/link-to-${competitor.domain}`,
        authority: 20 + ((domainHash + i) % 80) // 20-99
      });
    }
    
    return {
      totalBacklinks,
      backlinkDomains,
      commonBacklinks,
      uniqueBacklinks
    };
  }
  
  /**
   * Get content analysis for a competitor
   * 
   * @param {Object} competitor - Competitor data
   * @returns {Promise<Object>} - Content analysis
   * @private
   */
  async _getContentAnalysis(competitor) {
    // In a real implementation, this would analyze actual content
    // For now, we'll simulate this data
    
    const domainHash = this._simpleHash(competitor.domain);
    const pageCount = 10 + (domainHash % 990); // 10-999
    const averageWordCount = 500 + (domainHash % 1500); // 500-1999
    
    // Generate content categories
    const contentCategories = [
      'Product Pages',
      'Blog Posts',
      'Landing Pages',
      'Case Studies',
      'Resource Pages'
    ].slice(0, 2 + (domainHash % 4)); // 2-5 categories
    
    // Generate sample pages
    const samplePages = [];
    for (let i = 0; i < 5; i++) {
      samplePages.push({
        url: `${competitor.url}/sample-page-${i + 1}`,
        title: `Sample Page ${i + 1} - ${competitor.domain}`,
        wordCount: averageWordCount - 200 + ((domainHash + i) % 400), // averageWordCount ± 200
        topKeywords: [
          `sample-keyword-${i}-1`,
          `sample-keyword-${i}-2`,
          `sample-keyword-${i}-3`
        ]
      });
    }
    
    return {
      pageCount,
      averageWordCount,
      contentCategories,
      samplePages
    };
  }
  
  /**
   * Get social media profiles for a competitor
   * 
   * @param {Object} competitor - Competitor data
   * @returns {Promise<Object>} - Social media data
   * @private
   */
  async _getSocialMediaProfiles(competitor) {
    // In a real implementation, this would find actual social profiles
    // For now, we'll simulate this data
    
    const domainHash = this._simpleHash(competitor.domain);
    
    // Determine which platforms to include
    const platforms = [];
    if (domainHash % 2 === 0) platforms.push('twitter');
    if (domainHash % 3 === 0) platforms.push('facebook');
    if (domainHash % 5 === 0) platforms.push('linkedin');
    if (domainHash % 7 === 0) platforms.push('instagram');
    if (domainHash % 11 === 0) platforms.push('youtube');
    
    // Ensure at least one platform
    if (platforms.length === 0) {
      platforms.push('twitter');
    }
    
    // Generate profiles
    const profiles = platforms.map(platform => {
      const followerBase = 1000 + (domainHash % 9000); // 1,000-9,999
      const multiplier = platform === 'facebook' ? 100 : 
                         platform === 'instagram' ? 50 :
                         platform === 'youtube' ? 10 : 1;
      
      return {
        platform,
        url: `https://${platform}.com/${competitor.domain.replace(/\./g, '_')}`,
        followers: followerBase * multiplier,
        engagement: 1 + (domainHash % 10), // 1-10%
        lastUpdated: new Date(Date.now() - (domainHash % 30) * 86400000) // 0-29 days ago
      };
    });
    
    // Calculate total followers
    const totalFollowers = profiles.reduce(
      (sum, profile) => sum + profile.followers, 
      0
    );
    
    return {
      profiles,
      totalFollowers
    };
  }
  
  /**
   * Get technologies used by a competitor
   * 
   * @param {Object} competitor - Competitor data
   * @returns {Promise<Array<Object>>} - Technologies
   * @private
   */
  async _getTechnologies(competitor) {
    // In a real implementation, this would detect actual technologies
    // For now, we'll simulate this data
    
    const domainHash = this._simpleHash(competitor.domain);
    
    // Define potential technology categories and options
    const techCategories = {
      'CMS': ['WordPress', 'Drupal', 'Joomla', 'Shopify', 'Magento', 'Wix'],
      'JavaScript Frameworks': ['React', 'Angular', 'Vue.js', 'jQuery', 'Next.js'],
      'Analytics': ['Google Analytics', 'Adobe Analytics', 'Hotjar', 'Matomo'],
      'Advertising': ['Google Ads', 'Facebook Pixel', 'Twitter Ads'],
      'Tag Management': ['Google Tag Manager', 'Tealium', 'Adobe Tag Manager'],
      'Hosting': ['AWS', 'GCP', 'Azure', 'Cloudflare', 'Netlify', 'Vercel']
    };
    
    // Select random technologies based on domain hash
    const technologies = [];
    
    for (const [category, options] of Object.entries(techCategories)) {
      // Determine if this category should be included
      if ((domainHash + technologies.length) % 3 === 0) {
        const optionIndex = (domainHash + technologies.length) % options.length;
        const technology = options[optionIndex];
        
        technologies.push({
          category,
          name: technology,
          url: `https://example.com/tech/${technology.toLowerCase().replace(/\s+/g, '-')}`
        });
      }
    }
    
    return technologies;
  }
  
  /**
   * Get SEO data for a competitor
   * 
   * @param {Object} competitor - Competitor data
   * @returns {Promise<Object>} - SEO data
   * @private
   */
  async _getSeoData(competitor) {
    // In a real implementation, this would analyze actual SEO elements
    // For now, we'll simulate this data
    
    const domainHash = this._simpleHash(competitor.domain);
    
    // Title tags data
    const titleAvgLength = 40 + (domainHash % 40); // 40-79 characters
    const titleAvgKeywords = 2 + (domainHash % 4); // 2-5 keywords
    
    const titleExamples = [];
    for (let i = 0; i < 3; i++) {
      titleExamples.push({
        url: `${competitor.url}/page-${i + 1}`,
        title: `Example Title ${i + 1} for ${competitor.domain} | Keywords Here`
      });
    }
    
    // Meta descriptions data
    const descAvgLength = 120 + (domainHash % 80); // 120-199 characters
    const descAvgKeywords = 3 + (domainHash % 4); // 3-6 keywords
    
    const descExamples = [];
    for (let i = 0; i < 3; i++) {
      descExamples.push({
        url: `${competitor.url}/page-${i + 1}`,
        description: `This is an example meta description ${i + 1} for ${competitor.domain}. It contains various keywords and calls-to-action to encourage clicks from search results.`
      });
    }
    
    // Heading structure data
    const h1PerPage = 1 + (domainHash % 2 === 0 ? 0 : 1); // Either 1 or 2
    const h2PerPage = 2 + (domainHash % 4); // 2-5
    
    const headingExamples = [];
    for (let i = 0; i < 3; i++) {
      headingExamples.push({
        url: `${competitor.url}/page-${i + 1}`,
        h1: `Main Heading for Page ${i + 1}`,
        h2s: [
          `Subheading 1 for Page ${i + 1}`,
          `Subheading 2 for Page ${i + 1}`,
          `Subheading 3 for Page ${i + 1}`
        ].slice(0, h2PerPage)
      });
    }
    
    return {
      titleTags: {
        average: {
          length: titleAvgLength,
          keywords: titleAvgKeywords
        },
        examples: titleExamples
      },
      metaDescriptions: {
        average: {
          length: descAvgLength,
          keywords: descAvgKeywords
        },
        examples: descExamples
      },
      headingStructure: {
        averageH1PerPage: h1PerPage,
        averageH2PerPage: h2PerPage,
        examples: headingExamples
      }
    };
  }
  
  /**
   * Get performance data for a competitor
   * 
   * @param {Object} competitor - Competitor data
   * @returns {Promise<Object>} - Performance data
   * @private
   */
  async _getPerformanceData(competitor) {
    // In a real implementation, this would measure actual performance
    // For now, we'll simulate this data
    
    const domainHash = this._simpleHash(competitor.domain);
    
    return {
      coreWebVitals: {
        lcp: 1.5 + (domainHash % 40) / 10, // 1.5-5.5 seconds
        fid: 50 + (domainHash % 250), // 50-299 milliseconds
        cls: 0.05 + (domainHash % 30) / 100 // 0.05-0.34
      },
      pagespeed: {
        mobile: 50 + (domainHash % 50), // 50-99
        desktop: 60 + (domainHash % 40) // 60-99
      },
      serverResponse: {
        ttfb: 200 + (domainHash % 800) // 200-999 milliseconds
      }
    };
  }
  
  /**
   * Simulate traffic estimate (for development purposes)
   * 
   * @param {String} domain - Domain to simulate traffic for
   * @returns {Number} - Simulated monthly traffic
   * @private
   */
  _simulateTrafficEstimate(domain) {
    const domainHash = this._simpleHash(domain);
    const baseTraffic = 1000 + (domainHash % 9000); // 1,000-9,999 
    const multiplier = 10 ** (domainHash % 4); // 1, 10, 100, or 1000
    return baseTraffic * multiplier;
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
}

module.exports = ProfileGenerator;
