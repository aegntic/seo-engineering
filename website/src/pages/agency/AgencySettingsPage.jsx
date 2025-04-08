import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { CogIcon, UserGroupIcon, SwatchIcon, GlobeAltIcon, CurrencyDollarIcon, BellIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

/**
 * AgencySettingsPage provides a central hub for accessing various agency settings
 * including white label, user permissions, billing, notifications, etc.
 */
const AgencySettingsPage = () => {
  const settingsSections = [
    {
      name: 'White Label',
      description: 'Customize the look and feel of your client dashboard',
      icon: SwatchIcon,
      to: '/agency/settings/white-label',
      iconBg: 'bg-green-500'
    },
    {
      name: 'User Permissions',
      description: 'Manage user access and roles',
      icon: UserGroupIcon,
      to: '/agency/settings/permissions',
      iconBg: 'bg-yellow-500'
    },
    {
      name: 'Custom Domain',
      description: 'Set up your own domain for client access',
      icon: GlobeAltIcon,
      to: '/agency/settings/domain',
      iconBg: 'bg-blue-500'
    },
    {
      name: 'Billing & Subscription',
      description: 'Manage your billing and subscription settings',
      icon: CurrencyDollarIcon,
      to: '/agency/settings/billing',
      iconBg: 'bg-purple-500'
    },
    {
      name: 'Notifications',
      description: 'Configure email and system notifications',
      icon: BellIcon,
      to: '/agency/settings/notifications',
      iconBg: 'bg-red-500'
    },
    {
      name: 'Report Templates',
      description: 'Customize client report templates',
      icon: DocumentDuplicateIcon,
      to: '/agency/settings/reports',
      iconBg: 'bg-indigo-500'
    },
    {
      name: 'Agency Profile',
      description: 'Update your agency information',
      icon: CogIcon,
      to: '/agency/settings/profile',
      iconBg: 'bg-gray-500'
    }
  ];

  return (
    <DashboardLayout pageTitle="Agency Settings" moduleName="agency">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900">Settings & Configuration</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure your agency settings, white labeling, user permissions, and more.
          </p>
          
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {settingsSections.map((section) => (
              <Link
                key={section.name}
                to={section.to}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 ${section.iconBg} rounded-md p-3`}>
                      <section.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">{section.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{section.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgencySettingsPage;
