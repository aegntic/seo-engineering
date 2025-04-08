/**
 * SEO.engineering CMS Platform Testing
 * 
 * This script tests the crawler across different CMS platforms
 * to ensure compatibility and proper performance.
 */

const OptimizedCrawler = require('./optimizedCrawler');
const CrawlerConfig = require('./crawlerConfig');
const CMSDetector = require('./cmsDetector');
const testSites = require('./cmsTestSites');
const fs = require('fs').promises;
const path = require('path');

// Create results directory
const resultsDir = path.join(__dirname, 'test-results');

/**
 * Run tests across all CMS platforms
 * @param {Object} options Testing options
 */
async function runTests(options = {}) {
  const {
    sitesToTest = testSites,
    categoriesFilter = null,
    popularityFilter = null,
    maxSites = null,
    testDepth = 2,
    concurrency = 2
  } = options;
  
  console.log('Starting CMS platform compatibility tests');
  console.log(`Configuration: Depth=${testDepth}, Concurrency=${concurrency}`);
  
  // Create results directory if it doesn't exist
  try {
    await fs.mkdir(resultsDir, { recursive: true });
  } catch (err) {
    console.error(`Failed to create results directory: ${err.message}`);
    return;
  }
  
  // Filter sites if needed
  let sitesToExecute = [...sitesToTest];
  
  if (categoriesFilter) {
    const categories = Array.isArray(categoriesFilter) ? categoriesFilter : [categoriesFilter];
    sitesToExecute = sitesToExecute.filter(site => categories.includes(site.category));
    console.log(`Filtered to ${sitesToExecute.length} sites in categories: ${categories.join(', ')}`);
  }
  
  if (popularityFilter) {
    const popularities = Array.isArray(popularityFilter) ? popularityFilter : [popularityFilter];
    sitesToExecute = sitesToExecute.filter(site => popularities.includes(site.popularity));
    console.log(`Filtered to ${sitesToExecute.length} sites with popularity: ${popularities.join(', ')}`);
  }
  
  if (maxSites && maxSites > 0 && sitesToExecute.length > maxSites) {
    sitesToExecute = sitesToExecute.slice(0, maxSites);
    console.log(`Limited to ${sitesToExecute.length} sites for this test run`);
  }
  
  // Initialize results
  const results = {
    testDate: new Date().toISOString(),
    testConfig: {
      testDepth,
      concurrency,
      categoriesFilter,
      popularityFilter,
      maxSites
    },
    summary: {
      totalSites: sitesToExecute.length,
      successful: 0,
      failed: 0,
      cmsDetectionAccuracy: 0
    },
    siteResults: [],
    categories: {}
  };
  
  // Test each site
  for (const site of sitesToExecute) {
    console.log(`\n--- Testing ${site.name} (${site.url}) ---`);
    console.log(`Category: ${site.category}, Popularity: ${site.popularity}`);
    
    try {
      const siteResult = await testSite(site, { testDepth, concurrency });
      results.siteResults.push(siteResult);
      
      // Update summary
      if (siteResult.success) {
        results.summary.successful++;
      } else {
        results.summary.failed++;
      }
      
      // Check CMS detection accuracy
      if (siteResult.detectedCMS === site.expectedCMS) {
        results.summary.cmsDetectionAccuracy++;
      }
      
      // Update category statistics
      if (!results.categories[site.category]) {
        results.categories[site.category] = {
          total: 0,
          successful: 0,
          failed: 0,
          cmsDetectionAccuracy: 0
        };
      }
      
      results.categories[site.category].total++;
      
      if (siteResult.success) {
        results.categories[site.category].successful++;
      } else {
        results.categories[site.category].failed++;
      }
      
      if (siteResult.detectedCMS === site.expectedCMS) {
        results.categories[site.category].cmsDetectionAccuracy++;
      }
      
    } catch (err) {
      console.error(`Failed to test ${site.name}: ${err.message}`);
      results.siteResults.push({
        name: site.name,
        url: site.url,
        category: site.category,
        popularity: site.popularity,
        success: false,
        error: err.message
      });
      results.summary.failed++;
      
      // Update category statistics for failures
      if (!results.categories[site.category]) {
        results.categories[site.category] = {
          total: 0,
          successful: 0,
          failed: 0,
          cmsDetectionAccuracy: 0
        };
      }
      
      results.categories[site.category].total++;
      results.categories[site.category].failed++;
    }
  }
  
  // Calculate final accuracy percentages
  results.summary.cmsDetectionAccuracyPercent = 
    (results.summary.cmsDetectionAccuracy / results.summary.totalSites) * 100;
  
  // Calculate category percentages
  Object.keys(results.categories).forEach(category => {
    const cat = results.categories[category];
    cat.successRate = (cat.successful / cat.total) * 100;
    cat.cmsDetectionAccuracyPercent = (cat.cmsDetectionAccuracy / cat.total) * 100;
  });
  
  // Save results
  const resultsFile = path.join(resultsDir, `cms-test-results-${Date.now()}.json`);
  await fs.writeFile(resultsFile, JSON.stringify(results, null, 2));
  
  // Log summary
  console.log('\n--- Test Summary ---');
  console.log(`Total sites tested: ${results.summary.totalSites}`);
  console.log(`Successful tests: ${results.summary.successful}`);
  console.log(`Failed tests: ${results.summary.failed}`);
  console.log(`CMS detection accuracy: ${results.summary.cmsDetectionAccuracyPercent.toFixed(1)}%`);
  
  console.log('\n--- Category Results ---');
  Object.entries(results.categories).forEach(([category, stats]) => {
    console.log(`${category}: ${stats.successful}/${stats.total} successful (${stats.successRate.toFixed(1)}%), Detection accuracy: ${stats.cmsDetectionAccuracyPercent.toFixed(1)}%`);
  });
  
  console.log(`\nResults saved to: ${resultsFile}`);
  
  return results;
}

