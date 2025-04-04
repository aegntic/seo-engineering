/**
 * Gap Analysis Service Module
 * 
 * This module exports the gap analysis components for analyzing
 * gaps in SEO strategy between a client site and competitors.
 */

const GapAnalyzer = require('./gap-analyzer');
const VisualizationService = require('./visualization-service');

/**
 * Create a new gap analysis service
 * @param {Object} options Configuration options
 * @returns {Object} Gap analysis service
 */
function createGapAnalysisService(options = {}) {
  const gapAnalyzer = new GapAnalyzer(options);
  const visualizationService = new VisualizationService(options);
  
  return {
    /**
     * Analyze gaps between client site and competitors
     * @param {Object} clientData Client site data
     * @param {Object} competitorsData Competitors data
     * @param {Array} keywords Keywords to analyze
     * @returns {Promise<Object>} Gap analysis results
     */
    async analyzeGaps(clientData, competitorsData, keywords = []) {
      return gapAnalyzer.analyzeGaps(clientData, competitorsData, keywords);
    },
    
    /**
     * Generate visualizations for gap analysis results
     * @param {Object} gapAnalysis Gap analysis results
     * @param {string} jobId Job ID for naming files
     * @returns {Promise<Object>} Generated visualization paths
     */
    async generateVisualizations(gapAnalysis, jobId) {
      return visualizationService.generateVisualizations(gapAnalysis, jobId);
    }
  };
}

module.exports = {
  createGapAnalysisService,
  GapAnalyzer,
  VisualizationService
};
