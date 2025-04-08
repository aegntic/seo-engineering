/**
 * SEO.engineering Optimized Crawler
 * 
 * This is the main crawler implementation with performance optimizations
 * for handling large websites efficiently.
 */

const { chromium } = require('playwright');
const path = require('path');
const os = require('os');
const CrawlerConfig = require('./crawlerConfig');
const CacheManager = require('./cacheManager');
const IncrementalCrawler = require('./incrementalCrawler');
const EventEmitter = require('events');
const crypto = require('crypto');
const URL = require('url').URL;

class OptimizedCrawler extends EventEmitter {
  /**
   * Create a new optimized crawler
   * @param {Object} options Crawler configuration options
   */
  constructor(options = {}) {
    super();
    
    // Initialize configuration
    this.config = options.config || new CrawlerConfig();
    this.config.validate();
    
    // Initialize components
    this.cacheManager = new CacheManager({
      cacheDirectory: this.config.cacheDirectory,
      cacheTTL: this.config.cacheTTL,
      enabled: this.config.enableCaching
    });
    
    this.incrementalCrawler = new IncrementalCrawler({
      enabled: this.config.enableIncremental,
      incrementalDirectory: this.config.incrementalDirectory,
      comparisonStrategy: this.config.incrementalComparisonStrategy
    });
    
    // Tracking variables
    this.urlQueue = [];
    this.crawledUrls = new Set();
    this.inProgress = new Set();
    this.urlData = {};
    this.pageCount = 0;
    this.startTime = null;
    this.running = false;
    this.browser = null;
    
    // Rate limiting
    this.lastRequestTime = Date.now();
    this.requestCount = 0;
    
    // Memory monitoring
    this.memoryCheckInterval = null;
    
    // Stats
    this.stats = {
      pagesCrawled: 0,
      urlsDiscovered: 0,
      totalErrors: 0,
      startTime: null,
      endTime: null,
      duration: null
    };
  }

  /**
   * Generate a site ID from the base URL
   * @param {string} baseUrl The base URL of the site
   * @returns {string} Site ID
   */
  generateSiteId(baseUrl) {
    const url = new URL(baseUrl);
    return crypto.createHash('md5').update(url.hostname).digest('hex');
  }

  /**
   * Initialize the crawler
   */
  async initialize() {
    // Initialize cache
    await this.cacheManager.initialize();
    
    // Launch browser
    this.browser = await chromium.launch({
      headless: true
    });
    
    console.log('Crawler initialized successfully');
  }

  /**
   * Start crawling a website
   * @param {string} baseUrl The URL to start crawling from
   * @param {Object} options Additional crawl options
   * @returns {Object} Crawl results
   */
  async crawl(baseUrl, options = {}) {
    if (this.running) {
      throw new Error('Crawler is already running');
    }
    
    this.running = true;
    this.startTime = Date.now();
    this.stats.startTime = new Date().toISOString();
    
    try {
      // Make sure we're initialized
      if (!this.browser) {
        await this.initialize();
      }
      
      // Normalize baseUrl
      baseUrl = this.normalizeUrl(baseUrl);
      const siteId = this.generateSiteId(baseUrl);
      
      // Initialize incremental crawler
      await this.incrementalCrawler.initialize(siteId);
      
      // Setup memory monitoring
      this.startMemoryMonitoring();
      
      // Add start URL to queue
      this.urlQueue.push({
        url: baseUrl,
        depth: 0,
        referrer: null
      });
      this.stats.urlsDiscovered++;
      
      // Start crawling process
      await this.processCrawlQueue();
      
      // Record stats
      this.stats.endTime = new Date().toISOString();
      this.stats.duration = Math.round((Date.now() - this.startTime) / 1000);
      
      // Save crawl data for incremental crawling
      await this.incrementalCrawler.saveCrawlData(this.urlData);
      
      // Combine stats
      const finalStats = {
        ...this.stats,
        cacheStats: this.cacheManager.getStats(),
        incrementalStats: this.incrementalCrawler.getStats(),
        memoryUsage: process.memoryUsage()
      };
      
      console.log(`Crawl completed: ${this.stats.pagesCrawled} pages crawled in ${this.stats.duration} seconds`);
      
      // Return crawl results
      return {
        baseUrl,
        urlData: this.urlData,
        stats: finalStats
      };
    } catch (err) {
      console.error(`Crawl failed: ${err.message}`);
      throw err;
    } finally {
      this.stopMemoryMonitoring();
      this.running = false;
    }
  }

