import React from 'react';
import PropTypes from 'prop-types';
import ReportHeader from '../components/ReportHeader';
import MetricsSection from '../components/MetricsSection';
import IssuesTable from '../components/IssuesTable';
import ScoreVisual from '../components/ScoreVisual';
import RecommendationsList from '../components/RecommendationsList';

/**
 * Default report template that serves as the foundation for SEO reports
 * @param {Object} props Component props
 * @param {Object} props.data The report data object
 * @param {string} props.data.siteUrl The URL of the site being analyzed
 * @param {string} props.data.scanDate Date of the scan
 * @param {number} props.data.score Overall SEO score (0-100)
 * @param {Array} props.data.metrics Performance metrics
 * @param {Array} props.data.issues SEO issues found
 * @param {Array} props.data.recommendations Recommended actions
 * @param {Object} props.branding Branding information
 * @param {string} props.branding.logo Logo URL
 * @param {string} props.branding.companyName Company name
 * @param {boolean} props.showRecommendations Whether to show recommendations section
 */
const DefaultTemplate = ({ 
  data, 
  branding = { 
    logo: '/logo.svg', 
    companyName: 'SEO.engineering' 
  }, 
  showRecommendations = true 
}) => {
  if (!data) {
    return <div className="p-4 text-red-500">No report data available</div>;
  }

  const { siteUrl, scanDate, score, metrics, issues, recommendations } = data;

  return (
    <div className="report-container max-w-6xl mx-auto p-6 bg-white shadow-lg">
      <ReportHeader 
        siteUrl={siteUrl} 
        scanDate={scanDate} 
        logo={branding.logo} 
        companyName={branding.companyName} 
      />
      
      <div className="report-summary flex flex-col md:flex-row gap-6 my-8">
        <div className="md:w-1/3">
          <ScoreVisual score={score} />
        </div>
        <div className="md:w-2/3">
          <MetricsSection metrics={metrics} />
        </div>
      </div>
      
      <div className="report-details mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">SEO Issues</h2>
        <IssuesTable issues={issues} />
      </div>
      
      {showRecommendations && recommendations && recommendations.length > 0 && (
        <div className="report-recommendations mt-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recommendations</h2>
          <RecommendationsList recommendations={recommendations} />
        </div>
      )}
      
      <div className="report-footer mt-12 pt-6 border-t border-gray-200 text-sm text-gray-500">
        <p>Generated by {branding.companyName} on {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

DefaultTemplate.propTypes = {
  data: PropTypes.shape({
    siteUrl: PropTypes.string.isRequired,
    scanDate: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired,
    metrics: PropTypes.array.isRequired,
    issues: PropTypes.array.isRequired,
    recommendations: PropTypes.array
  }).isRequired,
  branding: PropTypes.shape({
    logo: PropTypes.string,
    companyName: PropTypes.string
  }),
  showRecommendations: PropTypes.bool
};

export default DefaultTemplate;
