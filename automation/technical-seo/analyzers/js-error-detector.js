/**
 * JavaScript Error Detector
 * 
 * Analyzes websites for JavaScript errors and issues that might affect
 * user experience and search engine optimization.
 */

const { chromium } = require('playwright');
const { v4: uuidv4 } = require('uuid');
const { errorPatterns } = require('../utils/error-patterns');

class JSErrorDetector {
  /**
   * Detect JavaScript errors on a given URL
   * @param {string} url - The URL to analyze
   * @param {Object} options - Configuration options
   * @returns {Promise<Object>} - JavaScript error analysis results
   */
  static async detect(url, options = {}) {
    try {
      console.log(`Analyzing JavaScript errors for: ${url}`);
      
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
          totalErrors: 0,
          errorsByType: {},
          consoleLogs: []
        },
        summary: {}
      };
      
      // Create a new page
      const page = await context.newPage();
      
      // Collect all console messages
      page.on('console', message => {
        const type = message.type();
        const text = message.text();
        const location = message.location();
        
        // Store all console logs for analysis
        results.metrics.consoleLogs.push({
          type,
          text,
          location: {
            url: location.url,
            lineNumber: location.lineNumber,
            columnNumber: location.columnNumber
          },
          timestamp: new Date().toISOString()
        });
        
        // Track errors specifically
        if (type === 'error') {
          results.metrics.totalErrors++;
          
          // Categorize error
          const errorCategory = categorizeError(text);
          
          if (!results.metrics.errorsByType[errorCategory]) {
            results.metrics.errorsByType[errorCategory] = 0;
          }
          results.metrics.errorsByType[errorCategory]++;
        }
      });
      
      // Collect all uncaught exceptions
      page.on('pageerror', error => {
        results.metrics.totalErrors++;
        
        // Get error details
        const errorText = error.message;
        const errorStack = error.stack || '';
        
        // Categorize error
        const errorCategory = categorizeError(errorText);
        
        if (!results.metrics.errorsByType[errorCategory]) {
          results.metrics.errorsByType[errorCategory] = 0;
        }
        results.metrics.errorsByType[errorCategory]++;
        
        // Add to console logs
        results.metrics.consoleLogs.push({
          type: 'pageerror',
          text: errorText,
          stack: errorStack,
          timestamp: new Date().toISOString()
        });
      });
      
      // Collect all request failures
      page.on('requestfailed', request => {
        const failure = request.failure();
        const url = request.url();
        
        // Only log JavaScript file failures
        if (url.endsWith('.js') || url.includes('.js?')) {
          results.metrics.totalErrors++;
          
          // Track specific resource error
          if (!results.metrics.errorsByType['resourceError']) {
            results.metrics.errorsByType['resourceError'] = 0;
          }
          results.metrics.errorsByType['resourceError']++;
          
          // Add to console logs
          results.metrics.consoleLogs.push({
            type: 'requestfailed',
            url: url,
            errorText: failure ? failure.errorText : 'Unknown error',
            timestamp: new Date().toISOString()
          });
        }
      });
      
      // Navigate to the page with timeout
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: options.timeout || 30000
      });
      
      // Wait for any additional JavaScript to execute
      await page.waitForTimeout(2000);
      
      // Basic interaction simulation to trigger potential errors
      if (options.simulateInteraction !== false) {
        await simulateUserInteraction(page);
      }
      
      // Check for JavaScript errors on mobile viewport
      if (options.checkMobile !== false) {
        await checkMobileJSErrors(page, results);
      }
      
      // Generate issues based on collected JavaScript errors
      await generateIssuesFromErrors(results);
      
      // Calculate score based on errors found
      calculateScore(results);
      
      // Create summary
      results.summary = {
        score: results.score,
        totalErrors: results.metrics.totalErrors,
        errorCategories: Object.keys(results.metrics.errorsByType).length,
        issuesCount: results.issues.length,
        recommendation: getOverallRecommendation(results)
      };
      
      // Close browser
      await browser.close();
      
      return results;
      
    } catch (error) {
      console.error(`Error detecting JavaScript errors for ${url}:`, error);
      
      // Return a graceful fallback result with error information
      return {
        score: 0,
        issues: [{
          id: uuidv4(),
          title: 'JavaScript Error Analysis Failed',
          description: `Could not analyze JavaScript errors due to error: ${error.message}`,
          severity: 'high',
          category: 'javascript',
          location: url,
          recommendation: 'Check if the URL is accessible and properly formatted.'
        }],
        metrics: {
          totalErrors: 1,
          errorsByType: {
            'analysisFailed': 1
          },
          consoleLogs: []
        },
        summary: {
          score: 0,
          totalErrors: 1,
          errorCategories: 1,
          issuesCount: 1,
          error: error.message,
          recommendation: 'Ensure the site is accessible and try again.'
        }
      };
    }
  }
}

