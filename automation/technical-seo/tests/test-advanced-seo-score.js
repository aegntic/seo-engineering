/**
 * Test script for Advanced SEO Score Calculator
 * 
 * This script tests the Advanced SEO Score Calculator on SEO data
 * and outputs the detailed results.
 */

const AdvancedSeoScoreCalculator = require('../analyzers/advanced-seo-score');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Parse command line arguments
const args = process.argv.slice(2);
const dataPath = args[0]; // Path to SEO data JSON file
const industry = args[1] || 'general'; // Industry category
const vertical = args[2] || 'general'; // Vertical within industry

async function main() {
  try {
    // Check if data path is provided
    if (!dataPath) {
      console.error('Please provide a path to SEO data JSON file');
      console.log('Usage: node test-advanced-seo-score.js <data-path> [industry] [vertical]');
      return;
    }
    
    // Load SEO data
    console.log(`Loading SEO data from ${dataPath}...`);
    const seoDataRaw = await fs.readFile(dataPath, 'utf8');
    const seoData = JSON.parse(seoDataRaw);
    
    // Extract URL from SEO data
    const url = seoData.url || 'https://example.com';
    
    console.log(`Calculating advanced SEO score for ${url} (${industry}/${vertical})...`);
    
    // Run the Advanced SEO Score Calculator
    const results = await AdvancedSeoScoreCalculator.calculate(url, seoData, {
      industry,
      vertical
    });
    
    // Create test results directory if it doesn't exist
    const resultsDir = path.join(__dirname, '../test-results');
    await fs.mkdir(resultsDir, { recursive: true });
    
    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `advanced-seo-score_${url.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.json`;
    const filePath = path.join(resultsDir, filename);
    
    await fs.writeFile(filePath, JSON.stringify(results, null, 2));
    
    // Print summary to console
    console.log('\nAdvanced SEO Score Results:');
    console.log('----------------------------------');
    console.log(`Overall Score: ${results.score.overall}/100`);
    console.log(`Industry: ${industry}`);
    console.log(`Vertical: ${vertical}`);
    
    // Print category scores
    console.log('\nCategory Scores:');
    for (const [category, score] of Object.entries(results.score.categories)) {
      console.log(`  - ${category}: ${score}`);
    }
    
    // Print top performing factors
    console.log('\nTop Performing Factors:');
    results.summary.topPerformingFactors.forEach((factor, index) => {
      console.log(`  ${index + 1}. ${factor.factor}: ${factor.score}`);
    });
    
    // Print underperforming factors
    console.log('\nUnderperforming Factors:');
    results.summary.underperformingFactors.forEach((factor, index) => {
      console.log(`  ${index + 1}. ${factor.factor}: ${factor.score}`);
    });
    
    // Print benchmark position
    console.log(`\nBenchmark Position: ${results.summary.benchmarkPosition}`);
    
    // Print recommendations count
    console.log(`\nRecommendations: ${results.recommendations.length}`);
    results.recommendations.slice(0, 3).forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec.title}`);
      console.log(`     ${rec.description.slice(0, 100)}...`);
    });
    
    console.log(`\nFull results saved to: ${filePath}`);
    
  } catch (error) {
    console.error('Error running Advanced SEO Score Calculator:', error);
  }
}

main().catch(console.error);
