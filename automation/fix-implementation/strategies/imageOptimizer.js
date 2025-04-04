/**
 * Image Optimizer Strategy
 * 
 * Optimizes images for SEO:
 * - Adds missing alt text
 * - Fixes oversized images 
 * - Implements image lazy loading
 * - Adds width and height attributes
 * - Optimizes file names and paths
 */

const path = require('path');
const fs = require('fs/promises');
const cheerio = require('cheerio');
const siteAdapter = require('../siteAdapter');
const logger = require('../../utils/logger');
const { execSync } = require('child_process');

// Image optimization recommendations
const IMAGE_RECOMMENDATIONS = {
  'alt': {
    maxLength: 125,
    minLength: 5,
    recommendations: [
      'Be descriptive but concise',
      'Include relevant keywords naturally',
      'Describe the image content accurately',
      'Don\'t stuff with keywords'
    ]
  },
  'lazy-loading': {
    attribute: 'loading="lazy"',
    recommendations: [
      'Apply to images below the fold',
      'Always include width and height attributes',
      'Consider browser compatibility'
    ]
  },
  'dimensions': {
    recommendations: [
      'Always include width and height attributes',
      'Helps browser allocate space before loading',
      'Prevents layout shifts'
    ]
  }
};

/**
 * Fixes image optimization issues
 * @param {string} repoPath - Path to the repository
 * @param {string} filePath - Path to the file being fixed
 * @param {Object} issue - Issue details
 * @param {Object} siteStructure - Site structure information
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} - Fix result
 */
async function fix(repoPath, filePath, issue, siteStructure, options = {}) {
  try {
    // Determine if this is an HTML file or an image file
    if (isHtmlFile(filePath)) {
      return await fixHtmlImageReferences(repoPath, filePath, issue, siteStructure, options);
    } else if (isImageFile(filePath)) {
      return await optimizeImageFile(repoPath, filePath, issue, siteStructure, options);
    } else {
      return {
        success: false,
        error: 'Not an HTML or image file'
      };
    }
  } catch (error) {
    logger.error(`Image optimization failed: ${error.message}`);
    return {
      success: false,
      error: `Failed to optimize image: ${error.message}`
    };
  }
}

/**
 * Fixes image references in HTML files
 * @param {string} repoPath - Path to the repository
 * @param {string} filePath - Path to the HTML file
 * @param {Object} issue - Issue details
 * @param {Object} siteStructure - Site structure information
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} - Fix result
 */