/**
 * Categorize JavaScript errors based on error patterns
 * @param {string} errorText - The error message
 * @returns {string} - Error category
 */
function categorizeError(errorText) {
  // Check known error patterns
  for (const pattern of errorPatterns) {
    if (errorText.match(pattern.regex)) {
      return pattern.category;
    }
  }
  
  // Fallback categorization based on common error terms
  if (errorText.includes('undefined') || errorText.includes('null')) {
    return 'referenceError';
  } else if (errorText.includes('syntax')) {
    return 'syntaxError';
  } else if (errorText.includes('type')) {
    return 'typeError';
  } else if (errorText.includes('network') || errorText.includes('failed to load')) {
    return 'networkError';
  } else if (errorText.includes('permission') || errorText.includes('access')) {
    return 'permissionError';
  } else {
    return 'otherError';
  }
}

/**
 * Simulate basic user interactions to trigger potential JavaScript errors
 * @param {Page} page - Playwright page object
 */
async function simulateUserInteraction(page) {
  try {
    // Scroll down the page
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await page.waitForTimeout(500);
    
    // Scroll back up
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);
    
    // Click on a few elements (with safeguards)
    const clickableElements = await page.$$('a, button, [role="button"], .btn');
    
    // Limit to 5 random elements
    const maxElementsToClick = Math.min(5, clickableElements.length);
    
    for (let i = 0; i < maxElementsToClick; i++) {
      try {
        const element = clickableElements[i];
        
        // Check if element is visible and in viewport before clicking
        const isVisibleAndClickable = await page.evaluate(el => {
          const rect = el.getBoundingClientRect();
          return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth &&
            window.getComputedStyle(el).getPropertyValue('display') !== 'none' &&
            window.getComputedStyle(el).getPropertyValue('visibility') !== 'hidden' &&
            window.getComputedStyle(el).getPropertyValue('opacity') !== '0'
          );
        }, element);
        
        if (isVisibleAndClickable) {
          // Check for potentially destructive actions to avoid
          const isSafe = await page.evaluate(el => {
            // Avoid elements with certain text content
            const dangerousTexts = ['delete', 'remove', 'logout', 'sign out', 'cancel', 'reset'];
            const text = el.textContent.toLowerCase();
            return !dangerousTexts.some(dangerText => text.includes(dangerText));
          }, element);
          
          if (isSafe) {
            // Click with a short timeout and continue even if it fails
            await Promise.race([
              element.click({ force: false }),
              new Promise(resolve => setTimeout(resolve, 1000))
            ]);
            await page.waitForTimeout(1000);
          }
        }
      } catch (error) {
        // Ignore errors during interaction simulation
        continue;
      }
    }
    
    // Try hovering over some elements
    const hoverElements = await page.$$('a, button, [role="button"], .btn');
    const maxElementsToHover = Math.min(3, hoverElements.length);
    
    for (let i = 0; i < maxElementsToHover; i++) {
      try {
        await hoverElements[i].hover();
        await page.waitForTimeout(500);
      } catch (error) {
        // Ignore errors during hover
        continue;
      }
    }
  } catch (error) {
    console.error('Error during user interaction simulation:', error);
    // Continue with the analysis even if simulation fails
  }
}

/**
 * Check for JavaScript errors on mobile viewport
 * @param {Page} page - Playwright page object
 * @param {Object} results - Results object to update
 */
async function checkMobileJSErrors(page, results) {
  try {
    // Switch to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Reload the page to trigger mobile-specific JS
    await page.reload({ waitUntil: 'networkidle' });
    
    // Wait for any additional JavaScript to execute
    await page.waitForTimeout(2000);
    
    // Simulate basic mobile interactions
    await page.evaluate(() => {
      // Simulate touch events if possible
      window.scrollTo(0, 100);
      window.scrollTo(0, 0);
    });
    
    // No need to specifically record mobile errors as they'll be caught by the existing listeners
    // But we could differentiate them in the future if needed
  } catch (error) {
    console.error('Error during mobile testing:', error);
    // Continue with the analysis even if mobile testing fails
  }
}

/**
 * Generate SEO issues based on collected JavaScript errors
 * @param {Object} results - Results object containing collected errors
 */
