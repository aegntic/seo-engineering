/**
 * Responsive Design Tester
 * 
 * Tests a website's responsive design across various device sizes and
 * breakpoints to ensure content displays correctly on all devices.
 */

const { chromium, devices } = require('playwright');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;

class ResponsiveDesignTester {
  /**
   * Test responsive design for a URL
   * @param {string} url - The URL to test
   * @param {Object} options - Configuration options
   * @returns {Promise<Object>} - Responsive design test results
   */
  static async test(url, options = {}) {
    try {
      console.log(`Testing responsive design for: ${url}`);
      
      // Initialize browser
      const browser = await chromium.launch({
        headless: true,
        args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
      });
      
      // Define device configurations to test
      const defaultDevices = [
        'iPhone SE',
        'iPhone 12',
        'iPhone 12 Pro Max',
        'iPad (gen 7)',
        'iPad Pro 11',
        'Galaxy S20 Ultra',
        'Pixel 5'
      ];
      
      // Use provided devices or defaults
      const devicesList = options.devices || defaultDevices;
      
      // Add custom breakpoints
      const customBreakpoints = [
        { name: 'Small Mobile', width: 320, height: 568 },
        { name: 'Large Mobile', width: 428, height: 926 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Desktop', width: 1366, height: 768 },
        { name: 'Large Desktop', width: 1920, height: 1080 }
      ];
      
      // Initialize results
      const results = {
        score: 0,
        issues: [],
        devices: {},
        screenshots: {},
        summary: {}
      };
      
      // Create screenshots directory
      const screenshotDir = options.screenshotDir || path.join(__dirname, '../../../data/screenshots/responsive');
      await fs.mkdir(screenshotDir, { recursive: true });
      
      // Track overall responsive design quality
      let responsiveScores = [];
      
      // Test each device
      for (const deviceName of devicesList) {
        if (!devices[deviceName]) {
          console.warn(`Unknown device: ${deviceName}. Skipping.`);
          continue;
        }
        
        const deviceConfig = devices[deviceName];
        
        // Create a new context with device emulation
        const context = await browser.newContext({
          ...deviceConfig,
          userAgent: options.userAgent || deviceConfig.userAgent
        });
        
        // Create a new page
        const page = await context.newPage();
        
        // Navigate to the URL
        await page.goto(url, {
          waitUntil: 'networkidle',
          timeout: options.timeout || 30000
        });
        
        // Take a screenshot for this device
        const screenshotPath = path.join(screenshotDir, `${deviceName.replace(/\s+/g, '-').toLowerCase()}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        
        // Run responsive design tests for this device
        const deviceResults = await page.evaluate((deviceName) => {
          // Check for overflow issues
          const documentWidth = document.documentElement.scrollWidth;
          const windowWidth = window.innerWidth;
          const hasHorizontalOverflow = documentWidth > windowWidth;
          
          // Check for tiny text
          const allTextElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, li, td, th');
          const tinyTextElements = Array.from(allTextElements).filter(el => {
            if (!el.textContent.trim()) return false;
            const styles = window.getComputedStyle(el);
            const fontSize = parseFloat(styles.fontSize);
            return fontSize < 12; // 12px is minimum for readable text
          });
          
          // Check for overlapping elements
          const visibleElements = Array.from(document.querySelectorAll('*'))
            .filter(el => {
              const styles = window.getComputedStyle(el);
              return styles.display !== 'none' && styles.visibility !== 'hidden' && styles.opacity !== '0';
            });
          
          const potentialOverlaps = [];
          const checkedElements = new Set();
          
          visibleElements.forEach(el1 => {
            if (checkedElements.has(el1)) return;
            
            const rect1 = el1.getBoundingClientRect();
            if (rect1.width === 0 || rect1.height === 0) return;
            
            visibleElements.forEach(el2 => {
              if (el1 === el2 || checkedElements.has(el2)) return;
              
              // Check if they are in parent-child relationship
              if (el1.contains(el2) || el2.contains(el1)) return;
              
              const rect2 = el2.getBoundingClientRect();
              if (rect2.width === 0 || rect2.height === 0) return;
              
              // Check for overlap
              if (
                rect1.left < rect2.right &&
                rect1.right > rect2.left &&
                rect1.top < rect2.bottom &&
                rect1.bottom > rect2.top
              ) {
                // Calculate overlap percentage
                const overlapWidth = Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left);
                const overlapHeight = Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top);
                const overlapArea = overlapWidth * overlapHeight;
                const area1 = rect1.width * rect1.height;
                const area2 = rect2.width * rect2.height;
                const smallerArea = Math.min(area1, area2);
                const overlapPercentage = (overlapArea / smallerArea) * 100;
                
                // Only consider significant overlaps (more than 30%)
                if (overlapPercentage > 30) {
                  potentialOverlaps.push({
                    element1: {
                      tagName: el1.tagName,
                      id: el1.id || null,
                      className: el1.className || null,
                      text: el1.textContent ? el1.textContent.trim().substring(0, 30) : null
                    },
                    element2: {
                      tagName: el2.tagName,
                      id: el2.id || null,
                      className: el2.className || null,
                      text: el2.textContent ? el2.textContent.trim().substring(0, 30) : null
                    },
                    overlapPercentage: Math.round(overlapPercentage)
                  });
                  
                  checkedElements.add(el2);
                }
              }
            });
            
            checkedElements.add(el1);
          });
          
          // Check for offscreen content
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          
          const offscreenElements = Array.from(document.querySelectorAll('button, a, input, select, textarea'))
            .filter(el => {
              const rect = el.getBoundingClientRect();
              return (
                rect.width > 0 && rect.height > 0 &&
                (rect.left + rect.width < 0 || rect.left > viewportWidth ||
                 rect.top + rect.height < 0 || rect.top > viewportHeight * 3) // Allow some vertical scrolling
              );
            })
            .map(el => ({
              tagName: el.tagName,
              id: el.id || null,
              className: el.className || null,
              text: el.textContent ? el.textContent.trim().substring(0, 30) : null
            }));
          
          // Check for mobile-specific meta tags
          const hasMobileViewport = Boolean(document.querySelector('meta[name="viewport"]'));
          const hasAppleMobileWebApp = Boolean(document.querySelector('meta[name="apple-mobile-web-app-capable"]'));
          const hasMobileFavicons = Boolean(document.querySelector('link[rel="apple-touch-icon"]'));
          
          // Check for media query usage
          const styleSheets = Array.from(document.styleSheets);
          let mediaQueryCount = 0;
          
          try {
            for (const sheet of styleSheets) {
              if (sheet.href && !sheet.href.startsWith(window.location.origin)) {
                // Skip external stylesheets for CORS reasons
                continue;
              }
              
              try {
                const rules = Array.from(sheet.cssRules || []);
                for (const rule of rules) {
                  if (rule.type === CSSRule.MEDIA_RULE) {
                    mediaQueryCount++;
                  }
                }
              } catch (e) {
                // CORS error when accessing cssRules, skip this sheet
              }
            }
          } catch (e) {
            console.error('Error checking media queries:', e);
          }
          
          return {
            deviceName,
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight
            },
            issues: {
              horizontalOverflow: hasHorizontalOverflow,
              documentWidth,
              windowWidth,
              tinyTextCount: tinyTextElements.length,
              overlappingElementsCount: potentialOverlaps.length,
              overlappingElements: potentialOverlaps.slice(0, 5), // Limit to 5 examples
              offscreenElementsCount: offscreenElements.length,
              offscreenElements: offscreenElements.slice(0, 5) // Limit to 5 examples
            },
            responsiveFeatures: {
              hasMobileViewport,
              hasAppleMobileWebApp,
              hasMobileFavicons,
              mediaQueryCount
            }
          };
        }, deviceName);
        
        // Store results for this device
        results.devices[deviceName] = deviceResults;
        results.screenshots[deviceName] = screenshotPath;
        
        // Add issues based on this device's results
        if (deviceResults.issues.horizontalOverflow) {
          results.issues.push({
            id: uuidv4(),
            title: `Horizontal Overflow on ${deviceName}`,
            description: `The page content (${deviceResults.issues.documentWidth}px) is wider than the viewport (${deviceResults.issues.windowWidth}px) on ${deviceName}, causing horizontal scrolling.`,
            severity: 'high',
            category: 'responsive-design',
            location: url,
            device: deviceName,
            impact: 'High',
            effort: 'Medium',
            recommendation: 'Use responsive design techniques such as relative units (%, em, rem), max-width, and flex/grid layouts to ensure content fits within the mobile viewport.'
          });
        }
        
        if (deviceResults.issues.tinyTextCount > 0) {
          results.issues.push({
            id: uuidv4(),
            title: `Small Text on ${deviceName}`,
            description: `Found ${deviceResults.issues.tinyTextCount} text elements with font size smaller than 12px on ${deviceName}, which may be difficult to read.`,
            severity: 'medium',
            category: 'responsive-design',
            location: url,
            device: deviceName,
            impact: 'Medium',
            effort: 'Low',
            recommendation: 'Increase font sizes for mobile devices. Use a minimum of 14-16px for body text and ensure proper contrast. Use relative units like em or rem instead of px.'
          });
        }
        
        if (deviceResults.issues.overlappingElementsCount > 0) {
          const examples = deviceResults.issues.overlappingElements
            .map(overlap => {
              const el1 = overlap.element1.tagName + (overlap.element1.id ? `#${overlap.element1.id}` : '');
              const el2 = overlap.element2.tagName + (overlap.element2.id ? `#${overlap.element2.id}` : '');
              return `${el1} and ${el2} (${overlap.overlapPercentage}% overlap)`;
            })
            .join(', ');
          
          results.issues.push({
            id: uuidv4(),
            title: `Overlapping Elements on ${deviceName}`,
            description: `Found ${deviceResults.issues.overlappingElementsCount} instances of overlapping elements on ${deviceName}. Examples: ${examples}`,
            severity: 'high',
            category: 'responsive-design',
            location: url,
            device: deviceName,
            impact: 'High',
            effort: 'Medium',
            recommendation: 'Adjust the layout to prevent elements from overlapping on smaller screens. Use proper responsive layouts with flex/grid and appropriate media queries.'
          });
        }
        
        if (deviceResults.issues.offscreenElementsCount > 0) {
          results.issues.push({
            id: uuidv4(),
            title: `Offscreen Elements on ${deviceName}`,
            description: `Found ${deviceResults.issues.offscreenElementsCount} interactive elements positioned outside the viewport on ${deviceName}, which may be inaccessible to users.`,
            severity: 'medium',
            category: 'responsive-design',
            location: url,
            device: deviceName,
            impact: 'Medium',
            effort: 'Medium',
            recommendation: 'Ensure all interactive elements are visible and accessible within the viewport on mobile devices. Reposition elements or use different layouts for mobile.'
          });
        }
        
        // Calculate a score for this device
        let deviceScore = 100;
        
        if (deviceResults.issues.horizontalOverflow) deviceScore -= 30;
        if (deviceResults.issues.tinyTextCount > 0) deviceScore -= Math.min(20, deviceResults.issues.tinyTextCount);
        if (deviceResults.issues.overlappingElementsCount > 0) deviceScore -= Math.min(30, deviceResults.issues.overlappingElementsCount * 5);
        if (deviceResults.issues.offscreenElementsCount > 0) deviceScore -= Math.min(20, deviceResults.issues.offscreenElementsCount * 3);
        
        // Add bonus for responsive features
        if (deviceResults.responsiveFeatures.hasMobileViewport) deviceScore += 5;
        if (deviceResults.responsiveFeatures.mediaQueryCount > 0) deviceScore += Math.min(10, deviceResults.responsiveFeatures.mediaQueryCount);
        
        // Ensure device score is between 0 and 100
        deviceScore = Math.max(0, Math.min(100, Math.round(deviceScore)));
        results.devices[deviceName].score = deviceScore;
        
        // Add to overall scores
        responsiveScores.push(deviceScore);
        
        // Close the page and context
        await page.close();
        await context.close();
      }
      
      // Test custom breakpoints
      for (const breakpoint of customBreakpoints) {
        // Create context with custom viewport
        const context = await browser.newContext({
          viewport: { width: breakpoint.width, height: breakpoint.height },
          userAgent: options.userAgent || 'SEOAutomate/1.0 Responsive Testing Bot'
        });
        
        // Create page
        const page = await context.newPage();
        
        // Navigate to URL
        await page.goto(url, {
          waitUntil: 'networkidle',
          timeout: options.timeout || 30000
        });
        
        // Take a screenshot
        const screenshotPath = path.join(screenshotDir, `breakpoint-${breakpoint.width}x${breakpoint.height}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });
        
        // Check for horizontal overflow
        const hasOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        
        // Store result for this breakpoint
        results.devices[`Custom: ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`] = {
          viewport: {
            width: breakpoint.width,
            height: breakpoint.height
          },
          issues: {
            horizontalOverflow: hasOverflow
          }
        };
        
        // Add screenshot reference
        results.screenshots[`Custom: ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`] = screenshotPath;
        
        // Add issue if overflow detected
        if (hasOverflow) {
          results.issues.push({
            id: uuidv4(),
            title: `Horizontal Overflow at ${breakpoint.name} Breakpoint`,
            description: `The page has horizontal overflow at the ${breakpoint.name} breakpoint (${breakpoint.width}x${breakpoint.height}), which affects usability.`,
            severity: 'medium',
            category: 'responsive-design',
            location: url,
            device: `${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`,
            impact: 'Medium',
            effort: 'Medium',
            recommendation: 'Add or adjust media queries to handle this specific breakpoint. Ensure all elements use responsive widths.'
          });
          
          // Add to overall scores (lower score for breakpoint issues)
          responsiveScores.push(70);
        } else {
          // Add perfect score for this breakpoint
          responsiveScores.push(100);
        }
        
        // Close page and context
        await page.close();
        await context.close();
      }
      
      // Test for media queries and responsive features
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle', timeout: options.timeout || 30000 });
      
      const responsiveFeatures = await page.evaluate(() => {
        // Check for responsive meta tags
        const viewport = document.querySelector('meta[name="viewport"]');
        const viewportContent = viewport ? viewport.getAttribute('content') : null;
        
        // Check for responsive frameworks hints
        const hasBootstrap = document.querySelectorAll('.container, .row, .col, .col-md').length > 0;
        const hasFlexbox = Array.from(document.querySelectorAll('*')).some(el => {
          const style = window.getComputedStyle(el);
          return style.display === 'flex' || style.display === 'inline-flex';
        });
        const hasGrid = Array.from(document.querySelectorAll('*')).some(el => {
          const style = window.getComputedStyle(el);
          return style.display === 'grid' || style.display === 'inline-grid';
        });
        
        // Check for responsive images
        const imgElements = document.querySelectorAll('img[srcset], img[sizes], picture source');
        const hasResponsiveImages = imgElements.length > 0;
        
        // Count stylesheets and potential media queries
        let mediaQueryCount = 0;
        try {
          for (const sheet of document.styleSheets) {
            if (sheet.href && !sheet.href.startsWith(window.location.origin)) {
              // Skip external stylesheets due to CORS
              continue;
            }
            
            try {
              for (const rule of Array.from(sheet.cssRules || [])) {
                if (rule.type === CSSRule.MEDIA_RULE) {
                  mediaQueryCount++;
                }
              }
            } catch (e) {
              // CORS error, skip
            }
          }
        } catch (e) {
          console.error('Error counting media queries:', e);
        }
        
        return {
          viewport: {
            tag: viewport ? true : false,
            content: viewportContent
          },
          frameworks: {
            bootstrap: hasBootstrap,
            flexbox: hasFlexbox,
            grid: hasGrid
          },
          responsiveImages: hasResponsiveImages,
          mediaQueryCount
        };
      });
      
      // Add to results
      results.responsiveFeatures = responsiveFeatures;
      
      // Check for issues with responsive features
      if (!responsiveFeatures.viewport.tag) {
        results.issues.push({
          id: uuidv4(),
          title: 'Missing Viewport Meta Tag',
          description: 'The page does not have a viewport meta tag, which is essential for responsive design.',
          severity: 'critical',
          category: 'responsive-design',
          location: url,
          impact: 'High',
          effort: 'Low',
          recommendation: 'Add a viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1.0">'
        });
      }
      
      if (responsiveFeatures.mediaQueryCount === 0) {
        results.issues.push({
          id: uuidv4(),
          title: 'No Media Queries Detected',
          description: 'The page does not appear to use any media queries, which are essential for adapting layouts to different screen sizes.',
          severity: 'high',
          category: 'responsive-design',
          location: url,
          impact: 'High',
          effort: 'High',
          recommendation: 'Implement media queries to adjust the layout for different screen sizes. Start with common breakpoints (e.g., 768px for tablets, 480px for mobile).'
        });
      }
      
      if (!responsiveFeatures.responsiveImages && document.querySelectorAll('img').length > 5) {
        results.issues.push({
          id: uuidv4(),
          title: 'Non-Responsive Images',
          description: 'The page has multiple images but does not use responsive image techniques like srcset or picture elements.',
          severity: 'medium',
          category: 'responsive-design',
          location: url,
          impact: 'Medium',
          effort: 'Medium',
          recommendation: 'Use responsive image techniques such as srcset, sizes attributes, or picture elements to serve appropriately sized images for different devices.'
        });
      }
      
      // Close the page
      await page.close();
      
      // Calculate overall score
      // Weight device scores more heavily than feature scores
      const averageScore = responsiveScores.length > 0
        ? Math.round(responsiveScores.reduce((sum, score) => sum + score, 0) / responsiveScores.length)
        : 0;
      
      // Add bonus for responsive features
      let featureBonus = 0;
      if (responsiveFeatures.viewport.tag) featureBonus += 5;
      if (responsiveFeatures.frameworks.bootstrap || 
          responsiveFeatures.frameworks.flexbox || 
          responsiveFeatures.frameworks.grid) featureBonus += 5;
      if (responsiveFeatures.responsiveImages) featureBonus += 5;
      if (responsiveFeatures.mediaQueryCount > 3) featureBonus += 5;
      
      // Calculate final score
      results.score = Math.min(100, averageScore + featureBonus);
      
      // Create summary
      const deviceCount = Object.keys(results.devices).length;
      const issueCount = results.issues.length;
      const commonIssues = results.issues.length > 0
        ? getCommonIssueTypes(results.issues)
        : [];
      
      results.summary = {
        score: results.score,
        devicesChecked: deviceCount,
        issuesFound: issueCount,
        commonIssues,
        usesMediaQueries: responsiveFeatures.mediaQueryCount > 0,
        mediaQueryCount: responsiveFeatures.mediaQueryCount,
        usesResponsiveFrameworks: responsiveFeatures.frameworks.bootstrap || 
                                 responsiveFeatures.frameworks.flexbox || 
                                 responsiveFeatures.frameworks.grid,
        recommendation: getResponsiveRecommendation(results)
      };
      
      // Close browser
      await browser.close();
      
      return results;
      
    } catch (error) {
      console.error(`Error testing responsive design for ${url}:`, error);
      
      // Return a graceful fallback result with error information
      return {
        score: 0,
        issues: [{
          id: uuidv4(),
          title: 'Responsive Design Test Failed',
          description: `Could not test responsive design due to error: ${error.message}`,
          severity: 'high',
          category: 'responsive-design',
          location: url,
          recommendation: 'Check if the URL is accessible and properly formatted.'
        }],
        devices: {},
        screenshots: {},
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
 * Get the most common issue types from the issues array
 * @param {Array} issues - The issues array
 * @returns {Array} - Array of common issue types
 */
function getCommonIssueTypes(issues) {
  const issueCounts = {};
  
  for (const issue of issues) {
    const type = issue.title.split(' on ')[0]; // Extract the issue type without the device
    issueCounts[type] = (issueCounts[type] || 0) + 1;
  }
  
  // Sort by count and take top 3
  return Object.entries(issueCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type, count]) => `${type} (${count})`);
}

/**
 * Generate a recommendation based on responsive design test results
 * @param {Object} results - The responsive design test results
 * @returns {string} - Recommendation
 */
function getResponsiveRecommendation(results) {
  if (results.score >= 90) {
    return 'Your website has excellent responsive design that adapts well to different devices and screen sizes.';
  } else if (results.score >= 70) {
    return 'Your website has good responsive design overall but could benefit from addressing specific issues on certain devices.';
  } else if (results.score >= 50) {
    return 'Your website has several responsive design issues that should be addressed to improve the experience across different devices.';
  } else {
    return 'Your website has significant responsive design problems that are likely providing a poor experience for mobile and tablet users. Consider implementing a fully responsive design approach.';
  }
}

module.exports = ResponsiveDesignTester;
