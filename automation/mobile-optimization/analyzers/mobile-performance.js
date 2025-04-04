/**
 * Mobile Performance Measurer
 * 
 * Measures performance metrics specifically for mobile devices, including
 * load times, rendering performance, and mobile-specific optimizations.
 */

const { chromium, devices } = require('playwright');
const { v4: uuidv4 } = require('uuid');

class MobilePerformanceMeasurer {
  /**
   * Measure mobile performance for a URL
   * @param {string} url - The URL to measure
   * @param {Object} options - Configuration options
   * @returns {Promise<Object>} - Mobile performance measurement results
   */
  static async measure(url, options = {}) {
    try {
      console.log(`Measuring mobile performance for: ${url}`);
      
      // Initialize browser with device emulation
      const browser = await chromium.launch({
        headless: true,
        args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
      });
      
      // Set up device to emulate
      const deviceName = options.device || 'Pixel 5';
      const deviceConfig = devices[deviceName];
      
      if (!deviceConfig) {
        throw new Error(`Unknown device: ${deviceName}`);
      }
      
      // Create a new context with mobile device emulation
      const context = await browser.newContext({
        ...deviceConfig,
        userAgent: options.userAgent || deviceConfig.userAgent
      });
      
      // Initialize results
      const results = {
        score: 0,
        issues: [],
        metrics: {},
        optimizations: {},
        summary: {}
      };
      
      // Create a new page with performance observers
      const page = await context.newPage();
      
      // Set up performance measurements
      await page.addInitScript(() => {
        window.performanceData = {
          resources: [],
          timings: {},
          firstPaint: null,
          firstContentfulPaint: null,
          largestContentfulPaint: null,
          cumulativeLayoutShift: 0,
          firstInputDelay: null,
          longTasks: []
        };
        
        // Resource Timing
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          window.performanceData.resources = [
            ...window.performanceData.resources,
            ...entries.map(entry => ({
              name: entry.name,
              initiatorType: entry.initiatorType,
              duration: entry.duration,
              transferSize: entry.transferSize,
              decodedBodySize: entry.decodedBodySize,
              startTime: entry.startTime
            }))
          ];
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        
        // Paint Timing
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-paint') {
              window.performanceData.firstPaint = entry.startTime;
            } else if (entry.name === 'first-contentful-paint') {
              window.performanceData.firstContentfulPaint = entry.startTime;
            }
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          window.performanceData.largestContentfulPaint = lastEntry ? lastEntry.startTime : null;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Layout Shifts
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              window.performanceData.cumulativeLayoutShift += entry.value;
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        
        // Long Tasks
        const longTaskObserver = new PerformanceObserver((list) => {
          window.performanceData.longTasks = [
            ...window.performanceData.longTasks,
            ...list.getEntries().map(entry => ({
              duration: entry.duration,
              startTime: entry.startTime
            }))
          ];
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        
        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const firstInput = list.getEntries()[0];
          if (firstInput) {
            window.performanceData.firstInputDelay = firstInput.processingStart - firstInput.startTime;
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        
        // Navigation Timing
        window.addEventListener('load', () => {
          const navigation = performance.getEntriesByType('navigation')[0];
          window.performanceData.timings = {
            navigationStart: 0,
            unloadEventStart: navigation.unloadEventStart,
            domInteractive: navigation.domInteractive,
            domContentLoadedEventStart: navigation.domContentLoadedEventStart,
            domComplete: navigation.domComplete,
            loadEventStart: navigation.loadEventStart,
            loadEventEnd: navigation.loadEventEnd,
            duration: navigation.duration,
            dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcpConnection: navigation.connectEnd - navigation.connectStart,
            ttfb: navigation.responseStart - navigation.requestStart,
            responseTime: navigation.responseEnd - navigation.responseStart,
            domParsing: navigation.domInteractive - navigation.responseEnd
          };
        });
      });
      
      // Enable JavaScript coverage
      await page.coverage.startJSCoverage();
      await page.coverage.startCSSCoverage();
      
      // Navigate to URL with timeout and wait for load
      const response = await page.goto(url, {
        waitUntil: 'load',
        timeout: options.timeout || 30000
      });
      
      // Wait for network to be idle to ensure all resources are loaded
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
        // If network never becomes idle, we'll continue anyway
        console.warn('Network did not become idle within timeout');
      });
      
      // Wait a bit longer to capture more performance data
      await page.waitForTimeout(2000);
      
      // Get HTTP response headers for analysis
      const headers = response ? response.headers() : {};
      
      // Run performance tests and optimization checks
      const performanceData = await page.evaluate(() => {
        // Collect all the performance data
        const performanceData = window.performanceData;
        
        // Calculate additional metrics
        const timeToInteractive = performanceData.longTasks.length > 0
          ? performanceData.longTasks[performanceData.longTasks.length - 1].startTime + performanceData.longTasks[performanceData.longTasks.length - 1].duration
          : performanceData.timings.domInteractive;
        
        // Number of resources by type
        const resourcesByType = performanceData.resources.reduce((acc, resource) => {
          const type = resource.initiatorType || 'other';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});
        
        // Total transferred data
        const totalTransferSize = performanceData.resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0);
        
        // Large resources
        const largeResources = performanceData.resources
          .filter(resource => resource.transferSize > 100 * 1024) // Larger than 100KB
          .map(resource => ({
            url: resource.name,
            type: resource.initiatorType,
            size: resource.transferSize
          }));
        
        // Render-blocking resources
        const renderBlockingResources = performanceData.resources.filter(resource => {
          return (resource.initiatorType === 'link' || resource.initiatorType === 'script') && 
                 resource.startTime < performanceData.firstContentfulPaint;
        }).map(resource => ({
          url: resource.name,
          type: resource.initiatorType,
          startTime: resource.startTime
        }));
        
        // Check for image optimization issues
        const imageResources = performanceData.resources.filter(resource => 
          resource.initiatorType === 'img' || 
          resource.name.match(/\\.(jpg|jpeg|png|gif|webp|svg)($|\\?)/)
        );
        
        const largeImages = imageResources.filter(resource => 
          resource.transferSize > 200 * 1024 // Larger than 200KB
        ).map(resource => ({
          url: resource.name,
          size: resource.transferSize
        }));
        
        // Add timeToInteractive to the metrics
        performanceData.timeToInteractive = timeToInteractive;
        
        // Add resource summaries
        performanceData.resourceSummary = {
          totalCount: performanceData.resources.length,
          totalSize: totalTransferSize,
          byType: resourcesByType,
          largeResources,
          renderBlockingResources,
          largeImages
        };
        
        return performanceData;
      });
      
      // Get JS and CSS coverage
      const jsCoverage = await page.coverage.stopJSCoverage();
      const cssCoverage = await page.coverage.stopCSSCoverage();
      
      // Calculate unused bytes
      let jsUsedBytes = 0;
      let jsTotalBytes = 0;
      let cssUsedBytes = 0;
      let cssTotalBytes = 0;
      
      for (const entry of jsCoverage) {
        jsTotalBytes += entry.text.length;
        for (const range of entry.ranges) {
          jsUsedBytes += range.end - range.start;
        }
      }
      
      for (const entry of cssCoverage) {
        cssTotalBytes += entry.text.length;
        for (const range of entry.ranges) {
          cssUsedBytes += range.end - range.start;
        }
      }
      
      const jsUnusedPercentage = jsTotalBytes > 0 ? Math.round((jsTotalBytes - jsUsedBytes) / jsTotalBytes * 100) : 0;
      const cssUnusedPercentage = cssTotalBytes > 0 ? Math.round((cssTotalBytes - cssUsedBytes) / cssTotalBytes * 100) : 0;
      
      // Collect mobile optimizations
      const mobileOptimizations = await page.evaluate(() => {
        // Check for mobile-specific optimizations
        
        // Viewport
        const hasViewport = Boolean(document.querySelector('meta[name="viewport"]'));
        const viewportContent = hasViewport ? document.querySelector('meta[name="viewport"]').getAttribute('content') : null;
        
        // Touch icons
        const hasTouchIcons = document.querySelectorAll('link[rel*="apple-touch-icon"], link[rel*="icon"]').length > 0;
        
        // Check for responsive images
        const images = Array.from(document.querySelectorAll('img'));
        const responsiveImageCount = images.filter(img => img.srcset || img.sizes || img.currentSrc !== img.src).length;
        const lazyLoadedCount = images.filter(img => img.loading === 'lazy').length;
        
        // Check text readability
        const bodyTextElements = document.querySelectorAll('p, li, td, div:not(:empty)');
        const readableTextCount = Array.from(bodyTextElements).filter(el => {
          const styles = window.getComputedStyle(el);
          const fontSize = parseFloat(styles.fontSize);
          return fontSize >= 14; // 14px is generally considered minimum for mobile readability
        }).length;
        
        // Check tap targets
        const interactiveElements = document.querySelectorAll('a, button, input, select, textarea');
        const largeEnoughTapTargets = Array.from(interactiveElements).filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width >= 44 && rect.height >= 44; // 44px is Apple's recommended minimum
        }).length;
        
        // Check for mobile redirects
        const hasMobileRedirect = document.querySelectorAll('link[rel="alternate"][media="only screen and (max-width: 640px)"]').length > 0;
        
        // Check for AMP link
        const hasAmpLink = document.querySelectorAll('link[rel="amphtml"]').length > 0;
        
        // Service Worker
        const hasServiceWorker = 'serviceWorker' in navigator;
        
        return {
          hasViewport,
          viewportContent,
          hasTouchIcons,
          responsiveImages: {
            count: responsiveImageCount,
            percentage: images.length > 0 ? Math.round(responsiveImageCount / images.length * 100) : 0
          },
          lazyLoading: {
            count: lazyLoadedCount,
            percentage: images.length > 0 ? Math.round(lazyLoadedCount / images.length * 100) : 0
          },
          textReadability: {
            count: readableTextCount,
            percentage: bodyTextElements.length > 0 ? Math.round(readableTextCount / bodyTextElements.length * 100) : 0
          },
          tapTargets: {
            count: largeEnoughTapTargets,
            percentage: interactiveElements.length > 0 ? Math.round(largeEnoughTapTargets / interactiveElements.length * 100) : 0
          },
          hasMobileRedirect,
          hasAmpLink,
          hasServiceWorker
        };
      });
      
      // Store all the collected data
      results.metrics = {
        timings: performanceData.timings,
        firstPaint: performanceData.firstPaint,
        firstContentfulPaint: performanceData.firstContentfulPaint,
        largestContentfulPaint: performanceData.largestContentfulPaint,
        timeToInteractive: performanceData.timeToInteractive,
        cumulativeLayoutShift: performanceData.cumulativeLayoutShift,
        firstInputDelay: performanceData.firstInputDelay,
        longTasks: performanceData.longTasks.length,
        resourceSummary: performanceData.resourceSummary,
        codeCoverage: {
          js: {
            totalBytes: jsTotalBytes,
            usedBytes: jsUsedBytes,
            unusedPercentage: jsUnusedPercentage
          },
          css: {
            totalBytes: cssTotalBytes,
            usedBytes: cssUsedBytes,
            unusedPercentage: cssUnusedPercentage
          }
        }
      };
      
      results.optimizations = mobileOptimizations;
      
      // Add HTTP header information
      results.headers = {
        hasCaching: headers['cache-control'] ? true : false,
        cacheControl: headers['cache-control'],
        hasCompression: headers['content-encoding'] ? true : false,
        contentEncoding: headers['content-encoding'],
        serverTiming: headers['server-timing']
      };
      
      // Analyze the data and identify issues
      
      // Core Web Vitals Thresholds
      const LCP_THRESHOLD_GOOD = 2500; // ms
      const LCP_THRESHOLD_POOR = 4000; // ms
      const FID_THRESHOLD_GOOD = 100; // ms
      const FID_THRESHOLD_POOR = 300; // ms
      const CLS_THRESHOLD_GOOD = 0.1;
      const CLS_THRESHOLD_POOR = 0.25;
      
      // LCP Check
      if (performanceData.largestContentfulPaint) {
        if (performanceData.largestContentfulPaint > LCP_THRESHOLD_POOR) {
          results.issues.push({
            id: uuidv4(),
            title: 'Slow Largest Contentful Paint (LCP)',
            description: `LCP is ${Math.round(performanceData.largestContentfulPaint)}ms, which is considered poor (>4000ms). This affects how quickly users perceive the page has loaded.`,
            severity: 'high',
            category: 'mobile-performance',
            location: url,
            impact: 'High',
            effort: 'Medium',
            recommendation: 'Optimize the largest content element (usually a hero image or heading), reduce server response time, and eliminate render-blocking resources.'
          });
        } else if (performanceData.largestContentfulPaint > LCP_THRESHOLD_GOOD) {
          results.issues.push({
            id: uuidv4(),
            title: 'Moderate Largest Contentful Paint (LCP)',
            description: `LCP is ${Math.round(performanceData.largestContentfulPaint)}ms, which needs improvement (2500-4000ms). This affects how quickly users perceive the page has loaded.`,
            severity: 'medium',
            category: 'mobile-performance',
            location: url,
            impact: 'Medium',
            effort: 'Medium',
            recommendation: 'Consider optimizing the largest content element, improve server response time, and minimize render-blocking resources.'
          });
        }
      }
      
      // FID/Input Delay Check
      if (performanceData.firstInputDelay) {
        if (performanceData.firstInputDelay > FID_THRESHOLD_POOR) {
          results.issues.push({
            id: uuidv4(),
            title: 'High First Input Delay (FID)',
            description: `FID is ${Math.round(performanceData.firstInputDelay)}ms, which is considered poor (>300ms). This affects how responsive the page feels when users interact with it.`,
            severity: 'high',
            category: 'mobile-performance',
            location: url,
            impact: 'High',
            effort: 'High',
            recommendation: 'Reduce JavaScript execution time, break up long tasks, optimize event handlers, and use web workers for complex calculations.'
          });
        } else if (performanceData.firstInputDelay > FID_THRESHOLD_GOOD) {
          results.issues.push({
            id: uuidv4(),
            title: 'Moderate First Input Delay (FID)',
            description: `FID is ${Math.round(performanceData.firstInputDelay)}ms, which needs improvement (100-300ms). This affects how responsive the page feels when users interact with it.`,
            severity: 'medium',
            category: 'mobile-performance',
            location: url,
            impact: 'Medium',
            effort: 'Medium',
            recommendation: 'Consider reducing JavaScript execution time and optimizing event handlers.'
          });
        }
      }
      
      // CLS Check
      if (performanceData.cumulativeLayoutShift !== undefined) {
        if (performanceData.cumulativeLayoutShift > CLS_THRESHOLD_POOR) {
          results.issues.push({
            id: uuidv4(),
            title: 'High Cumulative Layout Shift (CLS)',
            description: `CLS is ${performanceData.cumulativeLayoutShift.toFixed(2)}, which is considered poor (>0.25). This creates a jarring experience as page elements shift while loading.`,
            severity: 'high',
            category: 'mobile-performance',
            location: url,
            impact: 'High',
            effort: 'Medium',
            recommendation: 'Always include size attributes on images and videos, avoid inserting content above existing content, and use transform animations instead of animations that trigger layout changes.'
          });
        } else if (performanceData.cumulativeLayoutShift > CLS_THRESHOLD_GOOD) {
          results.issues.push({
            id: uuidv4(),
            title: 'Moderate Cumulative Layout Shift (CLS)',
            description: `CLS is ${performanceData.cumulativeLayoutShift.toFixed(2)}, which needs improvement (0.1-0.25). This creates some visual instability as page elements shift while loading.`,
            severity: 'medium',
            category: 'mobile-performance',
            location: url,
            impact: 'Medium',
            effort: 'Medium',
            recommendation: 'Include size attributes on images and videos, and be careful about dynamically injected content.'
          });
        }
      }
      
      // Large resource checks
      if (performanceData.resourceSummary.largeResources.length > 0) {
        const topResources = performanceData.resourceSummary.largeResources
          .slice(0, 3)
          .map(res => `${res.url.split('/').pop()} (${Math.round(res.size / 1024)}KB)`)
          .join(', ');
        
        results.issues.push({
          id: uuidv4(),
          title: 'Large Resources Affecting Load Time',
          description: `Found ${performanceData.resourceSummary.largeResources.length} large resources (>100KB) that may slow down mobile page loading. Top resources: ${topResources}`,
          severity: 'medium',
          category: 'mobile-performance',
          location: url,
          impact: 'Medium',
          effort: 'Medium',
          recommendation: 'Optimize large resources through compression, resizing, lazy loading, or code splitting.'
        });
      }
      
      // Render-blocking resources
      if (performanceData.resourceSummary.renderBlockingResources.length > 3) {
        results.issues.push({
          id: uuidv4(),
          title: 'Excessive Render-Blocking Resources',
          description: `Found ${performanceData.resourceSummary.renderBlockingResources.length} render-blocking resources that delay first paint and content rendering.`,
          severity: 'high',
          category: 'mobile-performance',
          location: url,
          impact: 'High',
          effort: 'Medium',
          recommendation: 'Use async or defer attributes for non-critical JavaScript, and inline critical CSS while loading non-critical CSS asynchronously.'
        });
      }
      
      // Unused JavaScript
      if (jsUnusedPercentage > 40) {
        results.issues.push({
          id: uuidv4(),
          title: 'High Unused JavaScript',
          description: `${jsUnusedPercentage}% of JavaScript (approximately ${Math.round((jsTotalBytes - jsUsedBytes) / 1024)}KB) is not used during page load, increasing mobile data usage and parse/compile time.`,
          severity: 'medium',
          category: 'mobile-performance',
          location: url,
          impact: 'Medium',
          effort: 'Medium',
          recommendation: 'Use code splitting to deliver only necessary JavaScript, remove unused dependencies, and consider using modern bundlers with tree shaking.'
        });
      }
      
      // Unused CSS
      if (cssUnusedPercentage > 50) {
        results.issues.push({
          id: uuidv4(),
          title: 'High Unused CSS',
          description: `${cssUnusedPercentage}% of CSS (approximately ${Math.round((cssTotalBytes - cssUsedBytes) / 1024)}KB) is not used during page load, unnecessarily increasing page weight and parse time.`,
          severity: 'medium',
          category: 'mobile-performance',
          location: url,
          impact: 'Medium',
          effort: 'Medium',
          recommendation: 'Use tools like PurgeCSS to remove unused styles, split CSS into critical and non-critical, and consider CSS-in-JS for loading styles only when needed.'
        });
      }
      
      // Image optimization
      if (performanceData.resourceSummary.largeImages.length > 0) {
        results.issues.push({
          id: uuidv4(),
          title: 'Unoptimized Images',
          description: `Found ${performanceData.resourceSummary.largeImages.length} large images (>200KB) that should be optimized for mobile.`,
          severity: 'medium',
          category: 'mobile-performance',
          location: url,
          impact: 'High',
          effort: 'Medium',
          recommendation: 'Compress images, use WebP format, implement responsive images with srcset and sizes attributes, and consider lazy loading for below-the-fold images.'
        });
      }
      
      // Lazy loading
      if (mobileOptimizations.lazyLoading.percentage < 50 && performanceData.resourceSummary.resourcesByType?.img > 3) {
        results.issues.push({
          id: uuidv4(),
          title: 'Limited Use of Lazy Loading',
          description: `Only ${mobileOptimizations.lazyLoading.percentage}% of images use lazy loading, which can improve initial page load time on mobile.`,
          severity: 'low',
          category: 'mobile-performance',
          location: url,
          impact: 'Medium',
          effort: 'Low',
          recommendation: 'Add loading="lazy" attribute to below-the-fold images and iframes to defer their loading until they approach the viewport.'
        });
      }
      
      // Touch target size
      if (mobileOptimizations.tapTargets.percentage < 70) {
        results.issues.push({
          id: uuidv4(),
          title: 'Inadequate Touch Target Sizes',
          description: `Only ${mobileOptimizations.tapTargets.percentage}% of interactive elements have adequate touch target size (44×44px), making the page difficult to use on mobile.`,
          severity: 'medium',
          category: 'mobile-performance',
          location: url,
          impact: 'Medium',
          effort: 'Medium',
          recommendation: 'Increase the size of buttons, links, and form controls to at least 44×44px for better touch interaction on mobile devices.'
        });
      }
      
      // HTTP headers
      if (!results.headers.hasCaching) {
        results.issues.push({
          id: uuidv4(),
          title: 'Missing Cache-Control Headers',
          description: 'The page does not use cache-control headers, preventing browsers from efficiently caching resources for repeat visits.',
          severity: 'medium',
          category: 'mobile-performance',
          location: url,
          impact: 'Medium',
          effort: 'Low',
          recommendation: 'Implement appropriate cache-control headers for static resources to improve loading speed for return visitors and reduce mobile data usage.'
        });
      }
      
      if (!results.headers.hasCompression) {
        results.issues.push({
          id: uuidv4(),
          title: 'Content Not Compressed',
          description: 'The server does not use HTTP compression (gzip or Brotli), resulting in larger file transfers that are slower on mobile networks.',
          severity: 'medium',
          category: 'mobile-performance',
          location: url,
          impact: 'Medium',
          effort: 'Low',
          recommendation: 'Enable gzip or preferably Brotli compression on your server for text-based resources like HTML, CSS, JavaScript, and SVG.'
        });
      }
      
      // Calculate score based on Core Web Vitals and other factors
      
      // Base score starts at 100
      let score = 100;
      
      // Core Web Vitals scoring (weighted heavily)
      if (performanceData.largestContentfulPaint) {
        if (performanceData.largestContentfulPaint > LCP_THRESHOLD_POOR) {
          score -= 25;
        } else if (performanceData.largestContentfulPaint > LCP_THRESHOLD_GOOD) {
          score -= 15;
        }
      } else {
        score -= 10; // Unable to measure
      }
      
      if (performanceData.firstInputDelay) {
        if (performanceData.firstInputDelay > FID_THRESHOLD_POOR) {
          score -= 25;
        } else if (performanceData.firstInputDelay > FID_THRESHOLD_GOOD) {
          score -= 15;
        }
      }
      
      if (performanceData.cumulativeLayoutShift !== undefined) {
        if (performanceData.cumulativeLayoutShift > CLS_THRESHOLD_POOR) {
          score -= 25;
        } else if (performanceData.cumulativeLayoutShift > CLS_THRESHOLD_GOOD) {
          score -= 15;
        }
      } else {
        score -= 10; // Unable to measure
      }
      
      // Resource optimization scoring
      score -= Math.min(15, performanceData.resourceSummary.largeResources.length * 3);
      score -= Math.min(15, performanceData.resourceSummary.renderBlockingResources.length * 3);
      
      // Code efficiency
      if (jsUnusedPercentage > 40) {
        score -= Math.min(10, Math.floor(jsUnusedPercentage / 10));
      }
      
      if (cssUnusedPercentage > 50) {
        score -= Math.min(10, Math.floor(cssUnusedPercentage / 10));
      }
      
      // Bonus for optimizations
      if (mobileOptimizations.responsiveImages.percentage > 80) {
        score += 5;
      }
      
      if (mobileOptimizations.lazyLoading.percentage > 70) {
        score += 5;
      }
      
      if (mobileOptimizations.tapTargets.percentage > 90) {
        score += 5;
      }
      
      if (mobileOptimizations.hasServiceWorker) {
        score += 5;
      }
      
      // Bonus for HTTP optimizations
      if (results.headers.hasCaching) {
        score += 5;
      }
      
      if (results.headers.hasCompression) {
        score += 5;
      }
      
      // Ensure score is between 0 and 100
      results.score = Math.max(0, Math.min(100, Math.round(score)));
      
      // Create summary
      results.summary = {
        score: results.score,
        coreWebVitals: {
          lcp: performanceData.largestContentfulPaint ? Math.round(performanceData.largestContentfulPaint) : null,
          fid: performanceData.firstInputDelay ? Math.round(performanceData.firstInputDelay) : null,
          cls: performanceData.cumulativeLayoutShift !== undefined ? performanceData.cumulativeLayoutShift.toFixed(2) : null
        },
        loadTime: performanceData.timings.loadEventEnd ? Math.round(performanceData.timings.loadEventEnd) : null,
        resourceCount: performanceData.resourceSummary.totalCount,
        totalPageWeight: `${Math.round(performanceData.resourceSummary.totalSize / 1024)} KB`,
        issuesCount: results.issues.length,
        isOptimizedForMobile: results.score >= 80,
        recommendation: getMobilePerformanceRecommendation(results)
      };
      
      // Close browser
      await browser.close();
      
      return results;
      
    } catch (error) {
      console.error(`Error measuring mobile performance for ${url}:`, error);
      
      // Return a graceful fallback result with error information
      return {
        score: 0,
        issues: [{
          id: uuidv4(),
          title: 'Mobile Performance Measurement Failed',
          description: `Could not measure mobile performance due to error: ${error.message}`,
          severity: 'high',
          category: 'mobile-performance',
          location: url,
          recommendation: 'Check if the URL is accessible and properly formatted.'
        }],
        metrics: {},
        optimizations: {},
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
 * Generate a recommendation based on mobile performance results
 * @param {Object} results - The mobile performance results
 * @returns {string} - Recommendation
 */
function getMobilePerformanceRecommendation(results) {
  if (results.score >= 90) {
    return 'Your website performs excellently on mobile devices. Continue monitoring Core Web Vitals and keeping up with mobile optimization best practices.';
  } else if (results.score >= 70) {
    return 'Your website performs well on mobile devices but has room for improvement. Focus on addressing the identified issues to enhance mobile user experience.';
  } else if (results.score >= 50) {
    return 'Your website has moderate mobile performance issues that are likely affecting user experience and search rankings. Prioritize addressing Core Web Vitals issues and resource optimizations.';
  } else {
    return 'Your website has significant mobile performance problems that are negatively impacting user experience and search rankings. Consider a focused optimization effort targeting Core Web Vitals and reducing page weight.';
  }
}

module.exports = MobilePerformanceMeasurer;
