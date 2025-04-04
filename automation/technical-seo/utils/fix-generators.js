/**
 * Fix Strategy Generators
 * 
 * Utilities for generating fix strategies for SEO issues.
 */

const { normalizeUrl, getUrlPath } = require('./url-helpers');

/**
 * Generate a fix strategy for a broken link
 * @param {Object} link - Broken link information
 * @param {number|string} statusCode - HTTP status code
 * @returns {Object} - Fix strategy
 */
function generateFixStrategy(link, statusCode) {
  // Only generate fixes for internal links
  if (!link.isInternal) {
    return {
      type: 'manual',
      description: 'External link needs manual review and update',
      implementation: null
    };
  }
  
  // Generate different strategies based on status code
  switch (statusCode) {
    case 404:
      return generate404Fix(link);
    case 500:
    case 502:
    case 503:
    case 504:
      return generateServerErrorFix(link);
    case 401:
    case 403:
      return generatePermissionFix(link);
    default:
      return generateGenericFix(link, statusCode);
  }
}

/**
 * Generate fix strategy for 404 errors
 * @param {Object} link - Broken link information
 * @returns {Object} - Fix strategy
 */
function generate404Fix(link) {
  const path = getUrlPath(link.href);
  
  // Generate a slug from link text
  const textSlug = link.text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  return {
    type: 'redirect',
    description: 'Implement a 301 redirect for this broken URL',
    implementation: {
      options: [
        {
          type: 'redirect',
          description: 'Create 301 redirect for this URL',
          code: {
            htaccess: `RewriteRule ^${path.replace(/^\//, '')}$ /suggested-destination [R=301,L]`,
            nginx: `rewrite ^${path}$ /suggested-destination permanent;`,
            php: `<?php\nif ($_SERVER['REQUEST_URI'] === '${path}') {\n  header('Location: /suggested-destination', true, 301);\n  exit();\n}\n?>`
          }
        },
        {
          type: 'create-page',
          description: 'Create a new page at this URL',
          suggestedPath: path,
          suggestedTitle: link.text || 'New Page'
        },
        {
          type: 'update-link',
          description: 'Update the link to a valid URL',
          elementPath: link.elementPath,
          suggestedUrl: `/search?q=${textSlug}`
        }
      ]
    }
  };
}

/**
 * Generate fix strategy for server errors
 * @param {Object} link - Broken link information
 * @returns {Object} - Fix strategy
 */
function generateServerErrorFix(link) {
  return {
    type: 'server-fix',
    description: 'Fix server-side issue causing error',
    implementation: {
      options: [
        {
          type: 'check-logs',
          description: 'Check server logs for errors related to this URL',
          details: `Review error logs for issues with ${getUrlPath(link.href)}`
        },
        {
          type: 'update-link',
          description: 'Temporarily update the link to a working alternative',
          elementPath: link.elementPath
        }
      ]
    }
  };
}

/**
 * Generate fix strategy for permission errors
 * @param {Object} link - Broken link information
 * @returns {Object} - Fix strategy
 */
function generatePermissionFix(link) {
  return {
    type: 'permission-fix',
    description: 'Fix permission issue or update link',
    implementation: {
      options: [
        {
          type: 'update-permissions',
          description: 'Update permissions for this resource',
          details: `Check file/folder permissions for ${getUrlPath(link.href)}`
        },
        {
          type: 'update-link',
          description: 'Update the link to a publicly accessible resource',
          elementPath: link.elementPath
        }
      ]
    }
  };
}

/**
 * Generate generic fix strategy
 * @param {Object} link - Broken link information
 * @param {number|string} statusCode - HTTP status code
 * @returns {Object} - Fix strategy
 */
function generateGenericFix(link, statusCode) {
  return {
    type: 'general-fix',
    description: `Fix issue causing ${statusCode} status code`,
    implementation: {
      options: [
        {
          type: 'update-link',
          description: 'Update the link to a working URL',
          elementPath: link.elementPath
        },
        {
          type: 'remove-link',
          description: 'Remove this broken link',
          elementPath: link.elementPath
        }
      ]
    }
  };
}

module.exports = {
  generateFixStrategy
};
