/**
 * SEO.engineering - Change Tracker Module
 * 
 * This module leverages the Git wrapper to track and manage changes made
 * to client websites by the automation tools. It provides a higher-level
 * interface for recording changes with metadata about the SEO fixes.
 */

const GitWrapper = require('./git-wrapper');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../../api/src/utils/logger');

/**
 * Enum for change types
 * @enum {string}
 */
const ChangeType = {
  META_TAG: 'meta_tag',
  IMAGE_OPTIMIZATION: 'image_optimization',
  HEADER_STRUCTURE: 'header_structure',
  SCHEMA_MARKUP: 'schema_markup',
  ROBOTS_TXT: 'robots_txt',
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  OTHER: 'other'
};

/**
 * Change Tracker class for managing website changes
 */
class ChangeTracker {
  /**
   * Initialize a new ChangeTracker
   * @param {string} siteId - Unique identifier for the client site
   * @param {string} repoPath - Path to the site's repository
   * @param {object} options - Configuration options
   */
  constructor(siteId, repoPath, options = {}) {
    this.siteId = siteId;
    this.repoPath = repoPath;
    this.options = {
      branchPrefix: options.branchPrefix || 'seo-fix-',
      fixesBranchName: options.fixesBranchName || 'seo-fixes',
      ...options
    };
    this.git = new GitWrapper(repoPath, options.gitOptions);
  }

  /**
   * Initialize the change tracker for a site
   * @param {boolean} isNewSite - Whether this is a new site
   * @returns {Promise<void>}
   */
  async initialize(isNewSite = false) {
    try {
      if (isNewSite) {
        // For a new site, initialize a new git repository
        await this.git.init();
        logger.info(`Initialized new repository for site ${this.siteId}`);
      } else {
        // For existing site, check if it's a valid git repository
        const isRepo = await this.git.isGitRepository();
        if (!isRepo) {
          throw new Error(`Directory at ${this.repoPath} is not a valid Git repository`);
        }
        logger.info(`Using existing repository for site ${this.siteId}`);
      }

      // Create a branch for SEO fixes if it doesn't exist
      try {
        await this.git.createBranch(this.options.fixesBranchName);
        logger.info(`Created ${this.options.fixesBranchName} branch for site ${this.siteId}`);
      } catch (error) {
        // Branch might already exist, try to check it out
        try {
          await this.git.checkout(this.options.fixesBranchName);
          logger.info(`Switched to existing ${this.options.fixesBranchName} branch for site ${this.siteId}`);
        } catch (checkoutError) {
          logger.error(`Failed to create or checkout fixes branch for site ${this.siteId}`, checkoutError);
          throw checkoutError;
        }
      }
    } catch (error) {
      logger.error(`Failed to initialize change tracker for site ${this.siteId}`, error);
      throw error;
    }
  }

  /**
   * Start a new change batch
   * @param {string} batchId - Unique identifier for this batch of changes
   * @param {string} description - Description of the change batch
   * @returns {Promise<string>} - The branch name
   */
  async startChangeBatch(batchId, description) {
    const branchName = `${this.options.branchPrefix}${batchId}`;
    
    try {
      await this.git.createBranch(branchName, this.options.fixesBranchName);
      logger.info(`Started change batch ${batchId} for site ${this.siteId}`);
      
      // Create a batch metadata file
      const metadata = {
        batchId,
        description,
        siteId: this.siteId,
        startTime: new Date().toISOString(),
        changes: []
      };
      
      await fs.writeFile(
        path.join(this.repoPath, '.seo.engineering-batch.json'),
        JSON.stringify(metadata, null, 2)
      );
      
      await this.git.add('.seo.engineering-batch.json');
      await this.git.commit(`Start SEO fix batch: ${description}`, { batchId });
      
      return branchName;
    } catch (error) {
      logger.error(`Failed to start change batch ${batchId} for site ${this.siteId}`, error);
      throw error;
    }
  }

