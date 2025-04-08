/**
 * SEO.engineering Crawler Configuration
 * 
 * This file defines the configuration options for the optimized crawler module.
 * It supports various performance optimizations for handling large websites.
 */

class CrawlerConfig {
  constructor(options = {}) {
    // Concurrency settings
    this.maxConcurrency = options.maxConcurrency || 5; // Default concurrent pages
    this.maxRequestsPerSecond = options.maxRequestsPerSecond || 10; // Rate limiting
    
    // Resource prioritization
    this.resourcePriorities = options.resourcePriorities || {
      document: 1,      // HTML documents (highest priority)
      script: 0.8,      // JavaScript files
      stylesheet: 0.8,  // CSS files
      image: 0.5,       // Images
      media: 0.3,       // Media files
      font: 0.3,        // Font files
      other: 0.2        // Other resources (lowest priority)
    };
    
    // Caching configuration
    this.enableCaching = options.enableCaching !== undefined ? options.enableCaching : true;
    this.cacheDirectory = options.cacheDirectory || './cache';
    this.cacheTTL = options.cacheTTL || 86400; // 24 hours in seconds
    
    // Memory optimization
    this.maxMemoryUsage = options.maxMemoryUsage || 2048; // MB
    this.pageCloseThreshold = options.pageCloseThreshold || 20; // Close page after this many requests
    
    // Incremental crawling
    this.enableIncremental = options.enableIncremental !== undefined ? options.enableIncremental : false;
    this.incrementalDirectory = options.incrementalDirectory || './incremental';
    this.incrementalComparisonStrategy = options.incrementalComparisonStrategy || 'lastModified'; // or 'etag', 'contentHash'
    
    // Timeout settings
    this.navigationTimeout = options.navigationTimeout || 30000; // 30 seconds
    this.requestTimeout = options.requestTimeout || 15000; // 15 seconds
    
    // URL filtering
    this.urlIncludePatterns = options.urlIncludePatterns || [];
    this.urlExcludePatterns = options.urlExcludePatterns || [];
    
    // Depth settings
    this.maxDepth = options.maxDepth || 10; // Maximum crawl depth
  }
  
  /**
   * Create a configuration optimized for very large sites (100K+ pages)
   * @returns {CrawlerConfig} Configuration for large sites
   */
  static forLargeSites() {
    return new CrawlerConfig({
      maxConcurrency: 20,
      maxRequestsPerSecond: 50,
      enableCaching: true,
      cacheTTL: 43200, // 12 hours
      maxMemoryUsage: 4096, // 4GB
      pageCloseThreshold: 10,
      enableIncremental: true,
      maxDepth: 20
    });
  }
  
  /**
   * Create a configuration optimized for medium sites (10K-100K pages)
   * @returns {CrawlerConfig} Configuration for medium sites
   */
  static forMediumSites() {
    return new CrawlerConfig({
      maxConcurrency: 10,
      maxRequestsPerSecond: 30,
      enableCaching: true,
      maxMemoryUsage: 2048, // 2GB
      pageCloseThreshold: 15,
      enableIncremental: true,
      maxDepth: 15
    });
  }
  
  /**
   * Create a configuration optimized for small sites (<10K pages)
   * @returns {CrawlerConfig} Configuration for small sites
   */
  static forSmallSites() {
    return new CrawlerConfig({
      maxConcurrency: 5,
      maxRequestsPerSecond: 15,
      enableCaching: true,
      maxMemoryUsage: 1024, // 1GB
      pageCloseThreshold: 25,
      enableIncremental: false,
      maxDepth: 10
    });
  }
  
  /**
   * Validate the configuration values
   * @returns {boolean} True if configuration is valid
   * @throws {Error} If configuration is invalid
   */
  validate() {
    if (this.maxConcurrency <= 0) throw new Error('maxConcurrency must be greater than 0');
    if (this.maxRequestsPerSecond <= 0) throw new Error('maxRequestsPerSecond must be greater than 0');
    if (this.maxMemoryUsage <= 0) throw new Error('maxMemoryUsage must be greater than 0');
    if (this.cacheTTL < 0) throw new Error('cacheTTL must be greater than or equal to 0');
    return true;
  }
}

module.exports = CrawlerConfig;