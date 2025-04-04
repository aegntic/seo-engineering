/**
 * Fix Engine - Core orchestration module for automated SEO fixes
 * 
 * This module coordinates the entire fix implementation process:
 * 1. Receives issue data from the Analysis Engine
 * 2. Determines appropriate fix strategies
 * 3. Applies fixes through specialized modules
 * 4. Commits changes using Git integration
 * 5. Triggers verification process
 */

const gitOperations = require('./gitOperations');
const metaTagFixer = require('./strategies/metaTagFixer');
const imageOptimizer = require('./strategies/imageOptimizer');
const headerFixer = require('./strategies/headerFixer');
const schemaFixer = require('./strategies/schemaFixer');
const robotsTxtFixer = require('./strategies/robotsTxtFixer');
const siteAdapter = require('./siteAdapter');
const logger = require('../utils/logger');
const { prioritizeIssues } = require('../analysis/prioritizationEngine');

// Strategy map to associate issue types with fixers
const STRATEGY_MAP = {
  'missing-meta-tags': metaTagFixer,
  'duplicate-meta-tags': metaTagFixer,
  'image-optimization': imageOptimizer,
  'header-structure': headerFixer,
  'missing-schema': schemaFixer,
  'incorrect-schema': schemaFixer,
  'robots-txt': robotsTxtFixer
};

/**
 * Executes the fix implementation process for a site
 * @param {Object} site - Site data including repository information
 * @param {Array} issues - Array of issues to fix from the analysis engine
 * @param {Object} options - Configuration options for the fix process
 * @returns {Promise<Object>} - Results of the fix implementation
 */
async function implementFixes(site, issues, options = {}) {
  try {
    logger.info(`Starting fix implementation for site: ${site.url}`);
    
    // Clone or update repository
    const repoPath = await gitOperations.prepareRepository(site);
    
    // Adapt site structure based on CMS or framework
    const siteStructure = await siteAdapter.analyzeSite(repoPath, site.cmsType);
    
    // Prioritize issues if not already prioritized
    const prioritizedIssues = options.prioritized 
      ? issues 
      : await prioritizeIssues(issues, site);
      
    // Track results for each fix
    const results = {
      successful: [],
      failed: [],
      skipped: []
    };
    
    // Group issues by file to minimize file operations
    const issuesByFile = groupIssuesByFile(prioritizedIssues);
    
    // Process issues file by file
    for (const [filePath, fileIssues] of Object.entries(issuesByFile)) {
      try {
        // Create a branch for these fixes
        const branchName = await gitOperations.createFixBranch(
          repoPath, 
          `fix-${fileIssues[0].type}-${Date.now()}`
        );
        
        // Apply fixes to this file
        const fileResults = await applyFixesToFile(
          repoPath, 
          filePath, 
          fileIssues, 
          siteStructure, 
          options
        );
        
        // Update results
        results.successful.push(...fileResults.successful);
        results.failed.push(...fileResults.failed);
        results.skipped.push(...fileResults.skipped);
        
        // If some fixes were successful, commit the changes
        if (fileResults.successful.length > 0) {
          await gitOperations.commitChanges(
            repoPath,
            `Fix ${fileResults.successful.length} SEO issues in ${filePath}`,
            {
              issueIds: fileResults.successful.map(r => r.issue.id),
              issueTypes: [...new Set(fileResults.successful.map(r => r.issue.type))],
              automated: true
            }
          );
          
          // Push changes if configured to do so
          if (options.autoPush) {
            await gitOperations.pushChanges(repoPath, branchName);
          }
        }
      } catch (fileError) {
        logger.error(`Error fixing issues in file ${filePath}:`, fileError);
        // Mark all issues in this file as failed
        fileIssues.forEach(issue => {
          results.failed.push({
            issue,
            error: fileError.message || 'File processing error'
          });
        });
      }
    }
    
    // Generate summary
    const summary = {
      site: site.url,
      totalIssues: issues.length,
      fixedCount: results.successful.length,
      failedCount: results.failed.length,
      skippedCount: results.skipped.length,
      timestamp: new Date().toISOString()
    };
    
    logger.info(`Fix implementation completed for site: ${site.url}`, summary);
    
    return {
      summary,
      results
    };
  } catch (error) {
    logger.error(`Fix implementation failed for site: ${site.url}`, error);
    throw error;
  }
}

/**
 * Groups issues by the file they affect
 * @param {Array} issues - Array of issues to fix
 * @returns {Object} - Map of file paths to arrays of issues
 */
function groupIssuesByFile(issues) {
  const issuesByFile = {};
  
  issues.forEach(issue => {
    if (!issue.filePath) {
      logger.warn(`Issue missing filePath, skipping: ${issue.id}`);
      return;
    }
    
    if (!issuesByFile[issue.filePath]) {
      issuesByFile[issue.filePath] = [];
    }
    
    issuesByFile[issue.filePath].push(issue);
  });
  
  return issuesByFile;
}

/**
 * Applies fixes to a specific file
 * @param {string} repoPath - Path to the repository
 * @param {string} filePath - Path to the file within the repository
 * @param {Array} issues - Issues affecting this file
 * @param {Object} siteStructure - Analysis of the site structure
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} - Results of the fix operations
 */
async function applyFixesToFile(repoPath, filePath, issues, siteStructure, options) {
  const results = {
    successful: [],
    failed: [],
    skipped: []
  };
  
  // Skip if the file doesn't exist or can't be processed
  try {
    const fileExists = await siteAdapter.checkFileExists(repoPath, filePath);
    if (!fileExists) {
      issues.forEach(issue => {
        results.skipped.push({
          issue,
          reason: 'File does not exist'
        });
      });
      return results;
    }
  } catch (error) {
    logger.error(`Error checking file: ${filePath}`, error);
    issues.forEach(issue => {
      results.failed.push({
        issue,
        error: 'File access error'
      });
    });
    return results;
  }
  
  // Process each issue with the appropriate fixer
  for (const issue of issues) {
    try {
      const fixer = STRATEGY_MAP[issue.type];
      
      if (!fixer) {
        results.skipped.push({
          issue,
          reason: `No fixer available for issue type: ${issue.type}`
        });
        continue;
      }
      
      // Apply the fix
      const fixResult = await fixer.fix(
        repoPath,
        filePath,
        issue,
        siteStructure,
        options
      );
      
      if (fixResult.success) {
        results.successful.push({
          issue,
          changes: fixResult.changes
        });
      } else {
        results.failed.push({
          issue,
          error: fixResult.error || 'Fix failed without specific error'
        });
      }
    } catch (issueError) {
      logger.error(`Error fixing issue ${issue.id} in ${filePath}:`, issueError);
      results.failed.push({
        issue,
        error: issueError.message || 'Unknown error during fix'
      });
    }
  }
  
  return results;
}

module.exports = {
  implementFixes,
  applyFixesToFile // Exported for testing
};