  /**
   * Record a change to a file
   * @param {string} filePath - Path to the file that was changed
   * @param {ChangeType} changeType - Type of change made
   * @param {object} metadata - Additional metadata about the change
   * @returns {Promise<void>}
   */
  async recordChange(filePath, changeType, metadata = {}) {
    try {
      // Read the current batch metadata
      const metadataPath = path.join(this.repoPath, '.seo.engineering-batch.json');
      const metadataContent = await fs.readFile(metadataPath, 'utf8');
      const batchMetadata = JSON.parse(metadataContent);
      
      // Add this change to the batch
      const change = {
        filePath,
        changeType,
        timestamp: new Date().toISOString(),
        ...metadata
      };
      
      batchMetadata.changes.push(change);
      
      // Write updated metadata
      await fs.writeFile(
        metadataPath,
        JSON.stringify(batchMetadata, null, 2)
      );
      
      // Stage the changed file and metadata
      await this.git.add([filePath, metadataPath]);
      
      // Commit with descriptive message
      const message = this.generateCommitMessage(changeType, filePath, metadata);
      await this.git.commit(message, { 
        changeType, 
        filePath,
        metadata
      });
      
      logger.info(`Recorded ${changeType} change to ${filePath} for site ${this.siteId}`);
    } catch (error) {
      logger.error(`Failed to record change to ${filePath} for site ${this.siteId}`, error);
      throw error;
    }
  }

  /**
   * Generate a commit message based on change type and metadata
   * @param {ChangeType} changeType - Type of change
   * @param {string} filePath - Path to the file
   * @param {object} metadata - Change metadata
   * @returns {string} - Formatted commit message
   */
  generateCommitMessage(changeType, filePath, metadata) {
    const fileName = path.basename(filePath);
    let message = `Fix: `;
    
    switch (changeType) {
      case ChangeType.META_TAG:
        message += `Updated meta tags in ${fileName}`;
        if (metadata.tag) {
          message += ` (${metadata.tag})`;
        }
        break;
        
      case ChangeType.IMAGE_OPTIMIZATION:
        message += `Optimized image ${fileName}`;
        if (metadata.optimization) {
          message += ` (${metadata.optimization})`;
        }
        break;
        
      case ChangeType.HEADER_STRUCTURE:
        message += `Improved header structure in ${fileName}`;
        break;
        
      case ChangeType.SCHEMA_MARKUP:
        message += `Added/updated schema markup in ${fileName}`;
        if (metadata.schemaType) {
          message += ` (${metadata.schemaType})`;
        }
        break;
        
      case ChangeType.ROBOTS_TXT:
        message += `Updated robots.txt`;
        if (metadata.changes) {
          message += ` (${metadata.changes})`;
        }
        break;
        
      case ChangeType.PERFORMANCE:
        message += `Performance improvement in ${fileName}`;
        if (metadata.improvement) {
          message += ` (${metadata.improvement})`;
        }
        break;
        
      case ChangeType.SECURITY:
        message += `Security enhancement in ${fileName}`;
        break;
        
      default:
        message += `Updated ${fileName}`;
        if (metadata.description) {
          message += `: ${metadata.description}`;
        }
    }
    
    return message;
  }

