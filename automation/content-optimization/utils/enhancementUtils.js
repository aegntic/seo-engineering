/**
 * enhancementUtils.js
 * 
 * Utilities for generating content enhancement suggestions based on analysis results.
 * Provides advanced content improvement recommendations that go beyond basic fixes.
 */

/**
 * Generates content enhancement ideas based on analysis results
 * 
 * @param {string} content - Content to enhance
 * @param {Object} metrics - Analysis metrics from various analyzers
 * @param {Object} context - Additional context
 * @returns {Array} Enhancement ideas
 */
function generateEnhancementIdeas(content, metrics, context = {}) {
  // Set of possible enhancement types to consider
  const enhancementTypes = [
    'introduction',
    'conclusion',
    'persuasive_elements',
    'engagement_elements',
    'clarity_improvements',
    'topical_coverage',
    'trust_signals'
  ];
  
  // Collect all enhancement ideas
  const allIdeas = [];
  
  // Generate ideas for each enhancement type
  enhancementTypes.forEach(type => {
    const typeIdeas = generateIdeasByType(type, content, metrics, context);
    allIdeas.push(...typeIdeas);
  });
  
  // Remove duplicate ideas (same title)
  const uniqueIdeas = [];
  const seenTitles = new Set();
  
  allIdeas.forEach(idea => {
    if (!seenTitles.has(idea.title)) {
      seenTitles.add(idea.title);
      uniqueIdeas.push(idea);
    }
  });
  
  return uniqueIdeas;
}

/**
 * Generates ideas for a specific enhancement type
 * 
 * @private
 * @param {string} type - Enhancement type
 * @param {string} content - Content to enhance
 * @param {Object} metrics - Analysis metrics
 * @param {Object} context - Additional context
 * @returns {Array} Type-specific enhancement ideas
 */
function generateIdeasByType(type, content, metrics, context) {
  switch (type) {
    case 'introduction':
      return generateIntroductionIdeas(content, metrics, context);
    case 'conclusion':
      return generateConclusionIdeas(content, metrics, context);
    case 'persuasive_elements':
      return generatePersuasiveElementIdeas(content, metrics, context);
    case 'engagement_elements':
      return generateEngagementElementIdeas(content, metrics, context);
    case 'clarity_improvements':
      return generateClarityImprovementIdeas(content, metrics, context);
    case 'topical_coverage':
      return generateTopicalCoverageIdeas(content, metrics, context);
    case 'trust_signals':
      return generateTrustSignalIdeas(content, metrics, context);
    default:
      return [];
  }
}

/**
 * Generates introduction enhancement ideas
 * 
 * @private
 * @param {string} content - Content to enhance
 * @param {Object} metrics - Analysis metrics
 * @param {Object} context - Additional context
 * @returns {Array} Introduction enhancement ideas
 */
function generateIntroductionIdeas(content, metrics, context) {
  const ideas = [];
  const contentType = context.contentType || detectContentType(content);
  const { keywordMetrics } = metrics;
  
  // Detect if content has a proper introduction
  const hasProperIntroduction = detectProperIntroduction(content);
  
  if (!hasProperIntroduction) {
    ideas.push({
      type: 'introduction',
      title: 'Add a compelling introduction',
      description: 'Your content lacks a clear introduction, which is essential for engaging readers and establishing the topic.',
      implementation: 'Add a 2-3 sentence introduction that hooks readers, states the main topic, and includes your primary keyword.',
      confidence: 0.9
    });
  }
  
  // Check if introduction includes main keyword (if we have keyword data)
  if (hasProperIntroduction && keywordMetrics && keywordMetrics.keywordCount) {
    const mainKeyword = Object.keys(keywordMetrics.keywordCount).reduce((a, b) => 
      keywordMetrics.keywordCount[a] > keywordMetrics.keywordCount[b] ? a : b
    );
    
    const firstParagraph = extractFirstParagraph(content);
    const keywordInIntro = firstParagraph.toLowerCase().includes(mainKeyword.toLowerCase());
    
    if (!keywordInIntro) {
      ideas.push({
        type: 'introduction',
        title: 'Include target keyword in introduction',
        description: `Your introduction doesn't include your main keyword "${mainKeyword}", which is important for SEO and topic clarity.`,
        implementation: `Naturally incorporate "${mainKeyword}" in your introduction to establish relevance early.`,
        confidence: 0.85
      });
    }
  }
  
  // Content type specific introduction suggestions
  if (contentType === 'product' && hasProperIntroduction) {
    ideas.push({
      type: 'introduction',
      title: 'Enhance product introduction with benefits',
      description: 'Product introductions convert better when they immediately highlight key benefits.',
      implementation: 'Revise your introduction to lead with 2-3 specific benefits that address customer pain points.',
      confidence: 0.8
    });
  } else if (contentType === 'blog' && hasProperIntroduction) {
    ideas.push({
      type: 'introduction',
      title: 'Add a curiosity gap to your introduction',
      description: 'Blog introductions perform better when they create curiosity that motivates continued reading.',
      implementation: 'Add an intriguing question or hint at valuable information to come later in the content.',
      confidence: 0.75
    });
  }
  
  return ideas;
}

