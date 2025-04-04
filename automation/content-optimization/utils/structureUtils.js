/**
 * structureUtils.js
 * 
 * Utilities for parsing and analyzing HTML document structure.
 * Extracts structural elements like headings, paragraphs, lists, links,
 * and media for comprehensive structure analysis.
 */

const { JSDOM } = require('jsdom');

/**
 * Parses HTML and extracts structured elements
 * 
 * @param {string} html - HTML content to parse
 * @returns {Object} Extracted structure elements
 */
function parseHtmlStructure(html) {
  try {
    // Create DOM from HTML
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Extract all structural elements
    return {
      headings: extractHeadings(document),
      paragraphs: extractParagraphs(document),
      lists: extractLists(document),
      links: extractLinks(document),
      media: extractMedia(document),
      tables: extractTables(document)
    };
  } catch (error) {
    console.error('Error parsing HTML structure:', error);
    // Return empty structure as fallback
    return {
      headings: [],
      paragraphs: [],
      lists: [],
      links: [],
      media: [],
      tables: []
    };
  }
}

/**
 * Extracts headings from document
 * 
 * @param {Document} document - DOM document
 * @returns {Array} Extracted headings
 */
function extractHeadings(document) {
  const headings = [];
  
  // Select all heading elements
  const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  // Process each heading
  headingElements.forEach(heading => {
    const level = parseInt(heading.tagName.substring(1));
    
    headings.push({
      text: heading.textContent.trim(),
      level,
      id: heading.id || '',
      classes: Array.from(heading.classList)
    });
  });
  
  return headings;
}

/**
 * Extracts paragraphs from document
 * 
 * @param {Document} document - DOM document
 * @returns {Array} Extracted paragraphs
 */
function extractParagraphs(document) {
  const paragraphs = [];
  
  // Select all paragraph elements
  const paragraphElements = document.querySelectorAll('p');
  
  // Process each paragraph
  paragraphElements.forEach(p => {
    // Only include paragraphs with actual content
    if (p.textContent.trim().length > 0) {
      paragraphs.push({
        text: p.textContent.trim(),
        wordCount: p.textContent.split(/\s+/).filter(w => w.length > 0).length,
        hasLinks: p.querySelectorAll('a').length > 0
      });
    }
  });
  
  return paragraphs;
}

/**
 * Extracts lists from document
 * 
 * @param {Document} document - DOM document
 * @returns {Array} Extracted lists
 */
function extractLists(document) {
  const lists = [];
  
  // Select all list elements
  const listElements = document.querySelectorAll('ul, ol');
  
  // Process each list
  listElements.forEach(list => {
    const listItems = list.querySelectorAll('li');
    const items = [];
    
    // Process each list item
    listItems.forEach(item => {
      items.push({
        text: item.textContent.trim(),
        hasLinks: item.querySelectorAll('a').length > 0,
        hasNestedList: item.querySelectorAll('ul, ol').length > 0
      });
    });
    
    // Only include lists with actual items
    if (items.length > 0) {
      lists.push({
        type: list.tagName.toLowerCase(),
        items,
        itemCount: items.length,
        classes: Array.from(list.classList)
      });
    }
  });
  
  return lists;
}

/**
 * Extracts links from document
 * 
 * @param {Document} document - DOM document
 * @returns {Array} Extracted links
 */
function extractLinks(document) {
  const links = [];
  
  // Select all link elements
  const linkElements = document.querySelectorAll('a');
  
  // Process each link
  linkElements.forEach(link => {
    const href = link.getAttribute('href') || '';
    
    // Skip empty links and javascript: links
    if (href && !href.startsWith('javascript:')) {
      links.push({
        text: link.textContent.trim(),
        href,
        title: link.getAttribute('title') || '',
        target: link.getAttribute('target') || '',
        rel: link.getAttribute('rel') || '',
        hasImage: link.querySelectorAll('img').length > 0
      });
    }
  });
  
  return links;
}

/**
 * Extracts media elements from document
 * 
 * @param {Document} document - DOM document
 * @returns {Array} Extracted media
 */
