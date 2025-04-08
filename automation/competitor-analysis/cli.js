#!/usr/bin/env node

/**
 * SEO.engineering Competitor Analysis CLI
 * 
 * Command-line interface for running competitor analysis.
 */

const fs = require('fs').promises;
const path = require('path');
const CompetitorAnalysisService = require('./services/analysis-service');
const logger = require('./utils/logger');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  outputDir: path.join(process.cwd(), 'competitor-analysis'),
  competitors: [],
  clientSiteUrl: null,
  keywords: [],
  maxPages: 50,
  concurrency: 2,
  depth: 2,
  configFile: null
};

// Help message
function showHelp() {
  console.log('SEO.engineering Competitor Analysis');
  console.log('===============================\n');
  console.log('Usage: node cli.js [options]\n');
  console.log('Options:');
  console.log('  --help                Show this help message');
  console.log('  --competitor URL      Add a competitor URL to analyze (can be used multiple times)');
  console.log('  --competitors FILE    Load competitor URLs from a text file (one URL per line)');
  console.log('  --client URL          Specify the client\'s website URL for comparison');
  console.log('  --keyword KEYWORD     Add a keyword to analyze (can be used multiple times)');
  console.log('  --keywords FILE       Load keywords from a text file (one keyword per line)');
  console.log('  --output DIR          Set the output directory (default: ./competitor-analysis)');
  console.log('  --max-pages N         Set the maximum pages to crawl per competitor (default: 50)');
  console.log('  --concurrency N       Set the concurrency level (default: 2)');
  console.log('  --depth N             Set the crawl depth (default: 2)');
  console.log('  --config FILE         Load configuration from a JSON file\n');
  console.log('Examples:');
  console.log('  node cli.js --competitor https://example.com --client https://mysite.com');
  console.log('  node cli.js --competitors competitors.txt --keywords keywords.txt --output ./results');
  console.log('  node cli.js --config analysis-config.json\n');
}

// Parse arguments
async function parseArgs() {
  let i = 0;
  while (i < args.length) {
    const arg = args[i++];
    
    if (arg === '--help') {
      showHelp();
      process.exit(0);
    } else if (arg === '--competitor' && i < args.length) {
      options.competitors.push(args[i++]);
    } else if (arg === '--competitors' && i < args.length) {
      const filePath = args[i++];
      try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const competitors = fileContent.split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('#'));
        
        options.competitors.push(...competitors);
      } catch (err) {
        console.error(`Error reading competitors file: ${err.message}`);
        process.exit(1);
      }
    } else if (arg === '--client' && i < args.length) {
      options.clientSiteUrl = args[i++];
    } else if (arg === '--keyword' && i < args.length) {
      options.keywords.push(args[i++]);
    } else if (arg === '--keywords' && i < args.length) {
      const filePath = args[i++];
      try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const keywords = fileContent.split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('#'));
        
        options.keywords.push(...keywords);
      } catch (err) {
        console.error(`Error reading keywords file: ${err.message}`);
        process.exit(1);
      }
    } else if (arg === '--output' && i < args.length) {
      options.outputDir = args[i++];
    } else if (arg === '--max-pages' && i < args.length) {
      options.maxPages = parseInt(args[i++], 10);
    } else if (arg === '--concurrency' && i < args.length) {
      options.concurrency = parseInt(args[i++], 10);
    } else if (arg === '--depth' && i < args.length) {
      options.depth = parseInt(args[i++], 10);
    } else if (arg === '--config' && i < args.length) {
      options.configFile = args[i++];
      try {
        const configContent = await fs.readFile(options.configFile, 'utf8');
        const config = JSON.parse(configContent);
        
        // Merge configuration
        Object.assign(options, config);
      } catch (err) {
        console.error(`Error reading config file: ${err.message}`);
        process.exit(1);
      }
    } else {
      console.error(`Unknown option: ${arg}`);
      showHelp();
      process.exit(1);
    }
  }
  
  // Validate options
  if (options.competitors.length === 0) {
    console.error('Error: At least one competitor URL must be provided');
    showHelp();
    process.exit(1);
  }
}

// Run the analysis
async function runAnalysis() {
  // Parse command line arguments
  await parseArgs();
  
  console.log('SEO.engineering Competitor Analysis');
  console.log('===============================\n');
  console.log('Configuration:');
  console.log(`- Output directory: ${options.outputDir}`);
  console.log(`- Competitors: ${options.competitors.length}`);
  console.log(`- Client site: ${options.clientSiteUrl || 'Not specified'}`);
  console.log(`- Keywords: ${options.keywords.length}`);
  console.log(`- Max pages per competitor: ${options.maxPages}`);
  console.log(`- Concurrency: ${options.concurrency}`);
  console.log(`- Crawl depth: ${options.depth}`);
  console.log('');
  
  // Create service
  const analysisService = new CompetitorAnalysisService({
    outputDir: options.outputDir,
    maxPagesPerCompetitor: options.maxPages,
    maxConcurrency: options.concurrency,
    maxDepth: options.depth
  });
  
  try {
    console.log('Starting competitor analysis...');
    
    // Start the analysis
    const job = await analysisService.runAnalysis({
      competitors: options.competitors,
      clientSiteUrl: options.clientSiteUrl,
      keywords: options.keywords
    });
    
    console.log(`Analysis job started with ID: ${job.jobId}`);
    console.log('');
    
    // Poll for completion
    let completed = false;
    const startTime = Date.now();
    
    while (!completed) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      try {
        const status = await analysisService.getJobStatus(job.jobId);
        
        // Calculate elapsed time
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;
        const timeStr = `${minutes}m ${seconds}s`;
        
        // Display progress based on status
        if (status.status === 'crawling') {
          process.stdout.write(`\rCrawling websites - ${status.progress.completed}/${status.progress.total} completed (${timeStr})`);
        } else if (status.status === 'analyzing') {
          process.stdout.write(`\rAnalyzing data (${timeStr})`);
        } else if (status.status === 'generating_reports') {
          process.stdout.write(`\rGenerating reports (${timeStr})`);
        } else if (status.status === 'completed') {
          console.log(`\nAnalysis completed in ${timeStr}`);
          completed = true;
        } else if (status.status === 'failed') {
          console.error(`\nAnalysis failed: ${status.error}`);
          completed = true;
        }
      } catch (err) {
        console.error(`\nError checking job status: ${err.message}`);
        break;
      }
    }
    
    // If completed successfully, show the results
    if (completed) {
      try {
        const results = await analysisService.getAnalysisResults(job.jobId);
        
        console.log('\nAnalysis Results:');
        console.log(`- Competitors analyzed: ${results.summary.competitors}`);
        console.log(`- Total pages analyzed: ${Object.values(results.competitorData)
          .reduce((sum, data) => sum + (data.summary?.pagesAnalyzed || 0), 0)}`);
        
        const summaryReportPath = results.reports?.summary;
        const detailedReportPath = results.reports?.detailed;
        
        console.log('\nReports generated:');
        if (summaryReportPath) {
          console.log(`- Summary report: ${summaryReportPath}`);
        }
        if (detailedReportPath) {
          console.log(`- Detailed report: ${detailedReportPath}`);
        }
        
        console.log('\nAnalysis complete!');
      } catch (err) {
        console.error(`Error retrieving results: ${err.message}`);
      }
    }
  } catch (err) {
    console.error(`Error running analysis: ${err.message}`);
  } finally {
    // Close the service
    await analysisService.close();
  }
}

// Run the analysis
runAnalysis().catch(err => {
  console.error(`Unhandled error: ${err.message}`);
  process.exit(1);
});
