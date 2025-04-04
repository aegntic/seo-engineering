/**
 * CMS Compatibility Testing Configuration
 * 
 * This file defines the configuration for testing SEOAutomate
 * across different CMS platforms.
 */

module.exports = {
  // Target CMS platforms for testing
  platforms: [
    {
      name: 'WordPress',
      testUrls: [
        'https://test-wp-site.seoautomate.dev',
        'https://demo.wp-themes.dev/twentytwentyfour'
      ],
      identifiers: [
        { selector: 'meta[name="generator"][content*="WordPress"]', attribute: 'content' },
        { selector: 'link[rel="https://api.w.org/"]', attribute: 'href' }
      ],
      specialCases: [
        'page-builders', // Test compatibility with Elementor, Divi, etc.
        'caching-plugins', // Test with popular caching plugins
        'security-plugins' // Test with security plugins that might block crawlers
      ]
    },
    {
      name: 'Shopify',
      testUrls: [
        'https://test-shopify-site.seoautomate.dev',
        'https://dawn-theme.myshopify.com'
      ],
      identifiers: [
        { selector: 'meta[name="generator"][content*="Shopify"]', attribute: 'content' },
        { pattern: /Shopify\.theme/, type: 'script-content' }
      ],
      specialCases: [
        'ajax-cart', // Test with AJAX cart functionality
        'product-variants', // Test with product variants
        'customer-accounts' // Test with customer account pages
      ]
    },
    {
      name: 'Wix',
      testUrls: [
        'https://test-wix-site.seoautomate.dev',
        'https://www.wix.com/website-template/view/html/2622'
      ],
      identifiers: [
        { selector: 'meta[name="generator"][content*="Wix"]', attribute: 'content' },
        { pattern: /wix\.com/, type: 'script-src' }
      ],
      specialCases: [
        'dynamic-pages', // Test with dynamic pages
        'seo-settings', // Test with different SEO settings
        'site-protection' // Test with protected pages
      ]
    },
    {
      name: 'Squarespace',
      testUrls: [
        'https://test-squarespace-site.seoautomate.dev',
        'https://bedford-demo.squarespace.com'
      ],
      identifiers: [
        { selector: 'meta[name="generator"][content*="Squarespace"]', attribute: 'content' },
        { pattern: /squarespace\.com/, type: 'script-src' }
      ],
      specialCases: [
        'index-pages', // Test with index pages
        'collection-pages', // Test with collection pages
        'password-protection' // Test with password protected pages
      ]
    },
    {
      name: 'Joomla',
      testUrls: [
        'https://test-joomla-site.seoautomate.dev',
        'https://demo.joomla.org'
      ],
      identifiers: [
        { selector: 'meta[name="generator"][content*="Joomla"]', attribute: 'content' },
        { pattern: /\/media\/jui\//, type: 'script-src' }
      ],
      specialCases: [
        'component-pages', // Test with different component pages
        'menu-items', // Test with different menu items
        'modules' // Test with different modules
      ]
    }
  ],
  
  // Test features to verify across all platforms
  testFeatures: [
    {
      name: 'crawling',
      description: 'Basic crawling functionality',
      tests: [
        'page-discovery',
        'link-following',
        'robot-txt-compliance',
        'sitemap-parsing'
      ]
    },
    {
      name: 'analysis',
      description: 'SEO analysis features',
      tests: [
        'meta-tags-extraction',
        'heading-structure',
        'content-analysis',
        'image-optimization',
        'schema-detection'
      ]
    },
    {
      name: 'fixes',
      description: 'Automated fix implementation',
      tests: [
        'meta-tag-updates',
        'heading-restructuring',
        'image-optimization',
        'schema-markup-enhancement',
        'robots-txt-optimization'
      ]
    },
    {
      name: 'verification',
      description: 'Changes verification',
      tests: [
        'pre-post-comparison',
        'performance-impact-measurement',
        'regression-detection'
      ]
    }
  ],
  
  // Test environments
  environments: [
    {
      name: 'default',
      browserType: 'chromium',
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (compatible; SEOAutomate/1.0; +https://seoautomate.dev/bot)'
    },
    {
      name: 'mobile',
      browserType: 'chromium',
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    }
  ],
  
  // Reporting configuration
  reporting: {
    outputDir: './reports/cms-compatibility',
    formats: ['html', 'json', 'csv'],
    includeScreenshots: true,
    notifyOnFailure: true,
    summaryReport: true
  }
};
