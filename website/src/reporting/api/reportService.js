/**
 * API service for fetching and managing report data
 * 
 * This module provides functions to interact with the SEOAutomate API
 * for retrieving, generating, and managing SEO reports.
 */

/**
 * API base URL - will be loaded from environment variables in production
 */
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Fetch report data for a specific site
 * @param {string} siteId ID of the site
 * @param {string} reportId Optional ID of a specific report
 * @param {Object} params Additional query parameters
 * @returns {Promise<Object>} Promise that resolves with the report data
 */
export const fetchReportData = async (siteId, reportId = null, params = {}) => {
  try {
    // Build the URL based on whether we're getting a specific report or the latest
    let url = `${API_BASE_URL}/sites/${siteId}/reports`;
    if (reportId) {
      url += `/${reportId}`;
    } else {
      url += '/latest';
    }
    
    // Add query parameters if provided
    if (Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
      url += `?${queryParams.toString()}`;
    }
    
    // In the MVP phase, we'll use mock data for testing
    // This would be replaced with an actual API call in production
    
    // Simulate an API call with mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockReportData(siteId, reportId));
      }, 500); // Simulate network delay
    });
  } catch (error) {
    console.error('Error fetching report data:', error);
    throw new Error('Failed to fetch report data. Please try again.');
  }
};

/**
 * Generate a new report for a site
 * @param {string} siteId ID of the site
 * @param {Object} options Report generation options
 * @returns {Promise<Object>} Promise that resolves when the report is generated
 */
export const generateReport = async (siteId, options = {}) => {
  try {
    // In the MVP phase, we'll use mock data
    // This would be replaced with an actual API call in production
    
    // Simulate an API call with mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Report generated successfully',
          reportId: `report-${Date.now()}`,
          siteId
        });
      }, 1500); // Simulate report generation time
    });
  } catch (error) {
    console.error('Error generating report:', error);
    throw new Error('Failed to generate report. Please try again.');
  }
};

/**
 * Get a list of all reports for a site
 * @param {string} siteId ID of the site
 * @param {Object} params Query parameters (pagination, filters, etc.)
 * @returns {Promise<Array>} Promise that resolves with the list of reports
 */
export const getReportsList = async (siteId, params = {}) => {
  try {
    // In the MVP phase, we'll use mock data
    // This would be replaced with an actual API call in production
    
    // Simulate an API call with mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate a list of mock reports
        const reports = Array.from({ length: 5 }, (_, i) => ({
          id: `report-${i + 1}`,
          siteId,
          scanDate: new Date(Date.now() - (i * 86400000)).toISOString(), // One report per day
          score: 70 + Math.floor(Math.random() * 20), // Random score between 70-90
          issueCount: Math.floor(Math.random() * 10) + 5 // Random issue count
        }));
        
        resolve(reports);
      }, 500); // Simulate network delay
    });
  } catch (error) {
    console.error('Error fetching reports list:', error);
    throw new Error('Failed to fetch reports list. Please try again.');
  }
};

/**
 * Delete a specific report
 * @param {string} siteId ID of the site
 * @param {string} reportId ID of the report to delete
 * @returns {Promise<Object>} Promise that resolves when the report is deleted
 */
export const deleteReport = async (siteId, reportId) => {
  try {
    // In the MVP phase, we'll use mock data
    // This would be replaced with an actual API call in production
    
    // Simulate an API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Report deleted successfully'
        });
      }, 300); // Simulate network delay
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    throw new Error('Failed to delete report. Please try again.');
  }
};

/**
 * Schedule an automated report
 * @param {string} siteId ID of the site
 * @param {Object} schedule Schedule configuration
 * @param {string} schedule.frequency How often to run the report (daily, weekly, monthly)
 * @param {string} schedule.dayOfWeek Day of week for weekly reports
 * @param {string} schedule.dayOfMonth Day of month for monthly reports
 * @param {string} schedule.time Time of day to run the report
 * @returns {Promise<Object>} Promise that resolves with the schedule details
 */
export const scheduleReport = async (siteId, schedule) => {
  try {
    // In the MVP phase, we'll use mock data
    // This would be replaced with an actual API call in production
    
    // Simulate an API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Report scheduled successfully',
          schedule: {
            ...schedule,
            id: `schedule-${Date.now()}`,
            siteId,
            nextRun: new Date(Date.now() + 86400000).toISOString() // Tomorrow
          }
        });
      }, 300); // Simulate network delay
    });
  } catch (error) {
    console.error('Error scheduling report:', error);
    throw new Error('Failed to schedule report. Please try again.');
  }
};

/**
 * Get mock report data for testing
 * @param {string} siteId ID of the site
 * @param {string} reportId ID of the report
 * @returns {Object} Mock report data
 */
