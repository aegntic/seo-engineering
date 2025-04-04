/**
 * Verification System Integration Test
 * 
 * Tests the complete verification system flow with sample data
 * to ensure all components work together correctly.
 */

const { describe, test, beforeAll, afterAll, expect } = require('@jest/globals');
const VerificationSystem = require('../index');
const BeforeAfterComparison = require('../strategies/beforeAfterComparison');
const PerformanceImpact = require('../strategies/performanceImpact');
const RegressionTesting = require('../strategies/regressionTesting');
const VisualComparison = require('../strategies/visualComparison');
const VerificationResult = require('../models/verificationResult');
const ComparisonMetric = require('../models/comparisonMetric');
const mongoose = require('mongoose');
const { Verification, FixVerification } = require('../../../api/models/verification');
const config = require('../../../config');

// Mock the implementation modules
jest.mock('../../common/logger', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

jest.mock('../../implementation/fixTracker', () => ({
  getFixesForSite: jest.fn()
}));

jest.mock('../../implementation/stateTracker', () => ({
  getBeforeState: jest.fn()
}));

jest.mock('../../implementation/performanceTracker', () => ({
  getBeforePerformance: jest.fn()
}));

jest.mock('../../implementation/screenshotStorage', () => ({
  getScreenshots: jest.fn()
}));

jest.mock('../../implementation/testRegistry', () => ({
  getRegressionTests: jest.fn()
}));

// Get the mocked modules
const { getFixesForSite } = require('../../implementation/fixTracker');
const { getBeforeState } = require('../../implementation/stateTracker');
const { getBeforePerformance } = require('../../implementation/performanceTracker');
const { getScreenshots } = require('../../implementation/screenshotStorage');
const { getRegressionTests } = require('../../implementation/testRegistry');

describe('Verification System Integration', () => {
  let verificationSystem;
  let siteId;
  let testConnection;
  
  beforeAll(async () => {
    // Connect to test database
    testConnection = await mongoose.connect(config.database.testUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Clear test data
    await Verification.deleteMany({});
    await FixVerification.deleteMany({});
    
    // Initialize verification system
    verificationSystem = new VerificationSystem({
      performanceThreshold: 5,
      regressionTestCount: 3,
      mockMode: true // Enable mock mode for testing
    });
    
    // Setup site ID for tests
    siteId = 'test-site-integration';
  });
  
  afterAll(async () => {
    // Disconnect from test database
    if (testConnection) {
      await mongoose.connection.close();
    }
  });
  
  test('Full verification flow with mocked data', async () => {
    // Setup mock data
    const mockFixes = [
      { 
        id: 'fix-1', 
        type: 'meta-tags', 
        targetUrls: ['https://example.com'],
        targetElements: ['meta[name="description"]', 'title']
      },
      { 
        id: 'fix-2', 
        type: 'image-optimization', 
        targetUrls: ['https://example.com/about'],
        targetElements: ['img.hero', 'img.product']
      },
      { 
        id: 'fix-3', 
        type: 'speed', 
        targetUrls: ['https://example.com'],
        targetElements: []
      }
    ];
    
    // Mock getFixesForSite to return our test fixes
    getFixesForSite.mockResolvedValue(mockFixes);
    
    // Mock getBeforeState to return test state data
    getBeforeState.mockImplementation((siteId, fixId) => {
      switch (fixId) {
        case 'fix-1':
          return Promise.resolve({
            type: 'meta-tags',
            elements: [
              {
                selector: 'meta[name="description"]',
                content: 'Old description',
                length: 15
              },
              {
                selector: 'title',
                content: 'Old Title',
                length: 9
              }
            ]
          });
        
        case 'fix-2':
          return Promise.resolve({
            type: 'image-optimization',
            elements: [
              {
                selector: 'img.hero',
                size: 150000,
                width: 1200,
                height: 800,
                hasAlt: false,
                format: 'jpg'
              },
              {
                selector: 'img.product',
                size: 80000,
                width: 600,
                height: 400,
                hasAlt: true,
                format: 'png'
              }
            ]
          });
          
        case 'fix-3':
          return Promise.resolve({
            type: 'speed',
            metrics: {
              loadTime: 3500,
              firstContentfulPaint: 2800,
              largestContentfulPaint: 4200,
              totalResourceSize: 2500000
            }
          });
          
        default:
          return Promise.resolve(null);
      }
    });
    
    // Mock BeforeAfterComparison.prototype.getCurrentState method
    const originalBeforeAfterPrototype = BeforeAfterComparison.prototype;
    BeforeAfterComparison.prototype.getCurrentState = jest.fn().mockImplementation(
      (siteId, fix) => {
        switch (fix.id) {
          case 'fix-1':
            return Promise.resolve({
              type: 'meta-tags',
              elements: [
                {
                  selector: 'meta[name="description"]',
                  content: 'New optimized description with keywords',
                  length: 38
                },
                {
                  selector: 'title',
                  content: 'New Optimized Title with Keywords',
                  length: 33
                }
              ]
            });
          
          case 'fix-2':
            return Promise.resolve({
              type: 'image-optimization',
              elements: [
                {
                  selector: 'img.hero',
                  size: 45000,
                  width: 1200,
                  height: 800,
                  hasAlt: true,
                  format: 'webp'
                },
                {
                  selector: 'img.product',
                  size: 30000,
                  width: 600,
                  height: 400,
                  hasAlt: true,
                  format: 'webp'
                }
              ]
            });
            
          case 'fix-3':
            return Promise.resolve({
              type: 'speed',
              metrics: {
                loadTime: 1200,
                firstContentfulPaint: 800,
                largestContentfulPaint: 1500,
                totalResourceSize: 800000
              }
            });
            
          default:
            return Promise.resolve(null);
        }
      }
    );
    
    // Mock getBeforePerformance for performance impact
    getBeforePerformance.mockImplementation((siteId, fixId) => {
      if (fixId === 'fix-3') {
        return Promise.resolve({
          desktop: {
            loadTime: 3200,
            firstContentfulPaint: 2500,
            largestContentfulPaint: 3800,
            cumulativeLayoutShift: 0.25,
            totalBlockingTime: 450,
            resourceSize: 2200000,
            requestCount: 85
          },
          mobile: {
            loadTime: 5500,
            firstContentfulPaint: 3200,
            largestContentfulPaint: 6300,
            cumulativeLayoutShift: 0.38,
            totalBlockingTime: 780,
            resourceSize: 2200000,
            requestCount: 85
          }
        });
      }
      
      return Promise.resolve(null);
    });
    
    // Mock PerformanceImpact.prototype.measureCurrentPerformance method
    const originalPerformancePrototype = PerformanceImpact.prototype;
    PerformanceImpact.prototype.measureCurrentPerformance = jest.fn().mockImplementation(
      (siteId, fix) => {
        if (fix.id === 'fix-3') {
          return Promise.resolve({
            desktop: {
              loadTime: 2100,
              firstContentfulPaint: 1200,
              largestContentfulPaint: 2500,
              cumulativeLayoutShift: 0.12,
              totalBlockingTime: 180,
              resourceSize: 950000,
              requestCount: 45
            },
            mobile: {
              loadTime: 3800,
              firstContentfulPaint: 1900,
              largestContentfulPaint: 4100,
              cumulativeLayoutShift: 0.15,
              totalBlockingTime: 350,
              resourceSize: 950000,
              requestCount: 45
            }
          });
        }
        
        return Promise.resolve(null);
      }
    );
    
    // Mock getRegressionTests for regression testing
    getRegressionTests.mockImplementation((siteId) => {
      return Promise.resolve([
        {
          id: 'test-1',
          name: 'Homepage Navigation',
          description: 'Verify homepage navigation works correctly',
          critical: true,
          type: 'navigation',
          url: 'https://example.com',
          expectedTitle: 'New Optimized Title with Keywords'
        },
        {
          id: 'test-2',
          name: 'Image Loading',
          description: 'Verify images load correctly',
          critical: false,
          type: 'content',
          url: 'https://example.com/about',
          elementChecks: [
            {
              selector: 'img.hero',
              attribute: 'src',
              content: 'hero'
            }
          ]
        },
        {
          id: 'test-3',
          name: 'Performance Check',
          description: 'Verify performance metrics',
          critical: true,
          type: 'performance',
          url: 'https://example.com',
          thresholds: {
            loadTime: 3000,
            fcp: 2000,
            lcp: 4000
          }
        }
      ]);
    });
    
    // Mock RegressionTesting.prototype.runTests method
    const originalRegressionPrototype = RegressionTesting.prototype;
    RegressionTesting.prototype.runTests = jest.fn().mockImplementation(
      (tests) => {
        return Promise.resolve(
          tests.map(test => ({
            testId: test.id,
            name: test.name,
            description: test.description,
            passed: true,
            duration: Math.floor(Math.random() * 500) + 100,
            critical: test.critical || false,
            details: {},
            errors: []
          }))
        );
      }
    );
    
    // Mock getScreenshots for visual comparison
    getScreenshots.mockImplementation((siteId, fixId, type) => {
      // Only return screenshots for the image optimization fix
      if (fixId === 'fix-2') {
        if (type === 'before') {
          return Promise.resolve([
            {
              url: 'https://example.com/about',
              device: 'desktop',
              viewport: { width: 1280, height: 800 },
              path: '/path/to/before-desktop.png'
            },
            {
              url: 'https://example.com/about',
              device: 'mobile',
              viewport: { width: 375, height: 667 },
              path: '/path/to/before-mobile.png'
            }
          ]);
        } else if (type === 'after') {
          return Promise.resolve([
            {
              url: 'https://example.com/about',
              device: 'desktop',
              viewport: { width: 1280, height: 800 },
              path: '/path/to/after-desktop.png'
            },
            {
              url: 'https://example.com/about',
              device: 'mobile',
              viewport: { width: 375, height: 667 },
              path: '/path/to/after-mobile.png'
            }
          ]);
        }
      }
      
      return Promise.resolve([]);
    });
    
    // Mock VisualComparison.prototype.compareScreenshotPairs method
    const originalVisualPrototype = VisualComparison.prototype;
    VisualComparison.prototype.compareScreenshotPairs = jest.fn().mockImplementation(
      (pairs) => {
        return Promise.resolve(
          pairs.map(pair => ({
            url: pair.before.url,
            device: pair.before.device,
            viewport: pair.before.viewport,
            beforePath: pair.before.path,
            afterPath: pair.after.path,
            diffPath: `/path/to/diff-${pair.before.device}.png`,
            differencePercentage: 3.5,
            matchPercentage: 96.5,
            diffPixels: 12500,
            totalPixels: 357000,
            passed: true
          }))
        );
      }
    );
    
    // Run the verification
    const result = await verificationSystem.verifySite(siteId);
    
    // Verify the overall result
    expect(result).toBeInstanceOf(VerificationResult);
    expect(result.success).toBe(true);
    expect(result.fixes.length).toBe(3);
    expect(result.summary.totalFixes).toBe(3);
    expect(result.summary.successfulFixes).toBe(3);
    expect(result.summary.failedFixes).toBe(0);
    expect(result.summary.successRate).toBe(100);
    
    // Verify each fix result
    const metaTagsFix = result.fixes.find(fix => fix.fixType === 'meta-tags');
    expect(metaTagsFix).toBeDefined();
    expect(metaTagsFix.success).toBe(true);
    expect(metaTagsFix.strategyResults).toHaveProperty('beforeAfter');
    expect(metaTagsFix.strategyResults).toHaveProperty('regression');
    
    const imageFix = result.fixes.find(fix => fix.fixType === 'image-optimization');
    expect(imageFix).toBeDefined();
    expect(imageFix.success).toBe(true);
    expect(imageFix.strategyResults).toHaveProperty('beforeAfter');
    expect(imageFix.strategyResults).toHaveProperty('regression');
    expect(imageFix.strategyResults).toHaveProperty('visual');
    
    const speedFix = result.fixes.find(fix => fix.fixType === 'speed');
    expect(speedFix).toBeDefined();
    expect(speedFix.success).toBe(true);
    expect(speedFix.strategyResults).toHaveProperty('beforeAfter');
    expect(speedFix.strategyResults).toHaveProperty('performance');
    expect(speedFix.strategyResults).toHaveProperty('regression');
    
    // Verify performance metrics
    const performanceResult = speedFix.strategyResults.performance;
    expect(performanceResult).toBeDefined();
    expect(performanceResult.success).toBe(true);
    expect(performanceResult.improvementPercentage).toBeGreaterThan(0);
    
    // Check that the result was saved to the database
    const savedVerification = await Verification.findOne({ siteId });
    expect(savedVerification).toBeDefined();
    expect(savedVerification.success).toBe(true);
    expect(savedVerification.fixes.length).toBe(3);
    
    // Restore original prototypes
    Object.assign(BeforeAfterComparison.prototype, originalBeforeAfterPrototype);
    Object.assign(PerformanceImpact.prototype, originalPerformancePrototype);
    Object.assign(RegressionTesting.prototype, originalRegressionPrototype);
    Object.assign(VisualComparison.prototype, originalVisualPrototype);
  });
  
  test('Handles partial failures correctly', async () => {
    // Setup mock data with one failing fix
    const mockFixes = [
      { 
        id: 'fail-fix-1', 
        type: 'meta-tags', 
        targetUrls: ['https://example.com'],
        targetElements: ['meta[name="description"]', 'title']
      },
      { 
        id: 'fail-fix-2', 
        type: 'schema-markup', 
        targetUrls: ['https://example.com'],
        targetElements: ['script[type="application/ld+json"]']
      }
    ];
    
    // Mock getFixesForSite to return our test fixes
    getFixesForSite.mockResolvedValue(mockFixes);
    
    // Mock BeforeAfterComparison to succeed for first fix and fail for second
    const originalBeforeAfterVerify = BeforeAfterComparison.prototype.verify;
    BeforeAfterComparison.prototype.verify = jest.fn()
      .mockImplementationOnce(() => Promise.resolve({
        success: true,
        message: 'Before/after comparison successful',
        metrics: []
      }))
      .mockImplementationOnce(() => Promise.resolve({
        success: false,
        message: 'Schema markup missing required properties',
        metrics: []
      }));
    
    // Run the verification
    const result = await verificationSystem.verifySite(siteId);
    
    // Verify the overall result
    expect(result).toBeInstanceOf(VerificationResult);
    expect(result.success).toBe(false);
    expect(result.fixes.length).toBe(2);
    expect(result.summary.totalFixes).toBe(2);
    expect(result.summary.successfulFixes).toBe(1);
    expect(result.summary.failedFixes).toBe(1);
    expect(result.summary.successRate).toBe(50);
    
    // Verify the failed fix result
    const failedFix = result.getFailedFixes()[0];
    expect(failedFix).toBeDefined();
    expect(failedFix.fixType).toBe('schema-markup');
    
    // Check that the result was saved to the database
    const savedVerification = await Verification.findOne({ 
      siteId,
      success: false
    });
    expect(savedVerification).toBeDefined();
    expect(savedVerification.fixes.length).toBe(2);
    
    // Restore original method
    BeforeAfterComparison.prototype.verify = originalBeforeAfterVerify;
  });
  
  test('Handles errors gracefully', async () => {
    // Mock getFixesForSite to throw an error
    getFixesForSite.mockRejectedValue(new Error('Connection failed'));
    
    // Run the verification and expect it to throw
    await expect(verificationSystem.verifySite('error-site')).rejects.toThrow('Connection failed');
  });
});
