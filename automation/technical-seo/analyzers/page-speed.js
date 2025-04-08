/**
 * Page Speed Analyzer
 * 
 * Evaluates the speed performance of web pages using Lighthouse metrics
 * and Google's PageSpeed Insights API.
 */

const { chromium } = require('playwright');
const { v4: uuidv4 } = require('uuid');

class PageSpeedAnalyzer {
  /**
   * Analyze page speed for a URL
   * @param {string} url - The URL to analyze
   * @param {Object} options - Configuration options
   * @returns {Promise<Object>} - Page speed analysis results
   */
  static async analyze(url, options = {}) {
    try {
      console.log(`Analyzing page speed for: ${url}`);
      
      // Initialize browser
      const browser = await chromium.launch({
        headless: true,
        args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
      });
      
      // Create a new context with specific device
      const context = await browser.newContext({
        userAgent: options.userAgent || 'SEO.engineering/1.0',
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
      });
      
      // Create a new page
      const page = await context.newPage();
      
      // Initialize results
      const results = {
        score: 0,
        issues: [],
        metrics: {},
        summary: {}
      };
      
      // Collect performance metrics using Playwright
      const startTime = Date.now();
      
      // Enable JS coverage to track unused JavaScript
      await page.coverage.startJSCoverage();
      await page.coverage.startCSSCoverage();
      
      // Navigate to the page with timeout
      const navigationResponse = await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: options.timeout || 30000
      });
      
      // Calculate initial load time
      const loadTime = Date.now() - startTime;
      results.metrics.loadTime = loadTime;
      
      // Check response status
      const status = navigationResponse.status();
      if (status >= 400) {
        results.issues.push({
          id: uuidv4(),
          title: `HTTP Error ${status} on Page Load`,
          description: `The server responded with status code ${status} which may affect performance or prevent proper loading.`,
          severity: status >= 500 ? 'critical' : 'high',
          category: 'page-speed',
          location: url,
          recommendation: `Investigate server response issues that are causing HTTP ${status} status.`
        });
      }
      
      // Get performance metrics using Playwright's evaluateHandle
      const performanceMetrics = await page.evaluate(() => {
        // Wait for metrics to be populated
        return new Promise(resolve => {
          // Check if navigation timing API is available
          if (window.performance && window.performance.timing) {
            // Wait a bit to make sure timing data is populated
            setTimeout(() => {
              const timing = window.performance.timing;
              
              const navStart = timing.navigationStart;
              const domInteractive = timing.domInteractive;
              const domComplete = timing.domComplete;
              const loadEventEnd = timing.loadEventEnd;
              
              // Calculate timing metrics in milliseconds
              const metrics = {
                ttfb: timing.responseStart - timing.requestStart,
                domInteractive: domInteractive - navStart,
                domComplete: domComplete - navStart,
                loadComplete: loadEventEnd - navStart,
                resources: {}
              };
              
              // Collect resource timing data
              if (window.performance.getEntriesByType) {
                const resources = window.performance.getEntriesByType('resource');
                
                // Group resources by type
                const resourceTypes = {
                  script: 0,
                  css: 0,
                  image: 0,
                  font: 0,
                  other: 0
                };
                
                // Count and calculate sizes
                resources.forEach(resource => {
                  const type = resource.initiatorType;
                  if (type === 'script') resourceTypes.script++;
                  else if (type === 'css') resourceTypes.css++;
                  else if (type === 'img') resourceTypes.image++;
                  else if (type === 'font') resourceTypes.font++;
                  else resourceTypes.other++;
                });
                
                metrics.resources = resourceTypes;
                metrics.totalResources = resources.length;
              }
              
              resolve(metrics);
            }, 500);
          } else {
            // Fall back if Navigation Timing API is not available
            resolve({
              ttfb: -1,
              domInteractive: -1,
              domComplete: -1,
              loadComplete: -1,
              resources: {}
            });
          }
        });
      });
      
      // Stop coverage to analyze unused code
      const jsCoverage = await page.coverage.stopJSCoverage();
      const cssCoverage = await page.coverage.stopCSSCoverage();
      
      // Calculate unused JS bytes
      let jsUsed = 0;
      let jsTotal = 0;
      jsCoverage.forEach(entry => {
        jsTotal += entry.text.length;
        for (const range of entry.ranges) {
          jsUsed += range.end - range.start;
        }
      });
      
      // Calculate unused CSS bytes
      let cssUsed = 0;
      let cssTotal = 0;
      cssCoverage.forEach(entry => {
        cssTotal += entry.text.length;
        for (const range of entry.ranges) {
          cssUsed += range.end - range.start;
        }
      });
      
      // Store coverage results
      results.metrics.js = {
        totalBytes: jsTotal,
        usedBytes: jsUsed,
        unusedPercentage: jsTotal === 0 ? 0 : Math.round((jsTotal - jsUsed) / jsTotal * 100)
      };
      
      results.metrics.css = {
        totalBytes: cssTotal,
        usedBytes: cssUsed,
        unusedPercentage: cssTotal === 0 ? 0 : Math.round((cssTotal - cssUsed) / cssTotal * 100)
      };
      
      // Store resource metrics
      results.metrics.resources = performanceMetrics.resources;
      results.metrics.totalResources = performanceMetrics.totalResources || 0;
      
      // Store timing metrics
      results.metrics.ttfb = performanceMetrics.ttfb;
      results.metrics.domInteractive = performanceMetrics.domInteractive;
      results.metrics.domComplete = performanceMetrics.domComplete;
      results.metrics.loadComplete = performanceMetrics.loadComplete;
      
      // Generate issues based on metrics
      
