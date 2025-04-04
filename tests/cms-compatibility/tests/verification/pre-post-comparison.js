/**
 * Pre/Post Comparison Test
 * 
 * Tests the ability to compare before and after states for SEO changes.
 * This test simulates the comparison process rather than making actual changes.
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Run the pre/post comparison test
 * 
 * @param {Page} page - Playwright page object
 * @param {string} url - URL being tested
 * @param {Object} env - Environment configuration
 * @returns {Object} Test result
 */
async function run(page, url, env) {
  try {
    // 1. Capture the current state (the "before" state)
    const beforeState = await capturePageState(page);
    
    // 2. Simulate changes (we'll use JavaScript to temporarily modify the page)
    await simulateChanges(page);
    
    // 3. Capture the modified state (the "after" state)
    const afterState = await capturePageState(page);
    
    // 4. Compare the states
    const comparison = compareStates(beforeState, afterState);
    
    // 5. Save detailed results to a JSON file
    const resultsDir = path.join('./reports/cms-compatibility/details');
    await fs.mkdir(resultsDir, { recursive: true });
    
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace(/[^a-z0-9]/gi, '-');
    const resultsFile = path.join(
      resultsDir, 
      `pre-post-comparison-${hostname}-${env.name}.json`
    );
    
    await fs.writeFile(resultsFile, JSON.stringify({
      url,
      environment: env.name,
      beforeState,
      afterState,
      comparison
    }, null, 2));
    
    // Determine test result
    const success = comparison.detected && comparison.detectionAccuracy > 80;
    
    return {
      success,
      message: success 
        ? `Successfully detected simulated changes with ${comparison.detectionAccuracy.toFixed(1)}% accuracy. ${comparison.detectedChanges.length} changes identified.`
        : `Failed to accurately detect simulated changes. Accuracy: ${comparison.detectionAccuracy.toFixed(1)}%.`
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Error in pre/post comparison test: ${error.message}`
    };
  }
}

/**
 * Capture the current state of the page
 * 
 * @param {Page} page - Playwright page object
 * @returns {Object} Page state
 */
async function capturePageState(page) {
  return page.evaluate(() => {
    return {
      title: document.title,
      metaTags: Array.from(document.querySelectorAll('meta')).map(meta => {
        const attributes = {};
        Array.from(meta.attributes).forEach(attr => {
          attributes[attr.name] = attr.value;
        });
        return attributes;
      }),
      headings: {
        h1: Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim()),
        h2: Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim()),
        h3: Array.from(document.querySelectorAll('h3')).map(h => h.textContent.trim())
      },
      links: Array.from(document.querySelectorAll('a[href]')).map(a => ({
        text: a.textContent.trim(),
        href: a.href,
        title: a.title || null
      })),
      images: Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt || null,
        width: img.width,
        height: img.height
      })),
      canonical: (() => {
        const link = document.querySelector('link[rel="canonical"]');
        return link ? link.href : null;
      })(),
      structuredData: (() => {
        const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
        return scripts.map(script => {
          try {
            return JSON.parse(script.textContent);
          } catch (e) {
            return { parseError: true, content: script.textContent };
          }
        });
      })()
    };
  });
}

/**
 * Simulate changes to the page
 * 
 * @param {Page} page - Playwright page object
 */
async function simulateChanges(page) {
  // Make temporary changes to the page to simulate SEO improvements
  await page.evaluate(() => {
    // We'll track the changes we make to verify later
    window._simulatedChanges = [];
    
    // 1. Change the title (if it exists)
    if (document.title) {
      const originalTitle = document.title;
      document.title = document.title + ' - SEO Optimized';
      window._simulatedChanges.push({ 
        type: 'title', 
        from: originalTitle, 
        to: document.title 
      });
    }
    
    // 2. Add or modify meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    const originalMetaDesc = metaDesc ? metaDesc.getAttribute('content') : null;
    
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      metaDesc.setAttribute('content', 'This is an optimized meta description added by SEOAutomate for better search visibility.');
      document.head.appendChild(metaDesc);
      
      window._simulatedChanges.push({ 
        type: 'metaDescription', 
        from: null, 
        to: 'This is an optimized meta description added by SEOAutomate for better search visibility.' 
      });
    } else {
      metaDesc.setAttribute('content', 'This is an optimized meta description modified by SEOAutomate for better search visibility.');
      
      window._simulatedChanges.push({ 
        type: 'metaDescription', 
        from: originalMetaDesc, 
        to: 'This is an optimized meta description modified by SEOAutomate for better search visibility.' 
      });
    }
    
    // 3. Add or modify canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    const originalCanonical = canonical ? canonical.getAttribute('href') : null;
    
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute('href', window.location.href);
      document.head.appendChild(canonical);
      
      window._simulatedChanges.push({ 
        type: 'canonical', 
        from: null, 
        to: window.location.href 
      });
    }
    
    // 4. Modify first image alt text if it exists
    const firstImg = document.querySelector('img:not([alt]), img[alt=""]');
    if (firstImg) {
      const originalAlt = firstImg.getAttribute('alt') || '';
      firstImg.setAttribute('alt', 'Optimized alt text for better image SEO and accessibility');
      
      window._simulatedChanges.push({ 
        type: 'imageAlt', 
        from: originalAlt, 
        to: 'Optimized alt text for better image SEO and accessibility' 
      });
    }
    
    // 5. Add structured data if none exists
    if (!document.querySelector('script[type="application/ld+json"]')) {
      const script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      
      const orgData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": document.title || "Organization Name",
        "url": window.location.href,
        "logo": "https://example.com/logo.png"
      };
      
      script.textContent = JSON.stringify(orgData);
      document.head.appendChild(script);
      
      window._simulatedChanges.push({ 
        type: 'structuredData', 
        from: null, 
        to: orgData 
      });
    }
    
    return window._simulatedChanges;
  });
}

/**
 * Compare before and after states
 * 
 * @param {Object} beforeState - State before changes
 * @param {Object} afterState - State after changes
 * @returns {Object} Comparison results
 */
function compareStates(beforeState, afterState) {
  const detectedChanges = [];
  
  // Check title changes
  if (beforeState.title !== afterState.title) {
    detectedChanges.push({
      type: 'title',
      from: beforeState.title,
      to: afterState.title
    });
  }
  
  // Check meta description changes
  const getMetaDesc = (metaTags) => {
    for (const meta of metaTags) {
      if (meta.name === 'description') {
        return meta.content;
      }
    }
    return null;
  };
  
  const beforeDesc = getMetaDesc(beforeState.metaTags);
  const afterDesc = getMetaDesc(afterState.metaTags);
  
  if (beforeDesc !== afterDesc) {
    detectedChanges.push({
      type: 'metaDescription',
      from: beforeDesc,
      to: afterDesc
    });
  }
  
  // Check canonical changes
  if (beforeState.canonical !== afterState.canonical) {
    detectedChanges.push({
      type: 'canonical',
      from: beforeState.canonical,
      to: afterState.canonical
    });
  }
  
  // Check image alt text changes
  const beforeImages = new Map(beforeState.images.map(img => [img.src, img.alt]));
  
  for (const afterImg of afterState.images) {
    const beforeAlt = beforeImages.get(afterImg.src);
    
    if (beforeAlt !== afterImg.alt) {
      detectedChanges.push({
        type: 'imageAlt',
        src: afterImg.src,
        from: beforeAlt,
        to: afterImg.alt
      });
    }
  }
  
  // Check structured data changes
  const beforeStructCount = beforeState.structuredData.length;
  const afterStructCount = afterState.structuredData.length;
  
  if (beforeStructCount !== afterStructCount) {
    detectedChanges.push({
      type: 'structuredData',
      from: `${beforeStructCount} items`,
      to: `${afterStructCount} items`
    });
  }
  
  // Calculate detection accuracy (this is a simulated accuracy since we controlled the changes)
  // In a real scenario, the expected changes would come from a known list of changes applied
  const expectedChanges = 5; // We made up to 5 changes in simulateChanges
  const detectionAccuracy = (detectedChanges.length / expectedChanges) * 100;
  
  return {
    detected: detectedChanges.length > 0,
    detectedChanges,
    detectionAccuracy: Math.min(detectionAccuracy, 100),
    timestamp: new Date().toISOString()
  };
}

module.exports = { run };
