/**
 * Meta Tag Validator
 * 
 * Analyzes meta tags for SEO best practices including presence, length,
 * and proper implementation of title, description, canonical, and other tags.
 */

const { chromium } = require('playwright');
const { v4: uuidv4 } = require('uuid');

class MetaTagValidator {
  /**
   * Validate meta tags for a URL
   * @param {string} url - The URL to analyze
   * @param {Object} options - Configuration options
   * @returns {Promise<Object>} - Meta tag validation results
   */
  static async validate(url, options = {}) {
    try {
      console.log(`Validating meta tags for: ${url}`);
      
      // Initialize browser
      const browser = await chromium.launch({
        headless: true,
        args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
      });
      
      // Create a new context with specific device
      const context = await browser.newContext({
        userAgent: options.userAgent || 'SEO.engineering/1.0',
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
      });
      
      // Create a new page
      const page = await context.newPage();
      
      // Initialize results
      const results = {
        score: 0,
        issues: [],
        metaTags: {},
        summary: {}
      };
      
      // Navigate to the page with timeout
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: options.timeout || 30000
      });
      
      // Extract all meta tags information using Playwright's evaluateHandle
      const metaTagsData = await page.evaluate(() => {
        // Helper function to get text content with fallback
        const getTextContent = (element) => {
          return element ? element.textContent.trim() : null;
        };
        
        // Extract title tag
        const titleTag = document.querySelector('title');
        const titleContent = getTextContent(titleTag);
        
        // Extract meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        const descriptionContent = metaDescription ? metaDescription.getAttribute('content') : null;
        
        // Extract meta keywords
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        const keywordsContent = metaKeywords ? metaKeywords.getAttribute('content') : null;
        
        // Extract canonical link
        const canonicalLink = document.querySelector('link[rel="canonical"]');
        const canonicalUrl = canonicalLink ? canonicalLink.getAttribute('href') : null;
        
        // Extract robots meta
        const robotsMeta = document.querySelector('meta[name="robots"]');
        const robotsContent = robotsMeta ? robotsMeta.getAttribute('content') : null;
        
        // Extract viewport meta
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        const viewportContent = viewportMeta ? viewportMeta.getAttribute('content') : null;
        
        // Extract language
        const htmlLang = document.documentElement.getAttribute('lang');
        
        // Extract Open Graph meta tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogDescription = document.querySelector('meta[property="og:description"]');
        const ogImage = document.querySelector('meta[property="og:image"]');
        const ogUrl = document.querySelector('meta[property="og:url"]');
        const ogType = document.querySelector('meta[property="og:type"]');
        
        // Extract Twitter Card meta tags
        const twitterCard = document.querySelector('meta[name="twitter:card"]');
        const twitterTitle = document.querySelector('meta[name="twitter:title"]');
        const twitterDescription = document.querySelector('meta[name="twitter:description"]');
        const twitterImage = document.querySelector('meta[name="twitter:image"]');
        
        // Extract hreflang tags
        const hreflangTags = Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]')).map(tag => ({
          hreflang: tag.getAttribute('hreflang'),
          href: tag.getAttribute('href')
        }));
        
        // Get all header tags for content analysis
        const h1Tags = Array.from(document.querySelectorAll('h1')).map(h => getTextContent(h));
        const h2Tags = Array.from(document.querySelectorAll('h2')).map(h => getTextContent(h));
        
        return {
          title: {
            content: titleContent,
            length: titleContent ? titleContent.length : 0
          },
          description: {
            content: descriptionContent,
            length: descriptionContent ? descriptionContent.length : 0
          },
          keywords: {
            content: keywordsContent,
            length: keywordsContent ? keywordsContent.length : 0
          },
          canonical: {
            url: canonicalUrl
          },
          robots: {
            content: robotsContent
          },
          viewport: {
            content: viewportContent
          },
          language: {
            value: htmlLang
          },
          openGraph: {
            title: ogTitle ? ogTitle.getAttribute('content') : null,
            description: ogDescription ? ogDescription.getAttribute('content') : null,
            image: ogImage ? ogImage.getAttribute('content') : null,
            url: ogUrl ? ogUrl.getAttribute('content') : null,
            type: ogType ? ogType.getAttribute('content') : null
          },
          twitterCard: {
            card: twitterCard ? twitterCard.getAttribute('content') : null,
            title: twitterTitle ? twitterTitle.getAttribute('content') : null,
            description: twitterDescription ? twitterDescription.getAttribute('content') : null,
            image: twitterImage ? twitterImage.getAttribute('content') : null
          },
          hreflang: hreflangTags,
          headings: {
            h1: h1Tags,
            h2: h2Tags
          }
        };
      });
      
      // Store the meta tags data
      results.metaTags = metaTagsData;
      
      // Check for issues
      
      // Title tag checks
      if (!metaTagsData.title.content) {
        results.issues.push({
          id: uuidv4(),
          title: 'Missing Title Tag',
          description: 'The page is missing a title tag. Title tags are critical for SEO and user experience.',
          severity: 'critical',
          category: 'meta-tags',
          location: url,
          impact: 'High',
          effort: 'Low',
          recommendation: 'Add a descriptive title tag between 50-60 characters long that includes primary keywords.'
        });
      } else {
        // Check title length
        if (metaTagsData.title.length < 30) {
          results.issues.push({
            id: uuidv4(),
            title: 'Title Tag Too Short',
            description: `The title tag is only ${metaTagsData.title.length} characters long. Short titles may not adequately describe the page content to users and search engines.`,
            severity: 'medium',
            category: 'meta-tags',
            location: url,
            impact: 'Medium',
            effort: 'Low',
            recommendation: 'Expand the title tag to between 50-60 characters with relevant keywords.'
          });
        } else if (metaTagsData.title.length > 60) {
          results.issues.push({
            id: uuidv4(),
            title: 'Title Tag Too Long',
            description: `The title tag is ${metaTagsData.title.length} characters long. Long titles may be truncated in search results.`,
            severity: 'low',
            category: 'meta-tags',
            location: url,
            impact: 'Low',
            effort: 'Low',
            recommendation: 'Shorten the title tag to between 50-60 characters while maintaining keywords.'
          });
        }
      }
      
      // Meta description checks
      if (!metaTagsData.description.content) {
        results.issues.push({
          id: uuidv4(),
          title: 'Missing Meta Description',
          description: 'The page is missing a meta description. Meta descriptions help improve click-through rates from search results.',
          severity: 'high',
          category: 'meta-tags',
          location: url,
          impact: 'Medium',
          effort: 'Low',
          recommendation: 'Add a compelling meta description between 150-160 characters that summarizes the page and entices users to click.'
        });
      } else {
        // Check description length
        if (metaTagsData.description.length < 70) {
          results.issues.push({
            id: uuidv4(),
            title: 'Meta Description Too Short',
            description: `The meta description is only ${metaTagsData.description.length} characters long. Short descriptions may not adequately summarize the page content.`,
            severity: 'medium',
            category: 'meta-tags',
            location: url,
            impact: 'Medium',
            effort: 'Low',
            recommendation: 'Expand the meta description to between 150-160 characters with a compelling summary of the page.'
          });
        } else if (metaTagsData.description.length > 160) {
          results.issues.push({
            id: uuidv4(),
            title: 'Meta Description Too Long',
            description: `The meta description is ${metaTagsData.description.length} characters long. Long descriptions may be truncated in search results.`,
            severity: 'low',
            category: 'meta-tags',
            location: url,
            impact: 'Low',
            effort: 'Low',
            recommendation: 'Shorten the meta description to between 150-160 characters while maintaining important information.'
          });
        }
      }
      
      // Canonical tag checks
      if (!metaTagsData.canonical.url) {
        results.issues.push({
          id: uuidv4(),
          title: 'Missing Canonical Tag',
          description: 'The page is missing a canonical tag. Canonical tags help prevent duplicate content issues.',
          severity: 'medium',
          category: 'meta-tags',
          location: url,
          impact: 'Medium',
          effort: 'Low',
          recommendation: 'Add a canonical tag pointing to the preferred version of this page.'
        });
      } else if (!isValidUrl(metaTagsData.canonical.url)) {
        results.issues.push({
          id: uuidv4(),
          title: 'Invalid Canonical URL',
          description: `The canonical URL "${metaTagsData.canonical.url}" appears to be malformed or invalid.`,
          severity: 'medium',
          category: 'meta-tags',
          location: url,
          impact: 'Medium',
          effort: 'Low',
          recommendation: 'Correct the canonical URL to ensure it points to a valid, accessible URL.'
        });
      }
      
      // Viewport meta tag check
      if (!metaTagsData.viewport.content) {
        results.issues.push({
          id: uuidv4(),
          title: 'Missing Viewport Meta Tag',
          description: 'The page is missing a viewport meta tag. This tag is essential for proper rendering on mobile devices.',
          severity: 'high',
          category: 'meta-tags',
          location: url,
          impact: 'High',
          effort: 'Low',
          recommendation: 'Add a viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1.0">'
        });
      }
      
      // Language attribute check
      if (!metaTagsData.language.value) {
        results.issues.push({
          id: uuidv4(),
          title: 'Missing Language Attribute',
          description: 'The HTML tag is missing the lang attribute. This attribute helps search engines understand the language of the page.',
          severity: 'low',
          category: 'meta-tags',
          location: url,
          impact: 'Low',
          effort: 'Low',
          recommendation: 'Add a lang attribute to the HTML tag, e.g., <html lang="en">.'
        });
      }
      
      // Open Graph tag checks
      const missingOgTags = [];
      if (!metaTagsData.openGraph.title) missingOgTags.push('og:title');
      if (!metaTagsData.openGraph.description) missingOgTags.push('og:description');
      if (!metaTagsData.openGraph.image) missingOgTags.push('og:image');
      if (!metaTagsData.openGraph.url) missingOgTags.push('og:url');
      if (!metaTagsData.openGraph.type) missingOgTags.push('og:type');
      
      if (missingOgTags.length > 0) {
        results.issues.push({
          id: uuidv4(),
          title: 'Incomplete Open Graph Tags',
          description: `The page is missing important Open Graph tags: ${missingOgTags.join(', ')}. These tags improve sharing on social platforms.`,
          severity: 'medium',
          category: 'meta-tags',
          location: url,
          impact: 'Medium',
          effort: 'Low',
          recommendation: 'Add the missing Open Graph tags to improve how the page appears when shared on social media.'
        });
      }
      
      // Twitter Card tag checks
      const missingTwitterTags = [];
      if (!metaTagsData.twitterCard.card) missingTwitterTags.push('twitter:card');
      if (!metaTagsData.twitterCard.title) missingTwitterTags.push('twitter:title');
      if (!metaTagsData.twitterCard.description) missingTwitterTags.push('twitter:description');
      if (!metaTagsData.twitterCard.image) missingTwitterTags.push('twitter:image');
      
      if (missingTwitterTags.length > 0) {
        results.issues.push({
          id: uuidv4(),
          title: 'Incomplete Twitter Card Tags',
          description: `The page is missing important Twitter Card tags: ${missingTwitterTags.join(', ')}. These tags improve sharing on Twitter.`,
          severity: 'low',
          category: 'meta-tags',
          location: url,
          impact: 'Low',
          effort: 'Low',
          recommendation: 'Add the missing Twitter Card tags to improve how the page appears when shared on Twitter.'
        });
      }
      
      // H1 tag checks
      if (metaTagsData.headings.h1.length === 0) {
        results.issues.push({
          id: uuidv4(),
          title: 'Missing H1 Heading',
          description: 'The page doesn\'t have an H1 heading. H1 headings are important for SEO and page structure.',
          severity: 'high',
          category: 'meta-tags',
          location: url,
          impact: 'Medium',
          effort: 'Low',
          recommendation: 'Add a descriptive H1 heading that includes primary keywords.'
        });
      } else if (metaTagsData.headings.h1.length > 1) {
        results.issues.push({
          id: uuidv4(),
          title: 'Multiple H1 Headings',
          description: `The page has ${metaTagsData.headings.h1.length} H1 headings. Best practice is to have a single H1 heading per page.`,
          severity: 'medium',
          category: 'meta-tags',
          location: url,
          impact: 'Low',
          effort: 'Medium',
          recommendation: 'Consolidate multiple H1 headings into a single, descriptive H1 heading and use H2-H6 for subsections.'
        });
      }
      
      // Keywords meta tag check (generally deprecated but still checking)
      if (metaTagsData.keywords.content && metaTagsData.keywords.length > 0) {
        // Check for keyword stuffing (more than 10 keywords)
        const keywordCount = metaTagsData.keywords.content.split(',').length;
        if (keywordCount > 10) {
          results.issues.push({
            id: uuidv4(),
            title: 'Keyword Stuffing in Meta Keywords',
            description: `The meta keywords tag contains ${keywordCount} keywords. While the meta keywords tag is largely ignored by search engines, excessive keywords can be seen as spam.`,
            severity: 'low',
            category: 'meta-tags',
            location: url,
            impact: 'Very Low',
            effort: 'Low',
            recommendation: 'Consider removing the meta keywords tag entirely or limiting to 5-7 highly relevant keywords.'
          });
        }
      }
      
      // Calculate score based on issues
      // Base score starts at 100
      let score = 100;
      
      // Deduct points based on issue severity
      for (const issue of results.issues) {
        if (issue.severity === 'critical') score -= 20;
        else if (issue.severity === 'high') score -= 10;
        else if (issue.severity === 'medium') score -= 5;
        else if (issue.severity === 'low') score -= 2;
      }
      
      // Add bonus points for good implementations
      
      // Good title length (between 50-60 characters)
      if (metaTagsData.title.content && metaTagsData.title.length >= 50 && metaTagsData.title.length <= 60) {
        score += 5;
      }
      
      // Good description length (between 150-160 characters)
      if (metaTagsData.description.content && metaTagsData.description.length >= 150 && metaTagsData.description.length <= 160) {
        score += 5;
      }
      
      // Complete social media tags
      if (missingOgTags.length === 0 && missingTwitterTags.length === 0) {
        score += 5;
      }
      
      // Ensure score is between 0 and 100
      results.score = Math.max(0, Math.min(100, Math.round(score)));
      
      // Create summary
      results.summary = {
        score: results.score,
        title: metaTagsData.title.content ? metaTagsData.title.content.substring(0, 50) + (metaTagsData.title.length > 50 ? '...' : '') : 'Missing',
        description: metaTagsData.description.content ? metaTagsData.description.content.substring(0, 50) + (metaTagsData.description.length > 50 ? '...' : '') : 'Missing',
        hasCanonical: Boolean(metaTagsData.canonical.url),
        hasSocialTags: missingOgTags.length === 0 || missingTwitterTags.length === 0,
        issuesCount: results.issues.length,
        recommendation: getOverallRecommendation(results)
      };
      
      // Close browser
      await browser.close();
      
      return results;
      
    } catch (error) {
      console.error(`Error validating meta tags for ${url}:`, error);
      
      // Return a graceful fallback result with error information
      return {
        score: 0,
        issues: [{
          id: uuidv4(),
          title: 'Meta Tags Validation Failed',
          description: `Could not validate meta tags due to error: ${error.message}`,
          severity: 'high',
          category: 'meta-tags',
          location: url,
          recommendation: 'Check if the URL is accessible and properly formatted.'
        }],
        metaTags: {},
        summary: {
          score: 0,
          error: error.message,
          recommendation: 'Ensure the site is accessible and try again.'
        }
      };
    }
  }
}

/**
 * Generate an overall recommendation based on meta tag validation results
 * @param {Object} results - The meta tag validation results
 * @returns {string} - Overall recommendation
 */
function getOverallRecommendation(results) {
  if (results.score >= 90) {
    return 'Your meta tags are well-optimized. Continue to monitor and maintain them as content changes.';
  } else if (results.score >= 70) {
    return 'Your meta tags are good but could use some improvements to fully optimize for search engines and social sharing.';
  } else if (results.score >= 50) {
    return 'Your meta tags have several issues that should be addressed to improve search visibility and social sharing.';
  } else {
    return 'Your meta tags have critical issues that are likely affecting your search visibility and should be addressed as a high priority.';
  }
}

/**
 * Check if a string is a valid URL
 * @param {string} url - The URL to check
 * @returns {boolean} - Whether the URL is valid
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = MetaTagValidator;
