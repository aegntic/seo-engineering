import React from 'react';
import UserPermissionsManager from '../../components/agency/UserPermissionsManager';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

/**
 * UserPermissionsPage serves as the container for the user permissions management
 * It wraps the UserPermissionsManager component with the DashboardLayout
 */
const UserPermissionsPage = () => {
  return (
    <DashboardLayout pageTitle="User Permissions" moduleName="agency">
      <UserPermissionsManager />
    </DashboardLayout>
  );
};

export default UserPermissionsPage;
