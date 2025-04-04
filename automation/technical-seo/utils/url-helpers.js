/**
 * URL Helper Utilities
 * 
 * Helper functions for working with URLs in SEO analysis modules.
 */

/**
 * Extract origin from a URL
 * @param {string} url - URL to process
 * @returns {string} - Origin (protocol + hostname)
 */
function getUrlOrigin(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.origin;
  } catch (error) {
    // If URL parsing fails, return the input URL
    return url;
  }
}

/**
 * Check if a URL is internal (same domain)
 * @param {string} url - URL to check
 * @param {string} baseUrl - Base URL for comparison
 * @returns {boolean} - True if internal, false if external
 */
function isInternalLink(url, baseUrl) {
  try {
    const urlObj = new URL(url);
    const baseUrlObj = new URL(baseUrl);
    
    // Compare hostnames
    return urlObj.hostname === baseUrlObj.hostname;
  } catch (error) {
    // If URL parsing fails, assume it's external
    return false;
  }
}

/**
 * Normalize URL by removing trailing slashes, query params, etc.
 * @param {string} url - URL to normalize
 * @param {boolean} removeQueryParams - Whether to remove query parameters
 * @returns {string} - Normalized URL
 */
function normalizeUrl(url, removeQueryParams = false) {
  try {
    const urlObj = new URL(url);
    let normalized = urlObj.origin + urlObj.pathname;
    
    // Remove trailing slash if present
    if (normalized.endsWith('/') && normalized.length > 1) {
      normalized = normalized.slice(0, -1);
    }
    
    // Add back query params if needed
    if (!removeQueryParams && urlObj.search) {
      normalized += urlObj.search;
    }
    
    return normalized;
  } catch (error) {
    // If URL parsing fails, return the input URL
    return url;
  }
}

/**
 * Get the path segment of a URL
 * @param {string} url - URL to process
 * @returns {string} - Path segment
 */
function getUrlPath(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch (error) {
    // If URL parsing fails, return empty string
    return '';
  }
}

/**
 * Extract the hostname from a URL
 * @param {string} url - URL to process
 * @returns {string} - Hostname
 */
function getUrlHostname(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    // If URL parsing fails, return empty string
    return '';
  }
}

/**
 * Check if a URL is valid
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid, false if invalid
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Convert a relative URL to absolute
 * @param {string} relativeUrl - Relative URL
 * @param {string} baseUrl - Base URL
 * @returns {string} - Absolute URL
 */
function relativeToAbsoluteUrl(relativeUrl, baseUrl) {
  try {
    return new URL(relativeUrl, baseUrl).href;
  } catch (error) {
    // If URL parsing fails, return the input URL
    return relativeUrl;
  }
}

module.exports = {
  getUrlOrigin,
  isInternalLink,
  normalizeUrl,
  getUrlPath,
  getUrlHostname,
  isValidUrl,
  relativeToAbsoluteUrl
};
