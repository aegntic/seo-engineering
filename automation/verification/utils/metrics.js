/**
 * Metrics Utility
 * 
 * Provides functions for measuring various SEO and performance metrics
 * used by the verification system to compare before and after states.
 */

const { chromium } = require('playwright');
const logger = require('../../common/logger');

/**
 * Measure performance metrics for a URL
 * 
 * @param {string} url - The URL to measure
 * @param {Object} options - Measurement options
 * @returns {Promise<Object>} - Performance metrics
 */
async function measurePerformance(url, options = {}) {
  logger.debug(`Measuring performance for URL: ${url}`);
  
  const device = options.device || 'desktop';
  const browser = await chromium.launch();
  
  try {
    // Create context with appropriate viewport
    const context = await browser.newContext({
      viewport: device === 'mobile' 
        ? { width: 375, height: 667 } 
        : { width: 1280, height: 800 },
      userAgent: device === 'mobile'
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1'
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    
    // Create page and enable metrics
    const page = await context.newPage();
    
    // Set up performance metrics collection
    let firstContentfulPaint = 0;
    let largestContentfulPaint = 0;
    let cumulativeLayoutShift = 0;
    let totalBlockingTime = 0;
    let loadTime = 0;
    let resourceSize = 0;
    let requestCount = 0;
    
    // Track requests
    page.on('request', request => {
      requestCount++;
    });
    
    // Track response sizes
    page.on('response', async response => {
      const headers = response.headers();
      const contentLength = headers['content-length'];
      
      if (contentLength) {
        resourceSize += parseInt(contentLength, 10);
      } else {
        try {
          // If content-length header is not available, try to get body size
          const buffer = await response.body().catch(() => null);
          if (buffer) {
            resourceSize += buffer.length;
          }
        } catch (e) {
          // Ignore errors when trying to get response body
        }
      }
    });
    
    // Performance metrics via CDP (Chrome DevTools Protocol)
    await page.evaluate(() => {
      window.performanceMetrics = {};
      
      // First Contentful Paint
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            window.performanceMetrics.fcp = entry.startTime;
          }
        }
      }).observe({ type: 'paint', buffered: true });
      
      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        window.performanceMetrics.lcp = lastEntry ? lastEntry.startTime : 0;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      
      // Cumulative Layout Shift
      let cumulativeLayoutShift = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            cumulativeLayoutShift += entry.value;
          }
        }
        window.performanceMetrics.cls = cumulativeLayoutShift;
      }).observe({ type: 'layout-shift', buffered: true });
      
      // Total Blocking Time (approximation)
      let totalBlockingTime = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.duration > 50) { // Long tasks are > 50ms
            totalBlockingTime += entry.duration - 50;
          }
        }
        window.performanceMetrics.tbt = totalBlockingTime;
      }).observe({ type: 'longtask', buffered: true });
    });
    
    // Record navigation start time
    const startTime = Date.now();
    
    // Navigate to the URL
    const response = await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: options.timeout || 30000
    });
    
    // Record page load time
    loadTime = Date.now() - startTime;
    
    // Wait for metrics to be collected
    await page.waitForTimeout(1000);
    
    // Extract collected metrics
    const metrics = await page.evaluate(() => window.performanceMetrics);
    
    firstContentfulPaint = metrics.fcp || 0;
    largestContentfulPaint = metrics.lcp || 0;
    cumulativeLayoutShift = metrics.cls || 0;
    totalBlockingTime = metrics.tbt || 0;
    
    return {
      url,
      device,
      loadTime,
      firstContentfulPaint,
      largestContentfulPaint,
      cumulativeLayoutShift,
      totalBlockingTime,
      resourceSize,
      requestCount,
      statusCode: response.status(),
      headers: response.headers()
    };
    
  } finally {
    await browser.close();
  }
}

/**
 * Get SEO metrics for a specific element
 * 
 * @param {string} selector - CSS selector for the element
 * @param {string} fixType - Type of fix
 * @returns {Object} - Element metrics
 */
