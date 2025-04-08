#!/usr/bin/env node

/**
 * SEO.engineering CMS Testing CLI
 * 
 * Command-line interface for running CMS compatibility tests
 */

const { runCMSTests } = require('./runCMSTests');
const testSites = require('./cmsTestSites');

// Available categories from testSites
const availableCategories = [...new Set(testSites.map(site => site.category))];
const availablePopularities = [...new Set(testSites.map(site => site.popularity))];

// Command help
function showHelp() {
  console.log('SEO.engineering CMS Testing CLI');
  console.log('=============================\n');
  console.log('Usage: node cms-test.js [options]\n');
  console.log('Options:');
  console.log('  --help, -h                 Show this help');
  console.log('  --category, -c <category>  Filter by category (comma-separated)');
  console.log('  --popularity, -p <level>   Filter by popularity (comma-separated)');
  console.log('  --max-sites, -m <number>   Limit the number of sites tested');
  console.log('  --depth, -d <number>       Set crawl depth (default: 2)');
  console.log('  --concurrency, -n <number> Set concurrency level (default: 2)');
  console.log('  --list-categories          List available categories');
  console.log('  --list-sites               List all available test sites');
  console.log('\nExamples:');
  console.log('  node cms-test.js --category "E-commerce,Major CMS" --depth 3');
  console.log('  node cms-test.js --popularity High --max-sites 5');
  console.log('  node cms-test.js --list-categories');
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

function parseArgs() {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    } 
    else if (arg === '--list-categories') {
      console.log('Available categories:');
      availableCategories.forEach(category => console.log(`- ${category}`));
      process.exit(0);
    } 
    else if (arg === '--list-sites') {
      console.log('Available test sites:');
      testSites.forEach(site => {
        console.log(`- ${site.name} (${site.category}, ${site.popularity}): ${site.url}`);
      });
      process.exit(0);
    }
    else if ((arg === '--category' || arg === '-c') && args[i+1]) {
      options.categoriesFilter = args[i+1].split(',');
      i++;
    } 
    else if ((arg === '--popularity' || arg === '-p') && args[i+1]) {
      options.popularityFilter = args[i+1].split(',');
      i++;
    } 
    else if ((arg === '--max-sites' || arg === '-m') && args[i+1]) {
      options.maxSites = parseInt(args[i+1], 10);
      i++;
    } 
    else if ((arg === '--depth' || arg === '-d') && args[i+1]) {
      options.testDepth = parseInt(args[i+1], 10);
      i++;
    } 
    else if ((arg === '--concurrency' || arg === '-n') && args[i+1]) {
      options.concurrency = parseInt(args[i+1], 10);
      i++;
    }
    else {
      console.log(`Unknown option: ${arg}`);
      showHelp();
      process.exit(1);
    }
  }
}

// Main function
async function main() {
  // Parse command line args
  parseArgs();
  
  // Display test configuration
  if (Object.keys(options).length > 0) {
    console.log('Test configuration:');
    if (options.categoriesFilter) console.log(`- Categories: ${options.categoriesFilter.join(', ')}`);
    if (options.popularityFilter) console.log(`- Popularity: ${options.popularityFilter.join(', ')}`);
    if (options.maxSites) console.log(`- Max sites: ${options.maxSites}`);
    if (options.testDepth) console.log(`- Test depth: ${options.testDepth}`);
    if (options.concurrency) console.log(`- Concurrency: ${options.concurrency}`);
    console.log();
  }
  
  try {
    // Run tests with the provided options
    await runCMSTests(options);
  } catch (err) {
    console.error(`Error running tests: ${err.message}`);
    process.exit(1);
  }
}

// Run the main function
main();