const getMockReportData = (siteId, reportId) => {
  // Generate a semi-random domain based on the siteId
  const domain = `example-${siteId}.com`;
  
  return {
    id: reportId || `report-${Date.now()}`,
    siteId,
    siteUrl: `https://${domain}`,
    scanDate: new Date().toISOString(),
    score: 78,
    metrics: [
      {
        name: 'Page Speed',
        value: 84,
        unit: '',
        change: 5,
        description: 'Average page load time'
      },
      {
        name: 'Mobile Friendliness',
        value: 92,
        unit: '',
        change: 0,
        description: 'Mobile optimization score'
      },
      {
        name: 'HTTPS',
        value: 'Secure',
        unit: '',
        change: 0,
        description: 'SSL Implementation'
      },
      {
        name: 'Crawlability',
        value: 63,
        unit: '%',
        change: -2,
        description: 'Percentage of pages that can be crawled'
      },
      {
        name: 'Technical Issues',
        value: 7,
        unit: '',
        change: -3,
        description: 'Number of issues found'
      },
      {
        name: 'Meta Tags',
        value: 86,
        unit: '%',
        change: 4,
        description: 'Meta tag quality score'
      }
    ],
    issues: [
      {
        title: 'Missing Meta Descriptions',
        description: '4 pages are missing meta descriptions, which may affect click-through rates from search results.',
        severity: 'high',
        location: '/blog/category/',
        impact: 'Reduces click-through rates',
        category: 'technical'
      },
      {
        title: 'Slow Page Load Time',
        description: 'Home page takes over 3.5 seconds to load, which is above the recommended threshold.',
        severity: 'critical',
        location: '/',
        impact: 'Poor user experience and SEO ranking',
        category: 'performance'
      },
      {
        title: 'Missing Alt Text',
        description: '12 images are missing alternative text, making them inaccessible to screen readers.',
        severity: 'medium',
        location: '/products/',
        impact: 'Reduced accessibility and SEO',
        category: 'content'
      },
      {
        title: 'H1 Tag Missing',
        description: '2 pages are missing H1 headings, which may affect content hierarchy.',
        severity: 'medium',
        location: '/services/consulting/',
        impact: 'Content hierarchy issues',
        category: 'technical'
      },
      {
        title: 'Non-HTTPS Images',
        description: 'Some images are loaded over HTTP, triggering mixed content warnings.',
        severity: 'high',
        location: '/about/',
        impact: 'Security warnings for users',
        category: 'security'
      },
      {
        title: 'Mobile Viewport Not Set',
        description: 'Mobile viewport meta tag is missing on some pages, affecting mobile display.',
        severity: 'medium',
        location: '/contact/',
        impact: 'Poor mobile experience',
        category: 'mobile'
      },
      {
        title: 'Duplicate Title Tags',
        description: '3 pages have identical title tags, which may confuse search engines.',
        severity: 'medium',
        location: '/blog/',
        impact: 'Reduced search visibility',
        category: 'technical'
      }
    ],
    recommendations: [
      {
        title: 'Optimize Page Loading Speed',
        description: 'Improve user experience and SEO by reducing page load times on critical pages',
        category: 'performance',
        impact: 5,
        steps: [
          'Compress and optimize images on the home page',
          'Minimize and combine CSS and JavaScript files',
          'Implement browser caching for static assets',
          'Consider using a Content Delivery Network (CDN)'
        ],
        resources: [
          { title: 'Google PageSpeed Insights', url: 'https://pagespeed.web.dev/' },
          { title: 'Web.dev Performance Guide', url: 'https://web.dev/fast/' }
        ]
      },
      {
        title: 'Fix Missing Meta Descriptions',
        description: 'Add unique, compelling meta descriptions to improve click-through rates from search results',
        category: 'technical',
        impact: 4,
        steps: [
          'Create unique meta descriptions for all blog category pages',
          'Keep descriptions between 120-160 characters',
          'Include relevant keywords naturally in the description',
          'Make descriptions action-oriented and compelling'
        ],
        resources: [
          { title: 'Meta Description Best Practices', url: 'https://moz.com/learn/seo/meta-description' }
        ]
      },
      {
        title: 'Implement Proper Image Optimization',
        description: 'Enhance accessibility and SEO with proper image attributes and optimization',
        category: 'content',
        impact: 3,
        steps: [
          'Add descriptive alt text to all images in the product section',
          'Compress images to reduce file size without losing quality',
          'Use responsive image techniques (srcset, sizes)',
          'Convert appropriate images to next-gen formats (WebP)'
        ],
        resources: [
          { title: 'Image SEO Guide', url: 'https://yoast.com/image-seo/' },
          { title: 'Web Accessibility Initiative - Images', url: 'https://www.w3.org/WAI/tutorials/images/' }
        ]
      }
    ]
  };
};

export default {
  fetchReportData,
  generateReport,
  getReportsList,
  deleteReport,
  scheduleReport
};
