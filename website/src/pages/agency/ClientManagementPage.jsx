import React from 'react';
import ClientList from '../../components/agency/ClientList';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

/**
 * ClientManagementPage serves as the container for the client management
 * It wraps the ClientList component with the DashboardLayout
 */
const ClientManagementPage = () => {
  return (
    <DashboardLayout pageTitle="Client Management" moduleName="agency">
      <ClientList />
    </DashboardLayout>
  );
};

export default ClientManagementPage;
