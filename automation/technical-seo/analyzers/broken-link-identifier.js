/**
 * Broken Link Identifier
 * 
 * Identifies broken internal and external links on websites and generates
 * actionable recommendations for fixing them.
 */

const { chromium } = require('playwright');
const { v4: uuidv4 } = require('uuid');
const { getUrlOrigin, isInternalLink } = require('../utils/url-helpers');
const { generateFixStrategy } = require('../utils/fix-generators');

class BrokenLinkIdentifier {
  /**
   * Identify broken links on a given URL
   * @param {string} url - The URL to analyze
   * @param {Object} options - Configuration options
   * @returns {Promise<Object>} - Broken link analysis results
   */
  static async identify(url, options = {}) {
    try {
      console.log(`Analyzing broken links for: ${url}`);
      
      // Initialize browser
      const browser = await chromium.launch({
        headless: true,
        args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
      });
      
      // Create a new context with specific device
      const context = await browser.newContext({
        userAgent: options.userAgent || 'SEOAutomate/1.0',
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
      });
      
      // Initialize results
      const results = {
        score: 100, // Start with perfect score
        issues: [],
        metrics: {
          totalLinks: 0,
          brokenLinks: 0,
          brokenInternalLinks: 0,
          brokenExternalLinks: 0,
          linksByStatusCode: {},
          linksByType: {
            internal: 0,
            external: 0
          }
        },
        brokenLinkDetails: [],
        summary: {}
      };
      
      // Set base URL and origin
      const baseUrl = url;
      const baseOrigin = getUrlOrigin(baseUrl);
      
      // Create a new page
      const page = await context.newPage();
      
      // Configure page to intercept all requests
      await page.route('**/*', async (route) => {
        const request = route.request();
        
        // Only intercept navigation requests (main frame)
        if (request.resourceType() === 'document' && request.frame() === page.mainFrame()) {
          // Record the URL we're checking
          const currentUrl = request.url();
          console.log(`Checking navigation to: ${currentUrl}`);
        }
        
        // Continue the request
        await route.continue();
      });
      
      // Navigate to the page with timeout
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: options.timeout || 30000
      });
      
      // Wait for any additional JavaScript to execute
      await page.waitForTimeout(1000);
      
      // Extract all links from the page
      const extractedLinks = await extractLinks(page, baseOrigin);
      results.metrics.totalLinks = extractedLinks.length;
      results.metrics.linksByType.internal = extractedLinks.filter(link => link.isInternal).length;
      results.metrics.linksByType.external = extractedLinks.filter(link => !link.isInternal).length;
      
      // Check each link for broken status
      const checkedLinks = await checkLinks(extractedLinks, context, options);
      
      // Process results from link checks
      processLinkResults(checkedLinks, results);
      
      // Generate issues based on broken links
      generateIssuesFromBrokenLinks(results);
      
      // Calculate score based on broken links
      calculateScore(results);
      
      // Create summary
      results.summary = {
        score: results.score,
        totalLinks: results.metrics.totalLinks,
        brokenLinks: results.metrics.brokenLinks,
        brokenLinkPercentage: results.metrics.totalLinks ? Math.round((results.metrics.brokenLinks / results.metrics.totalLinks) * 100) : 0,
        brokenInternalLinks: results.metrics.brokenInternalLinks,
        brokenExternalLinks: results.metrics.brokenExternalLinks,
        issuesCount: results.issues.length,
        recommendation: getOverallRecommendation(results)
      };
      
      // Close browser
      await browser.close();
      
      return results;
      
    } catch (error) {
      console.error(`Error identifying broken links for ${url}:`, error);
      
      // Return a graceful fallback result with error information
      return {
        score: 0,
        issues: [{
          id: uuidv4(),
          title: 'Broken Link Analysis Failed',
          description: `Could not analyze broken links due to error: ${error.message}`,
          severity: 'high',
          category: 'broken-links',
          location: url,
          recommendation: 'Check if the URL is accessible and properly formatted.'
        }],
        metrics: {
          totalLinks: 0,
          brokenLinks: 0,
          brokenInternalLinks: 0,
          brokenExternalLinks: 0,
          linksByStatusCode: {},
          linksByType: {
            internal: 0,
            external: 0
          }
        },
        brokenLinkDetails: [],
        summary: {
          score: 0,
          totalLinks: 0,
          brokenLinks: 0,
          brokenLinkPercentage: 0,
          brokenInternalLinks: 0,
          brokenExternalLinks: 0,
          issuesCount: 1,
          error: error.message,
          recommendation: 'Ensure the site is accessible and try again.'
        }
      };
    }
  }
}

/**
 * Extract all links from the page
 * @param {Page} page - Playwright page object
 * @param {string} baseOrigin - Origin of the base URL
 * @returns {Promise<Array>} - Array of extracted links
 */
