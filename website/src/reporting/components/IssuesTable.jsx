import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Table component to display SEO issues with filtering options
 * @param {Object} props Component props
 * @param {Array} props.issues Array of issue objects
 */
const IssuesTable = ({ issues }) => {
  const [filter, setFilter] = useState('all');
  
  if (!issues || issues.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded text-gray-500">
        No issues found - great job!
      </div>
    );
  }

  // Filters for severity
  const filteredIssues = filter === 'all' 
    ? issues 
    : issues.filter(issue => issue.severity === filter);

  const getSeverityColor = (severity) => {
    switch(severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="issues-table">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''} found
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded ${filter === 'all' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('critical')}
            className={`px-3 py-1 text-sm rounded ${filter === 'critical' ? 'bg-red-200 text-red-800' : 'bg-red-50 text-red-600'}`}
          >
            Critical
          </button>
          <button 
            onClick={() => setFilter('high')}
            className={`px-3 py-1 text-sm rounded ${filter === 'high' ? 'bg-orange-200 text-orange-800' : 'bg-orange-50 text-orange-600'}`}
          >
            High
          </button>
          <button 
            onClick={() => setFilter('medium')}
            className={`px-3 py-1 text-sm rounded ${filter === 'medium' ? 'bg-yellow-200 text-yellow-800' : 'bg-yellow-50 text-yellow-600'}`}
          >
            Medium
          </button>
          <button 
            onClick={() => setFilter('low')}
            className={`px-3 py-1 text-sm rounded ${filter === 'low' ? 'bg-blue-200 text-blue-800' : 'bg-blue-50 text-blue-600'}`}
          >
            Low
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3 border-b border-gray-200">Issue</th>
              <th className="px-6 py-3 border-b border-gray-200">Location</th>
              <th className="px-6 py-3 border-b border-gray-200">Severity</th>
              <th className="px-6 py-3 border-b border-gray-200">Impact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredIssues.map((issue, index) => (
              <tr key={`issue-${index}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{issue.title}</div>
                  <div className="text-sm text-gray-500">{issue.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{issue.location}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(issue.severity)}`}>
                    {issue.severity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {issue.impact}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

IssuesTable.propTypes = {
  issues: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
      severity: PropTypes.string.isRequired,
      impact: PropTypes.string.isRequired
    })
  ).isRequired
};

export default IssuesTable;
