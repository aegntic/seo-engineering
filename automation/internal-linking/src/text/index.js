/**
 * Anchor Text Optimizer
 * 
 * This module generates optimal anchor text for internal links based on
 * content analysis, keyword relevance, and natural language processing.
 * 
 * Key features:
 * - Suggests keyword-rich anchor text that's relevant to both source and target pages
 * - Ensures variation in anchor text to avoid over-optimization
 * - Analyzes content to find natural insertion points for links
 * - Balances keyword usage with natural readability
 * - Prevents duplicate anchor text across the site
 */

const { performance } = require('perf_hooks');

/**
 * Optimizes anchor text for internal links
 */
class AnchorTextOptimizer {
  /**
   * Create a new AnchorTextOptimizer
   * @param {Object} config - Configuration options
   */
  constructor(config = {}) {
    this.config = config;
    this.minLength = config.anchorTextMinLength || 3;
    this.maxLength = config.anchorTextMaxLength || 8;
    this.keywordBias = config.keywordBias || 0.7;
    this.naturalLanguageBias = config.naturalLanguageBias || 0.5;
  }

  /**
   * Generate anchor text for link suggestions
   * @param {Object} distributionSuggestions - Link distribution suggestions
   * @param {Array<Object>} pages - Original page content data
   * @returns {Promise<Object>} Enhanced suggestions with anchor text
   */
  async generateAnchorText(distributionSuggestions, pages) {
    console.log('Generating optimal anchor text for suggested links...');
    const startTime = performance.now();

    // Build a map for quick content lookup
    const pageContentMap = new Map();
    for (const page of pages) {
      pageContentMap.set(page.url, page);
    }

    // Process each suggestion
    const suggestionsWithAnchorText = {};
    const usedAnchorTexts = new Map(); // Track used anchor texts per target to ensure variation
    
    // Get the original suggestions array
    const suggestions = distributionSuggestions.suggestions || [];
    
    for (const suggestion of suggestions) {
      const { source, target } = suggestion;
      
      // Get page content
      const sourcePage = pageContentMap.get(source);
      const targetPage = pageContentMap.get(target);
      
      if (!sourcePage || !targetPage) {
        continue;
      }
      
      // Generate anchor text options
      const anchorTextOptions = await this._generateAnchorTextOptions(sourcePage, targetPage);
      
      // Track previously used anchor texts for this target
      if (!usedAnchorTexts.has(target)) {
        usedAnchorTexts.set(target, new Set());
      }
      const usedTextsForTarget = usedAnchorTexts.get(target);
      
      // Filter out already used options for this target
      const unusedOptions = anchorTextOptions.filter(option => !usedTextsForTarget.has(option.text));
      
      // If all options are used, select the best one anyway
      const selectedOption = unusedOptions.length > 0 
        ? unusedOptions[0] 
        : (anchorTextOptions.length > 0 ? anchorTextOptions[0] : null);
      
      if (selectedOption) {
        // Add the selected anchor text to the suggestion
        suggestion.anchorText = selectedOption.text;
        suggestion.insertionContext = selectedOption.context || '';
        suggestion.anchorTextScore = selectedOption.score;
        
        // Mark this anchor text as used for this target
        usedTextsForTarget.add(selectedOption.text);
      } else {
        // Fallback to page title if no good anchor text found
        suggestion.anchorText = targetPage.title || 'Read more';
        suggestion.insertionContext = '';
        suggestion.anchorTextScore = 0;
      }
    }
    
    const duration = ((performance.now() - startTime) / 1000).toFixed(2);
    console.log(`Generated anchor text for ${suggestions.length} suggestions in ${duration}s`);
    
    // Return the original suggestions object structure but with enhanced suggestions
    return {
      ...distributionSuggestions,
      suggestions
    };
  }

