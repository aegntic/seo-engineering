/**
 * SEO.engineering CMS Platform Test Runner
 * 
 * This script runs the CMS platform tests and generates a comprehensive report
 * to verify compatibility with various CMS platforms.
 */

const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { runTests } = require('./testCMSPlatforms');

// Results directory
const resultsDir = path.join(__dirname, 'test-results');
const docsDir = path.join(__dirname, '../../docs');

/**
 * Run CMS Platform Tests
 * @param {Object} options Test options
 */
async function runCMSTests(options = {}) {
  console.log('======================================');
  console.log('SEO.engineering CMS Platform Test Runner');
  console.log('======================================\n');
  
  try {
    // Ensure results directory exists
    await fs.mkdir(resultsDir, { recursive: true });
    await fs.mkdir(docsDir, { recursive: true });
    
    console.log('Starting CMS platform tests...');
    console.log('This may take several minutes as we test multiple platforms.\n');
    
    // Run the tests
    const results = await runTests(options);
    
    console.log('\nGenerating comprehensive test reports...');
    
    // Generate all reports
    await Promise.all([
      generateHTMLReport(results),
      generateMarkdownReport(results),
      generateCompatibilityMatrix(results)
    ]);
    
    console.log('\nCMS platform testing completed successfully.');
    console.log(`HTML report generated at: ${path.join(resultsDir, 'cms-test-report.html')}`);
    console.log(`Markdown report generated at: ${path.join(docsDir, 'CMSCompatibilityReport.md')}`);
    console.log(`Compatibility matrix generated at: ${path.join(docsDir, 'CMSCompatibilityMatrix.md')}`);
    
    console.log('\nSummary:');
    console.log(`- Total platforms tested: ${results.summary.totalSites}`);
    console.log(`- Successful tests: ${results.summary.successful}`);
    console.log(`- Failed tests: ${results.summary.failed}`);
    console.log(`- CMS detection accuracy: ${results.summary.cmsDetectionAccuracyPercent.toFixed(1)}%`);
    
    // Return test results
    return results;
  } catch (err) {
    console.error(`\nError running CMS platform tests: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Generate an HTML report from test results
 * @param {Object} results Test results
 */
async function generateHTMLReport(results) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEO.engineering CMS Compatibility Report</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { color: #333; }
    .summary { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .success { color: #2e7d32; }
    .failure { color: #c62828; }
    .warning { color: #ff8f00; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
    tr:hover { background-color: #f5f5f5; }
    .platform-card { border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin-bottom: 20px; }
    .platform-header { display: flex; justify-content: space-between; align-items: center; }
    .platform-header h3 { margin: 0; }
    .platform-badge { padding: 5px 10px; border-radius: 3px; font-weight: bold; }
    .tips-list { background-color: #e8f5e9; padding: 10px; border-radius: 5px; }
    .test-areas { background-color: #e3f2fd; padding: 10px; border-radius: 5px; }
    .performance { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 15px; }
    .performance-metric { flex: 1; min-width: 200px; padding: 10px; background-color: #f9f9f9; border-radius: 5px; }
    .category-summary { margin-bottom: 30px; }
    .chart-container { max-width: 600px; margin: 20px auto; }
  </style>
</head>
<body>
  <h1>SEO.engineering CMS Compatibility Report</h1>
  <p>Generated on: ${new Date(results.testDate).toLocaleString()}</p>
  
  <div class="summary">
    <h2>Test Summary</h2>
    <p><strong>Total platforms tested:</strong> ${results.summary.totalSites}</p>
    <p><strong>Successfully tested:</strong> <span class="success">${results.summary.successful}</span></p>
    <p><strong>Failed tests:</strong> <span class="${results.summary.failed > 0 ? 'failure' : 'success'}">${results.summary.failed}</span></p>
    <p><strong>CMS detection accuracy:</strong> <span class="${results.summary.cmsDetectionAccuracyPercent >= 90 ? 'success' : results.summary.cmsDetectionAccuracyPercent >= 70 ? 'warning' : 'failure'}">${results.summary.cmsDetectionAccuracyPercent.toFixed(1)}%</span></p>
  </div>
  
  <h2>Category Results</h2>
  <div class="category-summary">
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Total Sites</th>
          <th>Success Rate</th>
          <th>CMS Detection Accuracy</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(results.categories).map(([category, stats]) => `
          <tr>
            <td>${category}</td>
            <td>${stats.total}</td>
            <td class="${stats.successRate >= 90 ? 'success' : stats.successRate >= 70 ? 'warning' : 'failure'}">${stats.successRate.toFixed(1)}%</td>
            <td class="${stats.cmsDetectionAccuracyPercent >= 90 ? 'success' : stats.cmsDetectionAccuracyPercent >= 70 ? 'warning' : 'failure'}">${stats.cmsDetectionAccuracyPercent.toFixed(1)}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <h2>Platform-Specific Results</h2>
  
  ${results.siteResults.map(site => `
    <div class="platform-card">
      <div class="platform-header">
        <h3>${site.name}</h3>
        <span class="platform-badge" style="background-color: ${site.success ? '#e8f5e9' : '#ffebee'}; color: ${site.success ? '#2e7d32' : '#c62828'};">
          ${site.success ? 'SUCCESS' : 'FAILED'}
        </span>
      </div>
      <p><strong>URL:</strong> <a href="${site.url}" target="_blank">${site.url}</a></p>
      <p><strong>Category:</strong> ${site.category}</p>
      <p><strong>Popularity:</strong> ${site.popularity}</p>
      
      ${site.success ? `
        <p><strong>CMS Detection:</strong> ${site.detectedCMS === site.expectedCMS ? 
          `<span class="success">Correct (${site.detectedCMS})</span>` : 
          `<span class="warning">Incorrect (Expected: ${site.expectedCMS}, Detected: ${site.detectedCMS})</span>`}
        </p>
        <p><strong>Confidence:</strong> ${site.cmsConfidence}</p>
        
        <h4>Optimization Tips</h4>
        <div class="tips-list">
          <ul>
            ${site.cmsOptimizationTips && site.cmsOptimizationTips.length > 0 ? 
              site.cmsOptimizationTips.map(tip => `<li>${tip}</li>`).join('') : 
              '<li>No specific optimization tips available for this platform</li>'}
          </ul>
        </div>
        
        <h4>Key Test Areas</h4>
        <div class="test-areas">
          <ul>
            ${site.cmsTestAreas && site.cmsTestAreas.length > 0 ? 
              site.cmsTestAreas.map(area => `<li>${area}</li>`).join('') : 
              '<li>No specific test areas defined for this platform</li>'}
          </ul>
        </div>
        
        <h4>Performance Metrics</h4>
        <div class="performance">
          <div class="performance-metric">
            <strong>Duration:</strong> ${site.performance?.duration?.toFixed(2) || 'N/A'} seconds
          </div>
          <div class="performance-metric">
            <strong>Pages Processed:</strong> ${site.performance?.pagesProcessed || 'N/A'}
          </div>
          <div class="performance-metric">
            <strong>Errors:</strong> ${site.performance?.errors || 'N/A'}
          </div>
          <div class="performance-metric">
            <strong>Pages Per Second:</strong> ${site.performance?.pagesPerSecond?.toFixed(2) || 'N/A'}
          </div>
        </div>
        
        ${site.crawlIssues && site.crawlIssues.length > 0 ? `
        <h4>Crawl Issues</h4>
        <ul>
          ${site.crawlIssues.map(issue => `<li>${issue.type}: ${issue.message}</li>`).join('')}
        </ul>
        ` : ''}
      ` : `
        <p><strong>Error:</strong> <span class="failure">${site.error || 'Unknown error'}</span></p>
      `}
    </div>
  `).join('')}
  
  <h2>Compatibility Conclusions</h2>
  <p>
    The crawler has been tested against ${results.summary.totalSites} major CMS platforms with a 
    ${results.summary.successful === results.summary.totalSites ? 'perfect' : 'partial'} success rate. 
    ${results.summary.cmsDetectionAccuracyPercent >= 90 ? 
      'The CMS detection system demonstrates excellent accuracy, correctly identifying platforms in most cases.' : 
      results.summary.cmsDetectionAccuracyPercent >= 70 ? 
      'The CMS detection system demonstrates good accuracy but could be improved for certain platforms.' :
      'The CMS detection system needs improvement to accurately identify platforms.'}
  </p>
  
  <footer>
    <p><small>SEO.engineering CMS Compatibility Report - Generated by SEO.engineering Testing Framework</small></p>
  </footer>
</body>
</html>`;

  await fs.writeFile(path.join(resultsDir, 'cms-test-report.html'), html);
}

/**
 * Generate a Markdown report from test results
 * @param {Object} results Test results
 */
async function generateMarkdownReport(results) {
  const markdown = `# SEO.engineering CMS Compatibility Report

*Generated on: ${new Date(results.testDate).toLocaleString()}*

## Summary

- **Total platforms tested:** ${results.summary.totalSites}
- **Successfully tested:** ${results.summary.successful}
- **Failed tests:** ${results.summary.failed}
- **CMS detection accuracy:** ${results.summary.cmsDetectionAccuracyPercent.toFixed(1)}%

## Category Results

| Category | Total Sites | Success Rate | CMS Detection Accuracy |
|----------|-------------|--------------|------------------------|
${Object.entries(results.categories).map(([category, stats]) => 
  `| ${category} | ${stats.total} | ${stats.successRate.toFixed(1)}% | ${stats.cmsDetectionAccuracyPercent.toFixed(1)}% |`
).join('\n')}

## Platform-Specific Results

${results.siteResults.map(site => `
### ${site.name}

- **URL:** ${site.url}
- **Category:** ${site.category}
- **Popularity:** ${site.popularity}
- **Status:** ${site.success ? '✅ SUCCESS' : '❌ FAILED'}
${site.success ? `
- **CMS Detection:** ${site.detectedCMS === site.expectedCMS ? 
  `✅ Correct (${site.detectedCMS})` : 
  `⚠️ Incorrect (Expected: ${site.expectedCMS}, Detected: ${site.detectedCMS})`}
- **Confidence:** ${site.cmsConfidence}

#### Optimization Tips

${site.cmsOptimizationTips && site.cmsOptimizationTips.length > 0 ? 
  site.cmsOptimizationTips.map(tip => `- ${tip}`).join('\n') : 
  '- No specific optimization tips available for this platform'}

#### Key Test Areas

${site.cmsTestAreas && site.cmsTestAreas.length > 0 ? 
  site.cmsTestAreas.map(area => `- ${area}`).join('\n') : 
  '- No specific test areas defined for this platform'}

#### Performance Metrics

- **Duration:** ${site.performance?.duration?.toFixed(2) || 'N/A'} seconds
- **Pages Processed:** ${site.performance?.pagesProcessed || 'N/A'}
- **Errors:** ${site.performance?.errors || 'N/A'}
- **Pages Per Second:** ${site.performance?.pagesPerSecond?.toFixed(2) || 'N/A'}

${site.crawlIssues && site.crawlIssues.length > 0 ? `
#### Crawl Issues

${site.crawlIssues.map(issue => `- ${issue.type}: ${issue.message}`).join('\n')}
` : ''}
` : `
- **Error:** ${site.error || 'Unknown error'}
`}
`).join('')}

## Compatibility Conclusions

The crawler has been tested against ${results.summary.totalSites} major CMS platforms with a 
${results.summary.successful === results.summary.totalSites ? 'perfect' : 'partial'} success rate. 
${results.summary.cmsDetectionAccuracyPercent >= 90 ? 
  'The CMS detection system demonstrates excellent accuracy, correctly identifying platforms in most cases.' : 
  results.summary.cmsDetectionAccuracyPercent >= 70 ? 
  'The CMS detection system demonstrates good accuracy but could be improved for certain platforms.' :
  'The CMS detection system needs improvement to accurately identify platforms.'}

## Recommendations

Based on the test results, the following recommendations are made:

${results.summary.successful === results.summary.totalSites ? 
  '- The crawler is ready for production use with all tested CMS platforms' : 
  '- Fix compatibility issues with failed platform tests before production deployment'}
${results.summary.cmsDetectionAccuracyPercent < 90 ? 
  '- Improve CMS detection signatures for more accurate platform identification' : ''}
- Continuously monitor and update CMS signatures as platforms evolve
- Consider adding more specialized optimization rules for each CMS platform
- Extend testing to include more niche CMS platforms as the service grows

---

*This report was automatically generated by the SEO.engineering Testing Framework*
`;

  await fs.writeFile(path.join(docsDir, 'CMSCompatibilityReport.md'), markdown);
}

/**
 * Generate a compatibility matrix showing support levels for different CMS platforms
 * @param {Object} results Test results
 */
async function generateCompatibilityMatrix(results) {
  // Group results by category
  const categorizedResults = {};
  
  results.siteResults.forEach(site => {
    if (!categorizedResults[site.category]) {
      categorizedResults[site.category] = [];
    }
    categorizedResults[site.category].push(site);
  });
  
  // Generate compatibility levels
  const getSupportLevel = (site) => {
    if (!site.success) return '❌ Not Supported';
    
    if (site.detectedCMS === site.expectedCMS && site.cmsConfidence === 'High') {
      return '✅ Full Support';
    } else if (site.detectedCMS === site.expectedCMS) {
      return '✓ Supported';
    } else {
      return '⚠️ Partial Support';
    }
  };
  
  // Create the matrix
  let matrix = `# SEO.engineering CMS Compatibility Matrix

*Generated on: ${new Date(results.testDate).toLocaleString()}*

This matrix shows the compatibility level of SEO.engineering with various CMS platforms.

## Compatibility Legend

- ✅ **Full Support**: Platform is fully supported with high confidence CMS detection
- ✓ **Supported**: Platform is supported with medium confidence CMS detection
- ⚠️ **Partial Support**: Platform is supported but CMS detection may be unreliable
- ❌ **Not Supported**: Platform is not currently supported

## Compatibility Matrix

`;

  // Add each category and its platforms
  Object.entries(categorizedResults).forEach(([category, sites]) => {
    matrix += `### ${category}\n\n`;
    matrix += '| Platform | Support Level | CMS Detection | Performance | Notes |\n';
    matrix += '|----------|---------------|---------------|-------------|-------|\n';
    
    sites.forEach(site => {
      const supportLevel = getSupportLevel(site);
      const cmsDetection = site.success ? 
        (site.detectedCMS === site.expectedCMS ? 
          `Correct (${site.cmsConfidence})` : 
          `Incorrect (Detected as ${site.detectedCMS})`) : 
        'N/A';
      
      const performance = site.success ? 
        `${site.performance?.pagesPerSecond?.toFixed(2) || 'N/A'} pages/sec` : 
        'N/A';
      
      const notes = site.success ? 
        (site.crawlIssues && site.crawlIssues.length > 0 ? 
          'Some issues detected' : 
          'No issues') : 
        site.error || 'Failed to test';
      
      matrix += `| ${site.name} | ${supportLevel} | ${cmsDetection} | ${performance} | ${notes} |\n`;
    });
    
    matrix += '\n';
  });
  
  // Add recommendations
  matrix += `## Integration Recommendations

Based on the compatibility testing results, we recommend:

1. **Preferred CMS Platforms**: ${Object.entries(categorizedResults)
    .flatMap(([_, sites]) => sites)
    .filter(site => site.success && site.detectedCMS === site.expectedCMS && site.cmsConfidence === 'High')
    .map(site => site.name)
    .slice(0, 3)
    .join(', ')} show the best compatibility and performance.

2. **Platforms Requiring Additional Testing**: ${Object.entries(categorizedResults)
    .flatMap(([_, sites]) => sites)
    .filter(site => site.success && site.detectedCMS !== site.expectedCMS)
    .map(site => site.name)
    .slice(0, 3)
    .join(', ')} may need additional testing and optimization.

3. **Unsupported Platforms**: ${Object.entries(categorizedResults)
    .flatMap(([_, sites]) => sites)
    .filter(site => !site.success)
    .map(site => site.name)
    .slice(0, 3)
    .join(', ')}${Object.entries(categorizedResults)
    .flatMap(([_, sites]) => sites)
    .filter(site => !site.success).length > 0 ? ' are not currently supported and require further development.' : ' - All tested platforms have basic support.'}

---

*This compatibility matrix was automatically generated by the SEO.engineering Testing Framework*
`;

  await fs.writeFile(path.join(docsDir, 'CMSCompatibilityMatrix.md'), matrix);
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
  
  runCMSTests(options).catch(err => {
    console.error(`Test execution failed: ${err.message}`);
    process.exit(1);
  });
} else {
  // Export the function for use in other files
  module.exports = { runCMSTests };
}
