/**
 * SEOAutomate Incremental Crawler
 * 
 * This module implements incremental crawling capability to avoid
 * re-crawling unchanged pages, significantly improving performance
 * for repeat scans of the same site.
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class IncrementalCrawler {
  /**
   * Create a new incremental crawler manager
   * @param {Object} options Incremental crawling configuration options
   */
  constructor(options = {}) {
    this.enabled = options.enabled !== undefined ? options.enabled : false;
    this.incrementalDirectory = options.incrementalDirectory || './incremental';
    this.comparisonStrategy = options.comparisonStrategy || 'lastModified'; // or 'etag', 'contentHash'
    this.siteDataFile = 'site-data.json';
    
    // Stats tracking
    this.stats = {
      unchanged: 0,
      changed: 0,
      new: 0,
      total: 0
    };
  }

  /**
   * Initialize the incremental crawler
   * @param {string} siteId Unique identifier for the site
   */
  async initialize(siteId) {
    if (!this.enabled) return;
    
    this.siteId = siteId;
    this.siteDirectory = path.join(this.incrementalDirectory, siteId);
    
    try {
      await fs.mkdir(this.siteDirectory, { recursive: true });
      console.log(`Incremental crawler initialized for site: ${siteId}`);
      
      // Load previous crawl data if available
      await this.loadPreviousCrawlData();
    } catch (err) {
      console.error(`Failed to initialize incremental crawler: ${err.message}`);
      throw err;
    }
  }

  /**
   * Load data from previous crawl of this site
   */
  async loadPreviousCrawlData() {
    try {
      const dataFilePath = path.join(this.siteDirectory, this.siteDataFile);
      const data = await fs.readFile(dataFilePath, 'utf8');
      this.previousCrawlData = JSON.parse(data);
      console.log(`Loaded previous crawl data with ${Object.keys(this.previousCrawlData.pages).length} pages`);
    } catch (err) {
      // If file doesn't exist, this is the first crawl
      if (err.code === 'ENOENT') {
        this.previousCrawlData = { 
          crawlDate: null,
          pages: {} 
        };
        console.log('No previous crawl data found. Starting fresh crawl.');
      } else {
        console.error(`Error loading previous crawl data: ${err.message}`);
        throw err;
      }
    }
  }

  /**
   * Save current crawl data for future comparison
   * @param {Object} crawlData Current crawl data
   */
  async saveCrawlData(crawlData) {
    if (!this.enabled) return;
    
    try {
      const dataFilePath = path.join(this.siteDirectory, this.siteDataFile);
      const data = {
        crawlDate: new Date().toISOString(),
        pages: crawlData
      };
      
      await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
      console.log(`Saved crawl data with ${Object.keys(crawlData).length} pages`);
    } catch (err) {
      console.error(`Failed to save crawl data: ${err.message}`);
    }
  }

  /**
   * Check if a page needs to be crawled based on previous crawl data
   * @param {string} url The URL to check
   * @param {Object} pageData Current page metadata
   * @returns {boolean} True if page should be crawled, false if unchanged
   */
  shouldCrawlPage(url, pageData) {
    if (!this.enabled || !this.previousCrawlData) return true;
    
    this.stats.total++;
    
    // If page wasn't crawled before, we should crawl it
    if (!this.previousCrawlData.pages[url]) {
      this.stats.new++;
      return true;
    }
    
    const previousPageData = this.previousCrawlData.pages[url];
    
    // Determine if page has changed based on comparison strategy
    let hasChanged = false;
    
    switch (this.comparisonStrategy) {
      case 'lastModified':
        hasChanged = !pageData.lastModified || !previousPageData.lastModified || 
                     pageData.lastModified !== previousPageData.lastModified;
        break;
        
      case 'etag':
        hasChanged = !pageData.etag || !previousPageData.etag || 
                     pageData.etag !== previousPageData.etag;
        break;
        
      case 'contentHash':
        hasChanged = !pageData.contentHash || !previousPageData.contentHash || 
                     pageData.contentHash !== previousPageData.contentHash;
        break;
        
      default:
        // Default to crawling the page if strategy is unknown
        hasChanged = true;
    }
    
    if (hasChanged) {
      this.stats.changed++;
    } else {
      this.stats.unchanged++;
    }
    
    return hasChanged;
  }

  /**
   * Create a content hash from page content
   * @param {string} content The page content
   * @returns {string} Content hash
   */
  createContentHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Get stats from the incremental crawler
   * @returns {Object} Incremental crawling statistics
   */
  getStats() {
    const unchangedPercent = (this.stats.unchanged / this.stats.total) * 100 || 0;
    return {
      ...this.stats,
      unchangedPercent: Math.round(unchangedPercent * 100) / 100,
      timeSaved: `Approximately ${Math.round(this.stats.unchanged * 2)} seconds`
    };
  }
}

module.exports = IncrementalCrawler;