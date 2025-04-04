/**
 * Mobile Optimization Module Tests
 * 
 * Tests the functionality of the mobile optimization module.
 */

const { expect } = require('chai');
const sinon = require('sinon');
const mobileOptimization = require('../index');
const ViewportConfigAnalyzer = require('../analyzers/viewport-config');
const TouchElementValidator = require('../analyzers/touch-elements');
const ResponsiveDesignTester = require('../analyzers/responsive-design');
const MobilePerformanceMeasurer = require('../analyzers/mobile-performance');

describe('Mobile Optimization Module', () => {
  let sandbox;
  
  beforeEach(() => {
    // Create a sandbox for stubs
    sandbox = sinon.createSandbox();
    
    // Stub the individual analyzers so we don't actually hit websites during tests
    sandbox.stub(ViewportConfigAnalyzer, 'analyze').resolves({
      score: 85,
      issues: [
        {
          id: '123',
          title: 'Missing viewport-fit for Notched Devices',
          description: 'The viewport meta tag does not include viewport-fit.',
          severity: 'low',
          category: 'viewport-configuration'
        }
      ],
      summary: {
        hasViewportMeta: true,
        hasProperConfiguration: true
      }
    });
    
    sandbox.stub(TouchElementValidator, 'validate').resolves({
      score: 70,
      issues: [
        {
          id: '456',
          title: 'Touch Elements Too Small',
          description: 'Found 5 interactive elements that are smaller than the recommended minimum size.',
          severity: 'medium',
          category: 'touch-elements'
        }
      ],
      summary: {
        totalElements: 20,
        tooSmallCount: 5
      }
    });
    
    sandbox.stub(ResponsiveDesignTester, 'test').resolves({
      score: 90,
      issues: [
        {
          id: '789',
          title: 'Limited Use of Responsive Images',
          description: 'Few images use srcset or responsive techniques.',
          severity: 'low',
          category: 'responsive-design'
        }
      ],
      summary: {
        devicesChecked: 5,
        usesMediaQueries: true
      }
    });
    
    sandbox.stub(MobilePerformanceMeasurer, 'measure').resolves({
      score: 75,
      issues: [
        {
          id: '012',
          title: 'Slow Largest Contentful Paint (LCP)',
          description: 'LCP is slow on mobile devices.',
          severity: 'high',
          category: 'mobile-performance'
        }
      ],
      summary: {
        coreWebVitals: {
          lcp: 3500,
          cls: 0.15
        },
        isOptimizedForMobile: false
      }
    });
  });
  
  afterEach(() => {
    // Restore the stubs
    sandbox.restore();
  });
  
  describe('runMobileOptimizationAudit', () => {
    it('should run a mobile optimization audit and return results', async () => {
      const url = 'https://example.com';
      const results = await mobileOptimization.runMobileOptimizationAudit(url);
      
      // Verify the audit ran correctly
      expect(results).to.be.an('object');
      expect(results.url).to.equal(url);
      expect(results.scores).to.be.an('object');
      expect(results.issues).to.be.an('array');
      
      // Check that all components were called
      expect(ViewportConfigAnalyzer.analyze.calledOnce).to.be.true;
      expect(TouchElementValidator.validate.calledOnce).to.be.true;
      expect(ResponsiveDesignTester.test.calledOnce).to.be.true;
      expect(MobilePerformanceMeasurer.measure.calledOnce).to.be.true;
      
      // Check that the issues from all analyzers were aggregated
      expect(results.issues.length).to.equal(4);
      
      // Check that an overall score was calculated
      expect(results.scores.overall).to.be.a('number');
      expect(results.scores.overall).to.be.above(0);
      expect(results.scores.overall).to.be.below(101);
    });
    
    it('should respect the checks option to only run specific checks', async () => {
      const url = 'https://example.com';
      const results = await mobileOptimization.runMobileOptimizationAudit(url, {
        checks: {
          viewportConfig: true,
          touchElements: false,
          responsiveDesign: true,
          mobilePerformance: false
        }
      });
      
      // Verify only the specified checks were run
      expect(ViewportConfigAnalyzer.analyze.calledOnce).to.be.true;
      expect(TouchElementValidator.validate.called).to.be.false;
      expect(ResponsiveDesignTester.test.calledOnce).to.be.true;
      expect(MobilePerformanceMeasurer.measure.called).to.be.false;
      
      // We should only have issues from viewportConfig and responsiveDesign
      expect(results.issues.length).to.equal(2);
    });
  });
  
  describe('generateReport', () => {
    it('should generate a report from audit results', async () => {
      const url = 'https://example.com';
      const auditResults = await mobileOptimization.runMobileOptimizationAudit(url);
      const report = mobileOptimization.generateReport(auditResults);
      
      // Verify the report was generated correctly
      expect(report).to.be.an('object');
      expect(report.meta).to.be.an('object');
      expect(report.scores).to.be.an('object');
      expect(report.summary).to.be.an('object');
      expect(report.issues).to.be.an('array');
      expect(report.actionPlan).to.be.an('object');
    });
  });
});
