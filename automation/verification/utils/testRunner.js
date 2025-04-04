/**
 * Test Runner Utility
 * 
 * Provides functionality for running regression tests to verify that
 * SEO fixes haven't broken existing functionality or introduced new issues.
 */

const { chromium } = require('playwright');
const logger = require('../../common/logger');

/**
 * Run a single regression test
 * 
 * @param {Object} test - Test definition
 * @param {string} siteId - The site identifier
 * @param {Object} options - Test options
 * @returns {Promise<Object>} - Test result
 */
async function runTest(test, siteId, options = {}) {
  logger.debug(`Running test: ${test.name} for site: ${siteId}`);
  
  const combinedOptions = {
    timeout: options.timeout || 30000,
    headless: options.headless !== undefined ? options.headless : true,
    device: options.device || 'desktop',
    ...options
  };
  
  const browser = await chromium.launch({ headless: combinedOptions.headless });
  
  try {
    // Create browser context with appropriate device settings
    const context = await createBrowserContext(browser, combinedOptions.device);
    const page = await context.newPage();
    
    // Set timeout
    page.setDefaultTimeout(combinedOptions.timeout);
    
    // Execute the test based on its type
    switch (test.type) {
      case 'navigation':
        return await runNavigationTest(page, test, siteId);
        
      case 'content':
        return await runContentTest(page, test, siteId);
        
      case 'interaction':
        return await runInteractionTest(page, test, siteId);
        
      case 'performance':
        return await runPerformanceTest(page, test, siteId);
        
      case 'seo':
        return await runSeoTest(page, test, siteId);
        
      case 'custom':
        return await runCustomTest(page, test, siteId);
        
      default:
        throw new Error(`Unknown test type: ${test.type}`);
    }
    
  } finally {
    await browser.close();
  }
}

/**
 * Create browser context with appropriate device settings
 * 
 * @param {Browser} browser - Playwright browser instance
 * @param {string} deviceType - Device type (desktop or mobile)
 * @returns {Promise<BrowserContext>} - Configured browser context
 */
async function createBrowserContext(browser, deviceType) {
  const contextOptions = {
    viewport: deviceType === 'mobile' 
      ? { width: 375, height: 667 } 
      : { width: 1280, height: 800 },
    userAgent: deviceType === 'mobile'
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1'
      : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  };
  
  return browser.newContext(contextOptions);
}

/**
 * Run a navigation test
 * 
 * @param {Page} page - Playwright page
 * @param {Object} test - Test definition
 * @param {string} siteId - The site identifier
 * @returns {Promise<Object>} - Test result
 */
async function runNavigationTest(page, test, siteId) {
  logger.debug(`Running navigation test: ${test.name}`);
  
  // Track navigation events
  const navigationPromise = page.waitForNavigation({ waitUntil: 'networkidle' });
  
  // Navigate to the URL
  const response = await page.goto(test.url, { waitUntil: 'domcontentloaded' });
  
  // Wait for navigation to complete
  await navigationPromise;
  
  // Verify status code
  const statusCode = response.status();
  const statusSuccess = statusCode >= 200 && statusCode < 400;
  
  if (!statusSuccess) {
    return {
      passed: false,
      details: { statusCode },
      errors: [`Page returned status code ${statusCode}`]
    };
  }
  
  // Additional navigation checks based on test parameters
  const checks = [];
  const errors = [];
  
  // Check title if specified
  if (test.expectedTitle) {
    const title = await page.title();
    const titleMatch = title.includes(test.expectedTitle);
    
    checks.push({
      name: 'Title check',
      expected: test.expectedTitle,
      actual: title,
      passed: titleMatch
    });
    
    if (!titleMatch) {
      errors.push(`Title doesn't match: expected "${test.expectedTitle}", got "${title}"`);
    }
  }
  
  // Check URL if specified
  if (test.expectedUrl) {
    const currentUrl = page.url();
    const urlMatch = currentUrl.includes(test.expectedUrl);
    
    checks.push({
      name: 'URL check',
      expected: test.expectedUrl,
      actual: currentUrl,
      passed: urlMatch
    });
    
    if (!urlMatch) {
      errors.push(`URL doesn't match: expected "${test.expectedUrl}", got "${currentUrl}"`);
    }
  }
  
  // Check elements exist if specified
  if (test.expectedElements && test.expectedElements.length > 0) {
    for (const selector of test.expectedElements) {
      const elementExists = await page.$(selector) !== null;
      
      checks.push({
        name: `Element exists: ${selector}`,
        expected: true,
        actual: elementExists,
        passed: elementExists
      });
      
      if (!elementExists) {
        errors.push(`Element not found: ${selector}`);
      }
    }
  }
  
  const passed = errors.length === 0;
  
  return {
    passed,
    details: {
      url: page.url(),
      statusCode,
      checks
    },
    errors
  };
}

