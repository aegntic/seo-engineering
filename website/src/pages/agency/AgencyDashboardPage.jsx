import React from 'react';
import AgencyDashboard from '../../components/agency/AgencyDashboard';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

/**
 * AgencyDashboardPage serves as the container for the agency dashboard
 * It wraps the AgencyDashboard component with the DashboardLayout
 */
const AgencyDashboardPage = () => {
  return (
    <DashboardLayout pageTitle="Agency Dashboard" moduleName="agency">
      <AgencyDashboard />
    </DashboardLayout>
  );
};

export default AgencyDashboardPage;