/**
 * Generates conclusion enhancement ideas
 * 
 * @private
 * @param {string} content - Content to enhance
 * @param {Object} metrics - Analysis metrics
 * @param {Object} context - Additional context
 * @returns {Array} Conclusion enhancement ideas
 */
function generateConclusionIdeas(content, metrics, context) {
  const ideas = [];
  const contentType = context.contentType || detectContentType(content);
  
  // Detect if content has a proper conclusion
  const hasProperConclusion = detectProperConclusion(content);
  
  if (!hasProperConclusion) {
    ideas.push({
      type: 'conclusion',
      title: 'Add a strong conclusion',
      description: 'Your content lacks a clear conclusion, which helps reinforce key points and guide next steps.',
      implementation: 'Add a conclusion that summarizes main points and includes a clear call-to-action appropriate for your content.',
      confidence: 0.9
    });
  }
  
  // Content type specific conclusion suggestions
  if (contentType === 'product' && hasProperConclusion) {
    ideas.push({
      type: 'conclusion',
      title: 'Strengthen product conclusion with urgency',
      description: 'Product descriptions convert better when the conclusion creates a sense of urgency or scarcity.',
      implementation: 'Add time-sensitive language or limited availability messaging to motivate immediate action.',
      confidence: 0.8
    });
  } else if (contentType === 'blog' && hasProperConclusion) {
    ideas.push({
      type: 'conclusion',
      title: 'Improve conclusion with a discussion prompt',
      description: 'Blog conclusions get more engagement when they invite reader participation.',
      implementation: 'End with an open-ended question related to your topic to encourage comments and discussion.',
      confidence: 0.75
    });
  } else if (contentType === 'article' && hasProperConclusion) {
    ideas.push({
      type: 'conclusion',
      title: 'Enhance conclusion with next steps',
      description: 'Educational content performs better when the conclusion guides readers to practical application.',
      implementation: 'Add concrete next steps or an implementation checklist to your conclusion.',
      confidence: 0.8
    });
  }
  
  return ideas;
}

/**
 * Generates persuasive element enhancement ideas
 * 
 * @private
 * @param {string} content - Content to enhance
 * @param {Object} metrics - Analysis metrics
 * @param {Object} context - Additional context
 * @returns {Array} Persuasive element enhancement ideas
 */