async function extractLinks(page, baseOrigin) {
  // Extract all links from the page
  const links = await page.evaluate((baseOrigin) => {
    const allLinks = Array.from(document.querySelectorAll('a[href]'));
    
    return allLinks.map(link => {
      let href = link.getAttribute('href');
      
      // Clean up href
      href = href.trim();
      
      // Skip anchor links that point to the same page
      if (href.startsWith('#')) {
        return null;
      }
      
      // Skip javascript: links
      if (href.startsWith('javascript:')) {
        return null;
      }
      
      // Skip mailto: links
      if (href.startsWith('mailto:')) {
        return null;
      }
      
      // Skip tel: links
      if (href.startsWith('tel:')) {
        return null;
      }
      
      let isInternal = false;
      let absoluteUrl = href;
      
      try {
        // Handle relative URLs
        if (href.startsWith('/')) {
          absoluteUrl = baseOrigin + href;
          isInternal = true;
        } else if (!href.includes('://')) {
          // Relative path without leading slash
          absoluteUrl = new URL(href, window.location.href).href;
          isInternal = true;
        } else {
          // Absolute URL - check if it's on the same domain
          const linkOrigin = new URL(href).origin;
          isInternal = (linkOrigin === baseOrigin);
        }
      } catch (e) {
        // Invalid URL format
        return null;
      }
      
      return {
        href: absoluteUrl,
        text: link.textContent.trim() || 'No text',
        isInternal,
        elementPath: getElementPath(link)
      };
    }).filter(link => link !== null);
  }, baseOrigin);
  
  return links;
}

/**
 * Check each link for broken status
 * @param {Array} links - Array of extracted links
 * @param {BrowserContext} context - Playwright browser context
 * @param {Object} options - Configuration options
 * @returns {Promise<Array>} - Array of checked links
 */
async function checkLinks(links, context, options) {
  const concurrentChecks = options.concurrentChecks || 5;
  const checkedLinks = [];
  const linkBatches = [];
  
  // Split links into batches for concurrent checking
  for (let i = 0; i < links.length; i += concurrentChecks) {
    linkBatches.push(links.slice(i, i + concurrentChecks));
  }
  
  // Process each batch
  for (const batch of linkBatches) {
    const batchPromises = batch.map(link => checkLinkStatus(link, context, options));
    const batchResults = await Promise.all(batchPromises);
    checkedLinks.push(...batchResults);
  }
  
  return checkedLinks;
}

/**
 * Check status of an individual link
 * @param {Object} link - Link object
 * @param {BrowserContext} context - Playwright browser context
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} - Link with status information
 */
async function checkLinkStatus(link, context, options) {
  const timeout = options.linkCheckTimeout || 10000;
  const result = { ...link, broken: false, statusCode: null, error: null };
  
  try {
    // Create a new page for checking
    const page = await context.newPage();
    
    // Setup request interception to avoid loading resources
    await page.route('**/*', route => {
      const request = route.request();
      if (request.resourceType() === 'document') {
        route.continue();
      } else {
        // Skip images, scripts, styles, etc. to speed up checks
        route.abort();
      }
    });
    
    // Capture response
    let response = null;
    page.on('response', resp => {
      if (resp.url() === link.href) {
        response = resp;
      }
    });
    
    // Navigate to the link with timeout
    try {
      await page.goto(link.href, {
        timeout,
        waitUntil: 'domcontentloaded'
      });
      
      // If we got a response, use its status code
      if (response) {
        result.statusCode = response.status();
        result.broken = response.status() >= 400;
      } else {
        // Assume it worked if we didn't get an error
        result.statusCode = 200;
      }
    } catch (error) {
      // Handle navigation errors
      result.broken = true;
      result.error = error.message;
      
      // Try to extract status code from error message
      const statusMatch = error.message.match(/(\d{3})/);
      if (statusMatch) {
        result.statusCode = parseInt(statusMatch[1]);
      } else {
        // General connection error
        result.statusCode = 0;
      }
    }
    
    // Close the page
    await page.close();
    
  } catch (error) {
    // Handle unexpected errors
    result.broken = true;
    result.error = error.message;
    result.statusCode = 0;
  }
  
  return result;
}

/**
 * Process results from link checks
 * @param {Array} checkedLinks - Array of checked links
 * @param {Object} results - Results object to update
 */