  /**
   * Finalize a change batch
   * @param {string} batchId - Batch ID to finalize
   * @param {boolean} approved - Whether the changes were approved
   * @returns {Promise<object>} - Summary of the batch
   */
  async finalizeChangeBatch(batchId, approved = true) {
    const branchName = `${this.options.branchPrefix}${batchId}`;
    
    try {
      // Make sure we're on the correct branch
      await this.git.checkout(branchName);
      
      // Read the batch metadata
      const metadataPath = path.join(this.repoPath, '.seo.engineering-batch.json');
      const metadataContent = await fs.readFile(metadataPath, 'utf8');
      const batchMetadata = JSON.parse(metadataContent);
      
      // Update the metadata with completion info
      batchMetadata.endTime = new Date().toISOString();
      batchMetadata.approved = approved;
      batchMetadata.status = approved ? 'completed' : 'rejected';
      
      await fs.writeFile(
        metadataPath,
        JSON.stringify(batchMetadata, null, 2)
      );
      
      await this.git.add(metadataPath);
      await this.git.commit(`Finalize SEO fix batch: ${approved ? 'Approved' : 'Rejected'}`, {
        batchId,
        approved,
        status: batchMetadata.status
      });
      
      if (approved) {
        // If approved, merge changes to the fixes branch
        await this.git.checkout(this.options.fixesBranchName);
        
        // Use git merge with the branch name
        await this.git.execute(`merge ${branchName} --no-ff -m "Merge SEO fixes from batch ${batchId}"`);
        
        // Create a tag for this batch
        const tagName = `seo-batch-${batchId}`;
        await this.git.tag(tagName, `SEO fixes batch ${batchId}`);
        
        logger.info(`Finalized and merged change batch ${batchId} for site ${this.siteId}`);
      } else {
        logger.info(`Rejected change batch ${batchId} for site ${this.siteId}`);
      }
      
      return {
        batchId,
        siteId: this.siteId,
        status: batchMetadata.status,
        startTime: batchMetadata.startTime,
        endTime: batchMetadata.endTime,
        changeCount: batchMetadata.changes.length
      };
    } catch (error) {
      logger.error(`Failed to finalize change batch ${batchId} for site ${this.siteId}`, error);
      throw error;
    }
  }

  /**
   * Get the change history for a site
   * @param {number} limit - Maximum number of changes to retrieve
   * @returns {Promise<Array>} - Array of change objects
   */
  async getChangeHistory(limit = 50) {
    try {
      await this.git.checkout(this.options.fixesBranchName);
      
      const commits = await this.git.log(limit);
      
      // Process commits to extract SEO.engineering metadata
      return commits.map(commit => {
        const { hash, author, date, subject } = commit;
        
        // Try to extract metadata from commit message if it exists
        let metadata = {};
        if (subject.includes('SEO.engineering-Metadata:')) {
          try {
            const metadataString = subject.split('SEO.engineering-Metadata:')[1].trim();
            metadata = JSON.parse(metadataString);
          } catch (e) {
            // If parsing fails, just continue with empty metadata
          }
        }
        
        return {
          hash,
          author,
          date,
          subject: subject.split('SEO.engineering-Metadata:')[0].trim(),
          metadata
        };
      });
    } catch (error) {
      logger.error(`Failed to get change history for site ${this.siteId}`, error);
      throw error;
    }
  }

  /**
   * Roll back a specific change batch
   * @param {string} batchId - Batch ID to roll back
   * @returns {Promise<object>} - Result of the rollback
   */
  async rollbackChangeBatch(batchId) {
    try {
      const tagName = `seo-batch-${batchId}`;
      
      // Get the commit hash before the batch
      const output = await this.git.execute(`rev-list -n 1 ${tagName}^`);
      const commitHash = output.trim();
      
      if (!commitHash) {
        throw new Error(`Could not find commit hash for batch ${batchId}`);
      }
      
      // Create a rollback branch
      const rollbackBranch = `rollback-${batchId}`;
      await this.git.createBranch(rollbackBranch, this.options.fixesBranchName);
      
      // Revert the merge commit
      await this.git.execute(`revert -m 1 ${tagName}`);
      
      // Commit the revert
      await this.git.commit(`Rollback SEO fix batch ${batchId}`, {
        batchId,
        action: 'rollback'
      });
      
      // Merge back to fixes branch
      await this.git.checkout(this.options.fixesBranchName);
      await this.git.execute(`merge ${rollbackBranch} --no-ff -m "Merge rollback of batch ${batchId}"`);
      
      // Create a rollback tag
      await this.git.tag(`rollback-${batchId}`, `Rollback of SEO fixes batch ${batchId}`);
      
      logger.info(`Rolled back change batch ${batchId} for site ${this.siteId}`);
      
      return {
        batchId,
        siteId: this.siteId,
        status: 'rolled_back',
        rollbackTime: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Failed to roll back change batch ${batchId} for site ${this.siteId}`, error);
      throw error;
    }
  }
}

// Export the ChangeTracker class and ChangeType enum
module.exports = {
  ChangeTracker,
  ChangeType
};
