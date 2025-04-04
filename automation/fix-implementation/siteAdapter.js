/**
 * Site Adapter Module
 * 
 * Provides adaptation layers for different site types and CMSes:
 * - Detects site structure and CMS
 * - Maps file paths to their roles (HTML, CSS, JS, images, etc.)
 * - Provides file operation utilities
 * - Handles CMS-specific operations (e.g., WordPress, Shopify, custom)
 */

const path = require('path');
const fs = require('fs/promises');
const { execSync } = require('child_process');
const cheerio = require('cheerio');
const logger = require('../utils/logger');

// Known CMS detection patterns
const CMS_DETECTION_PATTERNS = {
  wordpress: [
    { path: 'wp-config.php', type: 'file' },
    { path: 'wp-content', type: 'directory' }
  ],
  shopify: [
    { path: 'config/settings_data.json', type: 'file' },
    { path: 'templates', type: 'directory' }
  ],
  magento: [
    { path: 'app/Mage.php', type: 'file' },
    { path: 'app/etc/config.xml', type: 'file' }
  ],
  drupal: [
    { path: 'core/lib/Drupal.php', type: 'file' },
    { path: 'sites/default/settings.php', type: 'file' }
  ],
  joomla: [
    { path: 'configuration.php', type: 'file' },
    { path: 'administrator', type: 'directory' }
  ],
  gatsby: [
    { path: 'gatsby-config.js', type: 'file' }
  ],
  nextjs: [
    { path: 'next.config.js', type: 'file' }
  ]
};

/**
 * Analyzes a site's structure and detects CMS
 * @param {string} repoPath - Path to the repository
 * @param {string} [knownCmsType] - CMS type if already known
 * @returns {Promise<Object>} - Site structure information
 */
async function analyzeSite(repoPath, knownCmsType = null) {
  try {
    // Structure object to return
    const structure = {
      cmsType: knownCmsType,
      fileTypes: {},
      keyFiles: {},
      seoFiles: []
    };
    
    // If CMS type is not provided, try to detect it
    if (!structure.cmsType) {
      structure.cmsType = await detectCmsType(repoPath);
    }
    
    // Scan repository for important file types
    await scanRepositoryFiles(repoPath, structure);
    
    // Find key SEO-related files
    await findSeoFiles(repoPath, structure);
    
    // Load CMS-specific adapter if available
    const cmsAdapter = getCmsAdapter(structure.cmsType);
    if (cmsAdapter) {
      await cmsAdapter.enhanceStructure(repoPath, structure);
    }
    
    logger.info(`Site analysis complete: ${structure.cmsType || 'custom'} site`);
    return structure;
  } catch (error) {
    logger.error('Site analysis failed:', error);
    throw new Error(`Failed to analyze site: ${error.message}`);
  }
}

/**
 * Detects the CMS type based on file structure
 * @param {string} repoPath - Path to the repository
 * @returns {Promise<string|null>} - Detected CMS type or null
 */
async function detectCmsType(repoPath) {
  try {
    for (const [cmsType, patterns] of Object.entries(CMS_DETECTION_PATTERNS)) {
      // Check if all patterns match
      const matches = await Promise.all(
        patterns.map(async pattern => {
          const fullPath = path.join(repoPath, pattern.path);
          try {
            const stats = await fs.stat(fullPath);
            return pattern.type === 'directory' ? stats.isDirectory() : stats.isFile();
          } catch (e) {
            return false;
          }
        })
      );
      
      // If all patterns match, we found the CMS
      if (matches.every(match => match)) {
        logger.info(`Detected CMS: ${cmsType}`);
        return cmsType;
      }
    }
    
    logger.info('No specific CMS detected, treating as custom site');
    return null;
  } catch (error) {
    logger.error('CMS detection failed:', error);
    return null;
  }
}

/**
 * Scans repository files to categorize them
 * @param {string} repoPath - Path to the repository
 * @param {Object} structure - Site structure object to update
 * @returns {Promise<void>}
 */
async function scanRepositoryFiles(repoPath, structure) {
  try {
    // Get all files in the repository (excluding .git)
    const cmd = `find ${repoPath} -type f -not -path "*/\.git/*" | sort`;
    const filesOutput = execSync(cmd).toString().trim();
    
    if (!filesOutput) {
      throw new Error('No files found in repository');
    }
    
    const files = filesOutput.split('\n');
    structure.fileTypes = {
      html: [],
      css: [],
      js: [],
      images: [],
      xml: [],
      json: [],
      other: []
    };
    
    // Categorize files by extension
    for (const filePath of files) {
      const relativePath = path.relative(repoPath, filePath);
      const extension = path.extname(filePath).toLowerCase();
      
      switch (extension) {
        case '.html':
        case '.htm':
        case '.php':
        case '.jsx':
        case '.tsx':
          structure.fileTypes.html.push(relativePath);
          break;
        case '.css':
        case '.scss':
        case '.less':
          structure.fileTypes.css.push(relativePath);
          break;
        case '.js':
        case '.ts':
        case '.jsx':
        case '.tsx':
          structure.fileTypes.js.push(relativePath);
          break;
        case '.jpg':
        case '.jpeg':
        case '.png':
        case '.gif':
        case '.svg':
        case '.webp':
          structure.fileTypes.images.push(relativePath);
          break;
        case '.xml':
        case '.rss':
        case '.atom':
          structure.fileTypes.xml.push(relativePath);
          break;
        case '.json':
          structure.fileTypes.json.push(relativePath);
          break;
        default:
          structure.fileTypes.other.push(relativePath);
      }
    }
    
    logger.info(`Scanned ${files.length} files in repository`);
  } catch (error) {
    logger.error('File scanning failed:', error);
    throw new Error(`Failed to scan repository files: ${error.message}`);
  }
}