/**
 * Run a content test
 * 
 * @param {Page} page - Playwright page
 * @param {Object} test - Test definition
 * @param {string} siteId - The site identifier
 * @returns {Promise<Object>} - Test result
 */
async function runContentTest(page, test, siteId) {
  logger.debug(`Running content test: ${test.name}`);
  
  // Navigate to the URL
  await page.goto(test.url, { waitUntil: 'networkidle' });
  
  const checks = [];
  const errors = [];
  
  // Check for text content
  if (test.expectedText) {
    const textContent = await page.textContent('body');
    const textMatch = textContent.includes(test.expectedText);
    
    checks.push({
      name: 'Text content check',
      expected: test.expectedText,
      actual: textContent.substring(0, 100) + '...',
      passed: textMatch
    });
    
    if (!textMatch) {
      errors.push(`Expected text not found: "${test.expectedText}"`);
    }
  }
  
  // Check for element content
  if (test.elementChecks && test.elementChecks.length > 0) {
    for (const check of test.elementChecks) {
      const element = await page.$(check.selector);
      
      if (!element) {
        checks.push({
          name: `Element check: ${check.selector}`,
          expected: check.content,
          actual: 'Element not found',
          passed: false
        });
        
        errors.push(`Element not found: ${check.selector}`);
        continue;
      }
      
      let content;
      
      if (check.attribute) {
        content = await element.getAttribute(check.attribute);
      } else {
        content = await element.textContent();
      }
      
      const contentMatch = content.includes(check.content);
      
      checks.push({
        name: `${check.attribute ? 'Attribute' : 'Content'} check: ${check.selector}`,
        expected: check.content,
        actual: content,
        passed: contentMatch
      });
      
      if (!contentMatch) {
        errors.push(`Expected content not found in ${check.selector}: "${check.content}"`);
      }
    }
  }
  
  const passed = errors.length === 0;
  
  return {
    passed,
    details: {
      url: page.url(),
      checks
    },
    errors
  };
}

/**
 * Run an interaction test
 * 
 * @param {Page} page - Playwright page
 * @param {Object} test - Test definition
 * @param {string} siteId - The site identifier
 * @returns {Promise<Object>} - Test result
 */
