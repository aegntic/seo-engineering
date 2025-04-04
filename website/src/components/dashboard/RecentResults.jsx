import React from 'react';

const RecentResults = ({ sites = [] }) => {
  // In a real implementation, this would be actual scan results
  const recentScans = [
    { id: 1, siteUrl: 'example.com', date: '2025-03-30', issuesFixed: 12, scoreImprovement: 8 },
    { id: 2, siteUrl: 'demo-site.com', date: '2025-03-29', issuesFixed: 5, scoreImprovement: 3 }
  ];
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Recent Results</h2>
      </div>
      <div className="p-6">
        {recentScans.length > 0 ? (
          <div className="space-y-4">
            {recentScans.map((scan) => (
              <div key={scan.id} className="border border-gray-200 rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">{scan.siteUrl}</h3>
                  <span className="text-xs text-gray-500">{scan.date}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{scan.issuesFixed}</div>
                    <div className="text-xs text-gray-500">Issues Fixed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-indigo-600">+{scan.scoreImprovement}</div>
                    <div className="text-xs text-gray-500">Score Improvement</div>
                  </div>
                </div>
                <button className="mt-3 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm">No recent scans found.</p>
            <p className="text-gray-500 text-sm">Run your first scan to see results here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentResults;