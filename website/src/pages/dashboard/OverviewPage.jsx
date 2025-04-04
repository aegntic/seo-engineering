import React from 'react';
import SitesOverview from '../../components/dashboard/SitesOverview';
import ActionPanel from '../../components/dashboard/ActionPanel';
import RecentResults from '../../components/dashboard/RecentResults';
import PerformanceMetrics from '../../components/dashboard/PerformanceMetrics';

const OverviewPage = ({ userData }) => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <SitesOverview sites={userData?.sites || []} />
        </div>
        <div>
          <ActionPanel />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentResults sites={userData?.sites || []} />
        <PerformanceMetrics sites={userData?.sites || []} />
      </div>
    </div>
  );
};

export default OverviewPage;