/**
 * Meta Tags Extraction Test
 * 
 * Tests the ability to extract and analyze meta tags from different CMS platforms.
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Run the meta tags extraction test
 * 
 * @param {Page} page - Playwright page object
 * @param {string} url - URL being tested
 * @param {Object} env - Environment configuration
 * @returns {Object} Test result
 */
async function run(page, url, env) {
  try {
    // Extract all meta tags from the page
    const metaTags = await page.evaluate(() => {
      // Get all meta tags
      const allMetaTags = Array.from(document.querySelectorAll('meta'));
      
      // Transform into a more usable format
      return allMetaTags.map(tag => {
        const attributes = {};
        
        // Get all attributes
        Array.from(tag.attributes).forEach(attr => {
          attributes[attr.name] = attr.value;
        });
        
        return attributes;
      });
    });
    
    // Extract key SEO meta tags
    const seoMetaTags = await page.evaluate(() => {
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
    
    // Evaluate meta tags quality
    const evaluation = evaluateMetaTags(seoMetaTags);
    
    // Save detailed results to a JSON file
    const resultsDir = path.join('./reports/cms-compatibility/details');
    await fs.mkdir(resultsDir, { recursive: true });
    
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace(/[^a-z0-9]/gi, '-');
    const resultsFile = path.join(
      resultsDir, 
      `meta-tags-${hostname}-${env.name}.json`
    );
    
    await fs.writeFile(resultsFile, JSON.stringify({
      url,
      environment: env.name,
      allMetaTags: metaTags,
      seoMetaTags,
      evaluation
    }, null, 2));
    
    // Determine test result
    const success = evaluation.score >= 60; // At least 60% quality score
    
    return {
      success,
      message: success 
        ? `Successfully extracted meta tags with a quality score of ${evaluation.score}%. ${evaluation.goodFactors.length} good factors, ${evaluation.badFactors.length} issues found.`
        : `Meta tags quality issues found. Score: ${evaluation.score}%. ${evaluation.badFactors.length} issues need attention.`
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Error in meta tags extraction test: ${error.message}`
    };
  }
}

/**
 * Evaluate the quality of meta tags
 * 
 * @param {Object} metaTags - Extracted meta tags
 * @returns {Object} Evaluation results
 */
function evaluateMetaTags(metaTags) {
  const goodFactors = [];
  const badFactors = [];
  
  // Title evaluation
  if (metaTags.title) {
    if (metaTags.title.length >= 10 && metaTags.title.length <= 60) {
      goodFactors.push('Title has good length (10-60 characters)');
    } else if (metaTags.title.length < 10) {
      badFactors.push('Title is too short (less than 10 characters)');
    } else {
      badFactors.push('Title is too long (more than 60 characters)');
    }
  } else {
    badFactors.push('Title is missing');
  }
  
  // Description evaluation
  if (metaTags.description) {
    if (metaTags.description.length >= 50 && metaTags.description.length <= 160) {
      goodFactors.push('Description has good length (50-160 characters)');
    } else if (metaTags.description.length < 50) {
      badFactors.push('Description is too short (less than 50 characters)');
    } else {
      badFactors.push('Description is too long (more than 160 characters)');
    }
  } else {
    badFactors.push('Description is missing');
  }
  
  // Canonical evaluation
  if (metaTags.canonical) {
    goodFactors.push('Canonical tag is present');
  } else {
    badFactors.push('Canonical tag is missing');
  }
  
  // Viewport evaluation
  if (metaTags.viewport) {
    goodFactors.push('Viewport meta tag is present');
  } else {
    badFactors.push('Viewport meta tag is missing (poor mobile optimization)');
  }
  
  // Open Graph evaluation
  let ogTagsPresent = 0;
  if (metaTags.ogTitle) ogTagsPresent++;
  if (metaTags.ogDescription) ogTagsPresent++;
  if (metaTags.ogImage) ogTagsPresent++;
  if (metaTags.ogUrl) ogTagsPresent++;
  if (metaTags.ogType) ogTagsPresent++;
  
  if (ogTagsPresent === 5) {
    goodFactors.push('All important Open Graph tags are present');
  } else if (ogTagsPresent > 0) {
    badFactors.push(`Some Open Graph tags are missing (${ogTagsPresent}/5 present)`);
  } else {
    badFactors.push('No Open Graph tags found (poor social sharing optimization)');
  }
  
  // Twitter Card evaluation
  let twitterTagsPresent = 0;
  if (metaTags.twitterCard) twitterTagsPresent++;
  if (metaTags.twitterTitle) twitterTagsPresent++;
  if (metaTags.twitterDescription) twitterTagsPresent++;
  if (metaTags.twitterImage) twitterTagsPresent++;
  
  if (twitterTagsPresent === 4) {
    goodFactors.push('All important Twitter Card tags are present');
  } else if (twitterTagsPresent > 0) {
    badFactors.push(`Some Twitter Card tags are missing (${twitterTagsPresent}/4 present)`);
  } else {
    badFactors.push('No Twitter Card tags found (poor Twitter sharing optimization)');
  }
  
  // Calculate overall score (100% = perfect meta tags)
  const totalFactors = goodFactors.length + badFactors.length;
  const score = Math.round((goodFactors.length / totalFactors) * 100);
  
  return {
    score,
    goodFactors,
    badFactors
  };
}

module.exports = { run };
