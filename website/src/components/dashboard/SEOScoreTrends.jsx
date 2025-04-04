import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart
} from 'recharts';

const SEOScoreTrends = ({ data = null }) => {
  const [dateRange, setDateRange] = useState('30d');
  const [chartType, setChartType] = useState('line');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Sample data if no data is provided
  const generateSampleData = () => {
    const now = new Date();
    const categories = ['Meta Tags', 'Performance', 'Structure', 'Content', 'Links'];
    
    let sampleData = [];
    
    // Generate data for last 90 days
    for (let i = 90; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Base score starts at 65 and improves over time with some fluctuation
      const baseScore = Math.min(95, 65 + ((90 - i) * 0.3) + (Math.random() * 4 - 2));
      
      const dataPoint = {
        date: date.toISOString().split('T')[0],
        totalScore: Math.round(baseScore),
      };
      
      // Generate scores for each category
      categories.forEach(category => {
        // Different categories have different improvement rates
        const categoryMultiplier = {
          'Meta Tags': 1.2,
          'Performance': 0.8,
          'Structure': 1.0,
          'Content': 0.9,
          'Links': 1.1,
        }[category];
        
        const categoryScore = Math.min(
          100, 
          60 + ((90 - i) * 0.3 * categoryMultiplier) + (Math.random() * 5 - 2.5)
        );
        
        dataPoint[category] = Math.round(categoryScore);
      });
      
      sampleData.push(dataPoint);
    }
    
    // Add some improvements at certain points
    // Meta tag improvements at day 60
    for (let i = 60; i >= 0; i--) {
      sampleData[90 - i]['Meta Tags'] += 8;
      sampleData[90 - i]['Meta Tags'] = Math.min(sampleData[90 - i]['Meta Tags'], 100);
      sampleData[90 - i].totalScore = Math.round(
        (sampleData[90 - i]['Meta Tags'] + 
         sampleData[90 - i].Performance + 
         sampleData[90 - i].Structure + 
         sampleData[90 - i].Content + 
         sampleData[90 - i].Links) / 5
      );
    }
    
    // Performance improvements at day 30
    for (let i = 30; i >= 0; i--) {
      sampleData[90 - i].Performance += 12;
      sampleData[90 - i].Performance = Math.min(sampleData[90 - i].Performance, 100);
      sampleData[90 - i].totalScore = Math.round(
        (sampleData[90 - i]['Meta Tags'] + 
         sampleData[90 - i].Performance + 
         sampleData[90 - i].Structure + 
         sampleData[90 - i].Content + 
         sampleData[90 - i].Links) / 5
      );
    }
    
    return sampleData;
  };

  const allData = data || generateSampleData();
  
  // Filter data based on selected date range
  const getFilteredData = () => {
    if (dateRange === 'all') {
      return allData;
    }
    
    const days = parseInt(dateRange.replace('d', ''));
    return allData.slice(allData.length - days - 1);
  };
  
  const filteredData = getFilteredData();
  
  // Get categories for the chart
  const getCategories = () => {
    if (categoryFilter === 'all') {
      return ['totalScore', 'Meta Tags', 'Performance', 'Structure', 'Content', 'Links'];
    } else {
      return ['totalScore', categoryFilter];
    }
  };
  
  const categories = getCategories();
  
  // Get color for each category
  const getCategoryColor = (category) => {
    const colors = {
      'totalScore': '#4F46E5',  // Indigo
      'Meta Tags': '#10B981',   // Green
      'Performance': '#F59E0B',  // Amber
      'Structure': '#6366F1',   // Indigo
      'Content': '#EC4899',     // Pink
      'Links': '#8B5CF6',       // Purple
    };
    
    return colors[category] || '#6B7280';  // Gray default
  };
  
  // Render appropriate chart based on selected chart type
  const renderChart = () => {
    switch (chartType) {
      case 'area':
        return (
          <AreaChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            {categories.map(category => (
              <Area 
                key={category}
                type="monotone" 
                dataKey={category} 
                fill={getCategoryColor(category)} 
                stroke={getCategoryColor(category)}
                fillOpacity={0.3}
              />
            ))}
          </AreaChart>
        );
        
      case 'bar':
        return (
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            {categories.map(category => (
              <Bar 
                key={category}
                dataKey={category} 
                fill={getCategoryColor(category)}
              />
            ))}
          </BarChart>
        );
        
      case 'composed':
        return (
          <ComposedChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="totalScore" 
              stroke="#4F46E5" 
              strokeWidth={2}
            />
            {categories.filter(c => c !== 'totalScore').map(category => (
              <Bar 
                key={category}
                dataKey={category} 
                fill={getCategoryColor(category)}
              />
            ))}
          </ComposedChart>
        );
        
      case 'line':
      default:
        return (
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            {categories.map(category => (
              <Line 
                key={category}
                type="monotone" 
                dataKey={category} 
                stroke={getCategoryColor(category)}
                strokeWidth={category === 'totalScore' ? 2 : 1}
                dot={category === 'totalScore'}
              />
            ))}
          </LineChart>
        );
    }
  };
  
  // Calculate improvement data
  const calculateImprovements = () => {
    const startScore = filteredData[0].totalScore;
    const endScore = filteredData[filteredData.length - 1].totalScore;
    const improvement = endScore - startScore;
    const percentImprovement = ((endScore - startScore) / startScore * 100).toFixed(1);
    
    const categoryImprovements = {};
    categories.forEach(category => {
      if (category !== 'totalScore') {
        const categoryStartScore = filteredData[0][category];
        const categoryEndScore = filteredData[filteredData.length - 1][category];
        const categoryImprovement = categoryEndScore - categoryStartScore;
        categoryImprovements[category] = {
          points: categoryImprovement,
          percent: ((categoryImprovement / categoryStartScore) * 100).toFixed(1),
        };
      }
    });
    
    return {
      overall: {
        points: improvement,
        percent: percentImprovement,
      },
      categories: categoryImprovements
    };
  };
  
  const improvements = calculateImprovements();

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">SEO Score Trends</h2>
      </div>
      <div className="p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              id="dateRange"
              name="dateRange"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="14d">Last 14 days</option>
              <option value="30d">Last 30 days</option>
              <option value="60d">Last 60 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="chartType" className="block text-sm font-medium text-gray-700 mb-1">
              Chart Type
            </label>
            <select
              id="chartType"
              name="chartType"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="composed">Composed Chart</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Categories
            </label>
            <select
              id="categoryFilter"
              name="categoryFilter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">All Categories</option>
              <option value="Meta Tags">Meta Tags</option>
              <option value="Performance">Performance</option>
              <option value="Structure">Structure</option>
              <option value="Content">Content</option>
              <option value="Links">Links</option>
            </select>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-md font-medium text-gray-800 mb-2">Improvement Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded p-3 bg-white">
              <p className="text-sm text-gray-600">Overall Improvement</p>
              <p className="text-2xl font-bold text-indigo-600">+{improvements.overall.points} points</p>
              <p className="text-sm text-gray-600">+{improvements.overall.percent}% from baseline</p>
            </div>
            
            <div className="border border-gray-200 rounded p-3 bg-white">
              <p className="text-sm text-gray-600">Top Improvement</p>
              {Object.entries(improvements.categories)
                .sort((a, b) => b[1].points - a[1].points)
                .slice(0, 1)
                .map(([category, data]) => (
                  <div key={category}>
                    <p className="text-lg font-semibold">{category}</p>
                    <p className="text-2xl font-bold text-green-600">+{data.points} points</p>
                    <p className="text-sm text-gray-600">+{data.percent}% improvement</p>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOScoreTrends;