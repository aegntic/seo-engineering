/**
 * Example Script: Analyze Website for Duplicate Content
 * 
 * This script demonstrates how to use the Duplicate Content Analysis module
 * to scan a website, identify duplicate content, and generate canonical suggestions.
 */

require('dotenv').config({ path: '../../../.env' });
const { DuplicateContentAnalyzer } = require('../index');
const utils = require('../utils');
const logger = utils.createLogger('Example', { logLevel: 'debug' });

// URL to analyze
const targetUrl = process.argv[2] || 'https://example.com';

/**
 * Main function to demonstrate duplicate content analysis
 */
async function analyzeSite() {
  logger.info(`Starting duplicate content analysis for ${targetUrl}`);
  
  try {
    // Initialize the analyzer with custom configuration
    const analyzer = new DuplicateContentAnalyzer({
      similarityThreshold: 0.85,
      minContentLength: 500,
      parallelComparisons: 5,
      excludePatterns: ['*/admin/*', '*/login/*', '*/search/*']
    });
    
    // Measure execution time
    const { result, formattedTime } = await utils.measureExecutionTime(
      analyzer.analyzeSite.bind(analyzer),
      targetUrl
    );
    
    if (!result) {
      logger.error('Analysis failed to return results');
      return;
    }
    
    // Get duplicate groups
    const duplicateGroups = result.getDuplicateGroups();
    logger.info(`Found ${duplicateGroups.length} groups of duplicate content`);
    
    // Print some details about each group
    duplicateGroups.forEach((group, index) => {
      logger.info(`\nGroup ${index + 1} (${group.length} pages):`);
      group.forEach(url => logger.info(`  - ${url}`));
    });
    
    // Get canonical suggestions
    const canonicalSuggestions = result.getCanonicalSuggestions();
    const suggestionsCount = Object.keys(canonicalSuggestions).length;
    
    logger.info(`\nGenerated ${suggestionsCount} canonical URL suggestions`);
    
    // Print some examples of canonical suggestions
    Object.entries(canonicalSuggestions).slice(0, 5).forEach(([url, canonicalUrl]) => {
      logger.info(`  ${url} -> ${canonicalUrl}`);
    });
    
    // Get full report
    const report = result.getFullReport();
    logger.info('\nAnalysis complete. Summary:');
    logger.info(`  Total pages analyzed: ${Object.keys(report.fingerprints || {}).length}`);
    logger.info(`  Duplicate content groups: ${duplicateGroups.length}`);
    logger.info(`  Total duplicate pages: ${duplicateGroups.reduce((sum, group) => sum + group.length - 1, 0)}`);
    logger.info(`  Canonical suggestions: ${suggestionsCount}`);
    logger.info(`  Execution time: ${formattedTime}`);
    logger.info(`  Memory usage: ${JSON.stringify(utils.getMemoryUsage())}`);
    
    // In a real application, you would now:
    // 1. Store the results in a database
    // 2. Generate implementation fixes
    // 3. Apply the fixes via the Fix Implementation System
    // 4. Update the dashboard with the results
    
  } catch (error) {
    logger.error('Error analyzing site:', error);
  }
}

// Run the example
analyzeSite().catch(error => {
  logger.error('Uncaught error:', error);
  process.exit(1);
});