  /**
   * Generate anchor text options for a link
   * @param {Object} sourcePage - Source page data
   * @param {Object} targetPage - Target page data
   * @returns {Promise<Array<Object>>} Sorted anchor text options
   * @private
   */
  async _generateAnchorTextOptions(sourcePage, targetPage) {
    const options = [];
    
    // 1. Extract candidate phrases from target page
    const titlePhrases = this._extractPhrases(targetPage.title || '');
    const keywordPhrases = (targetPage.keywords || []).filter(kw => kw.split(' ').length <= this.maxLength);
    const contentPhrases = this._extractPhrases(targetPage.content || '');
    
    // 2. Score and collect options
    
    // From title
    for (const phrase of titlePhrases) {
      if (phrase.words.length >= this.minLength && phrase.words.length <= this.maxLength) {
        const score = this._scoreAnchorText(phrase.text, sourcePage, targetPage);
        
        if (score > 0.3) {  // Minimum quality threshold
          options.push({
            text: phrase.text,
            source: 'title',
            score,
            context: ''
          });
        }
      }
    }
    
    // From keywords
    for (const keyword of keywordPhrases) {
      const score = this._scoreAnchorText(keyword, sourcePage, targetPage);
      
      if (score > 0.4) {  // Higher threshold for keywords
        options.push({
          text: keyword,
          source: 'keyword',
          score,
          context: ''
        });
      }
    }
    
    // From content
    for (const phrase of contentPhrases) {
      if (phrase.words.length >= this.minLength && phrase.words.length <= this.maxLength) {
        const score = this._scoreAnchorText(phrase.text, sourcePage, targetPage);
        
        if (score > 0.3) {
          // Find context (surrounding text)
          const context = this._findContext(targetPage.content || '', phrase.text);
          
          options.push({
            text: phrase.text,
            source: 'content',
            score,
            context
          });
        }
      }
    }
    
    // 3. Sort by score descending
    options.sort((a, b) => b.score - a.score);
    
    // 4. Limit to top options
    return options.slice(0, 5);
  }

  /**
   * Extract meaningful phrases from text
   * @param {string} text - The text to analyze
   * @returns {Array<Object>} Extracted phrases
   * @private
   */
  _extractPhrases(text) {
    if (!text) return [];
    
    const phrases = [];
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    
    for (const sentence of sentences) {
      // Remove special characters and normalize whitespace
      const cleanSentence = sentence.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
      
      // Skip empty sentences
      if (!cleanSentence) continue;
      
      // Split into words
      const words = cleanSentence.split(' ');
      
      // Extract phrases of different lengths
      for (let length = this.minLength; length <= Math.min(this.maxLength, words.length); length++) {
        for (let i = 0; i <= words.length - length; i++) {
          const phraseWords = words.slice(i, i + length);
          
          // Skip phrases with stop words at the start or end
          if (this._isStopWord(phraseWords[0]) || this._isStopWord(phraseWords[phraseWords.length - 1])) {
            continue;
          }
          
          // Skip phrases with too many stop words
          const stopWordCount = phraseWords.filter(word => this._isStopWord(word)).length;
          if (stopWordCount > Math.floor(phraseWords.length / 2)) {
            continue;
          }
          
          phrases.push({
            text: phraseWords.join(' '),
            words: phraseWords,
            position: i
          });
        }
      }
    }
    
    return phrases;
  }

