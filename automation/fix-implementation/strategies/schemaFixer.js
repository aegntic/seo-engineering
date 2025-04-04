/**
 * Schema Markup Fixer Strategy
 * 
 * Implements and fixes structured data (schema.org) markup:
 * - Adds missing schema markup
 * - Validates existing schema markup
 * - Enhances schema markup with additional properties
 * - Supports multiple schema types (Organization, LocalBusiness, Product, etc.)
 */

const cheerio = require('cheerio');
const siteAdapter = require('../siteAdapter');
const logger = require('../../utils/logger');

// Schema templates for different page types
const SCHEMA_TEMPLATES = {
  'organization': {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': '',
    'url': '',
    'logo': '',
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '',
      'contactType': 'customer service'
    }
  },
  'local-business': {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': '',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '',
      'addressLocality': '',
      'addressRegion': '',
      'postalCode': '',
      'addressCountry': ''
    },
    'telephone': '',
    'openingHours': []
  },
  'product': {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': '',
    'description': '',
    'image': '',
    'offers': {
      '@type': 'Offer',
      'priceCurrency': '',
      'price': '',
      'availability': 'https://schema.org/InStock'
    }
  },
  'article': {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': '',
    'description': '',
    'image': '',
    'datePublished': '',
    'dateModified': '',
    'author': {
      '@type': 'Person',
      'name': ''
    },
    'publisher': {
      '@type': 'Organization',
      'name': '',
      'logo': {
        '@type': 'ImageObject',
        'url': ''
      }
    }
  },
  'breadcrumb': {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': []
  }
};

/**
 * Fixes schema markup issues in HTML files
 * @param {string} repoPath - Path to the repository
 * @param {string} filePath - Path to the file being fixed
 * @param {Object} issue - Issue details
 * @param {Object} siteStructure - Site structure information
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} - Fix result
 */
async function fix(repoPath, filePath, issue, siteStructure, options = {}) {
  try {
    // Ensure this is an HTML file
    if (!isHtmlFile(filePath)) {
      return {
        success: false,
        error: 'Not an HTML file'
      };
    }
    
    // Read the file content
    const content = await siteAdapter.readFile(repoPath, filePath);
    
    // Parse HTML
    const $ = cheerio.load(content, { decodeEntities: false });
    
    // Keep track of changes
    const changes = [];
    
    // Apply appropriate fix based on issue subtype
    switch (issue.subType) {
      case 'missing-schema':
        changes.push(...addMissingSchema($, issue.details));
        break;
      case 'invalid-schema':
        changes.push(...fixInvalidSchema($, issue.details));
        break;
      case 'incomplete-schema':
        changes.push(...enhanceIncompleteSchema($, issue.details));
        break;
      default:
        return {
          success: false,
          error: `Unknown schema markup issue subtype: ${issue.subType}`
        };
    }
    
    // If no changes were made, return failure
    if (changes.length === 0) {
      return {
        success: false,
        error: 'No changes were needed or could be made'
      };
    }
    
    // Write the updated file
    const updatedContent = $.html();
    await siteAdapter.writeFile(repoPath, filePath, updatedContent);
    
    return {
      success: true,
      changes
    };
  } catch (error) {
    logger.error(`Schema markup fix failed: ${error.message}`);
    return {
      success: false,
      error: `Failed to fix schema markup: ${error.message}`
    };
  }
}

/**
 * Adds missing schema markup to a page
 * @param {Object} $ - Cheerio instance
 * @param {Object} details - Issue details
 * @returns {Array} - List of changes made
 */
