/**
 * Meta Tag Fixer Strategy
 * 
 * Fixes common meta tag issues:
 * - Missing meta tags (title, description, robots, etc.)
 * - Duplicate meta tags
 * - Incorrect meta tag attributes
 * - Non-optimal meta tag content (too long, too short, etc.)
 */

const cheerio = require('cheerio');
const siteAdapter = require('../siteAdapter');
const logger = require('../../utils/logger');

// Meta tag recommendations
const META_TAG_RECOMMENDATIONS = {
  'title': {
    maxLength: 60,
    minLength: 10,
    recommendations: [
      'Include main keyword near the beginning',
      'Be descriptive but concise',
      'Use unique titles for each page'
    ]
  },
  'description': {
    maxLength: 160,
    minLength: 50,
    recommendations: [
      'Include 1-2 target keywords naturally',
      'Provide a clear summary of the page content',
      'Include a call to action when appropriate'
    ]
  },
  'robots': {
    validValues: ['index, follow', 'noindex, follow', 'index, nofollow', 'noindex, nofollow'],
    defaultValue: 'index, follow',
    recommendations: [
      'Use "noindex" for duplicate or temporary content',
      'Use "nofollow" for pages with many outbound links',
      'Default to "index, follow" for most pages'
    ]
  }
};

/**
 * Fixes meta tag issues in an HTML file
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
    
    // Apply appropriate fix based on issue type
    switch (issue.subType) {
      case 'missing-title':
        changes.push(...fixMissingTitle($, issue.details));
        break;
      case 'missing-description':
        changes.push(...fixMissingDescription($, issue.details));
        break;
      case 'missing-robots':
        changes.push(...fixMissingRobots($, issue.details));
        break;
      case 'duplicate-title':
        changes.push(...fixDuplicateTitle($, issue.details));
        break;
      case 'duplicate-description':
        changes.push(...fixDuplicateDescription($, issue.details));
        break;
      case 'invalid-robots':
        changes.push(...fixInvalidRobots($, issue.details));
        break;
      case 'title-too-long':
        changes.push(...fixTitleLength($, issue.details));
        break;
      case 'title-too-short':
        changes.push(...fixTitleLength($, issue.details));
        break;
      case 'description-too-long':
        changes.push(...fixDescriptionLength($, issue.details));
        break;
      case 'description-too-short':
        changes.push(...fixDescriptionLength($, issue.details));
        break;
      default:
        return {
          success: false,
          error: `Unknown meta tag issue subtype: ${issue.subType}`
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
    logger.error(`Meta tag fix failed: ${error.message}`);
    return {
      success: false,
      error: `Failed to fix meta tags: ${error.message}`
    };
  }
}

/**
 * Fixes missing title tag
 * @param {Object} $ - Cheerio instance
 * @param {Object} details - Issue details
 * @returns {Array} - List of changes made
 */
function fixMissingTitle($, details) {
  const changes = [];
  
  // Check if there's a head tag
  if ($('head').length === 0) {
    // Can't add title without head
    return changes;
  }
  
  // Check if title already exists
  if ($('head title').length > 0) {
    // Title already exists, do nothing
    return changes;
  }
  
  // Determine title text to use
  let titleText = details.suggestedTitle || 'Page Title';
  
  // If no suggested title, try to use h1 content
  if (!details.suggestedTitle && $('h1').length > 0) {
    titleText = $('h1').first().text().trim();
  }
  
  // Add title tag
  $('head').prepend(`<title>${titleText}</title>`);
  
  changes.push({
    type: 'add',
    element: 'title',
    value: titleText
  });
  
  return changes;
}

/**
 * Fixes missing description meta tag
 * @param {Object} $ - Cheerio instance
 * @param {Object} details - Issue details
 * @returns {Array} - List of changes made
 */
function fixMissingDescription($, details) {
  const changes = [];
  
  // Check if there's a head tag
  if ($('head').length === 0) {
    // Can't add meta description without head
    return changes;
  }
  
  // Check if description already exists
  if ($('head meta[name="description"]').length > 0) {
    // Description already exists, do nothing
    return changes;
  }
  
  // Determine description text to use
  let descriptionText = details.suggestedDescription || '';
  
  // If no suggested description, try to use first paragraph content
  if (!descriptionText && $('p').length > 0) {
    descriptionText = $('p').first().text().trim();
    
    // Truncate if too long
    if (descriptionText.length > META_TAG_RECOMMENDATIONS.description.maxLength) {
      descriptionText = descriptionText.substring(0, META_TAG_RECOMMENDATIONS.description.maxLength - 3) + '...';
    }
  }
  
  // If still no description, use a generic one
  if (!descriptionText) {
    descriptionText = 'Learn more about our products and services on this page.';
  }
  
  // Add meta description tag
  $('head').append(`<meta name="description" content="${escapeHtml(descriptionText)}">`);
  
  changes.push({
    type: 'add',
    element: 'meta[name="description"]',
    value: descriptionText
  });
  
  return changes;
}

/**
 * Fixes missing robots meta tag
 * @param {Object} $ - Cheerio instance
 * @param {Object} details - Issue details
 * @returns {Array} - List of changes made
 */
function fixMissingRobots($, details) {
  const changes = [];
  
  // Check if there's a head tag
  if ($('head').length === 0) {
    // Can't add meta robots without head
    return changes;
  }
  
  // Check if robots meta already exists
  if ($('head meta[name="robots"]').length > 0) {
    // Robots meta already exists, do nothing
    return changes;
  }
  
  // Determine robots value to use
  const robotsValue = details.suggestedValue || META_TAG_RECOMMENDATIONS.robots.defaultValue;
  
  // Add robots meta tag
  $('head').append(`<meta name="robots" content="${robotsValue}">`);
  
  changes.push({
    type: 'add',
    element: 'meta[name="robots"]',
    value: robotsValue
  });
  
  return changes;
}

