/**
 * Meta Tag Updates Test
 * 
 * Tests the ability to update meta tags on different CMS platforms.
 * Note: This test simulates the update process but doesn't actually change the site.
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Run the meta tag updates test
 * 
 * @param {Page} page - Playwright page object
 * @param {string} url - URL being tested
 * @param {Object} env - Environment configuration
 * @returns {Object} Test result
 */
async function run(page, url, env) {
  try {
    // 1. Analyze the current meta tags
    const currentMetaTags = await extractMetaTags(page);
    
    // 2. Identify issues and create update plan
    const updatePlan = createUpdatePlan(currentMetaTags, url);
    
    // 3. Simulate the update process
    const simulationResults = await simulateUpdates(page, updatePlan);
    
    // 4. Save detailed results to a JSON file
    const resultsDir = path.join('./reports/cms-compatibility/details');
    await fs.mkdir(resultsDir, { recursive: true });
    
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace(/[^a-z0-9]/gi, '-');
    const resultsFile = path.join(
      resultsDir, 
      `meta-tag-updates-${hostname}-${env.name}.json`
    );
    
    await fs.writeFile(resultsFile, JSON.stringify({
      url,
      environment: env.name,
      currentMetaTags,
      updatePlan,
      simulationResults
    }, null, 2));
    
    // Determine test result
    const success = simulationResults.success;
    
    return {
      success,
      message: success 
        ? `Successfully simulated meta tag updates. ${updatePlan.updates.length} update(s) planned, ${simulationResults.successfulUpdates.length} would succeed, ${simulationResults.failedUpdates.length} would fail.`
        : `Issues found when simulating meta tag updates. ${simulationResults.successfulUpdates.length}/${updatePlan.updates.length} would succeed.`
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Error in meta tag updates test: ${error.message}`
    };
  }
}

/**
 * Extract meta tags from the page
 * 
 * @param {Page} page - Playwright page object
 * @returns {Object} Extracted meta tags
 */
async function extractMetaTags(page) {
  return page.evaluate(() => {
    const result = {
      title: document.title || null,
      description: null,
      keywords: null,
      robots: null,
      canonical: null,
      viewport: null,
      ogTitle: null,
      ogDescription: null,
      ogImage: null,
      ogUrl: null,
      ogType: null,
      twitterCard: null,
      twitterTitle: null,
      twitterDescription: null,
      twitterImage: null
    };
    
    // Meta description
    const descTag = document.querySelector('meta[name="description"]');
    if (descTag) result.description = descTag.getAttribute('content');
    
    // Meta keywords
    const keywordsTag = document.querySelector('meta[name="keywords"]');
    if (keywordsTag) result.keywords = keywordsTag.getAttribute('content');
    
    // Robots
    const robotsTag = document.querySelector('meta[name="robots"]');
    if (robotsTag) result.robots = robotsTag.getAttribute('content');
    
    // Canonical
    const canonicalTag = document.querySelector('link[rel="canonical"]');
    if (canonicalTag) result.canonical = canonicalTag.getAttribute('href');
    
    // Viewport
    const viewportTag = document.querySelector('meta[name="viewport"]');
    if (viewportTag) result.viewport = viewportTag.getAttribute('content');
    
    // Open Graph
    const ogTitleTag = document.querySelector('meta[property="og:title"]');
    if (ogTitleTag) result.ogTitle = ogTitleTag.getAttribute('content');
    
    const ogDescTag = document.querySelector('meta[property="og:description"]');
    if (ogDescTag) result.ogDescription = ogDescTag.getAttribute('content');
    
    const ogImageTag = document.querySelector('meta[property="og:image"]');
    if (ogImageTag) result.ogImage = ogImageTag.getAttribute('content');
    
    const ogUrlTag = document.querySelector('meta[property="og:url"]');
    if (ogUrlTag) result.ogUrl = ogUrlTag.getAttribute('content');
    
    const ogTypeTag = document.querySelector('meta[property="og:type"]');
    if (ogTypeTag) result.ogType = ogTypeTag.getAttribute('content');
    
    // Twitter Card
    const twitterCardTag = document.querySelector('meta[name="twitter:card"]');
    if (twitterCardTag) result.twitterCard = twitterCardTag.getAttribute('content');
    
    const twitterTitleTag = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitleTag) result.twitterTitle = twitterTitleTag.getAttribute('content');
    
    const twitterDescTag = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescTag) result.twitterDescription = twitterDescTag.getAttribute('content');
    
    const twitterImageTag = document.querySelector('meta[name="twitter:image"]');
    if (twitterImageTag) result.twitterImage = twitterImageTag.getAttribute('content');
    
    return result;
  });
}

/**
 * Create an update plan for meta tags
 * 
 * @param {Object} metaTags - Current meta tags
 * @param {string} url - URL being tested
 * @returns {Object} Update plan
 */
function createUpdatePlan(metaTags, url) {
  const updates = [];
  const pageTitle = metaTags.title || '';
  const pageUrl = url;
  
  // Check title
  if (!metaTags.title || metaTags.title.length < 10 || metaTags.title.length > 60) {
    updates.push({
      type: 'title',
      current: metaTags.title,
      proposed: metaTags.title 
        ? (metaTags.title.length < 10 
            ? metaTags.title + ' - Optimized for SEO' 
            : metaTags.title.substring(0, 57) + '...')
        : 'New Optimized Title for this Page',
      reason: !metaTags.title 
        ? 'Title is missing' 
        : (metaTags.title.length < 10 
            ? 'Title is too short' 
            : 'Title is too long')
    });
  }
  
  // Check description
  if (!metaTags.description || metaTags.description.length < 50 || metaTags.description.length > 160) {
    updates.push({
      type: 'meta',
      name: 'description',
      current: metaTags.description,
      proposed: metaTags.description 
        ? (metaTags.description.length < 50 
            ? metaTags.description + ' This is an expanded meta description to improve SEO performance and click-through rates.' 
            : metaTags.description.substring(0, 157) + '...')
        : `This page is about ${pageTitle}. Click to learn more about our products and services.`,
      reason: !metaTags.description 
        ? 'Description is missing' 
        : (metaTags.description.length < 50 
            ? 'Description is too short' 
            : 'Description is too long')
    });
  }
  
  // Check canonical
  if (!metaTags.canonical) {
    updates.push({
      type: 'link',
      rel: 'canonical',
      current: null,
      proposed: pageUrl,
      reason: 'Canonical tag is missing'
    });
  }
  
  // Check viewport
  if (!metaTags.viewport) {
    updates.push({
      type: 'meta',
      name: 'viewport',
      current: null,
      proposed: 'width=device-width, initial-scale=1.0',
      reason: 'Viewport meta tag is missing (poor mobile optimization)'
    });
  }
  
  // Check Open Graph tags
  if (!metaTags.ogTitle) {
    updates.push({
      type: 'meta',
      property: 'og:title',
      current: null,
      proposed: pageTitle,
      reason: 'OG Title is missing'
    });
  }
  
  if (!metaTags.ogDescription) {
    updates.push({
      type: 'meta',
      property: 'og:description',
      current: null,
      proposed: metaTags.description || `Learn more about ${pageTitle} on our website.`,
      reason: 'OG Description is missing'
    });
  }
  
  if (!metaTags.ogUrl) {
    updates.push({
      type: 'meta',
      property: 'og:url',
      current: null,
      proposed: pageUrl,
      reason: 'OG URL is missing'
    });
  }
  
  if (!metaTags.ogType) {
    updates.push({
      type: 'meta',
      property: 'og:type',
      current: null,
      proposed: 'website',
      reason: 'OG Type is missing'
    });
  }
  
  // Check Twitter Card tags
  if (!metaTags.twitterCard) {
    updates.push({
      type: 'meta',
      name: 'twitter:card',
      current: null,
      proposed: 'summary',
      reason: 'Twitter Card is missing'
    });
  }
  
  if (!metaTags.twitterTitle) {
    updates.push({
      type: 'meta',
      name: 'twitter:title',
      current: null,
      proposed: pageTitle,
      reason: 'Twitter Title is missing'
    });
  }
  
  if (!metaTags.twitterDescription) {
    updates.push({
      type: 'meta',
      name: 'twitter:description',
      current: null,
      proposed: metaTags.description || `Learn more about ${pageTitle} on our website.`,
      reason: 'Twitter Description is missing'
    });
  }
  
  return {
    url: pageUrl,
    updates,
    updateCount: updates.length
  };
}

/**
 * Simulate the update process
 * 
 * @param {Page} page - Playwright page object
 * @param {Object} updatePlan - Plan for meta tag updates
 * @returns {Object} Simulation results
 */
async function simulateUpdates(page, updatePlan) {
  // This function simulates the update process without actually changing the site
  // It checks if the elements are accessible in a way that we could update them
  const simulationResults = await page.evaluate((plan) => {
    const results = {
      successfulUpdates: [],
      failedUpdates: [],
      success: false
    };
    
    // Process each planned update
    plan.updates.forEach(update => {
      // Clone the update to store results
      const result = { ...update, success: false, reason: '' };
      
      try {
        switch (update.type) {
          case 'title':
            // Check if we can access the title
            if (document.title !== undefined) {
              // In a real implementation, we would do:
              // document.title = update.proposed;
              result.success = true;
            } else {
              result.reason = 'Cannot access document title';
            }
            break;
            
          case 'meta':
            let metaTag;
            
            if (update.name) {
              // Find meta tag by name
              metaTag = document.querySelector(`meta[name="${update.name}"]`);
              
              if (!metaTag) {
                // Create a new meta tag if it doesn't exist
                // In a real implementation we would do:
                // metaTag = document.createElement('meta');
                // metaTag.setAttribute('name', update.name);
                // metaTag.setAttribute('content', update.proposed);
                // document.head.appendChild(metaTag);
                result.success = true;
                result.reason = 'Would create new meta tag';
              } else {
                // Update existing meta tag
                // In a real implementation we would do:
                // metaTag.setAttribute('content', update.proposed);
                result.success = true;
                result.reason = 'Would update existing meta tag';
              }
            } else if (update.property) {
              // Find meta tag by property
              metaTag = document.querySelector(`meta[property="${update.property}"]`);
              
              if (!metaTag) {
                // Create a new meta tag if it doesn't exist
                // In a real implementation we would do:
                // metaTag = document.createElement('meta');
                // metaTag.setAttribute('property', update.property);
                // metaTag.setAttribute('content', update.proposed);
                // document.head.appendChild(metaTag);
                result.success = true;
                result.reason = 'Would create new meta tag';
              } else {
                // Update existing meta tag
                // In a real implementation we would do:
                // metaTag.setAttribute('content', update.proposed);
                result.success = true;
                result.reason = 'Would update existing meta tag';
              }
            } else {
              result.reason = 'Invalid meta tag update (missing name or property)';
            }
            break;
            
          case 'link':
            if (update.rel === 'canonical') {
              let linkTag = document.querySelector('link[rel="canonical"]');
              
              if (!linkTag) {
                // Create a new link tag if it doesn't exist
                // In a real implementation we would do:
                // linkTag = document.createElement('link');
                // linkTag.setAttribute('rel', 'canonical');
                // linkTag.setAttribute('href', update.proposed);
                // document.head.appendChild(linkTag);
                result.success = true;
                result.reason = 'Would create new canonical link';
              } else {
                // Update existing link tag
                // In a real implementation we would do:
                // linkTag.setAttribute('href', update.proposed);
                result.success = true;
                result.reason = 'Would update existing canonical link';
              }
            } else {
              result.reason = 'Invalid link update (only canonical supported)';
            }
            break;
            
          default:
            result.reason = `Unsupported update type: ${update.type}`;
        }
      } catch (error) {
        result.reason = `Error: ${error.message}`;
      }
      
      // Add to appropriate result array
      if (result.success) {
        results.successfulUpdates.push(result);
      } else {
        results.failedUpdates.push(result);
      }
    });
    
    // Determine overall success
    results.success = results.successfulUpdates.length > 0 && 
                     results.failedUpdates.length === 0;
    
    return results;
  }, updatePlan);
  
  return simulationResults;
}

module.exports = { run };
