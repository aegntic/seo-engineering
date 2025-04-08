/**
 * Verification System Tests
 * 
 * Unit tests for the SEO.engineering Verification System,
 * ensuring proper functionality of all components.
 */

const { describe, test, expect, beforeEach, afterEach, jest } = require('@jest/globals');
const VerificationSystem = require('../index');
const BeforeAfterComparison = require('../strategies/beforeAfterComparison');
const PerformanceImpact = require('../strategies/performanceImpact');
const RegressionTesting = require('../strategies/regressionTesting');
const VisualComparison = require('../strategies/visualComparison');
const VerificationResult = require('../models/verificationResult');
const ComparisonMetric = require('../models/comparisonMetric');

// Mock dependencies
jest.mock('../../common/logger', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

jest.mock('../../implementation/fixTracker', () => ({
  getFixesForSite: jest.fn()
}));

jest.mock('../strategies/beforeAfterComparison', () => 
  jest.fn().mockImplementation(() => ({
    verify: jest.fn()
  }))
);

jest.mock('../strategies/performanceImpact', () => 
  jest.fn().mockImplementation(() => ({
    verify: jest.fn()
  }))
);

jest.mock('../strategies/regressionTesting', () => 
  jest.fn().mockImplementation(() => ({
    verify: jest.fn()
  }))
);

jest.mock('../strategies/visualComparison', () => 
  jest.fn().mockImplementation(() => ({
    verify: jest.fn()
  }))
);

const { getFixesForSite } = require('../../implementation/fixTracker');

describe('VerificationSystem', () => {
  let verificationSystem;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create a new verification system instance for each test
    verificationSystem = new VerificationSystem({
      performanceThreshold: 10,
      regressionTestCount: 5
    });
  });
  
  test('Constructor initializes with default options', () => {
    const defaultVerificationSystem = new VerificationSystem();
    
    expect(BeforeAfterComparison).toHaveBeenCalled();
    expect(PerformanceImpact).toHaveBeenCalled();
    expect(RegressionTesting).toHaveBeenCalled();
    expect(VisualComparison).toHaveBeenCalled();
    
    expect(defaultVerificationSystem.config).toHaveProperty('performanceThreshold', 5);
    expect(defaultVerificationSystem.config).toHaveProperty('regressionTestCount', 3);
  });
  
  test('Constructor initializes with provided options', () => {
    expect(verificationSystem.config).toHaveProperty('performanceThreshold', 10);
    expect(verificationSystem.config).toHaveProperty('regressionTestCount', 5);
  });
  
  test('verifySite handles no fixes gracefully', async () => {
    getFixesForSite.mockResolvedValue([]);
    
    const result = await verificationSystem.verifySite('test-site-1');
    
    expect(getFixesForSite).toHaveBeenCalledWith('test-site-1');
    expect(result).toBeInstanceOf(VerificationResult);
    expect(result.success).toBe(false);
    expect(result.message).toContain('No implemented fixes to verify');
    expect(result.fixes).toEqual([]);
  });
  
  test('verifySite processes fixes and aggregates results', async () => {
    // Setup mock fixes
    const mockFixes = [
      { id: 'fix-1', type: 'meta-tags', targetUrls: ['https://example.com'] },
      { id: 'fix-2', type: 'speed', targetUrls: ['https://example.com/about'] }
    ];
    
    getFixesForSite.mockResolvedValue(mockFixes);
    
    // Setup mock strategy responses
    verificationSystem.strategies.beforeAfter.verify.mockResolvedValue({
      success: true,
      message: 'Before/after comparison successful',
      metrics: []
    });
    
    verificationSystem.strategies.performance.verify.mockResolvedValue({
      success: true,
      message: 'Performance improved',
      metrics: [],
      improvementPercentage: 15
    });
    
    verificationSystem.strategies.regression.verify.mockResolvedValue({
      success: true,
      message: 'All regression tests passed',
      tests: []
    });
    
    // Run verification
    const result = await verificationSystem.verifySite('test-site-1');
    
    // Verify the result
    expect(getFixesForSite).toHaveBeenCalledWith('test-site-1');
    expect(result).toBeInstanceOf(VerificationResult);
    expect(result.success).toBe(true);
    expect(result.message).toContain('All fixes successfully verified');
    expect(result.fixes).toHaveLength(2);
    
    // Verify that each strategy was called for the appropriate fix
    expect(verificationSystem.strategies.beforeAfter.verify).toHaveBeenCalledTimes(2);
    expect(verificationSystem.strategies.performance.verify).toHaveBeenCalledTimes(1);
    expect(verificationSystem.strategies.regression.verify).toHaveBeenCalledTimes(2);
    expect(verificationSystem.strategies.visual.verify).toHaveBeenCalledTimes(0);
  });
  
  test('verifySite handles partial failures correctly', async () => {
    // Setup mock fixes
    const mockFixes = [
      { id: 'fix-1', type: 'meta-tags', targetUrls: ['https://example.com'] },
      { id: 'fix-2', type: 'speed', targetUrls: ['https://example.com/about'] }
    ];
    
    getFixesForSite.mockResolvedValue(mockFixes);
    
    // Setup mock strategy responses - one success, one failure
    verificationSystem.strategies.beforeAfter.verify
      .mockResolvedValueOnce({
        success: true,
        message: 'Before/after comparison successful',
        metrics: []
      })
      .mockResolvedValueOnce({
        success: false,
        message: 'Before/after comparison failed',
        metrics: []
      });
    
    verificationSystem.strategies.performance.verify.mockResolvedValue({
      success: true,
      message: 'Performance improved',
      metrics: [],
      improvementPercentage: 15
    });
    
    verificationSystem.strategies.regression.verify.mockResolvedValue({
      success: true,
      message: 'All regression tests passed',
      tests: []
    });
    
    // Run verification
    const result = await verificationSystem.verifySite('test-site-1');
    
    // Verify the result
    expect(result.success).toBe(false);
    expect(result.message).toContain('Some fixes failed verification');
  });
  
  test('verifySite handles strategy failures', async () => {
    // Setup mock fixes
    const mockFixes = [
      { id: 'fix-1', type: 'meta-tags', targetUrls: ['https://example.com'] }
    ];
    
    getFixesForSite.mockResolvedValue(mockFixes);
    
    // Setup mock strategy to throw error
    verificationSystem.strategies.beforeAfter.verify.mockRejectedValue(
      new Error('Strategy execution failed')
    );
    
    // Run verification and expect it to throw
    await expect(verificationSystem.verifySite('test-site-1'))
      .rejects.toThrow('Strategy execution failed');
  });
  
  test('getApplicableStrategies returns correct strategies for each fix type', () => {
    // Test meta tags fix
    let strategies = verificationSystem.getApplicableStrategies('meta-tags');
    expect(strategies).toHaveProperty('beforeAfter');
    expect(strategies).toHaveProperty('regression');
    expect(strategies).not.toHaveProperty('performance');
    expect(strategies).not.toHaveProperty('visual');
    
    // Test speed fix
    strategies = verificationSystem.getApplicableStrategies('speed');
    expect(strategies).toHaveProperty('beforeAfter');
    expect(strategies).toHaveProperty('regression');
    expect(strategies).toHaveProperty('performance');
    expect(strategies).not.toHaveProperty('visual');
    
    // Test layout fix
    strategies = verificationSystem.getApplicableStrategies('layout');
    expect(strategies).toHaveProperty('beforeAfter');
    expect(strategies).toHaveProperty('regression');
    expect(strategies).not.toHaveProperty('performance');
    expect(strategies).toHaveProperty('visual');
  });
});

