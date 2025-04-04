/**
 * ReadabilityAnalyzer.js
 * 
 * Analyzes content for readability metrics including:
 * - Flesch-Kincaid reading ease
 * - Sentence complexity
 * - Paragraph length
 * - Active vs. passive voice
 * - Word choice complexity
 * 
 * Provides recommendations for improving content readability
 * based on target audience and best practices.
 */

const { SuggestionBuilder } = require('../utils/suggestionUtils');
const { 
  calculateFleschReadingEase,
  identifyLongSentences,
  identifyLongParagraphs,
  identifyPassiveVoice,
  identifyComplexWords
} = require('../utils/readabilityUtils');

class ReadabilityAnalyzer {
  constructor(options = {}) {
    this.options = {
      // Default minimum content length for reliable analysis
      minContentLength: 100,
      
      // Reading level targets by audience type
      readingLevelTargets: {
        general: { min: 60, max: 70 },        // 8th-9th grade level
        technical: { min: 30, max: 50 },      // College level
        academic: { min: 30, max: 40 },       // College/graduate level
        beginner: { min: 80, max: 90 }        // 5th-6th grade level
      },
      
      // Thresholds for recommendations
      thresholds: {
        longSentenceWords: 25,                // Words per sentence
        longParagraphSentences: 5,            // Sentences per paragraph
        passiveVoicePercentage: 15,           // % of passive sentences
        complexWordPercentage: 10             // % of complex words
      },
      
      // Override with provided options
      ...options
    };
    
    this.suggestionBuilder = new SuggestionBuilder('readability');
  }

  /**
   * Analyzes content for readability and generates recommendations
   * 
   * @param {string} content - Normalized text content to analyze
   * @param {Object} context - Additional context for analysis
   * @param {string} context.audienceType - Target audience type
   * @returns {Object} Analysis results with readability suggestions
   */
  async analyze(content, context = {}) {
    // If content is too short, provide limited analysis
    if (content.length < this.options.minContentLength) {
      return this._generateLimitedAnalysis(content);
    }
    
    // Determine the target audience type
    const audienceType = context.audienceType || 'general';
    const readingTarget = this.options.readingLevelTargets[audienceType] || 
                          this.options.readingLevelTargets.general;
    
    // Run various readability analyses
    const fleschScore = calculateFleschReadingEase(content);
    const longSentences = identifyLongSentences(content, this.options.thresholds.longSentenceWords);
    const longParagraphs = identifyLongParagraphs(content, this.options.thresholds.longParagraphSentences);
    const passiveVoice = identifyPassiveVoice(content);
    const complexWords = identifyComplexWords(content);
    
    // Calculate percentages for tracked metrics
    const sentences = content.match(/[.!?]+\s/g) || [];
    const paragraphs = content.split(/\n\s*\n|\r\n\s*\r\n/);
    const words = content.split(/\s+/);
    
    const metrics = {
      fleschReadingEase: fleschScore,
      averageSentenceLength: sentences.length ? words.length / sentences.length : 0,
      averageParagraphLength: paragraphs.length ? sentences.length / paragraphs.length : 0,
      longSentencesPercentage: sentences.length ? (longSentences.length / sentences.length) * 100 : 0,
      longParagraphsPercentage: paragraphs.length ? (longParagraphs.length / paragraphs.length) * 100 : 0,
      passiveVoicePercentage: sentences.length ? (passiveVoice.length / sentences.length) * 100 : 0,
      complexWordsPercentage: words.length ? (complexWords.length / words.length) * 100 : 0,
      audienceType
    };
    
    // Generate readability suggestions
    const suggestions = this._generateSuggestions(metrics, readingTarget, {
      longSentences,
      longParagraphs,
      passiveVoice,
      complexWords
    });
    
    // Calculate overall readability score
    const score = this._calculateScore(metrics, readingTarget);
    
    return {
      score,
      metrics,
      suggestions
    };
  }
  
  /**
   * Generates a limited analysis for short content
   * 
   * @private
   * @param {string} content - Content to analyze
   * @returns {Object} Limited analysis results
   */
  _generateLimitedAnalysis(content) {
    const suggestions = [
      this.suggestionBuilder.create({
        type: 'content_length',
        importance: 'medium',
        title: 'Add more content for accurate readability analysis',
        description: `Your content is only ${content.length} characters long, which is too short for reliable readability analysis.`,
        implementation: 'Expand your content to at least 100 words for a more accurate readability assessment.',
        confidence: 0.9
      })
    ];
    
    return {
      score: 50, // Neutral score for insufficient content
      metrics: {
        fleschReadingEase: 0,
        averageSentenceLength: 0,
        averageParagraphLength: 0,
        longSentencesPercentage: 0,
        longParagraphsPercentage: 0,
        passiveVoicePercentage: 0,
        complexWordsPercentage: 0
      },
      suggestions
    };
  }
  
