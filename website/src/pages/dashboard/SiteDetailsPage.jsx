import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SiteHeader from '../../components/dashboard/SiteHeader';
import IssuesList from '../../components/dashboard/IssuesList';
import ScoreCard from '../../components/dashboard/ScoreCard';
import ActionHistory from '../../components/dashboard/ActionHistory';
import InternalLinkingVisualization from '../../components/dashboard/InternalLinkingVisualization';
import ContentDuplicationMap from '../../components/dashboard/ContentDuplicationMap';
import SEOScoreTrends from '../../components/dashboard/SEOScoreTrends';
import RecommendationManager from '../../components/dashboard/RecommendationManager';
import ContentOptimizationPanel from '../../components/dashboard/ContentOptimizationPanel';

const SiteDetailsPage = () => {
  const { siteId } = useParams();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // In a real implementation, this would fetch data from your API
  useEffect(() => {
    // Mock data - would be replaced with actual API call
    setTimeout(() => {
      setSite({
        id: parseInt(siteId),
        url: 'https://example.com',
        lastScan: '2025-03-30',
        score: 87,
        issues: [
          { id: 1, type: 'Meta Tags', severity: 'high', description: 'Missing meta description on 3 pages' },
          { id: 2, type: 'Performance', severity: 'medium', description: 'Slow loading time on product pages' },
          { id: 3, type: 'Structure', severity: 'low', description: 'Suboptimal header hierarchy' }
        ],
        history: [
          { id: 1, date: '2025-03-30', action: 'Automated Scan', impact: '+2 points' },
          { id: 2, date: '2025-03-25', action: 'Meta Tags Updated', impact: '+5 points' }
        ]
      });
      setLoading(false);
    }, 500);
  }, [siteId]);
  
  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading site details...</div>;
  }
  
  // Define active tab state
  const [activeTab, setActiveTab] = useState('overview');
  
  // Tab navigation
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'content', label: 'Content Optimization' },
    { id: 'recommendations', label: 'Recommendations' }
  ];
  
  return (
    <div className="container mx-auto px-4 py-6">
      <SiteHeader site={site} />
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <IssuesList issues={site.issues} />
            </div>
            <div>
              <ScoreCard score={site.score} />
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Action History</h2>
            <ActionHistory history={site.history} />
          </div>
        </>
      )}
      
      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div>
              <SEOScoreTrends />
            </div>
            <div>
              <InternalLinkingVisualization />
            </div>
          </div>
          
          <div className="mb-8">
            <ContentDuplicationMap />
          </div>
        </>
      )}
      
      {/* Content Optimization Tab */}
      {activeTab === 'content' && (
        <div className="mb-8">
          <ContentOptimizationPanel siteId={site.id} contentUrl={site.url} />
        </div>
      )}
      
      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="mb-8">
          <RecommendationManager />
        </div>
      )}
    </div>
  );
};

export default SiteDetailsPage;