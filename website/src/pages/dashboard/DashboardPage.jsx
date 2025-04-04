import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const DashboardPage = () => {
  // This would be fetched from your API in a real implementation
  const [userData, setUserData] = useState({
    name: 'Test User',
    email: 'test@example.com',
    sites: [
      { id: 1, url: 'https://example.com', lastScan: '2025-03-30', score: 87 },
      { id: 2, url: 'https://demo-site.com', lastScan: '2025-03-29', score: 62 }
    ]
  });

  return (
    <DashboardLayout userData={userData}>
      <Outlet />
    </DashboardLayout>
  );
};

export default DashboardPage;