async function generateIssuesFromErrors(results) {
  // No issues if no errors
  if (results.metrics.totalErrors === 0) {
    return;
  }
  
  // Group similar errors to avoid duplicate issues
  const groupedErrors = {};
  
  // Process console logs to find patterns
  for (const log of results.metrics.consoleLogs) {
    if (log.type === 'error' || log.type === 'pageerror') {
      // Create a simplified key for grouping similar errors
      const errorCategory = categorizeError(log.text);
      const errorKey = `${errorCategory}_${log.text.substring(0, 50)}`;
      
      if (!groupedErrors[errorKey]) {
        groupedErrors[errorKey] = {
          category: errorCategory,
          count: 0,
          examples: [],
          locations: new Set()
        };
      }
      
      groupedErrors[errorKey].count++;
      
      // Add example if we don't have many yet
      if (groupedErrors[errorKey].examples.length < 3) {
        groupedErrors[errorKey].examples.push(log.text);
      }
      
      // Track unique locations
      if (log.location && log.location.url) {
        groupedErrors[errorKey].locations.add(log.location.url);
      }
    }
  }
  
  // Convert grouped errors to issues
  for (const [errorKey, errorData] of Object.entries(groupedErrors)) {
    // Skip errors that only happened once if there are many error types
    // This helps focus on the most impactful issues
    if (errorData.count === 1 && Object.keys(groupedErrors).length > 5) {
      continue;
    }
    
    // Determine severity based on error category and frequency
    let severity = 'medium';
    
    if (errorData.category === 'referenceError' || 
        errorData.category === 'syntaxError' || 
        errorData.category === 'resourceError') {
      severity = errorData.count > 5 ? 'critical' : 'high';
    } else if (errorData.category === 'typeError') {
      severity = errorData.count > 10 ? 'high' : 'medium';
    }
    
    // Convert locations Set to Array
    const locations = Array.from(errorData.locations);
    
    // Create the issue
    const issue = {
      id: uuidv4(),
      title: getIssueTitleForErrorCategory(errorData.category, errorData.count),
      description: `JavaScript errors of type "${errorData.category}" were detected ${errorData.count} time${errorData.count > 1 ? 's' : ''}. ${errorData.examples.length > 0 ? `Example: "${errorData.examples[0]}"` : ''}`,
      severity,
      category: 'javascript',
      subCategory: errorData.category,
      location: locations.length > 0 ? locations[0] : 'Multiple locations',
      additionalLocations: locations.length > 1 ? locations.slice(1) : [],
      examples: errorData.examples,
      occurrences: errorData.count,
      impact: getImpactForErrorCategory(errorData.category),
      effort: getEffortForErrorCategory(errorData.category),
      recommendation: getRecommendationForErrorCategory(errorData.category)
    };
    
    results.issues.push(issue);
  }
  
  // Add specialized issues for specific patterns
  
  // Check for jQuery not defined errors specifically
  const jqueryErrors = results.metrics.consoleLogs.filter(log => 
    (log.type === 'error' || log.type === 'pageerror') && 
    (log.text.includes('jQuery') || log.text.includes('$') || log.text.includes('Uncaught ReferenceError: $ is not defined'))
  );
  
  if (jqueryErrors.length > 0) {
    results.issues.push({
      id: uuidv4(),
      title: 'jQuery Loading Issues',
      description: `${jqueryErrors.length} errors related to jQuery were detected. This can happen when scripts try to use jQuery before it's fully loaded.`,
      severity: 'high',
      category: 'javascript',
      subCategory: 'jqueryError',
      location: 'Multiple scripts',
      occurrences: jqueryErrors.length,
      impact: 'High - jQuery errors can cause significant portions of the site to malfunction',
      effort: 'Medium',
      recommendation: 'Ensure jQuery is loaded before dependent scripts, use jQuery.noConflict() if there are conflicts, and consider using deferred or async loading with proper callbacks.'
    });
  }
  
  // Check for mobile-specific errors (often related to touch events)
  const touchErrors = results.metrics.consoleLogs.filter(log => 
    (log.type === 'error' || log.type === 'pageerror') && 
    (log.text.includes('touch') || log.text.includes('gesture') || log.text.includes('swipe'))
  );
  
  if (touchErrors.length > 0) {
    results.issues.push({
      id: uuidv4(),
      title: 'Mobile Touch Event Errors',
      description: `${touchErrors.length} errors related to touch events were detected. These can affect mobile user experience.`,
      severity: 'medium',
      category: 'javascript',
      subCategory: 'touchError',
      location: 'Mobile interface',
      occurrences: touchErrors.length,
      impact: 'Medium - Can affect mobile usability but usually doesn\'t break core functionality',
      effort: 'Medium',
      recommendation: 'Review touch event handlers, ensure proper feature detection for touch capabilities, and test thoroughly on various mobile devices.'
    });
  }
}

/**
 * Calculate score based on JavaScript errors
 * @param {Object} results - Results object to update
 */
function calculateScore(results) {
  // Start with perfect score and subtract based on issues
  let score = 100;
  
  // Base penalty on total errors
  // Up to 50 points deduction based on number of errors
  const errorPenalty = Math.min(50, results.metrics.totalErrors * 2);
  score -= errorPenalty;
  
  // Additional penalty based on severity of issues
  for (const issue of results.issues) {
    if (issue.severity === 'critical') {
      score -= 10;
    } else if (issue.severity === 'high') {
      score -= 5;
    } else if (issue.severity === 'medium') {
      score -= 3;
    } else if (issue.severity === 'low') {
      score -= 1;
    }
  }
  
  // Ensure score doesn't go below 0
  results.score = Math.max(0, Math.round(score));
}