function generatePersuasiveElementIdeas(content, metrics, context) {
  const ideas = [];
  const contentType = context.contentType || detectContentType(content);
  
  // Detect if content has social proof
  const hasSocialProof = content.match(/review|testimonial|client|customer said|rating/i) !== null;
  
  // Detect if content has benefit statements
  const hasBenefitStatements = content.match(/benefit|advantage|gain|improve|enhance|increase|reduce|save/i) !== null;
  
  // Detect if content addresses objections
  const addressesObjections = content.match(/however|but|concern|worry|question|objection|hesitate/i) !== null;
  
  // For product and service content, suggest adding social proof
  if (contentType === 'product' || contentType === 'service') {
    if (!hasSocialProof) {
      ideas.push({
        type: 'persuasive_elements',
        title: 'Add social proof',
        description: 'Your content lacks social proof, which builds trust and credibility with potential customers.',
        implementation: 'Add testimonials, reviews, ratings, case studies, or client logos to validate your claims.',
        confidence: 0.9
      });
    }
    
    if (!hasBenefitStatements) {
      ideas.push({
        type: 'persuasive_elements',
        title: 'Highlight specific benefits',
        description: 'Your content focuses more on features than benefits, which are more persuasive to customers.',
        implementation: 'Convert feature descriptions to benefit statements by explaining how each feature improves the customer\'s life or solves their problems.',
        confidence: 0.85
      });
    }
    
    if (!addressesObjections) {
      ideas.push({
        type: 'persuasive_elements',
        title: 'Address common objections',
        description: 'Your content doesn\'t address potential objections or concerns that might prevent conversions.',
        implementation: 'Add a FAQ section or specific content that proactively addresses common hesitations and objections.',
        confidence: 0.8
      });
    }
  }
  
  // For blog and article content, suggest persuasive elements for CTAs
  if (contentType === 'blog' || contentType === 'article') {
    if (!content.match(/call to action|cta|next step|click|subscribe|download|learn more/i)) {
      ideas.push({
        type: 'persuasive_elements',
        title: 'Add a compelling call-to-action',
        description: 'Your content lacks a clear call-to-action to guide readers on next steps.',
        implementation: 'Add a relevant CTA that aligns with your content goals (subscribe, download resource, read related content, etc.)',
        confidence: 0.85
      });
    }
  }
  
  return ideas;
}

/**
 * Generates engagement element enhancement ideas
 * 
 * @private
 * @param {string} content - Content to enhance
 * @param {Object} metrics - Analysis metrics
 * @param {Object} context - Additional context
 * @returns {Array} Engagement element enhancement ideas
 */
function generateEngagementElementIdeas(content, metrics, context) {
  const ideas = [];
  const contentType = context.contentType || detectContentType(content);
  const { structureMetrics } = metrics;
  
  // Check for interactive elements based on content type
  if (contentType === 'blog' || contentType === 'article') {
    // Check for questions to readers
    const hasQuestions = content.match(/\?.*you|do you|would you|have you|what do you think/i) !== null;
    
    if (!hasQuestions) {
      ideas.push({
        type: 'engagement_elements',
        title: 'Add direct questions to readers',
        description: 'Your content doesn\'t include questions that directly engage readers and invite reflection.',
        implementation: 'Add 2-3 thoughtful questions throughout your content to increase engagement and encourage comments.',
        confidence: 0.8
      });
    }
    
    // Check for examples and stories
    const hasExamples = content.match(/example|case|instance|for instance|such as|like|scenario/i) !== null;
    const hasStories = content.match(/story|experience|situation|when|once|recently/i) !== null;
    
    if (!hasExamples && !hasStories) {
      ideas.push({
        type: 'engagement_elements',
        title: 'Add concrete examples or stories',
        description: 'Your content lacks specific examples or stories that make abstract concepts more relatable and memorable.',
        implementation: 'Add at least one relevant example, case study, or brief story to illustrate your main points.',
        confidence: 0.85
      });
    }
  }
  
  // Check for visual engagement elements
  if (structureMetrics && structureMetrics.mediaCount < 1) {
    ideas.push({
      type: 'engagement_elements',
      title: 'Add visual elements',
      description: 'Your content has no images or videos, which are crucial for engagement and information retention.',
      implementation: 'Add relevant images, charts, infographics, or videos to break up text and illustrate key points.',
      confidence: 0.9
    });
  }
  
  // Check for subheadings density
  if (structureMetrics && structureMetrics.headingCount < 3 && content.length > 1000) {
    ideas.push({
      type: 'engagement_elements',
      title: 'Add more subheadings',
      description: 'Your content has too few subheadings for its length, making it appear dense and difficult to scan.',
      implementation: 'Break up your content with additional descriptive subheadings every 200-300 words.',
      confidence: 0.85
    });
  }
  
  return ideas;
}

/**
 * Generates clarity improvement ideas
 * 
 * @private
 * @param {string} content - Content to enhance
 * @param {Object} metrics - Analysis metrics
 * @param {Object} context - Additional context
 * @returns {Array} Clarity improvement ideas
 */
