import React from 'react';

const ScoreCard = ({ score }) => {
  // Function to determine the score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Function to determine the score text
  const getScoreText = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };
  
  // Calculation for the circle circumference and stroke dasharray
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">SEO Score</h2>
      </div>
      <div className="p-6 flex flex-col items-center">
        <div className="relative inline-flex justify-center items-center w-48 h-48 mb-4">
          {/* Background circle */}
          <svg className="absolute" width="160" height="160" viewBox="0 0 160 160">
            <circle 
              cx="80" 
              cy="80" 
              r={radius} 
              fill="none" 
              stroke="#e5e7eb" 
              strokeWidth="12"
            />
          </svg>
          
          {/* Progress circle */}
          <svg className="absolute" width="160" height="160" viewBox="0 0 160 160">
            <circle 
              cx="80" 
              cy="80" 
              r={radius} 
              fill="none" 
              stroke={score >= 80 ? '#10B981' : score >= 60 ? '#FBBF24' : '#EF4444'} 
              strokeWidth="12"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 80 80)"
            />
          </svg>
          
          {/* Score display */}
          <div className="text-center">
            <span className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</span>
            <span className="block text-sm text-gray-500">{getScoreText(score)}</span>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 text-center mb-6">
          <p>Your site is performing better than {Math.round(score)}% of websites in our database.</p>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div 
            className={`h-2.5 rounded-full ${
              score >= 80 ? 'bg-green-600' : score >= 60 ? 'bg-yellow-500' : 'bg-red-600'
            }`} 
            style={{ width: `${score}%` }}
          ></div>
        </div>
        
        <div className="grid grid-cols-3 w-full text-xs text-gray-500">
          <div className="text-left">Poor</div>
          <div className="text-center">Good</div>
          <div className="text-right">Excellent</div>
        </div>
      </div>
    </div>
  );
};

export default ScoreCard;