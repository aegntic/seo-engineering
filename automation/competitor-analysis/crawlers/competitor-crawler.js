/**
 * Competitor Analysis Crawler
 * 
 * This crawler specializes in analyzing competitor websites to extract
 * SEO-relevant data for comparison and gap analysis.
 */

const playwright = require('playwright');
const { EventEmitter } = require('events');
const { URL } = require('url');
const path = require('path');
const fs = require('fs').promises;
const { createConfig } = require('../config/crawler-config');
const logger = require('../utils/logger');

class CompetitorCrawler extends EventEmitter {
  /**
   * Create a new competitor crawler
   * @param {Object} options Configuration options
   */
  constructor(options = {}) {
    super();
    
    this.config = createConfig(options);
    this.browser = null;
    this.context = null;
    this.currentUrl = null;
    this.visitedUrls = new Set();
    this.pendingUrls = new Set();
    this.urlData = {};
    this.seoData = {};
    this.performanceData = {};
    this.contentData = {};
    this.structureData = {};
    this.errors = [];
    this.isRunning = false;
    this.startTime = null;
    this.completionCallback = null;
    this.activeCrawlers = 0;
    this.competitors = [];
    this.outputDir = options.outputDir || path.join(process.cwd(), 'competitor-data');
  }

  /**
   * Initialize the crawler
   */
  async initialize() {
    try {
      logger.info('Initializing competitor crawler');
      
      // Create output directory if it doesn't exist
      try {
        await fs.mkdir(this.outputDir, { recursive: true });
      } catch (err) {
        logger.error(`Failed to create output directory: ${err.message}`);
      }
      
      // Launch the browser
      this.browser = await playwright.chromium.launch({
        headless: true
      });
      
      // Create a browser context
      this.context = await this.browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true
      });
      
      // Set up event listeners for browser events
      this.context.on('request', this._handleRequest.bind(this));
      this.context.on('response', this._handleResponse.bind(this));
      
