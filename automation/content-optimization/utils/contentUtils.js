/**
 * contentUtils.js
 * 
 * Utility functions for content extraction, normalization, and processing.
 * These functions handle common content-related tasks used across different
 * analyzers and enhancers.
 */

const { JSDOM } = require('jsdom');

/**
 * Extracts clean text content from HTML
 * 
 * @param {string} html - HTML content to process
 * @returns {string} Extracted text content
 */
function extractContent(html) {
  try {
    // Create DOM from HTML
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Remove script and style elements
    const scriptElements = document.querySelectorAll('script, style, noscript');
    scriptElements.forEach(element => element.remove());
    
    // Get text content
    const content = document.body.textContent || '';
    
    // Clean up text
    return content
      .replace(/\s+/g, ' ')      // Normalize whitespace
      .trim();
  } catch (error) {
    console.error('Error extracting content:', error);
    // Return raw HTML as fallback
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}

/**
 * Normalizes text for consistent analysis
 * 
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
function normalizeText(text) {
  return text
    .replace(/\r\n/g, '\n')          // Normalize line endings
    .replace(/\n+/g, '\n')           // Remove multiple line breaks
    .replace(/\t/g, ' ')             // Replace tabs with spaces
    .replace(/\s+/g, ' ')            // Normalize whitespace
    .replace(/\s([.,;:!?])/g, '$1')  // Remove spaces before punctuation
    .trim();
}

/**
 * Calculates word count in text
 * 
 * @param {string} text - Text to analyze
 * @returns {number} Word count
 */
function wordCount(text) {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Calculates sentence count in text
 * 
 * @param {string} text - Text to analyze
 * @returns {number} Sentence count
 */
function sentenceCount(text) {
  // Simple sentence detection based on punctuation
  // More sophisticated approaches would consider abbreviations, quotes, etc.
  const sentences = text.match(/[.!?]+\s/g) || [];
  return sentences.length || 1; // At least one sentence
}

/**
 * Calculates paragraph count in text
 * 
 * @param {string} text - Text to analyze
 * @returns {number} Paragraph count
 */
function paragraphCount(text) {
  const paragraphs = text.split(/\n\s*\n/);
  return paragraphs.filter(p => p.trim().length > 0).length || 1; // At least one paragraph
}

/**
 * Extracts first paragraph from text
 * 
 * @param {string} text - Text to process
 * @returns {string} First paragraph
 */
function extractFirstParagraph(text) {
  const paragraphs = text.split(/\n\s*\n/);
  return paragraphs.filter(p => p.trim().length > 0)[0] || '';
}

/**
 * Checks if content contains specific pattern
 * 
 * @param {string} content - Content to check
 * @param {RegExp} pattern - Pattern to search for
 * @returns {boolean} True if pattern found
 */
function containsPattern(content, pattern) {
  return pattern.test(content);
}

/**
 * Extracts title from HTML
 * 
 * @param {string} html - HTML content
 * @returns {string} Extracted title
 */
function extractTitle(html) {
  try {
    const dom = new JSDOM(html);
    return dom.window.document.title || '';
  } catch (error) {
    console.error('Error extracting title:', error);
    return '';
  }
}

/**
 * Extracts meta description from HTML
 * 
 * @param {string} html - HTML content
 * @returns {string} Extracted meta description
 */
function extractMetaDescription(html) {
  try {
    const dom = new JSDOM(html);
    const metaDesc = dom.window.document.querySelector('meta[name="description"]');
    return metaDesc ? metaDesc.getAttribute('content') || '' : '';
  } catch (error) {
    console.error('Error extracting meta description:', error);
    return '';
  }
}

/**
 * Splits content into sections based on headings
 * 
 * @param {string} html - HTML content
 * @returns {Array} Content sections with heading and content
 */
function splitContentIntoSections(html) {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const sections = [];
    
    let currentSection = null;
    let currentContent = [];
    
    // Process all nodes in document body
    Array.from(document.body.childNodes).forEach(node => {
      // If heading, start new section
      if (node.nodeType === 1 && /^H[1-6]$/i.test(node.nodeName)) {
        // Save previous section if exists
        if (currentSection) {
          sections.push({
            heading: currentSection,
            content: currentContent.join(' ').trim()
          });
        }
        
        // Start new section
        currentSection = {
          text: node.textContent.trim(),
          level: parseInt(node.nodeName.substring(1))
        };
        currentContent = [];
      } 
      // Otherwise add to current section's content
      else if (currentSection) {
        if (node.textContent && node.textContent.trim()) {
          currentContent.push(node.textContent.trim());
        }
      }
    });
    
    // Add final section
    if (currentSection) {
      sections.push({
        heading: currentSection,
        content: currentContent.join(' ').trim()
      });
    }
    
    return sections;
  } catch (error) {
    console.error('Error splitting content into sections:', error);
    return [];
  }
}

module.exports = {
  extractContent,
  normalizeText,
  wordCount,
  sentenceCount,
  paragraphCount,
  extractFirstParagraph,
  containsPattern,
  extractTitle,
  extractMetaDescription,
  splitContentIntoSections
};