function getMetricsForElement(selector, fixType) {
  // This is a placeholder - in a real implementation, this would return
  // different metrics based on the selector and fix type
  
  // Example metrics for different fix types
  switch (fixType) {
    case 'meta-tags':
      return {
        exists: true,
        content: 'Example content',
        length: 15
      };
      
    case 'image-optimization':
      return {
        exists: true,
        size: 45000, // bytes
        width: 800,
        height: 600,
        hasAlt: true,
        format: 'webp'
      };
      
    case 'header-structure':
      return {
        exists: true,
        level: parseInt(selector.replace(/[^\d]/g, ''), 10) || 1,
        content: 'Example header',
        wordCount: 2
      };
      
    default:
      return {
        exists: true
      };
  }
}

/**
 * Measure SEO metrics for a page
 * 
 * @param {string} url - The URL to measure
 * @param {Object} options - Measurement options
 * @returns {Promise<Object>} - SEO metrics
 */
async function measureSeoMetrics(url, options = {}) {
  logger.debug(`Measuring SEO metrics for URL: ${url}`);
  
  const browser = await chromium.launch();
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to the URL
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: options.timeout || 30000
    });
    
    // Extract meta tags
    const metaTags = await page.evaluate(() => {
      const tags = {};
      
      // Title
      tags.title = document.title;
      
      // Meta description
      const descElement = document.querySelector('meta[name="description"]');
      tags.description = descElement ? descElement.getAttribute('content') : null;
      
      // Meta keywords
      const keywordsElement = document.querySelector('meta[name="keywords"]');
      tags.keywords = keywordsElement ? keywordsElement.getAttribute('content') : null;
      
      // Canonical URL
      const canonicalElement = document.querySelector('link[rel="canonical"]');
      tags.canonical = canonicalElement ? canonicalElement.getAttribute('href') : null;
      
      // Open Graph tags
      tags.og = {};
      document.querySelectorAll('meta[property^="og:"]').forEach(el => {
        const property = el.getAttribute('property').replace('og:', '');
        tags.og[property] = el.getAttribute('content');
      });
      
      // Twitter tags
      tags.twitter = {};
      document.querySelectorAll('meta[name^="twitter:"]').forEach(el => {
        const name = el.getAttribute('name').replace('twitter:', '');
        tags.twitter[name] = el.getAttribute('content');
      });
      
      return tags;
    });
    
    // Extract headings
    const headings = await page.evaluate(() => {
      const result = {};
      
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
        const elements = Array.from(document.querySelectorAll(tag));
        result[tag] = elements.map(el => ({
          text: el.textContent.trim(),
          wordCount: el.textContent.trim().split(/\s+/).length
        }));
      });
      
      return result;
    });
    
    // Extract images
    const images = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt'),
        width: img.width,
        height: img.height,
        hasAlt: img.hasAttribute('alt') && img.getAttribute('alt') !== '',
        loading: img.getAttribute('loading'),
        isLazy: img.getAttribute('loading') === 'lazy'
      }));
    });
    
    // Extract schema markup
    const schema = await page.evaluate(() => {
      const schemas = [];
      
      document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
        try {
          const parsed = JSON.parse(script.textContent);
          schemas.push(parsed);
        } catch (e) {
          // Ignore parsing errors
        }
      });
      
      return schemas;
    });
    
    return {
      url,
      metaTags,
      headings,
      images,
      schema
    };
    
  } finally {
    await browser.close();
  }
}

/**
 * Calculate overall SEO score based on various metrics
 * 
 * @param {Object} metrics - Collected SEO metrics
 * @returns {number} - SEO score (0-100)
 */