async function fixHtmlImageReferences(repoPath, filePath, issue, siteStructure, options) {
  // Read the file content
  const content = await siteAdapter.readFile(repoPath, filePath);
  
  // Parse HTML
  const $ = cheerio.load(content, { decodeEntities: false });
  
  // Keep track of changes
  const changes = [];
  
  // Apply appropriate fix based on issue subtype
  switch (issue.subType) {
    case 'missing-alt-text':
      changes.push(...fixMissingAltText($, issue.details));
      break;
    case 'empty-alt-text':
      changes.push(...fixEmptyAltText($, issue.details));
      break;
    case 'missing-image-dimensions':
      changes.push(...fixMissingDimensions($, issue.details, repoPath));
      break;
    case 'missing-lazy-loading':
      changes.push(...implementLazyLoading($, issue.details));
      break;
    case 'oversized-images':
      changes.push(...markOversizedImages($, issue.details));
      break;
    default:
      return {
        success: false,
        error: `Unknown image issue subtype: ${issue.subType}`
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
}

/**
 * Optimizes an image file directly
 * @param {string} repoPath - Path to the repository
 * @param {string} filePath - Path to the image file
 * @param {Object} issue - Issue details
 * @param {Object} siteStructure - Site structure information
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} - Fix result
 */
async function optimizeImageFile(repoPath, filePath, issue, siteStructure, options) {
  const changes = [];
  const fullPath = path.join(repoPath, filePath);
  
  switch (issue.subType) {
    case 'oversized-file':
      // Check if we have the necessary tools installed
      const hasImageMagick = checkImageMagickInstalled();
      
      if (!hasImageMagick) {
        return {
          success: false,
          error: 'ImageMagick not available for image optimization'
        };
      }
      
      try {
        // Create a backup of the original image
        const backupPath = `${fullPath}.backup`;
        await fs.copyFile(fullPath, backupPath);
        
        // Get original file size
        const originalStats = await fs.stat(fullPath);
        const originalSize = originalStats.size;
        
        // Optimize the image
        const targetQuality = issue.details.targetQuality || 85;
        const targetWidth = issue.details.targetWidth || null;
        
        // Run optimization command
        let command = `convert "${fullPath}" -strip `;
        
        if (targetWidth) {
          command += `-resize ${targetWidth}x `;
        }
        
        command += `-quality ${targetQuality} "${fullPath}"`;
        
        execSync(command);
        
        // Get new file size
        const newStats = await fs.stat(fullPath);
        const newSize = newStats.size;
        const savings = originalSize - newSize;
        const savingsPercent = (savings / originalSize) * 100;
        
        changes.push({
          type: 'optimize',
          file: filePath,
          originalSize,
          newSize,
          savings,
          savingsPercent: savingsPercent.toFixed(2)
        });
        
        // Remove backup if successful
        await fs.unlink(backupPath);
      } catch (error) {
        // Restore from backup if available
        const backupPath = `${fullPath}.backup`;
        try {
          await fs.access(backupPath);
          await fs.copyFile(backupPath, fullPath);
          await fs.unlink(backupPath);
        } catch (restoreError) {
          // Ignore errors during restore
        }
        
        throw error;
      }
      break;
      
    case 'poor-filename':
      // Rename image file to be more SEO-friendly
      try {
        const directory = path.dirname(fullPath);
        const extension = path.extname(filePath);
        const currentName = path.basename(filePath, extension);
        
        // Generate new name
        let newName = issue.details.suggestedName;
        if (!newName) {
          // If no suggestion, clean up the current name
          newName = currentName
            .replace(/[^\w\d-]/g, '-') // Replace non-word chars with hyphens
            .replace(/-+/g, '-')       // Collapse multiple hyphens
            .replace(/^-|-$/g, '')     // Remove leading/trailing hyphens
            .toLowerCase();
            
          // Add some keywords if possible
          if (issue.details.keywords && issue.details.keywords.length) {
            newName = `${issue.details.keywords[0].toLowerCase()}-${newName}`;
          }
        }
        
        // Add extension
        const newFilename = `${newName}${extension}`;
        const newPath = path.join(directory, newFilename);
        
        // Only rename if the new name is different and doesn't exist
        if (newName !== currentName) {
          try {
            await fs.access(newPath);
            // File already exists, don't overwrite
            return {
              success: false,
              error: 'Destination filename already exists'
            };
          } catch (e) {
            // File doesn't exist, proceed with rename
            await fs.rename(fullPath, newPath);
            
            changes.push({
              type: 'rename',
              oldPath: filePath,
              newPath: path.relative(repoPath, newPath)
            });
          }
        }
      } catch (error) {
        throw error;
      }
      break;
      
    default:
      return {
        success: false,
        error: `Unknown image file issue subtype: ${issue.subType}`
      };
  }
  
  if (changes.length === 0) {
    return {
      success: false,
      error: 'No changes were needed or could be made'
    };
  }
  
  return {
    success: true,
    changes
  };
}

/**
 * Fixes missing alt text in image tags
 * @param {Object} $ - Cheerio instance
 * @param {Object} details - Issue details
 * @returns {Array} - List of changes made
 */
function fixMissingAltText($, details) {
  const changes = [];
  
  // Find all images without alt attributes
  $('img').each((i, el) => {
    const img = $(el);
    if (!img.attr('alt') && img.attr('src')) {
      // Get image filename from src
      const src = img.attr('src');
      const filename = src.split('/').pop().split('?')[0];
      const filenameNoExt = filename.split('.')[0];
      
      // Generate alt text from filename or suggested alt
      let altText = details.suggestedAlt || '';
      
      if (!altText && filenameNoExt) {
        // Convert filename to readable text
        altText = filenameNoExt
          .replace(/[-_]/g, ' ')    // Replace hyphens and underscores with spaces
          .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
          .toLowerCase()
          .trim()
          .replace(/\s+/g, ' ');     // Remove extra spaces
        
        // Capitalize first letter
        altText = altText.charAt(0).toUpperCase() + altText.slice(1);
      }
      
      // If still no alt text, use a generic one
      if (!altText) {
        altText = 'Image';
      }
      
      // Add alt attribute
      img.attr('alt', altText);
      
      changes.push({
        type: 'add',
        element: 'img alt',
        selector: `img[src="${src}"]`,
        value: altText
      });
    }
  });
  
  return changes;
}

/**
 * Fixes empty alt text in image tags
 * @param {Object} $ - Cheerio instance
 * @param {Object} details - Issue details
 * @returns {Array} - List of changes made
 */
function fixEmptyAltText($, details) {
  const changes = [];
  
  // Find all images with empty alt attributes
  $('img[alt=""]').each((i, el) => {
    const img = $(el);
    const src = img.attr('src');
    
    if (src) {
      // Get image filename from src
      const filename = src.split('/').pop().split('?')[0];
      const filenameNoExt = filename.split('.')[0];
      
      // Generate alt text from filename or suggested alt
      let altText = details.suggestedAlt || '';
      
      if (!altText && filenameNoExt) {
        // Convert filename to readable text
        altText = filenameNoExt
          .replace(/[-_]/g, ' ')    // Replace hyphens and underscores with spaces
          .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
          .toLowerCase()
          .trim()
          .replace(/\s+/g, ' ');     // Remove extra spaces
        
        // Capitalize first letter
        altText = altText.charAt(0).toUpperCase() + altText.slice(1);
      }
      
      // If still no alt text, use a generic one
      if (!altText) {
        altText = 'Image';
      }
      
      // Update alt attribute
      img.attr('alt', altText);
      
      changes.push({
        type: 'update',
        element: 'img alt',
        selector: `img[src="${src}"]`,
        oldValue: '',
        newValue: altText
      });
    }
  });
  
  return changes;
}

/**
 * Fixes missing width and height attributes
 * @param {Object} $ - Cheerio instance
 * @param {Object} details - Issue details
 * @param {string} repoPath - Path to the repository
 * @returns {Array} - List of changes made
 */
function fixMissingDimensions($, details, repoPath) {
  const changes = [];
  
  // Find all images without width and height attributes
  $('img').each((i, el) => {
    const img = $(el);
    const src = img.attr('src');
    
    // Skip if image already has both width and height
    if (img.attr('width') && img.attr('height')) {
      return;
    }
    
    // Skip SVG images as they often have their own viewBox
    if (src && src.toLowerCase().endsWith('.svg')) {
      return;
    }
    
    // If we have dimensions in the details, use those
    if (details.dimensions && details.dimensions[src]) {
      const dim = details.dimensions[src];
      
      if (!img.attr('width')) {
        img.attr('width', dim.width);
        changes.push({
          type: 'add',
          element: 'img width',
          selector: `img[src="${src}"]`,
          value: dim.width
        });
      }
      
      if (!img.attr('height')) {
        img.attr('height', dim.height);
        changes.push({
          type: 'add',
          element: 'img height',
          selector: `img[src="${src}"]`,
          value: dim.height
        });
      }
    } 
    // Otherwise, use defaults based on image type
    else {
      // For now, we'll use standard dimensions
      // In real implementation, we'd try to get actual dimensions
      if (!img.attr('width')) {
        img.attr('width', '300');
        changes.push({
          type: 'add',
          element: 'img width',
          selector: `img[src="${src}"]`,
          value: '300'
        });
      }
      
      if (!img.attr('height')) {
        img.attr('height', '200');
        changes.push({
          type: 'add',
          element: 'img height',
          selector: `img[src="${src}"]`,
          value: '200'
        });
      }
    }
  });
  
  return changes;
}

/**
 * Implements lazy loading for images
 * @param {Object} $ - Cheerio instance
 * @param {Object} details - Issue details
 * @returns {Array} - List of changes made
 */
function implementLazyLoading($, details) {
  const changes = [];
  
  // Find all images without loading attribute
  $('img').each((i, el) => {
    const img = $(el);
    
    // Skip if image already has loading attribute
    if (img.attr('loading')) {
      return;
    }
    
    // Skip small images or images that might be above the fold
    const isLogo = img.attr('alt') && img.attr('alt').toLowerCase().includes('logo');
    const isAboveTheFold = details.aboveTheFold && details.aboveTheFold.includes(img.attr('src'));
    
    if (isLogo || isAboveTheFold) {
      return;
    }
    
    // Add lazy loading attribute
    img.attr('loading', 'lazy');
    
    changes.push({
      type: 'add',
      element: 'img loading',
      selector: `img[src="${img.attr('src')}"]`,
      value: 'lazy'
    });
  });
  
  return changes;
}

/**
 * Marks oversized images with data attributes for later optimization
 * @param {Object} $ - Cheerio instance
 * @param {Object} details - Issue details
 * @returns {Array} - List of changes made
 */
function markOversizedImages($, details) {
  const changes = [];
  
  // Find oversized images based on details
  if (details.oversizedImages && details.oversizedImages.length > 0) {
    details.oversizedImages.forEach(imgInfo => {
      const selector = `img[src="${imgInfo.src}"]`;
      const img = $(selector);
      
      if (img.length > 0) {
        // Mark for optimization by adding data attributes
        img.attr('data-needs-optimization', 'true');
        img.attr('data-original-size', imgInfo.size);
        img.attr('data-recommended-size', imgInfo.recommendedSize);
        
        changes.push({
          type: 'mark',
          element: 'img',
          selector,
          reason: 'Oversized image',
          details: imgInfo
        });
      }
    });
  }
  
  return changes;
}

/**
 * Checks if ImageMagick is installed
 * @returns {boolean} - True if ImageMagick is available
 */
function checkImageMagickInstalled() {
  try {
    execSync('convert -version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
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
 * Checks if a file is an image file
 * @param {string} filePath - Path to the file
 * @returns {boolean} - True if it's an image file
 */
function isImageFile(filePath) {
  const imgExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
  return imgExtensions.includes(ext);
}

module.exports = {
  fix
};