/**
 * Test a single site
 * @param {Object} site Site to test
 * @param {Object} options Test options
 * @returns {Object} Test results
 */
async function testSite(site, options = {}) {
  const { testDepth = 2, concurrency = 2 } = options;
  
  // Create a configuration optimized for testing
  const config = new CrawlerConfig({
    maxConcurrency: concurrency,
    maxRequestsPerSecond: 5,
    enableCaching: true,
    maxDepth: testDepth,
    maxMemoryUsage: 1024, // 1GB maximum
    navigationTimeout: 30000, // 30 seconds
    requestTimeout: 15000, // 15 seconds
    followRedirects: true,
    respectRobotsTxt: true
  });
  
  // Initialize crawler
  const crawler = new OptimizedCrawler({ config });
  
  // Initialize CMS detector
  const cmsDetector = new CMSDetector();
  
  // Start time
  const startTime = Date.now();
  
  // Track events
  const events = {
    pages: 0,
    errors: 0,
    resources: 0
  };
  
  crawler.on('page', () => events.pages++);
  crawler.on('error', () => events.errors++);
  crawler.on('resource', () => events.resources++);
  
  try {
    // Initialize the crawler
    await crawler.initialize();
    
    // Start the crawl (limited scope for testing)
    const crawlResults = await crawler.crawl(site.url);
    
    // Calculate performance metrics
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    const pagesPerSecond = events.pages / duration;
    
    // Analyze first page for CMS detection
    const firstPageUrl = Object.keys(crawlResults.urlData)[0] || site.url;
    const firstPageData = crawlResults.urlData[firstPageUrl] || {};
    
    // Detect CMS
    let detectedCMS = 'unknown';
    let cmsConfidence = 'None';
    let cmsDetails = null;
    
    if (firstPageData) {
      const cmsResults = cmsDetector.detectCMS(
        firstPageUrl,
        JSON.stringify(firstPageData), // Simulate HTML content from data
        firstPageData.headers || {}
      );
      
      detectedCMS = cmsResults.cms || 'unknown';
      cmsConfidence = cmsResults.confidence;
      cmsDetails = cmsResults.details;
    }
    
    // Get any errors or warnings
    const issues = crawler.getIssues();
    
    // Close the crawler
    await crawler.close();
    
    // Return results
    return {
      name: site.name,
      url: site.url,
      category: site.category,
      popularity: site.popularity,
      success: true,
      expectedCMS: site.expectedCMS,
      detectedCMS,
      cmsConfidence,
      cmsDetailsMatch: detectedCMS === site.expectedCMS,
      performance: {
        duration,
        pagesProcessed: events.pages,
        resourcesProcessed: events.resources,
        errors: events.errors,
        pagesPerSecond,
        crawlStats: crawlResults.stats || {}
      },
      crawlIssues: issues.length > 0 ? issues.slice(0, 10) : [], // Limit to 10 issues for report size
      cmsOptimizationTips: cmsDetails ? cmsDetails.optimizationTips : [],
      cmsTestAreas: cmsDetails ? cmsDetails.testAreas : []
    };
  } catch (err) {
    // Make sure crawler is closed even on error
    try {
      await crawler.close();
    } catch (closeErr) {
      console.error(`Error closing crawler: ${closeErr.message}`);
    }
    
    throw err;
  }
}

// If this file is executed directly, run the tests
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--category' && args[i+1]) {
      options.categoriesFilter = args[i+1].split(',');
      i++;
    } else if (args[i] === '--popularity' && args[i+1]) {
      options.popularityFilter = args[i+1].split(',');
      i++;
    } else if (args[i] === '--max-sites' && args[i+1]) {
      options.maxSites = parseInt(args[i+1], 10);
      i++;
    } else if (args[i] === '--depth' && args[i+1]) {
      options.testDepth = parseInt(args[i+1], 10);
      i++;
    } else if (args[i] === '--concurrency' && args[i+1]) {
      options.concurrency = parseInt(args[i+1], 10);
      i++;
    }
  }
  
  runTests(options).catch(err => {
    console.error(`Test execution failed: ${err.message}`);
    process.exit(1);
  });
} else {
  // Export the function for use in other files
  module.exports = { runTests, testSite };
}
