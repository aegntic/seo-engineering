/**
 * Touch Elements Validator
 * 
 * Analyzes interactive elements (buttons, links, form controls) for mobile touch usability.
 * Checks for proper sizing, spacing, and touch targets to ensure good user experience.
 */

const { chromium, devices } = require('playwright');
const { v4: uuidv4 } = require('uuid');

class TouchElementValidator {
  /**
   * Validate touch elements for a URL
   * @param {string} url - The URL to analyze
   * @param {Object} options - Configuration options
   * @returns {Promise<Object>} - Touch elements validation results
   */
  static async validate(url, options = {}) {
    try {
      console.log(`Validating touch elements for: ${url}`);
      
      // Initialize browser
      const browser = await chromium.launch({
        headless: true,
        args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
      });
      
      // Set up device to emulate
      const deviceName = options.device || 'iPhone 12';
      const deviceConfig = devices[deviceName];
      
      if (!deviceConfig) {
        throw new Error(`Unknown device: ${deviceName}`);
      }
      
      // Create a new context with mobile device emulation
      const context = await browser.newContext({
        ...deviceConfig,
        userAgent: options.userAgent || deviceConfig.userAgent
      });
      
      // Create a new page
      const page = await context.newPage();
      
      // Initialize results
      const results = {
        score: 0,
        issues: [],
        elements: {
          total: 0,
          tooSmall: [],
          tooClose: [],
          invisible: []
        },
        summary: {}
      };
      
      // Navigate to the page with timeout
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: options.timeout || 30000
      });
      
      // Wait for the page to be fully loaded
      await page.waitForLoadState('domcontentloaded');
      
      // Extract information about touchable elements using Playwright's evaluate
      const touchElements = await page.evaluate(() => {
        // Define minimum sizes for touch elements (based on guidelines)
        const MIN_TOUCH_SIZE = 44; // Apple's recommendation is 44x44 points
        const MIN_ELEMENT_SPACING = 8; // Minimum spacing between elements
        
        // Function to get element position and size
        const getElementDetails = (element) => {
          const rect = element.getBoundingClientRect();
          const styles = window.getComputedStyle(element);
          
          return {
            tagName: element.tagName.toLowerCase(),
            id: element.id || null,
            className: element.className || null,
            text: element.textContent ? element.textContent.trim().substring(0, 50) : null,
            rect: {
              top: rect.top,
              right: rect.right,
              bottom: rect.bottom,
              left: rect.left,
              width: rect.width,
              height: rect.height
            },
            styles: {
              display: styles.display,
              visibility: styles.visibility,
              opacity: parseFloat(styles.opacity),
              position: styles.position
            },
            attributes: {
              role: element.getAttribute('role') || null,
              type: element.getAttribute('type') || null,
              href: element.getAttribute('href') || null
            }
          };
        };
        
        // Function to check if elements are too close to each other
        const areElementsTooClose = (rect1, rect2) => {
          // Check horizontal spacing
          if (
            (rect1.left <= rect2.right && rect1.right >= rect2.left) || 
            (rect2.left <= rect1.right && rect2.right >= rect1.left)
          ) {
            // Horizontal overlap, check vertical spacing
            const verticalSpacing = Math.min(
              Math.abs(rect1.bottom - rect2.top), 
              Math.abs(rect2.bottom - rect1.top)
            );
            if (verticalSpacing < MIN_ELEMENT_SPACING) {
              return true;
            }
          }
          
          // Check vertical spacing
          if (
            (rect1.top <= rect2.bottom && rect1.bottom >= rect2.top) ||
            (rect2.top <= rect1.bottom && rect2.bottom >= rect1.top)
          ) {
            // Vertical overlap, check horizontal spacing
            const horizontalSpacing = Math.min(
              Math.abs(rect1.right - rect2.left),
              Math.abs(rect2.right - rect1.left)
            );
            if (horizontalSpacing < MIN_ELEMENT_SPACING) {
              return true;
            }
          }
          
          return false;
        };
        
        // Function to check if element is actually visible
        const isElementVisible = (styles) => {
          return (
            styles.display !== 'none' &&
            styles.visibility !== 'hidden' &&
            styles.opacity > 0
          );
        };
        
        // Collect all interactive elements
        const interactiveSelectors = [
          'a', 'button', 'input', 'select', 'textarea',
          '[role="button"]', '[role="link"]', '[role="checkbox"]',
          '[role="radio"]', '[role="menuitem"]', '[role="tab"]',
          '[onclick]', '[onmousedown]', '[ontouchstart]'
        ];
        
        const allElements = document.querySelectorAll(interactiveSelectors.join(','));
        const elements = Array.from(allElements).map(getElementDetails);
        
        // Filter to only include elements that are in the viewport
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        const visibleElements = elements.filter(el => {
          return (
            isElementVisible(el.styles) &&
            el.rect.bottom >= 0 &&
            el.rect.right >= 0 &&
            el.rect.top <= viewportHeight &&
            el.rect.left <= viewportWidth
          );
        });
        
        // Find elements that are too small
        const tooSmallElements = visibleElements.filter(el => {
          return el.rect.width < MIN_TOUCH_SIZE || el.rect.height < MIN_TOUCH_SIZE;
        });
        
        // Find elements that are too close to each other
        const tooCloseElementPairs = [];
        for (let i = 0; i < visibleElements.length; i++) {
          for (let j = i + 1; j < visibleElements.length; j++) {
            if (areElementsTooClose(visibleElements[i].rect, visibleElements[j].rect)) {
              tooCloseElementPairs.push({
                element1: visibleElements[i],
                element2: visibleElements[j]
              });
            }
          }
        }
        
        // Find invisible elements that receive events
        const allInteractiveElements = document.querySelectorAll(interactiveSelectors.join(','));
        const invisibleInteractiveElements = Array.from(allInteractiveElements)
          .filter(el => {
            const styles = window.getComputedStyle(el);
            return !isElementVisible({
              display: styles.display,
              visibility: styles.visibility,
              opacity: parseFloat(styles.opacity)
            });
          })
          .map(getElementDetails);
        
        return {
          totalInteractiveElements: allInteractiveElements.length,
          visibleCount: visibleElements.length,
          tooSmallElements,
          tooCloseElementPairs,
          invisibleInteractiveElements
        };
      });
      
