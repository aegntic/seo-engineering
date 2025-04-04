/**
 * StructureAnalyzer.js
 * 
 * Analyzes content structure including:
 * - Heading hierarchy and organization
 * - Content segmentation
 * - List usage
 * - Multimedia integration
 * - Internal linking
 * 
 * Provides recommendations for improving content structure
 * based on best practices and user engagement factors.
 */

const { SuggestionBuilder } = require('../utils/suggestionUtils');
const { parseHtmlStructure, extractHeadings } = require('../utils/structureUtils');

class StructureAnalyzer {
  constructor(options = {}) {
    this.options = {
      // Ideal content structure metrics
      idealHeadingDensity: 0.05,      // One heading per ~20 sentences
      idealMediaDensity: 0.02,        // One media element per ~50 sentences
      idealListDensity: 0.03,         // One list per ~33 sentences
      idealLinkDensity: 0.04,         // One link per ~25 sentences
      
      // Minimum counts for reliable analysis
      minContentLength: 500,
      minSentenceCount: 5,
      
      // Override with provided options
      ...options
    };
    
    this.suggestionBuilder = new SuggestionBuilder('structure');
  }

  /**
   * Analyzes content structure and generates recommendations
   * 
   * @param {Object} contentData - Content data to analyze
   * @param {string} contentData.html - HTML content of the page
   * @param {string} contentData.url - URL of the page
   * @param {Object} context - Additional context for analysis
   * @param {string} context.contentType - Content type (article, product, etc.)
   * @returns {Object} Analysis results with structure suggestions
   */
  async analyze(contentData, context = {}) {
    // Extract actual HTML from contentData
    const html = contentData.html;
    
    // If HTML is missing or too short, provide limited analysis
    if (!html || html.length < this.options.minContentLength) {
      return this._generateLimitedAnalysis(html || '');
    }
    
    // Parse HTML to extract structure elements
    const structure = parseHtmlStructure(html);
    
    // Determine content type for specialized analysis
    const contentType = context.contentType || this._detectContentType(structure);
    
    // Analyze structure components
    const headingAnalysis = this._analyzeHeadings(structure.headings);
    const mediaAnalysis = this._analyzeMedia(structure.media);
    const listAnalysis = this._analyzeLists(structure.lists);
    const linkAnalysis = this._analyzeLinks(structure.links, contentData.url);
    
    // Calculate metrics relative to content length
    const sentenceCount = (html.match(/[.!?]+\s/g) || []).length;
    const paragraphCount = structure.paragraphs.length;
    
    const metrics = {
      headingCount: structure.headings.length,
      headingDensity: sentenceCount ? structure.headings.length / sentenceCount : 0,
      mediaCount: structure.media.length,
      mediaDensity: sentenceCount ? structure.media.length / sentenceCount : 0,
      listCount: structure.lists.length,
      listDensity: sentenceCount ? structure.lists.length / sentenceCount : 0,
      linkCount: structure.links.length,
      linkDensity: sentenceCount ? structure.links.length / sentenceCount : 0,
      paragraphCount,
      sentenceCount,
      contentType
    };
    
    // Generate structure suggestions
    const suggestions = this._generateSuggestions(
      metrics,
      {
        headingAnalysis,
        mediaAnalysis,
        listAnalysis,
        linkAnalysis
      },
      contentType
    );
    
    // Calculate overall structure score
    const score = this._calculateScore(metrics, {
      headingAnalysis,
      mediaAnalysis,
      listAnalysis,
      linkAnalysis
    });
    
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
   * @param {string} html - HTML content to analyze
   * @returns {Object} Limited analysis results
   */
  _generateLimitedAnalysis(html) {
    const suggestions = [
      this.suggestionBuilder.create({
        type: 'content_length',
        importance: 'high',
        title: 'Add more content for proper structure analysis',
        description: `Your content is only ${html.length} characters long, which is too short for meaningful structure analysis.`,
        implementation: 'Expand your content to at least 500 characters with proper HTML structure.',
        confidence: 0.95
      })
    ];
    
    return {
      score: 30, // Low score for insufficient content
      metrics: {
        headingCount: 0,
        headingDensity: 0,
        mediaCount: 0,
        mediaDensity: 0,
        listCount: 0,
        listDensity: 0,
        linkCount: 0,
        linkDensity: 0,
        paragraphCount: 0,
        sentenceCount: 0,
        contentType: 'unknown'
      },
      suggestions
    };
  }
  
  /**
   * Detects content type from structure patterns
   * 
   * @private
   * @param {Object} structure - Parsed HTML structure
   * @returns {string} Detected content type
   */
  _detectContentType(structure) {
    // This would use heuristics to determine content type
    // based on structure patterns, keywords, etc.
    
    // Simplified detection for demo
    const hasProductIndicators = structure.headings.some(h => 
      /price|buy|product|purchase|shop/i.test(h.text)
    );
    
    const hasBlogIndicators = structure.headings.some(h => 
      /post|article|blog|guide|how to/i.test(h.text)
    );
    
    if (hasProductIndicators && structure.media.length > 1) {
      return 'product';
    } else if (hasBlogIndicators || structure.paragraphs.length > 5) {
      return 'article';
    } else if (structure.lists.length > 3) {
      return 'listicle';
    }
    
    return 'general';
  }
  
  /**
   * Analyzes heading structure
   * 
   * @private
   * @param {Array} headings - Extracted headings
   * @returns {Object} Heading analysis results
   */
  _analyzeHeadings(headings) {
    const result = {
      hasH1: false,
      hierarchyIssues: [],
      logicalFlow: true,
      keywordPresence: 0
    };
    
    if (headings.length === 0) {
      return {
        ...result,
        logicalFlow: false
      };
    }
    
    // Check for H1 presence
    result.hasH1 = headings.some(h => h.level === 1);
    
    // Check heading hierarchy
    let lastLevel = 0;
    headings.forEach((heading, index) => {
      const level = heading.level;
      
      // First heading should be H1
      if (index === 0 && level > 1) {
        result.hierarchyIssues.push({
          type: 'missing_h1',
          description: 'Content should start with an H1 heading'
        });
      }
      
      // Heading levels shouldn't skip (e.g., H2 to H4)
      if (lastLevel > 0 && level > lastLevel + 1) {
        result.hierarchyIssues.push({
          type: 'skipped_level',
          description: `Heading level jumps from H${lastLevel} to H${level}`,
          position: index
        });
      }
      
      lastLevel = level;
    });
    
    // Assess logical flow and keyword presence (simplified)
    // In a real implementation, this would be more sophisticated
    result.keywordPresence = Math.random() * 100;
    
    return result;
  }
  
  /**
   * Analyzes media elements
   * 
   * @private
   * @param {Array} media - Extracted media elements
   * @returns {Object} Media analysis results
   */
  _analyzeMedia(media) {
    const result = {
      hasImages: false,
      hasAltText: false,
      hasVideo: false,
      altTextQuality: 0
    };
    
    if (media.length === 0) {
      return result;
    }
    
    const images = media.filter(m => m.type === 'image');
    const videos = media.filter(m => m.type === 'video');
    
    result.hasImages = images.length > 0;
    result.hasVideo = videos.length > 0;
    
    // Check for alt text
    const imagesWithAlt = images.filter(img => img.alt && img.alt.trim().length > 0);
    result.hasAltText = imagesWithAlt.length > 0;
    
    // Assess alt text quality (simplified)
    if (imagesWithAlt.length > 0) {
      const avgAltLength = imagesWithAlt.reduce((sum, img) => sum + img.alt.length, 0) / imagesWithAlt.length;
      result.altTextQuality = Math.min(100, avgAltLength * 2); // Simple heuristic
    }
    
    return result;
  }
  
  /**
   * Analyzes list elements
   * 
   * @private
   * @param {Array} lists - Extracted list elements
   * @returns {Object} List analysis results
   */
  _analyzeLists(lists) {
    const result = {
      hasLists: false,
      listTypes: {
        ordered: 0,
        unordered: 0
      },
      averageItemCount: 0
    };
    
    if (lists.length === 0) {
      return result;
    }
    
    result.hasLists = true;
    
    // Count list types
    lists.forEach(list => {
      if (list.type === 'ol') {
        result.listTypes.ordered++;
      } else {
        result.listTypes.unordered++;
      }
    });
    
    // Calculate average items per list
    const totalItems = lists.reduce((sum, list) => sum + list.items.length, 0);
    result.averageItemCount = totalItems / lists.length;
    
    return result;
  }
  
  /**
   * Analyzes link structure
   * 
   * @private
   * @param {Array} links - Extracted links
   * @param {string} pageUrl - URL of the current page
   * @returns {Object} Link analysis results
   */
  _analyzeLinks(links, pageUrl) {
    const result = {
      hasLinks: false,
      internalLinks: 0,
      externalLinks: 0,
      anchor: 0,
      averageLinkTextQuality: 0
    };
    
    if (links.length === 0) {
      return result;
    }
    
    result.hasLinks = true;
    
    // Parse page domain for internal/external classification
    let domain = '';
    try {
      const url = new URL(pageUrl);
      domain = url.hostname;
    } catch (e) {
      domain = pageUrl.split('/')[0];
    }
    
    // Categorize links
    links.forEach(link => {
      if (link.href.startsWith('#')) {
        result.anchor++;
      } else if (link.href.includes(domain) || link.href.startsWith('/')) {
        result.internalLinks++;
      } else {
        result.externalLinks++;
      }
    });
    
    // Assess link text quality (simplified)
    const linkTexts = links.map(link => link.text);
    const nonGenericCount = linkTexts.filter(text => 
      !/(click here|read more|learn more|here)/i.test(text) && text.length > 3
    ).length;
    
    result.averageLinkTextQuality = links.length ? (nonGenericCount / links.length) * 100 : 0;
    
    return result;
  }
  
  /**
   * Generates structure improvement suggestions
   * 
   * @private
   * @param {Object} metrics - Structure metrics
   * @param {Object} analyses - Component analyses results
   * @param {string} contentType - Content type
   * @returns {Array} Structure improvement suggestions
   */
  _generateSuggestions(metrics, analyses, contentType) {
    const suggestions = [];
    const { headingAnalysis, mediaAnalysis, listAnalysis, linkAnalysis } = analyses;
    
    // Heading suggestions
    if (!headingAnalysis.hasH1) {
      suggestions.push(
        this.suggestionBuilder.create({
          type: 'missing_h1',
          importance: 'high',
          title: 'Add an H1 heading',
          description: 'Your content is missing a main H1 heading, which is crucial for SEO and content structure.',
          implementation: 'Add an H1 heading at the beginning of your content that clearly describes the main topic.',
          confidence: 0.95
        })
      );
    }
    
    if (headingAnalysis.hierarchyIssues.length > 0) {
      suggestions.push(
        this.suggestionBuilder.create({
          type: 'heading_hierarchy',
          importance: 'medium',
          title: 'Fix heading hierarchy',
          description: `Your content has ${headingAnalysis.hierarchyIssues.length} heading hierarchy issues, which can confuse both users and search engines.`,
          implementation: 'Ensure heading levels follow a logical sequence (H1 → H2 → H3) without skipping levels.',
          confidence: 0.9
        })
      );
    }
    
    if (metrics.headingDensity < this.options.idealHeadingDensity && metrics.sentenceCount > this.options.minSentenceCount) {
      suggestions.push(
        this.suggestionBuilder.create({
          type: 'heading_density',
          importance: 'medium',
          title: 'Add more section headings',
          description: 'Your content has too few headings for its length, making it less scannable.',
          implementation: 'Break up long text sections with descriptive H2 and H3 headings every 200-300 words.',
          confidence: 0.85
        })
      );
    }
    
    // Media suggestions
    if (!mediaAnalysis.hasImages && contentType !== 'listicle' && metrics.paragraphCount > 3) {
      suggestions.push(
        this.suggestionBuilder.create({
          type: 'missing_images',
          importance: 'high',
          title: 'Add images to your content',
          description: 'Your content has no images, which reduces engagement and visual appeal.',
          implementation: 'Add relevant images, diagrams, or infographics to illustrate key points and break up text.',
          confidence: 0.9
        })
      );
    }
    
    if (mediaAnalysis.hasImages && !mediaAnalysis.hasAltText) {
      suggestions.push(
        this.suggestionBuilder.create({
          type: 'missing_alt_text',
          importance: 'high',
          title: 'Add alt text to images',
          description: 'Your images are missing alt text, which is essential for accessibility and SEO.',
          implementation: 'Add descriptive alt text to all images that clearly describes their content and purpose.',
          confidence: 0.95
        })
      );
    }
    
    if (mediaAnalysis.hasImages && mediaAnalysis.altTextQuality < 50) {
      suggestions.push(
        this.suggestionBuilder.create({
          type: 'improve_alt_text',
          importance: 'medium',
          title: 'Improve image alt text quality',
          description: 'Your image alt text is too short or generic, reducing its effectiveness for SEO and accessibility.',
          implementation: 'Use specific, descriptive alt text that explains image content in context (8-12 words recommended).',
          confidence: 0.85
        })
      );
    }
    
    if (contentType === 'product' && !mediaAnalysis.hasVideo) {
      suggestions.push(
        this.suggestionBuilder.create({
          type: 'add_product_video',
          importance: 'medium',
          title: 'Add product demonstration video',
          description: 'Product pages with videos have higher conversion rates and engagement.',
          implementation: 'Add a short product demonstration or overview video to showcase features and benefits.',
          confidence: 0.8
        })
      );
    }
    
    // List suggestions
    if (!listAnalysis.hasLists && contentType !== 'product' && metrics.paragraphCount > 5) {
      suggestions.push(
        this.suggestionBuilder.create({
          type: 'add_lists',
          importance: 'medium',
          title: 'Add lists to structure content',
          description: 'Your content has no lists, which can help break up text and improve scannability.',
          implementation: 'Convert appropriate paragraphs to bullet or numbered lists, especially for steps, features, or benefits.',
          confidence: 0.8
        })
      );
    }
    
    // Link suggestions
    if (!linkAnalysis.hasLinks && contentType === 'article') {
      suggestions.push(
        this.suggestionBuilder.create({
          type: 'add_links',
          importance: 'medium',
          title: 'Add internal links to your content',
          description: 'Your content has no links, which reduces SEO value and user navigation options.',
          implementation: 'Add relevant internal links to related content and external links to authoritative sources.',
          confidence: 0.85
        })
      );
    }
    
    if (linkAnalysis.averageLinkTextQuality < 60 && linkAnalysis.hasLinks) {
      suggestions.push(
        this.suggestionBuilder.create({
          type: 'improve_link_text',
          importance: 'medium',
          title: 'Improve link anchor text',
          description: 'Your link text is generic or unclear (e.g., "click here"), reducing SEO value and user guidance.',
          implementation: 'Use descriptive, keyword-rich anchor text that clearly indicates what users will find when clicking.',
          confidence: 0.85
        })
      );
    }
    
    // Content type specific suggestions
    if (contentType === 'article' && metrics.paragraphCount > 10 && !linkAnalysis.anchor) {
      suggestions.push(
        this.suggestionBuilder.create({
          type: 'add_table_of_contents',
          importance: 'medium',
          title: 'Add a table of contents',
          description: 'Your long-form content would benefit from a table of contents to improve navigation.',
          implementation: 'Add a table of contents with anchor links to main sections at the beginning of your article.',
          confidence: 0.8
        })
      );
    }
    
    return suggestions;
  }
  
  /**
   * Calculates overall structure score
   * 
   * @private
   * @param {Object} metrics - Structure metrics
   * @param {Object} analyses - Component analyses results
   * @returns {number} Score from 0-100
   */
  _calculateScore(metrics, analyses) {
    const { headingAnalysis, mediaAnalysis, listAnalysis, linkAnalysis } = analyses;
    let score = 50; // Base score
    
    // Heading structure score (max 30 points)
    let headingScore = 0;
    
    // H1 presence
    if (headingAnalysis.hasH1) {
      headingScore += 10;
    }
    
    // Heading density
    const headingDensityRatio = metrics.headingDensity / this.options.idealHeadingDensity;
    if (headingDensityRatio >= 0.8 && headingDensityRatio <= 1.5) {
      headingScore += 10;
    } else if (headingDensityRatio > 0 && headingDensityRatio < 2) {
      headingScore += 5;
    }
    
    // Heading hierarchy
    const hierarchyScore = Math.max(0, 10 - (headingAnalysis.hierarchyIssues.length * 2));
    headingScore += hierarchyScore;
    
    // Media score (max 25 points)
    let mediaScore = 0;
    
    // Image presence
    if (mediaAnalysis.hasImages) {
      mediaScore += 10;
      
      // Alt text quality
      if (mediaAnalysis.hasAltText) {
        mediaScore += 5;
        
        // Alt text quality score
        mediaScore += Math.min(5, (mediaAnalysis.altTextQuality / 100) * 5);
      }
    }
    
    // Video presence (bonus)
    if (mediaAnalysis.hasVideo) {
      mediaScore += 5;
    }
    
    // List score (max 15 points)
    let listScore = 0;
    
    if (listAnalysis.hasLists) {
      listScore += 10;
      
      // Variety of list types
      if (listAnalysis.listTypes.ordered > 0 && listAnalysis.listTypes.unordered > 0) {
        listScore += 2;
      }
      
      // Appropriate list item count
      if (listAnalysis.averageItemCount >= 3 && listAnalysis.averageItemCount <= 7) {
        listScore += 3;
      } else if (listAnalysis.averageItemCount > 0) {
        listScore += 1;
      }
    }
    
    // Link score (max 20 points)
    let linkScore = 0;
    
    if (linkAnalysis.hasLinks) {
      linkScore += 10;
      
      // Internal links
      if (linkAnalysis.internalLinks > 0) {
        linkScore += Math.min(5, linkAnalysis.internalLinks);
      }
      
      // Link text quality
      linkScore += Math.min(5, (linkAnalysis.averageLinkTextQuality / 100) * 5);
    }
    
    // Calculate final score
    score = Math.min(100, Math.round(
      50 + // Base score
      (headingScore * 0.3) + // 30% weight
      (mediaScore * 0.25) + // 25% weight
      (listScore * 0.15) + // 15% weight
      (linkScore * 0.2) // 20% weight
    ));
    
    // Apply penalty for very short content
    if (metrics.sentenceCount < this.options.minSentenceCount) {
      score = Math.round(score * 0.7);
    }
    
    return score;
  }
}

module.exports = StructureAnalyzer;
