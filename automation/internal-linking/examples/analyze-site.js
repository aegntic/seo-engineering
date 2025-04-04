/**
 * Example usage of the Internal Linking Optimization module
 */

const { InternalLinkingOptimizer } = require('../index');

// Custom configuration options
const config = {
  minInboundLinks: 3,
  maxSuggestedLinks: 10,
  distributionFactor: 0.8,
  pageRankIterations: 150,
  maxDistanceFromHome: 4,
  siloBias: 0.7,
  anchorTextMinLength: 2,
  anchorTextMaxLength: 6,
  keywordBias: 0.8
};

// Initialize optimizer with custom config
const optimizer = new InternalLinkingOptimizer(config);

// Sample site URL
const siteUrl = 'https://example.com';

// Run analysis
async function runAnalysis() {
  try {
    console.log(`Analyzing internal linking structure for ${siteUrl}...`);
    
    // Analyze site
    const results = await optimizer.analyzeSite(siteUrl);
    
    // Output results
    console.log('\n--- Link Graph Metrics ---');
    console.log(JSON.stringify(results.getLinkGraphMetrics(), null, 2));
    
    console.log('\n--- Top Orphaned Pages ---');
    const orphanedPages = results.getOrphanedPages();
    for (let i = 0; i < Math.min(5, orphanedPages.length); i++) {
      console.log(`${i+1}. ${orphanedPages[i].url} (Importance: ${orphanedPages[i].importance.toFixed(2)})`);
      
      if (orphanedPages[i].potentialSources.length > 0) {
        console.log(`   Potential source: ${orphanedPages[i].potentialSources[0].url}`);
      }
    }
    
    console.log('\n--- Link Distribution Suggestions ---');
    const suggestions = results.getDistributionSuggestions();
    for (let i = 0; i < Math.min(5, suggestions.length); i++) {
      console.log(`${i+1}. ${suggestions[i].source} → ${suggestions[i].target}`);
      console.log(`   Type: ${suggestions[i].type}, Priority: ${suggestions[i].priority}`);
      console.log(`   Anchor text: "${suggestions[i].anchorText}"`);
      console.log();
    }
    
    console.log('\n--- Summary ---');
    console.log(`Total pages analyzed: ${results.getLinkGraphMetrics().pageCount}`);
    console.log(`Orphaned pages found: ${orphanedPages.length}`);
    console.log(`Link suggestions generated: ${suggestions.length}`);
    
    // Save comprehensive report to file if needed
    // require('fs').writeFileSync('linking-report.json', JSON.stringify(results.getFullReport(), null, 2));
    
  } catch (error) {
    console.error('Error analyzing site:', error);
  }
}

// Run the analysis
runAnalysis();
