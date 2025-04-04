/**
 * SEOAutomate Reporting Module
 * 
 * This module provides components and utilities for generating, displaying,
 * and exporting SEO reports based on scan data.
 */

// Templates
import DefaultTemplate from './templates/DefaultTemplate';

// Components
import ReportHeader from './components/ReportHeader';
import MetricsSection from './components/MetricsSection';
import IssuesTable from './components/IssuesTable';
import ScoreVisual from './components/ScoreVisual';
import RecommendationsList from './components/RecommendationsList';

// Utilities
import createReport from './utils/reportGenerator';
import exportReportToPDF from './utils/pdfExport';

// Hooks
import useReportData from './hooks/useReportData';

// API Services
import reportService from './api/reportService';

/**
 * Generate a complete report from scan results
 * @param {Object} scanResults Raw scan results
 * @param {Object} options Report generation options
 * @returns {Object} Complete report data
 */
const generateReport = (scanResults, options = {}) => {
  return createReport(scanResults, options);
};

/**
 * Export a report to PDF format
 * @param {Object} reportData Report data to export
 * @param {Object} options PDF export options
 * @returns {Promise} Promise that resolves when PDF is generated
 */
const exportToPDF = async (reportData, options = {}) => {
  return exportReportToPDF(reportData, options);
};

/**
 * Get a report for a specific site
 * @param {string} siteId ID of the site
 * @param {string} reportId Optional ID of a specific report
 * @returns {Promise} Promise that resolves with the report data
 */
const getReport = async (siteId, reportId = null) => {
  return reportService.fetchReportData(siteId, reportId);
};

// Export all components and utilities
export {
  // Templates
  DefaultTemplate,
  
  // Components
  ReportHeader,
  MetricsSection,
  IssuesTable,
  ScoreVisual,
  RecommendationsList,
  
  // Utilities
  generateReport,
  exportToPDF,
  
  // Hooks
  useReportData,
  
  // API Methods
  getReport,
  reportService
};

// Default export for the reporting module
export default {
  generateReport,
  exportToPDF,
  getReport,
  reportService,
  Templates: {
    DefaultTemplate
  },
  Components: {
    ReportHeader,
    MetricsSection,
    IssuesTable,
    ScoreVisual,
    RecommendationsList
  }
};
