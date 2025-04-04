/**
 * CMS Compatibility Test Runner
 * 
 * This script runs tests for SEOAutomate across different CMS platforms
 * to verify compatibility and functionality.
 */

const { chromium, firefox, webkit } = require('playwright');
const config = require('./config');
const fs = require('fs').promises;
const path = require('path');

class CMSCompatibilityTester {
  constructor() {
    this.results = {
      platforms: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      },
      startTime: null,
      endTime: null
    };
  }

  /**
   * Initialize the testing environment
   */
  async initialize() {
    // Create reporting directory if it doesn't exist
    await fs.mkdir(config.reporting.outputDir, { recursive: true });
    console.log(`Initialized reporting directory: ${config.reporting.outputDir}`);
    
    this.results.startTime = new Date();
    console.log(`CMS Compatibility testing started at ${this.results.startTime}`);
  }

  /**
   * Run tests for all configured CMS platforms
   */
  async runAllTests() {
    await this.initialize();
    
    // Loop through each platform
    for (const platform of config.platforms) {
      console.log(`\n=== Testing ${platform.name} ===`);
      this.results.platforms[platform.name] = {
        tests: {},
        summary: {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0
        }
      };
      
      // Loop through each test URL for the platform
      for (const testUrl of platform.testUrls) {
        console.log(`Testing URL: ${testUrl}`);
        
        // Loop through each environment
        for (const env of config.environments) {
          console.log(`Environment: ${env.name}`);
          
          // Launch browser based on environment configuration
          const browser = await this.launchBrowser(env);
          try {
            // Create a new browser context with environment settings
            const context = await browser.newContext({
              viewport: env.viewport,
              userAgent: env.userAgent
            });
            
            // Test each feature
            for (const feature of config.testFeatures) {
              await this.testFeature(platform, testUrl, feature, context, env);
            }
            
            // Close the context when done
            await context.close();
          } catch (error) {
            console.error(`Error testing ${platform.name} at ${testUrl} in ${env.name} environment:`, error);
            this.recordFailure(platform.name, 'environment-setup', 'Failed to setup testing environment');
          } finally {
            // Always close the browser
            await browser.close();
          }
        }
      }
      
      // Output platform summary
      console.log(`\n${platform.name} Summary:`);
      console.log(`Total: ${this.results.platforms[platform.name].summary.total}`);
      console.log(`Passed: ${this.results.platforms[platform.name].summary.passed}`);
      console.log(`Failed: ${this.results.platforms[platform.name].summary.failed}`);
      console.log(`Skipped: ${this.results.platforms[platform.name].summary.skipped}`);
    }
    
    await this.generateReports();
  }

  /**
   * Launch a browser based on environment configuration
   */
  async launchBrowser(env) {
    switch (env.browserType) {
      case 'firefox':
        return firefox.launch();
      case 'webkit':
        return webkit.launch();
      case 'chromium':
      default:
        return chromium.launch();
    }
  }

  /**
   * Test a specific feature on a platform
   */
  async testFeature(platform, url, feature, context, env) {
    console.log(`Testing feature: ${feature.name}`);
    
    // Initialize feature result if not exists
    if (!this.results.platforms[platform.name].tests[feature.name]) {
      this.results.platforms[platform.name].tests[feature.name] = {
        tests: {},
        summary: {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0
        }
      };
    }
    
    // Create a new page
    const page = await context.newPage();
    try {
      // Navigate to the test URL
      await page.goto(url, { waitUntil: 'networkidle' });
      
      // Verify CMS detection
      const isCmsDetected = await this.verifyCmsDetection(page, platform);
      if (!isCmsDetected) {
        console.warn(`Warning: Could not verify ${platform.name} detection on ${url}`);
      }
      
      // Run tests for this feature
      for (const test of feature.tests) {
        await this.runTest(platform.name, feature.name, test, page, url, env);
      }
      
    } catch (error) {
      console.error(`Error in feature ${feature.name} for ${platform.name} at ${url}:`, error);
      this.recordFailure(platform.name, feature.name, 'general-error', 'General error in feature testing');
    } finally {
      // Take a screenshot if configured
      if (config.reporting.includeScreenshots) {
        const screenshotDir = path.join(config.reporting.outputDir, 'screenshots');
        await fs.mkdir(screenshotDir, { recursive: true });
        
        const screenshotPath = path.join(
          screenshotDir, 
          `${platform.name}-${feature.name}-${env.name}.png`
        );
        
        await page.screenshot({ path: screenshotPath, fullPage: true });
      }
      
      // Close the page
      await page.close();
    }
  }

  /**
   * Verify CMS detection based on platform identifiers
   */
  async verifyCmsDetection(page, platform) {
    for (const identifier of platform.identifiers) {
      if (identifier.selector) {
        const element = await page.$(identifier.selector);
        if (element) {
          if (identifier.attribute) {
            const attrValue = await element.getAttribute(identifier.attribute);
            if (attrValue && attrValue.includes(platform.name)) {
              return true;
            }
          } else {
            return true;
          }
        }
      } else if (identifier.pattern && identifier.type) {
        // Check for patterns in page content
        if (identifier.type === 'script-content') {
          const content = await page.content();
          if (identifier.pattern.test(content)) {
            return true;
          }
        } else if (identifier.type === 'script-src') {
          const srcs = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('script[src]'))
              .map(script => script.getAttribute('src'));
          });
          
          for (const src of srcs) {
            if (identifier.pattern.test(src)) {
              return true;
            }
          }
        }
      }
    }
    
    return false;
  }

  /**
   * Run a specific test
   */
  async runTest(platformName, featureName, testName, page, url, env) {
    console.log(`  - Test: ${testName}`);
    
    // Increment test counters
    this.results.summary.total++;
    this.results.platforms[platformName].summary.total++;
    this.results.platforms[platformName].tests[featureName].summary.total++;
    
    // Initialize test result
    if (!this.results.platforms[platformName].tests[featureName].tests[testName]) {
      this.results.platforms[platformName].tests[featureName].tests[testName] = [];
    }
    
    try {
      // Import and run the actual test
      const testModule = require(`./tests/${featureName}/${testName}`);
      const result = await testModule.run(page, url, env);
      
      if (result.success) {
        this.recordSuccess(platformName, featureName, testName, result.message, url, env);
      } else {
        this.recordFailure(platformName, featureName, testName, result.message, url, env);
      }
    } catch (error) {
      console.error(`Error in test ${testName}:`, error);
      this.recordFailure(platformName, featureName, testName, `Error: ${error.message}`, url, env);
    }
  }

  /**
   * Record a test success
   */
  recordSuccess(platformName, featureName, testName, message, url, env) {
    console.log(`    ✅ Passed: ${message || 'Test passed'}`);
    
    this.results.summary.passed++;
    this.results.platforms[platformName].summary.passed++;
    this.results.platforms[platformName].tests[featureName].summary.passed++;
    
    this.results.platforms[platformName].tests[featureName].tests[testName].push({
      url,
      environment: env.name,
      success: true,
      message: message || 'Test passed',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Record a test failure
   */
  recordFailure(platformName, featureName, testName, message, url, env) {
    console.log(`    ❌ Failed: ${message || 'Test failed'}`);
    
    this.results.summary.failed++;
    this.results.platforms[platformName].summary.failed++;
    this.results.platforms[platformName].tests[featureName].summary.failed++;
    
    this.results.platforms[platformName].tests[featureName].tests[testName].push({
      url,
      environment: env ? env.name : 'unknown',
      success: false,
      message: message || 'Test failed',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Generate test reports
   */
  async generateReports() {
    this.results.endTime = new Date();
    console.log(`\nCMS Compatibility testing completed at ${this.results.endTime}`);
    
    const duration = (this.results.endTime - this.results.startTime) / 1000;
    console.log(`Total duration: ${duration.toFixed(2)} seconds`);
    
    console.log('\nOverall Summary:');
    console.log(`Total: ${this.results.summary.total}`);
    console.log(`Passed: ${this.results.summary.passed}`);
    console.log(`Failed: ${this.results.summary.failed}`);
    console.log(`Skipped: ${this.results.summary.skipped}`);
    
    // Save JSON report
    const jsonReport = path.join(config.reporting.outputDir, 'cms-compatibility-report.json');
    await fs.writeFile(jsonReport, JSON.stringify(this.results, null, 2));
    console.log(`\nJSON report saved to: ${jsonReport}`);
    
    // Save HTML report
    const htmlReport = path.join(config.reporting.outputDir, 'cms-compatibility-report.html');
    await this.generateHtmlReport(htmlReport);
    console.log(`HTML report saved to: ${htmlReport}`);
    
    // Save CSV report
    const csvReport = path.join(config.reporting.outputDir, 'cms-compatibility-report.csv');
    await this.generateCsvReport(csvReport);
    console.log(`CSV report saved to: ${csvReport}`);
  }

  /**
   * Generate HTML report
   */
  async generateHtmlReport(filePath) {
    // Simple HTML report template
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SEOAutomate CMS Compatibility Test Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1, h2, h3 { color: #333; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .success { color: green; }
          .failure { color: red; }
          .summary { margin-bottom: 30px; }
          .platform-section { margin-bottom: 40px; }
          .feature-section { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>SEOAutomate CMS Compatibility Test Report</h1>
        <div class="summary">
          <h2>Summary</h2>
          <p>Start time: ${this.results.startTime}</p>
          <p>End time: ${this.results.endTime}</p>
          <p>Duration: ${((this.results.endTime - this.results.startTime) / 1000).toFixed(2)} seconds</p>
          <table>
            <tr>
              <th>Total Tests</th>
              <th>Passed</th>
              <th>Failed</th>
              <th>Skipped</th>
              <th>Pass Rate</th>
            </tr>
            <tr>
              <td>${this.results.summary.total}</td>
              <td class="success">${this.results.summary.passed}</td>
              <td class="failure">${this.results.summary.failed}</td>
              <td>${this.results.summary.skipped}</td>
              <td>${this.results.summary.total > 0 ? 
                ((this.results.summary.passed / this.results.summary.total) * 100).toFixed(2) + '%' : 
                'N/A'}</td>
            </tr>
          </table>
        </div>
    `;
    
    // Add platform sections
    for (const [platformName, platformData] of Object.entries(this.results.platforms)) {
      html += `
        <div class="platform-section">
          <h2>Platform: ${platformName}</h2>
          <div class="summary">
            <table>
              <tr>
                <th>Total Tests</th>
                <th>Passed</th>
                <th>Failed</th>
                <th>Skipped</th>
                <th>Pass Rate</th>
              </tr>
              <tr>
                <td>${platformData.summary.total}</td>
                <td class="success">${platformData.summary.passed}</td>
                <td class="failure">${platformData.summary.failed}</td>
                <td>${platformData.summary.skipped}</td>
                <td>${platformData.summary.total > 0 ? 
                  ((platformData.summary.passed / platformData.summary.total) * 100).toFixed(2) + '%' : 
                  'N/A'}</td>
              </tr>
            </table>
          </div>
      `;
      
      // Add feature sections
      for (const [featureName, featureData] of Object.entries(platformData.tests)) {
        html += `
          <div class="feature-section">
            <h3>Feature: ${featureName}</h3>
            <table>
              <tr>
                <th>Test</th>
                <th>URL</th>
                <th>Environment</th>
                <th>Result</th>
                <th>Message</th>
                <th>Timestamp</th>
              </tr>
        `;
        
        // Add test results
        for (const [testName, testResults] of Object.entries(featureData.tests)) {
          for (const result of testResults) {
            html += `
              <tr>
                <td>${testName}</td>
                <td>${result.url || 'N/A'}</td>
                <td>${result.environment || 'N/A'}</td>
                <td class="${result.success ? 'success' : 'failure'}">${result.success ? 'PASS' : 'FAIL'}</td>
                <td>${result.message || ''}</td>
                <td>${result.timestamp || ''}</td>
              </tr>
            `;
          }
        }
        
        html += `
            </table>
          </div>
        `;
      }
      
      html += `
        </div>
      `;
    }
    
    html += `
      </body>
      </html>
    `;
    
    await fs.writeFile(filePath, html);
  }

  /**
   * Generate CSV report
   */
  async generateCsvReport(filePath) {
    let csv = 'Platform,Feature,Test,URL,Environment,Result,Message,Timestamp\n';
    
    for (const [platformName, platformData] of Object.entries(this.results.platforms)) {
      for (const [featureName, featureData] of Object.entries(platformData.tests)) {
        for (const [testName, testResults] of Object.entries(featureData.tests)) {
          for (const result of testResults) {
            csv += `"${platformName}","${featureName}","${testName}","${result.url || ''}","${result.environment || ''}","${result.success ? 'PASS' : 'FAIL'}","${result.message || ''}","${result.timestamp || ''}"\n`;
          }
        }
      }
    }
    
    await fs.writeFile(filePath, csv);
  }
}

// Run the tests if this file is executed directly
if (require.main === module) {
  const tester = new CMSCompatibilityTester();
  tester.runAllTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = CMSCompatibilityTester;
