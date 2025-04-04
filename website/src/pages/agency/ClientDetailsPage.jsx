import React from 'react';
import ClientDetails from '../../components/agency/ClientDetails';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

/**
 * ClientDetailsPage serves as the container for the client details view
 * It wraps the ClientDetails component with the DashboardLayout
 */
const ClientDetailsPage = () => {
  return (
    <DashboardLayout pageTitle="Client Details" moduleName="agency">
      <ClientDetails />
    </DashboardLayout>
  );
};

export default ClientDetailsPage;
