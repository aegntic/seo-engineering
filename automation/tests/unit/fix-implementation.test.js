/**
 * Fix Implementation Module Tests
 * 
 * Unit tests for the fix implementation module.
 * 
 * Last updated: April 4, 2025
 */

const { expect } = require('chai');
const sinon = require('sinon');
const { mockLogger, mockGitIntegration } = require('../utils/test-utils');
const fixImplementation = require('../../fix-implementation');
const gitIntegration = require('../../git-integration');

describe('Fix Implementation Module', () => {
  let loggerStubs;
  let gitStubs;
  
  beforeEach(() => {
    // Mock logger
    loggerStubs = mockLogger();
    
    // Mock git integration
    gitStubs = mockGitIntegration();
    
    // Stub methods on the actual git integration module
    sinon.stub(gitIntegration, 'getFileContent').callsFake(gitStubs.getFileContent);
    sinon.stub(gitIntegration, 'implementChange').callsFake(gitStubs.implementChange);
    sinon.stub(gitIntegration, 'rollbackChange').callsFake(gitStubs.rollbackChange);
  });
  
  afterEach(() => {
    sinon.restore();
  });
  
  describe('generateFixes', () => {
    it('should generate fixes for common issues', async () => {
      const issues = [
        {
          id: 'issue-1',
          type: 'meta_description',
          severity: 'high',
          url: 'https://example.com',
          message: 'Missing meta description',
          fixable: true
        },
        {
          id: 'issue-2',
          type: 'heading_structure',
          severity: 'medium',
          url: 'https://example.com',
          message: 'Improper heading structure',
          fixable: true
        },
        {
          id: 'issue-3',
          type: 'broken_link',
          severity: 'high',
          url: 'https://example.com/broken',
          message: 'Broken internal link',
          fixable: false
        }
      ];
      
      const fixes = await fixImplementation.generateFixes(issues);
      
      expect(fixes).to.be.an('array');
      expect(fixes.length).to.be.at.least(2); // Only fixable issues
      expect(fixes[0].issueId).to.equal('issue-1');
      expect(fixes[1].issueId).to.equal('issue-2');
      expect(fixes.find(fix => fix.issueId === 'issue-3')).to.be.undefined;
    });
    
    it('should handle empty issues array', async () => {
      const fixes = await fixImplementation.generateFixes([]);
      
      expect(fixes).to.be.an('array');
      expect(fixes.length).to.equal(0);
    });
    
    it('should not generate fixes for unfixable issues', async () => {
      const issues = [
        {
          id: 'issue-1',
          type: 'broken_link',
          severity: 'high',
          url: 'https://example.com/broken',
          message: 'Broken external link',
          fixable: false
        }
      ];
      
      const fixes = await fixImplementation.generateFixes(issues);
      
      expect(fixes).to.be.an('array');
      expect(fixes.length).to.equal(0);
    });
  });
  
  describe('implementFixes', () => {
    it('should implement fixes and return results', async () => {
      const fixes = [
        {
          id: 'fix-1',
          issueId: 'issue-1',
          type: 'meta_description',
          path: '/index.html',
          changes: {
            original: '<meta name="description" content="">',
            modified: '<meta name="description" content="New description">'
          }
        },
        {
          id: 'fix-2',
          issueId: 'issue-2',
          type: 'heading_structure',
          path: '/index.html',
          changes: {
            original: '<h1>Welcome</h1><h3>Subtitle</h3>',
            modified: '<h1>Welcome</h1><h2>Subtitle</h2>'
          }
        }
      ];
      
      const result = await fixImplementation.implementFixes(fixes, 'site-123');
      
      expect(result).to.exist;
      expect(result.appliedFixes).to.be.an('array');
      expect(result.appliedFixes.length).to.equal(2);
      expect(result.appliedFixes[0].id).to.equal('fix-1');
      expect(result.appliedFixes[1].id).to.equal('fix-2');
      expect(gitStubs.implementChange.calledTwice).to.be.true;
    });
    
    it('should handle partial success with some failed fixes', async () => {
      // Make the second fix fail
      gitStubs.implementChange.onFirstCall().resolves({ 
        success: true, 
        commitHash: '1234567890abcdef' 
      });
      gitStubs.implementChange.onSecondCall().rejects(new Error('Failed to modify file'));
      
      const fixes = [
        {
          id: 'fix-1',
          issueId: 'issue-1',
          type: 'meta_description',
          path: '/index.html',
          changes: {
            original: '<meta name="description" content="">',
            modified: '<meta name="description" content="New description">'
          }
        },
        {
          id: 'fix-2',
          issueId: 'issue-2',
          type: 'heading_structure',
          path: '/index.html',
          changes: {
            original: '<h1>Welcome</h1><h3>Subtitle</h3>',
            modified: '<h1>Welcome</h1><h2>Subtitle</h2>'
          }
        }
      ];
      
      const result = await fixImplementation.implementFixes(fixes, 'site-123');
      
      expect(result).to.exist;
      expect(result.appliedFixes).to.be.an('array');
      expect(result.appliedFixes.length).to.equal(1);
      expect(result.appliedFixes[0].id).to.equal('fix-1');
      expect(result.failedFixes).to.be.an('array');
      expect(result.failedFixes.length).to.equal(1);
      expect(result.failedFixes[0].id).to.equal('fix-2');
      expect(loggerStubs.warn.called).to.be.true;
    });
    
    it('should handle empty fixes array', async () => {
      const result = await fixImplementation.implementFixes([], 'site-123');
      
      expect(result).to.exist;
      expect(result.appliedFixes).to.be.an('array');
      expect(result.appliedFixes.length).to.equal(0);
      expect(result.failedFixes).to.be.an('array');
      expect(result.failedFixes.length).to.equal(0);
      expect(gitStubs.implementChange.called).to.be.false;
    });
  });
  
  describe('rollbackFixes', () => {
    it('should rollback fixes and return results', async () => {
      const fixes = [
        {
          id: 'fix-1',
          issueId: 'issue-1',
          type: 'meta_description',
          path: '/index.html',
          changes: {
            original: '<meta name="description" content="">',
            modified: '<meta name="description" content="New description">'
          },
          commitHash: '1234567890abcdef'
        }
      ];
      
      const result = await fixImplementation.rollbackFixes(fixes, 'site-123');
      
      expect(result).to.exist;
      expect(result.success).to.be.true;
      expect(result.rolledBackFixes).to.be.an('array');
      expect(result.rolledBackFixes.length).to.equal(1);
      expect(result.rolledBackFixes[0].id).to.equal('fix-1');
      expect(gitStubs.rollbackChange.calledOnce).to.be.true;
    });
    
    it('should handle fixes without commit hashes', async () => {
      const fixes = [
        {
          id: 'fix-1',
          issueId: 'issue-1',
          type: 'meta_description',
          path: '/index.html',
          changes: {
            original: '<meta name="description" content="">',
            modified: '<meta name="description" content="New description">'
          }
          // No commitHash
        }
      ];
      
      const result = await fixImplementation.rollbackFixes(fixes, 'site-123');
      
      expect(result).to.exist;
      expect(result.success).to.be.true;
      expect(result.rolledBackFixes).to.be.an('array');
      expect(result.rolledBackFixes.length).to.equal(0);
      expect(result.skippedFixes).to.be.an('array');
      expect(result.skippedFixes.length).to.equal(1);
      expect(gitStubs.rollbackChange.called).to.be.false;
      expect(loggerStubs.warn.called).to.be.true;
    });
    
    it('should handle rollback failures', async () => {
      gitStubs.rollbackChange.rejects(new Error('Failed to rollback change'));
      
      const fixes = [
        {
          id: 'fix-1',
          issueId: 'issue-1',
          type: 'meta_description',
          path: '/index.html',
          changes: {
            original: '<meta name="description" content="">',
            modified: '<meta name="description" content="New description">'
          },
          commitHash: '1234567890abcdef'
        }
      ];
      
      const result = await fixImplementation.rollbackFixes(fixes, 'site-123');
      
      expect(result).to.exist;
      expect(result.success).to.be.false;
      expect(result.rolledBackFixes).to.be.an('array');
      expect(result.rolledBackFixes.length).to.equal(0);
      expect(result.failedRollbacks).to.be.an('array');
      expect(result.failedRollbacks.length).to.equal(1);
      expect(gitStubs.rollbackChange.calledOnce).to.be.true;
      expect(loggerStubs.error.called).to.be.true;
    });
  });
});
