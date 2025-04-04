/**
 * Test script for Broken Link Identifier
 * 
 * This script tests the Broken Link Identifier on a specified URL
 * and outputs the results.
 */

const BrokenLinkIdentifier = require('../analyzers/broken-link-identifier');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Parse command line arguments
const args = process.argv.slice(2);
const url = args[0] || 'https://example.com';
const concurrentChecks = parseInt(args[1]) || 5;

async function main() {
  console.log(`Starting Broken Link Analysis for: ${url} (Concurrent checks: ${concurrentChecks})`);
  
  try {
    // Run the analysis
    const results = await BrokenLinkIdentifier.identify(url, {
      concurrentChecks,
      linkCheckTimeout: 10000,
      timeout: 30000
    });
    
    // Create test results directory if it doesn't exist
    const resultsDir = path.join(__dirname, '../test-results');
    await fs.mkdir(resultsDir, { recursive: true });
    
    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `broken-link-test_${url.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.json`;
    const filePath = path.join(resultsDir, filename);
    
    await fs.writeFile(filePath, JSON.stringify(results, null, 2));
    
    // Print summary to console
    console.log('\nBroken Link Analysis Results:');
    console.log('----------------------------------');
    console.log(`Score: ${results.score}/100`);
    console.log(`Total Links: ${results.metrics.totalLinks}`);
    console.log(`Broken Links: ${results.metrics.brokenLinks} (${results.metrics.brokenLinks / results.metrics.totalLinks * 100}%)`);
    console.log(`  - Internal: ${results.metrics.brokenInternalLinks}`);
    console.log(`  - External: ${results.metrics.brokenExternalLinks}`);
    
    console.log('\nStatus Code Distribution:');
    for (const [statusCode, count] of Object.entries(results.metrics.linksByStatusCode)) {
      console.log(`  - ${statusCode}: ${count}`);
    }
    
    console.log('\nTop Issues:');
    results.issues.slice(0, 3).forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.title} (${issue.severity})`);
      console.log(`   ${issue.description}`);
    });
    
    console.log('\nBroken Link Examples:');
    results.brokenLinkDetails.slice(0, 5).forEach((link, index) => {
      console.log(`${index + 1}. ${link.href} (${link.statusCode})`);
      console.log(`   Text: "${link.text}"`);
      console.log(`   Type: ${link.isInternal ? 'Internal' : 'External'}`);
    });
    
    console.log(`\nFull results saved to: ${filePath}`);
    
  } catch (error) {
    console.error('Error running Broken Link Analysis:', error);
  }
}

main().catch(console.error);
