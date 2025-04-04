/**
 * SEOAutomate - Git Integration Module
 * 
 * This module provides a wrapper around Git operations for SEOAutomate.
 * It handles repository operations for client websites and manages changes
 * made by the automation tools with proper versioning and tracking.
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../../api/src/utils/logger');

/**
 * Git Wrapper class for handling Git operations
 */
class GitWrapper {
  /**
   * Initialize a new GitWrapper
   * @param {string} repoPath - Path to the repository
   * @param {object} options - Configuration options
   */
  constructor(repoPath, options = {}) {
    this.repoPath = repoPath;
    this.options = {
      author: options.author || 'SEOAutomate <automation@seoautomate.com>',
      defaultBranch: options.defaultBranch || 'main',
      remote: options.remote || 'origin',
      timeout: options.timeout || 60000, // 1 minute timeout for operations
      ...options
    };
  }

  /**
   * Execute a git command
   * @param {string} command - Git command to execute
   * @returns {Promise<string>} - Command output
   */
  async execute(command) {
    return new Promise((resolve, reject) => {
      exec(
        `git ${command}`,
        { cwd: this.repoPath, timeout: this.options.timeout },
        (error, stdout, stderr) => {
          if (error) {
            logger.error(`Git error: ${error.message}`);
            return reject(error);
          }
          
          if (stderr && !stderr.includes('warning:')) {
            logger.warn(`Git stderr: ${stderr}`);
          }
          
          resolve(stdout.trim());
        }
      );
    });
  }

  /**
   * Initialize a new git repository
   * @returns {Promise<string>} - Command output
   */
  async init() {
    try {
      await this.execute('init');
      await this.execute(`config user.name "${this.options.author.split('<')[0].trim()}"`);
      await this.execute(`config user.email "${this.options.author.split('<')[1].replace('>', '')}"`);
      await this.execute(`checkout -b ${this.options.defaultBranch}`);
      
      return `Initialized Git repository at ${this.repoPath}`;
    } catch (error) {
      logger.error('Failed to initialize Git repository', error);
      throw error;
    }
  }

  /**
   * Clone a repository
   * @param {string} url - Repository URL
   * @returns {Promise<string>} - Command output
   */
  async clone(url) {
    try {
      // Create directory if it doesn't exist
      await fs.mkdir(this.repoPath, { recursive: true });
      
      return await this.execute(`clone ${url} ${this.repoPath}`);
    } catch (error) {
      logger.error(`Failed to clone repository from ${url}`, error);
      throw error;
    }
  }

  /**
   * Check if a directory is a git repository
   * @returns {Promise<boolean>} - True if directory is a git repository
   */
  async isGitRepository() {
    try {
      await this.execute('rev-parse --is-inside-work-tree');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get repository status
   * @returns {Promise<string>} - Repository status
   */
  async status() {
    return await this.execute('status');
  }

  /**
   * Stage files for commit
   * @param {string|string[]} files - File(s) to stage (or '.' for all)
   * @returns {Promise<string>} - Command output
   */
  async add(files = '.') {
    const fileList = Array.isArray(files) ? files.join(' ') : files;
    return await this.execute(`add ${fileList}`);
  }

  /**
   * Commit changes
   * @param {string} message - Commit message
   * @param {Object} metadata - Additional metadata for the commit message
   * @returns {Promise<string>} - Command output
   */
  async commit(message, metadata = {}) {
    // Format metadata as JSON string in the commit message if provided
    let fullMessage = message;
    
    if (Object.keys(metadata).length > 0) {
      const metadataJson = JSON.stringify(metadata);
      fullMessage = `${message}\n\nSEOAutomate-Metadata: ${metadataJson}`;
    }
    
    return await this.execute(`commit -m "${fullMessage}"`);
  }

  /**
   * Create a new branch
   * @param {string} branchName - Name of the branch
   * @param {string} baseBranch - Base branch to create from
   * @returns {Promise<string>} - Command output
   */
  async createBranch(branchName, baseBranch = null) {
    if (baseBranch) {
      await this.execute(`checkout ${baseBranch}`);
    }
    
    return await this.execute(`checkout -b ${branchName}`);
  }

  /**
   * Switch to a branch
   * @param {string} branchName - Branch to switch to
   * @returns {Promise<string>} - Command output
   */
  async checkout(branchName) {
    return await this.execute(`checkout ${branchName}`);
  }

  /**
   * Pull changes from remote
   * @param {string} branch - Branch to pull
   * @returns {Promise<string>} - Command output
   */
  async pull(branch = null) {
    const branchArg = branch ? ` ${this.options.remote} ${branch}` : '';
    return await this.execute(`pull${branchArg}`);
  }

  /**
   * Push changes to remote
   * @param {string} branch - Branch to push
   * @returns {Promise<string>} - Command output
   */
  async push(branch = null) {
    const branchArg = branch ? ` ${this.options.remote} ${branch}` : '';
    return await this.execute(`push${branchArg}`);
  }

  /**
   * Get commit history
   * @param {number} limit - Maximum number of commits to retrieve
   * @returns {Promise<Array>} - Array of commit objects
   */
  async log(limit = 10) {
    const output = await this.execute(
      `log -${limit} --pretty=format:"%H|%an|%ae|%at|%s"`
    );
    
    return output.split('\n').map(line => {
      const [hash, author, email, timestamp, subject] = line.split('|');
      return {
        hash,
        author,
        email,
        date: new Date(parseInt(timestamp) * 1000),
        subject
      };
    });
  }

  /**
   * Get file difference between commits
   * @param {string} fromCommit - Starting commit hash
   * @param {string} toCommit - Ending commit hash (or HEAD)
   * @returns {Promise<Array>} - Array of changed files
   */
  async diff(fromCommit, toCommit = 'HEAD') {
    const output = await this.execute(`diff --name-status ${fromCommit} ${toCommit}`);
    
    return output.split('\n').map(line => {
      const [status, file] = line.split('\t');
      return { status, file };
    }).filter(item => item.file); // Filter out empty entries
  }

  /**
   * Create a tag
   * @param {string} tagName - Name of the tag
   * @param {string} message - Tag message
   * @returns {Promise<string>} - Command output
   */
  async tag(tagName, message) {
    return await this.execute(`tag -a ${tagName} -m "${message}"`);
  }
  
  /**
   * Reset to a specific commit
   * @param {string} commit - Commit hash to reset to
   * @param {string} mode - Reset mode (soft, mixed, hard)
   * @returns {Promise<string>} - Command output
   */
  async reset(commit = 'HEAD', mode = 'mixed') {
    return await this.execute(`reset --${mode} ${commit}`);
  }

  /**
   * Detect if there are conflicts
   * @returns {Promise<boolean>} - True if conflicts exist
   */
  async hasConflicts() {
    const status = await this.status();
    return status.includes('Unmerged paths') || status.includes('both modified');
  }

  /**
   * Get list of conflicted files
   * @returns {Promise<Array>} - Array of conflicted files
   */
  async getConflictedFiles() {
    if (!(await this.hasConflicts())) {
      return [];
    }
    
    const output = await this.execute('diff --name-only --diff-filter=U');
    return output.split('\n').filter(file => file.trim());
  }
}

module.exports = GitWrapper;