function processLinkResults(checkedLinks, results) {
  // Store broken link details
  results.brokenLinkDetails = checkedLinks.filter(link => link.broken);
  
  // Update metrics
  results.metrics.brokenLinks = results.brokenLinkDetails.length;
  results.metrics.brokenInternalLinks = results.brokenLinkDetails.filter(link => link.isInternal).length;
  results.metrics.brokenExternalLinks = results.brokenLinkDetails.filter(link => !link.isInternal).length;
  
  // Track status codes
  checkedLinks.forEach(link => {
    if (!results.metrics.linksByStatusCode[link.statusCode]) {
      results.metrics.linksByStatusCode[link.statusCode] = 0;
    }
    results.metrics.linksByStatusCode[link.statusCode]++;
  });
}

/**
 * Generate SEO issues based on broken links
 * @param {Object} results - Results object containing broken links
 */
function generateIssuesFromBrokenLinks(results) {
  // No issues if no broken links
  if (results.metrics.brokenLinks === 0) {
    return;
  }
  
  // Group broken links by status code for more organized issues
  const linksByStatus = {};
  
  for (const link of results.brokenLinkDetails) {
    const statusKey = link.statusCode || 'unknown';
    
    if (!linksByStatus[statusKey]) {
      linksByStatus[statusKey] = [];
    }
    
    linksByStatus[statusKey].push(link);
  }
  
  // Create issues for each status code group
  for (const [statusCode, links] of Object.entries(linksByStatus)) {
    // Skip successful status codes (shouldn't happen but just in case)
    if (statusCode < 400 && statusCode !== 'unknown') {
      continue;
    }
    
    // Split into internal and external links
    const internalLinks = links.filter(link => link.isInternal);
    const externalLinks = links.filter(link => !link.isInternal);
    
    // Create issue for internal links if any
    if (internalLinks.length > 0) {
      const status = getStatusCodeDescription(statusCode);
      const issue = {
        id: uuidv4(),
        title: `Broken Internal Links (${status.title})`,
        description: `${internalLinks.length} internal link${internalLinks.length > 1 ? 's' : ''} ${status.description}`,
        severity: getSeverityForStatusCode(statusCode, true),
        category: 'broken-links',
        subCategory: 'internal',
        links: internalLinks.map(link => ({
          url: link.href,
          text: link.text,
          elementPath: link.elementPath
        })),
        statusCode,
        occurrences: internalLinks.length,
        impact: 'High - Broken internal links directly impact user experience and search engine crawling',
        effort: 'Low to Medium',
        recommendation: generateRecommendationForStatusCode(statusCode, true),
        fixSuggestions: internalLinks.map(link => generateFixStrategy(link, statusCode))
      };
      
      results.issues.push(issue);
    }
    
    // Create issue for external links if any
    if (externalLinks.length > 0) {
      const status = getStatusCodeDescription(statusCode);
      const issue = {
        id: uuidv4(),
        title: `Broken External Links (${status.title})`,
        description: `${externalLinks.length} external link${externalLinks.length > 1 ? 's' : ''} ${status.description}`,
        severity: getSeverityForStatusCode(statusCode, false),
        category: 'broken-links',
        subCategory: 'external',
        links: externalLinks.map(link => ({
          url: link.href,
          text: link.text,
          elementPath: link.elementPath
        })),
        statusCode,
        occurrences: externalLinks.length,
        impact: 'Medium - Broken external links affect user experience and credibility',
        effort: 'Medium',
        recommendation: generateRecommendationForStatusCode(statusCode, false)
      };
      
      results.issues.push(issue);
    }
  }
}

/**
 * Calculate score based on broken links
 * @param {Object} results - Results object to update
 */
function calculateScore(results) {
  // Start with perfect score
  let score = 100;
  
  // No broken links = perfect score
  if (results.metrics.brokenLinks === 0) {
    results.score = score;
    return;
  }
  
  // Calculate percentage of broken links
  const brokenPercentage = (results.metrics.brokenLinks / results.metrics.totalLinks) * 100;
  
  // Internal links are more important than external
  const internalPenalty = results.metrics.brokenInternalLinks * 3;
  const externalPenalty = results.metrics.brokenExternalLinks;
  
  // Calculate total penalty
  const totalPenalty = internalPenalty + externalPenalty;
  
  // Adjust score based on broken percentage and count
  // More than 10% broken links or more than 20 broken links is serious
  if (brokenPercentage > 10 || totalPenalty > 20) {
    score -= Math.min(60, totalPenalty);
  } else {
    score -= Math.min(40, totalPenalty);
  }
  
  // Ensure minimum score
  results.score = Math.max(0, Math.round(score));
}

/**
 * Get description for HTTP status code
 * @param {number|string} statusCode - HTTP status code
 * @returns {Object} - Status code description
 */