describe('VerificationResult', () => {
  test('Constructor initializes with default values', () => {
    const result = new VerificationResult({
      siteId: 'test-site-1'
    });
    
    expect(result.siteId).toBe('test-site-1');
    expect(result.success).toBe(false);
    expect(result.message).toBe('');
    expect(result.fixes).toEqual([]);
    expect(result.summary).toBeDefined();
  });
  
  test('generateSummary calculates correct statistics', () => {
    const result = new VerificationResult({
      siteId: 'test-site-1',
      success: true,
      message: 'All fixes verified',
      fixes: [
        {
          fixId: 'fix-1',
          fixType: 'meta-tags',
          success: true,
          strategyResults: {}
        },
        {
          fixId: 'fix-2',
          fixType: 'speed',
          success: true,
          strategyResults: {
            performance: {
              improvementPercentage: 15
            }
          }
        },
        {
          fixId: 'fix-3',
          fixType: 'image-optimization',
          success: false,
          strategyResults: {}
        }
      ]
    });
    
    expect(result.summary.totalFixes).toBe(3);
    expect(result.summary.successfulFixes).toBe(2);
    expect(result.summary.failedFixes).toBe(1);
    expect(result.summary.successRate).toBe((2/3) * 100);
    expect(result.summary.averageImprovementPercentage).toBe(15);
  });
  
  test('getResultsByFixType filters fixes correctly', () => {
    const result = new VerificationResult({
      siteId: 'test-site-1',
      fixes: [
        { fixId: 'fix-1', fixType: 'meta-tags', success: true },
        { fixId: 'fix-2', fixType: 'speed', success: true },
        { fixId: 'fix-3', fixType: 'meta-tags', success: false }
      ]
    });
    
    const metaTagFixes = result.getResultsByFixType('meta-tags');
    expect(metaTagFixes).toHaveLength(2);
    expect(metaTagFixes[0].fixId).toBe('fix-1');
    expect(metaTagFixes[1].fixId).toBe('fix-3');
  });
  
  test('getFailedFixes returns only failed fixes', () => {
    const result = new VerificationResult({
      siteId: 'test-site-1',
      fixes: [
        { fixId: 'fix-1', fixType: 'meta-tags', success: true },
        { fixId: 'fix-2', fixType: 'speed', success: false },
        { fixId: 'fix-3', fixType: 'meta-tags', success: false }
      ]
    });
    
    const failedFixes = result.getFailedFixes();
    expect(failedFixes).toHaveLength(2);
    expect(failedFixes[0].fixId).toBe('fix-2');
    expect(failedFixes[1].fixId).toBe('fix-3');
  });
  
  test('toClientFormat returns client-friendly format', () => {
    const result = new VerificationResult({
      siteId: 'test-site-1',
      success: true,
      message: 'All fixes verified',
      fixes: [
        {
          fixId: 'fix-1',
          fixType: 'meta-tags',
          success: true,
          strategyResults: {}
        },
        {
          fixId: 'fix-2',
          fixType: 'speed',
          success: true,
          strategyResults: {
            performance: {
              improvementPercentage: 15
            }
          }
        }
      ]
    });
    
    const clientFormat = result.toClientFormat();
    
    expect(clientFormat).toHaveProperty('success', true);
    expect(clientFormat).toHaveProperty('message', 'All fixes verified');
    expect(clientFormat).toHaveProperty('summary');
    expect(clientFormat).toHaveProperty('fixes');
    expect(clientFormat.fixes).toHaveLength(2);
    expect(clientFormat.fixes[1]).toHaveProperty('improvementPercentage', 15);
  });
});