function generateClarityImprovementIdeas(content, metrics, context) {
  const ideas = [];
  const { readabilityMetrics } = metrics;
  
  // Check if content has complex technical terms without explanations
  const hasTechnicalTerms = detectTechnicalTerms(content);
  
  if (hasTechnicalTerms) {
    ideas.push({
      type: 'clarity_improvements',
      title: 'Define technical terms',
      description: 'Your content uses technical terms or jargon that may not be familiar to all readers.',
      implementation: 'Add brief definitions or explanations for technical terms when they first appear in the content.',
      confidence: 0.8
    });
  }
  
  // Check readability metrics for clarity issues
  if (readabilityMetrics) {
    if (readabilityMetrics.longSentencesPercentage > 20) {
      ideas.push({
        type: 'clarity_improvements',
        title: 'Simplify sentence structure',
        description: 'Your content contains too many long, complex sentences that can confuse readers.',
        implementation: 'Break long sentences into shorter ones with clearer structure. Aim for an average of 15-20 words per sentence.',
        confidence: 0.85
      });
    }
    
    if (readabilityMetrics.passiveVoicePercentage > 15) {
      ideas.push({
        type: 'clarity_improvements',
        title: 'Use more active voice',
        description: 'Your content uses too much passive voice, which can make it less clear and engaging.',
        implementation: 'Rewrite passive sentences in active voice by making the actor the subject of the sentence.',
        confidence: 0.8
      });
    }
  }
  
  // Check for transition words
  const hasTransitionWords = detectTransitionWords(content);
  
  if (!hasTransitionWords) {
    ideas.push({
      type: 'clarity_improvements',
      title: 'Add transition phrases',
      description: 'Your content lacks transition words and phrases that help readers follow your logic and flow.',
      implementation: 'Add appropriate transition words (furthermore, however, consequently, etc.) between paragraphs and sections.',
      confidence: 0.75
    });
  }
  
  return ideas;
}

/**
 * Generates topical coverage enhancement ideas
 * 
 * @private
 * @param {string} content - Content to enhance
 * @param {Object} metrics - Analysis metrics
 * @param {Object} context - Additional context
 * @returns {Array} Topical coverage enhancement ideas
 */
function generateTopicalCoverageIdeas(content, metrics, context) {
  const ideas = [];
  const contentType = context.contentType || detectContentType(content);
  
  // Detect missing subtopics based on content type
  if (contentType === 'product') {
    // Check for product-specific subtopics
    const hasFeatures = content.match(/feature|functionality|capability|specification|specs/i) !== null;
    const hasBenefits = content.match(/benefit|advantage|value|outcome|result/i) !== null;
    const hasSpecs = content.match(/specification|dimension|size|weight|material|technical detail/i) !== null;
    
    if (!hasFeatures) {
      ideas.push({
        type: 'topical_coverage',
        title: 'Add detailed feature descriptions',
        description: 'Your product content lacks comprehensive feature descriptions.',
        implementation: 'Add a dedicated section that clearly outlines all product features with specific details.',
        confidence: 0.9
      });
    }
    
    if (!hasBenefits) {
      ideas.push({
        type: 'topical_coverage',
        title: 'Add benefits section',
        description: 'Your product content doesn\'t clearly articulate the benefits customers will receive.',
        implementation: 'Add a section that explicitly connects features to customer benefits and outcomes.',
        confidence: 0.9
      });
    }
    
    if (!hasSpecs) {
      ideas.push({
        type: 'topical_coverage',
        title: 'Add technical specifications',
        description: 'Your product content lacks detailed technical specifications that customers need for decision-making.',
        implementation: 'Add a specifications section with all relevant technical details, dimensions, and compatibility information.',
        confidence: 0.85
      });
    }
  } else if (contentType === 'blog' || contentType === 'article') {
    // For informational content, check for comprehensive coverage
    // These are general patterns that may need refinement for specific topics
    const hasCausesOrReasons = content.match(/cause|reason|why|because|due to|result from/i) !== null;
    const hasSolutionsOrMethods = content.match(/solution|method|approach|strategy|technique|how to|steps to/i) !== null;
    const hasExamplesOrCases = content.match(/example|case study|instance|illustration|scenario/i) !== null;
    
    if (!hasCausesOrReasons) {
      ideas.push({
        type: 'topical_coverage',
        title: 'Explain causes or reasons',
        description: 'Your content doesn\'t adequately explain the causes, reasons, or background of the topic.',
        implementation: 'Add a section that explores why this topic matters or what causes the problem you\'re addressing.',
        confidence: 0.8
      });
    }
    
    if (!hasSolutionsOrMethods) {
      ideas.push({
        type: 'topical_coverage',
        title: 'Provide actionable solutions',
        description: 'Your content describes problems or concepts but doesn\'t offer solutions or methods to address them.',
        implementation: 'Add practical solutions, methods, or step-by-step instructions related to your topic.',
        confidence: 0.85
      });
    }
    
    if (!hasExamplesOrCases) {
      ideas.push({
        type: 'topical_coverage',
        title: 'Include concrete examples',
        description: 'Your content lacks specific examples or case studies that illustrate your points.',
        implementation: 'Add relevant examples, case studies, or scenarios that demonstrate your concepts in real-world contexts.',
        confidence: 0.8
      });
    }
  }
  
  return ideas;
}