  /**
   * Score anchor text for SEO and user experience
   * @param {string} anchorText - Candidate anchor text
   * @param {Object} sourcePage - Source page data
   * @param {Object} targetPage - Target page data
   * @returns {number} Score between 0 and 1
   * @private
   */
  _scoreAnchorText(anchorText, sourcePage, targetPage) {
    let score = 0;
    
    // 1. Keyword relevance
    const keywords = (targetPage.keywords || []).map(kw => kw.toLowerCase());
    const anchorLower = anchorText.toLowerCase();
    
    // Check if anchor text contains or matches keywords
    const exactKeywordMatch = keywords.some(kw => kw === anchorLower);
    const partialKeywordMatch = keywords.some(kw => anchorLower.includes(kw) || kw.includes(anchorLower));
    
    if (exactKeywordMatch) {
      score += 0.4 * this.keywordBias;
    } else if (partialKeywordMatch) {
      score += 0.2 * this.keywordBias;
    }
    
    // 2. Title relevance
    if (targetPage.title && targetPage.title.toLowerCase().includes(anchorLower)) {
      score += 0.2;
    }
    
    // 3. Natural language quality
    const wordCount = anchorText.split(' ').length;
    
    // Prefer phrases of 2-4 words (most natural)
    const optimalLength = wordCount >= 2 && wordCount <= 4;
    if (optimalLength) {
      score += 0.1 * this.naturalLanguageBias;
    }
    
    // 4. Grammatical completeness (simple heuristic)
    const hasNoun = !this._isStopWord(anchorText.split(' ')[anchorText.split(' ').length - 1]);
    const startsWithDeterminer = this._isDeterminer(anchorText.split(' ')[0]);
    
    // Prefer complete phrases (simple heuristic: has noun and not too many stop words)
    if (hasNoun && !startsWithDeterminer) {
      score += 0.1 * this.naturalLanguageBias;
    }
    
    // 5. Source relevance (can it naturally fit in source content?)
    if (sourcePage.content && sourcePage.content.toLowerCase().includes(anchorLower)) {
      score += 0.2;
    }
    
    // 6. Length appropriateness
    if (anchorText.length > 3 && anchorText.length < 50) {
      const lengthScore = 0.1 * (1 - Math.abs(anchorText.length - 25) / 25);
      score += lengthScore;
    }
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Find context (surrounding text) for anchor text in content
   * @param {string} content - Page content
   * @param {string} anchorText - Anchor text to search for
   * @returns {string} Context snippet
   * @private
   */
  _findContext(content, anchorText) {
    if (!content) return '';
    
    // Find position of anchor text
    const lowerContent = content.toLowerCase();
    const lowerAnchor = anchorText.toLowerCase();
    const position = lowerContent.indexOf(lowerAnchor);
    
    if (position === -1) return '';
    
    // Extract surrounding context (sentence containing the anchor text)
    const startPos = Math.max(0, lowerContent.lastIndexOf('.', position) + 1);
    const endPos = lowerContent.indexOf('.', position + lowerAnchor.length);
    
    const sentence = content.substring(
      startPos, 
      endPos !== -1 ? endPos + 1 : content.length
    ).trim();
    
    // Highlight the anchor text in the context
    const highlightedContext = sentence.replace(
      new RegExp(`(${anchorText})`, 'i'),
      '**$1**'
    );
    
    return highlightedContext;
  }

  /**
   * Check if a word is a stop word
   * @param {string} word - Word to check
   * @returns {boolean} Whether the word is a stop word
   * @private
   */
  _isStopWord(word) {
    if (!word) return true;
    
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
      'be', 'been', 'being', 'to', 'of', 'for', 'with', 'by', 'about',
      'against', 'between', 'into', 'through', 'during', 'before', 'after',
      'above', 'below', 'from', 'up', 'down', 'in', 'out', 'on', 'off',
      'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there',
      'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few',
      'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
      'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will',
      'just', 'don', 'should', 'now', 'also', 'very', 'often', 'would'
    ]);
    
    return stopWords.has(word.toLowerCase());
  }

  /**
   * Check if a word is a determiner
   * @param {string} word - Word to check
   * @returns {boolean} Whether the word is a determiner
   * @private
   */
  _isDeterminer(word) {
    if (!word) return false;
    
    const determiners = new Set([
      'a', 'an', 'the', 'this', 'that', 'these', 'those', 'my', 'your', 
      'his', 'her', 'its', 'our', 'their', 'which', 'what', 'whatever', 
      'whichever', 'many', 'much', 'some', 'any', 'enough', 'no', 'few'
    ]);
    
    return determiners.has(word.toLowerCase());
  }
}

module.exports = AnchorTextOptimizer;