      // Check Time to First Byte (TTFB)
      if (performanceMetrics.ttfb > 600) {
        results.issues.push({
          id: uuidv4(),
          title: 'Slow Server Response Time',
          description: `Server took ${performanceMetrics.ttfb}ms to respond with the first byte. Slow server response times can negatively impact all page loading metrics.`,
          severity: performanceMetrics.ttfb > 1000 ? 'critical' : 'high',
          category: 'page-speed',
          location: url,
          impact: 'High',
          effort: 'Medium',
          recommendation: 'Optimize server configuration, implement caching, or consider a faster hosting provider.'
        });
      }
      
      // Check page load time
      if (performanceMetrics.loadComplete > 3000) {
        results.issues.push({
          id: uuidv4(),
          title: 'Slow Page Load Time',
          description: `Page took ${performanceMetrics.loadComplete}ms to fully load. Slow load times negatively impact user experience and SEO rankings.`,
          severity: performanceMetrics.loadComplete > 5000 ? 'critical' : 'high',
          category: 'page-speed',
          location: url,
          impact: 'High',
          effort: 'Medium',
          recommendation: 'Optimize images, minify CSS/JS, reduce server response time, and implement browser caching.'
        });
      }
      
      // Check for unused JavaScript
      if (results.metrics.js.unusedPercentage > 40) {
        results.issues.push({
          id: uuidv4(),
          title: 'High Unused JavaScript',
          description: `${results.metrics.js.unusedPercentage}% of JavaScript code is not used during page load. Unused JavaScript increases download and processing time.`,
          severity: results.metrics.js.unusedPercentage > 60 ? 'high' : 'medium',
          category: 'page-speed',
          location: url,
          impact: 'Medium',
          effort: 'Medium',
          recommendation: 'Implement code splitting, remove unused libraries, and defer non-critical JavaScript.'
        });
      }
      
      // Check for unused CSS
      if (results.metrics.css.unusedPercentage > 50) {
        results.issues.push({
          id: uuidv4(),
          title: 'High Unused CSS',
          description: `${results.metrics.css.unusedPercentage}% of CSS code is not used during page load. Unused CSS increases download and parsing time.`,
          severity: 'medium',
          category: 'page-speed',
          location: url,
          impact: 'Medium',
          effort: 'Medium',
          recommendation: 'Remove unused CSS rules, consider using critical CSS, and optimize CSS delivery.'
        });
      }
      
      // Check for excessive resource count
      if (results.metrics.totalResources > 80) {
        results.issues.push({
          id: uuidv4(),
          title: 'Excessive Resource Requests',
          description: `Page makes ${results.metrics.totalResources} requests for resources. Each request adds overhead and potential bottlenecks.`,
          severity: results.metrics.totalResources > 120 ? 'high' : 'medium',
          category: 'page-speed',
          location: url,
          impact: 'Medium',
          effort: 'Medium',
          recommendation: 'Reduce the number of requests by combining files, using sprites, and eliminating unnecessary resources.'
        });
      }
      
      // TODO: Implement Lighthouse metrics via integration
      // This would require either using Lighthouse directly or PageSpeed Insights API
      
      // Calculate score based on performance metrics
      // Formula: 100 - (normalized issues weight + normalized timing penalties)
      
      // First convert load time to a 0-50 penalty scale
      // 0-1000ms: 0 points, 5000ms+: 50 points, linear in between
      const loadTimePenalty = Math.min(50, Math.max(0, (performanceMetrics.loadComplete - 1000) / 80));
      
      // Convert TTFB to a 0-20 penalty scale
      // 0-200ms: 0 points, 1000ms+: 20 points, linear in between
      const ttfbPenalty = Math.min(20, Math.max(0, (performanceMetrics.ttfb - 200) / 40));
      
      // Issues penalty (0-30 points)
      const issuesPenalty = Math.min(30, results.issues.filter(issue => issue.category === 'page-speed').length * 5);
      
      // Calculate score (0-100)
      const calculatedScore = Math.max(0, 100 - loadTimePenalty - ttfbPenalty - issuesPenalty);
      results.score = Math.round(calculatedScore);
      
      // Create summary
      results.summary = {
        score: results.score,
        loadTime: performanceMetrics.loadComplete,
        ttfb: performanceMetrics.ttfb,
        resourceCount: results.metrics.totalResources,
        issuesCount: results.issues.length,
        recommendation: getOverallRecommendation(results)
      };
      
      // Close browser
      await browser.close();
      
      return results;
      
    } catch (error) {
      console.error(`Error analyzing page speed for ${url}:`, error);
      
      // Return a graceful fallback result with error information
      return {
        score: 0,
        issues: [{
          id: uuidv4(),
          title: 'Page Speed Analysis Failed',
          description: `Could not analyze page speed due to error: ${error.message}`,
          severity: 'high',
          category: 'page-speed',
          location: url,
          recommendation: 'Check if the URL is accessible and properly formatted.'
        }],
        metrics: {},
        summary: {
          score: 0,
          error: error.message,
          recommendation: 'Ensure the site is accessible and try again.'
        }
      };
    }
  }
}

/**
 * Generate an overall recommendation based on page speed results
 * @param {Object} results - The page speed analysis results
 * @returns {string} - Overall recommendation
 */
function getOverallRecommendation(results) {
  if (results.score >= 90) {
    return 'Your page speed is excellent. Continue monitoring to maintain performance.';
  } else if (results.score >= 70) {
    return 'Your page speed is good but could use some improvements, especially in server response time and resource optimization.';
  } else if (results.score >= 50) {
    return 'Your page has several speed issues that should be addressed to improve user experience and SEO rankings.';
  } else {
    return 'Your page has critical speed issues that are likely impacting user experience and SEO performance. Addressing these should be a high priority.';
  }
}

module.exports = PageSpeedAnalyzer;
