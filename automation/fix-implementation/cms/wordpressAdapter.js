/**
 * WordPress CMS Adapter
 * 
 * Provides WordPress-specific functionality:
 * - Identifies WordPress file structure
 * - Maps theme/plugin file roles
 * - Handles WordPress-specific SEO elements
 * - Ensures compatibility with WordPress ecosystem
 */

const path = require('path');
const fs = require('fs/promises');
const cheerio = require('cheerio');
const siteAdapter = require('../siteAdapter');
const logger = require('../../utils/logger');

/**
 * Enhances site structure with WordPress-specific information
 * @param {string} repoPath - Path to the repository
 * @param {Object} structure - Base site structure
 * @returns {Promise<Object>} - Enhanced structure
 */
async function enhanceStructure(repoPath, structure) {
  try {
    // Set CMS type explicitly
    structure.cmsType = 'wordpress';
    
    // Find WordPress theme information
    const themeData = await detectTheme(repoPath);
    if (themeData) {
      structure.theme = themeData;
    }
    
    // Detect active plugins
    const plugins = await detectPlugins(repoPath);
    if (plugins && plugins.length > 0) {
      structure.plugins = plugins;
    }
    
    // Find key WordPress template files
    const templateFiles = await findTemplateFiles(repoPath);
    if (templateFiles) {
      structure.templateFiles = templateFiles;
    }
    
    // Discover SEO plugin configuration
    const seoPluginConfig = await detectSeoPluginConfig(repoPath, plugins);
    if (seoPluginConfig) {
      structure.seoPluginConfig = seoPluginConfig;
    }
    
    logger.info('WordPress site structure enhanced', {
      theme: themeData?.name,
      plugins: plugins?.length,
      templates: Object.keys(templateFiles || {}).length
    });
    
    return structure;
  } catch (error) {
    logger.error('Error enhancing WordPress structure:', error);
    return structure;
  }
}

/**
 * Detects the WordPress theme in use
 * @param {string} repoPath - Path to the repository
 * @returns {Promise<Object|null>} - Theme information
 */
async function detectTheme(repoPath) {
  try {
    // Check for wp-content/themes directory
    const themesPath = path.join(repoPath, 'wp-content', 'themes');
    
    // List of potential active theme indicators
    const themeIndicators = [
      path.join(repoPath, 'wp-content', 'themes', 'current-theme.txt'),
      path.join(repoPath, '.active-theme')
    ];
    
    // Try to find active theme from indicators
    for (const indicator of themeIndicators) {
      try {
        const content = await fs.readFile(indicator, 'utf-8');
        const themeName = content.trim();
        if (themeName) {
          return {
            name: themeName,
            path: path.join('wp-content', 'themes', themeName),
            type: 'indicator'
          };
        }
      } catch (e) {
        // Indicator file doesn't exist, continue
      }
    }
    
    // Check if only one theme directory exists
    try {
      const themes = await fs.readdir(themesPath);
      const themeDirs = [];
      
      // Filter out files, only include directories
      for (const item of themes) {
        const itemPath = path.join(themesPath, item);
        const stats = await fs.stat(itemPath);
        if (stats.isDirectory() && item !== '.' && item !== '..') {
          themeDirs.push(item);
        }
      }
      
      // If only one theme, assume it's active
      if (themeDirs.length === 1) {
        return {
          name: themeDirs[0],
          path: path.join('wp-content', 'themes', themeDirs[0]),
          type: 'single'
        };
      }
      
      // Check for common active theme markers in style.css
      for (const theme of themeDirs) {
        const styleFile = path.join(themesPath, theme, 'style.css');
        
        try {
          const styleContent = await fs.readFile(styleFile, 'utf-8');
          const nameMatch = styleContent.match(/Theme Name:\s*([^\n]+)/);
          
          if (nameMatch) {
            // Look for signs of active theme
            const themeFiles = await fs.readdir(path.join(themesPath, theme));
            const hasCustomizer = themeFiles.some(file => file.includes('customizer') || file.includes('kirki'));
            const hasScreenshot = themeFiles.includes('screenshot.png');
            
            if (hasCustomizer || hasScreenshot) {
              return {
                name: theme,
                displayName: nameMatch[1].trim(),
                path: path.join('wp-content', 'themes', theme),
                type: 'detected'
              };
            }
          }
        } catch (e) {
          // Can't read style.css, skip this theme
        }
      }
    } catch (e) {
      // Themes directory doesn't exist or can't be read
    }
    
    // Fallback: check for wp-content/themes/[sitename]
    try {
      // Extract site name from URL or directory name
      const repoName = path.basename(repoPath);
      const themePath = path.join(themesPath, repoName);
      
      const exists = await fileExists(themePath);
      if (exists) {
        return {
          name: repoName,
          path: path.join('wp-content', 'themes', repoName),
          type: 'name-match'
        };
      }
    } catch (e) {
      // Error checking theme path
    }
    
    // No theme detected
    return null;
  } catch (error) {
    logger.error('Error detecting WordPress theme:', error);
    return null;
  }
}