/**
 * Get a title for an issue based on error category and count
 * @param {string} category - Error category
 * @param {number} count - Number of occurrences
 * @returns {string} - Issue title
 */
function getIssueTitleForErrorCategory(category, count) {
  const plural = count > 1 ? 's' : '';
  
  switch (category) {
    case 'referenceError':
      return `Variable Reference Error${plural} Detected`;
    case 'typeError':
      return `JavaScript Type Error${plural} Detected`;
    case 'syntaxError':
      return `JavaScript Syntax Error${plural} Detected`;
    case 'resourceError':
      return `JavaScript Resource Loading Error${plural}`;
    case 'networkError':
      return `JavaScript Network Error${plural}`;
    case 'permissionError':
      return `JavaScript Permission Error${plural}`;
    default:
      return `JavaScript Error${plural} Detected`;
  }
}

/**
 * Get impact description for an error category
 * @param {string} category - Error category
 * @returns {string} - Impact description
 */
function getImpactForErrorCategory(category) {
  switch (category) {
    case 'referenceError':
      return 'High - Reference errors typically break functionality and can prevent scripts from running properly';
    case 'typeError':
      return 'Medium - Type errors can cause unexpected behavior and partial functionality failure';
    case 'syntaxError':
      return 'High - Syntax errors prevent code execution and can break entire script blocks';
    case 'resourceError':
      return 'High - Resource errors mean essential JavaScript files aren\'t loading, likely breaking functionality';
    case 'networkError':
      return 'Medium - Network errors can prevent dynamic content loading and API interactions';
    case 'permissionError':
      return 'Medium - Permission errors can limit functionality related to browser features';
    default:
      return 'Medium - These errors may impact user experience and site functionality';
  }
}

/**
 * Get effort estimation for fixing an error category
 * @param {string} category - Error category
 * @returns {string} - Effort estimation
 */
function getEffortForErrorCategory(category) {
  switch (category) {
    case 'referenceError':
      return 'Low - Usually requires adding proper variable initialization or checking';
    case 'typeError':
      return 'Medium - May require refactoring how objects and values are processed';
    case 'syntaxError':
      return 'Low - Typically involves fixing code formatting or syntax';
    case 'resourceError':
      return 'Medium - Requires ensuring proper resource paths and loading sequence';
    case 'networkError':
      return 'Medium - Involves fixing API endpoints or implementing better error handling';
    case 'permissionError':
      return 'Medium - May require redesigning features to work within browser permissions';
    default:
      return 'Medium - Typically requires debugging and targeted fixes';
  }
}

/**
 * Get recommendation for fixing an error category
 * @param {string} category - Error category
 * @returns {string} - Recommendation
 */
function getRecommendationForErrorCategory(category) {
  switch (category) {
    case 'referenceError':
      return 'Check for undefined variables, ensure proper initialization, and verify script loading order. Use defensive coding practices like checking if variables exist before using them.';
    case 'typeError':
      return 'Ensure proper type checking before operations, implement defensive programming with conditionals, and validate data structures before access.';
    case 'syntaxError':
      return 'Review and fix syntax issues such as missing brackets, semicolons, or quotes. Consider using linting tools to catch these errors during development.';
    case 'resourceError':
      return 'Verify all JavaScript file paths, ensure proper loading sequence, implement fallbacks, and check for CDN availability issues.';
    case 'networkError':
      return 'Implement robust error handling for network requests, provide fallbacks for failed requests, and consider caching strategies for essential resources.';
    case 'permissionError':
      return 'Review browser security requirements, ensure features gracefully degrade when permissions aren\'t granted, and provide clear user instructions for permission requests.';
    default:
      return 'Debug the JavaScript errors by using browser developer tools, implement robust error handling, and consider using try/catch blocks around problematic code areas.';
  }
}

/**
 * Generate an overall recommendation based on JavaScript error results
 * @param {Object} results - The JavaScript error analysis results
 * @returns {string} - Overall recommendation
 */
function getOverallRecommendation(results) {
  if (results.score >= 90) {
    return 'Your site has minimal JavaScript errors. Continue monitoring to maintain quality.';
  } else if (results.score >= 70) {
    return 'Your site has some JavaScript issues that should be addressed to improve user experience and performance.';
  } else if (results.score >= 50) {
    return 'Your site has significant JavaScript errors that are likely affecting functionality and user experience. These should be addressed promptly.';
  } else {
    return 'Your site has critical JavaScript issues that are definitely impacting users and search engine interactions. Fixing these should be a high priority.';
  }
}

module.exports = JSErrorDetector;