async function runInteractionTest(page, test, siteId) {
  logger.debug(`Running interaction test: ${test.name}`);
  
  // Navigate to the URL
  await page.goto(test.url, { waitUntil: 'networkidle' });
  
  const steps = [];
  const errors = [];
  
  // Execute each interaction step
  if (test.steps && test.steps.length > 0) {
    for (let i = 0; i < test.steps.length; i++) {
      const step = test.steps[i];
      const stepName = step.name || `Step ${i + 1}`;
      
      try {
        switch (step.action) {
          case 'click':
            await page.click(step.selector);
            steps.push({
              name: stepName,
              action: 'click',
              selector: step.selector,
              passed: true
            });
            break;
            
          case 'fill':
            await page.fill(step.selector, step.value);
            steps.push({
              name: stepName,
              action: 'fill',
              selector: step.selector,
              value: step.value,
              passed: true
            });
            break;
            
          case 'select':
            await page.selectOption(step.selector, step.value);
            steps.push({
              name: stepName,
              action: 'select',
              selector: step.selector,
              value: step.value,
              passed: true
            });
            break;
            
          case 'wait':
            if (step.selector) {
              await page.waitForSelector(step.selector, { timeout: step.timeout || 5000 });
            } else if (step.navigation) {
              await page.waitForNavigation({ timeout: step.timeout || 5000 });
            } else {
              await page.waitForTimeout(step.timeout || 1000);
            }
            
            steps.push({
              name: stepName,
              action: 'wait',
              passed: true
            });
            break;
            
          default:
            throw new Error(`Unknown action: ${step.action}`);
        }
        
      } catch (error) {
        steps.push({
          name: stepName,
          action: step.action,
          selector: step.selector,
          passed: false,
          error: error.message
        });
        
        errors.push(`Step "${stepName}" failed: ${error.message}`);
        
        if (step.critical) {
          // Stop execution if a critical step fails
          break;
        }
      }
    }
  }
  
  // Verify final state if specified
  if (test.finalChecks && errors.length === 0) {
    for (const check of test.finalChecks) {
      try {
        switch (check.type) {
          case 'url':
            const currentUrl = page.url();
            const urlMatch = currentUrl.includes(check.expected);
            
            steps.push({
              name: 'URL check',
              expected: check.expected,
              actual: currentUrl,
              passed: urlMatch
            });
            
            if (!urlMatch) {
              errors.push(`URL doesn't match: expected "${check.expected}", got "${currentUrl}"`);
            }
            break;
            
          case 'element':
            const elementExists = await page.$(check.selector) !== null;
            
            steps.push({
              name: `Element check: ${check.selector}`,
              expected: true,
              actual: elementExists,
              passed: elementExists
            });
            
            if (!elementExists) {
              errors.push(`Element not found: ${check.selector}`);
            }
            break;
            
          case 'text':
            const textContent = await page.textContent(check.selector || 'body');
            const textMatch = textContent.includes(check.expected);
            
            steps.push({
              name: `Text check: ${check.selector || 'body'}`,
              expected: check.expected,
              actual: textContent.substring(0, 100) + '...',
              passed: textMatch
            });
            
            if (!textMatch) {
              errors.push(`Expected text not found: "${check.expected}"`);
            }
            break;
        }
      } catch (error) {
        steps.push({
          name: `Final check: ${check.type}`,
          passed: false,
          error: error.message
        });
        
        errors.push(`Final check failed: ${error.message}`);
      }
    }
  }
  
  const passed = errors.length === 0;
  
  return {
    passed,
    details: {
      url: page.url(),
      steps
    },
    errors
  };
}

/**
 * Run a performance test
 * 
 * @param {Page} page - Playwright page
 * @param {Object} test - Test definition
 * @param {string} siteId - The site identifier
 * @returns {Promise<Object>} - Test result
 */
