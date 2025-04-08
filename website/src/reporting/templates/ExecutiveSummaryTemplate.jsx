import React from 'react';
import PropTypes from 'prop-types';
import ReportHeader from '../components/ReportHeader';
import ScoreVisual from '../components/ScoreVisual';
import MetricsSection from '../components/MetricsSection';

/**
 * Executive summary report template with concise information for stakeholders
 * @param {Object} props Component props
 * @param {Object} props.data The report data object
 * @param {Object} props.branding Branding information
 */
const ExecutiveSummaryTemplate = ({ 
  data, 
  branding = { 
    logo: '/logo.svg', 
    companyName: 'SEO.engineering' 
  }
}) => {
  if (!data) {
    return <div className="p-4 text-red-500">No report data available</div>;
  }

  const { siteUrl, scanDate, score, metrics, issues } = data;
  
  // Get severity counts
  const severityCounts = {
    critical: issues?.filter(i => i.severity === 'critical').length || 0,
    high: issues?.filter(i => i.severity === 'high').length || 0,
    medium: issues?.filter(i => i.severity === 'medium').length || 0,
    low: issues?.filter(i => i.severity === 'low').length || 0
  };
  
  // Get performance trend description
  const getPerformanceTrend = () => {
    const performanceMetrics = metrics?.filter(m => 
      m.name.toLowerCase().includes('speed') || 
      m.name.toLowerCase().includes('performance')
    ) || [];
    
    const positiveChanges = performanceMetrics.filter(m => m.change > 0).length;
    const negativeChanges = performanceMetrics.filter(m => m.change < 0).length;
    
    if (positiveChanges > negativeChanges) {
      return 'improving';
    } else if (negativeChanges > positiveChanges) {
      return 'declining';
    } else {
      return 'stable';
    }
  };

  return (
    <div className="report-container max-w-4xl mx-auto p-6 bg-white shadow-lg">
      <ReportHeader 
        siteUrl={siteUrl} 
        scanDate={scanDate} 
        logo={branding.logo} 
        companyName={branding.companyName} 
      />
      
      <div className="executive-summary p-6 bg-gray-50 rounded-lg mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Executive Summary</h2>
        <p className="text-gray-700 mb-3">
          This report provides a high-level overview of the SEO performance for <strong>{siteUrl}</strong>.
          The site currently has a technical SEO score of <strong>{score}/100</strong>, 
          which places it in the <strong>{getScoreCategory(score)}</strong> category.
        </p>
        <p className="text-gray-700 mb-3">
          Our analysis identified <strong>{issues?.length || 0} technical issues</strong> that 
          could be affecting your search engine visibility, including 
          <strong> {severityCounts.critical} critical</strong> and 
          <strong> {severityCounts.high} high-priority</strong> issues.
        </p>
        <p className="text-gray-700">
          Overall site performance is <strong>{getPerformanceTrend()}</strong> compared to the previous period.
          We recommend focusing on addressing the critical issues first to see the most significant improvements.
        </p>
      </div>
      
      <div className="report-summary flex flex-col md:flex-row gap-8 my-8">
        <div className="md:w-1/3">
          <ScoreVisual score={score} />
        </div>
        <div className="md:w-2/3">
          <MetricsSection metrics={metrics?.slice(0, 4) || []} />
        </div>
      </div>
      
      <div className="key-issues mt-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Key Issues to Address</h2>
        
        {issues && issues.length > 0 ? (
          <div className="space-y-4">
            {issues
              .filter(issue => issue.severity === 'critical' || issue.severity === 'high')
              .slice(0, 3)
              .map((issue, index) => (
                <div 
                  key={`key-issue-${index}`}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 w-3 h-3 mt-1.5 rounded-full ${issue.severity === 'critical' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-800">{issue.title}</h3>
                      <p className="text-gray-600 mt-1">{issue.description}</p>
                      <p className="text-sm text-gray-500 mt-2">Impact: {issue.impact}</p>
                    </div>
                  </div>
                </div>
              ))
            }
            
            {issues.filter(issue => issue.severity === 'critical' || issue.severity === 'high').length > 3 && (
              <p className="text-sm text-gray-500 italic">
                Plus {issues.filter(issue => issue.severity === 'critical' || issue.severity === 'high').length - 3} more high-priority issues...
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-600">No critical or high-priority issues detected.</p>
        )}
      </div>
      
      <div className="next-steps mt-10 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recommended Next Steps</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Address the critical issues highlighted in this report.</li>
          <li>Schedule a follow-up scan to verify improvements.</li>
          <li>Review the detailed report for comprehensive recommendations.</li>
        </ol>
      </div>
      
      <div className="report-footer mt-12 pt-6 border-t border-gray-200 text-sm text-gray-500">
        <p className="mb-1">This is an executive summary of your site's SEO performance. For a detailed analysis, please refer to the complete report.</p>
        <p>Generated by {branding.companyName} on {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

// Helper function to categorize score
const getScoreCategory = (score) => {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'average';
  if (score >= 30) return 'poor';
  return 'critical';
};

ExecutiveSummaryTemplate.propTypes = {
  data: PropTypes.shape({
    siteUrl: PropTypes.string.isRequired,
    scanDate: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired,
    metrics: PropTypes.array,
    issues: PropTypes.array
  }).isRequired,
  branding: PropTypes.shape({
    logo: PropTypes.string,
    companyName: PropTypes.string
  })
};

export default ExecutiveSummaryTemplate;
