import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component to display recommended actions for improving SEO score
 * @param {Object} props Component props
 * @param {Array} props.recommendations Array of recommendation objects
 */
const RecommendationsList = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded text-gray-500">
        No recommendations available for this report
      </div>
    );
  }

  // Get category badge color
  const getCategoryColor = (category) => {
    switch(category.toLowerCase()) {
      case 'performance':
        return 'bg-purple-100 text-purple-800';
      case 'content':
        return 'bg-green-100 text-green-800';
      case 'technical':
        return 'bg-blue-100 text-blue-800';
      case 'mobile':
        return 'bg-yellow-100 text-yellow-800';
      case 'security':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="recommendations-list">
      <div className="space-y-4">
        {recommendations.map((recommendation, index) => (
          <div 
            key={`recommendation-${index}`}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-gray-800">{recommendation.title}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(recommendation.category)}`}>
                {recommendation.category}
              </span>
            </div>
            
            <p className="text-gray-600 mt-2">{recommendation.description}</p>
            
            {recommendation.steps && recommendation.steps.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Implementation Steps:</h4>
                <ol className="list-decimal list-inside space-y-1 text-gray-600 text-sm">
                  {recommendation.steps.map((step, stepIndex) => (
                    <li key={`step-${index}-${stepIndex}`}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
            
            {recommendation.impact && (
              <div className="mt-4 flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-2">Potential Impact:</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={`impact-${index}-${i}`}
                      className={`w-4 h-4 ${i < recommendation.impact ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            )}
            
            {recommendation.resources && recommendation.resources.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Resources:</h4>
                <div className="text-sm space-y-1">
                  {recommendation.resources.map((resource, resourceIndex) => (
                    <a 
                      key={`resource-${index}-${resourceIndex}`}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline block"
                    >
                      {resource.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

RecommendationsList.propTypes = {
  recommendations: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      impact: PropTypes.number,
      steps: PropTypes.arrayOf(PropTypes.string),
      resources: PropTypes.arrayOf(
        PropTypes.shape({
          title: PropTypes.string.isRequired,
          url: PropTypes.string.isRequired
        })
      )
    })
  ).isRequired
};

export default RecommendationsList;