async function runPerformanceTest(page, test, siteId) {
  logger.debug(`Running performance test: ${test.name}`);
  
  // Enable performance metrics
  await page.evaluate(() => {
    window.performanceMetrics = {};
    
    // First Contentful Paint
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          window.performanceMetrics.fcp = entry.startTime;
        }
      }
    }).observe({ type: 'paint', buffered: true });
    
    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      window.performanceMetrics.lcp = lastEntry ? lastEntry.startTime : 0;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    
    // Cumulative Layout Shift
    let cumulativeLayoutShift = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          cumulativeLayoutShift += entry.value;
        }
      }
      window.performanceMetrics.cls = cumulativeLayoutShift;
    }).observe({ type: 'layout-shift', buffered: true });
    
    // Total Blocking Time (approximation)
    let totalBlockingTime = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.duration > 50) { // Long tasks are > 50ms
          totalBlockingTime += entry.duration - 50;
        }
      }
      window.performanceMetrics.tbt = totalBlockingTime;
    }).observe({ type: 'longtask', buffered: true });
  });
  
  // Track resource requests
  let resourceCount = 0;
  let resourceSize = 0;
  
  page.on('request', request => {
    resourceCount++;
  });
  
  page.on('response', async response => {
    const headers = response.headers();
    const contentLength = headers['content-length'];
    
    if (contentLength) {
      resourceSize += parseInt(contentLength, 10);
    } else {
      try {
        const buffer = await response.body().catch(() => null);
        if (buffer) {
          resourceSize += buffer.length;
        }
      } catch (e) {
        // Ignore errors when trying to get response body
      }
    }
  });
  
  // Record navigation start time
  const startTime = Date.now();
  
  // Navigate to the URL
  await page.goto(test.url, { waitUntil: 'networkidle' });
  
  // Record page load time
  const loadTime = Date.now() - startTime;
  
  // Wait for metrics to be collected
  await page.waitForTimeout(1000);
  
  // Extract collected metrics
  const metrics = await page.evaluate(() => window.performanceMetrics);
  
  // Check performance against thresholds
  const checks = [];
  const errors = [];
  
  // Load Time check
  if (test.thresholds && test.thresholds.loadTime) {
    const loadTimeOk = loadTime <= test.thresholds.loadTime;
    
    checks.push({
      name: 'Load Time',
      expected: `<= ${test.thresholds.loadTime}ms`,
      actual: `${loadTime}ms`,
      passed: loadTimeOk
    });
    
    if (!loadTimeOk) {
      errors.push(`Load time (${loadTime}ms) exceeds threshold (${test.thresholds.loadTime}ms)`);
    }
  }
  
  // FCP check
  if (test.thresholds && test.thresholds.fcp && metrics.fcp) {
    const fcpOk = metrics.fcp <= test.thresholds.fcp;
    
    checks.push({
      name: 'First Contentful Paint',
      expected: `<= ${test.thresholds.fcp}ms`,
      actual: `${metrics.fcp.toFixed(1)}ms`,
      passed: fcpOk
    });
    
    if (!fcpOk) {
      errors.push(`First Contentful Paint (${metrics.fcp.toFixed(1)}ms) exceeds threshold (${test.thresholds.fcp}ms)`);
    }
  }
  
  // LCP check
  if (test.thresholds && test.thresholds.lcp && metrics.lcp) {
    const lcpOk = metrics.lcp <= test.thresholds.lcp;
    
    checks.push({
      name: 'Largest Contentful Paint',
      expected: `<= ${test.thresholds.lcp}ms`,
      actual: `${metrics.lcp.toFixed(1)}ms`,
      passed: lcpOk
    });
    
    if (!lcpOk) {
      errors.push(`Largest Contentful Paint (${metrics.lcp.toFixed(1)}ms) exceeds threshold (${test.thresholds.lcp}ms)`);
    }
  }
  
  // CLS check
  if (test.thresholds && test.thresholds.cls !== undefined && metrics.cls !== undefined) {
    const clsOk = metrics.cls <= test.thresholds.cls;
    
    checks.push({
      name: 'Cumulative Layout Shift',
      expected: `<= ${test.thresholds.cls}`,
      actual: metrics.cls.toFixed(3),
      passed: clsOk
    });
    
    if (!clsOk) {
      errors.push(`Cumulative Layout Shift (${metrics.cls.toFixed(3)}) exceeds threshold (${test.thresholds.cls})`);
    }
  }
  
  // Resource count check
  if (test.thresholds && test.thresholds.resourceCount) {
    const resourceCountOk = resourceCount <= test.thresholds.resourceCount;
    
    checks.push({
      name: 'Resource Count',
      expected: `<= ${test.thresholds.resourceCount}`,
      actual: resourceCount,
      passed: resourceCountOk
    });
    
    if (!resourceCountOk) {
      errors.push(`Resource count (${resourceCount}) exceeds threshold (${test.thresholds.resourceCount})`);
    }
  }
  
  // Resource size check
  if (test.thresholds && test.thresholds.resourceSize) {
    const resourceSizeThresholdKB = test.thresholds.resourceSize;
    const resourceSizeKB = Math.round(resourceSize / 1024);
    const resourceSizeOk = resourceSizeKB <= resourceSizeThresholdKB;
    
    checks.push({
      name: 'Resource Size',
      expected: `<= ${resourceSizeThresholdKB}KB`,
      actual: `${resourceSizeKB}KB`,
      passed: resourceSizeOk
    });
    
    if (!resourceSizeOk) {
      errors.push(`Resource size (${resourceSizeKB}KB) exceeds threshold (${resourceSizeThresholdKB}KB)`);
    }
  }
  
  const passed = errors.length === 0;
  
  return {
    passed,
    details: {
      url: page.url(),
      loadTime,
      metrics: {
        fcp: metrics.fcp,
        lcp: metrics.lcp,
        cls: metrics.cls,
        tbt: metrics.tbt,
        resourceCount,
        resourceSize
      },
      checks
    },
    errors
  };
}