/**
 * Generates trust signal enhancement ideas
 * 
 * @private
 * @param {string} content - Content to enhance
 * @param {Object} metrics - Analysis metrics
 * @param {Object} context - Additional context
 * @returns {Array} Trust signal enhancement ideas
 */
function generateTrustSignalIdeas(content, metrics, context) {
  const ideas = [];
  const contentType = context.contentType || detectContentType(content);
  
  // Product and service content should have trust signals
  if (contentType === 'product' || contentType === 'service') {
    // Check for testimonials
    const hasTestimonials = content.match(/testimonial|review|rating|stars|customer said|client feedback/i) !== null;
    
    // Check for guarantees
    const hasGuarantees = content.match(/guarantee|warranty|money-back|satisfaction|promise|assured/i) !== null;
    
    // Check for certifications
    const hasCertifications = content.match(/certified|accredited|approved|tested|verified|compliant with/i) !== null;
    
    if (!hasTestimonials) {
      ideas.push({
        type: 'trust_signals',
        title: 'Add customer testimonials',
        description: 'Your content lacks customer testimonials which build trust and credibility.',
        implementation: 'Add 2-3 specific testimonials with customer names and relevant details to build credibility.',
        confidence: 0.9
      });
    }
    
    if (!hasGuarantees) {
      ideas.push({
        type: 'trust_signals',
        title: 'Include guarantees or warranties',
        description: 'Your content doesn\'t mention guarantees or warranties that reduce customer risk.',
        implementation: 'Add information about guarantees, warranties, or return policies to build customer confidence.',
        confidence: 0.85
      });
    }
    
    if (!hasCertifications && (contentType === 'product')) {
      ideas.push({
        type: 'trust_signals',
        title: 'Highlight certifications or standards',
        description: 'Your product content doesn\'t mention relevant certifications, approvals, or industry standards.',
        implementation: 'Add information about applicable certifications, compliance with standards, or testing verification.',
        confidence: 0.8
      });
    }
  }
  
  // For articles and blogs, check for authoritative sources
  if (contentType === 'blog' || contentType === 'article') {
    // Check for citations
    const hasCitations = content.match(/according to|cite|source|reference|study|research|survey|report/i) !== null;
    
    // Check for expert mentions
    const hasExpertMentions = content.match(/expert|specialist|professional|authority|dr\.|professor|researcher/i) !== null;
    
    if (!hasCitations) {
      ideas.push({
        type: 'trust_signals',
        title: 'Add authoritative sources',
        description: 'Your content lacks citations or references to authoritative sources that build credibility.',
        implementation: 'Add references to studies, statistics, or expert opinions from reputable sources to support your claims.',
        confidence: 0.9
      });
    }
    
    if (!hasExpertMentions) {
      ideas.push({
        type: 'trust_signals',
        title: 'Include expert perspectives',
        description: 'Your content doesn\'t incorporate insights from experts or authorities in the field.',
        implementation: 'Add quotes or insights from industry experts to strengthen your content\'s authority.',
        confidence: 0.8
      });
    }
  }
  
  return ideas;
}

/**
 * Detects if content has a proper introduction
 * 
 * @private
 * @param {string} content - Content to analyze
 * @returns {boolean} True if content has a proper introduction
 */
