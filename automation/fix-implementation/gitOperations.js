/**
 * Git Operations Module
 * 
 * Handles all interactions with Git repositories for automated SEO fixes:
 * - Repository cloning and updating
 * - Branch management
 * - Change tracking and committing
 * - Push operations to remote repositories
 */

const path = require('path');
const fs = require('fs/promises');
const { execSync, exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const logger = require('../utils/logger');
const config = require('../../config');

// Base directory for all repositories
const REPOS_BASE_DIR = path.resolve(config.GIT_REPOS_PATH || './repos');

/**
 * Prepares a repository for implementing fixes
 * @param {Object} site - Site data including repository information
 * @returns {Promise<string>} - Path to the prepared repository
 */
async function prepareRepository(site) {
  try {
    if (!site.repository || !site.repository.url) {
      throw new Error('Repository URL is required');
    }
    
    // Create a unique name for this repository
    const repoName = getRepositoryName(site);
    const repoPath = path.join(REPOS_BASE_DIR, repoName);
    
    // Ensure base directory exists
    await fs.mkdir(REPOS_BASE_DIR, { recursive: true });
    
    // Check if repository already exists
    const repoExists = await directoryExists(repoPath);
    
    if (repoExists) {
      logger.info(`Repository exists, updating: ${repoPath}`);
      await updateRepository(repoPath, site);
    } else {
      logger.info(`Cloning repository: ${site.repository.url}`);
      await cloneRepository(site, repoPath);
    }
    
    return repoPath;
  } catch (error) {
    logger.error('Error preparing repository:', error);
    throw new Error(`Failed to prepare repository: ${error.message}`);
  }
}

/**
 * Clones a repository
 * @param {Object} site - Site data with repository information
 * @param {string} repoPath - Path to clone the repository to
 * @returns {Promise<void>}
 */
async function cloneRepository(site, repoPath) {
  const { url, branch = 'main', auth } = site.repository;
  
  let cloneUrl = url;
  
  // Handle authentication if provided
  if (auth) {
    if (auth.type === 'ssh' && auth.key) {
      // Use SSH key (requires SSH key to be set up in the environment)
      // SSH configuration would be handled separately
    } else if (auth.type === 'basic' && auth.username && auth.password) {
      // Use basic auth in URL
      const urlObj = new URL(url);
      urlObj.username = auth.username;
      urlObj.password = auth.password;
      cloneUrl = urlObj.toString();
    } else if (auth.type === 'token' && auth.token) {
      // Use token auth
      const urlObj = new URL(url);
      if (urlObj.protocol === 'https:') {
        urlObj.username = 'oauth2';
        urlObj.password = auth.token;
        cloneUrl = urlObj.toString();
      }
    }
  }
  
  try {
    await execAsync(`git clone ${cloneUrl} ${repoPath}`);
    
    // Checkout the specified branch if it's not the default
    if (branch && branch !== 'main' && branch !== 'master') {
      await execAsync(`git checkout ${branch}`, { cwd: repoPath });
    }
  } catch (error) {
    logger.error(`Git clone failed: ${error.message}`);
    throw new Error(`Repository clone failed: ${error.message}`);
  }
}

/**
 * Updates an existing repository
 * @param {string} repoPath - Path to the repository
 * @param {Object} site - Site data with repository information
 * @returns {Promise<void>}
 */
async function updateRepository(repoPath, site) {
  const { branch = 'main' } = site.repository;
  
  try {
    // Discard any uncommitted changes
    await execAsync('git reset --hard', { cwd: repoPath });
    
    // Make sure we're on the right branch
    await execAsync(`git checkout ${branch}`, { cwd: repoPath });
    
    // Pull latest changes
    await execAsync('git pull', { cwd: repoPath });
  } catch (error) {
    logger.error(`Repository update failed: ${error.message}`);
    throw new Error(`Repository update failed: ${error.message}`);
  }
}

/**
 * Creates a new branch for implementing fixes
 * @param {string} repoPath - Path to the repository
 * @param {string} branchName - Name for the new branch
 * @returns {Promise<string>} - The actual branch name created
 */
async function createFixBranch(repoPath, branchName) {
  // Clean the branch name to ensure it's valid
  const safebranchName = branchName
    .replace(/[^\w\d-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
  
  try {
    // Create and checkout the branch
    await execAsync(`git checkout -b ${safebranchName}`, { cwd: repoPath });
    return safebranchName;
  } catch (error) {
    logger.error(`Branch creation failed: ${error.message}`);
    throw new Error(`Failed to create branch: ${error.message}`);
  }
}

/**
 * Commits changes to the repository
 * @param {string} repoPath - Path to the repository
 * @param {string} message - Commit message
 * @param {Object} metadata - Additional metadata for the commit
 * @returns {Promise<string>} - The commit hash
 */
async function commitChanges(repoPath, message, metadata = {}) {
  try {
    // Add all changes
    await execAsync('git add .', { cwd: repoPath });
    
    // Check if there are changes to commit
    const status = await execAsync('git status --porcelain', { cwd: repoPath });
    if (!status.stdout.trim()) {
      logger.info('No changes to commit');
      return null;
    }
    
    // Format the commit message with metadata
    let fullMessage = message;
    
    if (Object.keys(metadata).length > 0) {
      fullMessage += '\n\n';
      fullMessage += 'Metadata:\n';
      for (const [key, value] of Object.entries(metadata)) {
        if (Array.isArray(value)) {
          fullMessage += `${key}: ${value.join(', ')}\n`;
        } else {
          fullMessage += `${key}: ${value}\n`;
        }
      }
    }
    
    // Commit the changes
    await execAsync(`git commit -m "${fullMessage.replace(/"/g, '\\"')}"`, { cwd: repoPath });
    
    // Get the commit hash
    const { stdout } = await execAsync('git rev-parse HEAD', { cwd: repoPath });
    const commitHash = stdout.trim();
    
    logger.info(`Changes committed: ${commitHash}`);
    return commitHash;
  } catch (error) {
    logger.error(`Commit failed: ${error.message}`);
    throw new Error(`Failed to commit changes: ${error.message}`);
  }
}

/**
 * Pushes changes to the remote repository
 * @param {string} repoPath - Path to the repository
 * @param {string} branchName - Branch to push
 * @returns {Promise<void>}
 */
async function pushChanges(repoPath, branchName) {
  try {
    await execAsync(`git push -u origin ${branchName}`, { cwd: repoPath });
    logger.info(`Changes pushed to origin/${branchName}`);
  } catch (error) {
    logger.error(`Push failed: ${error.message}`);
    throw new Error(`Failed to push changes: ${error.message}`);
  }
}

/**
 * Gets changes between two commits or branches
 * @param {string} repoPath - Path to the repository
 * @param {string} from - Starting commit/branch
 * @param {string} to - Ending commit/branch (default: HEAD)
 * @returns {Promise<Array>} - List of changed files with their status
 */
async function getChanges(repoPath, from, to = 'HEAD') {
  try {
    const { stdout } = await execAsync(`git diff --name-status ${from} ${to}`, { cwd: repoPath });
    
    // Parse the diff output into a structured format
    const changes = stdout
      .trim()
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [status, ...fileParts] = line.split('\t');
        const filePath = fileParts.join('\t'); // Handle filenames with tabs
        
        return {
          status: getChangeStatusDescription(status),
          filePath,
          raw: status
        };
      });
    
    return changes;
  } catch (error) {
    logger.error(`Failed to get changes: ${error.message}`);
    throw new Error(`Failed to get changes: ${error.message}`);
  }
}

/**
 * Creates a unique name for a repository
 * @param {Object} site - Site data
 * @returns {string} - Unique repository name
 */
function getRepositoryName(site) {
  // Extract domain from URL
  let domain;
  try {
    domain = new URL(site.url).hostname;
  } catch (e) {
    domain = site.url.replace(/[^\w\d]/g, '-');
  }
  
  // Create a unique name using domain and site ID
  return `${domain}-${site.id}`.replace(/[^\w\d-]/g, '-');
}

/**
 * Converts Git status code to a human-readable description
 * @param {string} status - Git status code
 * @returns {string} - Human-readable status
 */
function getChangeStatusDescription(status) {
  const statusMap = {
    'A': 'added',
    'M': 'modified',
    'D': 'deleted',
    'R': 'renamed',
    'C': 'copied',
    'U': 'unmerged',
    '?': 'untracked'
  };
  
  const firstChar = status.charAt(0);
  return statusMap[firstChar] || 'unknown';
}

/**
 * Checks if a directory exists
 * @param {string} dirPath - Path to check
 * @returns {Promise<boolean>} - True if directory exists
 */
async function directoryExists(dirPath) {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

module.exports = {
  prepareRepository,
  createFixBranch,
  commitChanges,
  pushChanges,
  getChanges
};