  /**
   * Process the crawl queue with parallel execution
   */
  async processCrawlQueue() {
    const workers = [];
    
    // Start initial workers up to max concurrency
    const initialWorkerCount = Math.min(this.config.maxConcurrency, this.urlQueue.length);
    for (let i = 0; i < initialWorkerCount; i++) {
      workers.push(this.startWorker());
    }
    
    // Wait for all workers to complete
    await Promise.all(workers);
  }

  /**
   * Start a worker to process URLs from the queue
   */
  async startWorker() {
    while (this.urlQueue.length > 0 && this.running) {
      // Get the next URL from the queue
      const queueItem = this.urlQueue.shift();
      const { url, depth, referrer } = queueItem;
      
      // Skip if already crawled or in progress
      if (this.crawledUrls.has(url) || this.inProgress.has(url)) {
        continue;
      }
      
      // Mark as in progress
      this.inProgress.add(url);
      
      try {
        // Check if we should crawl based on incremental data
        const shouldCrawl = this.incrementalCrawler.shouldCrawlPage(url, {
          url,
          referrer,
          depth
        });
        
        if (shouldCrawl) {
          // Apply rate limiting
          await this.applyRateLimiting();
          
          // Process the URL
          await this.processUrl(url, depth, referrer);
        } else {
          // If we don't need to crawl, use data from previous crawl
          this.urlData[url] = this.incrementalCrawler.previousCrawlData.pages[url];
        }
      } catch (err) {
        console.error(`Error processing ${url}: ${err.message}`);
        this.stats.totalErrors++;
        this.emit('error', { url, error: err.message });
      } finally {
        // Mark as crawled and remove from in progress
        this.crawledUrls.add(url);
        this.inProgress.delete(url);
      }
    }
  }

  /**
   * Process a single URL
   * @param {string} url The URL to process
   * @param {number} depth Current crawl depth
   * @param {string} referrer URL that led to this one
   */
  async processUrl(url, depth, referrer) {
    console.log(`Processing: ${url} (depth: ${depth})`);
    
    // Check cache first
    const cachedData = await this.cacheManager.get(url);
    if (cachedData) {
      this.urlData[url] = cachedData;
      this.emit('page', { url, data: cachedData, fromCache: true });
      return;
    }
    
    // Create a new page
    const context = await this.browser.newContext();
    const page = await context.newPage();
    
    // Set timeout
    page.setDefaultNavigationTimeout(this.config.navigationTimeout);
    page.setDefaultTimeout(this.config.requestTimeout);
    
    // Set resource prioritization
    await this.setupResourcePrioritization(page);
    
    // Track page counters
    this.pageCount++;
    this.stats.pagesCrawled++;
    
    try {
      // Navigate to the URL
      const response = await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: this.config.navigationTimeout
      });
      
      // Extract page data
      const pageData = await this.extractPageData(page, url, depth, referrer, response);
      
      // Store the data
      this.urlData[url] = pageData;
      
      // Cache the result
      await this.cacheManager.set(url, pageData);
      
      // Emit page event
      this.emit('page', { url, data: pageData, fromCache: false });
      
