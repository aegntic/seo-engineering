/**
 * SEOAutomate Crawler Module
 * 
 * This module provides the core functionality for crawling websites and gathering
 * technical SEO data using Playwright.
 */

const { chromium } = require('playwright');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

class SEOCrawler {
  constructor(options = {}) {
    this.options = {
      headless: true,
      slowMo: 0,
      maxPages: 100,
      maxDepth: 5,
      respectRobotsTxt: true,
      userAgent: 'SEOAutomate Crawler/1.0 (+https://seoautomate.com/bot)',
      screenshotDir: path.join(__dirname, '../data/screenshots'),
      ...options
    };
    
    this.visitedUrls = new Set();
    this.urlQueue = [];
    this.results = [];
    this.browser = null;
    this.context = null;
    this.page = null;
    this.isRobotsTxtAllowed = true;
  }

  /**
   * Initialize the crawler
   */
  async initialize() {
    try {
      // Create screenshot directory if it doesn't exist
      await fs.mkdir(this.options.screenshotDir, { recursive: true });
      
      // Launch browser
      this.browser = await chromium.launch({
        headless: this.options.headless,
        slowMo: this.options.slowMo
      });
      
      // Create context with custom user-agent
      this.context = await this.browser.newContext({
        userAgent: this.options.userAgent
      });
      
      // Create page
      this.page = await this.context.newPage();
      
      console.log('Crawler initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize crawler:', error);
      return false;
    }
  }

  /**
   * Check robots.txt to see if crawling is allowed
   * @param {string} baseUrl - The base URL of the website
   */
  async checkRobotsTxt(baseUrl) {
    if (!this.options.respectRobotsTxt) {
      return true;
    }

    try {
      await this.page.goto(`${baseUrl}/robots.txt`, { waitUntil: 'domcontentloaded' });
      const content = await this.page.content();
      
      // Simple robots.txt parsing (a more robust parser would be used in production)
      const lines = content.split('\n');
      let currentUserAgent = '*';
      let isDisallowed = false;

      for (const line of lines) {
        const trimmedLine = line.trim().toLowerCase();
        
        if (trimmedLine.startsWith('user-agent:')) {
          currentUserAgent = trimmedLine.replace('user-agent:', '').trim();
        } else if (currentUserAgent === '*' && trimmedLine.startsWith('disallow:')) {
          const disallowPath = trimmedLine.replace('disallow:', '').trim();
          if (disallowPath === '/' || disallowPath === '') {
            isDisallowed = true;
            break;
          }
        }
      }

      this.isRobotsTxtAllowed = !isDisallowed;
      console.log(`Robots.txt allows crawling: ${this.isRobotsTxtAllowed}`);
      return this.isRobotsTxtAllowed;
    } catch (error) {
      console.error('Error checking robots.txt:', error);
      // If there's an error, we'll assume it's allowed
      return true;
    }
  }

