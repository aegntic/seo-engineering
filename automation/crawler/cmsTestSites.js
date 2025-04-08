/**
 * SEO.engineering CMS Test Sites
 * 
 * This file contains a comprehensive list of test sites for different CMS platforms
 * to ensure thorough compatibility testing of the crawler and CMS detection system.
 */

module.exports = [
  // Major CMS Platforms
  {
    name: 'WordPress',
    url: 'https://wordpress.org',
    expectedCMS: 'wordpress',
    popularity: 'High',
    category: 'Major CMS'
  },
  {
    name: 'Shopify',
    url: 'https://shopify.com',
    expectedCMS: 'shopify',
    popularity: 'High',
    category: 'E-commerce'
  },
  {
    name: 'Wix',
    url: 'https://wix.com',
    expectedCMS: 'wix',
    popularity: 'High',
    category: 'Website Builder'
  },
  {
    name: 'Squarespace',
    url: 'https://squarespace.com',
    expectedCMS: 'squarespace',
    popularity: 'High',
    category: 'Website Builder'
  },
  {
    name: 'Drupal',
    url: 'https://drupal.org',
    expectedCMS: 'drupal',
    popularity: 'High',
    category: 'Major CMS'
  },
  {
    name: 'Joomla',
    url: 'https://joomla.org',
    expectedCMS: 'joomla',
    popularity: 'Medium',
    category: 'Major CMS'
  },
  
  // E-commerce Platforms
  {
    name: 'Magento',
    url: 'https://business.adobe.com/products/magento/magento-commerce.html',
    expectedCMS: 'magento',
    popularity: 'Medium',
    category: 'E-commerce'
  },
  {
    name: 'BigCommerce',
    url: 'https://www.bigcommerce.com',
    expectedCMS: 'bigcommerce',
    popularity: 'Medium',
    category: 'E-commerce'
  },
  {
    name: 'WooCommerce Demo',
    url: 'https://themes.woocommerce.com/storefront/',
    expectedCMS: 'wordpress',
    popularity: 'High',
    category: 'E-commerce'
  },
  
  // Blog & Content Platforms
  {
    name: 'Ghost',
    url: 'https://ghost.org',
    expectedCMS: 'ghost',
    popularity: 'Medium',
    category: 'Blog Platform'
  },
  {
    name: 'Medium',
    url: 'https://medium.com',
    expectedCMS: 'medium',
    popularity: 'High',
    category: 'Blog Platform'
  },
  
  // Modern Website Builders
  {
    name: 'Webflow',
    url: 'https://webflow.com',
    expectedCMS: 'webflow',
    popularity: 'Medium',
    category: 'Website Builder'
  },
  {
    name: 'Weebly',
    url: 'https://www.weebly.com',
    expectedCMS: 'weebly',
    popularity: 'Medium',
    category: 'Website Builder'
  },
  
  // Headless CMS
  {
    name: 'Contentful',
    url: 'https://www.contentful.com',
    expectedCMS: 'contentful',
    popularity: 'Growing',
    category: 'Headless CMS'
  },
  {
    name: 'Sanity',
    url: 'https://www.sanity.io',
    expectedCMS: 'sanity',
    popularity: 'Growing',
    category: 'Headless CMS'
  },
  
  // Enterprise CMS
  {
    name: 'Adobe Experience Manager',
    url: 'https://business.adobe.com/products/experience-manager/sites/aem-sites.html',
    expectedCMS: 'aem',
    popularity: 'Enterprise',
    category: 'Enterprise CMS'
  },
  {
    name: 'Sitecore',
    url: 'https://www.sitecore.com',
    expectedCMS: 'sitecore',
    popularity: 'Enterprise',
    category: 'Enterprise CMS'
  },
  
  // Custom sites that use specific frameworks
  {
    name: 'React-based Site',
    url: 'https://reactjs.org',
    expectedCMS: 'custom',
    popularity: 'High',
    category: 'Framework-based'
  },
  {
    name: 'NextJS-based Site',
    url: 'https://nextjs.org',
    expectedCMS: 'custom',
    popularity: 'High',
    category: 'Framework-based'
  },
  {
    name: 'Gatsby-based Site',
    url: 'https://www.gatsbyjs.com',
    expectedCMS: 'custom',
    popularity: 'Medium',
    category: 'Framework-based'
  }
];
