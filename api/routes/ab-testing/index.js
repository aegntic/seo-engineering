/**
 * A/B Testing API Routes
 * 
 * Provides REST API endpoints for interacting with the A/B Testing Framework.
 * 
 * Last updated: April 4, 2025
 */

const express = require('express');
const router = express.Router();
const abTesting = require('../../../automation/ab-testing');
const logger = require('../../../utils/logger');
const auth = require('../../middleware/auth');

/**
 * @swagger
 * /api/ab-testing/tests:
 *   get:
 *     summary: Get all A/B tests for a site
 *     description: Retrieves all A/B tests associated with a site
 *     parameters:
 *       - in: query
 *         name: siteId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the site
 *     responses:
 *       200:
 *         description: List of A/B tests
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.get('/tests', auth.requireAuth, async (req, res) => {
  try {
    const { siteId } = req.query;
    
    if (!siteId) {
      return res.status(400).json({ error: 'Site ID is required' });
    }
    
    const tests = await abTesting.components.createTestDefinition.listBySite(siteId);
    
    res.json({ tests });
  } catch (error) {
    logger.error(`Error getting A/B tests: ${error.message}`, { error });
    res.status(500).json({ error: 'Failed to get A/B tests' });
  }
});

/**
 * @swagger
 * /api/ab-testing/tests/{id}:
 *   get:
 *     summary: Get A/B test details
 *     description: Retrieves detailed information about a specific A/B test
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the A/B test
 *     responses:
 *       200:
 *         description: A/B test details
 *       404:
 *         description: Test not found
 *       401:
 *         description: Unauthorized
 */
router.get('/tests/:id', auth.requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const test = await abTesting.getTestStatus(id);
    
    if (!test) {
      return res.status(404).json({ error: 'A/B test not found' });
    }
    
    res.json({ test });
  } catch (error) {
    logger.error(`Error getting A/B test: ${error.message}`, { error });
    res.status(500).json({ error: 'Failed to get A/B test' });
  }
});

/**
 * @swagger
 * /api/ab-testing/tests:
 *   post:
 *     summary: Create a new A/B test
 *     description: Creates a new A/B test for a site
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - siteId
 *               - variants
 *               - metrics
 *     responses:
 *       201:
 *         description: A/B test created
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/tests', auth.requireAuth, async (req, res) => {
  try {
    const testConfig = req.body;
    
    // Validate request
    if (!testConfig.name || !testConfig.siteId || !testConfig.metrics) {
      return res.status(400).json({ error: 'Invalid test configuration' });
    }
    
    // Create test
    const test = await abTesting.createTest(testConfig);
    
    res.status(201).json({ test });
  } catch (error) {
    logger.error(`Error creating A/B test: ${error.message}`, { error });
    res.status(500).json({ error: 'Failed to create A/B test' });
  }
});

/**
 * @swagger
 * /api/ab-testing/tests/{id}/start:
 *   post:
 *     summary: Start an A/B test
 *     description: Starts a previously created A/B test
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the A/B test
 *     responses:
 *       200:
 *         description: A/B test started
 *       404:
 *         description: Test not found
 *       401:
 *         description: Unauthorized
 */
router.post('/tests/:id/start', auth.requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Start test
    const result = await abTesting.components.createTestDefinition.startTest(id);
    
    res.json({ result });
  } catch (error) {
    logger.error(`Error starting A/B test: ${error.message}`, { error });
    res.status(500).json({ error: 'Failed to start A/B test' });
  }
});

/**
 * @swagger
 * /api/ab-testing/tests/{id}/stop:
 *   post:
 *     summary: Stop an A/B test
 *     description: Stops a running A/B test and optionally implements the winner
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the A/B test
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               implementWinner:
 *                 type: boolean
 *               winnerVariantId:
 *                 type: string
 *     responses:
 *       200:
 *         description: A/B test stopped
 *       404:
 *         description: Test not found
 *       401:
 *         description: Unauthorized
 */
router.post('/tests/:id/stop', auth.requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const options = req.body || {};
    
    // Stop test
    const result = await abTesting.stopTest(id, options);
    
    res.json({ result });
  } catch (error) {
    logger.error(`Error stopping A/B test: ${error.message}`, { error });
    res.status(500).json({ error: 'Failed to stop A/B test' });
  }
});

/**
 * @swagger
 * /api/ab-testing/tests/{id}/variants:
 *   get:
 *     summary: Get variants for an A/B test
 *     description: Retrieves all variants for a specific A/B test
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the A/B test
 *     responses:
 *       200:
 *         description: List of variants
 *       404:
 *         description: Test not found
 *       401:
 *         description: Unauthorized
 */
router.get('/tests/:id/variants', auth.requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const variants = await abTesting.components.createVariant.getByTestId(id);
    
    res.json({ variants });
  } catch (error) {
    logger.error(`Error getting variants: ${error.message}`, { error });
    res.status(500).json({ error: 'Failed to get variants' });
  }
});