describe('ComparisonMetric', () => {
  test('Constructor initializes with provided values', () => {
    const metric = new ComparisonMetric({
      name: 'Test Metric',
      beforeValue: 100,
      afterValue: 80,
      unit: 'ms',
      higherIsBetter: false,
      threshold: 10
    });
    
    expect(metric.name).toBe('Test Metric');
    expect(metric.beforeValue).toBe(100);
    expect(metric.afterValue).toBe(80);
    expect(metric.unit).toBe('ms');
    expect(metric.higherIsBetter).toBe(false);
    expect(metric.threshold).toBe(10);
  });
  
  test('calculateAbsoluteChange computes correct difference', () => {
    const metric = new ComparisonMetric({
      name: 'Test Metric',
      beforeValue: 100,
      afterValue: 80
    });
    
    expect(metric.absoluteChange).toBe(-20);
  });
  
  test('calculatePercentageChange computes correct percentage', () => {
    const metric = new ComparisonMetric({
      name: 'Test Metric',
      beforeValue: 100,
      afterValue: 80
    });
    
    expect(metric.percentageChange).toBe(-20);
  });
  
  test('calculatePercentageChange handles zero division', () => {
    const metric = new ComparisonMetric({
      name: 'Test Metric',
      beforeValue: 0,
      afterValue: 10
    });
    
    expect(metric.percentageChange).toBe(100);
  });
  
  test('determineImprovement correctly identifies improvement when higher is better', () => {
    const improvedMetric = new ComparisonMetric({
      name: 'Higher Better',
      beforeValue: 80,
      afterValue: 100,
      higherIsBetter: true
    });
    
    const worseMetric = new ComparisonMetric({
      name: 'Higher Better',
      beforeValue: 100,
      afterValue: 80,
      higherIsBetter: true
    });
    
    expect(improvedMetric.improved).toBe(true);
    expect(worseMetric.improved).toBe(false);
  });
  
  test('determineImprovement correctly identifies improvement when lower is better', () => {
    const improvedMetric = new ComparisonMetric({
      name: 'Lower Better',
      beforeValue: 100,
      afterValue: 80,
      higherIsBetter: false
    });
    
    const worseMetric = new ComparisonMetric({
      name: 'Lower Better',
      beforeValue: 80,
      afterValue: 100,
      higherIsBetter: false
    });
    
    expect(improvedMetric.improved).toBe(true);
    expect(worseMetric.improved).toBe(false);
  });
  
  test('checkThreshold correctly determines if improvement meets threshold', () => {
    // Higher is better, meets threshold
    const metric1 = new ComparisonMetric({
      name: 'Higher Better',
      beforeValue: 100,
      afterValue: 120,
      higherIsBetter: true,
      threshold: 10
    });
    
    // Higher is better, below threshold
    const metric2 = new ComparisonMetric({
      name: 'Higher Better',
      beforeValue: 100,
      afterValue: 105,
      higherIsBetter: true,
      threshold: 10
    });
    
    // Lower is better, meets threshold
    const metric3 = new ComparisonMetric({
      name: 'Lower Better',
      beforeValue: 100,
      afterValue: 80,
      higherIsBetter: false,
      threshold: 10
    });
    
    // Lower is better, below threshold
    const metric4 = new ComparisonMetric({
      name: 'Lower Better',
      beforeValue: 100,
      afterValue: 95,
      higherIsBetter: false,
      threshold: 10
    });
    
    expect(metric1.meetsThreshold).toBe(true);
    expect(metric2.meetsThreshold).toBe(false);
    expect(metric3.meetsThreshold).toBe(true);
    expect(metric4.meetsThreshold).toBe(false);
  });
  
  test('formatDisplay returns formatted string', () => {
    const metric = new ComparisonMetric({
      name: 'Test Metric',
      beforeValue: 100,
      afterValue: 80,
      unit: 'ms',
      higherIsBetter: false,
      threshold: 10
    });
    
    const formattedString = metric.formatDisplay();
    
    expect(formattedString).toContain('Test Metric');
    expect(formattedString).toContain('100ms');
    expect(formattedString).toContain('80ms');
    expect(formattedString).toContain('-20.00%');
    expect(formattedString).toContain('improved');
    expect(formattedString).toContain('✅');
    expect(formattedString).toContain('meets threshold');
  });
});