function extractMedia(document) {
  const media = [];
  
  // Extract images
  const imageElements = document.querySelectorAll('img');
  imageElements.forEach(img => {
    const src = img.getAttribute('src') || '';
    
    // Skip empty or data: images
    if (src && !src.startsWith('data:')) {
      media.push({
        type: 'image',
        src,
        alt: img.getAttribute('alt') || '',
        width: img.getAttribute('width') || '',
        height: img.getAttribute('height') || '',
        loading: img.getAttribute('loading') || '',
        inFigure: img.closest('figure') !== null
      });
    }
  });
  
  // Extract videos
  const videoElements = document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]');
  videoElements.forEach(video => {
    const src = video.getAttribute('src') || '';
    
    media.push({
      type: 'video',
      src,
      width: video.getAttribute('width') || '',
      height: video.getAttribute('height') || '',
      autoplay: video.getAttribute('autoplay') !== null,
      controls: video.getAttribute('controls') !== null,
      platform: detectVideoPlatform(src)
    });
  });
  
  // Extract audio
  const audioElements = document.querySelectorAll('audio');
  audioElements.forEach(audio => {
    media.push({
      type: 'audio',
      src: audio.getAttribute('src') || '',
      controls: audio.getAttribute('controls') !== null
    });
  });
  
  return media;
}

/**
 * Detects video platform from URL
 * 
 * @private
 * @param {string} url - Video URL
 * @returns {string} Platform name
 */
function detectVideoPlatform(url) {
  if (url.includes('youtube') || url.includes('youtu.be')) {
    return 'youtube';
  } else if (url.includes('vimeo')) {
    return 'vimeo';
  } else if (url.includes('wistia')) {
    return 'wistia';
  } else {
    return 'unknown';
  }
}

/**
 * Extracts tables from document
 * 
 * @param {Document} document - DOM document
 * @returns {Array} Extracted tables
 */
function extractTables(document) {
  const tables = [];
  
  // Select all table elements
  const tableElements = document.querySelectorAll('table');
  
  // Process each table
  tableElements.forEach(table => {
    const rows = table.querySelectorAll('tr');
    
    // Only include tables with actual rows
    if (rows.length > 0) {
      // Check for header row
      const headerRow = table.querySelector('thead tr');
      const hasHeader = headerRow !== null;
      
      // Count columns
      const firstRow = rows[0];
      const columnCount = firstRow ? firstRow.querySelectorAll('td, th').length : 0;
      
      tables.push({
        rowCount: rows.length,
        columnCount,
        hasHeader,
        caption: table.querySelector('caption') ? table.querySelector('caption').textContent.trim() : '',
        classes: Array.from(table.classList)
      });
    }
  });
  
  return tables;
}

/**
 * Analyzes heading hierarchy for issues
 * 
 * @param {Array} headings - Extracted headings
 * @returns {Object} Hierarchy analysis result
 */
function analyzeHeadingHierarchy(headings) {
  const issues = [];
  
  // No headings
  if (headings.length === 0) {
    return {
      hasIssues: true,
      issues: [{ type: 'no_headings', description: 'No headings found in content' }]
    };
  }
  
  // Check for H1
  const hasH1 = headings.some(h => h.level === 1);
  if (!hasH1) {
    issues.push({ type: 'missing_h1', description: 'Missing H1 heading' });
  }
  
  // Multiple H1s
  const h1Count = headings.filter(h => h.level === 1).length;
  if (h1Count > 1) {
    issues.push({ type: 'multiple_h1', description: `Found ${h1Count} H1 headings (recommended: 1)` });
  }
  
  // Check hierarchy (no skipping levels)
  let lastLevel = 0;
  
  headings.forEach((heading, index) => {
    const level = heading.level;
    
    // First heading should be H1
    if (index === 0 && level > 1) {
      issues.push({ 
        type: 'first_heading_not_h1', 
        description: `First heading is H${level} instead of H1`,
        position: index
      });
    }
    
    // Skipped levels
    if (lastLevel > 0 && level > lastLevel + 1) {
      issues.push({ 
        type: 'skipped_level', 
        description: `Heading level jumps from H${lastLevel} to H${level}`,
        position: index
      });
    }
    
    lastLevel = level;
  });
  
  return {
    hasIssues: issues.length > 0,
    issues
  };
}

/**
 * Creates a document outline from headings
 * 
 * @param {Array} headings - Extracted headings
 * @returns {Array} Document outline tree
 */
