#!/usr/bin/env node

/**
 * SEO.engineering Strategy CLI
 * 
 * This CLI tool generates strategic SEO recommendations based on gap analysis
 * and benchmark comparison data.
 */

const fs = require('fs').promises;
const path = require('path');
const { program } = require('commander');
const { createGapAnalysisService } = require('../services/gap-analysis');
const { BenchmarkService } = require('../services/benchmark');
const { createStrategyService } = require('../services/strategy');
const logger = require('../utils/logger');

// Configure CLI
program
  .name('strategy')
  .description('SEO.engineering Strategy Recommendation Tool')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate strategic recommendations')
  .requiredOption('-c, --client <path>', 'Path to client data JSON file')
  .requiredOption('-o, --competitors <path>', 'Path to competitors data JSON file')
  .option('-g, --gap <path>', 'Path to existing gap analysis JSON file')
  .option('-b, --benchmark <path>', 'Path to existing benchmark comparison JSON file')
  .option('-h, --history <path>', 'Path to historical data JSON file')
  .option('-i, --industry <path>', 'Path to industry benchmark data JSON file')
  .option('-d, --output-dir <path>', 'Directory for output files', './strategy-output')
  .option('-t, --timeline <months>', 'Number of months for implementation timeline', 6)
  .option('-r, --roi', 'Enable ROI projection', true)
  .option('-k, --keywords <keywords>', 'Keywords to analyze (comma-separated)', '')
  .action(async (options) => {
    try {
      // Create output directory
      await fs.mkdir(options.outputDir, { recursive: true });
      
      logger.info('Reading input files...');
      
      // Read client data
      const clientData = JSON.parse(await fs.readFile(options.client, 'utf8'));
      
      // Read competitors data
      const competitorsData = JSON.parse(await fs.readFile(options.competitors, 'utf8'));
      
      // Parse keywords
      const keywords = options.keywords ? options.keywords.split(',') : [];
      
      // Read or generate gap analysis
      let gapAnalysis = null;
      
      if (options.gap) {
        logger.info('Using existing gap analysis...');
        gapAnalysis = JSON.parse(await fs.readFile(options.gap, 'utf8'));
      } else {
        logger.info('Generating new gap analysis...');
        const gapAnalysisService = createGapAnalysisService();
        gapAnalysis = await gapAnalysisService.analyzeGaps(clientData, competitorsData, keywords);
      }
      
      // Read or generate benchmark comparison
      let benchmarkComparison = null;
      
      if (options.benchmark) {
        logger.info('Using existing benchmark comparison...');
        benchmarkComparison = JSON.parse(await fs.readFile(options.benchmark, 'utf8'));
      } else {
        logger.info('Generating new benchmark comparison...');
        
        // Read historical data if provided
        let historicalData = null;
        
        if (options.history) {
          historicalData = JSON.parse(await fs.readFile(options.history, 'utf8'));
        }
        
        // Read industry benchmark data if provided
        let industryData = null;
        
        if (options.industry) {
          industryData = JSON.parse(await fs.readFile(options.industry, 'utf8'));
        }
        
        // Create benchmark service
        const benchmarkService = new BenchmarkService({ industryData });
        await benchmarkService.initialize();
        
        // Generate benchmark comparison
        benchmarkComparison = await benchmarkService.analyzeBenchmarks(
          clientData,
          competitorsData,
          [],
          historicalData
        );
      }
      
      logger.info('Generating strategic recommendations...');
      
      // Create strategy service
      const strategyService = createStrategyService({
        timelineMonths: parseInt(options.timeline),
        enableRoiProjection: options.roi,
        outputDir: options.outputDir
      });
      
      // Initialize strategy service
      await strategyService.initialize();
      
      // Generate strategy
      const strategy = await strategyService.generateStrategy(gapAnalysis, benchmarkComparison);
      
      // Generate job ID for output files
      const jobId = `job-${Date.now()}`;
      
      // Generate visualizations
      const visualizationPaths = await strategyService.generateVisualizations(strategy, jobId);
      
      // Generate markdown report
      const report = strategy.generateMarkdownReport();
      
      // Save report to file
      const reportPath = path.join(options.outputDir, `strategy-report-${jobId}.md`);
      await fs.writeFile(reportPath, report);
      
      // Save strategy object as JSON (for debugging and further analysis)
      const strategyPath = path.join(options.outputDir, `strategy-data-${jobId}.json`);
      await fs.writeFile(
        strategyPath,
        JSON.stringify({
          recommendations: strategy.getAllRecommendations(),
          timeline: strategy.getTimeline(),
          resourceAllocation: strategy.getResourceAllocation(),
          roiProjection: strategy.getRoiProjection(),
          strategyMap: strategy.getStrategyMap()
        }, null, 2)
      );
      
      logger.info(`\nStrategy generation completed successfully!`);
      logger.info(`\nOutput files:`);
      logger.info(`- Report: ${reportPath}`);
      logger.info(`- Strategy data: ${strategyPath}`);
      
      // Log visualization paths
      logger.info(`\nVisualizations:`);
      Object.entries(visualizationPaths).forEach(([type, path]) => {
        logger.info(`- ${type}: ${path}`);
      });
      
      // Log recommendations summary
      const recommendations = strategy.getAllRecommendations();
      const criticalCount = strategy.getRecommendationsByPriority('critical').length;
      const highCount = strategy.getRecommendationsByPriority('high').length;
      const mediumCount = strategy.getRecommendationsByPriority('medium').length;
      const lowCount = strategy.getRecommendationsByPriority('low').length;
      
      logger.info(`\nRecommendations summary:`);
      logger.info(`- Total recommendations: ${recommendations.length}`);
      logger.info(`- Critical priority: ${criticalCount}`);
      logger.info(`- High priority: ${highCount}`);
      logger.info(`- Medium priority: ${mediumCount}`);
      logger.info(`- Low priority: ${lowCount}`);
      
      // Group recommendations by category
      const categories = [...new Set(recommendations.map(r => r.category))];
      logger.info(`\nCategories:`);
      
      for (const category of categories) {
        const categoryCount = strategy.getRecommendationsByCategory(category).length;
        logger.info(`- ${category}: ${categoryCount} recommendations`);
      }
      
      // Show ROI projection if enabled
      if (options.roi) {
        const roiProjection = strategy.getRoiProjection();
        
        if (roiProjection && roiProjection.cumulativeRoi && roiProjection.cumulativeRoi.length > 0) {
          const finalRoi = roiProjection.cumulativeRoi[roiProjection.cumulativeRoi.length - 1];
          logger.info(`\nProjected ROI after ${options.timeline} months: ${finalRoi.toFixed(2)}%`);
          
          // Find the break-even point
          const breakEvenIndex = roiProjection.cumulativeRoi.findIndex(roi => roi >= 0);
          
          if (breakEvenIndex >= 0) {
            logger.info(`Break-even point: Month ${breakEvenIndex + 1}`);
          } else {
            logger.info(`Break-even point: Beyond the ${options.timeline} month projection`);
          }
        }
      }
      
      logger.info(`\nFor detailed recommendations and timeline, review the report file.`);
    } catch (error) {
      logger.error(`Error generating strategy: ${error.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
