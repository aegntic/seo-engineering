import React from 'react';
import WhiteLabelSettings from '../../components/agency/WhiteLabelSettings';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

/**
 * WhiteLabelSettingsPage serves as the container for the white label settings
 * It wraps the WhiteLabelSettings component with the DashboardLayout
 */
const WhiteLabelSettingsPage = () => {
  return (
    <DashboardLayout pageTitle="White Label Settings" moduleName="agency">
      <WhiteLabelSettings />
    </DashboardLayout>
  );
};

export default WhiteLabelSettingsPage;