/**
 * @swagger
 * /api/ab-testing/tests/{id}/variants:
 *   post:
 *     summary: Create a new variant for an A/B test
 *     description: Creates a new variant for a specific A/B test
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the A/B test
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Variant created
 *       404:
 *         description: Test not found
 *       401:
 *         description: Unauthorized
 */
router.post('/tests/:id/variants', auth.requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const variantConfig = req.body;
    
    // Create variant
    const variant = await abTesting.components.createVariant(id, variantConfig);
    
    res.status(201).json({ variant });
  } catch (error) {
    logger.error(`Error creating variant: ${error.message}`, { error });
    res.status(500).json({ error: 'Failed to create variant' });
  }
});

/**
 * @swagger
 * /api/ab-testing/tests/{testId}/variants/{variantId}:
 *   get:
 *     summary: Get variant details
 *     description: Retrieves detailed information about a specific variant
 *     parameters:
 *       - in: path
 *         name: testId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the A/B test
 *       - in: path
 *         name: variantId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the variant
 *     responses:
 *       200:
 *         description: Variant details
 *       404:
 *         description: Variant not found
 *       401:
 *         description: Unauthorized
 */
router.get('/tests/:testId/variants/:variantId', auth.requireAuth, async (req, res) => {
  try {
    const { variantId } = req.params;
    
    const variant = await abTesting.components.createVariant.getById(variantId);
    
    if (!variant) {
      return res.status(404).json({ error: 'Variant not found' });
    }
    
    res.json({ variant });
  } catch (error) {
    logger.error(`Error getting variant: ${error.message}`, { error });
    res.status(500).json({ error: 'Failed to get variant' });
  }
});

/**
 * @swagger
 * /api/ab-testing/tests/{testId}/variants/{variantId}/changes:
 *   post:
 *     summary: Implement changes for a variant
 *     description: Implements changes for a specific variant
 *     parameters:
 *       - in: path
 *         name: testId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the A/B test
 *       - in: path
 *         name: variantId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the variant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - changes
 *     responses:
 *       200:
 *         description: Changes implemented
 *       404:
 *         description: Variant not found
 *       401:
 *         description: Unauthorized
 */
router.post('/tests/:testId/variants/:variantId/changes', auth.requireAuth, async (req, res) => {
  try {
    const { variantId } = req.params;
    const { changes } = req.body;
    
    if (!changes || !Array.isArray(changes)) {
      return res.status(400).json({ error: 'Invalid changes array' });
    }
    
    // Implement changes
    const result = await abTesting.components.createVariant.implementChanges(variantId, changes);
    
    res.json({ result });
  } catch (error) {
    logger.error(`Error implementing changes: ${error.message}`, { error });
    res.status(500).json({ error: 'Failed to implement changes' });
  }
});

/**
 * @swagger
 * /api/ab-testing/tests/{testId}/variants/{variantId}/rollback:
 *   post:
 *     summary: Rollback variant changes
 *     description: Rolls back changes for a specific variant
 *     parameters:
 *       - in: path
 *         name: testId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the A/B test
 *       - in: path
 *         name: variantId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the variant
 *     responses:
 *       200:
 *         description: Changes rolled back
 *       404:
 *         description: Variant not found
 *       401:
 *         description: Unauthorized
 */
router.post('/tests/:testId/variants/:variantId/rollback', auth.requireAuth, async (req, res) => {
  try {
    const { variantId } = req.params;
    
    // Rollback changes
    const result = await abTesting.components.createVariant.rollback(variantId);
    
    res.json({ result });
  } catch (error) {
    logger.error(`Error rolling back changes: ${error.message}`, { error });
    res.status(500).json({ error: 'Failed to roll back changes' });
  }
});

/**
 * @swagger
 * /api/ab-testing/tests/{id}/analysis:
 *   get:
 *     summary: Get A/B test analysis
 *     description: Retrieves statistical analysis for a specific A/B test
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the A/B test
 *     responses:
 *       200:
 *         description: A/B test analysis
 *       404:
 *         description: Test not found
 *       401:
 *         description: Unauthorized
 */
router.get('/tests/:id/analysis', auth.requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get analysis
    const analysis = await abTesting.components.analyzeSplitTestData(id);
    
    res.json({ analysis });
  } catch (error) {
    logger.error(`Error getting A/B test analysis: ${error.message}`, { error });
    res.status(500).json({ error: 'Failed to get A/B test analysis' });
  }
});

/**
 * @swagger
 * /api/ab-testing/tests/{id}/metrics:
 *   get:
 *     summary: Get A/B test metrics
 *     description: Retrieves performance metrics for a specific A/B test
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the A/B test
 *     responses:
 *       200:
 *         description: A/B test metrics
 *       404:
 *         description: Test not found
 *       401:
 *         description: Unauthorized
 */
router.get('/tests/:id/metrics', auth.requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get performance data
    const metrics = await abTesting.components.trackPerformance.getByTestId(id);
    
    res.json({ metrics });
  } catch (error) {
    logger.error(`Error getting A/B test metrics: ${error.message}`, { error });
    res.status(500).json({ error: 'Failed to get A/B test metrics' });
  }
});

module.exports = router;
