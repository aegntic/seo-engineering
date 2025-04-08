import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PricingPage from './pages/PricingPage';
import NotFoundPage from './pages/NotFoundPage';
import Layout from './components/Layout';
import { ThemeProvider } from './contexts/ThemeContext';
import { 
  DashboardPage, 
  OverviewPage, 
  SiteDetailsPage, 
  AnalyticsPage,
  ContentOptimizationPage
} from './pages/dashboard';
import PaymentSettingsPage from './pages/dashboard/PaymentSettingsPage';
import {
  AgencyDashboardPage,
  ClientDetailsPage,
  ClientManagementPage,
  AgencySettingsPage,
  WhiteLabelSettingsPage,
  UserPermissionsPage
} from './pages/agency';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        
        {/* Dashboard routes */}
        <Route path="/dashboard" element={<DashboardPage />}>
          <Route index element={<OverviewPage />} />
          <Route path="sites/:siteId" element={<SiteDetailsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="content-optimization" element={<ContentOptimizationPage />} />
          {/* These would be implemented next */}
          <Route path="sites" element={<div>Sites List Page (Coming Soon)</div>} />
          <Route path="reports" element={<div>Reports Page (Coming Soon)</div>} />
          <Route path="settings" element={<PaymentSettingsPage />} />
        </Route>
        
        {/* Agency routes */}
        <Route path="/agency" element={<AgencyDashboardPage />}>
          <Route index element={<AgencyDashboardPage />} />
          <Route path="dashboard" element={<AgencyDashboardPage />} />
          <Route path="clients" element={<ClientManagementPage />} />
          <Route path="clients/:clientId" element={<ClientDetailsPage />} />
          <Route path="settings" element={<AgencySettingsPage />} />
          <Route path="settings/white-label" element={<WhiteLabelSettingsPage />} />
          <Route path="settings/permissions" element={<UserPermissionsPage />} />
          {/* Placeholder routes for future implementation */}
          <Route path="settings/domain" element={<div>Custom Domain Settings (Coming Soon)</div>} />
          <Route path="settings/billing" element={<div>Billing Settings (Coming Soon)</div>} />
          <Route path="settings/notifications" element={<div>Notification Settings (Coming Soon)</div>} />
          <Route path="settings/reports" element={<div>Report Templates (Coming Soon)</div>} />
          <Route path="settings/profile" element={<div>Agency Profile (Coming Soon)</div>} />
          <Route path="reports/bulk" element={<div>Bulk Reporting (Coming Soon)</div>} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;