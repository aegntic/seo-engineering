/**
 * Test script for Trend Analysis Reporting module
 * 
 * Tests the functionality of the Trend Analysis Reporting module by
 * generating sample historical data and analyzing trends.
 */

const TrendAnalysisReporting = require('../index');
const MetricsSnapshot = require('../models/metricsSnapshot');
const fs = require('fs').promises;
const path = require('path');

// Configure logging
const verbose = process.argv.includes('--verbose');
const log = (message) => {
  if (verbose) {
    console.log(message);
  }
};

// Test site ID
const TEST_SITE_ID = 'test-site-example-com';

// Test constants
const DAYS_OF_DATA = 60;
const DATA_POINTS_PER_DAY = 1;

// Generate random within range, with optional trend
function randomInRange(min, max, day = 0, totalDays = 60, trend = 0) {
  const randomValue = Math.random() * (max - min) + min;
  // Apply trend effect: 0 = no trend, positive = improving, negative = degrading
  const trendEffect = trend * (day / totalDays);
  return randomValue * (1 + trendEffect);
}

// Async sleep function
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main test function
async function runTests() {
  console.log('Starting Trend Analysis Reporting module tests...');
  
  try {
    // Initialize the module with file storage
    const trendAnalysis = new TrendAnalysisReporting({
      storageType: 'file',
      storageDir: path.join(__dirname, 'data')
    });
    
    log('Module initialized successfully');
    
    // Generate sample historical data if it doesn't exist
    await generateSampleData(trendAnalysis);
    
    // Test generating a trend report
    console.log('\nTesting trend report generation...');
    const startTime = Date.now();
    
    try {
      const report = await trendAnalysis.generateTrendReport(TEST_SITE_ID, {
        trackingPeriod: 90,
        enablePrediction: true,
        predictionHorizon: 30
      });
      
      const duration = (Date.now() - startTime) / 1000;
      console.log(`✅ Report generated in ${duration.toFixed(2)}s`);
      
      // Save report for inspection
      await saveResults('trend-report.json', report);
      console.log('✅ Report saved to tests/output/trend-report.json');
      
      // Validate report structure
      validateReport(report);
      
    } catch (error) {
      console.error(`❌ Report generation failed: ${error.message}`);
      if (verbose) {
        console.error(error);
      }
    }
    
    // Test with competitor benchmarking
    console.log('\nTesting competitor registration and benchmarking...');
    
    try {
      // Register a test competitor
      await trendAnalysis.registerCompetitor(
        TEST_SITE_ID,
        'https://competitor-example.com',
        { analyzeImmediately: false }
      );
      
      // Generate fake competitor data
      await generateCompetitorData(trendAnalysis);
      
      // Test competitor comparison
      const comparisonResult = await trendAnalysis.compareWithCompetitors(
        TEST_SITE_ID, 
        'score',
        { 
          siteMetrics: { metrics: { score: 85 } }
        }
      );
      
      console.log('✅ Competitor comparison successful');
      
      // Save comparison for inspection
      await saveResults('competitor-comparison.json', comparisonResult);
      console.log('✅ Comparison saved to tests/output/competitor-comparison.json');
      
    } catch (error) {
      console.error(`❌ Competitor benchmarking failed: ${error.message}`);
      if (verbose) {
        console.error(error);
      }
    }
    
    // Test prediction
    console.log('\nTesting performance prediction...');
    
    try {
      const prediction = await trendAnalysis.predictMetric(
        TEST_SITE_ID,
        'score',
        30
      );
      
      console.log('✅ Prediction successful');
      
      // Save prediction for inspection
      await saveResults('prediction.json', prediction);
      console.log('✅ Prediction saved to tests/output/prediction.json');
      
    } catch (error) {
      console.error(`❌ Prediction failed: ${error.message}`);
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
 * Generate sample historical data
 * 
 * @param {TrendAnalysisReporting} trendAnalysis - Trend analysis module
 */
async function generateSampleData(trendAnalysis) {
  console.log('Checking for existing data...');
  
  try {
    // Check if data exists
    let historicalData;
    try {
      historicalData = await trendAnalysis.historicalDataStore.getHistoricalData(TEST_SITE_ID, 90);
    } catch (error) {
      historicalData = [];
    }
    
    if (historicalData.length >= DAYS_OF_DATA) {
      console.log(`Using existing data (${historicalData.length} data points)`);
      return;
    }
    
    console.log('Generating sample historical data...');
    
    // Generate data over time with different trends for different metrics
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - DAYS_OF_DATA);
    
    // Generate metrics with different trends
    // score: positive trend (improving)
    // largestContentfulPaint: negative trend (improving)
    // cumulativeLayoutShift: stable trend
    // totalBlockingTime: positive trend (degrading)
    
    for (let day = 0; day < DAYS_OF_DATA; day++) {
      for (let point = 0; point < DATA_POINTS_PER_DAY; point++) {
        // Create date for this data point
        const date = new Date(startDate);
        date.setDate(date.getDate() + day);
        date.setHours(Math.floor(24 * point / DATA_POINTS_PER_DAY));
        
        // Generate metrics with trends
        const metrics = {
          score: randomInRange(70, 90, day, DAYS_OF_DATA, 0.2),
          largestContentfulPaint: randomInRange(2000, 3000, day, DAYS_OF_DATA, -0.15),
          cumulativeLayoutShift: randomInRange(0.05, 0.15, day, DAYS_OF_DATA, 0),
          totalBlockingTime: randomInRange(200, 400, day, DAYS_OF_DATA, 0.1),
          firstContentfulPaint: randomInRange(1500, 2500, day, DAYS_OF_DATA, -0.1),
          timeToInteractive: randomInRange(3000, 5000, day, DAYS_OF_DATA, -0.05),
          resourceSize: randomInRange(1000000, 2000000, day, DAYS_OF_DATA, -0.1),
          requestCount: randomInRange(50, 80, day, DAYS_OF_DATA, -0.05),
        };
        
        // Create snapshot
        const snapshot = new MetricsSnapshot({
          siteId: TEST_SITE_ID,
          timestamp: date,
          metrics
        });
        
        // Store snapshot
        await trendAnalysis.storePerformanceSnapshot(TEST_SITE_ID, snapshot);
        
        // Brief pause to avoid overwhelming file system
        await sleep(10);
      }
      
      // Log progress
      if (day % 10 === 0 || day === DAYS_OF_DATA - 1) {
        console.log(`Generated data for day ${day + 1}/${DAYS_OF_DATA}`);
      }
    }
    
    console.log('✅ Sample data generation complete');
    
  } catch (error) {
    console.error(`❌ Failed to generate sample data: ${error.message}`);
    throw error;
  }
}

/**
 * Generate competitor data for testing
 * 
 * @param {TrendAnalysisReporting} trendAnalysis - Trend analysis module
 */
async function generateCompetitorData(trendAnalysis) {
  try {
    // Get competitors
    const competitors = await trendAnalysis.competitorBenchmarkSystem.getCompetitors(TEST_SITE_ID);
    
    if (competitors.length === 0) {
      console.log('No competitors to generate data for');
      return;
    }
    
    console.log(`Generating data for ${competitors.length} competitors...`);
    
    for (const competitor of competitors) {
      // Generate metrics for competitor
      const metrics = {
        score: randomInRange(65, 95, 0, 1, 0),
        largestContentfulPaint: randomInRange(1800, 3200, 0, 1, 0),
        cumulativeLayoutShift: randomInRange(0.03, 0.2, 0, 1, 0),
        totalBlockingTime: randomInRange(180, 450, 0, 1, 0),
        firstContentfulPaint: randomInRange(1400, 2600, 0, 1, 0),
        timeToInteractive: randomInRange(2800, 5200, 0, 1, 0),
        resourceSize: randomInRange(900000, 2100000, 0, 1, 0),
        requestCount: randomInRange(45, 85, 0, 1, 0),
      };
      
      // Update competitor with metrics
      competitor.metrics = metrics;
      competitor.lastUpdated = new Date();
      
      // Store competitor
      await trendAnalysis.competitorBenchmarkSystem.storeCompetitorToFile(TEST_SITE_ID, competitor);
    }
    
    console.log('✅ Competitor data generation complete');
    
  } catch (error) {
    console.error(`❌ Failed to generate competitor data: ${error.message}`);
    throw error;
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
 * Validate trend report
 * 
 * @param {Object} report - Generated report
 */
function validateReport(report) {
  console.log('\nValidating report structure...');
  
  // Check for required top-level sections
  const requiredSections = [
    'siteId', 
    'timestamp',
    'summary',
    'historicalAnalysis',
    'trendAnalysis',
    'insightsAndRecommendations',
    'visualizationData'
  ];
  
  const missingSections = requiredSections.filter(section => !report[section]);
  
  if (missingSections.length > 0) {
    console.error(`❌ Missing required sections: ${missingSections.join(', ')}`);
  } else {
    console.log('✅ All required top-level sections present');
  }
  
  // Validate summary
  if (report.summary) {
    console.log(`✅ Report summary: "${report.summary.summaryText.substring(0, 100)}..."`);
  }
  
  // Validate insights and recommendations
  if (report.insightsAndRecommendations) {
    const { insights, recommendations } = report.insightsAndRecommendations;
    
    if (Array.isArray(insights)) {
      console.log(`✅ ${insights.length} insights generated`);
    } else {
      console.error('❌ Insights should be an array');
    }
    
    if (Array.isArray(recommendations)) {
      console.log(`✅ ${recommendations.length} recommendations generated`);
    } else {
      console.error('❌ Recommendations should be an array');
    }
  }
  
  // Validate visualization data
  if (report.visualizationData) {
    const visualDataKeys = Object.keys(report.visualizationData);
    console.log(`✅ Visualization data generated for: ${visualDataKeys.join(', ')}`);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
