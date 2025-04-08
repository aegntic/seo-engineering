/**
 * Viewport Configuration Analyzer
 * 
 * Analyzes the viewport meta tag and related configurations for mobile SEO best practices.
 * Checks for proper viewport settings, width configuration, and initial scale settings.
 */

const { chromium } = require('playwright');
const { v4: uuidv4 } = require('uuid');

class ViewportConfigAnalyzer {
  /**
   * Analyze viewport configuration for a URL
   * @param {string} url - The URL to analyze
   * @param {Object} options - Configuration options
   * @returns {Promise<Object>} - Viewport configuration analysis results
   */
  static async analyze(url, options = {}) {
    try {
      console.log(`Analyzing viewport configuration for: ${url}`);
      
      // Initialize browser
      const browser = await chromium.launch({
        headless: true,
        args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
      });
      
      // Create a new context with mobile user agent
      const context = await browser.newContext({
        userAgent: options.userAgent || 'SEO.engineering/1.0 Mobile Optimization Checker',
        viewport: { width: 375, height: 667 }, // iPhone 8 size
        deviceScaleFactor: 2,
      });
      
      // Create a new page
      const page = await context.newPage();
      
      // Initialize results
      const results = {
        score: 0,
        issues: [],
        viewportData: {},
        summary: {}
      };
      
      // Navigate to the page with timeout
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: options.timeout || 30000
      });
      
      // Extract viewport meta tag and configuration using Playwright's evaluate
      const viewportData = await page.evaluate(() => {
        // Get viewport meta tag
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        const viewportContent = viewportMeta ? viewportMeta.getAttribute('content') : null;
        
        // Parse viewport content into components
        let parsedViewport = {};
        
        if (viewportContent) {
          const pairs = viewportContent.split(',');
          pairs.forEach(pair => {
            const [key, value] = pair.trim().split('=');
            parsedViewport[key.trim()] = value.trim();
          });
        }
        
        // Check for width=device-width
        const hasDeviceWidth = parsedViewport.width === 'device-width';
        
        // Check for initial-scale
        const hasInitialScale = 'initial-scale' in parsedViewport;
        const initialScaleValue = hasInitialScale ? parseFloat(parsedViewport['initial-scale']) : null;
        
        // Check for user-scalable
        const hasUserScalable = 'user-scalable' in parsedViewport;
        const userScalableValue = hasUserScalable ? parsedViewport['user-scalable'] : null;
        
        // Check if width is fixed
        const hasFixedWidth = parsedViewport.width && parsedViewport.width !== 'device-width';
        const fixedWidthValue = hasFixedWidth ? parsedViewport.width : null;
        
        // Check for viewport fit for notched devices
        const hasViewportFit = 'viewport-fit' in parsedViewport;
        const viewportFitValue = hasViewportFit ? parsedViewport['viewport-fit'] : null;
        
        // Get the actual computed values
        const computedValues = {
          windowInnerWidth: window.innerWidth,
          windowInnerHeight: window.innerHeight,
          documentWidth: document.documentElement.scrollWidth,
          documentHeight: document.documentElement.scrollHeight,
          horizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
          pixelRatio: window.devicePixelRatio || 1
        };
        
        return {
          raw: {
            tag: viewportMeta ? viewportMeta.outerHTML : null,
            content: viewportContent
          },
          parsed: parsedViewport,
          properties: {
            hasViewportMeta: Boolean(viewportMeta),
            hasDeviceWidth,
            hasInitialScale,
            initialScaleValue,
            hasUserScalable,
            userScalableValue,
            hasFixedWidth,
            fixedWidthValue,
            hasViewportFit,
            viewportFitValue
          },
          computed: computedValues
        };
      });
      
      // Store the viewport data
      results.viewportData = viewportData;
      
      // Check for issues
      
