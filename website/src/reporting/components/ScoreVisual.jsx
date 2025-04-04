import React from 'react';
import PropTypes from 'prop-types';

/**
 * Visual representation of the SEO score as a circular progress indicator
 * @param {Object} props Component props
 * @param {number} props.score SEO score (0-100)
 */
const ScoreVisual = ({ score }) => {
  // Normalize score to ensure it's between 0-100
  const normalizedScore = Math.min(Math.max(parseInt(score) || 0, 0), 100);
  
  // Calculate color based on score
  const getScoreColor = () => {
    if (normalizedScore >= 90) return '#10B981'; // Green
    if (normalizedScore >= 70) return '#34D399'; // Light green
    if (normalizedScore >= 50) return '#FBBF24'; // Yellow
    if (normalizedScore >= 30) return '#F59E0B'; // Orange
    return '#EF4444'; // Red
  };
  
  // Calculate the circle's circumference and offset
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedScore / 100) * circumference;
  
  // Get score rating
  const getScoreRating = () => {
    if (normalizedScore >= 90) return 'Excellent';
    if (normalizedScore >= 70) return 'Good';
    if (normalizedScore >= 50) return 'Average';
    if (normalizedScore >= 30) return 'Poor';
    return 'Critical';
  };

  return (
    <div className="score-visual flex flex-col items-center justify-center p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">SEO Score</h2>
      
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Background circle */}
        <svg className="w-full h-full" viewBox="0 0 140 140">
          <circle
            className="text-gray-200"
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="70"
            cy="70"
          />
          
          {/* Progress circle */}
          <circle
            className="text-blue-500"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke={getScoreColor()}
            fill="transparent"
            r={radius}
            cx="70"
            cy="70"
            transform="rotate(-90 70 70)"
          />
        </svg>
        
        {/* Score number */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-bold">{normalizedScore}</span>
          <span className="text-sm text-gray-500">/100</span>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <div className="text-lg font-semibold" style={{ color: getScoreColor() }}>
          {getScoreRating()}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {normalizedScore >= 70 
            ? 'Your site is performing well!' 
            : normalizedScore >= 50 
              ? 'Your site needs some improvements' 
              : 'Your site needs significant work'}
        </p>
      </div>
    </div>
  );
};

ScoreVisual.propTypes = {
  score: PropTypes.number.isRequired
};

export default ScoreVisual;
