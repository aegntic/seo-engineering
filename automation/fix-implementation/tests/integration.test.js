/**
 * Integration Tests for Fix Implementation System
 * 
 * Tests the entire fix implementation process with actual file operations.
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs').promises;
const fixEngine = require('../fixEngine');
const siteAdapter = require('../siteAdapter');
const metaTagFixer = require('../strategies/metaTagFixer');
const imageOptimizer = require('../strategies/imageOptimizer');
const headerFixer = require('../strategies/headerFixer');
const schemaFixer = require('../strategies/schemaFixer');
const robotsTxtFixer = require('../strategies/robotsTxtFixer');

// Test data directory
const TEST_DATA_DIR = path.join(__dirname, 'test-data');
const TEST_SITE_DIR = path.join(TEST_DATA_DIR, 'test-site');

describe('Fix Implementation System - Integration', function() {
  this.timeout(10000); // Allow up to 10 seconds for tests
  
  // Set up test site structure
  beforeEach(async () => {
    // Ensure test data directory exists
    await fs.mkdir(TEST_DATA_DIR, { recursive: true });
    
    // Create test site directory
    await fs.mkdir(TEST_SITE_DIR, { recursive: true });
    
    // Create test HTML file with issues
    const testHtmlPath = path.join(TEST_SITE_DIR, 'index.html');
    const testHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Page</title>
      <!-- Missing meta description -->
      <title>Duplicate Title</title>
    </head>
    <body>
      <h2>Missing H1 Tag</h2>
      <p>This is a test page with SEO issues.</p>
      <img src="logo.png"><!-- Missing alt text -->
      <h1>Multiple H1 Tag</h1>
    </body>
    </html>
    `;
    await fs.writeFile(testHtmlPath, testHtml);
    
    // Create test image
    const testImgDir = path.join(TEST_SITE_DIR, 'img');
    await fs.mkdir(testImgDir, { recursive: true });
    // Create empty image file
    await fs.writeFile(path.join(testImgDir, 'test-image.jpg'), '');
  });
  
  // Clean up test data
  afterEach(async () => {
    try {
      await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
  });
  
  describe('Fix Engine', () => {
    it('should implement fixes for multiple issues', async () => {
      // Test site data
      const site = {
        id: 'test-site-123',
        url: 'https://test-example.com',
        repository: {
          url: TEST_SITE_DIR, // Use local directory as "repository"
          branch: 'main'
        }
      };
      
      // Test issues
      const issues = [
        {
          id: 'issue-1',
          type: 'missing-meta-tags',
          subType: 'missing-description',
          filePath: 'index.html',
          severity: 'high',
          details: {
            suggestedDescription: 'This is a test page description.'
          }
        },
        {
          id: 'issue-2',
          type: 'duplicate-meta-tags',
          subType: 'duplicate-title',
          filePath: 'index.html',
          severity: 'high',
          details: {}
        },
        {
          id: 'issue-3',
          type: 'header-structure',
          subType: 'multiple-h1',
          filePath: 'index.html',
          severity: 'medium',
          details: {}
        },
        {
          id: 'issue-4',
          type: 'missing-schema',
          subType: 'missing-schema',
          filePath: 'index.html',
          severity: 'medium',
          details: {
            pageType: 'organization',
            schemaValues: {
              name: 'Test Organization',
              url: 'https://test-example.com'
            }
          }
        },
        {
          id: 'issue-5',
          type: 'robots-txt',
          subType: 'missing-robots',
          filePath: 'robots.txt',
          severity: 'high',
          details: {
            domain: 'test-example.com',
            sitemapUrl: 'https://test-example.com/sitemap.xml'
          }
        }
      ];
      
      // Run the fix engine
      const result = await fixEngine.implementFixes(site, issues, {
        prioritized: true // Skip prioritization for testing
      });
      
      // Verify results
      assert.strictEqual(result.summary.totalIssues, 5);
      assert.ok(result.summary.fixedCount > 0);
      
      // Check the actual changes to files
      const updatedHtml = await fs.readFile(path.join(TEST_SITE_DIR, 'index.html'), 'utf8');
      const robotsTxt = await fs.readFile(path.join(TEST_SITE_DIR, 'robots.txt'), 'utf8');
      
      // Verify HTML changes
      assert.ok(updatedHtml.includes('<meta name="description" content="This is a test page description.">'));
      assert.strictEqual((updatedHtml.match(/<title>/g) || []).length, 1); // Only one title tag
      assert.strictEqual((updatedHtml.match(/<h1>/g) || []).length, 1); // Only one h1 tag
      assert.ok(updatedHtml.includes('application/ld+json')); // Has schema markup
      
      // Verify robots.txt was created
      assert.ok(robotsTxt.includes('User-agent: *'));
      assert.ok(robotsTxt.includes('Sitemap: https://test-example.com/sitemap.xml'));
    });
  });
  
  describe('Individual Fix Strategies', () => {
    it('should fix meta tag issues', async () => {
      const result = await metaTagFixer.fix(
        TEST_SITE_DIR,
        'index.html',
        {
          subType: 'missing-description',
          details: {
            suggestedDescription: 'Test description'
          }
        },
        {}
      );
      
      assert.strictEqual(result.success, true);
      assert.ok(result.changes.length > 0);
      
      const updatedHtml = await fs.readFile(path.join(TEST_SITE_DIR, 'index.html'), 'utf8');
      assert.ok(updatedHtml.includes('<meta name="description" content="Test description">'));
    });
    
    it('should create robots.txt if missing', async () => {
      const result = await robotsTxtFixer.fix(
        TEST_SITE_DIR,
        'robots.txt',
        {
          subType: 'missing-robots',
          details: {
            domain: 'test-example.com',
            sitemapUrl: 'https://test-example.com/sitemap.xml'
          }
        },
        {}
      );
      
      assert.strictEqual(result.success, true);
      
      const robotsTxt = await fs.readFile(path.join(TEST_SITE_DIR, 'robots.txt'), 'utf8');
      assert.ok(robotsTxt.includes('User-agent: *'));
      assert.ok(robotsTxt.includes('Sitemap: https://test-example.com/sitemap.xml'));
    });
    
    it('should add schema markup to page', async () => {
      const result = await schemaFixer.fix(
        TEST_SITE_DIR,
        'index.html',
        {
          subType: 'missing-schema',
          details: {
            pageType: 'organization',
            schemaValues: {
              name: 'Test Organization',
              url: 'https://test-example.com'
            }
          }
        },
        {}
      );
      
      assert.strictEqual(result.success, true);
      
      const updatedHtml = await fs.readFile(path.join(TEST_SITE_DIR, 'index.html'), 'utf8');
      assert.ok(updatedHtml.includes('application/ld+json'));
      assert.ok(updatedHtml.includes('Test Organization'));
    });
  });
});