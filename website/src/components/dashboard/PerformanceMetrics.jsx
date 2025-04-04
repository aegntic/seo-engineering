import React from 'react';

const PerformanceMetrics = ({ sites = [] }) => {
  // This is mock data - in a real implementation this would come from your API
  const metrics = {
    averageScore: 74.5,
    totalIssues: 28,
    criticalIssues: 5,
    fixedIssues: 17,
    percentChange: 12.8
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Performance Metrics</h2>
      </div>
      <div className="p-6">
        <div className="mb-6 text-center">
          <span className="text-3xl font-bold text-indigo-600">{metrics.averageScore}</span>
          <span className="text-sm text-gray-500 ml-2">Average SEO Score</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-md p-3 text-center">
            <span className="block text-xl font-semibold text-gray-800">{metrics.totalIssues}</span>
            <span className="text-sm text-gray-500">Total Issues</span>
          </div>
          
          <div className="border border-gray-200 rounded-md p-3 text-center">
            <span className="block text-xl font-semibold text-red-600">{metrics.criticalIssues}</span>
            <span className="text-sm text-gray-500">Critical Issues</span>
          </div>
          
          <div className="border border-gray-200 rounded-md p-3 text-center">
            <span className="block text-xl font-semibold text-green-600">{metrics.fixedIssues}</span>
            <span className="text-sm text-gray-500">Issues Fixed</span>
          </div>
          
          <div className="border border-gray-200 rounded-md p-3 text-center">
            <span className="block text-xl font-semibold text-indigo-600">
              +{metrics.percentChange}%
            </span>
            <span className="text-sm text-gray-500">Improvement</span>
          </div>
        </div>
        
        <button className="mt-6 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          View Full Analytics
        </button>
      </div>
    </div>
  );
};

export default PerformanceMetrics;