/**
 * Test script for Detailed Performance Tracking module
 * 
 * This script tests the functionality of the Detailed Performance Tracking module
 * by analyzing a test URL and generating a comprehensive performance report.
 */

const DetailedPerformanceTracking = require('../index');
const fs = require('fs').promises;
const path = require('path');

// Configure logging
const verbose = process.argv.includes('--verbose');
const log = (message) => {
  if (verbose) {
    console.log(message);
  }
};

// Test URLs
const TEST_URLS = [
  'https://example.com',
  'https://mozilla.org'
];

// Main test function
async function runTests() {
  console.log('Starting Detailed Performance Tracking module tests...');
  
  try {
    // Initialize the module
    const tracker = new DetailedPerformanceTracking({
      browsers: ['chromium'],
      deviceEmulation: ['desktop', 'mobile'],
      captureResourceDetails: true,
      enableWaterfallVisualization: true
    });
    
    log('Module initialized successfully');
    
    // Test single URL analysis
    console.log(`\nTesting URL analysis for: ${TEST_URLS[0]}`);
    const startTime = Date.now();
    
    try {
      const results = await tracker.analyzeUrl(TEST_URLS[0]);
      const duration = (Date.now() - startTime) / 1000;
      
      console.log(`✅ Analysis completed in ${duration.toFixed(2)}s`);
      log(`Results contain ${Object.keys(results).length} top-level keys`);
      
      // Save results for inspection
      await saveResults('single-url-analysis.json', results);
      console.log('✅ Results saved to tests/output/single-url-analysis.json');
      
      // Validate results structure
      validateResults(results);
      
    } catch (error) {
      console.error(`❌ URL analysis failed: ${error.message}`);
      if (verbose) {
        console.error(error);
      }
    }
    
    // Test site-wide analysis (multiple URLs)
    console.log(`\nTesting site-wide analysis with ${TEST_URLS.length} URLs`);
    const siteStartTime = Date.now();
    
    try {
      const siteResults = await tracker.analyzeSite(TEST_URLS);
      const siteDuration = (Date.now() - siteStartTime) / 1000;
      
      console.log(`✅ Site analysis completed in ${siteDuration.toFixed(2)}s`);
      log(`Site results contain data for ${siteResults.urls.length} URLs`);
      
      // Save site results
      await saveResults('site-analysis.json', siteResults);
      console.log('✅ Site results saved to tests/output/site-analysis.json');
      
      // Validate site results
      validateSiteResults(siteResults);
      
    } catch (error) {
      console.error(`❌ Site analysis failed: ${error.message}`);
      if (verbose) {
        console.error(error);
      }
    }
    
    console.log('\nAll tests completed!');
    
  } catch (error) {
    console.error(`❌ Test suite failed: ${error.message}`);
    if (verbose) {
      console.error(error);
    }
    process.exit(1);
  }
}

/**
 * Save test results to file
 * 
 * @param {string} filename - Output filename
 * @param {Object} data - Result data to save
 */
async function saveResults(filename, data) {
  try {
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, 'output');
    try {
      await fs.mkdir(outputDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }
    
    // Write results to file
    const outputPath = path.join(outputDir, filename);
    await fs.writeFile(
      outputPath, 
      JSON.stringify(data, null, 2)
    );
    
  } catch (error) {
    console.error(`Failed to save results: ${error.message}`);
    throw error;
  }
}

/**
 * Validate single URL analysis results
 * 
 * @param {Object} results - Analysis results
 */
function validateResults(results) {
  console.log('\nValidating results structure...');
  
  // Check for required top-level keys
  const requiredKeys = [
    'url', 
    'summary',
    'scores',
    'coreWebVitals',
    'performanceMetrics',
    'bottlenecks',
    'recommendations'
  ];
  
  const missingKeys = requiredKeys.filter(key => !results[key]);
  
  if (missingKeys.length > 0) {
    console.error(`❌ Missing required keys: ${missingKeys.join(', ')}`);
  } else {
    console.log('✅ All required top-level keys present');
  }
  
  // Check scores
  if (results.scores) {
    const scoreKeys = [
      'overall',
      'coreWebVitals',
      'resourceEfficiency',
      'javascriptExecution',
      'browserCompatibility'
    ];
    
    const missingScores = scoreKeys.filter(key => 
      results.scores[key] === undefined
    );
    
    if (missingScores.length > 0) {
      console.error(`❌ Missing scores: ${missingScores.join(', ')}`);
    } else {
      console.log('✅ All performance scores present');
    }
    
    // Validate score ranges
    const invalidScores = Object.entries(results.scores)
      .filter(([key, value]) => value < 0 || value > 100);
    
    if (invalidScores.length > 0) {
      console.error(`❌ Invalid score ranges: ${invalidScores.map(([k, v]) => `${k}: ${v}`).join(', ')}`);
    } else {
      console.log('✅ All scores within valid range (0-100)');
    }
  }
  
  // Check recommendations
  if (results.recommendations) {
    if (!Array.isArray(results.recommendations.prioritized)) {
      console.error('❌ recommendations.prioritized is not an array');
    } else {
      console.log(`✅ ${results.recommendations.prioritized.length} prioritized recommendations found`);
    }
  }
  
  // Check bottlenecks
  if (results.bottlenecks && results.bottlenecks.all) {
    console.log(`✅ ${results.bottlenecks.all.length} performance bottlenecks identified`);
  }
  
  // Check visualizations
  if (results.visualizations) {
    console.log('✅ Visualization data included in results');
  } else {
    console.error('❌ Missing visualization data');
  }
}

/**
 * Validate site-wide analysis results
 * 
 * @param {Object} results - Site analysis results
 */
function validateSiteResults(results) {
  console.log('\nValidating site-wide results structure...');
  
  // Check for required keys
  const requiredKeys = ['urls', 'summary', 'siteWideBottlenecks', 'recommendations'];
  const missingKeys = requiredKeys.filter(key => !results[key]);
  
  if (missingKeys.length > 0) {
    console.error(`❌ Missing required site analysis keys: ${missingKeys.join(', ')}`);
  } else {
    console.log('✅ All required site analysis keys present');
  }
  
  // Check URL results
  if (Array.isArray(results.urls)) {
    console.log(`✅ Results for ${results.urls.length} URLs included`);
  } else {
    console.error('❌ Missing URL results array');
  }
  
  // Check site-wide bottlenecks
  if (Array.isArray(results.siteWideBottlenecks)) {
    console.log(`✅ ${results.siteWideBottlenecks.length} site-wide bottlenecks identified`);
  } else {
    console.error('❌ Missing site-wide bottlenecks array');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
