/**
 * Test script for JavaScript Error Detector
 * 
 * This script tests the JavaScript Error Detector on a specified URL
 * and outputs the results.
 */

const JSErrorDetector = require('../analyzers/js-error-detector');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Parse command line arguments
const args = process.argv.slice(2);
const url = args[0] || 'https://example.com';

async function main() {
  console.log(`Starting JavaScript Error Detection for: ${url}`);
  
  try {
    // Run the analysis
    const results = await JSErrorDetector.detect(url, {
      // Additional options can be specified here
      simulateInteraction: true,
      checkMobile: true,
      timeout: 30000
    });
    
    // Create test results directory if it doesn't exist
    const resultsDir = path.join(__dirname, '../test-results');
    await fs.mkdir(resultsDir, { recursive: true });
    
    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `js-error-test_${url.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.json`;
    const filePath = path.join(resultsDir, filename);
    
    await fs.writeFile(filePath, JSON.stringify(results, null, 2));
    
    // Print summary to console
    console.log('\nJavaScript Error Detection Results:');
    console.log('----------------------------------');
    console.log(`Score: ${results.score}/100`);
    console.log(`Total Errors Detected: ${results.metrics.totalErrors}`);
    console.log(`Issues Identified: ${results.issues.length}`);
    console.log('\nError Categories:');
    
    for (const [category, count] of Object.entries(results.metrics.errorsByType)) {
      console.log(`- ${category}: ${count}`);
    }
    
    console.log('\nTop Issues:');
    results.issues.slice(0, 3).forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.title} (${issue.severity})`);
      console.log(`   ${issue.description}`);
    });
    
    console.log(`\nFull results saved to: ${filePath}`);
    
  } catch (error) {
    console.error('Error running JavaScript Error Detection:', error);
  }
}

main().catch(console.error);