      logger.info('Competitor crawler initialized successfully');
    } catch (err) {
      logger.error(`Failed to initialize crawler: ${err.message}`);
      throw err;
    }
  }

  /**
   * Analyze a list of competitor websites
   * @param {Array} competitors List of competitor URLs to analyze
   * @param {Object} options Additional options for the analysis
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeCompetitors(competitors, options = {}) {
    if (!this.browser) {
      await this.initialize();
    }
    
    if (this.isRunning) {
      throw new Error('Crawler is already running');
    }
    
    this.isRunning = true;
    this.startTime = Date.now();
    this.competitors = Array.isArray(competitors) ? competitors : [competitors];
    this.emit('start', { competitors: this.competitors });
    
    logger.info(`Starting analysis of ${this.competitors.length} competitors`);
    
    try {
      // Process each competitor
      const results = {};
      
      for (const competitor of this.competitors) {
        logger.info(`Analyzing competitor: ${competitor}`);
        this.emit('competitor:start', { url: competitor });
        
        try {
          // Reset state for this competitor
          this.visitedUrls.clear();
          this.pendingUrls.clear();
          this.urlData = {};
          
          // Start crawling the competitor site
          const competitorData = await this._crawlCompetitor(competitor, options);
          results[competitor] = competitorData;
          
          this.emit('competitor:complete', { 
            url: competitor, 
            success: true,
            pages: Object.keys(competitorData.pages).length,
            duration: Date.now() - this.startTime
          });
          
          // Save competitor data to file
          const filename = this._getCompetitorFilename(competitor);
          await this._saveCompetitorData(filename, competitorData);
          
          logger.info(`Completed analysis of competitor: ${competitor}`);
        } catch (err) {
          logger.error(`Failed to analyze competitor ${competitor}: ${err.message}`);
          
          this.emit('competitor:complete', { 
            url: competitor, 
            success: false,
            error: err.message,
            duration: Date.now() - this.startTime
          });
          
          results[competitor] = { error: err.message };
        }
      }
      
      const duration = Date.now() - this.startTime;
      logger.info(`Completed analysis of all competitors in ${duration}ms`);
      
      this.emit('complete', {
        success: true,
        competitors: this.competitors.length,
        duration
      });
      
      this.isRunning = false;
      return results;
    } catch (err) {
      this.isRunning = false;
      logger.error(`Competitor analysis failed: ${err.message}`);
      
      this.emit('complete', {
        success: false,
        error: err.message,
        duration: Date.now() - this.startTime
      });
      
      throw err;
    }
  }

  /**
   * Crawl a single competitor website
   * @param {string} url The URL of the competitor website
   * @param {Object} options Additional options for crawling
   * @returns {Promise<Object>} Crawl results
   * @private
   */
  async _crawlCompetitor(url, options = {}) {
    // Normalize the URL
    const baseUrl = new URL(url);
    const domain = baseUrl.hostname;
    
    // Add the homepage to the queue
    this.pendingUrls.add(url);
    
    // Initialize data structure for this competitor
    const competitorData = {
      url,
      domain,
      startTime: Date.now(),
      pages: {},
      seo: {
        metaTags: {},
        headings: {},
        internalLinks: {},
        externalLinks: {},
        images: {},
        keywords: {},
        performance: {}
      },
      summary: {}
    };
    
    // Process pages up to the configured limit
    let processedPages = 0;
    
    while (this.pendingUrls.size > 0 && processedPages < this.config.maxPagesPerCompetitor) {
      // Take a URL from the pending queue
      const currentUrl = Array.from(this.pendingUrls)[0];
      this.pendingUrls.delete(currentUrl);
      
      // Skip if already visited
      if (this.visitedUrls.has(currentUrl)) {
        continue;
      }
      
      try {
        // Create a new page
        const page = await this.context.newPage();
        
        // Set up page-level event listeners
        this._setupPageListeners(page);
        
        // Navigate to the URL
        this.emit('page:start', { url: currentUrl });
        logger.debug(`Crawling page: ${currentUrl}`);
        
        const response = await page.goto(currentUrl, {
          waitUntil: 'domcontentloaded',
          timeout: this.config.navigationTimeout
        });
        
        // Skip if not a success
        if (!response || !response.ok()) {
          logger.warn(`Failed to load ${currentUrl}: ${response ? response.status() : 'No response'}`);
          await page.close();
          continue;
        }
        
        // Mark as visited
        this.visitedUrls.add(currentUrl);
        processedPages++;
        
        // Extract data from the page
        const pageData = await this._extractPageData(page, currentUrl, domain);
        competitorData.pages[currentUrl] = pageData;
        
        // Update SEO summary data
        this._updateSeoSummary(competitorData.seo, pageData);
        
        // Find links on the page and add to pending queue if same domain
        if (this.config.extractLinks) {
          const links = await this._extractLinks(page, domain);
          
          for (const link of links.internal) {
            // Only add if not visited and not already pending
            if (!this.visitedUrls.has(link) && !this.pendingUrls.has(link)) {
              this.pendingUrls.add(link);
            }
          }
          
          // Store external links
          pageData.externalLinks = links.external;
        }
        
        // Take a screenshot if configured
        if (this.config.saveScreenshots) {
          const screenshotPath = path.join(this.outputDir, `${domain}-${processedPages}.png`);
          await page.screenshot({ path: screenshotPath, fullPage: true });
        }
        
        // Wait before next request to be polite
        await this._wait(this.config.minimumRequestInterval);
        
        // Close the page
        await page.close();
        
        this.emit('page:complete', { 
          url: currentUrl, 
          success: true,
          pageCount: processedPages 
        });
      } catch (err) {
        logger.error(`Error processing ${currentUrl}: ${err.message}`);
        this.errors.push({ url: currentUrl, error: err.message });
        
        this.emit('page:complete', { 
          url: currentUrl, 
          success: false,
          error: err.message 
        });
      }
    }
    
    // Generate summary statistics
    competitorData.summary = this._generateCompetitorSummary(competitorData);
    competitorData.endTime = Date.now();
    competitorData.duration = competitorData.endTime - competitorData.startTime;
    
    return competitorData;
  }

  /**
   * Extract relevant data from a page
   * @param {Page} page The Playwright page object
   * @param {string} url The URL of the page
   * @param {string} domain The domain of the competitor
   * @returns {Promise<Object>} The extracted data
   * @private
   */
  async _extractPageData(page, url, domain) {
    const pageData = {
      url,
      title: await page.title(),
      metadata: {},
      content: {},
      seo: {},
      performance: {},
      timestamp: Date.now()
    };
    
    // Extract meta tags
    if (this.config.extractMetadata) {
      pageData.metadata = await page.evaluate(() => {
        const metadata = {};
        const metaTags = document.querySelectorAll('meta');
        
        metaTags.forEach(tag => {
          const name = tag.getAttribute('name') || tag.getAttribute('property');
          const content = tag.getAttribute('content');
          
          if (name && content) {
            metadata[name] = content;
          }
        });
        
        return metadata;
      });
    }
    
    // Extract page content
    if (this.config.extractContentText) {
      pageData.content.text = await page.evaluate(() => {
        // Get main content (skip navigation, footer, etc)
        const main = document.querySelector('main') || document.body;
        return main.innerText;
      });
    }
    
    // Extract headings
    if (this.config.analyzeContentStructure) {
      pageData.content.headings = await page.evaluate(() => {
        const headings = {};
        
        for (let i = 1; i <= 6; i++) {
          const elements = document.querySelectorAll(`h${i}`);
          headings[`h${i}`] = Array.from(elements).map(el => el.innerText.trim());
        }
        
        return headings;
      });
    }
    
    // Extract SEO-relevant data
    if (this.config.analyzeMetaTags) {
      pageData.seo.title = await page.evaluate(() => document.title);
      pageData.seo.description = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="description"]');
        return meta ? meta.getAttribute('content') : null;
      });
      pageData.seo.keywords = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="keywords"]');
        return meta ? meta.getAttribute('content') : null;
      });
      pageData.seo.canonical = await page.evaluate(() => {
        const link = document.querySelector('link[rel="canonical"]');
        return link ? link.getAttribute('href') : null;
      });
    }
    
    // Extract schema markup
    if (this.config.analyzeSchemaMarkup) {
      pageData.seo.schemaMarkup = await page.evaluate(() => {
        const schemas = [];
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        
        scripts.forEach(script => {
          try {
            const json = JSON.parse(script.textContent);
            schemas.push(json);
          } catch (e) {
            // Invalid JSON
          }
        });
        
        return schemas;
      });
    }
    
    // Collect performance metrics if configured
    if (this.config.collectPerformanceMetrics) {
      pageData.performance = await page.evaluate(() => {
        const perfEntries = performance.getEntriesByType('navigation');
        
        if (perfEntries.length > 0) {
          const navigationEntry = perfEntries[0];
          return {
            domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime,
            load: navigationEntry.loadEventEnd - navigationEntry.startTime,
            firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || null,
            firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || null
          };
        }
        
        return {};
      });
    }
    
    // Collect Core Web Vitals if configured
    if (this.config.collectCoreWebVitals) {
      try {
        const webVitals = await page.evaluate(async () => {
          // This is a simplified version - a production version would use the web-vitals library
          // or a more comprehensive implementation
          return new Promise(resolve => {
            // Wait for LCP to be calculated
            setTimeout(() => {
              const vitals = {};
              
              // Get Largest Contentful Paint (approximate)
              const lcpEntries = performance.getEntriesByType('element');
              if (lcpEntries.length > 0) {
                vitals.lcp = lcpEntries[lcpEntries.length - 1].startTime;
              }
              
              // Simple CLS approximation
              let cls = 0;
              const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                  if (!entry.hadRecentInput) {
                    cls += entry.value;
                  }
                }
              });
              observer.observe({type: 'layout-shift', buffered: true});
              vitals.cls = cls;
              
              resolve(vitals);
            }, 3000); // Wait 3 seconds to collect metrics
          });
        });
        
        pageData.performance.webVitals = webVitals;
      } catch (err) {
        logger.warn(`Failed to collect Core Web Vitals for ${url}: ${err.message}`);
      }
    }
    
    // Analyze images
    if (this.config.extractImages) {
      pageData.images = await page.evaluate(() => {
        const images = [];
        const imgElements = document.querySelectorAll('img');
        
        imgElements.forEach(img => {
          images.push({
            src: img.src,
            alt: img.alt || '',
            width: img.width,
            height: img.height,
            hasLazyLoading: img.loading === 'lazy'
          });
        });
        
        return images;
      });
    }
    
    return pageData;
  }

  /**
   * Extract internal and external links from a page
   * @param {Page} page The Playwright page object
   * @param {string} domain The domain of the competitor
   * @returns {Promise<Object>} Object with internal and external links
   * @private
   */
  async _extractLinks(page, domain) {
    return page.evaluate(domainName => {
      const links = {
        internal: [],
        external: []
      };
      
      const linkElements = document.querySelectorAll('a[href]');
      
      linkElements.forEach(link => {
        try {
          const href = link.href;
          
          // Skip if it's not an HTTP/HTTPS URL
          if (!href.startsWith('http')) {
            return;
          }
          
          // Parse the URL
          const url = new URL(href);
          
          // Check if it's an internal or external link
          if (url.hostname === domainName || url.hostname === `www.${domainName}` || `www.${url.hostname}` === domainName) {
            // Clean the URL
            const cleanUrl = `${url.protocol}//${url.hostname}${url.pathname}`;
            links.internal.push(cleanUrl);
          } else {
            links.external.push(href);
          }
        } catch (e) {
          // Invalid URL
        }
      });
      
      return {
        internal: [...new Set(links.internal)], // Remove duplicates
        external: [...new Set(links.external)]  // Remove duplicates
      };
    }, domain);
  }

  /**
   * Update SEO summary data with page-specific data
   * @param {Object} seoSummary The SEO summary object to update
   * @param {Object} pageData The page data
   * @private
   */
  _updateSeoSummary(seoSummary, pageData) {
    // Count meta tags
    for (const [key, value] of Object.entries(pageData.metadata || {})) {
      if (!seoSummary.metaTags[key]) {
        seoSummary.metaTags[key] = 0;
      }
      seoSummary.metaTags[key]++;
    }
    
    // Count headings
    for (const [type, headings] of Object.entries(pageData.content?.headings || {})) {
      if (!seoSummary.headings[type]) {
        seoSummary.headings[type] = 0;
      }
      seoSummary.headings[type] += headings.length;
    }
    
    // Process internal links
    if (pageData.url) {
      if (!seoSummary.internalLinks[pageData.url]) {
        seoSummary.internalLinks[pageData.url] = 0;
      }
      
      // Count outgoing internal links
      if (pageData.externalLinks) {
        seoSummary.internalLinks[pageData.url] = pageData.externalLinks.length;
      }
    }
    
    // Process images
    if (pageData.images) {
      let imagesWithAlt = 0;
      let imagesWithoutAlt = 0;
      
      pageData.images.forEach(img => {
        if (img.alt && img.alt.trim()) {
          imagesWithAlt++;
        } else {
          imagesWithoutAlt++;
        }
      });
      
      if (!seoSummary.images.withAlt) seoSummary.images.withAlt = 0;
      if (!seoSummary.images.withoutAlt) seoSummary.images.withoutAlt = 0;
      
      seoSummary.images.withAlt += imagesWithAlt;
      seoSummary.images.withoutAlt += imagesWithoutAlt;
    }
    
    // Track performance metrics
    if (pageData.performance) {
      for (const [metric, value] of Object.entries(pageData.performance)) {
        if (typeof value === 'number') {
          if (!seoSummary.performance[metric]) {
            seoSummary.performance[metric] = {
              values: [],
              sum: 0,
              count: 0
            };
          }
          
          seoSummary.performance[metric].values.push(value);
          seoSummary.performance[metric].sum += value;
          seoSummary.performance[metric].count++;
        }
      }
    }
  }

  /**
   * Generate a summary of competitor analysis
   * @param {Object} competitorData The competitor data
   * @returns {Object} Summary statistics
   * @private
   */
  _generateCompetitorSummary(competitorData) {
    const summary = {
      pagesAnalyzed: Object.keys(competitorData.pages).length,
      averagePerformance: {},
      contentStats: {
        averageTitleLength: 0,
        averageDescriptionLength: 0,
        headingsDistribution: {}
      },
      seoHealth: {
        missingTitles: 0,
        missingDescriptions: 0,
        missingAltTexts: 0,
        hasSchemaMarkup: 0,
        hasCanonical: 0
      }
    };
    
    // Calculate performance averages
    for (const [metric, data] of Object.entries(competitorData.seo.performance)) {
      if (data.count > 0) {
        summary.averagePerformance[metric] = data.sum / data.count;
      }
    }
    
    // Calculate content stats
    let titleSum = 0;
    let descriptionSum = 0;
    let titleCount = 0;
    let descriptionCount = 0;
    
    // Process heading distributions
    for (const [type, count] of Object.entries(competitorData.seo.headings)) {
      summary.contentStats.headingsDistribution[type] = count;
    }
    
    // Calculate title, description, and SEO health metrics
    for (const page of Object.values(competitorData.pages)) {
      // Title length
      if (page.seo?.title) {
        titleSum += page.seo.title.length;
        titleCount++;
      } else {
        summary.seoHealth.missingTitles++;
      }
      
      // Description length
      if (page.seo?.description) {
        descriptionSum += page.seo.description.length;
        descriptionCount++;
      } else {
        summary.seoHealth.missingDescriptions++;
      }
      
      // Schema markup
      if (page.seo?.schemaMarkup && page.seo.schemaMarkup.length > 0) {
        summary.seoHealth.hasSchemaMarkup++;
      }
      
      // Canonical link
      if (page.seo?.canonical) {
        summary.seoHealth.hasCanonical++;
      }
      
      // Alt text for images
      if (page.images) {
        const imagesWithoutAlt = page.images.filter(img => !img.alt || !img.alt.trim()).length;
        summary.seoHealth.missingAltTexts += imagesWithoutAlt;
      }
    }
    
    // Calculate averages
    if (titleCount > 0) {
      summary.contentStats.averageTitleLength = titleSum / titleCount;
    }
    
    if (descriptionCount > 0) {
      summary.contentStats.averageDescriptionLength = descriptionSum / descriptionCount;
    }
    
    // Convert counts to percentages where appropriate
    if (summary.pagesAnalyzed > 0) {
      summary.seoHealth.missingTitlesPercent = (summary.seoHealth.missingTitles / summary.pagesAnalyzed) * 100;
      summary.seoHealth.missingDescriptionsPercent = (summary.seoHealth.missingDescriptions / summary.pagesAnalyzed) * 100;
      summary.seoHealth.hasSchemaMarkupPercent = (summary.seoHealth.hasSchemaMarkup / summary.pagesAnalyzed) * 100;
      summary.seoHealth.hasCanonicalPercent = (summary.seoHealth.hasCanonical / summary.pagesAnalyzed) * 100;
    }
    
    return summary;
  }

  /**
   * Set up event listeners for a page
   * @param {Page} page The Playwright page
   * @private
   */
  _setupPageListeners(page) {
    page.on('console', msg => {
      if (this.config.detailedLogging) {
        logger.debug(`Console ${msg.type()}: ${msg.text()}`);
      }
    });
    
    page.on('pageerror', err => {
      logger.warn(`Page error: ${err.message}`);
    });
  }

  /**
   * Handle request event
   * @param {Request} request The request object
   * @private
   */
  _handleRequest(request) {
    if (this.config.detailedLogging) {
      logger.debug(`Request: ${request.method()} ${request.url()}`);
    }
  }

  /**
   * Handle response event
   * @param {Response} response The response object
   * @private
   */
  _handleResponse(response) {
    if (this.config.detailedLogging) {
      logger.debug(`Response: ${response.status()} ${response.url()}`);
    }
  }

  /**
   * Wait for a specified duration
   * @param {number} ms Milliseconds to wait
   * @returns {Promise<void>}
   * @private
   */
  _wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate a filename for competitor data
   * @param {string} url The competitor URL
   * @returns {string} The filename
   * @private
   */
  _getCompetitorFilename(url) {
    try {
      const domain = new URL(url).hostname.replace(/[^a-z0-9]/gi, '-');
      return `${domain}-${Date.now()}.json`;
    } catch (err) {
      return `competitor-${Date.now()}.json`;
    }
  }

  /**
   * Save competitor data to a file
   * @param {string} filename The filename
   * @param {Object} data The data to save
   * @returns {Promise<void>}
   * @private
   */
  async _saveCompetitorData(filename, data) {
    try {
      const filePath = path.join(this.outputDir, filename);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      logger.info(`Saved competitor data to ${filePath}`);
    } catch (err) {
      logger.error(`Failed to save competitor data: ${err.message}`);
    }
  }

  /**
   * Close the crawler and release resources
   * @returns {Promise<void>}
   */
  async close() {
    if (this.browser) {
      try {
        await this.browser.close();
        this.browser = null;
        this.context = null;
        logger.info('Crawler closed successfully');
      } catch (err) {
        logger.error(`Error closing crawler: ${err.message}`);
      }
    }
  }

  /**
   * Get errors that occurred during crawling
   * @returns {Array} Array of errors
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Get statistics about the crawl
   * @returns {Object} Crawl statistics
   */
  getStats() {
    return {
      visitedUrls: this.visitedUrls.size,
      errors: this.errors.length,
      duration: this.startTime ? Date.now() - this.startTime : 0,
      competitors: this.competitors.length
    };
  }
}

module.exports = CompetitorCrawler;