function addMissingSchema($, details) {
  const changes = [];
  
  // Get the page type to determine appropriate schema
  const pageType = details.pageType || detectPageType($);
  
  // Skip if unable to determine page type
  if (!pageType) {
    return changes;
  }
  
  // Get appropriate schema template
  const schemaTemplate = getSchemaTemplate(pageType, details);
  
  // Skip if no template is available
  if (!schemaTemplate) {
    return changes;
  }
  
  // Check if there's already schema markup
  const existingSchema = $('script[type="application/ld+json"]');
  if (existingSchema.length > 0) {
    // If there's schema of a different type, we might add additional schema
    let hasSchemaOfRequestedType = false;
    
    existingSchema.each((i, el) => {
      try {
        const schemaData = JSON.parse($(el).html());
        if (schemaData['@type'] === schemaTemplate['@type']) {
          hasSchemaOfRequestedType = true;
        }
      } catch (e) {
        // Invalid JSON, ignore
      }
    });
    
    if (hasSchemaOfRequestedType) {
      // Skip adding new schema if one of the same type already exists
      return changes;
    }
  }
  
  // Generate schema markup
  const schema = populateSchemaTemplate(schemaTemplate, $, details);
  
  // Add schema to the head
  $('head').append(`<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`);
  
  changes.push({
    type: 'add',
    element: 'script[type="application/ld+json"]',
    schemaType: schema['@type'],
    properties: Object.keys(schema).filter(key => key !== '@context' && key !== '@type')
  });
  
  return changes;
}

/**
 * Fixes invalid schema markup
 * @param {Object} $ - Cheerio instance
 * @param {Object} details - Issue details
 * @returns {Array} - List of changes made
 */
function fixInvalidSchema($, details) {
  const changes = [];
  
  // Get all schema markup
  const schemaScripts = $('script[type="application/ld+json"]');
  
  // Process each schema
  schemaScripts.each((i, el) => {
    const $script = $(el);
    let isModified = false;
    
    try {
      // Parse existing schema
      const schema = JSON.parse($script.html());
      
      // Check if this is the schema with issues
      if (details.schemaType && schema['@type'] !== details.schemaType) {
        return; // Skip this schema
      }
      
      // Fix missing required properties
      if (details.missingRequired && details.missingRequired.length > 0) {
        details.missingRequired.forEach(prop => {
          if (details.suggestedValues && details.suggestedValues[prop] && !schema[prop]) {
            schema[prop] = details.suggestedValues[prop];
            isModified = true;
          }
        });
      }
      
      // Fix incorrect property values
      if (details.incorrectProperties && Object.keys(details.incorrectProperties).length > 0) {
        Object.entries(details.incorrectProperties).forEach(([prop, correctValue]) => {
          if (schema[prop] !== undefined) {
            schema[prop] = correctValue;
            isModified = true;
          }
        });
      }
      
      // Update the schema if modified
      if (isModified) {
        $script.html(JSON.stringify(schema, null, 2));
        
        changes.push({
          type: 'update',
          element: 'script[type="application/ld+json"]',
          schemaType: schema['@type'],
          modifiedProperties: [
            ...details.missingRequired || [],
            ...Object.keys(details.incorrectProperties || {})
          ]
        });
      }
    } catch (error) {
      // If JSON is invalid, replace with a new valid schema
      if (details.schemaType && details.suggestedReplacement) {
        $script.html(JSON.stringify(details.suggestedReplacement, null, 2));
        
        changes.push({
          type: 'replace',
          element: 'script[type="application/ld+json"]',
          reason: 'Invalid JSON',
          schemaType: details.schemaType
        });
      }
    }
  });
  
  return changes;
}

/**
 * Enhances incomplete schema markup with additional properties
 * @param {Object} $ - Cheerio instance
 * @param {Object} details - Issue details
 * @returns {Array} - List of changes made
 */