/**
 * Detects WordPress plugins installed in the repository
 * @param {string} repoPath - Path to the repository
 * @returns {Promise<Array|null>} - List of detected plugins
 */
async function detectPlugins(repoPath) {
  try {
    // Check for wp-content/plugins directory
    const pluginsPath = path.join(repoPath, 'wp-content', 'plugins');
    
    try {
      const plugins = await fs.readdir(pluginsPath);
      const pluginList = [];
      
      // Process each potential plugin
      for (const plugin of plugins) {
        // Skip files and temporary directories
        if (plugin === '.' || plugin === '..' || plugin === 'index.php') {
          continue;
        }
        
        const pluginPath = path.join(pluginsPath, plugin);
        const stats = await fs.stat(pluginPath);
        
        if (stats.isDirectory()) {
          // Check for main plugin file
          const mainFile = path.join(pluginPath, `${plugin}.php`);
          let pluginInfo = { name: plugin, active: true };
          
          try {
            const mainFileContent = await fs.readFile(mainFile, 'utf-8');
            
            // Extract plugin info from file header
            const nameMatch = mainFileContent.match(/Plugin Name:\s*([^\n]+)/);
            const versionMatch = mainFileContent.match(/Version:\s*([^\n]+)/);
            
            if (nameMatch) {
              pluginInfo.displayName = nameMatch[1].trim();
            }
            
            if (versionMatch) {
              pluginInfo.version = versionMatch[1].trim();
            }
          } catch (e) {
            // Main file doesn't exist or can't be read
            // Try to find any PHP file in the plugin directory
            try {
              const files = await fs.readdir(pluginPath);
              const phpFiles = files.filter(file => file.endsWith('.php'));
              
              if (phpFiles.length > 0) {
                const firstPhpFile = path.join(pluginPath, phpFiles[0]);
                const fileContent = await fs.readFile(firstPhpFile, 'utf-8');
                
                const nameMatch = fileContent.match(/Plugin Name:\s*([^\n]+)/);
                if (nameMatch) {
                  pluginInfo.displayName = nameMatch[1].trim();
                }
              }
            } catch (dirError) {
              // Couldn't read plugin directory
            }
          }
          
          // Check if plugin is SEO-related
          pluginInfo.isSeoPlugin = isSeoPlugin(plugin, pluginInfo.displayName);
          
          pluginList.push(pluginInfo);
        }
      }
      
      return pluginList;
    } catch (e) {
      // Plugins directory doesn't exist or can't be read
      return null;
    }
  } catch (error) {
    logger.error('Error detecting WordPress plugins:', error);
    return null;
  }
}

/**
 * Finds key WordPress template files
 * @param {string} repoPath - Path to the repository
 * @returns {Promise<Object|null>} - Template file paths
 */
