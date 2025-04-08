/**
 * SEO.engineering CMS Detector
 * 
 * This module provides functionality to detect the CMS platform
 * of a website for platform-specific optimizations and testing.
 */

class CMSDetector {
  constructor() {
    // Define CMS signatures to detect various platforms
    this.signatures = {
      wordpress: {
        metaTags: ['wp-content', 'wp-includes', 'wp-json'],
        scripts: ['wp-embed', 'wp-emoji', 'wp-block-library'],
        headers: { 'x-powered-by': /wordpress/i },
        generator: /wordpress/i,
        directories: ['/wp-admin/', '/wp-content/', '/wp-includes/']
      },
      
      shopify: {
        metaTags: ['shopify'],
        scripts: ['shopify', 'shop_currency'],
        headers: { 'x-shopify': /.+/, 'x-shopid': /.+/ },
        generator: /shopify/i,
        directories: ['/cdn.shopify.com/']
      },
      
      wix: {
        metaTags: ['wix.com'],
        scripts: ['static.wixstatic.com', 'wix-bolt'],
        headers: {},
        generator: /wix/i,
        directories: ['/wix.com/', '/wixsite.com/', '/wixstatic.com/']
      },
      
      squarespace: {
        metaTags: ['squarespace'],
        scripts: ['static1.squarespace.com', 'squarespace-block-builders'],
        headers: { 'x-servedby': /squarespace/i },
        generator: /squarespace/i,
        directories: ['/static1.squarespace.com/']
      },
      
      drupal: {
        metaTags: ['drupal'],
        scripts: ['drupal.js', 'drupal.ajax'],
        headers: { 'x-generator': /drupal/i, 'x-drupal': /.+/ },
        generator: /drupal/i,
        directories: ['/sites/default/', '/core/']
      },
      
      joomla: {
        metaTags: ['joomla'],
        scripts: ['media/jui/js/', 'media/system/js/'],
        headers: {},
        generator: /joomla/i,
        directories: ['/administrator/', '/components/', '/modules/']
      },
      
      magento: {
        metaTags: ['magento'],
        scripts: ['mage/', 'Magento_'],
        headers: { 'x-magento': /.+/ },
        generator: /magento/i,
        directories: ['/skin/frontend/', '/app/design/']
      },
      
      webflow: {
        metaTags: ['webflow'],
        scripts: ['webflow.js'],
        headers: {},
        generator: /webflow/i,
        directories: ['/webflow.com/']
      },
      
      ghost: {
        metaTags: ['ghost'],
        scripts: ['ghost-blog', 'ghost-theme'],
        headers: {},
        generator: /ghost/i,
        directories: ['/ghost/', '/content/themes/']
      },
      
      bigcommerce: {
        metaTags: ['bigcommerce'],
        scripts: ['bigcommerce.com'],
        headers: { 'x-bc-version': /.+/ },
        generator: /bigcommerce/i,
        directories: ['/assets.bigcommerce.com/']
      },
      
      // Adding newer CMS platforms
      medium: {
        metaTags: ['medium'],
        scripts: ['medium.com', 'glyph.medium.com'],
        headers: {},
        generator: /medium/i,
        directories: ['/medium.com/', '/cdn-client.medium.com/']
      },
      
      weebly: {
        metaTags: ['weebly'],
        scripts: ['static.weebly.com'],
        headers: {},
        generator: /weebly/i,
        directories: ['/weebly.com/', '/editmysite.com/']
      },
      
      contentful: {
        metaTags: ['contentful'],
        scripts: ['contentful.com'],
        headers: {},
        generator: /contentful/i,
        directories: ['/contentful.com/']
      },
      
      sanity: {
        metaTags: ['sanity.io'],
        scripts: ['sanity.io', 'sanity-studio'],
        headers: {},
        generator: /sanity/i,
        directories: ['/sanity.io/']
      },
      
      aem: {
        metaTags: ['adobe experience manager', 'aem'],
        scripts: ['/etc.clientlibs/', 'granite/'],
        headers: {},
        generator: /adobe experience manager|aem/i,
        directories: ['/etc.clientlibs/', '/etc/designs/']
      },
      
      sitecore: {
        metaTags: ['sitecore'],
        scripts: ['sitecore', '/sitecore/shell/'],
        headers: {},
        generator: /sitecore/i,
        directories: ['/sitecore/', '/-/media/']
      },
      
      // Modern JS frameworks (these aren't CMS platforms, but useful to detect)
      react: {
        metaTags: [],
        scripts: ['react.', 'react-dom.'],
        headers: {},
        generator: /react/i,
        directories: []
      },
      
      nextjs: {
        metaTags: [],
        scripts: ['_next/static', '__NEXT_DATA__'],
        headers: {},
        generator: /next\.js/i,
        directories: ['/_next/']
      },
      
      gatsby: {
        metaTags: [],
        scripts: ['/page-data/', '/static/d/'],
        headers: {},
        generator: /gatsby/i,
        directories: ['/page-data/']
      },
      
      // Custom/unknown CMS
      custom: {
        metaTags: [],
        scripts: [],
        headers: {},
        generator: /.*/i,
        directories: []
      }
    };
  }