  /**
   * Extract links from the current page
   * @returns {Array} - Array of URLs
   */
  async extractLinks() {
    const hrefs = await this.page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href]'));
      return anchors.map(anchor => anchor.href);
    });

    // Filter out non-HTTP links, query parameters, anchors, etc.
    const baseUrl = new URL(this.page.url()).origin;
    const filteredLinks = hrefs
      .filter(href => {
        try {
          const url = new URL(href);
          return (
            (url.protocol === 'http:' || url.protocol === 'https:') &&
            url.hostname === new URL(baseUrl).hostname &&
            !url.pathname.includes('logout') &&
            !url.pathname.includes('delete') &&
            !url.pathname.match(/\.(jpg|jpeg|png|gif|pdf|zip|doc|docx|xls|xlsx|csv)$/i)
          );
        } catch (error) {
          return false;
        }
      })
      .map(href => {
        try {
          const url = new URL(href);
          // Remove query params for deduplication purposes
          return `${url.origin}${url.pathname}`;
        } catch (error) {
          return null;
        }
      })
      .filter(url => url !== null);

    // Deduplicate
    return [...new Set(filteredLinks)];
  }

  /**
   * Extract SEO data from the current page
   * @param {string} url - The current URL
   * @returns {Object} - Object containing SEO data
   */
  async extractSEOData(url) {
    try {
      // Take screenshot
      const urlSlug = url.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const screenshotPath = path.join(this.options.screenshotDir, `${urlSlug}.png`);
      await this.page.screenshot({ path: screenshotPath, fullPage: true });

      // Extract page title and meta description
      const title = await this.page.title();
      const description = await this.page.$eval('meta[name="description"]', meta => meta.content).catch(() => null);

      // Get HTML content for further analysis
      const html = await this.page.content();
      const $ = cheerio.load(html);

      // Extract headings
      const h1Text = $('h1').map((i, el) => $(el).text().trim()).get();
      const h2Count = $('h2').length;
      const h3Count = $('h3').length;

      // Check for canonical URL
      const canonical = $('link[rel="canonical"]').attr('href') || null;

      // Check for structured data
      const structuredData = [];
      $('script[type="application/ld+json"]').each((i, el) => {
        try {
          const data = JSON.parse($(el).html());
          structuredData.push(data);
        } catch (error) {
          // Invalid JSON
        }
      });

      // Check meta robots
      const metaRobots = $('meta[name="robots"]').attr('content') || null;

      // Check open graph tags
      const ogTitle = $('meta[property="og:title"]').attr('content') || null;
      const ogDescription = $('meta[property="og:description"]').attr('content') || null;
      const ogImage = $('meta[property="og:image"]').attr('content') || null;

      // Check Twitter card tags
      const twitterCard = $('meta[name="twitter:card"]').attr('content') || null;
      const twitterTitle = $('meta[name="twitter:title"]').attr('content') || null;
      const twitterDescription = $('meta[name="twitter:description"]').attr('content') || null;
      const twitterImage = $('meta[name="twitter:image"]').attr('content') || null;

      // Check for images without alt text
      const imagesWithoutAlt = [];
      $('img').each((i, el) => {
        const img = $(el);
        if (!img.attr('alt')) {
          imagesWithoutAlt.push({
            src: img.attr('src'),
            dimensions: {
              width: img.attr('width') || null,
              height: img.attr('height') || null
            }
          });
        }
      });

      // Check for performance metrics
      const performanceMetrics = await this.page.evaluate(() => {
        if (typeof window.performance === 'undefined' || !window.performance.timing) {
          return null;
        }

        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        const dnsTime = timing.domainLookupEnd - timing.domainLookupStart;
        const connectTime = timing.connectEnd - timing.connectStart;
        const ttfb = timing.responseStart - timing.requestStart;
        const domLoadTime = timing.domComplete - timing.domLoading;

        return {
          loadTime,
          dnsTime,
          connectTime,
          ttfb,
          domLoadTime
        };
      });

      // Calculate SEO score
      let seoScore = 100;
      const issues = [];

      // Check title
      if (!title) {
        issues.push({
          type: 'critical',
          message: 'Missing page title',
          recommendation: 'Add a descriptive page title using the <title> tag.'
        });
        seoScore -= 15;
      } else if (title.length < 10) {
        issues.push({
          type: 'warning',
          message: 'Title too short',
          recommendation: 'Make the title more descriptive (at least 10 characters).'
        });
        seoScore -= 5;
      } else if (title.length > 60) {
        issues.push({
          type: 'warning',
          message: 'Title too long',
          recommendation: 'Keep the title under 60 characters to prevent truncation in SERPs.'
        });
        seoScore -= 5;
      }

      // Check description
      if (!description) {
        issues.push({
          type: 'major',
          message: 'Missing meta description',
          recommendation: 'Add a meta description to improve click-through rates from search results.'
        });
        seoScore -= 10;
      } else if (description.length < 50) {
        issues.push({
          type: 'warning',
          message: 'Meta description too short',
          recommendation: 'Make the meta description more descriptive (at least 50 characters).'
        });
        seoScore -= 5;
      } else if (description.length > 160) {
        issues.push({
          type: 'info',
          message: 'Meta description too long',
          recommendation: 'Keep the meta description under 160 characters to prevent truncation in SERPs.'
        });
        seoScore -= 2;
      }

      // Check headings
      if (h1Text.length === 0) {
        issues.push({
          type: 'major',
          message: 'Missing H1 heading',
          recommendation: 'Add an H1 heading to clearly describe the page content.'
        });
        seoScore -= 10;
      } else if (h1Text.length > 1) {
        issues.push({
          type: 'warning',
          message: 'Multiple H1 headings',
          recommendation: 'Use only one H1 heading per page for clear content hierarchy.'
        });
        seoScore -= 5;
      }

      // Check canonical URL
      if (!canonical) {
        issues.push({
          type: 'info',
          message: 'Missing canonical URL',
          recommendation: 'Add a canonical URL to prevent duplicate content issues.'
        });
        seoScore -= 3;
      }

      // Check images
      if (imagesWithoutAlt.length > 0) {
        issues.push({
          type: 'warning',
          message: `${imagesWithoutAlt.length} images missing alt text`,
          recommendation: 'Add descriptive alt text to all images for accessibility and SEO.'
        });
        seoScore -= Math.min(10, imagesWithoutAlt.length);
      }

      // Ensure score doesn't go below 0
      seoScore = Math.max(0, seoScore);

      return {
        url,
        timestamp: new Date().toISOString(),
        title,
        description,
        canonical,
        headings: {
          h1: h1Text,
          h2Count,
          h3Count
        },
        metaTags: {
          robots: metaRobots,
          openGraph: {
            title: ogTitle,
            description: ogDescription,
            image: ogImage
          },
          twitter: {
            card: twitterCard,
            title: twitterTitle,
            description: twitterDescription,
            image: twitterImage
          }
        },
        structuredData,
        imagesWithoutAlt,
        performanceMetrics,
        screenshotPath,
        seoAnalysis: {
          score: seoScore,
          issues
        }
      };
    } catch (error) {
      console.error(`Error extracting SEO data from ${url}:`, error);
      return {
        url,
        timestamp: new Date().toISOString(),
        error: error.message,
        seoAnalysis: {
          score: 0,
          issues: [
            {
              type: 'critical',
              message: 'Error analyzing page',
              recommendation: 'Check if the page is accessible and properly formatted.'
            }
          ]
        }
      };
    }
  }

  /**
   * Crawl a single URL
   * @param {string} url - The URL to crawl
   * @param {number} depth - Current crawl depth
   */
  async crawlUrl(url, depth = 0) {
    if (this.visitedUrls.has(url) || depth > this.options.maxDepth || this.results.length >= this.options.maxPages) {
      return;
    }

    console.log(`Crawling (${depth}): ${url}`);
    this.visitedUrls.add(url);

    try {
      await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      // Extract SEO data
      const seoData = await this.extractSEOData(url);
      this.results.push(seoData);

      // If we've reached max depth, don't extract more links
      if (depth >= this.options.maxDepth) {
        return;
      }

      // Extract links for the next level
      const links = await this.extractLinks();
      for (const link of links) {
        if (!this.visitedUrls.has(link)) {
          this.urlQueue.push({ url: link, depth: depth + 1 });
        }
      }
    } catch (error) {
      console.error(`Error crawling ${url}:`, error);
      this.results.push({
        url,
        timestamp: new Date().toISOString(),
        error: error.message,
        seoAnalysis: {
          score: 0,
          issues: [
            {
              type: 'critical',
              message: 'Error accessing page',
              recommendation: 'Check if the page is accessible and properly formatted.'
            }
          ]
        }
      });
    }
  }

  /**
   * Start crawling from a given URL
   * @param {string} startUrl - The starting URL
   * @returns {Array} - Results of the crawl
   */
  async crawl(startUrl) {
    try {
      if (!this.browser) {
        await this.initialize();
      }

      // Reset state
      this.visitedUrls.clear();
      this.urlQueue = [];
      this.results = [];

      // Check robots.txt
      const baseUrl = new URL(startUrl).origin;
      const isAllowed = await this.checkRobotsTxt(baseUrl);
      
      if (!isAllowed) {
        console.warn('Crawling disallowed by robots.txt');
        return [];
      }

      // Add the starting URL to the queue
      this.urlQueue.push({ url: startUrl, depth: 0 });

      // Process the queue
      while (this.urlQueue.length > 0 && this.results.length < this.options.maxPages) {
        const { url, depth } = this.urlQueue.shift();
        await this.crawlUrl(url, depth);
      }

      console.log(`Crawling completed. Visited ${this.visitedUrls.size} pages. Found ${this.results.length} valid pages.`);
      return this.results;
    } catch (error) {
      console.error('Error during crawl:', error);
      return this.results;
    } finally {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.context = null;
        this.page = null;
      }
    }
  }

  /**
   * Save results to a MongoDB database
   * @param {string} clientId - ID of the client
   * @param {Array} results - Crawl results
   */
  async saveToDatabase(clientId, results) {
    if (!results || !results.length) {
      console.warn('No results to save');
      return;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable not set');
    }

    const client = new MongoClient(uri);
    
    try {
      await client.connect();
      const database = client.db('seoautomate');
      const collection = database.collection('scan_results');
      
      // Add clientId to each result
      const resultsWithClientId = results.map(result => ({
        ...result,
        clientId,
        createdAt: new Date()
      }));
      
      const result = await collection.insertMany(resultsWithClientId);
      console.log(`Saved ${result.insertedCount} documents to database`);
      return result.insertedCount;
    } catch (error) {
      console.error('Error saving results to database:', error);
      throw error;
    } finally {
      await client.close();
    }
  }

  /**
   * Save results to a JSON file
   * @param {string} filePath - Path to save the file
   * @param {Array} results - Crawl results
   */
  async saveToFile(filePath, results) {
    if (!results || !results.length) {
      console.warn('No results to save');
      return;
    }

    try {
      await fs.writeFile(filePath, JSON.stringify(results, null, 2));
      console.log(`Results saved to ${filePath}`);
      return true;
    } catch (error) {
      console.error('Error saving results to file:', error);
      throw error;
    }
  }

  /**
   * Close the browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;
      console.log('Browser closed');
    }
  }
}

module.exports = SEOCrawler;