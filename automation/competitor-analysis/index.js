/**
 * Competitor Analysis Module Entry Point
 * 
 * This module is responsible for analyzing competitor websites to identify
 * gaps and opportunities for SEO improvements.
 */

const express = require('express');
const CompetitorAnalysisService = require('./services/analysis-service');
const logger = require('./utils/logger');

// Create analysis service instance
let analysisService = null;

// Create a router for the competitor analysis API
const router = express.Router();

/**
 * Initialize the module
 * @param {Object} app Express application
 * @param {Object} config Configuration options
 * @returns {Object} Module API
 */
function initialize(app, config = {}) {
  logger.info('Initializing Competitor Analysis Module');
  
  // Initialize the service
  analysisService = new CompetitorAnalysisService(config);
  
  // Register routes
  
  // Analyze competitors
  router.post('/analyze', async (req, res) => {
    try {
      // Validate request
      if (!req.body.competitors || !Array.isArray(req.body.competitors) || req.body.competitors.length === 0) {
        return res.status(400).json({ error: 'At least one competitor URL must be provided' });
      }
      
      // Start analysis
      const job = await analysisService.runAnalysis({
        competitors: req.body.competitors,
        clientSiteUrl: req.body.clientSiteUrl,
        keywords: req.body.keywords,
        crawlerOptions: req.body.crawlerOptions
      });
      
      res.json({
        success: true,
        message: 'Analysis job started',
        jobId: job.jobId
      });
    } catch (err) {
      logger.error(`Error starting analysis: ${err.message}`);
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  });
  
  // Benchmark comparison endpoint
  router.post('/benchmark', async (req, res) => {
    try {
      // Validate request
      if (!req.body.clientData) {
        return res.status(400).json({ error: 'Client data must be provided' });
      }
      
      if (!req.body.competitorsData || Object.keys(req.body.competitorsData).length === 0) {
        return res.status(400).json({ error: 'Competitor data must be provided' });
      }
      
      // Create benchmark service
      const BenchmarkService = require('./services/benchmark/benchmark-service');
      const benchmarkService = new BenchmarkService();
      await benchmarkService.initialize(req.body.industryData);
      
      // Perform benchmark comparison
      const benchmarkComparison = await benchmarkService.analyzeBenchmarks(
        req.body.clientData,
        req.body.competitorsData,
        req.body.categories || [],
        req.body.historicalData || null
      );
      
      // Generate visualization data
      const visualizationData = benchmarkComparison.generateVisualizationData();
      
      // Generate report
      const report = benchmarkComparison.generateMarkdownReport();
      
      // Format response
      res.json({
        success: true,
        benchmarkComparison: {
          benchmarks: benchmarkComparison.getAllBenchmarkData(),
          rankings: benchmarkComparison.getAllRankingData(),
          trends: benchmarkComparison.getAllTrendData(),
          recommendations: benchmarkComparison.getRecommendations(),
          visualizationData,
          report
        }
      });
    } catch (err) {
      logger.error(`Error performing benchmark comparison: ${err.message}`);
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  });
  
  // Gap analysis endpoint
  router.post('/gap-analysis', async (req, res) => {
    try {
      // Validate request
      if (!req.body.clientData) {
        return res.status(400).json({ error: 'Client data must be provided' });
      }
      
      if (!req.body.competitorsData || Object.keys(req.body.competitorsData).length === 0) {
        return res.status(400).json({ error: 'Competitor data must be provided' });
      }
      
      // Create gap analysis service
      const { createGapAnalysisService } = require('./services/gap-analysis');
      const gapAnalysisService = createGapAnalysisService();
      
      // Perform gap analysis
      const gapAnalysis = await gapAnalysisService.analyzeGaps(
        req.body.clientData,
        req.body.competitorsData,
        req.body.keywords || []
      );
      
      // Generate report
      const report = gapAnalysis.generateMarkdownReport();
      
      // Format response
      res.json({
        success: true,
        gapAnalysis: {
          scores: gapAnalysis.scores,
          gaps: gapAnalysis.getAllGaps(),
          opportunities: gapAnalysis.getAllOpportunities(),
          topGaps: gapAnalysis.getGapsSortedByImpact().slice(0, 10),
          topOpportunities: gapAnalysis.getOpportunitiesSortedByImpact().slice(0, 5),
          report
        }
      });
    } catch (err) {
      logger.error(`Error performing gap analysis: ${err.message}`);
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  });
  
  router.get('/status/:jobId', async (req, res) => {
    try {
      const status = await analysisService.getJobStatus(req.params.jobId);
      res.json({
        success: true,
        status
      });
    } catch (err) {
      if (err.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: err.message
        });
      } else {
        logger.error(`Error getting job status: ${err.message}`);
        res.status(500).json({
          success: false,
          error: err.message
        });
      }
    }
  });
  
  router.get('/results/:jobId', async (req, res) => {
    try {
      const results = await analysisService.getAnalysisResults(req.params.jobId);
      res.json({
        success: true,
        results
      });
    } catch (err) {
      if (err.message.includes('not found')) {
        res.status(404).json({
          success: false,
          error: err.message
        });
      } else if (err.message.includes('not completed')) {
        res.status(400).json({
          success: false,
          error: err.message
        });
      } else {
        logger.error(`Error getting job results: ${err.message}`);
        res.status(500).json({
          success: false,
          error: err.message
        });
      }
    }
  });
  
  // Register the router with the app if provided
  if (app) {
    app.use('/api/competitor-analysis', router);
  }
  
  logger.info('Competitor Analysis Module initialized');
  
  // Return the module's public API
  return {
    router,
    
    /**
     * Run a competitor analysis
     * @param {Object} options Analysis options
     * @returns {Promise<Object>} Job information
     */
    analyzeCompetitors: (options) => analysisService.runAnalysis(options),
    
    /**
     * Get the status of an analysis job
     * @param {string} jobId The job ID
     * @returns {Promise<Object>} Job status
     */
    getAnalysisStatus: (jobId) => analysisService.getJobStatus(jobId),
    
    /**
     * Get the results of a completed analysis job
     * @param {string} jobId The job ID
     * @returns {Promise<Object>} Analysis results
     */
    getAnalysisResults: (jobId) => analysisService.getAnalysisResults(jobId),
    
    /**
     * Perform gap analysis between client and competitors
     * @param {Object} clientData Client site data
     * @param {Object} competitorsData Competitors data
     * @param {Array} keywords Keywords to analyze
     * @returns {Promise<Object>} Gap analysis results
     */
    analyzeGaps: async (clientData, competitorsData, keywords = []) => {
      const { createGapAnalysisService } = require('./services/gap-analysis');
      const gapAnalysisService = createGapAnalysisService();
      return gapAnalysisService.analyzeGaps(clientData, competitorsData, keywords);
    },
    
    /**
     * Generate visualizations for gap analysis
     * @param {Object} gapAnalysis Gap analysis results
     * @param {string} jobId Job ID for naming files
     * @returns {Promise<Object>} Visualization paths
     */
    generateGapVisualizations: async (gapAnalysis, jobId) => {
      const { createGapAnalysisService } = require('./services/gap-analysis');
      const gapAnalysisService = createGapAnalysisService();
      return gapAnalysisService.generateVisualizations(gapAnalysis, jobId);
    },
    
    /**
     * Perform benchmark comparison between client and competitors
     * @param {Object} clientData Client site data
     * @param {Object} competitorsData Competitors data
     * @param {Array} categories Categories to benchmark
     * @param {Object} historicalData Historical data for trend analysis
     * @param {Object} industryData Industry benchmark data
     * @returns {Promise<Object>} Benchmark comparison results
     */
    analyzeBenchmarks: async (clientData, competitorsData, categories = [], historicalData = null, industryData = null) => {
      const { BenchmarkService } = require('./services/benchmark');
      const benchmarkService = new BenchmarkService({ industryData });
      await benchmarkService.initialize();
      return benchmarkService.analyzeBenchmarks(clientData, competitorsData, categories, historicalData);
    },
    
    /**
     * Generate visualizations for benchmark comparison
     * @param {Object} benchmarkComparison Benchmark comparison results
     * @param {string} jobId Job ID for naming files
     * @returns {Promise<Object>} Visualization paths
     */
    generateBenchmarkVisualizations: async (benchmarkComparison, jobId) => {
      const { BenchmarkService } = require('./services/benchmark');
      const benchmarkService = new BenchmarkService();
      await benchmarkService.initialize();
      return benchmarkService.generateVisualizations(benchmarkComparison, jobId);
    },
    
    /**
     * Close the module and release resources
     * @returns {Promise<void>}
     */
    close: async () => {
      if (analysisService) {
        await analysisService.close();
        analysisService = null;
      }
    }
  };
}

module.exports = {
  initialize
};
