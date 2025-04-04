import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UserAddIcon, 
  DocumentReportIcon, 
  CogIcon, 
  AdjustmentsIcon,
  TagIcon,
  CurrencyDollarIcon
} from '@heroicons/react/outline';

/**
 * AgencyActionPanel component provides quick action buttons for
 * common agency-level tasks such as adding clients, generating reports,
 * and managing settings.
 */
const AgencyActionPanel = () => {
  const actions = [
    {
      name: 'Add Client',
      description: 'Add a new client to your agency',
      icon: UserAddIcon,
      to: '/agency/clients/new',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'Bulk Report',
      description: 'Generate reports for multiple clients',
      icon: DocumentReportIcon,
      to: '/agency/reports/bulk',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      name: 'White Label',
      description: 'Customize branding and appearance',
      icon: TagIcon,
      to: '/agency/settings/white-label',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      name: 'Agency Settings',
      description: 'Manage your agency settings',
      icon: CogIcon,
      to: '/agency/settings',
      color: 'bg-gray-500 hover:bg-gray-600'
    },
    {
      name: 'User Permissions',
      description: 'Configure user roles and access',
      icon: AdjustmentsIcon,
      to: '/agency/settings/permissions',
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      name: 'Billing',
      description: 'Manage billing and subscriptions',
      icon: CurrencyDollarIcon,
      to: '/agency/billing',
      color: 'bg-red-500 hover:bg-red-600'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => (
            <Link
              key={action.name}
              to={action.to}
              className={`${action.color} text-white rounded-lg p-4 transition duration-150 ease-in-out flex flex-col items-center justify-center text-center h-24 shadow-sm hover:shadow-md`}
            >
              <action.icon className="h-6 w-6 mb-2" aria-hidden="true" />
              <span className="text-sm font-medium">{action.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgencyActionPanel;