  /**
   * Detect the CMS platform from a page's content and headers
   * @param {string} url The URL being analyzed
   * @param {string} content HTML content of the page
   * @param {Object} headers HTTP headers from the response
   * @returns {Object} Detection results with CMS and confidence score
   */
  detectCMS(url, content, headers) {
    // Initialize scores for each CMS
    const scores = {};
    Object.keys(this.signatures).forEach(cms => {
      scores[cms] = 0;
    });
    
    // Check HTML content for signatures
    this.detectFromContent(content, scores);
    
    // Check URL for signatures
    this.detectFromUrl(url, scores);
    
    // Check headers for signatures
    this.detectFromHeaders(headers, scores);
    
    // Find the CMS with the highest score
    let detectedCms = null;
    let highestScore = 0;
    
    Object.entries(scores).forEach(([cms, score]) => {
      if (score > highestScore) {
        detectedCms = cms;
        highestScore = score;
      }
    });
    
    // If no CMS detected with a significant score, mark as custom/unknown
    if (highestScore < 2) {
      detectedCms = 'custom';
    }
    
    // Calculate confidence based on the score
    const confidence = this.calculateConfidence(highestScore);
    
    // Get CMS-specific details
    const cmsDetails = detectedCms ? this.getCMSDetails(detectedCms) : null;
    
    return {
      cms: detectedCms,
      confidence,
      scores,
      details: cmsDetails
    };
  }