async function findTemplateFiles(repoPath) {
  try {
    // Get theme information first
    const theme = await detectTheme(repoPath);
    if (!theme) {
      return null;
    }
    
    const themePath = path.join(repoPath, theme.path);
    const templateFiles = {};
    
    // Standard WordPress template files to look for
    const standardTemplates = [
      'header.php',
      'footer.php',
      'index.php',
      'single.php',
      'page.php',
      'archive.php',
      'search.php',
      'functions.php',
      'style.css'
    ];
    
    // Check each template file
    for (const template of standardTemplates) {
      const templatePath = path.join(themePath, template);
      const exists = await fileExists(templatePath);
      
      if (exists) {
        templateFiles[template] = path.join(theme.path, template);
      }
    }
    
    // Check for common directory structures
    const commonDirs = ['inc', 'includes', 'template-parts', 'partials'];
    
    for (const dir of commonDirs) {
      const dirPath = path.join(themePath, dir);
      const exists = await fileExists(dirPath);
      
      if (exists) {
        templateFiles[`${dir}_dir`] = path.join(theme.path, dir);
        
        // Check for SEO-related files in this directory
        try {
          const files = await fs.readdir(dirPath);
          const seoFiles = files.filter(file => 
            file.toLowerCase().includes('seo') || 
            file.toLowerCase().includes('meta') || 
            file.toLowerCase().includes('schema')
          );
          
          if (seoFiles.length > 0) {
            templateFiles.seoFiles = seoFiles.map(file => path.join(theme.path, dir, file));
          }
        } catch (e) {
          // Can't read directory
        }
      }
    }
    
    return templateFiles;
  } catch (error) {
    logger.error('Error finding WordPress template files:', error);
    return null;
  }
}

/**
 * Detects SEO plugin configuration
 * @param {string} repoPath - Path to the repository
 * @param {Array} plugins - Detected plugins
 * @returns {Promise<Object|null>} - SEO plugin configuration
 */
async function detectSeoPluginConfig(repoPath, plugins) {
  try {
    if (!plugins || plugins.length === 0) {
      return null;
    }
    
    // Find SEO plugins
    const seoPlugins = plugins.filter(plugin => plugin.isSeoPlugin);
    
    if (seoPlugins.length === 0) {
      return null;
    }
    
    const seoConfig = {
      plugins: seoPlugins,
      configFiles: []
    };
    
    // Check for common SEO plugin configuration files
    for (const plugin of seoPlugins) {
      const pluginPath = path.join(repoPath, 'wp-content', 'plugins', plugin.name);
      
      // Common configuration files to check
      const configFiles = [
        'settings.php', 
        'options.php', 
        'config.php',
        path.join('includes', 'settings.php'),
        path.join('includes', 'options.php')
      ];
      
      for (const configFile of configFiles) {
        const configPath = path.join(pluginPath, configFile);
        const exists = await fileExists(configPath);
        
        if (exists) {
          seoConfig.configFiles.push({
            plugin: plugin.name,
            path: path.join('wp-content', 'plugins', plugin.name, configFile)
          });
        }
      }
    }
    
    return seoConfig;
  } catch (error) {
    logger.error('Error detecting SEO plugin configuration:', error);
    return null;
  }
}

/**
 * Determines if a plugin is SEO-related
 * @param {string} pluginName - Plugin directory name
 * @param {string} displayName - Plugin display name
 * @returns {boolean} - True if it's an SEO plugin
 */
function isSeoPlugin(pluginName, displayName) {
  // List of known SEO plugin identifiers
  const seoPluginIdentifiers = [
    'seo', 
    'yoast', 
    'rank-math', 
    'all-in-one-seo', 
    'aioseo',
    'seopress', 
    'squirrly-seo',
    'schema', 
    'structured-data',
    'sitemap',
    'meta-tags',
    'redirection',
    'broken-link-checker'
  ];
  
  // Check plugin name against identifiers
  const normalizedName = pluginName.toLowerCase();
  const normalizedDisplayName = displayName ? displayName.toLowerCase() : '';
  
  return seoPluginIdentifiers.some(identifier => 
    normalizedName.includes(identifier) || 
    normalizedDisplayName.includes(identifier)
  );
}

/**
 * Helper to check if a file or directory exists
 * @param {string} path - Path to check
 * @returns {Promise<boolean>} - True if exists
 */
async function fileExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = {
  enhanceStructure,
  detectTheme,
  detectPlugins,
  findTemplateFiles,
  detectSeoPluginConfig
};