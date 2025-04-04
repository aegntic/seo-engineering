import React, { useState } from 'react';

const IssuesList = ({ issues = [] }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  
  const filteredIssues = activeFilter === 'all' 
    ? issues 
    : issues.filter(issue => issue.severity === activeFilter);
  
  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Technical SEO Issues</h2>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              activeFilter === 'all'
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Issues
          </button>
          <button
            onClick={() => setActiveFilter('high')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              activeFilter === 'high'
                ? 'bg-red-100 text-red-800'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => setActiveFilter('medium')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              activeFilter === 'medium'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Medium
          </button>
          <button
            onClick={() => setActiveFilter('low')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              activeFilter === 'low'
                ? 'bg-green-100 text-green-800'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Low
          </button>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {filteredIssues.length > 0 ? (
          filteredIssues.map((issue) => (
            <div key={issue.id} className="p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {issue.severity === 'high' && (
                    <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  {issue.severity === 'medium' && (
                    <svg className="h-6 w-6 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {issue.severity === 'low' && (
                    <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">{issue.type}</h3>
                    <span className={`${getSeverityBadgeClass(issue.severity)} px-2.5 py-0.5 rounded-full text-xs font-medium`}>
                      {issue.severity}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    <p>{issue.description}</p>
                  </div>
                  <div className="mt-4 flex justify-end space-x-3">
                    <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      Fix Automatically
                    </button>
                    <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500 text-sm">No issues found with this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssuesList;