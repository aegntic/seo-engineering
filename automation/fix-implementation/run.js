#!/usr/bin/env node

/**
 * Automated Fix Implementation Runner
 * 
 * Command-line script to execute the fix implementation system:
 * - Accepts site and issue data as input
 * - Runs the fix implementation process
 * - Outputs results to console or file
 */

const fs = require('fs');
const path = require('path');
const fixEngine = require('./fixEngine');
const logger = require('../utils/logger');

// Process command-line arguments
const args = process.argv.slice(2);
let inputFile = null;
let outputFile = null;
let options = {
  autoPush: false,
  dryRun: false,
  prioritized: false
};

// Parse arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '--input' || arg === '-i') {
    inputFile = args[++i];
  } else if (arg === '--output' || arg === '-o') {
    outputFile = args[++i];
  } else if (arg === '--auto-push') {
    options.autoPush = true;
  } else if (arg === '--dry-run') {
    options.dryRun = true;
  } else if (arg === '--prioritized') {
    options.prioritized = true;
  } else if (arg === '--help' || arg === '-h') {
    printHelp();
    process.exit(0);
  }
}

// Ensure we have an input file
if (!inputFile) {
  console.error('Error: Input file is required');
  printHelp();
  process.exit(1);
}

// Main execution function
async function run() {
  try {
    // Read input data
    logger.info(`Reading input from ${inputFile}`);
    const inputData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    
    if (!inputData.site || !inputData.issues) {
      throw new Error('Input data must contain site and issues');
    }
    
    // Execute fix implementation
    logger.info(`Starting fix implementation for site: ${inputData.site.url}`);
    logger.info(`Processing ${inputData.issues.length} issues`);
    
    if (options.dryRun) {
      logger.info('DRY RUN MODE - No changes will be committed');
    }
    
    const results = options.dryRun 
      ? { summary: { site: inputData.site.url, totalIssues: inputData.issues.length } }
      : await fixEngine.implementFixes(inputData.site, inputData.issues, options);
    
    // Output results
    if (outputFile) {
      logger.info(`Writing results to ${outputFile}`);
      fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    } else {
      console.log('\nResults:');
      console.log(JSON.stringify(results.summary, null, 2));
      
      if (results.results) {
        console.log(`\nSuccessful fixes: ${results.results.successful.length}`);
        console.log(`Failed fixes: ${results.results.failed.length}`);
        console.log(`Skipped fixes: ${results.results.skipped.length}`);
      }
    }
    
    logger.info('Fix implementation completed');
  } catch (error) {
    logger.error(`Fix implementation failed: ${error.message}`, error);
    process.exit(1);
  }
}

// Print help information
function printHelp() {
  console.log(`
Automated Fix Implementation Runner

Usage: node run.js [options]

Options:
  --input, -i <file>     Input JSON file with site and issues data (required)
  --output, -o <file>    Output file for results (optional)
  --auto-push            Automatically push changes to remote repository
  --dry-run              Execute in dry run mode (no actual changes)
  --prioritized          Skip prioritization step (issues are already prioritized)
  --help, -h             Show this help message

Example:
  node run.js --input ./data/site1-issues.json --output ./results/site1-fixes.json
  `);
}

// Execute the runner
run();
