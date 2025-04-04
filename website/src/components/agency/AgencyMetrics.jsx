import React from 'react';
import { ArrowSmUpIcon, ArrowSmDownIcon } from '@heroicons/react/solid';

/**
 * AgencyMetrics component displays performance metrics for the agency
 * including overall SEO score, client satisfaction, revenue growth, 
 * and issue resolution rate.
 */
const AgencyMetrics = ({ performance }) => {
  // Function to determine trend icon and color based on value
  const getTrendData = (value) => {
    if (value > 0) {
      return {
        icon: <ArrowSmUpIcon className="h-5 w-5 text-green-500" aria-hidden="true" />,
        textColor: 'text-green-600'
      };
    } else if (value < 0) {
      return {
        icon: <ArrowSmDownIcon className="h-5 w-5 text-red-500" aria-hidden="true" />,
        textColor: 'text-red-600'
      };
    } else {
      return {
        icon: null,
        textColor: 'text-gray-500'
      };
    }
  };

  const metrics = [
    {
      name: 'Overall SEO Score',
      value: performance.overallScore,
      change: +2.5,
      unit: '',
      description: 'Average SEO score across all clients'
    },
    {
      name: 'Client Satisfaction',
      value: performance.clientSatisfaction,
      change: +1.2,
      unit: '%',
      description: 'Based on client feedback and surveys'
    },
    {
      name: 'Revenue Growth',
      value: performance.revenueGrowth,
      change: +4.3,
      unit: '%',
      description: 'Month-over-month client revenue growth'
    },
    {
      name: 'Issue Resolution',
      value: performance.issueResolution,
      change: -0.8,
      unit: '%',
      description: 'Percentage of issues successfully resolved'
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Agency Performance
        </h3>
        <dl className="grid grid-cols-1 gap-4">
          {metrics.map((metric) => {
            const trendData = getTrendData(metric.change);
            
            return (
              <div key={metric.name} className="bg-gray-50 px-4 py-5 sm:p-6 rounded-md">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {metric.name}
                </dt>
                <dd className="mt-1">
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {metric.value}{metric.unit}
                    </p>
                    <p className={`ml-2 flex items-baseline text-sm font-semibold ${trendData.textColor}`}>
                      {trendData.icon}
                      <span className="sr-only">
                        {metric.change > 0 ? 'Increased' : metric.change < 0 ? 'Decreased' : 'No change'} by
                      </span>
                      {Math.abs(metric.change)}%
                    </p>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">{metric.description}</p>
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
};

export default AgencyMetrics;