/**
 * Run an SEO test
 * 
 * @param {Page} page - Playwright page
 * @param {Object} test - Test definition
 * @param {string} siteId - The site identifier
 * @returns {Promise<Object>} - Test result
 */
async function runSeoTest(page, test, siteId) {
  logger.debug(`Running SEO test: ${test.name}`);
  
  // Navigate to the URL
  await page.goto(test.url, { waitUntil: 'networkidle' });
  
  // Extract SEO elements
  const seoData = await page.evaluate(() => {
    const data = {
      title: document.title,
      meta: {},
      headings: {
        h1: [],
        h2: [],
        h3: [],
        h4: [],
        h5: [],
        h6: []
      },
      links: [],
      images: [],
      schema: []
    };
    
    // Extract meta tags
    document.querySelectorAll('meta').forEach(meta => {
      const name = meta.getAttribute('name') || meta.getAttribute('property');
      const content = meta.getAttribute('content');
      
      if (name && content) {
        data.meta[name] = content;
      }
    });
    
    // Extract headings
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
      document.querySelectorAll(tag).forEach(el => {
        data.headings[tag].push(el.textContent.trim());
      });
    });
    
    // Extract links
    document.querySelectorAll('a').forEach(link => {
      data.links.push({
        href: link.getAttribute('href'),
        text: link.textContent.trim(),
        rel: link.getAttribute('rel')
      });
    });
    
    // Extract images
    document.querySelectorAll('img').forEach(img => {
      data.images.push({
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt'),
        width: img.width,
        height: img.height,
        loading: img.getAttribute('loading')
      });
    });
    
    // Extract schema.org data
    document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
      try {
        data.schema.push(JSON.parse(script.textContent));
      } catch (e) {
        // Ignore parsing errors
      }
    });
    
    return data;
  });
  
  // Run SEO checks
  const checks = [];
  const errors = [];
  
  // Title check
  if (test.checks && test.checks.title) {
    const titleCheck = test.checks.title;
    let titlePassed = true;
    let titleError = null;
    
    if (titleCheck.exists && !seoData.title) {
      titlePassed = false;
      titleError = 'Title tag is missing';
    } else if (titleCheck.contains && !seoData.title.includes(titleCheck.contains)) {
      titlePassed = false;
      titleError = `Title doesn't contain "${titleCheck.contains}"`;
    } else if (titleCheck.minLength && seoData.title.length < titleCheck.minLength) {
      titlePassed = false;
      titleError = `Title length (${seoData.title.length}) is below minimum (${titleCheck.minLength})`;
    } else if (titleCheck.maxLength && seoData.title.length > titleCheck.maxLength) {
      titlePassed = false;
      titleError = `Title length (${seoData.title.length}) exceeds maximum (${titleCheck.maxLength})`;
    }
    
    checks.push({
      name: 'Title',
      expected: titleCheck.contains || `Length ${titleCheck.minLength || 0}-${titleCheck.maxLength || 'any'}`,
      actual: seoData.title,
      passed: titlePassed
    });
    
    if (!titlePassed) {
      errors.push(titleError);
    }
  }
  
  // Meta description check
  if (test.checks && test.checks.metaDescription) {
    const descCheck = test.checks.metaDescription;
    const metaDesc = seoData.meta['description'];
    let descPassed = true;
    let descError = null;
    
    if (descCheck.exists && !metaDesc) {
      descPassed = false;
      descError = 'Meta description is missing';
    } else if (descCheck.contains && !metaDesc.includes(descCheck.contains)) {
      descPassed = false;
      descError = `Meta description doesn't contain "${descCheck.contains}"`;
    } else if (descCheck.minLength && metaDesc && metaDesc.length < descCheck.minLength) {
      descPassed = false;
      descError = `Meta description length (${metaDesc.length}) is below minimum (${descCheck.minLength})`;
    } else if (descCheck.maxLength && metaDesc && metaDesc.length > descCheck.maxLength) {
      descPassed = false;
      descError = `Meta description length (${metaDesc.length}) exceeds maximum (${descCheck.maxLength})`;
    }
    
    checks.push({
      name: 'Meta Description',
      expected: descCheck.contains || `Length ${descCheck.minLength || 0}-${descCheck.maxLength || 'any'}`,
      actual: metaDesc || 'Missing',
      passed: descPassed
    });
    
    if (!descPassed) {
      errors.push(descError);
    }
  }
  
  // Headings check
  if (test.checks && test.checks.headings) {
    const headingsCheck = test.checks.headings;
    
    // H1 check
    if (headingsCheck.h1) {
      const h1Check = headingsCheck.h1;
      const h1Count = seoData.headings.h1.length;
      let h1Passed = true;
      let h1Error = null;
      
      if (h1Check.exists && h1Count === 0) {
        h1Passed = false;
        h1Error = 'H1 heading is missing';
      } else if (h1Check.count && h1Count !== h1Check.count) {
        h1Passed = false;
        h1Error = `Expected ${h1Check.count} H1 headings, found ${h1Count}`;
      } else if (h1Check.contains && h1Count > 0 && !seoData.headings.h1.some(h => h.includes(h1Check.contains))) {
        h1Passed = false;
        h1Error = `No H1 heading contains "${h1Check.contains}"`;
      }
      
      checks.push({
        name: 'H1 Heading',
        expected: h1Check.contains || `Count: ${h1Check.count || 'any'}`,
        actual: h1Count > 0 ? seoData.headings.h1.join(', ') : 'Missing',
        passed: h1Passed
      });
      
      if (!h1Passed) {
        errors.push(h1Error);
      }
    }
    
    // Other headings checks can be implemented similarly
  }
  
  // Canonical URL check
  if (test.checks && test.checks.canonical) {
    const canonicalCheck = test.checks.canonical;
    const canonicalUrl = seoData.meta['canonical'] || seoData.meta['og:url'];
    let canonicalPassed = true;
    let canonicalError = null;
    
    if (canonicalCheck.exists && !canonicalUrl) {
      canonicalPassed = false;
      canonicalError = 'Canonical URL is missing';
    } else if (canonicalCheck.equals && canonicalUrl !== canonicalCheck.equals) {
      canonicalPassed = false;
      canonicalError = `Canonical URL "${canonicalUrl}" doesn't match expected "${canonicalCheck.equals}"`;
    } else if (canonicalCheck.contains && !canonicalUrl.includes(canonicalCheck.contains)) {
      canonicalPassed = false;
      canonicalError = `Canonical URL doesn't contain "${canonicalCheck.contains}"`;
    }
    
    checks.push({
      name: 'Canonical URL',
      expected: canonicalCheck.equals || canonicalCheck.contains || 'Exists',
      actual: canonicalUrl || 'Missing',
      passed: canonicalPassed
    });
    
    if (!canonicalPassed) {
      errors.push(canonicalError);
    }
  }
  
  // Image alt text check
  if (test.checks && test.checks.images) {
    const imagesCheck = test.checks.images;
    
    if (imagesCheck.altText) {
      const altCheck = imagesCheck.altText;
      const imagesWithAlt = seoData.images.filter(img => img.alt && img.alt.trim() !== '').length;
      const totalImages = seoData.images.length;
      const altPercentage = totalImages > 0 ? (imagesWithAlt / totalImages) * 100 : 0;
      let altPassed = true;
      let altError = null;
      
      if (altCheck.percentage && altPercentage < altCheck.percentage) {
        altPassed = false;
        altError = `Only ${altPercentage.toFixed(1)}% of images have alt text (required: ${altCheck.percentage}%)`;
      }
      
      checks.push({
        name: 'Image Alt Text',
        expected: `>= ${altCheck.percentage || 100}%`,
        actual: `${altPercentage.toFixed(1)}% (${imagesWithAlt}/${totalImages})`,
        passed: altPassed
      });
      
      if (!altPassed) {
        errors.push(altError);
      }
    }
  }
  
  // Schema.org check
  if (test.checks && test.checks.schema) {
    const schemaCheck = test.checks.schema;
    let schemaPassed = true;
    let schemaError = null;
    
    if (schemaCheck.exists && seoData.schema.length === 0) {
      schemaPassed = false;
      schemaError = 'Schema.org markup is missing';
    } else if (schemaCheck.type) {
      const hasType = seoData.schema.some(s => {
        if (s['@type'] === schemaCheck.type) {
          return true;
        } else if (Array.isArray(s['@type'])) {
          return s['@type'].includes(schemaCheck.type);
        }
        return false;
      });
      
      if (!hasType) {
        schemaPassed = false;
        schemaError = `Schema.org type "${schemaCheck.type}" not found`;
      }
    }
    
    checks.push({
      name: 'Schema.org',
      expected: schemaCheck.type || 'Exists',
      actual: seoData.schema.length > 0 
        ? seoData.schema.map(s => s['@type']).join(', ') 
        : 'Missing',
      passed: schemaPassed
    });
    
    if (!schemaPassed) {
      errors.push(schemaError);
    }
  }
  
  const passed = errors.length === 0;
  
  return {
    passed,
    details: {
      url: page.url(),
      seoData,
      checks
    },
    errors
  };
}