      // Missing viewport meta tag
      if (!viewportData.properties.hasViewportMeta) {
        results.issues.push({
          id: uuidv4(),
          title: 'Missing Viewport Meta Tag',
          description: 'The page does not have a viewport meta tag, which is required for proper rendering on mobile devices.',
          severity: 'critical',
          category: 'viewport-configuration',
          location: url,
          impact: 'High',
          effort: 'Low',
          recommendation: 'Add a viewport meta tag to the head of the page: <meta name="viewport" content="width=device-width, initial-scale=1.0">'
        });
      } else {
        // Check for device-width
        if (!viewportData.properties.hasDeviceWidth) {
          results.issues.push({
            id: uuidv4(),
            title: 'Missing device-width Setting',
            description: 'The viewport meta tag does not include width=device-width, which is necessary for responsive design.',
            severity: 'high',
            category: 'viewport-configuration',
            location: url,
            impact: 'High',
            effort: 'Low',
            recommendation: 'Add width=device-width to your viewport meta tag to ensure the page scales properly on all devices.'
          });
        }
        
        // Check for initial-scale
        if (!viewportData.properties.hasInitialScale) {
          results.issues.push({
            id: uuidv4(),
            title: 'Missing initial-scale Setting',
            description: 'The viewport meta tag does not include an initial-scale value, which helps ensure proper scaling on mobile devices.',
            severity: 'medium',
            category: 'viewport-configuration',
            location: url,
            impact: 'Medium',
            effort: 'Low',
            recommendation: 'Add initial-scale=1.0 to your viewport meta tag.'
          });
        } else if (viewportData.properties.initialScaleValue < 0.5) {
          results.issues.push({
            id: uuidv4(),
            title: 'Initial-scale Too Small',
            description: `The initial-scale value (${viewportData.properties.initialScaleValue}) is too small, which can cause the page to appear zoomed out.`,
            severity: 'medium',
            category: 'viewport-configuration',
            location: url,
            impact: 'Medium',
            effort: 'Low',
            recommendation: 'Set initial-scale to a value between 0.8 and 1.0 for optimal mobile viewing.'
          });
        }
        
        // Check for fixed width
        if (viewportData.properties.hasFixedWidth) {
          results.issues.push({
            id: uuidv4(),
            title: 'Fixed Viewport Width',
            description: `The viewport has a fixed width (${viewportData.properties.fixedWidthValue}) instead of device-width. This prevents proper responsive behavior.`,
            severity: 'high',
            category: 'viewport-configuration',
            location: url,
            impact: 'High',
            effort: 'Low',
            recommendation: 'Replace the fixed width value with width=device-width to ensure the page adjusts to different screen sizes.'
          });
        }
        
        // Check for user-scalable=no
        if (viewportData.properties.hasUserScalable && (viewportData.properties.userScalableValue === 'no' || viewportData.properties.userScalableValue === '0')) {
          results.issues.push({
            id: uuidv4(),
            title: 'Disabled Zooming',
            description: 'The viewport has user-scalable=no or user-scalable=0, which prevents users from zooming the page. This creates accessibility issues for users with visual impairments.',
            severity: 'high',
            category: 'viewport-configuration',
            location: url,
            impact: 'High',
            effort: 'Low',
            recommendation: 'Remove user-scalable=no from your viewport meta tag to allow users to zoom the page for better accessibility.'
          });
        }
        
        // Check for horizontal scrolling issues
        if (viewportData.computed.horizontalScroll) {
          results.issues.push({
            id: uuidv4(),
            title: 'Horizontal Scrolling Detected',
            description: `The page content (${viewportData.computed.documentWidth}px) is wider than the viewport (${viewportData.computed.windowInnerWidth}px), causing horizontal scrolling on mobile.`,
            severity: 'high',
            category: 'viewport-configuration',
            location: url,
            impact: 'High',
            effort: 'Medium',
            recommendation: 'Use responsive design techniques to ensure content fits within the mobile viewport without horizontal scrolling.'
          });
        }
        
        // Check for viewport-fit for notched devices (enhanced for modern devices)
        if (!viewportData.properties.hasViewportFit) {
          results.issues.push({
            id: uuidv4(),
            title: 'Missing viewport-fit for Notched Devices',
            description: 'The viewport meta tag does not include viewport-fit, which helps optimize display on devices with notches or rounded corners.',
            severity: 'low',
            category: 'viewport-configuration',
            location: url,
            impact: 'Low',
            effort: 'Low',
            recommendation: 'Add viewport-fit=cover to your viewport meta tag for better display on modern devices with notches.'
          });
        }
      }
      
      // Calculate score based on issues
      // Base score starts at 100
      let score = 100;
      
      // Deduct points based on issue severity
      for (const issue of results.issues) {
        if (issue.severity === 'critical') score -= 30;
        else if (issue.severity === 'high') score -= 15;
        else if (issue.severity === 'medium') score -= 8;
        else if (issue.severity === 'low') score -= 3;
      }
      
      // Ensure score is between 0 and 100
      results.score = Math.max(0, Math.min(100, Math.round(score)));
      
      // Create summary
      results.summary = {
        score: results.score,
        hasViewportMeta: viewportData.properties.hasViewportMeta,
        hasProperConfiguration: viewportData.properties.hasDeviceWidth && viewportData.properties.hasInitialScale,
        hasAccessibilityIssues: viewportData.properties.hasUserScalable && (viewportData.properties.userScalableValue === 'no' || viewportData.properties.userScalableValue === '0'),
        horizontalScroll: viewportData.computed.horizontalScroll,
        issuesCount: results.issues.length,
        recommendation: getViewportRecommendation(results)
      };
      
      // Close browser
      await browser.close();
      
      return results;
      
    } catch (error) {
      console.error(`Error analyzing viewport configuration for ${url}:`, error);
      
      // Return a graceful fallback result with error information
      return {
        score: 0,
        issues: [{
          id: uuidv4(),
          title: 'Viewport Analysis Failed',
          description: `Could not analyze viewport configuration due to error: ${error.message}`,
          severity: 'critical',
          category: 'viewport-configuration',
          location: url,
          recommendation: 'Check if the URL is accessible and properly formatted.'
        }],
        viewportData: {},
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
 * Generate a recommendation based on viewport analysis results
 * @param {Object} results - The viewport analysis results
 * @returns {string} - Recommendation
 */
function getViewportRecommendation(results) {
  if (results.score >= 90) {
    return 'Your viewport configuration is well-optimized for mobile devices.';
  } else if (results.score >= 70) {
    return 'Your viewport configuration is generally good but could use minor improvements for optimal mobile display.';
  } else if (results.score >= 50) {
    return 'Your viewport configuration has several issues that should be addressed to improve mobile rendering.';
  } else {
    return 'Your viewport configuration has critical issues that are preventing proper mobile display and should be fixed immediately.';
  }
}

module.exports = ViewportConfigAnalyzer;