function createDocumentOutline(headings) {
  const outline = [];
  const stack = [{ level: 0, children: outline }];
  
  headings.forEach(heading => {
    const node = {
      text: heading.text,
      level: heading.level,
      children: []
    };
    
    // Find the appropriate parent for this heading
    while (stack.length > 1 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }
    
    // Add this heading to its parent's children
    stack[stack.length - 1].children.push(node);
    
    // Push this heading onto the stack
    stack.push(node);
  });
  
  return outline;
}

/**
 * Analyzes content structure completeness
 * 
 * @param {Object} structure - Parsed structure elements
 * @returns {Object} Structure completeness analysis
 */
function analyzeStructureCompleteness(structure) {
  const {
    headings,
    paragraphs,
    lists,
    links,
    media,
    tables
  } = structure;
  
  // Calculate word count from paragraphs
  const totalWords = paragraphs.reduce((total, p) => total + p.wordCount, 0);
  
  // Define ideal structure metrics based on content length
  const idealMetrics = {
    // Short content (<500 words)
    short: {
      headingCount: 2,
      headingRatio: 0.01,  // 1 heading per 100 words
      mediaCount: 1,
      mediaRatio: 0.005,   // 1 media per 200 words
      listCount: 1,
      linkCount: 2,
      linkRatio: 0.01      // 1 link per 100 words
    },
    // Medium content (500-1500 words)
    medium: {
      headingCount: 5,
      headingRatio: 0.005, // 1 heading per 200 words
      mediaCount: 3,
      mediaRatio: 0.003,   // 1 media per 333 words
      listCount: 2,
      linkCount: 5,
      linkRatio: 0.006     // 1 link per 167 words
    },
    // Long content (>1500 words)
    long: {
      headingCount: 8,
      headingRatio: 0.004, // 1 heading per 250 words
      mediaCount: 5,
      mediaRatio: 0.002,   // 1 media per 500 words
      listCount: 3,
      linkCount: 8,
      linkRatio: 0.005     // 1 link per 200 words
    }
  };
  
  // Determine content size
  let contentSize;
  if (totalWords < 500) {
    contentSize = 'short';
  } else if (totalWords < 1500) {
    contentSize = 'medium';
  } else {
    contentSize = 'long';
  }
  
  const ideal = idealMetrics[contentSize];
  
  // Calculate completeness scores
  const headingScore = calculateCompletenessScore(headings.length, ideal.headingCount);
  const headingRatioScore = calculateCompletenessScore(headings.length / Math.max(1, totalWords), ideal.headingRatio);
  
  const mediaScore = calculateCompletenessScore(media.length, ideal.mediaCount);
  const mediaRatioScore = calculateCompletenessScore(media.length / Math.max(1, totalWords), ideal.mediaRatio);
  
  const listScore = calculateCompletenessScore(lists.length, ideal.listCount);
  
  const linkScore = calculateCompletenessScore(links.length, ideal.linkCount);
  const linkRatioScore = calculateCompletenessScore(links.length / Math.max(1, totalWords), ideal.linkRatio);
  
  // Calculate overall completeness score
  const overallScore = Math.round(
    (headingScore * 0.25) +
    (headingRatioScore * 0.1) +
    (mediaScore * 0.2) +
    (mediaRatioScore * 0.1) +
    (listScore * 0.15) +
    (linkScore * 0.1) +
    (linkRatioScore * 0.1)
  );
  
  return {
    contentSize,
    totalWords,
    completenessScore: overallScore,
    elementScores: {
      headings: headingScore,
      media: mediaScore,
      lists: listScore,
      links: linkScore
    },
    ratioScores: {
      headingRatio: headingRatioScore,
      mediaRatio: mediaRatioScore,
      linkRatio: linkRatioScore
    },
    ideal
  };
}

/**
 * Calculates completeness score for a structure element
 * 
 * @private
 * @param {number} actual - Actual value
 * @param {number} ideal - Ideal value
 * @returns {number} Completeness score (0-100)
 */
function calculateCompletenessScore(actual, ideal) {
  if (actual >= ideal) {
    return 100; // Full score for meeting or exceeding ideal
  } else {
    return Math.round((actual / ideal) * 100);
  }
}

module.exports = {
  parseHtmlStructure,
  extractHeadings,
  analyzeHeadingHierarchy,
  createDocumentOutline,
  analyzeStructureCompleteness
};