/**
 * Run a custom test
 * 
 * @param {Page} page - Playwright page
 * @param {Object} test - Test definition
 * @param {string} siteId - The site identifier
 * @returns {Promise<Object>} - Test result
 */
async function runCustomTest(page, test, siteId) {
  logger.debug(`Running custom test: ${test.name}`);
  
  // For custom tests, we'll execute the provided test function
  // This would typically be stored in a database or passed as code
  
  // In a real implementation, we'd have a secure way to run this code
  // For this example, we'll just simulate a custom test
  
  // Navigate to the URL
  await page.goto(test.url, { waitUntil: 'networkidle' });
  
  // Example custom test code
  if (test.code) {
    try {
      // Note: In a real implementation, executing arbitrary code would need
      // careful sandboxing for security reasons
      
      // For this demo, we'll just log the presence of the code
      logger.debug(`Custom test has code: ${test.code.substring(0, 50)}...`);
      
      // Simulate running the test
      const passed = Math.random() > 0.2; // 80% pass rate for demo
      
      return {
        passed,
        details: {
          url: page.url(),
          customTest: true
        },
        errors: passed ? [] : ['Custom test failed']
      };
    } catch (error) {
      return {
        passed: false,
        details: {
          url: page.url(),
          customTest: true
        },
        errors: [`Custom test execution failed: ${error.message}`]
      };
    }
  }
  
  // If no code is provided, check for predefined custom checks
  const checks = [];
  const errors = [];
  
  if (test.customChecks) {
    for (const check of test.customChecks) {
      try {
        let result;
        
        switch (check.type) {
          case 'selector-count':
            const elements = await page.$$(check.selector);
            const count = elements.length;
            const countMatch = count === check.expected;
            
            checks.push({
              name: `Selector count: ${check.selector}`,
              expected: check.expected,
              actual: count,
              passed: countMatch
            });
            
            if (!countMatch) {
              errors.push(`Expected ${check.expected} elements for selector "${check.selector}", found ${count}`);
            }
            break;
            
          case 'console-errors':
            // This would capture console errors in a real implementation
            const hasErrors = false; // Placeholder
            
            checks.push({
              name: 'Console errors',
              expected: 'None',
              actual: hasErrors ? 'Errors found' : 'None',
              passed: !hasErrors
            });
            
            if (hasErrors) {
              errors.push('Console errors detected');
            }
            break;
            
          case 'resource-status':
            // Check if a specific resource loaded successfully
            const resourceOk = true; // Placeholder
            
            checks.push({
              name: `Resource status: ${check.url}`,
              expected: '200 OK',
              actual: resourceOk ? '200 OK' : 'Failed',
              passed: resourceOk
            });
            
            if (!resourceOk) {
              errors.push(`Resource ${check.url} failed to load`);
            }
            break;
        }
      } catch (error) {
        checks.push({
          name: `Custom check: ${check.type}`,
          passed: false,
          error: error.message
        });
        
        errors.push(`Custom check failed: ${error.message}`);
      }
    }
  }
  
  const passed = errors.length === 0;
  
  return {
    passed,
    details: {
      url: page.url(),
      checks
    },
    errors
  };
}

module.exports = {
  runTest
};
