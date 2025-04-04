/**
 * A/B Testing Framework Tests
 * 
 * Tests for the A/B Testing Framework components and functionality.
 * 
 * Last updated: April 4, 2025
 */

const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const abTesting = require('../index');
const { validateConfig } = require('../utils/validators');
const { calculateTestDuration } = require('../utils/test-utils');

describe('A/B Testing Framework', () => {
  // Mock data for tests
  const mockTestConfig = {
    name: 'Test SEO Headings',
    description: 'Testing different heading structures for SEO impact',
    siteId: 'site123',
    metrics: {
      primary: 'seoScore',
      secondary: ['pageSpeed', 'coreWebVitals.lcp']
    },
    duration: 14,
    confidenceThreshold: 0.95,
    variants: [
      {
        name: 'Control',
        description: 'Current heading structure',
        type: 'control',
        trafficAllocation: 0.5,
        changes: []
      },
      {
        name: 'Variant A',
        description: 'New heading structure with schema markup',
        type: 'variant',
        trafficAllocation: 0.5,
        changes: [
          {
            element: 'H1 Tag',
            type: 'content',
            path: '/index.html',
            original: '<h1>Welcome to Our Site</h1>',
            modified: '<h1>SEO Optimized Home Page</h1>'
          }
        ]
      }
    ]
  };
  
  // Setup and teardown
  before(async () => {
    // Setup mocks for database and dependencies
    sinon.stub(mongoose, 'model').returns({
      findOne: sinon.stub().returns({
        lean: sinon.stub().resolves(null),
        save: sinon.stub().resolves({})
      }),
      find: sinon.stub().returns({
        sort: sinon.stub().returns({
          limit: sinon.stub().returns({
            lean: sinon.stub().resolves([])
          })
        })
      }),
      aggregate: sinon.stub().resolves([])
    });
    
    sinon.stub(mongoose, 'Schema').returns({
      index: sinon.stub().returns({})
    });
  });
  
  after(() => {
    // Restore stubs
    sinon.restore();
  });
  
  // Tests for validators
  describe('Validators', () => {
    it('should validate a valid test configuration', () => {
      expect(() => validateConfig(mockTestConfig, 'test')).to.not.throw();
    });
    
    it('should reject a test configuration without a name', () => {
      const invalidConfig = { ...mockTestConfig, name: '' };
      expect(() => validateConfig(invalidConfig, 'test')).to.throw(/Missing required field/);
    });
    
    it('should reject a test configuration without a primary metric', () => {
      const invalidConfig = { 
        ...mockTestConfig, 
        metrics: { secondary: ['pageSpeed'] } 
      };
      expect(() => validateConfig(invalidConfig, 'test')).to.throw(/must specify a primary metric/);
    });
    
    it('should reject a variant configuration without a name', () => {
      const invalidVariant = { type: 'variant', trafficAllocation: 0.5 };
      expect(() => validateConfig(invalidVariant, 'variant')).to.throw(/Missing required field/);
    });
  });
  
  // Tests for utility functions
  describe('Test Utilities', () => {
    it('should calculate a default test duration when traffic data is unavailable', () => {
      const duration = calculateTestDuration({});
      expect(duration).to.equal(14); // Default 2 weeks
    });
    
    it('should calculate a test duration based on expected traffic', () => {
      const duration = calculateTestDuration({
        expectedTraffic: 100, // 100 visitors per day
        variants: [{ name: 'Control' }, { name: 'Variant A' }],
        minimumDetectableEffect: 0.2, // 20% improvement
        statisticalPower: 0.8 // 80% power
      });
      
      expect(duration).to.be.a('number');
      expect(duration).to.be.greaterThan(0);
    });
  });
  
  // Tests for main module functions
  describe('Main Module', () => {
    // Mock dependencies
    let createTestDefinitionStub;
    let createVariantStub;
    
    beforeEach(() => {
      // Create stubs
      createTestDefinitionStub = sinon.stub().resolves({ 
        id: 'test123', 
        name: 'Test SEO Headings',
        status: 'created'
      });
      createTestDefinitionStub.getById = sinon.stub().resolves({
        id: 'test123',
        name: 'Test SEO Headings',
        status: 'running'
      });
      
      createVariantStub = sinon.stub().resolves({ 
        id: 'variant123', 
        name: 'Variant A' 
      });
      createVariantStub.getByTestId = sinon.stub().resolves([
        { id: 'control123', name: 'Control', type: 'control' },
        { id: 'variant123', name: 'Variant A', type: 'variant' }
      ]);
      
      // Replace implementation
      abTesting.components.createTestDefinition = createTestDefinitionStub;
      abTesting.components.createVariant = createVariantStub;
    });
    
    it('should create a new A/B test', async () => {
      const result = await abTesting.createTest(mockTestConfig);
      
      expect(result).to.be.an('object');
      expect(result).to.have.property('id', 'test123');
      expect(result).to.have.property('status', 'created');
      expect(createTestDefinitionStub.calledOnce).to.be.true;
      expect(createVariantStub.calledTwice).to.be.true; // For control and variant
    });
    
    it('should get the status of an A/B test', async () => {
      const result = await abTesting.getTestStatus('test123');
      
      expect(result).to.be.an('object');
      expect(result).to.have.property('id', 'test123');
      expect(result).to.have.property('status', 'running');
      expect(createTestDefinitionStub.getById.calledOnce).to.be.true;
      expect(createVariantStub.getByTestId.calledOnce).to.be.true;
    });
  });
  
  // Integration-style tests
  describe('Integration', () => {
    // These would be more extensive in a real test suite
    it('should handle the entire test lifecycle', async () => {
      // This would be a comprehensive test of create -> start -> analyze -> stop
      // For now, we'll just ensure the functions exist
      expect(abTesting.createTest).to.be.a('function');
      expect(abTesting.getTestStatus).to.be.a('function');
      expect(abTesting.stopTest).to.be.a('function');
      expect(abTesting.components.analyzeSplitTestData).to.exist;
    });
  });
});
