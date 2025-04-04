/**
 * Winner Implementation Module
 * 
 * Handles the implementation of winning variants from A/B tests.
 * Integrates with Git Integration for tracking and versioning changes.
 * 
 * Last updated: April 4, 2025
 */

const logger = require('../../utils/logger');
const gitIntegration = require('../../git-integration');
const verificationSystem = require('../../verification');
const { createTestDefinition } = require('./test-definition');
const { createVariant, getById: getVariantById } = require('./variant-creator');

/**
 * Implements the winning variant for an A/B test
 * 
 * @param {string} testId - ID of the test
 * @param {string} winnerVariantId - ID of the winning variant
 * @returns {Object} - Implementation result
 */
async function implementWinner(testId, winnerVariantId) {
  try {
    logger.info(`Implementing winning variant: ${winnerVariantId} for test: ${testId}`);
    
    // Get test definition
    const test = await createTestDefinition.getById(testId);
    if (!test) {
      throw new Error(`Test not found: ${testId}`);
    }
    
    // Get winning variant
    const winner = await getVariantById(winnerVariantId);
    if (!winner) {
      throw new Error(`Variant not found: ${winnerVariantId}`);
    }
    
    // Verify this variant belongs to the test
    if (winner.testId !== testId) {
      throw new Error(`Variant ${winnerVariantId} does not belong to test ${testId}`);
    }
    
    // Get control variant
    const variants = await createVariant.getByTestId(testId);
    const controlVariant = variants.find(v => v.type === 'control');
    
    if (!controlVariant) {
      throw new Error(`No control variant found for test: ${testId}`);
    }
    
    // Skip implementation if winner is the control
    if (winnerVariantId === controlVariant.id) {
      logger.info(`Control variant is the winner for test: ${testId}. No changes needed.`);
      return {
        testId,
        winnerVariantId,
        status: 'no_changes_needed',
        message: 'Control variant is the winner. No changes needed.'
      };
    }
    
    // Check if winner has changes to implement
    if (!winner.changes || winner.changes.length === 0) {
      throw new Error(`Winning variant has no changes to implement: ${winnerVariantId}`);
    }
    
    // Implement changes to production
    const implementationResults = [];
    
    for (const change of winner.changes) {
      // Implement change using Git integration
      const implementResult = await gitIntegration.implementChange({
        path: change.path,
        original: change.original,
        modified: change.modified,
        message: `Implementing A/B Test Winner: ${winner.name} (Test: ${test.name})`,
        branch: 'production'  // Implement to production branch
      });
      
      implementationResults.push({
        element: change.element,
        path: change.path,
        success: true,
        commitHash: implementResult.commitHash
      });
    }
    
    // Update test status
    await createTestDefinition.update(testId, { 
      status: 'completed',
      updatedAt: new Date()
    });
    
    // Create implementation record
    const implementationRecord = {
      testId,
      winnerVariantId,
      controlVariantId: controlVariant.id,
      implementedAt: new Date(),
      changes: implementationResults,
      status: 'completed'
    };
    
    // Verify implementation
    const verificationResult = await verifyImplementation(test.siteId, winner);
    
    logger.info(`Successfully implemented winning variant: ${winnerVariantId} for test: ${testId}`);
    
    return {
      ...implementationRecord,
      verification: verificationResult
    };
  } catch (error) {
    logger.error(`Error implementing winning variant: ${error.message}`, { error });
    throw new Error(`Failed to implement winning variant: ${error.message}`);
  }
}

/**
 * Verifies the implementation of a winning variant
 * 
 * @param {string} siteId - ID of the site
 * @param {Object} winner - Winning variant
 * @returns {Object} - Verification result
 */
async function verifyImplementation(siteId, winner) {
  try {
    logger.info(`Verifying implementation for variant: ${winner.id}`);
    
    // Use verification system to check implementation
    const verificationResult = await verificationSystem.verifySite({
      siteId,
      checkImplementation: true,
      implementationDetails: {
        type: 'ab_test_winner',
        variantId: winner.id,
        changes: winner.changes
      }
    });
    
    return {
      success: verificationResult.success,
      details: verificationResult.details,
      timestamp: new Date()
    };
  } catch (error) {
    logger.error(`Error verifying implementation: ${error.message}`, { error });
    return {
      success: false,
      error: error.message,
      timestamp: new Date()
    };
  }
}

/**
 * Rolls back the implementation of a winning variant
 * 
 * @param {string} testId - ID of the test
 * @param {string} implementationId - ID of the implementation
 * @returns {Object} - Rollback result
 */
async function rollbackImplementation(testId, implementationId) {
  try {
    logger.info(`Rolling back implementation for test: ${testId}`);
    
    // Get implementation record (would be stored in DB in a real implementation)
    const implementationRecord = await getImplementationRecord(implementationId);
    
    if (!implementationRecord) {
      throw new Error(`Implementation record not found: ${implementationId}`);
    }
    
    // Get winner variant
    const winner = await getVariantById(implementationRecord.winnerVariantId);
    
    if (!winner) {
      throw new Error(`Variant not found: ${implementationRecord.winnerVariantId}`);
    }
    
    // Roll back each change
    const rollbackResults = [];
    
    for (const implementedChange of implementationRecord.changes) {
      // Find original change
      const originalChange = winner.changes.find(c => c.path === implementedChange.path);
      
      if (!originalChange) {
        logger.warn(`Original change not found for path: ${implementedChange.path}`);
        continue;
      }
      
      // Roll back to original using Git integration
      const rollbackResult = await gitIntegration.rollbackChange({
        path: originalChange.path,
        commitHash: implementedChange.commitHash,
        original: originalChange.original,
        message: `Rolling back A/B Test Winner: ${winner.name}`,
        branch: 'production'
      });
      
      rollbackResults.push({
        element: originalChange.element,
        path: originalChange.path,
        success: true,
        commitHash: rollbackResult.commitHash
      });
    }
    
    // Update implementation record
    const updatedRecord = {
      ...implementationRecord,
      status: 'rolled_back',
      rollbackTimestamp: new Date(),
      rollbackResults
    };
    
    logger.info(`Successfully rolled back implementation for test: ${testId}`);
    
    return updatedRecord;
  } catch (error) {
    logger.error(`Error rolling back implementation: ${error.message}`, { error });
    throw new Error(`Failed to roll back implementation: ${error.message}`);
  }
}

/**
 * Gets an implementation record
 * 
 * @param {string} implementationId - ID of the implementation
 * @returns {Object} - Implementation record
 */
async function getImplementationRecord(implementationId) {
  // This is a placeholder - in a real implementation this would retrieve
  // the record from a database
  return null;
}

module.exports = {
  implementWinner,
  verifyImplementation,
  rollbackImplementation
};