function calculateSeoScore(metrics) {
  let score = 0;
  let totalWeight = 0;
  
  // Scoring functions for different metric types
  const scoreFunctions = {
    // Meta tags scoring (max 25 points)
    metaTags: (metrics) => {
      let metaScore = 0;
      const weight = 25;
      
      // Title exists and has good length (50-60 chars)
      if (metrics.metaTags.title) {
        metaScore += 5;
        const titleLength = metrics.metaTags.title.length;
        if (titleLength >= 50 && titleLength <= 60) {
          metaScore += 5;
        } else if (titleLength >= 40 && titleLength <= 70) {
          metaScore += 3;
        }
      }
      
      // Description exists and has good length (120-158 chars)
      if (metrics.metaTags.description) {
        metaScore += 5;
        const descLength = metrics.metaTags.description.length;
        if (descLength >= 120 && descLength <= 158) {
          metaScore += 5;
        } else if (descLength >= 100 && descLength <= 180) {
          metaScore += 3;
        }
      }
      
      // Canonical URL exists
      if (metrics.metaTags.canonical) {
        metaScore += 5;
      }
      
      // Open Graph tags exist
      if (Object.keys(metrics.metaTags.og).length > 0) {
        metaScore += 2;
      }
      
      // Return weighted score
      return { score: metaScore, weight };
    },
    
    // Headings scoring (max 20 points)
    headings: (metrics) => {
      let headingScore = 0;
      const weight = 20;
      
      // H1 exists and is unique
      if (metrics.headings.h1 && metrics.headings.h1.length === 1) {
        headingScore += 10;
      } else if (metrics.headings.h1 && metrics.headings.h1.length > 1) {
        headingScore += 5; // Multiple H1s - not ideal
      }
      
      // H2s exist
      if (metrics.headings.h2 && metrics.headings.h2.length > 0) {
        headingScore += 5;
      }
      
      // Heading hierarchy is correct (no skipping levels)
      const hasH1 = metrics.headings.h1 && metrics.headings.h1.length > 0;
      const hasH2 = metrics.headings.h2 && metrics.headings.h2.length > 0;
      const hasH3 = metrics.headings.h3 && metrics.headings.h3.length > 0;
      const hasH4 = metrics.headings.h4 && metrics.headings.h4.length > 0;
      const hasH5 = metrics.headings.h5 && metrics.headings.h5.length > 0;
      
      let hierarchyCorrect = true;
      
      if (!hasH1 && (hasH2 || hasH3 || hasH4 || hasH5)) {
        hierarchyCorrect = false;
      } else if (!hasH2 && (hasH3 || hasH4 || hasH5)) {
        hierarchyCorrect = false;
      } else if (!hasH3 && (hasH4 || hasH5)) {
        hierarchyCorrect = false;
      } else if (!hasH4 && hasH5) {
        hierarchyCorrect = false;
      }
      
      if (hierarchyCorrect) {
        headingScore += 5;
      }
      
      // Return weighted score
      return { score: headingScore, weight };
    },
    
    // Images scoring (max 20 points)
    images: (metrics) => {
      let imageScore = 0;
      const weight = 20;
      
      if (metrics.images.length === 0) {
        return { score: 0, weight: 0 }; // No images, so no weight
      }
      
      // Calculate percentage of images with alt text
      const totalImages = metrics.images.length;
      const imagesWithAlt = metrics.images.filter(img => img.hasAlt).length;
      const altTextPercentage = (imagesWithAlt / totalImages) * 100;
      
      // Score based on alt text percentage
      if (altTextPercentage === 100) {
        imageScore += 10;
      } else if (altTextPercentage >= 80) {
        imageScore += 8;
      } else if (altTextPercentage >= 50) {
        imageScore += 5;
      } else if (altTextPercentage > 0) {
        imageScore += 2;
      }
      
      // Check for lazy loading
      const lazyLoadedImages = metrics.images.filter(img => img.isLazy).length;
      const lazyLoadPercentage = (lazyLoadedImages / totalImages) * 100;
      
      if (lazyLoadPercentage >= 80) {
        imageScore += 10;
      } else if (lazyLoadPercentage >= 50) {
        imageScore += 5;
      } else if (lazyLoadPercentage > 0) {
        imageScore += 2;
      }
      
      // Return weighted score
      return { score: imageScore, weight };
    },
    
    // Schema scoring (max 15 points)
    schema: (metrics) => {
      let schemaScore = 0;
      const weight = 15;
      
      // Schema exists
      if (metrics.schema && metrics.schema.length > 0) {
        schemaScore += 10;
        
        // Check for different schema types
        const schemaTypes = new Set();
        metrics.schema.forEach(schema => {
          if (schema['@type']) {
            schemaTypes.add(schema['@type']);
          }
        });
        
        if (schemaTypes.size > 1) {
          schemaScore += 5; // Multiple schema types
        }
      }
      
      // Return weighted score
      return { score: schemaScore, weight };
    },
    
    // Add more scoring functions as needed...
  };
  
  // Calculate scores for each component
  Object.entries(scoreFunctions).forEach(([key, fn]) => {
    const result = fn(metrics);
    score += result.score;
    totalWeight += result.weight;
  });
  
  // Normalize to 0-100 scale
  return totalWeight > 0 ? (score / totalWeight) * 100 : 0;
}

module.exports = {
  measurePerformance,
  measureSeoMetrics,
  getMetricsForElement,
  calculateSeoScore
};