function detectProperIntroduction(content) {
  // Simple detection method - look for clear introduction patterns
  // in the first 20% of content
  const firstFifth = content.split(/\s+/).slice(0, Math.ceil(content.split(/\s+/).length * 0.2)).join(' ');
  
  // Look for introduction patterns
  return firstFifth.match(/introduction|overview|background|context|begin by|start with|let's discuss|in this article|this guide/i) !== null;
}

/**
 * Detects if content has a proper conclusion
 * 
 * @private
 * @param {string} content - Content to analyze
 * @returns {boolean} True if content has a proper conclusion
 */
function detectProperConclusion(content) {
  // Simple detection method - look for clear conclusion patterns
  // in the last 20% of content
  const words = content.split(/\s+/);
  const lastFifth = words.slice(Math.floor(words.length * 0.8)).join(' ');
  
  // Look for conclusion patterns
  return lastFifth.match(/conclusion|in summary|to summarize|finally|in closing|wrapping up|to conclude|in conclusion|overall|to sum up/i) !== null;
}

/**
 * Extracts first paragraph from content
 * 
 * @private
 * @param {string} content - Content to analyze
 * @returns {string} First paragraph
 */
function extractFirstParagraph(content) {
  const paragraphs = content.split(/\n\s*\n|\r\n\s*\r\n/);
  return paragraphs.filter(p => p.trim().length > 0)[0] || '';
}

/**
 * Detects content type from content patterns
 * 
 * @private
 * @param {string} content - Content to analyze
 * @returns {string} Content type
 */
function detectContentType(content) {
  const productPatterns = /buy|purchase|order|price|cost|payment|shipping|add to cart|shop now|features|specifications|specs|product|item/i;
  const blogPatterns = /blog post|article|author|published|date|opinion|thought|topic|newsletter|read more|comment/i;
  const servicePatterns = /service|consultation|appointment|booking|schedule|hire|expert|professional|package|plan|offering/i;
  const educationalPatterns = /learn|guide|tutorial|how to|step by step|lesson|course|training|educational|instruction/i;
  
  if (productPatterns.test(content)) {
    return 'product';
  } else if (servicePatterns.test(content)) {
    return 'service';
  } else if (educationalPatterns.test(content)) {
    return 'educational';
  } else if (blogPatterns.test(content)) {
    return 'blog';
  } else {
    return 'article'; // Default
  }
}

/**
 * Detects technical terms in content
 * 
 * @private
 * @param {string} content - Content to analyze
 * @returns {boolean} True if content has technical terms
 */
function detectTechnicalTerms(content) {
  // This is a simplified approach - in a real implementation,
  // this would use NLP to detect domain-specific terminology
  const technicalPattern = /(?:\b[A-Z][a-z]*){2,}|\b[a-z]+(?:ology|ization|ification|itive|metric|istic)\b|(?<=\b)[a-z]{3,}-[a-z]{3,}(?=\b)/g;
  
  const matches = content.match(technicalPattern) || [];
  return matches.length > 2; // Consider it having technical terms if there are multiple matches
}

/**
 * Detects transition words in content
 * 
 * @private
 * @param {string} content - Content to analyze
 * @returns {boolean} True if content has adequate transition words
 */
function detectTransitionWords(content) {
  const transitionWords = [
    'also', 'furthermore', 'moreover', 'additionally', 'besides', 'in addition',
    'however', 'nevertheless', 'nonetheless', 'still', 'yet', 'but', 'though',
    'therefore', 'thus', 'consequently', 'as a result', 'hence', 'accordingly',
    'for example', 'for instance', 'specifically', 'to illustrate', 'namely',
    'first', 'second', 'third', 'next', 'then', 'finally', 'lastly',
    'similarly', 'likewise', 'in the same way', 'in contrast', 'on the contrary',
    'meanwhile', 'subsequently', 'previously', 'afterward', 'in conclusion'
  ];
  
  // Create regex pattern from transition words
  const pattern = new RegExp(`\\b(${transitionWords.join('|')})\\b`, 'i');
  
  // Count matches
  const matches = (content.match(new RegExp(pattern, 'gi')) || []).length;
  
  // Calculate rough word count
  const wordCount = content.split(/\s+/).length;
  
  // Determine if there are enough transition words
  // Rule of thumb: at least 1 transition word per 100 words
  return matches >= (wordCount / 100);
}

module.exports = {
  generateEnhancementIdeas
};
