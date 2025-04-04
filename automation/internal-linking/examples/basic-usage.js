/**
 * Basic Usage Example for Internal Linking Optimization Module
 * 
 * This example demonstrates how to analyze a website or a set of pages
 * and generate internal linking recommendations.
 */

const { InternalLinkingOptimizer } = require('../index');

// Create an optimizer instance with default configuration
const optimizer = new InternalLinkingOptimizer();

/**
 * Example 1: Analyze a website directly
 * 
 * This will use the crawler module to fetch pages first.
 */
async function analyzeWebsite() {
  try {
    console.log('Analyzing website...');
    
    const results = await optimizer.analyzeSite('https://example.com');
    
    // Get the full optimization report
    const report = results.getFullReport();
    
    // Print summary
    console.log('\n== Website Analysis Summary ==');
    console.log(`Total pages: ${report.graphMetrics.pageCount}`);
    console.log(`Total internal links: ${report.graphMetrics.linkCount}`);
    console.log(`Orphaned pages: ${report.orphanedPages.length}`);
    console.log(`Link suggestions: ${report.linkSuggestions.length}`);
    
    // Print top 5 link suggestions
    console.log('\n== Top Link Suggestions ==');
    report.linkSuggestions.slice(0, 5).forEach((suggestion, index) => {
      console.log(`\n${index + 1}. ${suggestion.sourceTitle} → ${suggestion.targetTitle}`);
      console.log(`   Type: ${suggestion.type}`);
      console.log(`   Anchor text: "${suggestion.anchorText}"`);
      console.log(`   Reason: ${suggestion.reason}`);
    });
    
    // Save report to file
    const fs = require('fs');
    fs.writeFileSync(
      './example-report.json',
      JSON.stringify(report, null, 2)
    );
    console.log('\nFull report saved to example-report.json');
    
  } catch (error) {
    console.error('Error analyzing website:', error);
  }
}

/**
 * Example 2: Analyze a set of pre-crawled pages
 * 
 * This is useful when you already have page data from another source.
 */
async function analyzePrecrawledPages() {
  try {
    console.log('Analyzing pre-crawled pages...');
    
    // Sample page data (in a real scenario, this would come from a database or file)
    const pages = [
      {
        url: 'https://example.com/',
        title: 'Home Page',
        content: 'Welcome to our website. We offer various services including SEO optimization.',
        links: [
          { url: 'https://example.com/about', text: 'About Us' },
          { url: 'https://example.com/services', text: 'Services' }
        ],
        keywords: ['SEO', 'digital marketing', 'website optimization'],
        isHome: true
      },
      {
        url: 'https://example.com/about',
        title: 'About Us',
        content: 'We are a team of digital marketing experts specializing in SEO and content strategy.',
        links: [
          { url: 'https://example.com/', text: 'Home' },
          { url: 'https://example.com/team', text: 'Our Team' }
        ],
        keywords: ['digital marketing', 'SEO experts', 'content strategy']
      },
      {
        url: 'https://example.com/services',
        title: 'Our Services',
        content: 'We provide SEO, content marketing, and website optimization services.',
        links: [
          { url: 'https://example.com/', text: 'Home' },
          { url: 'https://example.com/seo', text: 'SEO Services' }
        ],
        keywords: ['SEO services', 'content marketing', 'website optimization']
      },
      {
        url: 'https://example.com/seo',
        title: 'SEO Services',
        content: 'Our SEO services include technical optimization, content strategy, and link building.',
        links: [
          { url: 'https://example.com/services', text: 'All Services' }
        ],
        keywords: ['technical SEO', 'content strategy', 'link building']
      },
      {
        url: 'https://example.com/team',
        title: 'Our Team',
        content: 'Meet our experienced team of digital marketing professionals.',
        links: [
          { url: 'https://example.com/about', text: 'About Us' }
        ],
        keywords: ['team', 'professionals', 'experts']
      },
      {
        url: 'https://example.com/blog/seo-tips',
        title: 'Top SEO Tips for 2025',
        content: 'Learn about the latest SEO tips and strategies for 2025 and beyond.',
        links: [],
        keywords: ['SEO tips', '2025 SEO', 'SEO strategies']
      }
    ];
    
    // Analyze the pages
    const results = await optimizer.analyzePages(pages);
    
    // Get the full optimization report
    const report = results.getFullReport();
    
    // Print summary
    console.log('\n== Pages Analysis Summary ==');
    console.log(`Total pages: ${report.graphMetrics.pageCount}`);
    console.log(`Total internal links: ${report.graphMetrics.linkCount}`);
    console.log(`Orphaned pages: ${report.orphanedPages.length}`);
    console.log(`Link suggestions: ${report.linkSuggestions.length}`);
    
    // Print orphaned pages
    console.log('\n== Orphaned Pages ==');
    report.orphanedPages.forEach(page => {
      console.log(`- ${page.title} (${page.url})`);
    });
    
    // Print all link suggestions
    console.log('\n== All Link Suggestions ==');
    report.linkSuggestions.forEach((suggestion, index) => {
      console.log(`\n${index + 1}. ${suggestion.sourceTitle} → ${suggestion.targetTitle}`);
      console.log(`   Type: ${suggestion.type}`);
      console.log(`   Anchor text: "${suggestion.anchorText}"`);
      console.log(`   Reason: ${suggestion.reason}`);
    });
    
  } catch (error) {
    console.error('Error analyzing pages:', error);
  }
}

// Run examples
async function main() {
  // Uncomment one of these to run the example:
  // await analyzeWebsite();
  await analyzePrecrawledPages();
}

main().catch(console.error);