  /**
   * Detect CMS signatures from page content
   * @param {string} content HTML content of the page
   * @param {Object} scores Current scores to update
   */
  detectFromContent(content, scores) {
    if (!content) return;
    
    // Try to find generator meta tag
    const generatorMatch = content.match(/<meta[^>]*name=["']generator["'][^>]*content=["']([^"']*)["']/i);
    if (generatorMatch && generatorMatch[1]) {
      const generator = generatorMatch[1].toLowerCase();
      
      // Check each CMS for generator match
      Object.entries(this.signatures).forEach(([cms, signature]) => {
        if (signature.generator && signature.generator.test(generator)) {
          scores[cms] += 5; // High score for generator match
        }
      });
    }
    
    // Check for CMS-specific script patterns
    Object.entries(this.signatures).forEach(([cms, signature]) => {
      signature.scripts.forEach(script => {
        const regex = new RegExp(script, 'i');
        if (regex.test(content)) {
          scores[cms] += 3;
        }
      });
      
      // Check for meta tag patterns
      signature.metaTags.forEach(metaTag => {
        const regex = new RegExp(metaTag, 'i');
        if (regex.test(content)) {
          scores[cms] += 2;
        }
      });
    });
    
    // Special case for React-based sites - check for React identifiers
    if (content.includes('__REACT_ROOT__') || 
        content.includes('react-root') || 
        content.includes('reactjs') || 
        content.includes('_reactRootContainer')) {
      scores['react'] += 3;
    }
    
    // Special case for NextJS - check for NextJS identifiers
    if (content.includes('__NEXT_DATA__') || 
        content.includes('_nextjs') || 
        content.includes('_next/static')) {
      scores['nextjs'] += 4;
    }
    
    // Special case for Gatsby - check for Gatsby identifiers
    if (content.includes('___gatsby') || 
        content.includes('gatsby-image') || 
        content.includes('/page-data/')) {
      scores['gatsby'] += 4;
    }
  }

  /**
   * Detect CMS signatures from URL
   * @param {string} url The URL being analyzed
   * @param {Object} scores Current scores to update
   */
  detectFromUrl(url, scores) {
    if (!url) return;
    
    // Check for CMS-specific directories in URL
    Object.entries(this.signatures).forEach(([cms, signature]) => {
      signature.directories.forEach(directory => {
        if (url.includes(directory)) {
          scores[cms] += 4;
        }
      });
    });
  }

  /**
   * Detect CMS signatures from HTTP headers
   * @param {Object} headers HTTP headers from the response
   * @param {Object} scores Current scores to update
   */
  detectFromHeaders(headers, scores) {
    if (!headers) return;
    
    // Convert headers to lowercase for comparison
    const normalizedHeaders = {};
    Object.entries(headers).forEach(([key, value]) => {
      normalizedHeaders[key.toLowerCase()] = value;
    });
    
    // Check for CMS-specific headers
    Object.entries(this.signatures).forEach(([cms, signature]) => {
      Object.entries(signature.headers).forEach(([header, pattern]) => {
        const headerValue = normalizedHeaders[header.toLowerCase()];
        if (headerValue && pattern.test(headerValue)) {
          scores[cms] += 5; // High score for header match
        }
      });
    });
    
    // Check for specific technology headers
    if (normalizedHeaders['x-powered-by']) {
      const poweredBy = normalizedHeaders['x-powered-by'].toLowerCase();
      
      if (poweredBy.includes('php')) {
        // Higher likelihood of WordPress, Drupal, Joomla
        scores['wordpress'] += 1;
        scores['drupal'] += 1;
        scores['joomla'] += 1;
      } else if (poweredBy.includes('asp.net')) {
        // Higher likelihood of Sitecore
        scores['sitecore'] += 2;
      } else if (poweredBy.includes('express')) {
        // Higher likelihood of modern JS frameworks
        scores['nextjs'] += 1;
        scores['gatsby'] += 1;
      }
    }
  }

  /**
   * Calculate confidence level based on score
   * @param {number} score The detection score
   * @returns {string} Confidence level
   */
  calculateConfidence(score) {
    if (score === 0) return 'None';
    if (score < 5) return 'Low';
    if (score < 10) return 'Medium';
    return 'High';
  }

  /**
   * Get detailed information about a CMS
   * @param {string} cms The detected CMS
   * @returns {Object} CMS details and specifics
   */
  getCMSDetails(cms) {
    const cmsInfo = {
      wordpress: {
        name: 'WordPress',
        website: 'https://wordpress.org',
        optimizationTips: [
          'Check for plugin conflicts',
          'Optimize images',
          'Use caching plugins',
          'Minify CSS and JavaScript',
          'Implement proper heading structure'
        ],
        testAreas: [
          'SEO plugins like Yoast or Rank Math',
          'Theme optimization',
          'Mobile responsiveness',
          'Core Web Vitals'
        ]
      },
      shopify: {
        name: 'Shopify',
        website: 'https://shopify.com',
        optimizationTips: [
          'Optimize product images',
          'Improve theme performance',
          'Use proper structured data',
          'Optimize collection pages',
          'Implement proper heading structure'
        ],
        testAreas: [
          'Product schema markup',
          'Mobile checkout experience',
          'Core Web Vitals',
          'App impact on performance'
        ]
      },
      wix: {
        name: 'Wix',
        website: 'https://wix.com',
        optimizationTips: [
          'Optimize images',
          'Minimize animations',
          'Reduce plugins',
          'Use proper heading structure',
          'Implement canonical URLs'
        ],
        testAreas: [
          'Mobile responsiveness',
          'Core Web Vitals',
          'URL structure',
          'Image optimization'
        ]
      },
      squarespace: {
        name: 'Squarespace',
        website: 'https://squarespace.com',
        optimizationTips: [
          'Optimize images',
          'Reduce unnecessary blocks',
          'Minimize custom code',
          'Implement proper heading structure',
          'Use descriptive alt text'
        ],
        testAreas: [
          'Core Web Vitals',
          'Mobile responsiveness',
          'Image optimization',
          'Structured data implementation'
        ]
      },
      drupal: {
        name: 'Drupal',
        website: 'https://drupal.org',
        optimizationTips: [
          'Enable caching',
          'Use CDN for assets',
          'Optimize database queries',
          'Aggregate CSS and JavaScript',
          'Implement proper heading structure'
        ],
        testAreas: [
          'Cache configuration',
          'Module performance impact',
          'Core Web Vitals',
          'Database optimization'
        ]
      },
      joomla: {
        name: 'Joomla',
        website: 'https://joomla.org',
        optimizationTips: [
          'Enable caching',
          'Use CDN for assets',
          'Compress output',
          'Optimize images',
          'Implement proper heading structure'
        ],
        testAreas: [
          'Extension performance impact',
          'Cache configuration',
          'Core Web Vitals',
          'Mobile responsiveness'
        ]
      },
      magento: {
        name: 'Magento',
        website: 'https://magento.com',
        optimizationTips: [
          'Enable flat catalogs',
          'Optimize database',
          'Use Redis for caching',
          'Optimize images',
          'Implement proper heading structure'
        ],
        testAreas: [
          'Catalog page performance',
          'Checkout performance',
          'Extension impact',
          'Core Web Vitals'
        ]
      },
      webflow: {
        name: 'Webflow',
        website: 'https://webflow.com',
        optimizationTips: [
          'Optimize images',
          'Reduce animations',
          'Minimize custom code',
          'Implement proper heading structure',
          'Optimize for mobile'
        ],
        testAreas: [
          'Custom code impact',
          'Animation performance',
          'Core Web Vitals',
          'Mobile responsiveness'
        ]
      },
      ghost: {
        name: 'Ghost',
        website: 'https://ghost.org',
        optimizationTips: [
          'Optimize theme',
          'Reduce custom scripts',
          'Optimize images',
          'Implement proper heading structure',
          'Use proper canonical URLs'
        ],
        testAreas: [
          'Theme performance',
          'Image optimization',
          'Core Web Vitals',
          'Mobile responsiveness'
        ]
      },
      bigcommerce: {
        name: 'BigCommerce',
        website: 'https://bigcommerce.com',
        optimizationTips: [
          'Optimize product images',
          'Reduce script loading',
          'Optimize theme performance',
          'Implement proper heading structure',
          'Use proper structured data'
        ],
        testAreas: [
          'Product page performance',
          'Checkout performance',
          'App impact',
          'Core Web Vitals'
        ]
      },
      medium: {
        name: 'Medium',
        website: 'https://medium.com',
        optimizationTips: [
          'Focus on content quality',
          'Use appropriate tags',
          'Create descriptive headlines',
          'Add high-quality images',
          'Engage with readers through responses'
        ],
        testAreas: [
          'Content quality',
          'Engagement metrics',
          'Image optimization',
          'Mobile experience'
        ]
      },
      weebly: {
        name: 'Weebly',
        website: 'https://www.weebly.com',
        optimizationTips: [
          'Optimize images',
          'Reduce elements per page',
          'Use clean theme designs',
          'Implement proper heading structure',
          'Create descriptive link text'
        ],
        testAreas: [
          'Theme performance',
          'Mobile responsiveness',
          'Core Web Vitals',
          'Image optimization'
        ]
      },
      contentful: {
        name: 'Contentful',
        website: 'https://www.contentful.com',
        optimizationTips: [
          'Optimize content models',
          'Structure content with SEO in mind',
          'Implement schema markup',
          'Use CDN for assets',
          'Create mobile-optimized content'
        ],
        testAreas: [
          'Content delivery performance',
          'Asset optimization',
          'Frontend implementation',
          'API usage efficiency'
        ]
      },
      sanity: {
        name: 'Sanity',
        website: 'https://www.sanity.io',
        optimizationTips: [
          'Structure content with GROQ efficiency in mind',
          'Optimize image handling',
          'Use proper content references',
          'Implement schema markup',
          'Create SEO-friendly URL structures'
        ],
        testAreas: [
          'Query performance',
          'Asset delivery',
          'Frontend implementation',
          'Content structure'
        ]
      },
      aem: {
        name: 'Adobe Experience Manager',
        website: 'https://business.adobe.com/products/experience-manager/sites/aem-sites.html',
        optimizationTips: [
          'Configure dispatcher caching',
          'Optimize component rendering',
          'Minimize clientlibs',
          'Optimize DAM asset delivery',
          'Use proper URL structures'
        ],
        testAreas: [
          'Dispatcher configuration',
          'Component performance',
          'Template efficiency',
          'Core Web Vitals'
        ]
      },
      sitecore: {
        name: 'Sitecore',
        website: 'https://www.sitecore.com',
        optimizationTips: [
          'Optimize HTML cache settings',
          'Configure content delivery network',
          'Minimize rendering components',
          'Optimize media delivery',
          'Implement proper URL structures'
        ],
        testAreas: [
          'Rendering performance',
          'Cache configuration',
          'Content delivery',
          'Core Web Vitals'
        ]
      },
      react: {
        name: 'React',
        website: 'https://reactjs.org',
        optimizationTips: [
          'Implement code splitting',
          'Use React.memo for component optimization',
          'Optimize image loading strategies',
          'Implement proper heading structure',
          'Create SEO-friendly routing'
        ],
        testAreas: [
          'Bundle size',
          'Rendering performance',
          'Hydration speed',
          'Core Web Vitals'
        ]
      },
      nextjs: {
        name: 'Next.js',
        website: 'https://nextjs.org',
        optimizationTips: [
          'Use static generation where possible',
          'Implement image optimization with next/image',
          'Configure content caching strategies',
          'Use incremental static regeneration',
          'Optimize font loading'
        ],
        testAreas: [
          'Static vs. server-rendered pages',
          'Image optimization',
          'API route performance',
          'Core Web Vitals'
        ]
      },
      gatsby: {
        name: 'Gatsby',
        website: 'https://www.gatsbyjs.com',
        optimizationTips: [
          'Optimize GraphQL queries',
          'Use gatsby-image for responsive images',
          'Implement proper pagination',
          'Configure asset prefetching',
          'Add structured data'
        ],
        testAreas: [
          'Build performance',
          'Image optimization',
          'Page generation',
          'Core Web Vitals'
        ]
      },
      custom: {
        name: 'Custom CMS/Framework',
        website: null,
        optimizationTips: [
          'Implement standard SEO best practices',
          'Optimize for Core Web Vitals',
          'Add proper meta tags',
          'Use structured data',
          'Create mobile-friendly layouts'
        ],
        testAreas: [
          'HTML structure',
          'JavaScript performance',
          'Server response times',
          'Core Web Vitals'
        ]
      }
    };
    
    return cmsInfo[cms] || {
      name: cms.charAt(0).toUpperCase() + cms.slice(1),
      website: null,
      optimizationTips: ['Optimize for general SEO best practices'],
      testAreas: ['Standard SEO checks']
    };
  }
}

module.exports = CMSDetector;
