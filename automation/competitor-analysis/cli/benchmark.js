#!/usr/bin/env node

/**
 * SEO.engineering Benchmark CLI
 * 
 * This CLI tool provides benchmark comparison between a client site and its competitors.
 * It generates reports and visualizations for comprehensive benchmark analysis.
 */

const fs = require('fs').promises;
const path = require('path');
const { program } = require('commander');
const { BenchmarkService } = require('../services/benchmark');
const logger = require('../utils/logger');

// Configure CLI
program
  .name('benchmark')
  .description('SEO.engineering Benchmark Comparison Tool')
  .version('1.0.0');

program
  .command('analyze')
  .description('Run benchmark comparison analysis')
  .requiredOption('-c, --client <path>', 'Path to client data JSON file')
  .requiredOption('-o, --competitors <path>', 'Path to competitors data JSON file')
  .option('-h, --history <path>', 'Path to historical data JSON file')
  .option('-i, --industry <path>', 'Path to industry benchmark data JSON file')
  .option('-d, --output-dir <path>', 'Directory for output files', './benchmark-output')
  .option('-f, --forecast', 'Enable trend forecasting', true)
  .option('-p, --periods <number>', 'Number of periods to forecast', 3)
  .option('--categories <categories>', 'Categories to analyze (comma-separated)', 'technical,content,keywords,performance,onPage,structure')
  .action(async (options) => {
    try {
      // Create output directory
      await fs.mkdir(options.outputDir, { recursive: true });
      
      logger.info('Reading input files...');
      
      // Read client data
      const clientData = JSON.parse(await fs.readFile(options.client, 'utf8'));
      
      // Read competitors data
      const competitorsData = JSON.parse(await fs.readFile(options.competitors, 'utf8'));
      
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
      
      // Parse categories
      const categories = options.categories.split(',');
      
      // Initialize benchmark service
      const benchmarkService = new BenchmarkService({
        industryData,
        enableForecasting: options.forecast,
        forecastPeriods: parseInt(options.periods),
        outputDir: options.outputDir
      });
      
      // Initialize service
      await benchmarkService.initialize();
      
      logger.info('Running benchmark analysis...');
      
      // Run benchmark analysis
      const benchmarkComparison = await benchmarkService.analyzeBenchmarks(
        clientData,
        competitorsData,
        categories,
        historicalData
      );
      
      // Generate job ID for visualization files
      const jobId = `job-${Date.now()}`;
      
      // Generate visualizations
      const visualizationPaths = await benchmarkService.generateVisualizations(
        benchmarkComparison,
        jobId
      );
      
      // Generate markdown report
      const report = benchmarkComparison.generateMarkdownReport();
      
      // Save report to file
      const reportPath = path.join(options.outputDir, `benchmark-report-${jobId}.md`);
      await fs.writeFile(reportPath, report);
      
      // Save benchmarkComparison object as JSON (for debugging and further analysis)
      const benchmarkPath = path.join(options.outputDir, `benchmark-data-${jobId}.json`);
      await fs.writeFile(
        benchmarkPath,
        JSON.stringify(benchmarkComparison, null, 2)
      );
      
      logger.info(`\nBenchmark analysis completed successfully!`);
      logger.info(`\nOutput files:`);
      logger.info(`- Report: ${reportPath}`);
      logger.info(`- Benchmark data: ${benchmarkPath}`);
      
      // Log visualization paths
      logger.info(`\nVisualizations:`);
      Object.entries(visualizationPaths).forEach(([type, path]) => {
        logger.info(`- ${type}: ${path}`);
      });
      
      // Log recommendations summary
      const recommendations = benchmarkComparison.getRecommendations();
      
      logger.info(`\nRecommendations summary:`);
      logger.info(`- Total recommendations: ${recommendations.length}`);
      
      // Group recommendations by category
      const recommendationsByCategory = {};
      
      recommendations.forEach(recommendation => {
        if (!recommendationsByCategory[recommendation.category]) {
          recommendationsByCategory[recommendation.category] = [];
        }
        
        recommendationsByCategory[recommendation.category].push(recommendation);
      });
      
      // Log recommendations by category
      Object.entries(recommendationsByCategory).forEach(([category, categoryRecommendations]) => {
        logger.info(`- ${category}: ${categoryRecommendations.length} recommendations`);
      });
      
      logger.info(`\nFor detailed recommendations, review the report file.`);
    } catch (error) {
      logger.error(`Error running benchmark analysis: ${error.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