function enhanceIncompleteSchema($, details) {
  const changes = [];
  
  // Get all schema markup
  const schemaScripts = $('script[type="application/ld+json"]');
  
  // Process each schema
  schemaScripts.each((i, el) => {
    const $script = $(el);
    let isModified = false;
    
    try {
      // Parse existing schema
      const schema = JSON.parse($script.html());
      
      // Check if this is the schema to enhance
      if (details.schemaType && schema['@type'] !== details.schemaType) {
        return; // Skip this schema
      }
      
      // Add recommended properties
      if (details.recommendedProperties && details.recommendedProperties.length > 0) {
        details.recommendedProperties.forEach(prop => {
          if (details.suggestedValues && details.suggestedValues[prop] && !schema[prop]) {
            schema[prop] = details.suggestedValues[prop];
            isModified = true;
          }
        });
      }
      
      // Add nested properties
      if (details.nestedProperties && Object.keys(details.nestedProperties).length > 0) {
        Object.entries(details.nestedProperties).forEach(([parent, children]) => {
          // Create parent property if it doesn't exist
          if (!schema[parent]) {
            schema[parent] = {};
            isModified = true;
          }
          
          // Add/update child properties
          if (typeof children === 'object') {
            Object.entries(children).forEach(([childProp, childValue]) => {
              if (typeof schema[parent] === 'object') {
                schema[parent][childProp] = childValue;
                isModified = true;
              }
            });
          }
        });
      }
      
      // Update the schema if modified
      if (isModified) {
        $script.html(JSON.stringify(schema, null, 2));
        
        changes.push({
          type: 'enhance',
          element: 'script[type="application/ld+json"]',
          schemaType: schema['@type'],
          addedProperties: [
            ...details.recommendedProperties || [],
            ...Object.keys(details.nestedProperties || {})
          ]
        });
      }
    } catch (error) {
      // Ignore invalid JSON - handled by fixInvalidSchema
    }
  });
  
  return changes;
}

/**
 * Detects the page type based on content
 * @param {Object} $ - Cheerio instance
 * @returns {string|null} - Detected page type or null
 */
function detectPageType($) {
  // Check for product page indicators
  if ($('.product, .product-details, [itemtype*="Product"]').length > 0 || 
      $('#product, #product-details').length > 0 ||
      $('*:contains("Add to Cart")').length > 0) {
    return 'product';
  }
  
  // Check for article/blog indicators
  if ($('article, .post, .blog-post, [itemtype*="Article"]').length > 0 || 
      $('#article, #post, .blog').length > 0 ||
      $('time, .published-date, .post-date').length > 0) {
    return 'article';
  }
  
  // Check for contact page
  if ($('.contact, #contact, [itemtype*="ContactPage"]').length > 0 ||
      $('form:contains("Name"), form:contains("Email")').length > 0 ||
      $('*:contains("Contact Us")').length > 0) {
    return 'contact';
  }
  
  // Check for about page
  if ($('.about, #about, [itemtype*="AboutPage"]').length > 0 ||
      $('*:contains("About Us")').length > 0) {
    return 'about';
  }
  
  // Default to organization for homepage
  if (isHomePage($)) {
    return 'organization';
  }
  
  // Unable to determine
  return null;
}

/**
 * Determines if this is likely the homepage
 * @param {Object} $ - Cheerio instance
 * @returns {boolean} - True if likely homepage
 */
function isHomePage($) {
  // Check if URL ends with / or index.html
  const canonical = $('link[rel="canonical"]').attr('href');
  if (canonical) {
    const url = canonical.trim();
    return url.endsWith('/') || url.endsWith('/index.html') || !url.includes('/');
  }
  
  // Check for homepage indicators
  const h1Text = $('h1').text().toLowerCase();
  return h1Text.includes('welcome') || h1Text.includes('home') || h1Text.includes('main');
}

/**
 * Gets the appropriate schema template for a page type
 * @param {string} pageType - Type of page
 * @param {Object} details - Issue details
 * @returns {Object|null} - Schema template or null
 */
function getSchemaTemplate(pageType, details) {
  // Map page types to schema templates
  const pageTypeToSchema = {
    'product': 'product',
    'article': 'article',
    'blog': 'article',
    'post': 'article',
    'organization': 'organization',
    'about': 'organization',
    'contact': 'organization',
    'local-business': 'local-business'
  };
  
  // Use specific schema type if provided
  if (details.schemaType && SCHEMA_TEMPLATES[details.schemaType]) {
    return JSON.parse(JSON.stringify(SCHEMA_TEMPLATES[details.schemaType]));
  }
  
  // Look up template based on page type
  const templateKey = pageTypeToSchema[pageType];
  if (templateKey && SCHEMA_TEMPLATES[templateKey]) {
    return JSON.parse(JSON.stringify(SCHEMA_TEMPLATES[templateKey]));
  }
  
  return null;
}

/**
 * Populates a schema template with content from the page
 * @param {Object} template - Schema template to populate
 * @param {Object} $ - Cheerio instance
 * @param {Object} details - Issue details
 * @returns {Object} - Populated schema
 */
function populateSchemaTemplate(template, $, details) {
  const schema = { ...template };
  
  // Use specific values from details if provided
  if (details.schemaValues) {
    Object.entries(details.schemaValues).forEach(([key, value]) => {
      setNestedProperty(schema, key, value);
    });
  }
  
  // Auto-populate from page content if not already set
  switch (schema['@type']) {
    case 'Organization':
      if (!schema.name) schema.name = $('title').text().trim() || details.siteName || '';
      if (!schema.url) schema.url = $('link[rel="canonical"]').attr('href') || details.siteUrl || '';
      if (!schema.logo) schema.logo = $('img[alt*="logo"], .logo img').first().attr('src') || '';
      break;
      
    case 'LocalBusiness':
      if (!schema.name) schema.name = $('title').text().trim() || details.siteName || '';
      // Address would come from details.schemaValues
      if (!schema.telephone) schema.telephone = $('a[href^="tel:"]').first().text() || '';
      break;
      
    case 'Product':
      if (!schema.name) schema.name = $('h1').first().text().trim() || '';
      if (!schema.description) schema.description = $('meta[name="description"]').attr('content') || '';
      if (!schema.image) schema.image = $('.product img, .product-image img').first().attr('src') || '';
      // Price data would come from details.schemaValues
      break;
      
    case 'Article':
      if (!schema.headline) schema.headline = $('h1').first().text().trim() || '';
      if (!schema.description) schema.description = $('meta[name="description"]').attr('content') || '';
      if (!schema.image) schema.image = $('article img').first().attr('src') || '';
      if (!schema.datePublished) {
        schema.datePublished = $('time, .published-date, meta[property="article:published_time"]').attr('datetime') || 
                               new Date().toISOString();
      }
      if (!schema.dateModified) {
        schema.dateModified = $('meta[property="article:modified_time"]').attr('content') || 
                              schema.datePublished;
      }
      if (!schema.author.name) {
        schema.author.name = $('.author, .byline').text().trim() || details.authorName || '';
      }
      if (!schema.publisher.name) {
        schema.publisher.name = details.siteName || '';
      }
      break;
  }
  
  return schema;
}

/**
 * Sets a nested property in an object
 * @param {Object} obj - Object to modify
 * @param {string} path - Property path (e.g., 'offers.price')
 * @param {any} value - Value to set
 */
function setNestedProperty(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    
    // Create nested object if it doesn't exist
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    
    current = current[key];
  }
  
  // Set the final property
  current[keys[keys.length - 1]] = value;
}

/**
 * Checks if a file is an HTML file
 * @param {string} filePath - Path to the file
 * @returns {boolean} - True if it's an HTML file
 */
function isHtmlFile(filePath) {
  const htmlExtensions = ['.html', '.htm', '.php', '.jsx', '.tsx'];
  const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
  return htmlExtensions.includes(ext);
}

module.exports = {
  fix,
  // Export internal functions for testing
  addMissingSchema,
  fixInvalidSchema,
  enhanceIncompleteSchema,
  detectPageType
};