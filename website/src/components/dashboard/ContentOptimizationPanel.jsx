import React, { useState, useEffect } from 'react';

/**
 * Content Optimization Panel Component
 * 
 * Displays content optimization suggestions and metrics.
 * Allows users to analyze content and implement suggestions.
 */
const ContentOptimizationPanel = ({ siteId, contentUrl }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [optimization, setOptimization] = useState(null);
  const [selectedTab, setSelectedTab] = useState('suggestions');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Mock data for demonstration
  const mockOptimizationData = {
    url: contentUrl || 'https://example.com/sample-page',
    timestamp: new Date().toISOString(),
    scores: {
      keyword: 78,
      readability: 65,
      structure: 82,
      overall: 75
    },
    suggestions: [
      {
        id: 'keyword-missing_h1-1',
        category: 'keyword',
        type: 'keyword_title',
        importance: 'high',
        title: 'Include target keyword in page title',
        description: 'Your primary keyword is missing from the page title, which is crucial for SEO.',
        implementation: 'Add your primary keyword to the beginning of your page title while keeping it natural and compelling.',
        color: '#e53e3e',
        icon: 'tag'
      },
      {
        id: 'readability-long_sentences-1',
        category: 'readability',
        type: 'long_sentences',
        importance: 'medium',
        title: 'Shorten or break up long sentences',
        description: '25% of your sentences exceed 25 words, which can reduce readability.',
        implementation: 'Break long sentences into shorter ones for better clarity and readability.',
        color: '#ed8936',
        icon: 'book-open'
      },
      {
        id: 'structure-missing_alt_text-1',
        category: 'structure',
        type: 'missing_alt_text',
        importance: 'high',
        title: 'Add alt text to images',
        description: 'Your images are missing alt text, which is essential for accessibility and SEO.',
        implementation: 'Add descriptive alt text to all images that clearly describes their content and purpose.',
        color: '#e53e3e',
        icon: 'layout'
      },
      {
        id: 'enhancement-introduction-1',
        category: 'enhancement',
        type: 'introduction',
        title: 'Add a compelling introduction',
        importance: 'medium',
        description: 'Your content lacks a clear introduction, which is essential for engaging readers and establishing the topic.',
        implementation: 'Add a 2-3 sentence introduction that hooks readers, states the main topic, and includes your primary keyword.',
        color: '#ed8936',
        icon: 'award'
      },
      {
        id: 'keyword-density-1',
        category: 'keyword',
        type: 'keyword_density',
        importance: 'medium',
        title: 'Increase keyword density',
        description: 'Your keyword density is below the recommended minimum of 0.5%.',
        implementation: 'Naturally incorporate your primary keyword a few more times in your content.',
        color: '#ed8936',
        icon: 'tag'
      },
      {
        id: 'structure-add_lists-1',
        category: 'structure',
        type: 'add_lists',
        importance: 'low',
        title: 'Add lists to structure content',
        description: 'Your content has no lists, which can help break up text and improve scannability.',
        implementation: 'Convert appropriate paragraphs to bullet or numbered lists, especially for steps, features, or benefits.',
        color: '#48bb78',
        icon: 'layout'
      }
    ]
  };
  
  // Fetch optimization data on component mount
  useEffect(() => {
    const fetchOptimizationData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // In a real implementation, this would be an API call
        // const response = await fetch(`/api/content-optimization/analyze?siteId=${siteId}&url=${contentUrl}`);
        // const data = await response.json();
        
        // For demonstration, use mock data
        setTimeout(() => {
          setOptimization(mockOptimizationData);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to fetch optimization data');
        setLoading(false);
      }
    };
    
    fetchOptimizationData();
  }, [siteId, contentUrl]);
  
  // Filter suggestions by category
  const filteredSuggestions = optimization?.suggestions.filter(suggestion => 
    selectedCategory === 'all' || suggestion.category === selectedCategory
  ) || [];
  
  // Handle refresh click
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    
    // In a real implementation, this would fetch fresh data
    setTimeout(() => {
      setOptimization(mockOptimizationData);
      setLoading(false);
    }, 1000);
  };
  
  // Handle implementation click
  const handleImplement = (suggestionId) => {
    // In a real implementation, this would send an API request to implement the suggestion
    alert(`Implementation requested for suggestion: ${suggestionId}`);
  };
  
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Content Optimization</h2>
        </div>
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Analyzing content...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Content Optimization</h2>
          <button 
            onClick={handleRefresh}
            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
          >
            Retry
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }
  
  if (!optimization) {
    return null;
  }
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Content Optimization</h2>
        <button 
          onClick={handleRefresh}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Refresh
        </button>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">Overall Score</span>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-indigo-600">{optimization.scores.overall}</span>
              <span className="text-xs text-gray-500 ml-1">/100</span>
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">Keywords</span>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-green-600">{optimization.scores.keyword}</span>
              <span className="text-xs text-gray-500 ml-1">/100</span>
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">Readability</span>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-yellow-600">{optimization.scores.readability}</span>
              <span className="text-xs text-gray-500 ml-1">/100</span>
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">Structure</span>
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-blue-600">{optimization.scores.structure}</span>
              <span className="text-xs text-gray-500 ml-1">/100</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Tab navigation */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              selectedTab === 'suggestions'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setSelectedTab('suggestions')}
          >
            Suggestions
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              selectedTab === 'insights'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setSelectedTab('insights')}
          >
            Insights
          </button>
        </div>
        
        {/* Suggestions tab */}
        {selectedTab === 'suggestions' && (
          <>
            {/* Category filter */}
            <div className="flex mb-4 space-x-2">
              <button
                className={`px-3 py-1 text-xs rounded-full ${
                  selectedCategory === 'all'
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedCategory('all')}
              >
                All
              </button>
              <button
                className={`px-3 py-1 text-xs rounded-full ${
                  selectedCategory === 'keyword'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedCategory('keyword')}
              >
                Keywords
              </button>
              <button
                className={`px-3 py-1 text-xs rounded-full ${
                  selectedCategory === 'readability'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedCategory('readability')}
              >
                Readability
              </button>
              <button
                className={`px-3 py-1 text-xs rounded-full ${
                  selectedCategory === 'structure'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedCategory('structure')}
              >
                Structure
              </button>
              <button
                className={`px-3 py-1 text-xs rounded-full ${
                  selectedCategory === 'enhancement'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedCategory('enhancement')}
              >
                Enhancements
              </button>
            </div>
            
            {/* Suggestions list */}
            <div className="space-y-4">
              {filteredSuggestions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No suggestions found for the selected category.
                </div>
              ) : (
                filteredSuggestions.map(suggestion => (
                  <div
                    key={suggestion.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex justify-between">
                      <div className="flex items-start">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-1"
                          style={{ backgroundColor: `${suggestion.color}20`, color: suggestion.color }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
                          </svg>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <h3 className="font-medium text-gray-900">{suggestion.title}</h3>
                            <span
                              className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                suggestion.importance === 'high'
                                  ? 'bg-red-100 text-red-800'
                                  : suggestion.importance === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {suggestion.importance}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                          
                          <div className="mt-2 bg-gray-50 p-2 rounded border border-gray-100">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Implementation: </span>
                              {suggestion.implementation}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <button
                          onClick={() => handleImplement(suggestion.id)}
                          className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                        >
                          Implement
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
        
        {/* Insights tab */}
        {selectedTab === 'insights' && (
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Content Overview</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your content has an overall SEO score of <span className="font-medium">{optimization.scores.overall}</span> out of 100.
                The strongest area is <span className="font-medium">structure</span> at {optimization.scores.structure} points, 
                while <span className="font-medium">readability</span> at {optimization.scores.readability} points has the most room for improvement.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="text-sm font-medium text-gray-800 mb-1">Strengths</h4>
                  <ul className="text-sm text-gray-600 space-y-1 pl-5 list-disc">
                    <li>Good structural organization</li>
                    <li>Appropriate keyword usage</li>
                    <li>Proper heading hierarchy</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="text-sm font-medium text-gray-800 mb-1">Improvement Areas</h4>
                  <ul className="text-sm text-gray-600 space-y-1 pl-5 list-disc">
                    <li>Sentence length variety</li>
                    <li>Image alt text implementation</li>
                    <li>Content introduction</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Implementation Impact</h3>
              <p className="text-sm text-gray-600 mb-4">
                Implementing all recommendations could increase your overall SEO score by approximately 
                <span className="font-medium text-green-600"> 15-20 points</span>.
              </p>
              
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full" 
                  style={{ width: `${optimization.scores.overall}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Current: {optimization.scores.overall}</span>
                <span>Potential: {Math.min(100, optimization.scores.overall + 18)}</span>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Recommendation Priority</h3>
              <p className="text-sm text-gray-600 mb-4">
                For the most effective improvements, implement recommendations in this order:
              </p>
              
              <ol className="text-sm text-gray-600 space-y-2 pl-5 list-decimal">
                <li><span className="font-medium">High importance recommendations</span> (red tag) - Address these first for biggest impact</li>
                <li><span className="font-medium">Keyword optimizations</span> - Essential for search visibility</li>
                <li><span className="font-medium">Structure improvements</span> - Critical for user experience and indexing</li>
                <li><span className="font-medium">Readability enhancements</span> - Important for engagement</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentOptimizationPanel;