/**
 * Finds SEO-related files in the repository
 * @param {string} repoPath - Path to the repository
 * @param {Object} structure - Site structure object to update
 * @returns {Promise<void>}
 */
async function findSeoFiles(repoPath, structure) {
  try {
    // Common SEO files by name
    const seoFilePatterns = [
      'robots.txt',
      'sitemap.xml',
      'sitemap_index.xml',
      'sitemap-index.xml',
      '.htaccess'
    ];
    
    // Key HTML files to check for SEO elements
    const keyHtmlFiles = [];
    
    // Handle different CMS types
    switch (structure.cmsType) {
      case 'wordpress':
        keyHtmlFiles.push(
          'header.php',
          'index.php',
          'single.php',
          'page.php',
          'functions.php'
        );
        break;
      case 'shopify':
        keyHtmlFiles.push(
          'layout/theme.liquid',
          'templates/index.liquid',
          'templates/product.liquid',
          'templates/collection.liquid'
        );
        break;
      default:
        // For unknown CMS, check common patterns
        keyHtmlFiles.push(
          'index.html',
          'index.php',
          'default.html',
          'layout.html',
          'main.html',
          '_layout.html'
        );
    }
    
    // Find all the SEO-specific files
    for (const seoPattern of seoFilePatterns) {
      const fullPath = path.join(repoPath, seoPattern);
      try {
        await fs.access(fullPath);
        structure.seoFiles.push(seoPattern);
        structure.keyFiles[seoPattern] = seoPattern;
      } catch (e) {
        // File doesn't exist, ignore
      }
    }
    
    // Find key HTML files
    for (const htmlFile of keyHtmlFiles) {
      const fullPath = path.join(repoPath, htmlFile);
      try {
        await fs.access(fullPath);
        structure.keyFiles[path.basename(htmlFile)] = htmlFile;
      } catch (e) {
        // File doesn't exist, ignore
      }
    }
    
    // For HTML files, try to find the main ones by reading them
    // and checking for common SEO elements
    const seoElements = ['title', 'meta[name="description"]', 'meta[name="keywords"]', 'link[rel="canonical"]'];
    
    // Limit to 20 HTML files to avoid excessive processing
    const htmlFilesToCheck = structure.fileTypes.html.slice(0, 20);
    
    for (const htmlFile of htmlFilesToCheck) {
      try {
        const fullPath = path.join(repoPath, htmlFile);
        const content = await fs.readFile(fullPath, 'utf-8');
        const $ = cheerio.load(content);
        
        let seoScore = 0;
        for (const selector of seoElements) {
          if ($(selector).length > 0) {
            seoScore++;
          }
        }
        
        // If this file has multiple SEO elements, add it to seoFiles
        if (seoScore >= 2) {
          structure.seoFiles.push(htmlFile);
        }
        
        // If this looks like a main template file, add it to keyFiles
        if ($('html').length > 0 && $('head').length > 0 && $('body').length > 0) {
          structure.keyFiles[path.basename(htmlFile)] = htmlFile;
        }
      } catch (e) {
        // Skip files that can't be read or parsed
        logger.debug(`Could not process HTML file: ${htmlFile}`, e);
      }
    }
    
    logger.info(`Found ${structure.seoFiles.length} SEO-related files`);
  } catch (error) {
    logger.error('SEO file detection failed:', error);
    throw new Error(`Failed to find SEO files: ${error.message}`);
  }
}

/**
 * Gets a CMS-specific adapter if available
 * @param {string} cmsType - Detected CMS type
 * @returns {Object|null} - CMS adapter or null
 */
function getCmsAdapter(cmsType) {
  if (!cmsType) return null;
  
  try {
    // Try to load the CMS-specific adapter
    const adapterPath = `./cms/${cmsType}Adapter`;
    return require(adapterPath);
  } catch (e) {
    logger.debug(`No specific adapter for CMS type: ${cmsType}`);
    return null;
  }
}

/**
 * Checks if a file exists in the repository
 * @param {string} repoPath - Path to the repository
 * @param {string} filePath - Relative path to the file
 * @returns {Promise<boolean>} - True if file exists
 */
async function checkFileExists(repoPath, filePath) {
  try {
    const fullPath = path.join(repoPath, filePath);
    await fs.access(fullPath);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Reads a file from the repository
 * @param {string} repoPath - Path to the repository
 * @param {string} filePath - Relative path to the file
 * @returns {Promise<string>} - File content
 */
async function readFile(repoPath, filePath) {
  try {
    const fullPath = path.join(repoPath, filePath);
    return await fs.readFile(fullPath, 'utf-8');
  } catch (error) {
    logger.error(`Failed to read file: ${filePath}`, error);
    throw new Error(`Failed to read file: ${error.message}`);
  }
}

/**
 * Writes content to a file in the repository
 * @param {string} repoPath - Path to the repository
 * @param {string} filePath - Relative path to the file
 * @param {string} content - Content to write
 * @returns {Promise<void>}
 */
async function writeFile(repoPath, filePath, content) {
  try {
    const fullPath = path.join(repoPath, filePath);
    
    // Ensure directory exists
    const dirPath = path.dirname(fullPath);
    await fs.mkdir(dirPath, { recursive: true });
    
    await fs.writeFile(fullPath, content, 'utf-8');
    logger.info(`File written: ${filePath}`);
  } catch (error) {
    logger.error(`Failed to write file: ${filePath}`, error);
    throw new Error(`Failed to write file: ${error.message}`);
  }
}

module.exports = {
  analyzeSite,
  checkFileExists,
  readFile,
  writeFile
};