      // Store element information
      results.elements = {
        total: touchElements.totalInteractiveElements,
        visible: touchElements.visibleCount,
        tooSmall: touchElements.tooSmallElements,
        tooClose: touchElements.tooCloseElementPairs,
        invisible: touchElements.invisibleInteractiveElements
      };
      
      // Check for issues
      
      // Too small elements
      if (touchElements.tooSmallElements.length > 0) {
        const elementsToShow = Math.min(touchElements.tooSmallElements.length, 10);
        const elementsList = touchElements.tooSmallElements
          .slice(0, elementsToShow)
          .map(el => {
            let description = `${el.tagName}`;
            if (el.id) description += `#${el.id}`;
            if (el.className) description += `.${el.className.split(' ')[0]}`;
            description += ` (${Math.round(el.rect.width)}x${Math.round(el.rect.height)}px)`;
            return description;
          })
          .join(', ');
        
        const additionalCount = touchElements.tooSmallElements.length - elementsToShow;
        const additionalText = additionalCount > 0 ? ` and ${additionalCount} more` : '';
        
        results.issues.push({
          id: uuidv4(),
          title: 'Touch Elements Too Small',
          description: `Found ${touchElements.tooSmallElements.length} interactive elements that are smaller than the recommended minimum size (44x44px). Examples: ${elementsList}${additionalText}.`,
          severity: touchElements.tooSmallElements.length > 5 ? 'high' : 'medium',
          category: 'touch-elements',
          location: url,
          impact: touchElements.tooSmallElements.length > 5 ? 'High' : 'Medium',
          effort: 'Medium',
          recommendation: 'Increase the size of touch elements to at least 44x44 pixels to ensure they are easily tappable on mobile devices. Use padding if needed to increase the touch target without changing the visual size.'
        });
      }
      
      // Elements too close together
      if (touchElements.tooCloseElementPairs.length > 0) {
        const elementsToShow = Math.min(touchElements.tooCloseElementPairs.length, 5);
        const elementsList = touchElements.tooCloseElementPairs
          .slice(0, elementsToShow)
          .map(pair => {
            let el1 = `${pair.element1.tagName}`;
            if (pair.element1.id) el1 += `#${pair.element1.id}`;
            
            let el2 = `${pair.element2.tagName}`;
            if (pair.element2.id) el2 += `#${pair.element2.id}`;
            
            return `${el1} and ${el2}`;
          })
          .join(', ');
        
        const additionalCount = touchElements.tooCloseElementPairs.length - elementsToShow;
        const additionalText = additionalCount > 0 ? ` and ${additionalCount} more pairs` : '';
        
        results.issues.push({
          id: uuidv4(),
          title: 'Touch Elements Too Close Together',
          description: `Found ${touchElements.tooCloseElementPairs.length} pairs of interactive elements that are too close to each other, making them difficult to tap accurately. Examples: ${elementsList}${additionalText}.`,
          severity: touchElements.tooCloseElementPairs.length > 3 ? 'high' : 'medium',
          category: 'touch-elements',
          location: url,
          impact: 'High',
          effort: 'Medium',
          recommendation: 'Increase the spacing between interactive elements to at least 8px to reduce accidental taps. Consider reorganizing the layout for better touch usability.'
        });
      }
      