      // If we haven't reached max depth, find links on the page
      if (depth < this.config.maxDepth) {
        await this.findLinks(page, url, depth);
      }
    } catch (err) {
      console.error(`Failed to process ${url}: ${err.message}`);
      this.stats.totalErrors++;
      this.emit('error', { url, error: err.message });
    } finally {
      // Close page to free up memory
      await page.close();
      await context.close();
      
      // If we've processed enough pages, check if we need to restart the browser
      if (this.pageCount >= this.config.pageCloseThreshold) {
        await this.restartBrowserIfNeeded();
      }
    }
  }

  /**
   * Extract data from the current page
   * @param {Page} page Playwright page object
   * @param {string} url Current URL
   * @param {number} depth Current crawl depth
   * @param {string} referrer URL that led to this one
   * @param {Response} response Playwright response object
   * @returns {Object} Extracted page data
   */
  async extractPageData(page, url, depth, referrer, response) {
    // Get basic info
    const title = await page.title();
    const metaDescription = await page.$eval('meta[name="description"]', meta => meta.content).catch(() => null);
    
    // Get headers and status
    const statusCode = response ? response.status() : null;
    const headers = response ? response.headers() : {};
    
    // Get content for hashing
    const content = await page.content();
    const contentHash = this.incrementalCrawler.createContentHash(content);
    
    // Calculate page size
    const pageSize = content.length;
    
    // Get last modified date from headers
    const lastModified = headers['last-modified'] || null;
    const etag = headers['etag'] || null;
    
    // Get all metadata
    const metadata = await this.extractMetadata(page);
    
    // Collect performance metrics
    const performanceMetrics = await this.collectPerformanceMetrics(page);
    
    // Collect technical SEO data
    const seoData = await this.extractSEOData(page);
    
    return {
      url,
      title,
      metaDescription,
      statusCode,
      contentHash,
      pageSize,
      lastModified,
      etag,
      depth,
      referrer,
      crawlDate: new Date().toISOString(),
      metadata,
      performanceMetrics,
      seoData
    };
  }

  /**
   * Extract metadata from the page
   * @param {Page} page Playwright page object
   * @returns {Object} Page metadata
   */
  async extractMetadata(page) {
    return await page.evaluate(() => {
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

  /**
   * Collect performance metrics
   * @param {Page} page Playwright page object
   * @returns {Object} Performance metrics
   */
  async collectPerformanceMetrics(page) {
    // Use Playwright's performance APIs
    const metrics = await page.evaluate(() => {
      const perfData = window.performance.timing;
      const loadTime = perfData.loadEventEnd - perfData.navigationStart;
      const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.navigationStart;
      
      return {
        loadTime,
        domContentLoaded,
        navigationStart: perfData.navigationStart,
        connectEnd: perfData.connectEnd,
        responseStart: perfData.responseStart,
        responseEnd: perfData.responseEnd,
        domInteractive: perfData.domInteractive,
        domComplete: perfData.domComplete
      };
    });
    
    return metrics;
  }

  /**
   * Extract SEO-related data from the page
   * @param {Page} page Playwright page object
   * @returns {Object} SEO data
   */
  async extractSEOData(page) {
    return await page.evaluate(() => {
      // Helper function to get inner text or null
      const textOrNull = element => element ? element.innerText.trim() : null;
      
      // Get headings
      const headings = {
        h1: [...document.querySelectorAll('h1')].map(h => h.innerText.trim()),
        h2: [...document.querySelectorAll('h2')].map(h => h.innerText.trim()),
        h3: [...document.querySelectorAll('h3')].map(h => h.innerText.trim())
      };
      
      // Get meta tags
      const metaTags = {
        title: textOrNull(document.querySelector('title')),
        description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
        robots: document.querySelector('meta[name="robots"]')?.getAttribute('content'),
        viewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content'),
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href')
      };
      
      // Get schema.org data
      const schemaOrg = [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map(script => {
          try {
            return JSON.parse(script.textContent);
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);
      
      // Get image info
      const images = [...document.querySelectorAll('img')].map(img => ({
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt') || '',
        width: img.getAttribute('width'),
        height: img.getAttribute('height'),
        loading: img.getAttribute('loading')
      }));
      
      // Get internal and external links
      const links = [...document.querySelectorAll('a[href]')].map(a => ({
        href: a.getAttribute('href'),
        text: a.innerText.trim(),
        nofollow: a.getAttribute('rel')?.includes('nofollow') || false,
        target: a.getAttribute('target')
      }));
      
      return {
        headings,
        metaTags,
        schemaOrg,
        images,
        links,
        wordCount: document.body.innerText.split(/\s+/).length,
        hasStructuredData: schemaOrg.length > 0,
        hasBreadcrumbs: document.querySelector('[itemtype*="BreadcrumbList"]') !== null
      };
    });
  }

  /**
   * Find links on the page and add them to the crawl queue
   * @param {Page} page Playwright page object
   * @param {string} currentUrl Current URL
   * @param {number} depth Current crawl depth
   */
  async findLinks(page, currentUrl, depth) {
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href]'))
        .map(a => a.href);
    });
    
    // Process each link
    const baseUrlObj = new URL(currentUrl);
    const newUrls = [];
    
    for (const link of links) {
      try {
        // Normalize the URL
        const normalizedUrl = this.normalizeUrl(link);
        
        // Skip if empty
        if (!normalizedUrl) continue;
        
        // Create URL object
        const linkUrl = new URL(normalizedUrl);
        
        // Only process links from the same domain
        if (linkUrl.hostname !== baseUrlObj.hostname) continue;
        
        // Check URL exclusion patterns
        if (this.shouldExcludeUrl(normalizedUrl)) continue;
        
        // Skip if already crawled or in queue
        if (this.crawledUrls.has(normalizedUrl) || this.inProgress.has(normalizedUrl)) continue;
        
        // Add to queue if it's a new URL
        const alreadyQueued = this.urlQueue.some(item => item.url === normalizedUrl);
        if (!alreadyQueued) {
          this.urlQueue.push({
            url: normalizedUrl,
            depth: depth + 1,
            referrer: currentUrl
          });
          newUrls.push(normalizedUrl);
          this.stats.urlsDiscovered++;
        }
      } catch (err) {
        // Skip invalid URLs
        continue;
      }
    }
    
    // Emit discovered event
    if (newUrls.length > 0) {
      this.emit('discovered', { parentUrl: currentUrl, urls: newUrls });
    }
  }

  /**
   * Apply rate limiting to avoid overwhelming the server
   */
  async applyRateLimiting() {
    const now = Date.now();
    const elapsedMs = now - this.lastRequestTime;
    const requestsPerMs = this.config.maxRequestsPerSecond / 1000;
    const minimumInterval = 1 / requestsPerMs;
    
    // If we've made too many requests too quickly, delay
    if (elapsedMs < minimumInterval) {
      const delayMs = minimumInterval - elapsedMs;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    
    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  /**
   * Setup resource prioritization
   * @param {Page} page Playwright page object
   */
  async setupResourcePrioritization(page) {
    // Set up request intercept to prioritize resources
    await page.route('**/*', route => {
      const request = route.request();
      const resourceType = request.resourceType();
      const priority = this.config.resourcePriorities[resourceType] || this.config.resourcePriorities.other;
      
      // If priority is very low, we could abort non-essential resources
      if (priority < 0.3 && resourceType !== 'document') {
        route.abort();
      } else {
        route.continue();
      }
    });
  }

  /**
   * Check if we need to restart the browser due to memory usage
   */
  async restartBrowserIfNeeded() {
    const memoryUsage = process.memoryUsage();
    const usedMemoryMB = memoryUsage.rss / (1024 * 1024);
    
    // If memory usage exceeds our threshold, restart the browser
    if (usedMemoryMB > this.config.maxMemoryUsage) {
      console.log(`Memory usage is high (${Math.round(usedMemoryMB)}MB). Restarting browser...`);
      
      // Close current browser
      await this.browser.close();
      
      // Wait for garbage collection
      global.gc && global.gc();
      
      // Launch a new browser
      this.browser = await chromium.launch({
        headless: true
      });
      
      // Reset page counter
      this.pageCount = 0;
      
      console.log('Browser restarted successfully');
    }
  }

  /**
   * Start monitoring memory usage
   */
  startMemoryMonitoring() {
    // Check memory usage every 30 seconds
    this.memoryCheckInterval = setInterval(() => {
      const memoryUsage = process.memoryUsage();
      const usedMemoryMB = memoryUsage.rss / (1024 * 1024);
      
      console.log(`Memory usage: ${Math.round(usedMemoryMB)}MB`);
      
      // Emit memory usage event
      this.emit('memory', { memoryUsage });
    }, 30000);
  }

  /**
   * Stop memory monitoring
   */
  stopMemoryMonitoring() {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
      this.memoryCheckInterval = null;
    }
  }

  /**
   * Normalize a URL by removing fragments, trailing slashes, etc.
   * @param {string} url The URL to normalize
   * @returns {string} Normalized URL
   */
  normalizeUrl(url) {
    try {
      // Parse the URL
      const urlObj = new URL(url);
      
      // Remove fragment
      urlObj.hash = '';
      
      // Generate normalized URL
      let normalizedUrl = urlObj.toString();
      
      // Remove trailing slash if not the root
      if (normalizedUrl.endsWith('/') && urlObj.pathname !== '/') {
        normalizedUrl = normalizedUrl.slice(0, -1);
      }
      
      return normalizedUrl;
    } catch (err) {
      return null;
    }
  }

  /**
   * Check if a URL should be excluded based on patterns
   * @param {string} url The URL to check
   * @returns {boolean} True if the URL should be excluded
   */
  shouldExcludeUrl(url) {
    // Check exclude patterns
    for (const pattern of this.config.urlExcludePatterns) {
      if (url.includes(pattern)) {
        return true;
      }
    }
    
    // If include patterns are specified, URL must match at least one
    if (this.config.urlIncludePatterns.length > 0) {
      return !this.config.urlIncludePatterns.some(pattern => url.includes(pattern));
    }
    
    // Default to not excluding
    return false;
  }

  /**
   * Close the crawler and release resources
   */
  async close() {
    this.running = false;
    this.stopMemoryMonitoring();
    
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    
    console.log('Crawler closed');
  }
}

module.exports = OptimizedCrawler;