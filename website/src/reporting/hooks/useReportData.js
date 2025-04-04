import { useState, useEffect } from 'react';
import { fetchReportData } from '../api/reportService';

/**
 * Custom hook for fetching and managing report data
 * @param {string} siteId ID of the site to get report for
 * @param {string} reportId Optional specific report ID
 * @param {Object} options Additional options
 * @param {boolean} options.autoFetch Whether to fetch automatically on mount
 * @returns {Object} Report data and loading state
 */
const useReportData = (siteId, reportId = null, options = {}) => {
  const { autoFetch = true } = options;
  
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  /**
   * Fetch report data from the API
   * @param {Object} params Additional parameters
   * @returns {Promise} Promise that resolves with the report data
   */
  const loadReportData = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await fetchReportData(siteId, reportId, params);
      setReport(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report data');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Refresh the report data
   * @returns {Promise} Promise that resolves with the report data
   */
  const refreshReport = () => loadReportData();
  
  /**
   * Export the report data to PDF
   * @param {Object} options PDF export options
   * @returns {Promise} Promise that resolves when PDF is generated
   */
  const exportToPDF = async (options = {}) => {
    try {
      if (!report) {
        throw new Error('No report data available to export');
      }
      
      // In a real implementation, we would use the pdfExport.js utilities
      // This is a placeholder that would be integrated with the actual export functionality
      console.log('Exporting report to PDF with options:', options);
      
      return {
        success: true,
        filename: options.filename || `seo-report-${siteId}.pdf`,
        message: 'Report exported successfully'
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export report');
      throw err;
    }
  };
  
  // Initial fetch if autoFetch is enabled
  useEffect(() => {
    if (autoFetch && siteId) {
      loadReportData();
    }
  }, [siteId, reportId, autoFetch]);
  
  return {
    report,
    isLoading,
    error,
    loadReportData,
    refreshReport,
    exportToPDF
  };
};

export default useReportData;
