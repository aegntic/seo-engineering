/**
 * SEOAutomate - Git Integration Tests
 * 
 * Jest test suite for the Git integration module.
 */

const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const { ChangeTracker, ChangeType } = require('../change-tracker');
const GitWrapper = require('../git-wrapper');
const gitIntegration = require('../index');

// Create a temporary directory for test repositories
const TEST_DIR = path.join(os.tmpdir(), `seoautomate-git-test-${Date.now()}`);

// Setup and cleanup functions
beforeAll(async () => {
  await fs.mkdir(TEST_DIR, { recursive: true });
});

afterAll(async () => {
  await fs.rm(TEST_DIR, { recursive: true, force: true });
});

describe('GitWrapper', () => {
  const repoPath = path.join(TEST_DIR, 'git-wrapper-test');
  let git;

  beforeAll(async () => {
    await fs.mkdir(repoPath, { recursive: true });
    git = new GitWrapper(repoPath);
  });

  test('should initialize a git repository', async () => {
    const result = await git.init();
    expect(result).toContain('Initialized Git repository');
  });

  test('should add and commit changes', async () => {
    // Create a test file
    const testFile = path.join(repoPath, 'test.txt');
    await fs.writeFile(testFile, 'Test content');
    
    // Add the file
    await git.add(testFile);
    
    // Commit the change
    const commitResult = await git.commit('Test commit');
    expect(commitResult).toContain('Test commit');
    
    // Check the log
    const logs = await git.log(1);
    expect(logs).toHaveLength(1);
    expect(logs[0].subject).toBe('Test commit');
  });

  test('should create and switch branches', async () => {
    // Create a new branch
    await git.createBranch('test-branch');
    
    // Create a file on the new branch
    const branchFile = path.join(repoPath, 'branch-file.txt');
    await fs.writeFile(branchFile, 'Branch content');
    
    // Add and commit
    await git.add(branchFile);
    await git.commit('Branch commit');
    
    // Switch back to main branch
    await git.checkout('master');
    
    // Verify branch file doesn't exist on main
    try {
      await fs.access(branchFile);
      fail('Branch file should not exist on main branch');
    } catch (e) {
      expect(e.code).toBe('ENOENT');
    }
    
    // Switch back to test branch
    await git.checkout('test-branch');
    
    // Verify branch file exists again
    const fileContent = await fs.readFile(branchFile, 'utf8');
    expect(fileContent).toBe('Branch content');
  });
});

describe('ChangeTracker', () => {
  const siteId = 'test-site';
  const repoPath = path.join(TEST_DIR, 'change-tracker-test');
  let tracker;

  beforeAll(async () => {
    await fs.mkdir(repoPath, { recursive: true });
    tracker = new ChangeTracker(siteId, repoPath);
    await tracker.initialize(true);
  });

  test('should start a change batch', async () => {
    const batchId = 'test-batch-1';
    const branchName = await tracker.startChangeBatch(batchId, 'Test change batch');
    
    expect(branchName).toBe(`seo-fix-${batchId}`);
    
    // Verify metadata file exists
    const metadataPath = path.join(repoPath, '.seoautomate-batch.json');
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
    
    expect(metadata.batchId).toBe(batchId);
    expect(metadata.description).toBe('Test change batch');
    expect(metadata.siteId).toBe(siteId);
    expect(metadata.changes).toHaveLength(0);
  });

  test('should record changes in a batch', async () => {
    // Create a test file
    const testFile = path.join(repoPath, 'index.html');
    await fs.writeFile(testFile, '<html><head><title>Test</title></head><body></body></html>');
    
    // Record the change
    await tracker.recordChange(testFile, ChangeType.META_TAG, {
      tag: 'title',
      value: 'Test Title'
    });
    
    // Verify metadata was updated
    const metadataPath = path.join(repoPath, '.seoautomate-batch.json');
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
    
    expect(metadata.changes).toHaveLength(1);
    expect(metadata.changes[0].filePath).toBe(testFile);
    expect(metadata.changes[0].changeType).toBe(ChangeType.META_TAG);
    expect(metadata.changes[0].tag).toBe('title');
  });

  test('should finalize a change batch', async () => {
    const batchId = 'test-batch-1';
    const result = await tracker.finalizeChangeBatch(batchId, true);
    
    expect(result.batchId).toBe(batchId);
    expect(result.status).toBe('completed');
    expect(result.changeCount).toBe(1);
    
    // Verify we're on the fixes branch
    const git = new GitWrapper(repoPath);
    const status = await git.status();
    expect(status).toContain('On branch seo-fixes');
  });

  test('should get change history', async () => {
    const history = await tracker.getChangeHistory(10);
    
    expect(history).toHaveLength(3); // init + start batch + finalize batch
    
    // The most recent commit should be the merge
    expect(history[0].subject).toContain('Merge SEO fixes');
  });
});

describe('Git Integration Module', () => {
  test('should create a change tracker', async () => {
    const siteId = 'integration-test-site';
    const tracker = await gitIntegration.createChangeTracker(siteId, path.join(TEST_DIR, siteId));
    
    expect(tracker).toBeInstanceOf(ChangeTracker);
    expect(tracker.siteId).toBe(siteId);
  });

  test('should run an integration test', async () => {
    const result = await gitIntegration.testGitIntegration();
    
    expect(result.success).toBe(true);
    expect(result.message).toBe('Git integration is working properly');
    expect(result.testResults.batchResult.status).toBe('completed');
  });
});
