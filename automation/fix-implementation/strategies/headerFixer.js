/**
 * Header Structure Fixer Strategy
 * 
 * Improves header hierarchy for better SEO:
 * - Ensures single H1 per page
 * - Corrects header hierarchy (H1 → H2 → H3)
 * - Improves keyword usage in headers
 * - Adds missing headers where appropriate
 */

const cheerio = require('cheerio');
const siteAdapter = require('../siteAdapter');
const logger = require('../../utils/logger');

// Header structure recommendations
const HEADER_RECOMMENDATIONS = {
  'h1': {
    maxPerPage: 1,
    recommendations: [
      'Include primary keyword in H1',
      'Place H1 near the top of the content',
      'Make H1 descriptive of page content',
      'Keep H1 length between 20-70 characters'
    ]
  },
  'hierarchy': {
    recommendations: [
      'Use proper nesting (H1 → H2 → H3)',
      'Don\'t skip heading levels',
      'Use H2s for main sections, H3s for subsections'
    ]
  },
  'keywords': {
    recommendations: [
      'Include relevant keywords naturally',
      'Vary keyword usage across headers',
      'Ensure headers accurately describe content'
    ]
  }
};

/**
 * Fixes header structure issues in HTML files
 * @param {string} repoPath - Path to the repository
 * @param {string} filePath - Path to the file being fixed
 * @param {Object} issue - Issue details
 * @param {Object} siteStructure - Site structure information
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} - Fix result
 */
async function fix(repoPath, filePath, issue, siteStructure, options = {}) {
  try {
    // Ensure this is an HTML file
    if (!isHtmlFile(filePath)) {
      return {
        success: false,
        error: 'Not an HTML file'
      };
    }
    
    // Read the file content
    const content = await siteAdapter.readFile(repoPath, filePath);
    
    // Parse HTML
    const $ = cheerio.load(content, { decodeEntities: false });
    
    // Keep track of changes
    const changes = [];
    
    // Apply appropriate fix based on issue subtype
    switch (issue.subType) {
      case 'multiple-h1':
        changes.push(...fixMultipleH1Tags($, issue.details));
        break;
      case 'missing-h1':
        changes.push(...fixMissingH1Tag($, issue.details));
        break;
      case 'incorrect-hierarchy':
        changes.push(...fixIncorrectHierarchy($, issue.details));
        break;
      case 'keyword-optimization':
        changes.push(...optimizeHeaderKeywords($, issue.details));
        break;
      default:
        return {
          success: false,
          error: `Unknown header structure issue subtype: ${issue.subType}`
        };
    }
    
    // If no changes were made, return failure
    if (changes.length === 0) {
      return {
        success: false,
        error: 'No changes were needed or could be made'
      };
    }
    
    // Write the updated file
    const updatedContent = $.html();
    await siteAdapter.writeFile(repoPath, filePath, updatedContent);
    
    return {
      success: true,
      changes
    };
  } catch (error) {
    logger.error(`Header structure fix failed: ${error.message}`);
    return {
      success: false,
      error: `Failed to fix header structure: ${error.message}`
    };
  }
}

/**
 * Fixes pages with multiple H1 tags
 * @param {Object} $ - Cheerio instance
 * @param {Object} details - Issue details
 * @returns {Array} - List of changes made
 */
function fixMultipleH1Tags($, details) {
  const changes = [];
  const h1Tags = $('h1');
  
  // If there are multiple H1 tags
  if (h1Tags.length > 1) {
    // Keep the first H1 and convert others to H2
    h1Tags.each((i, el) => {
      if (i > 0) {
        const originalText = $(el).html();
        $(el).replaceWith(`<h2>${originalText}</h2>`);
        
        changes.push({
          type: 'convert',
          element: 'h1',
          to: 'h2',
          content: originalText.trim()
        });
      }
    });
  }
  
  return changes;
}

/**
 * Fixes pages missing an H1 tag
 * @param {Object} $ - Cheerio instance
 * @param {Object} details - Issue details
 * @returns {Array} - List of changes made
 */
