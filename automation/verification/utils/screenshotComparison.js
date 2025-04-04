/**
 * Screenshot Comparison Utility
 * 
 * Provides functions for comparing before and after screenshots
 * to detect visual differences and verify UI consistency.
 */

const fs = require('fs').promises;
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');
const logger = require('../../common/logger');

/**
 * Compare two images and calculate the difference
 * 
 * @param {string} beforePath - Path to the "before" image
 * @param {string} afterPath - Path to the "after" image
 * @param {Object} options - Comparison options
 * @returns {Promise<Object>} - Comparison results
 */
async function compareImages(beforePath, afterPath, options = {}) {
  logger.debug(`Comparing images: ${beforePath} and ${afterPath}`);
  
  const combinedOptions = {
    // Threshold for pixel color difference (0-255)
    colorThreshold: options.colorThreshold || 20,
    // Regions to ignore (array of {x, y, width, height})
    ignoreRegions: options.ignoreRegions || [],
    // Whether to generate a diff image
    generateDiff: options.generateDiff !== undefined ? options.generateDiff : true,
    // Path for the diff image output
    diffPath: options.diffPath || generateDiffPath(beforePath, afterPath),
    ...options
  };
  
  try {
    // Read the image files
    const [beforeBuffer, afterBuffer] = await Promise.all([
      fs.readFile(beforePath),
      fs.readFile(afterPath)
    ]);
    
    // Parse the PNGs
    const beforeImg = PNG.sync.read(beforeBuffer);
    const afterImg = PNG.sync.read(afterBuffer);
    
    // Check if dimensions match
    if (beforeImg.width !== afterImg.width || beforeImg.height !== afterImg.height) {
      logger.warn('Image dimensions do not match, resizing for comparison');
      // In a real implementation, we'd resize one or both images to match
      // For this example, we'll just report the mismatch
      return {
        differencePercentage: 100, // 100% difference for mismatched dimensions
        diffPixels: Math.max(beforeImg.width * beforeImg.height, afterImg.width * afterImg.height),
        totalPixels: Math.max(beforeImg.width * beforeImg.height, afterImg.width * afterImg.height),
        dimensions: {
          before: { width: beforeImg.width, height: beforeImg.height },
          after: { width: afterImg.width, height: afterImg.height }
        },
        error: 'Image dimensions do not match'
      };
    }
    
    // Create output diff image
    const diffImg = new PNG({ width: beforeImg.width, height: beforeImg.height });
    
    // Apply ignore regions mask
    applyIgnoreRegions(beforeImg, afterImg, combinedOptions.ignoreRegions);
    
    // Compare pixels
    const diffPixels = pixelmatch(
      beforeImg.data,
      afterImg.data,
      diffImg.data,
      beforeImg.width,
      beforeImg.height,
      { threshold: combinedOptions.colorThreshold / 255 } // pixelmatch uses 0-1 threshold
    );
    
    // Calculate difference percentage
    const totalPixels = beforeImg.width * beforeImg.height;
    const differencePercentage = (diffPixels / totalPixels) * 100;
    
    logger.debug(`Image difference: ${differencePercentage.toFixed(2)}% (${diffPixels} / ${totalPixels} pixels)`);
    
    // Save diff image if requested
    if (combinedOptions.generateDiff) {
      await saveDiffImage(diffImg, combinedOptions.diffPath);
    }
    
    return {
      differencePercentage,
      diffPixels,
      totalPixels,
      dimensions: {
        width: beforeImg.width,
        height: beforeImg.height
      },
      diffPath: combinedOptions.generateDiff ? combinedOptions.diffPath : null
    };
    
  } catch (error) {
    logger.error(`Image comparison failed: ${error.message}`);
    throw error;
  }
}

/**
 * Apply ignore regions to images by masking them with the same color in both images
 * 
 * @param {PNG} img1 - First image
 * @param {PNG} img2 - Second image
 * @param {Array} regions - Regions to ignore
 */
function applyIgnoreRegions(img1, img2, regions) {
  if (!regions || regions.length === 0) {
    return;
  }
  
  // Apply each ignore region
  regions.forEach(region => {
    const { x, y, width, height } = region;
    
    // Validate region bounds
    const maxX = Math.min(x + width, img1.width);
    const maxY = Math.min(y + height, img1.height);
    
    // Mask pixels in the region with black (0,0,0,0)
    for (let j = y; j < maxY; j++) {
      for (let i = x; i < maxX; i++) {
        const idx = (j * img1.width + i) * 4;
        
        // Set RGBA values to 0 in both images
        img1.data[idx] = 0;
        img1.data[idx + 1] = 0;
        img1.data[idx + 2] = 0;
        img1.data[idx + 3] = 0;
        
        img2.data[idx] = 0;
        img2.data[idx + 1] = 0;
        img2.data[idx + 2] = 0;
        img2.data[idx + 3] = 0;
      }
    }
  });
}

/**
 * Generate a path for the diff image
 * 
 * @param {string} beforePath - Path to the "before" image
 * @param {string} afterPath - Path to the "after" image
 * @returns {string} - Path for the diff image
 */
function generateDiffPath(beforePath, afterPath) {
  const beforeName = path.basename(beforePath, path.extname(beforePath));
  const afterName = path.basename(afterPath, path.extname(afterPath));
  const diffDir = path.dirname(beforePath);
  
  return path.join(diffDir, `diff_${beforeName}_${afterName}_${Date.now()}.png`);
}

/**
 * Save a PNG diff image to disk
 * 
 * @param {PNG} diffImg - Diff image
 * @param {string} diffPath - Output path
 * @returns {Promise<void>}
 */
async function saveDiffImage(diffImg, diffPath) {
  try {
    // Create directory if it doesn't exist
    const diffDir = path.dirname(diffPath);
    await fs.mkdir(diffDir, { recursive: true });
    
    // Write the diff image
    const buffer = PNG.sync.write(diffImg);
    await fs.writeFile(diffPath, buffer);
    
    logger.debug(`Diff image saved to: ${diffPath}`);
  } catch (error) {
    logger.error(`Failed to save diff image: ${error.message}`);
    throw error;
  }
}

/**
 * Compare multiple screenshot pairs
 * 
 * @param {Array} pairs - Array of screenshot pairs
 * @param {Object} options - Comparison options
 * @returns {Promise<Array>} - Comparison results
 */
async function compareMultipleScreenshots(pairs, options = {}) {
  return Promise.all(
    pairs.map(async ({ before, after }) => {
      try {
        const result = await compareImages(before.path, after.path, options);
        
        return {
          url: before.url,
          device: before.device,
          viewport: before.viewport,
          beforePath: before.path,
          afterPath: after.path,
          ...result
        };
      } catch (error) {
        logger.error(`Screenshot comparison failed for ${before.url}: ${error.message}`);
        
        return {
          url: before.url,
          device: before.device,
          viewport: before.viewport,
          beforePath: before.path,
          afterPath: after.path,
          differencePercentage: 100, // Assume 100% difference on error
          error: error.message
        };
      }
    })
  );
}

/**
 * Generate histogram of pixel differences for advanced analysis
 * 
 * @param {PNG} img1 - First image
 * @param {PNG} img2 - Second image
 * @returns {Object} - Histogram data
 */
function generateDifferenceHistogram(img1, img2) {
  // Initialize histogram bins (0-255)
  const histogram = new Array(256).fill(0);
  
  // Calculate absolute difference for each pixel
  for (let i = 0; i < img1.data.length; i += 4) {
    // Calculate Manhattan distance in RGB space
    const rDiff = Math.abs(img1.data[i] - img2.data[i]);
    const gDiff = Math.abs(img1.data[i + 1] - img2.data[i + 1]);
    const bDiff = Math.abs(img1.data[i + 2] - img2.data[i + 2]);
    
    // Average RGB difference
    const avgDiff = Math.floor((rDiff + gDiff + bDiff) / 3);
    
    // Increment histogram bin
    histogram[avgDiff]++;
  }
  
  return {
    histogram,
    totalPixels: img1.width * img1.height,
    // Calculate some useful statistics
    statistics: calculateHistogramStatistics(histogram, img1.width * img1.height)
  };
}

/**
 * Calculate statistics from a difference histogram
 * 
 * @param {Array} histogram - Difference histogram
 * @param {number} totalPixels - Total number of pixels
 * @returns {Object} - Statistics
 */
function calculateHistogramStatistics(histogram, totalPixels) {
  // Calculate how many pixels are in each difference range
  const ranges = {
    identical: 0,    // 0 difference
    subtle: 0,       // 1-10 difference
    noticeable: 0,   // 11-30 difference
    different: 0,    // 31-100 difference
    veryDifferent: 0 // 101-255 difference
  };
  
  // Populate ranges
  histogram.forEach((count, diff) => {
    if (diff === 0) {
      ranges.identical += count;
    } else if (diff <= 10) {
      ranges.subtle += count;
    } else if (diff <= 30) {
      ranges.noticeable += count;
    } else if (diff <= 100) {
      ranges.different += count;
    } else {
      ranges.veryDifferent += count;
    }
  });
  
  // Calculate percentages
  const percentages = {};
  Object.entries(ranges).forEach(([range, count]) => {
    percentages[range] = (count / totalPixels) * 100;
  });
  
  // Calculate mean difference
  let sum = 0;
  let count = 0;
  
  histogram.forEach((pixelCount, diff) => {
    sum += diff * pixelCount;
    count += pixelCount;
  });
  
  const meanDifference = count > 0 ? sum / count : 0;
  
  return {
    ranges,
    percentages,
    meanDifference
  };
}

module.exports = {
  compareImages,
  compareMultipleScreenshots,
  generateDifferenceHistogram
};