/**
 * Fixes duplicate title tags
 * @param {Object} $ - Cheerio instance
 * @param {Object} details - Issue details
 * @returns {Array} - List of changes made
 */
function fixDuplicateTitle($, details) {
  const changes = [];
  const titles = $('head title');
  
  // If there are multiple titles
  if (titles.length > 1) {
    // Keep the first title and remove others
    let firstTitle = $(titles[0]);
    let firstTitleText = firstTitle.text();
    
    // Remove all titles after the first one
    titles.each((i, el) => {
      if (i > 0) {
        $(el).remove();
        changes.push({
          type: 'remove',
          element: 'title',
          value: $(el).text()
        });
      }
    });
  }
  
  return changes;
}

/**
 * Fixes duplicate description meta tags
 * @param {Object} $ - Cheerio instance
 * @param {Object} details - Issue details
 * @returns {Array} - List of changes made
 */
function fixDuplicateDescription($, details) {
  const changes = [];
  const descriptions = $('head meta[name="description"]');
  
  // If there are multiple descriptions
  if (descriptions.length > 1) {
    // Keep the first description and remove others
    let firstDesc = $(descriptions[0]);
    let firstContent = firstDesc.attr('content');
    
    // Remove all descriptions after the first one
    descriptions.each((i, el) => {
      if (i > 0) {
        $(el).remove();
        changes.push({
          type: 'remove',
          element: 'meta[name="description"]',
          value: $(el).attr('content')
        });
      }
    });
  }
  
  return changes;
}

/**
 * Fixes invalid robots meta tag
 * @param {Object} $ - Cheerio instance
 * @param {Object} details - Issue details
 * @returns {Array} - List of changes made
 */
function fixInvalidRobots($, details) {
  const changes = [];
  const robotsMeta = $('head meta[name="robots"]');
  
  if (robotsMeta.length > 0) {
    const currentValue = robotsMeta.attr('content');
    const validValues = META_TAG_RECOMMENDATIONS.robots.validValues;
    
    // If current value is not in valid values
    if (!validValues.includes(currentValue)) {
      // Determine best replacement value
      let newValue = META_TAG_RECOMMENDATIONS.robots.defaultValue;
      
      // Check if current value has 'noindex' or 'nofollow'
      const hasNoindex = currentValue.includes('noindex');
      const hasNofollow = currentValue.includes('nofollow');
      
      if (hasNoindex && hasNofollow) {
        newValue = 'noindex, nofollow';
      } else if (hasNoindex) {
        newValue = 'noindex, follow';
      } else if (hasNofollow) {
        newValue = 'index, nofollow';
      }
      
      // Update the robots meta
      robotsMeta.attr('content', newValue);
      
      changes.push({
        type: 'update',
        element: 'meta[name="robots"]',
        oldValue: currentValue,
        newValue: newValue
      });
    }
  }
  
  return changes;
}

/**
 * Fixes title length issues
 * @param {Object} $ - Cheerio instance
 * @param {Object} details - Issue details
 * @returns {Array} - List of changes made
 */
function fixTitleLength($, details) {
  const changes = [];
  const title = $('head title');
  
  if (title.length > 0) {
    const currentText = title.text();
    const maxLength = META_TAG_RECOMMENDATIONS.title.maxLength;
    const minLength = META_TAG_RECOMMENDATIONS.title.minLength;
    
    // Fix too long title
    if (currentText.length > maxLength) {
      const truncatedText = currentText.substring(0, maxLength - 3) + '...';
      title.text(truncatedText);
      
      changes.push({
        type: 'update',
        element: 'title',
        oldValue: currentText,
        newValue: truncatedText
      });
    }
    // Fix too short title
    else if (currentText.length < minLength && details.suggestedTitle) {
      title.text(details.suggestedTitle);
      
      changes.push({
        type: 'update',
        element: 'title',
        oldValue: currentText,
        newValue: details.suggestedTitle
      });
    }
  }
  
  return changes;
}

/**
 * Fixes description length issues
 * @param {Object} $ - Cheerio instance
 * @param {Object} details - Issue details
 * @returns {Array} - List of changes made
 */
function fixDescriptionLength($, details) {
  const changes = [];
  const description = $('head meta[name="description"]');
  
  if (description.length > 0) {
    const currentContent = description.attr('content');
    const maxLength = META_TAG_RECOMMENDATIONS.description.maxLength;
    const minLength = META_TAG_RECOMMENDATIONS.description.minLength;
    
    // Fix too long description
    if (currentContent.length > maxLength) {
      const truncatedContent = currentContent.substring(0, maxLength - 3) + '...';
      description.attr('content', truncatedContent);
      
      changes.push({
        type: 'update',
        element: 'meta[name="description"]',
        oldValue: currentContent,
        newValue: truncatedContent
      });
    }
    // Fix too short description
    else if (currentContent.length < minLength && details.suggestedDescription) {
      description.attr('content', details.suggestedDescription);
      
      changes.push({
        type: 'update',
        element: 'meta[name="description"]',
        oldValue: currentContent,
        newValue: details.suggestedDescription
      });
    }
  }
  
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

/**
 * Escapes HTML for use in attribute values
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = {
  fix
};