function fixMissingH1Tag($, details) {
  const changes = [];
  
  // Check if there's already an H1
  if ($('h1').length > 0) {
    return changes;
  }
  
  // Determine H1 text to use
  let h1Text = details.suggestedH1 || '';
  
  // If no suggested H1, try to use page title
  if (!h1Text && $('title').length > 0) {
    h1Text = $('title').text().trim();
  }
  
  // Try to find the first H2 and promote it to H1
  if (!h1Text && $('h2').length > 0) {
    const firstH2 = $('h2').first();
    h1Text = firstH2.html();
    firstH2.remove();
  }
  
  // If still no H1 text, use a default based on filename
  if (!h1Text) {
    // Extract page name from filePath
    const pageName = details.pageName || 'Home Page';
    h1Text = pageName.replace(/-/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize words
  }
  
  // Find appropriate location for H1
  // First try to add it to a header or main element
  let inserted = false;
  
  // Try header first
  if ($('header').length > 0) {
    const header = $('header').first();
    header.prepend(`<h1>${h1Text}</h1>`);
    inserted = true;
  } 
  // Then try main
  else if ($('main').length > 0) {
    const main = $('main').first();
    main.prepend(`<h1>${h1Text}</h1>`);
    inserted = true;
  }
  // Otherwise insert after opening body tag
  else {
    $('body').prepend(`<h1>${h1Text}</h1>`);
    inserted = true;
  }
  
  if (inserted) {
    changes.push({
      type: 'add',
      element: 'h1',
      value: h1Text
    });
  }
  
  return changes;
}

/**
 * Fixes incorrect header hierarchy
 * @param {Object} $ - Cheerio instance
 * @param {Object} details - Issue details
 * @returns {Array} - List of changes made
 */
function fixIncorrectHierarchy($, details) {
  const changes = [];
  
  // Get all headers in the page
  const headers = $('h1, h2, h3, h4, h5, h6').toArray();
  
  // Skip if no headers found
  if (headers.length === 0) {
    return changes;
  }
  
  // Track current hierarchy level
  let currentLevel = 1;
  let previousTagName = '';
  
  // Process each header
  for (let i = 0; i < headers.length; i++) {
    const header = $(headers[i]);
    const tagName = headers[i].tagName.toLowerCase();
    const level = parseInt(tagName.substring(1), 10);
    
    // Special case for the first header - it should be H1
    if (i === 0 && level > 1) {
      const content = header.html();
      header.replaceWith(`<h1>${content}</h1>`);
      
      changes.push({
        type: 'convert',
        element: tagName,
        to: 'h1',
        content: content.trim()
      });
      
      currentLevel = 1;
      previousTagName = 'h1';
      continue;
    }
    
    // Handle skipped levels (e.g., H1 to H3)
    if (level > currentLevel + 1) {
      const content = header.html();
      const newLevel = currentLevel + 1;
      const newTag = `h${newLevel}`;
      
      header.replaceWith(`<${newTag}>${content}</${newTag}>`);
      
      changes.push({
        type: 'convert',
        element: tagName,
        to: newTag,
        content: content.trim()
      });
      
      currentLevel = newLevel;
      previousTagName = newTag;
    } 
    // Normal progression
    else {
      // Update current level if this header is valid in the hierarchy
      currentLevel = Math.min(level, currentLevel + 1);
      previousTagName = tagName;
    }
  }
  
  return changes;
}

/**
 * Optimizes keywords in headers
 * @param {Object} $ - Cheerio instance
 * @param {Object} details - Issue details
 * @returns {Array} - List of changes made
 */
function optimizeHeaderKeywords($, details) {
  const changes = [];
  
  // Need target keywords to proceed
  if (!details.targetKeywords || !details.targetKeywords.length) {
    return changes;
  }
  
  // Get all headers
  const headers = $('h1, h2, h3').toArray();
  
  // Track keywords already used
  const usedKeywords = new Set();
  
  // Process headers for keyword optimization
  headers.forEach((header, index) => {
    const $header = $(header);
    const headerText = $header.text();
    const tagName = header.tagName.toLowerCase();
    
    // Check if this header has any target keywords
    const containsKeyword = details.targetKeywords.some(keyword => 
      headerText.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // If header doesn't contain any keywords and we have unused keywords
    if (!containsKeyword) {
      // For H1, always try to include primary keyword
      if (tagName === 'h1' && details.targetKeywords[0]) {
        const primaryKeyword = details.targetKeywords[0];
        
        // Only modify if we have a suggested replacement
        if (details.suggestedReplacements && details.suggestedReplacements[headerText]) {
          const newText = details.suggestedReplacements[headerText];
          $header.text(newText);
          
          changes.push({
            type: 'update',
            element: tagName,
            oldValue: headerText,
            newValue: newText
          });
          
          usedKeywords.add(primaryKeyword);
        }
      }
      // For H2 and H3, distribute remaining keywords
      else if ((tagName === 'h2' || tagName === 'h3') && details.suggestedReplacements && details.suggestedReplacements[headerText]) {
        const newText = details.suggestedReplacements[headerText];
        $header.text(newText);
        
        changes.push({
          type: 'update',
          element: tagName,
          oldValue: headerText,
          newValue: newText
        });
        
        // Find which keyword was used in the replacement
        details.targetKeywords.forEach(keyword => {
          if (newText.toLowerCase().includes(keyword.toLowerCase())) {
            usedKeywords.add(keyword);
          }
        });
      }
    } else {
      // Track keywords that are already used
      details.targetKeywords.forEach(keyword => {
        if (headerText.toLowerCase().includes(keyword.toLowerCase())) {
          usedKeywords.add(keyword);
        }
      });
    }
  });
  
  return changes;
}

/**
 * Checks if a file is an HTML file
 * @param {string} filePath - Path to the file
 * @returns {boolean} - True if it's an HTML file
 */
function isHtmlFile(filePath) {
  const htmlExtensions = ['.html', '.htm', '.php', '.jsx', '.tsx'];
  const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
  return htmlExtensions.includes(ext);
}

module.exports = {
  fix,
  // Export internal functions for testing
  fixMultipleH1Tags,
  fixMissingH1Tag,
  fixIncorrectHierarchy,
  optimizeHeaderKeywords
};