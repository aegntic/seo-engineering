#!/usr/bin/env node

/**
 * Gap Analysis CLI
 * 
 * Command-line tool for performing gap analysis between a client site and competitors.
 */

const { program } = require('commander');
const path = require('path');
const fs = require('fs').promises;
const { createGapAnalysisService } = require('../services/gap-analysis');
const logger = require('../utils/logger');

// Configure the CLI
program
  .name('gap-analysis')
  .description('Analyze gaps between a client site and competitors')
  .version('1.0.0');

program
  .option('-c, --client <url>', 'Client site URL')
  .option('-m, --competitors <urls...>', 'Competitor site URLs')
  .option('-f, --competitors-file <path>', 'File containing competitor URLs (one per line)')
  .option('-k, --keywords <keywords...>', 'Keywords to analyze')
  .option('-w, --keywords-file <path>', 'File containing keywords (one per line)')
  .option('-i, --input <path>', 'Input JSON file with crawl data')
  .option('-o, --output <dir>', 'Output directory for results')
  .option('-v, --visualizations', 'Generate visualizations', false)
  .option('--job-id <id>', 'Unique job ID (default: timestamp)')
  .option('--detailed', 'Generate detailed analysis', false);

// Parse command-line arguments
program.parse();
const options = program.opts();

// Main function
async function main() {
  try {
    // Validate required options
    if (!options.input && !options.client) {
      console.error('Error: Either --input or --client must be specified');
      process.exit(1);
    }

    if (!options.input && (!options.competitors && !options.competitorsFile)) {
      console.error('Error: Either --competitors or --competitors-file must be specified when not using --input');
      process.exit(1);
    }

    // Generate job ID if not provided
    const jobId = options.jobId || `gap-${Date.now()}`;

    // Set up output directory
    const outputDir = options.output || path.join(process.cwd(), 'gap-analysis-results');
    await fs.mkdir(outputDir, { recursive: true });

    // Create gap analysis service
    const gapAnalysisService = createGapAnalysisService({
      outputDir
    });

    let clientData, competitorsData, keywords;

    // Load data from input file or perform crawl
    if (options.input) {
      logger.info(`Loading data from ${options.input}`);
      const inputData = JSON.parse(await fs.readFile(options.input, 'utf8'));
      
      if (!inputData.clientData || !inputData.competitorsData) {
        console.error('Error: Input file must contain clientData and competitorsData');
        process.exit(1);
      }
      
      clientData = inputData.clientData;
      competitorsData = inputData.competitorsData;
      keywords = inputData.keywords || [];
    } else {
      // In a real implementation, this would call the crawler
      console.error('Error: Direct crawling not implemented in CLI tool. Please use --input option with data file');
      process.exit(1);
    }

    // Load keywords from file if specified
    if (options.keywordsFile) {
      logger.info(`Loading keywords from ${options.keywordsFile}`);
      const keywordsContent = await fs.readFile(options.keywordsFile, 'utf8');
      keywords = keywordsContent.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    } else if (options.keywords) {
      keywords = options.keywords;
    }

    // Perform gap analysis
    logger.info('Starting gap analysis');
    const gapAnalysis = await gapAnalysisService.analyzeGaps(
      clientData,
      competitorsData,
      keywords
    );

    // Generate report
    const reportPath = path.join(outputDir, `gap-analysis-report-${jobId}.md`);
    await fs.writeFile(reportPath, gapAnalysis.generateMarkdownReport());
    logger.info(`Gap analysis report generated: ${reportPath}`);

    // Generate visualizations if requested
    if (options.visualizations) {
      logger.info('Generating visualizations');
      const visualizations = await gapAnalysisService.generateVisualizations(gapAnalysis, jobId);
      
      logger.info('Visualizations generated:');
      Object.entries(visualizations).forEach(([type, filePath]) => {
        logger.info(`- ${type}: ${filePath}`);
      });
    }

    // Save full analysis results
    const resultsPath = path.join(outputDir, `gap-analysis-results-${jobId}.json`);
    await fs.writeFile(resultsPath, JSON.stringify({
      scores: gapAnalysis.scores,
      gaps: gapAnalysis.getAllGaps(),
      opportunities: gapAnalysis.getAllOpportunities(),
      topGaps: gapAnalysis.getGapsSortedByImpact().slice(0, 10),
      topOpportunities: gapAnalysis.getOpportunitiesSortedByImpact().slice(0, 5)
    }, null, 2));
    
    logger.info(`Gap analysis results saved: ${resultsPath}`);
    logger.info('Gap analysis completed successfully');
  } catch (error) {
    logger.error(`Gap analysis failed: ${error.message}`);
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main();
