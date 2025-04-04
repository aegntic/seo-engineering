import React from 'react';
import { Link } from 'react-router-dom';

const SiteHeader = ({ site }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/dashboard" className="text-indigo-600 text-sm hover:text-indigo-900 mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{site.url}</h1>
          <p className="text-sm text-gray-500 mt-1">Last scan: {site.lastScan}</p>
        </div>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Run New Scan
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteHeader;