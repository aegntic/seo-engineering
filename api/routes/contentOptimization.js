/**
 * contentOptimization.js
 * 
 * API routes for content optimization functionality.
 * Exposes endpoints for analyzing content and generating optimization suggestions.
 */

const express = require('express');
const router = express.Router();
const ContentOptimizationEngine = require('../../automation/content-optimization/ContentOptimizationEngine');
const { formatSuggestionsForResponse } = require('../../automation/content-optimization/utils/suggestionUtils');

// Initialize the content optimization engine
const contentOptimizer = new ContentOptimizationEngine();

/**
 * @route   POST /api/content-optimization/analyze
 * @desc    Analyze content and generate optimization suggestions
 * @access  Private
 */
router.post('/analyze', async (req, res) => {
  try {
    const { html, url, metadata, context } = req.body;
    
    // Validate input
    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }
    
    // Create content data object
    const contentData = {
      html,
      url: url || '',
      metadata: metadata || {}
    };
    
    // Analyze content
    const analysisResults = await contentOptimizer.analyzeContent(contentData, context);
    
    // Format response
    const response = {
      url: analysisResults.url,
      timestamp: analysisResults.timestamp,
      scores: analysisResults.scores,
      metrics: analysisResults.metrics,
      suggestions: formatSuggestionsForResponse(analysisResults.suggestions, {
        includeMeta: false,
        includeExamples: true,
        format: 'dashboard'
      })
    };
    
    // Return results
    return res.json(response);
  } catch (error) {
    console.error('Error in content optimization analysis:', error);
    return res.status(500).json({ error: 'Content analysis failed', details: error.message });
  }
});

/**
 * @route   POST /api/content-optimization/batch
 * @desc    Batch analyze multiple content items
 * @access  Private
 */
router.post('/batch', async (req, res) => {
  try {
    const { contentItems, globalContext } = req.body;
    
    // Validate input
    if (!contentItems || !Array.isArray(contentItems) || contentItems.length === 0) {
      return res.status(400).json({ error: 'Valid content items array is required' });
    }
    
    // Validate that each item has html
    for (const item of contentItems) {
      if (!item.html) {
        return res.status(400).json({ 
          error: 'Each content item must have html property',
          invalidItem: item
        });
      }
    }
    
    // Batch analyze content
    const batchResults = await contentOptimizer.batchAnalyze(contentItems, globalContext);
    
    // Format response
    const response = batchResults.map(result => ({
      url: result.url,
      timestamp: result.timestamp,
      scores: result.scores,
      suggestions: formatSuggestionsForResponse(result.suggestions, {
        includeMeta: false,
        includeExamples: true,
        format: 'dashboard'
      })
    }));
    
    // Return results
    return res.json(response);
  } catch (error) {
    console.error('Error in batch content optimization:', error);
    return res.status(500).json({ error: 'Batch analysis failed', details: error.message });
  }
});

/**
 * @route   GET /api/content-optimization/suggestion/:id
 * @desc    Get detailed information about a specific suggestion
 * @access  Private
 */
router.get('/suggestion/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, this would retrieve the suggestion from a database
    // For demonstration, we'll return a mock response
    const mockSuggestion = {
      id,
      title: 'Example suggestion details',
      description: 'This would contain detailed information about the specific suggestion.',
      implementation: 'Step-by-step implementation guidance would be provided here.',
      examples: [
        'Example implementation 1',
        'Example implementation 2'
      ],
      resources: [
        {
          title: 'Resource 1',
          url: 'https://example.com/resource1'
        },
        {
          title: 'Resource 2',
          url: 'https://example.com/resource2'
        }
      ],
      relatedSuggestions: [
        'related-suggestion-1',
        'related-suggestion-2'
      ]
    };
    
    return res.json(mockSuggestion);
  } catch (error) {
    console.error('Error retrieving suggestion details:', error);
    return res.status(500).json({ error: 'Failed to retrieve suggestion details', details: error.message });
  }
});

/**
 * @route   POST /api/content-optimization/test
 * @desc    Simple test endpoint to verify API is working
 * @access  Public
 */
router.post('/test', (req, res) => {
  return res.json({
    message: 'Content optimization API is working',
    receivedData: req.body
  });
});

module.exports = router;
