/**
 * URL utilities for internal linking optimization
 * 
 * This module provides helper functions for working with URLs in the context
 * of internal linking analysis and optimization.
 */

/**
 * Normalize a URL for consistent comparison
 * @param {string} url - The URL to normalize
 * @returns {string} The normalized URL
 */
function normalizeUrl(url) {
  try {
    // Parse the URL
    const parsedUrl = new URL(url);
    
    // Remove trailing slash if present
    let path = parsedUrl.pathname;
    if (path.endsWith('/') && path.length > 1) {
      path = path.slice(0, -1);
    }
    
    // Remove default ports
    if ((parsedUrl.protocol === 'http:' && parsedUrl.port === '80') ||
        (parsedUrl.protocol === 'https:' && parsedUrl.port === '443')) {
      parsedUrl.port = '';
    }
    
    // Lowercase hostname
    parsedUrl.hostname = parsedUrl.hostname.toLowerCase();
    
    // Remove common parameters that don't affect content
    const params = new URLSearchParams(parsedUrl.search);
    const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
    
    for (const param of paramsToRemove) {
      params.delete(param);
    }
    
    // Reconstruct search string
    parsedUrl.search = params.toString() ? `?${params.toString()}` : '';
    
    // Remove hash fragment unless it's a SPA fragment route
    if (parsedUrl.hash && !parsedUrl.hash.startsWith('#!/')) {
      parsedUrl.hash = '';
    }
    
    // Set the path
    parsedUrl.pathname = path;
    
    return parsedUrl.toString();
  } catch (error) {
    // If URL parsing fails, return the original URL
    console.warn(`Failed to normalize URL: ${url}`, error);
    return url;
  }
}

/**
 * Check if two URLs belong to the same domain
 * @param {string} url1 - First URL
 * @param {string} url2 - Second URL
 * @returns {boolean} Whether the URLs belong to the same domain
 */
function isSameDomain(url1, url2) {
  try {
    const domain1 = new URL(url1).hostname.toLowerCase();
    const domain2 = new URL(url2).hostname.toLowerCase();
    
    return domain1 === domain2;
  } catch (error) {
    // If URL parsing fails, return false
    console.warn(`Failed to compare domains: ${url1} vs ${url2}`, error);
    return false;
  }
}

/**
 * Extract the path segments from a URL
 * @param {string} url - The URL to process
 * @returns {Array<string>} Array of path segments
 */
function getPathSegments(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.pathname.split('/').filter(Boolean);
  } catch (error) {
    console.warn(`Failed to extract path segments from URL: ${url}`, error);
    return [];
  }
}

/**
 * Calculate URL similarity based on path structure
 * @param {string} url1 - First URL
 * @param {string} url2 - Second URL
 * @returns {number} Similarity score between 0 and 1
 */
function getUrlSimilarity(url1, url2) {
  try {
    const segments1 = getPathSegments(url1);
    const segments2 = getPathSegments(url2);
    
    // If both URLs have no path segments, they're at root level
    if (segments1.length === 0 && segments2.length === 0) {
      return 1.0;
    }
    
    // Find common prefix length
    let commonPrefixLength = 0;
    const minLength = Math.min(segments1.length, segments2.length);
    
    for (let i = 0; i < minLength; i++) {
      if (segments1[i] === segments2[i]) {
        commonPrefixLength++;
      } else {
        break;
      }
    }
    
    // Calculate similarity based on common prefix and total segments
    const totalSegments = Math.max(segments1.length, segments2.length);
    return commonPrefixLength / totalSegments;
  } catch (error) {
    console.warn(`Failed to calculate URL similarity: ${url1} vs ${url2}`, error);
    return 0;
  }
}

/**
 * Categorize a URL by its purpose or type based on path patterns
 * @param {string} url - The URL to categorize
 * @returns {string} The URL category
 */
function categorizeUrl(url) {
  try {
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname.toLowerCase();
    
    // Check for common URL patterns
    if (path.match(/\/(blog|article|post|news)/)) {
      return 'content';
    } else if (path.match(/\/(product|item|shop)/)) {
      return 'product';
    } else if (path.match(/\/(category|tag|topic)/)) {
      return 'taxonomy';
    } else if (path.match(/\/(contact|about|team|faq|help)/)) {
      return 'information';
    } else if (path.match(/\/(cart|checkout|account|profile|login|register)/)) {
      return 'user';
    } else if (path === '/' || path === '') {
      return 'home';
    } else {
      return 'other';
    }
  } catch (error) {
    console.warn(`Failed to categorize URL: ${url}`, error);
    return 'unknown';
  }
}

/**
 * Calculate the relative URL from one URL to another
 * @param {string} from - Source URL
 * @param {string} to - Target URL
 * @returns {string} Relative URL path
 */
function getRelativeUrl(from, to) {
  try {
    const fromUrl = new URL(from);
    const toUrl = new URL(to);
    
    // If domains are different, return absolute URL
    if (fromUrl.hostname !== toUrl.hostname) {
      return to;
    }
    
    // Split paths into segments
    const fromSegments = fromUrl.pathname.split('/').filter(Boolean);
    const toSegments = toUrl.pathname.split('/').filter(Boolean);
    
    // Find common prefix
    let commonPrefixLength = 0;
    const minLength = Math.min(fromSegments.length, toSegments.length);
    
    for (let i = 0; i < minLength; i++) {
      if (fromSegments[i] === toSegments[i]) {
        commonPrefixLength++;
      } else {
        break;
      }
    }
    
    // Build relative path
    let relPath = '';
    
    // Add '../' for each level to go up
    for (let i = commonPrefixLength; i < fromSegments.length; i++) {
      relPath += '../';
    }
    
    // Add segments to go down
    for (let i = commonPrefixLength; i < toSegments.length; i++) {
      relPath += toSegments[i] + '/';
    }
    
    // Remove trailing slash if not empty
    if (relPath.length > 0 && relPath.endsWith('/')) {
      relPath = relPath.slice(0, -1);
    }
    
    // If empty, use current directory
    if (relPath === '') {
      relPath = './';
    }
    
    // Add search and hash
    if (toUrl.search) {
      relPath += toUrl.search;
    }
    
    if (toUrl.hash) {
      relPath += toUrl.hash;
    }
    
    return relPath;
  } catch (error) {
    console.warn(`Failed to get relative URL: ${from} to ${to}`, error);
    return to;
  }
}

module.exports = {
  normalizeUrl,
  isSameDomain,
  getPathSegments,
  getUrlSimilarity,
  categorizeUrl,
  getRelativeUrl
};
