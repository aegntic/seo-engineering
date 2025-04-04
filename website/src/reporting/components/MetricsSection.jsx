import React from 'react';
import PropTypes from 'prop-types';

/**
 * Component to display key SEO metrics in a grid layout
 * @param {Object} props Component props
 * @param {Array} props.metrics Array of metric objects
 */
const MetricsSection = ({ metrics }) => {
  if (!metrics || metrics.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded text-gray-500">
        No metrics available for this report
      </div>
    );
  }

  return (
    <div className="metrics-section">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Key Performance Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div 
            key={`metric-${index}`}
            className="bg-gray-50 p-4 rounded-lg border border-gray-100"
          >
            <div className="text-gray-500 text-sm">{metric.name}</div>
            <div className="flex items-end mt-1">
              <div className="text-2xl font-bold mr-2">
                {metric.value}
                {metric.unit && <span className="text-sm font-normal">{metric.unit}</span>}
              </div>
              {metric.change !== undefined && (
                <div className={`text-sm ${metric.change > 0 ? 'text-green-500' : metric.change < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                  {metric.change > 0 ? '↑' : metric.change < 0 ? '↓' : '–'} 
                  {Math.abs(metric.change)}%
                </div>
              )}
            </div>
            {metric.description && (
              <div className="text-xs text-gray-500 mt-1">{metric.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

MetricsSection.propTypes = {
  metrics: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      unit: PropTypes.string,
      change: PropTypes.number,
      description: PropTypes.string
    })
  ).isRequired
};

export default MetricsSection;
