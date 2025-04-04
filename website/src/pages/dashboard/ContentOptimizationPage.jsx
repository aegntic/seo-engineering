import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import ContentOptimizationPanel from '../../components/dashboard/ContentOptimizationPanel';
import FilterSystem from '../../components/dashboard/FilterSystem';

/**
 * ContentOptimizationPage.jsx
 * 
 * Dedicated page for advanced content optimization analysis.
 * Provides comprehensive interface for analyzing and optimizing website content.
 */
const ContentOptimizationPage = () => {
  const [selectedSiteId, setSelectedSiteId] = useState(null);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [sites, setSites] = useState([]);
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter configuration for content analysis
  const filterOptions = [
    {
      id: 'contentType',
      label: 'Content Type',
      type: 'select',
      options: [
        { value: 'all', label: 'All Content' },
        { value: 'blog', label: 'Blog Posts' },
        { value: 'product', label: 'Product Pages' },
        { value: 'service', label: 'Service Pages' },
        { value: 'landing', label: 'Landing Pages' }
      ]
    },
    {
      id: 'contentScore',
      label: 'Content Score',
      type: 'range',
      min: 0,
      max: 100
    },
    {
      id: 'lastUpdated',
      label: 'Last Updated',
      type: 'select',
      options: [
        { value: 'all', label: 'Any Time' },
        { value: '7d', label: 'Last 7 Days' },
        { value: '30d', label: 'Last 30 Days' },
        { value: '90d', label: 'Last 90 Days' }
      ]
    },
    {
      id: 'optimizationStatus',
      label: 'Optimization Status',
      type: 'select',
      options: [
        { value: 'all', label: 'All Statuses' },
        { value: 'notOptimized', label: 'Not Optimized' },
        { value: 'inProgress', label: 'Optimization In Progress' },
        { value: 'optimized', label: 'Fully Optimized' }
      ]
    }
  ];
  
  // Load sites on component mount
  useEffect(() => {
    const fetchSites = async () => {
      // In a real implementation, this would be an API call
      // const response = await fetch('/api/sites');
      // const data = await response.json();
      
      // For demonstration, use mock data
      const mockSites = [
        { id: 1, name: 'Example.com', url: 'https://example.com' },
        { id: 2, name: 'Demo Site', url: 'https://demo-site.com' }
      ];
      
      setSites(mockSites);
      setSelectedSiteId(mockSites[0].id);
      setLoading(false);
    };
    
    fetchSites();
  }, []);
  
  // Load URLs when site selection changes
  useEffect(() => {
    if (selectedSiteId) {
      const fetchUrls = async () => {
        setLoading(true);
        
        // In a real implementation, this would be an API call
        // const response = await fetch(`/api/sites/${selectedSiteId}/urls`);
        // const data = await response.json();
        
        // For demonstration, use mock data
        const mockUrls = [
          { id: 1, url: 'https://example.com', title: 'Homepage', type: 'landing' },
          { id: 2, url: 'https://example.com/about', title: 'About Us', type: 'landing' },
          { id: 3, url: 'https://example.com/products', title: 'Products', type: 'landing' },
          { id: 4, url: 'https://example.com/blog/post-1', title: 'Blog Post 1', type: 'blog' },
          { id: 5, url: 'https://example.com/blog/post-2', title: 'Blog Post 2', type: 'blog' },
          { id: 6, url: 'https://example.com/products/product-1', title: 'Product 1', type: 'product' },
          { id: 7, url: 'https://example.com/products/product-2', title: 'Product 2', type: 'product' },
          { id: 8, url: 'https://example.com/services', title: 'Services', type: 'service' }
        ];
        
        setUrls(mockUrls);
        setSelectedUrl(mockUrls[0].url);
        setLoading(false);
      };
      
      fetchUrls();
    }
  }, [selectedSiteId]);
  
  // Handle site selection change
  const handleSiteChange = (e) => {
    setSelectedSiteId(parseInt(e.target.value));
  };
  
  // Handle URL selection change
  const handleUrlChange = (e) => {
    setSelectedUrl(e.target.value);
  };
  
  // Handle filter changes
  const handleFilterChange = (filterData) => {
    console.log('Filters changed:', filterData);
    // In a real implementation, this would update the URL list
  };
  
  // Handle batch optimization
  const handleBatchOptimize = () => {
    alert('Batch optimization would be triggered here');
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Content Optimization</h1>
          <p className="text-gray-600 mt-1">
            Analyze and optimize your website content for better engagement and SEO performance.
          </p>
        </div>
        
        <div className="mb-6">
          <FilterSystem 
            filters={filterOptions} 
            onFilterChange={handleFilterChange}
            showPresets={true}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Content Selection</h2>
              
              <div className="mb-4">
                <label htmlFor="siteSelect" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Website
                </label>
                <select
                  id="siteSelect"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={selectedSiteId || ''}
                  onChange={handleSiteChange}
                  disabled={loading}
                >
                  {sites.map(site => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="urlSelect" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Page to Optimize
                </label>
                <select
                  id="urlSelect"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={selectedUrl}
                  onChange={handleUrlChange}
                  disabled={loading || !selectedSiteId}
                >
                  {urls.map(url => (
                    <option key={url.id} value={url.url}>
                      {url.title} ({url.url.split('/').pop() || 'homepage'})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleBatchOptimize}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Batch Optimize Selected
                </button>
              </div>
              
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Content Optimization Summary</h3>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500">Total Pages:</span>
                    <span className="text-xs font-medium">{urls.length}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500">Optimized:</span>
                    <span className="text-xs font-medium">2 (25%)</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500">In Progress:</span>
                    <span className="text-xs font-medium">1 (12.5%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Not Optimized:</span>
                    <span className="text-xs font-medium">5 (62.5%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            {loading ? (
              <div className="bg-white shadow rounded-lg p-6 flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-600">Loading content data...</span>
              </div>
            ) : (
              <ContentOptimizationPanel 
                siteId={selectedSiteId} 
                contentUrl={selectedUrl} 
              />
            )}
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recently Optimized Content</h2>
          
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Improvement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-blue-600">Blog Post 1</div>
                  <div className="text-xs text-gray-500">/blog/post-1</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    Blog
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <span className="font-medium text-green-600">87</span>
                    <span className="text-gray-500 text-xs"> / 100</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-green-600">+23 points</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  April 1, 2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <a href="#" className="text-indigo-600 hover:text-indigo-900">
                    View
                  </a>
                </td>
              </tr>
              
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-blue-600">Product 2</div>
                  <div className="text-xs text-gray-500">/products/product-2</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Product
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <span className="font-medium text-green-600">92</span>
                    <span className="text-gray-500 text-xs"> / 100</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-green-600">+18 points</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  March 30, 2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <a href="#" className="text-indigo-600 hover:text-indigo-900">
                    View
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ContentOptimizationPage;
