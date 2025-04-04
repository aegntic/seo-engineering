/**
 * Meta Tag Fixer Tests
 * 
 * Unit tests for the Meta Tag Fixer strategy
 */

const assert = require('assert');
const cheerio = require('cheerio');
const metaTagFixer = require('../strategies/metaTagFixer');

describe('Meta Tag Fixer', () => {
  // Mock internal function to avoid actual file operations
  const originalFixMissingTitle = metaTagFixer.fixMissingTitle;
  const originalFixMissingDescription = metaTagFixer.fixMissingDescription;
  const originalFixDuplicateTitle = metaTagFixer.fixDuplicateTitle;
  
  // Test data
  const htmlWithoutTags = `
    <!DOCTYPE html>
    <html>
    <head>
    </head>
    <body>
      <h1>Test Page</h1>
      <p>This is a test page without meta tags.</p>
    </body>
    </html>
  `;
  
  const htmlWithDuplicateTags = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>First Title</title>
      <title>Second Title</title>
      <meta name="description" content="First description">
      <meta name="description" content="Second description">
    </head>
    <body>
      <h1>Test Page</h1>
      <p>This is a test page with duplicate meta tags.</p>
    </body>
    </html>
  `;
  
  // Test fixture setup
  beforeEach(() => {
    // Expose the internal functions for testing
    metaTagFixer.fixMissingTitle = originalFixMissingTitle;
    metaTagFixer.fixMissingDescription = originalFixMissingDescription;
    metaTagFixer.fixDuplicateTitle = originalFixDuplicateTitle;
  });
  
  describe('fixMissingTitle', () => {
    it('should add a title tag when missing', () => {
      const $ = cheerio.load(htmlWithoutTags);
      const changes = metaTagFixer.fixMissingTitle($, {});
      
      assert.strictEqual($('title').length, 1);
      assert.strictEqual(changes.length, 1);
      assert.strictEqual(changes[0].type, 'add');
      assert.strictEqual(changes[0].element, 'title');
    });
    
    it('should use h1 content for title when available', () => {
      const $ = cheerio.load(htmlWithoutTags);
      const changes = metaTagFixer.fixMissingTitle($, {});
      
      assert.strictEqual($('title').text(), 'Test Page');
    });
    
    it('should use suggested title when provided', () => {
      const $ = cheerio.load(htmlWithoutTags);
      const changes = metaTagFixer.fixMissingTitle($, { suggestedTitle: 'Suggested Title' });
      
      assert.strictEqual($('title').text(), 'Suggested Title');
    });
    
    it('should not add title if already exists', () => {
      const htmlWithTitle = htmlWithoutTags.replace('</head>', '<title>Existing Title</title></head>');
      const $ = cheerio.load(htmlWithTitle);
      const changes = metaTagFixer.fixMissingTitle($, {});
      
      assert.strictEqual($('title').length, 1);
      assert.strictEqual($('title').text(), 'Existing Title');
      assert.strictEqual(changes.length, 0);
    });
  });
  
  describe('fixMissingDescription', () => {
    it('should add a description meta tag when missing', () => {
      const $ = cheerio.load(htmlWithoutTags);
      const changes = metaTagFixer.fixMissingDescription($, {});
      
      assert.strictEqual($('meta[name="description"]').length, 1);
      assert.strictEqual(changes.length, 1);
      assert.strictEqual(changes[0].type, 'add');
      assert.strictEqual(changes[0].element, 'meta[name="description"]');
    });
    
    it('should use first paragraph content for description when available', () => {
      const $ = cheerio.load(htmlWithoutTags);
      const changes = metaTagFixer.fixMissingDescription($, {});
      
      assert.strictEqual($('meta[name="description"]').attr('content'), 'This is a test page without meta tags.');
    });
    
    it('should use suggested description when provided', () => {
      const $ = cheerio.load(htmlWithoutTags);
      const changes = metaTagFixer.fixMissingDescription($, { suggestedDescription: 'Suggested Description' });
      
      assert.strictEqual($('meta[name="description"]').attr('content'), 'Suggested Description');
    });
  });
  
  describe('fixDuplicateTitle', () => {
    it('should remove duplicate title tags', () => {
      const $ = cheerio.load(htmlWithDuplicateTags);
      const changes = metaTagFixer.fixDuplicateTitle($, {});
      
      assert.strictEqual($('title').length, 1);
      assert.strictEqual($('title').text(), 'First Title');
      assert.strictEqual(changes.length, 1);
      assert.strictEqual(changes[0].type, 'remove');
      assert.strictEqual(changes[0].element, 'title');
      assert.strictEqual(changes[0].value, 'Second Title');
    });
  });
  
  describe('fixDuplicateDescription', () => {
    it('should remove duplicate description meta tags', () => {
      const $ = cheerio.load(htmlWithDuplicateTags);
      const changes = metaTagFixer.fixDuplicateDescription($, {});
      
      assert.strictEqual($('meta[name="description"]').length, 1);
      assert.strictEqual($('meta[name="description"]').attr('content'), 'First description');
      assert.strictEqual(changes.length, 1);
      assert.strictEqual(changes[0].type, 'remove');
      assert.strictEqual(changes[0].element, 'meta[name="description"]');
    });
  });
});