function getStatusCodeDescription(statusCode) {
  switch (statusCode) {
    case 400:
      return {
        title: '400 Bad Request',
        description: 'returned a 400 Bad Request error, indicating the request was malformed.'
      };
    case 401:
      return {
        title: '401 Unauthorized',
        description: 'returned a 401 Unauthorized error, requiring authentication.'
      };
    case 403:
      return {
        title: '403 Forbidden',
        description: 'returned a 403 Forbidden error, indicating access is denied.'
      };
    case 404:
      return {
        title: '404 Not Found',
        description: 'returned a 404 Not Found error, meaning the resource doesn\'t exist.'
      };
    case 500:
      return {
        title: '500 Server Error',
        description: 'returned a 500 Internal Server Error, indicating a problem on the server.'
      };
    case 502:
      return {
        title: '502 Bad Gateway',
        description: 'returned a 502 Bad Gateway error, indicating an issue with a gateway or proxy.'
      };
    case 503:
      return {
        title: '503 Service Unavailable',
        description: 'returned a 503 Service Unavailable error, indicating the server is temporarily unavailable.'
      };
    case 504:
      return {
        title: '504 Gateway Timeout',
        description: 'returned a 504 Gateway Timeout error, indicating a gateway took too long to respond.'
      };
    case 0:
      return {
        title: 'Connection Failed',
        description: 'failed to connect, possibly due to DNS, network, or server issues.'
      };
    case 'unknown':
      return {
        title: 'Unknown Error',
        description: 'failed for unknown reasons, possibly due to server or network issues.'
      };
    default:
      return {
        title: `${statusCode} Error`,
        description: `returned a ${statusCode} error.`
      };
  }
}

/**
 * Get severity level based on status code and link type
 * @param {number|string} statusCode - HTTP status code
 * @param {boolean} isInternal - Whether the link is internal
 * @returns {string} - Severity level
 */
function getSeverityForStatusCode(statusCode, isInternal) {
  // Internal links generally have higher severity
  if (isInternal) {
    if (statusCode === 404) {
      return 'high'; // 404s on internal links are a bigger problem
    } else if (statusCode >= 500) {
      return 'critical'; // Server errors on internal links are critical
    } else {
      return 'medium';
    }
  } else {
    // External links
    if (statusCode >= 500) {
      return 'medium'; // Server errors on external sites are less severe
    } else {
      return 'low'; // Other errors on external sites are low severity
    }
  }
}

/**
 * Generate recommendation based on status code and link type
 * @param {number|string} statusCode - HTTP status code
 * @param {boolean} isInternal - Whether the link is internal
 * @returns {string} - Recommendation
 */
function generateRecommendationForStatusCode(statusCode, isInternal) {
  if (isInternal) {
    switch (statusCode) {
      case 404:
        return 'Fix or redirect these internal links to valid pages. Consider creating the missing pages or implementing 301 redirects to relevant existing content.';
      case 401:
      case 403:
        return 'Check permissions for these resources. Either make the content publicly accessible or update links to point to accessible resources.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Investigate and fix server issues causing these errors. Check server logs, review application code, and ensure your servers have adequate resources.';
      case 0:
        return 'Check your domain configuration and server availability. Ensure URLs are correctly formed and the content exists.';
      default:
        return 'Review and fix these internal links to ensure they point to valid, accessible resources.';
    }
  } else {
    // External links
    switch (statusCode) {
      case 404:
        return 'Update or remove these external links. Find alternative resources or updated URLs for the referenced content.';
      case 401:
      case 403:
        return 'Remove or replace these external links that require authentication or have access restrictions.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Monitor these external links and consider replacing them if the external servers continue to have issues.';
      case 0:
        return 'Check these external links for correct formatting. The domains may no longer exist or there could be network issues.';
      default:
        return 'Review these external links and update or remove them if they continue to be inaccessible.';
    }
  }
}

/**
 * Generate an overall recommendation based on broken link results
 * @param {Object} results - The broken link analysis results
 * @returns {string} - Overall recommendation
 */
function getOverallRecommendation(results) {
  if (results.score >= 90) {
    return 'Your site has very few broken links. Continue to monitor external links regularly as third-party content changes over time.';
  } else if (results.score >= 70) {
    return 'Your site has some broken links that should be addressed to improve user experience and SEO. Focus first on fixing internal broken links.';
  } else if (results.score >= 50) {
    return 'Your site has a significant number of broken links that are likely affecting user experience and search engine rankings. Prioritize fixing internal links before addressing external ones.';
  } else {
    return 'Your site has critical broken link issues that are definitely impacting users and search engines. Addressing these should be a high priority, especially the internal broken links.';
  }
}

/**
 * Get the DOM path for an element (for locating it later)
 * @param {Element} element - DOM element
 * @returns {string} - Element path
 */
function getElementPath(element) {
  return element; // This will be filled in by the browser evaluate
}

module.exports = BrokenLinkIdentifier;
