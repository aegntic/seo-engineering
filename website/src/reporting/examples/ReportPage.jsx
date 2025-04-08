import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DefaultTemplate, useReportData, exportToPDF } from '../index';

/**
 * Example page that demonstrates how to use the reporting system
 */
const ReportPage = () => {
  const { siteId, reportId } = useParams();
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState(null);
  
  // Use the custom hook to fetch report data
  const { 
    report, 
    isLoading, 
    error, 
    refreshReport 
  } = useReportData(siteId, reportId);
  
  // Handle PDF export
  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportResult(null);
      
      const result = await exportToPDF(report, {
        filename: `seo-report-${siteId}-${new Date().toISOString().split('T')[0]}.pdf`
      });
      
      setExportResult({
        success: true,
        message: `Report exported as ${result.filename}`,
        filename: result.filename
      });
    } catch (err) {
      setExportResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to export report'
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  // Display loading state
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="spinner w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading report data...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Display error state
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-red-700 text-xl font-semibold mb-2">Error Loading Report</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refreshReport}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  // Display empty state
  if (!report) {
    return (
      <div className="p-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <h2 className="text-gray-700 text-xl font-semibold mb-2">No Report Available</h2>
          <p className="text-gray-600 mb-4">There is no report data available for this site.</p>
          <button
            onClick={refreshReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">SEO Report</h1>
        
        <div className="flex space-x-4">
          <button
            onClick={refreshReport}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            disabled={isLoading}
          >
            Refresh Report
          </button>
          
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            disabled={isExporting || !report}
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              'Export to PDF'
            )}
          </button>
        </div>
      </div>
      
      {/* Display export result if available */}
      {exportResult && (
        <div className={`mb-6 p-4 rounded-md ${exportResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={exportResult.success ? 'text-green-700' : 'text-red-700'}>
            {exportResult.message}
          </p>
        </div>
      )}
      
      {/* Render the report template */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <DefaultTemplate 
          data={report} 
          branding={{
            logo: '/logo.svg',
            companyName: 'SEO.engineering'
          }}
          showRecommendations={true}
        />
      </div>
    </div>
  );
};

export default ReportPage;
