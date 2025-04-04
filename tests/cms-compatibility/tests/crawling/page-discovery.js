/**
 * Page Discovery Test
 * 
 * Tests the crawler's ability to discover pages on the target CMS platform.
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Run the page discovery test
 * 
 * @param {Page} page - Playwright page object
 * @param {string} url - URL being tested
 * @param {Object} env - Environment configuration
 * @returns {Object} Test result
 */
async function run(page, url, env) {
  try {
    // Check for internal links
    const links = await page.evaluate(() => {
      // Get all links on the page
      const allLinks = Array.from(document.querySelectorAll('a[href]'))
        .map(a => a.href)
        // Filter out external links, anchors, javascript, mailto, tel, etc.
        .filter(href => {
          try {
            const url = new URL(href);
            const currentUrl = new URL(window.location.href);
            return url.hostname === currentUrl.hostname && 
                  !href.startsWith('javascript:') && 
                  !href.startsWith('mailto:') && 
                  !href.startsWith('tel:') &&
                  !href.includes('#');
          } catch (e) {
            return false;
          }
        });
      
      // Remove duplicates
      return [...new Set(allLinks)];
    });
    
    if (links.length === 0) {
      return {
        success: false,
        message: 'No internal links discovered on the page'
      };
    }
    
    // Try to visit a subset of the discovered links (max 3)
    const maxLinksToTest = Math.min(3, links.length);
    const testedLinks = [];
    
    for (let i = 0; i < maxLinksToTest; i++) {
      const linkUrl = links[i];
      try {
        // Navigate to the link
        await page.goto(linkUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
        
        // Check if navigation was successful
        const currentUrl = page.url();
        const pageTitle = await page.title();
        
        testedLinks.push({
          url: linkUrl,
          visited: true,
          title: pageTitle,
          status: 'success'
        });
        
        // Go back to the original page
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
        
      } catch (error) {
        testedLinks.push({
          url: linkUrl,
          visited: false,
          error: error.message,
          status: 'failed'
        });
      }
    }
    
    // Save detailed results to a JSON file
    const resultsDir = path.join('./reports/cms-compatibility/details');
    await fs.mkdir(resultsDir, { recursive: true });
    
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace(/[^a-z0-9]/gi, '-');
    const resultsFile = path.join(
      resultsDir, 
      `page-discovery-${hostname}-${env.name}.json`
    );
    
    await fs.writeFile(resultsFile, JSON.stringify({
      url,
      environment: env.name,
      totalLinks: links.length,
      testedLinks,
      allLinks: links
    }, null, 2));
    
    // Determine test result
    const successfulNavigations = testedLinks.filter(link => link.status === 'success').length;
    const success = successfulNavigations > 0;
    
    return {
      success,
      message: success 
        ? `Successfully discovered and visited ${successfulNavigations} of ${testedLinks.length} links`
        : `Failed to navigate to any of the ${testedLinks.length} tested links`
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Error in page discovery test: ${error.message}`
    };
  }
}

module.exports = { run };
