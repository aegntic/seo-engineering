import React, { useState } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import InternalLinkingVisualization from '../../components/dashboard/InternalLinkingVisualization';
import ContentDuplicationMap from '../../components/dashboard/ContentDuplicationMap';
import SEOScoreTrends from '../../components/dashboard/SEOScoreTrends';
import FilterSystem from '../../components/dashboard/FilterSystem';

const AnalyticsPage = () => {
  const [activeFilters, setActiveFilters] = useState({});
  
  // Define filter options for the advanced filter system
  const filterOptions = [
    {
      id: 'dateRange',
      label: 'Date Range',
      type: 'select',
      options: [
        { value: '7d', label: 'Last 7 Days' },
        { value: '30d', label: 'Last 30 Days' },
        { value: '90d', label: 'Last 90 Days' },
        { value: 'custom', label: 'Custom Range' }
      ],
      defaultValue: '30d'
    },
    {
      id: 'category',
      label: 'Category',
      type: 'checkbox',
      options: [
        { value: 'meta', label: 'Meta Tags' },
        { value: 'performance', label: 'Performance' },
        { value: 'structure', label: 'Structure' },
        { value: 'content', label: 'Content' },
        { value: 'links', label: 'Links' }
      ]
    },
    {
      id: 'impact',
      label: 'Impact',
      type: 'radio',
      options: [
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' }
      ]
    },
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'improved', label: 'Improved' },
        { value: 'declined', label: 'Declined' },
        { value: 'unchanged', label: 'Unchanged' }
      ]
    },
    {
      id: 'score',
      label: 'SEO Score',
      type: 'range',
      min: 0,
      max: 100
    }
  ];
  
  // Sample filter presets
  const filterPresets = [
    {
      id: 'preset-1',
      name: 'Critical Issues',
      filters: {
        impact: 'high',
        status: 'declined'
      },
      search: ''
    },
    {
      id: 'preset-2',
      name: 'Recent Improvements',
      filters: {
        dateRange: '7d',
        status: 'improved'
      },
      search: ''
    }
  ];
  
  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
    // In a real implementation, this would trigger API calls or filter the data
    console.log('Filters changed:', newFilters);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">SEO Analytics</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive visualization of your website's SEO performance and opportunities.
          </p>
        </div>
        
        <div className="mb-6">
          <FilterSystem 
            filters={filterOptions} 
            onFilterChange={handleFilterChange}
            presets={filterPresets}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <SEOScoreTrends />
          </div>
          <div>
            <InternalLinkingVisualization />
          </div>
        </div>
        
        <div className="mb-6">
          <ContentDuplicationMap />
        </div>
        
        <div className="p-6 bg-white shadow rounded-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Analytics Insights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
              <h3 className="text-sm font-medium text-gray-700 mb-1">Top Improvement</h3>
              <p className="text-2xl font-bold text-green-600">+12 points</p>
              <p className="text-sm text-gray-600">Performance optimization</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 bg-red-50">
              <h3 className="text-sm font-medium text-gray-700 mb-1">Top Concern</h3>
              <p className="text-2xl font-bold text-red-600">-5 points</p>
              <p className="text-sm text-gray-600">Content duplication</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
              <h3 className="text-sm font-medium text-gray-700 mb-1">Overall Trend</h3>
              <p className="text-2xl font-bold text-blue-600">+15%</p>
              <p className="text-sm text-gray-600">Last 30 days improvement</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-md font-medium text-gray-800 mb-2">Key Insights</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Internal linking improvements have increased crawler efficiency by 30%</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Meta tag optimization has improved click-through rates by 15%</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Content duplication between product pages may be limiting ranking potential</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Mobile performance scores need urgent attention, affecting 40% of traffic</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;