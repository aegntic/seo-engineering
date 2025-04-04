/**
 * Content Fingerprinting Module
 * 
 * Creates fingerprints of web page content to enable efficient similarity comparison.
 * Uses SimHash algorithm for creating content fingerprints, which enables 
 * fast comparison of large numbers of documents.
 * 
 * @module duplicate-content/fingerprinter
 */

const { JSDOM } = require('jsdom');
const simhash = require('./simhash');
const tokenize = require('./tokenizer');
const { removeStopwords } = require('./stopwords');
const utils = require('../../utils');

/**
 * Class responsible for generating content fingerprints
 */
class ContentFingerprinter {
  /**
   * Create a new ContentFingerprinter
   * @param {Object} config - Configuration options
   */
  constructor(config) {
    this.config = config;
    this.cache = new Map();
  }

  /**
   * Generate fingerprints for multiple pages
   * @param {Array<Object>} pages - Array of page objects with URL and content
   * @returns {Promise<Object>} Map of URLs to fingerprints
   */
  async generateFingerprints(pages) {
    if (!Array.isArray(pages)) {
      throw new Error('Pages must be an array');
    }

    const results = {};
    const batches = utils.splitIntoBatches(pages, this.config.batchSize);

    for (const batch of batches) {
      await Promise.all(
        batch.map(async (page) => {
          try {
            if (!page.url || !page.content) {
              console.warn(`Skipping page with missing URL or content`);
              return;
            }

            // Skip already processed pages
            if (this.cache.has(page.url)) {
              results[page.url] = this.cache.get(page.url);
              return;
            }

            const fingerprint = await this.generateFingerprint(page);
            results[page.url] = fingerprint;

            // Cache the result if not too many items in cache
            if (this.cache.size < this.config.maxCachedFingerprints) {
              this.cache.set(page.url, fingerprint);
            }
          } catch (error) {
            console.error(`Error generating fingerprint for ${page.url}:`, error);
          }
        })
      );
    }

    return results;
  }

  /**
   * Generate fingerprint for a single page
   * @param {Object} page - Page object with URL and content
   * @returns {Promise<Object>} Fingerprint object
   */
  async generateFingerprint(page) {
    try {
      // Extract clean content
      const cleanContent = this.extractContent(page.content);
      
      if (cleanContent.length < this.config.minContentLength) {
        return {
          hash: null,
          tokens: [],
          length: cleanContent.length,
          isEmpty: true
        };
      }

      // Tokenize the content
      const tokens = tokenize(cleanContent);
      
      // Remove stopwords
      const filteredTokens = removeStopwords(tokens);

      // Generate simhash
      const hash = simhash.compute(filteredTokens, this.config.simhashBits);

      return {
        hash,
        tokens: filteredTokens.slice(0, 100), // Store sample of tokens for debugging
        length: cleanContent.length,
        isEmpty: false
      };
    } catch (error) {
      console.error(`Error in generateFingerprint:`, error);
      throw error;
    }
  }

  /**
   * Extract clean content from HTML
   * @param {string} html - HTML content
   * @returns {string} Clean text content
   */
  extractContent(html) {
    try {
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Remove script, style, and other non-content elements
      this.config.excludeSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => el.remove());
      });

      // Extract text content
      let content = document.body.textContent || '';
      
      // Normalize whitespace
      content = content.replace(/\s+/g, ' ').trim();
      
      return content;
    } catch (error) {
      console.error('Error extracting content:', error);
      return '';
    }
  }

  /**
   * Clear the fingerprint cache
   */
  clearCache() {
    this.cache.clear();
  }
}

module.exports = ContentFingerprinter;