  /**
   * Generates readability improvement suggestions
   * 
   * @private
   * @param {Object} metrics - Readability metrics
   * @param {Object} target - Target readability levels
   * @param {Object} elements - Identified problematic elements
   * @returns {Array} Readability suggestions
   */
  _generateSuggestions(metrics, target, elements) {
    const suggestions = [];
    
    // Check Flesch Reading Ease score against target
    if (metrics.fleschReadingEase < target.min) {
      suggestions.push(
        this.suggestionBuilder.create({
          type: 'reading_ease_low',
          importance: 'high',
          title: 'Simplify content to improve readability',
          description: `Your content's reading ease score (${metrics.fleschReadingEase.toFixed(1)}) is below the target range (${target.min}-${target.max}) for your audience.`,
          implementation: 'Use shorter sentences, simpler words, and more direct language. Break complex concepts into smaller, digestible parts.',
          confidence: 0.85
        })
      );
    } else if (metrics.fleschReadingEase > target.max) {
      suggestions.push(
        this.suggestionBuilder.create({
          type: 'reading_ease_high',
          importance: 'medium',
          title: 'Add more depth to your content',
          description: `Your content's reading ease score (${metrics.fleschReadingEase.toFixed(1)}) is above the target range (${target.min}-${target.max}) for your audience.`,
          implementation: 'Incorporate more sophisticated vocabulary and nuanced explanations where appropriate.',
          confidence: 0.75
        })
      );
    }
    
    // Check for long sentences
    if (metrics.longSentencesPercentage > 20) {
      const examples = elements.longSentences.slice(0, 2).map(s => `"${s.substr(0, 60)}..."`);
      suggestions.push(
        this.suggestionBuilder.create({
          type: 'long_sentences',
          importance: 'high',
          title: 'Shorten or break up long sentences',
          description: `${metrics.longSentencesPercentage.toFixed(1)}% of your sentences exceed ${this.options.thresholds.longSentenceWords} words, which can reduce readability.`,
          implementation: `Break long sentences into shorter ones. Examples: ${examples.join(' ')}`,
          confidence: 0.9
        })
      );
    }
    
    // Check for long paragraphs
    if (metrics.longParagraphsPercentage > 30) {
      suggestions.push(
        this.suggestionBuilder.create({
          type: 'long_paragraphs',
          importance: 'medium',
          title: 'Break up long paragraphs',
          description: `${metrics.longParagraphsPercentage.toFixed(1)}% of your paragraphs have more than ${this.options.thresholds.longParagraphSentences} sentences, which can intimidate readers.`,
          implementation: 'Divide long paragraphs into smaller ones, ideally with 2-3 sentences each for optimal online readability.',
          confidence: 0.85
        })
      );
    }
    
    // Check for passive voice
    if (metrics.passiveVoicePercentage > this.options.thresholds.passiveVoicePercentage) {
      const examples = elements.passiveVoice.slice(0, 2).map(s => `"${s.trim()}"`);
      suggestions.push(
        this.suggestionBuilder.create({
          type: 'passive_voice',
          importance: 'medium',
          title: 'Reduce passive voice usage',
          description: `${metrics.passiveVoicePercentage.toFixed(1)}% of your sentences use passive voice, which can make content less engaging and clear.`,
          implementation: `Convert passive sentences to active voice. Examples: ${examples.join(' ')}`,
          confidence: 0.8
        })
      );
    }
    
    // Check for complex words
    if (metrics.complexWordsPercentage > this.options.thresholds.complexWordPercentage) {
      const examples = elements.complexWords.slice(0, 5).join(', ');
      suggestions.push(
        this.suggestionBuilder.create({
          type: 'complex_words',
          importance: 'medium',
          title: 'Replace complex words with simpler alternatives',
          description: `${metrics.complexWordsPercentage.toFixed(1)}% of your words are considered complex, which can reduce comprehension.`,
          implementation: `Replace complex words with simpler alternatives. Examples: ${examples}`,
          confidence: 0.85
        })
      );
    }
    
    return suggestions;
  }
  
  /**
   * Calculates overall readability score
   * 
   * @private
   * @param {Object} metrics - Readability metrics
   * @param {Object} target - Target readability levels
   * @returns {number} Score from 0-100
   */
  _calculateScore(metrics, target) {
    let score = 50; // Base score
    
    // Score based on reading ease (max 40 points)
    const targetMidpoint = (target.min + target.max) / 2;
    const targetRange = target.max - target.min;
    
    if (metrics.fleschReadingEase >= target.min && metrics.fleschReadingEase <= target.max) {
      // Full points for being within target range
      score += 40;
    } else {
      // Partial points based on distance from target range
      const distance = metrics.fleschReadingEase < target.min ? 
                       target.min - metrics.fleschReadingEase : 
                       metrics.fleschReadingEase - target.max;
      
      const penaltyFactor = Math.min(1, distance / (targetRange / 2));
      score += 40 * (1 - penaltyFactor);
    }
    
    // Score based on sentence and paragraph structure (max 30 points)
    let structureScore = 30;
    
    // Penalty for long sentences
    if (metrics.longSentencesPercentage > 20) {
      structureScore -= Math.min(15, (metrics.longSentencesPercentage - 20) / 2);
    }
    
    // Penalty for long paragraphs
    if (metrics.longParagraphsPercentage > 30) {
      structureScore -= Math.min(10, (metrics.longParagraphsPercentage - 30) / 3);
    }
    
    // Penalty for passive voice
    if (metrics.passiveVoicePercentage > this.options.thresholds.passiveVoicePercentage) {
      structureScore -= Math.min(5, (metrics.passiveVoicePercentage - this.options.thresholds.passiveVoicePercentage) / 3);
    }
    
    score += Math.max(0, structureScore);
    
    // Bonus points for very clean content with no major issues (max 10 points)
    if (metrics.longSentencesPercentage < 10 && 
        metrics.longParagraphsPercentage < 20 && 
        metrics.passiveVoicePercentage < this.options.thresholds.passiveVoicePercentage / 2 &&
        metrics.fleschReadingEase >= target.min && 
        metrics.fleschReadingEase <= target.max) {
      score += 10;
    }
    
    return Math.min(100, Math.max(0, Math.round(score)));
  }
}

module.exports = ReadabilityAnalyzer;
