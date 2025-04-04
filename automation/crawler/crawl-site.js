/**
 * Sample script to crawl a website using the SEOCrawler module
 */

const SEOCrawler = require('./index');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

// Create a data directory if it doesn't exist
const dataDir = path.join(__dirname, '../data');
fs.mkdir(dataDir, { recursive: true }).catch(console.error);

// Parse command line arguments
const args = process.argv.slice(2);
const url = args[0] || 'https://example.com';
const maxPages = parseInt(args[1]) || 5;
const maxDepth = parseInt(args[2]) || 2;

async function main() {
  console.log(`Starting crawler for ${url} (max pages: ${maxPages}, max depth: ${maxDepth})`);
  
  // Initialize crawler
  const crawler = new SEOCrawler({
    maxPages,
    maxDepth,
    headless: true,
    screenshotDir: path.join(dataDir, 'screenshots'),
  });
  
  try {
    // Start the crawl
    const results = await crawler.crawl(url);
    
    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${url.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.json`;
    const filePath = path.join(dataDir, filename);
    
    await crawler.saveToFile(filePath, results);
    
    // Print a summary of issues found
    let criticalIssues = 0;
    let majorIssues = 0;
    let minorIssues = 0;
    
    for (const result of results) {
      if (result.seoAnalysis && result.seoAnalysis.issues) {
        for (const issue of result.seoAnalysis.issues) {
          if (issue.type === 'critical') criticalIssues++;
          if (issue.type === 'major') majorIssues++;
          if (issue.type === 'warning' || issue.type === 'info') minorIssues++;
        }
      }
    }
    
    console.log('\nSEO Analysis Summary:');
    console.log('---------------------');
    console.log(`Pages crawled: ${results.length}`);
    console.log(`Critical issues: ${criticalIssues}`);
    console.log(`Major issues: ${majorIssues}`);
    console.log(`Minor issues: ${minorIssues}`);
    console.log(`Results saved to: ${filePath}`);
    
    // Optionally save to database if MongoDB URI is configured
    if (process.env.MONGODB_URI) {
      // Use a dummy client ID for this example
      const clientId = 'sample-client-001';
      await crawler.saveToDatabase(clientId, results);
    }
  } catch (error) {
    console.error('Error during crawl:', error);
  } finally {
    // Close the browser
    await crawler.close();
  }
}

main().catch(console.error);