      // Invisible interactive elements
      if (touchElements.invisibleInteractiveElements.length > 0) {
        results.issues.push({
          id: uuidv4(),
          title: 'Invisible Interactive Elements',
          description: `Found ${touchElements.invisibleInteractiveElements.length} interactive elements that are not visible but may still receive touch events, which can cause unexpected behavior.`,
          severity: 'medium',
          category: 'touch-elements',
          location: url,
          impact: 'Medium',
          effort: 'Low',
          recommendation: 'Remove event handlers from invisible elements or make them visible. Ensure that all interactive elements are visible to users.'
        });
      }
      
      // Check if there are very few interactive elements (potentially a problem)
      if (touchElements.visibleCount < 2 && touchElements.totalInteractiveElements > 0) {
        results.issues.push({
          id: uuidv4(),
          title: 'Few Visible Interactive Elements',
          description: `Only ${touchElements.visibleCount} interactive elements are visible in the viewport. This may indicate that elements are hidden or not rendered correctly on mobile.`,
          severity: 'medium',
          category: 'touch-elements',
          location: url,
          impact: 'Medium',
          effort: 'Medium',
          recommendation: 'Verify that all interactive elements are correctly displayed on mobile devices. Consider testing on multiple devices and browsers.'
        });
      }
      
      // Calculate score based on issues
      // Base score starts at 100
      let score = 100;
      
      // Deduct points based on issue severity and element count
      if (touchElements.tooSmallElements.length > 0) {
        const percentage = Math.min(1, touchElements.tooSmallElements.length / Math.max(1, touchElements.visibleCount));
        score -= Math.round(percentage * 40); // Up to 40 points off
      }
      
      if (touchElements.tooCloseElementPairs.length > 0) {
        const percentage = Math.min(1, touchElements.tooCloseElementPairs.length / Math.max(1, touchElements.visibleCount));
        score -= Math.round(percentage * 30); // Up to 30 points off
      }
      
      if (touchElements.invisibleInteractiveElements.length > 0) {
        score -= Math.min(20, touchElements.invisibleInteractiveElements.length * 2); // 2 points per invisible element, up to 20
      }
      
      // Ensure score is between 0 and 100
      results.score = Math.max(0, Math.min(100, Math.round(score)));
      
      // Create summary
      results.summary = {
        score: results.score,
        totalElements: touchElements.totalInteractiveElements,
        visibleElements: touchElements.visibleCount,
        tooSmallCount: touchElements.tooSmallElements.length,
        tooCloseCount: touchElements.tooCloseElementPairs.length,
        invisibleCount: touchElements.invisibleInteractiveElements.length,
        recommendation: getTouchElementsRecommendation(results)
      };
      
      // Take a screenshot for reference
      await page.screenshot({ path: `touch-elements-${new URL(url).hostname}.png` });
      
      // Close browser
      await browser.close();
      
      return results;
      
    } catch (error) {
      console.error(`Error validating touch elements for ${url}:`, error);
      
      // Return a graceful fallback result with error information
      return {
        score: 0,
        issues: [{
          id: uuidv4(),
          title: 'Touch Elements Validation Failed',
          description: `Could not validate touch elements due to error: ${error.message}`,
          severity: 'high',
          category: 'touch-elements',
          location: url,
          recommendation: 'Check if the URL is accessible and properly formatted.'
        }],
        elements: {
          total: 0,
          tooSmall: [],
          tooClose: [],
          invisible: []
        },
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
 * Generate a recommendation based on touch elements validation results
 * @param {Object} results - The touch elements validation results
 * @returns {string} - Recommendation
 */
function getTouchElementsRecommendation(results) {
  if (results.score >= 90) {
    return 'Your touch elements are well-optimized for mobile interactions.';
  } else if (results.score >= 70) {
    return 'Your touch elements are generally good but some improvements to size and spacing would enhance mobile usability.';
  } else if (results.score >= 50) {
    return 'Your touch elements have several issues that are likely affecting mobile usability and should be addressed.';
  } else {
    return 'Your touch elements have significant issues that are negatively impacting mobile usability and should be fixed as a priority.';
  }
}

module.exports = TouchElementValidator;
