import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  DocumentTextIcon, 
  ArrowPathIcon, 
  PencilIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';

/**
 * ClientDetails component displays detailed information about a specific client
 * including SEO metrics, issues, and actions available for the client.
 */
const ClientDetails = () => {
  const { clientId } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Simulated data fetching
  useEffect(() => {
    // In production, this would be an API call
    setTimeout(() => {
      setClient({
        id: clientId,
        name: 'TechCorp',
        website: 'techcorp.com',
        status: 'active',
        seoScore: 87,
        issues: [
          { id: 1, type: 'Mobile', description: 'Poor mobile performance', severity: 'high', status: 'open' },
          { id: 2, type: 'Links', description: 'Broken internal links', severity: 'medium', status: 'open' },
          { id: 3, type: 'Content', description: 'Thin content on product pages', severity: 'medium', status: 'open' },
          { id: 4, type: 'Meta', description: 'Duplicate meta descriptions', severity: 'low', status: 'fixed' },
        ],
        performance: {
          desktop: 92,
          mobile: 76,
          pagespeed: 84,
        },
        analytics: {
          organicTraffic: 12500,
          conversion: 3.2,
          bounceRate: 42.5,
          averagePosition: 8.3,
        },
        contact: {
          name: 'John Smith',
          email: 'john@techcorp.com',
          phone: '(555) 123-4567',
        },
        lastScan: '2025-04-07T15:30:00Z',
        plan: 'Enterprise',
        notes: 'Client is focused on improving mobile experience. Previous agency failed to deliver results.',
      });
      setLoading(false);
    }, 1000);
  }, [clientId]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Performance Metrics</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Desktop Score</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{client.performance.desktop}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Mobile Score</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{client.performance.mobile}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">PageSpeed</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{client.performance.pagespeed}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Overall SEO Score</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{client.seoScore}</dd>
                  </div>
                </dl>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Analytics</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Organic Traffic</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{client.analytics.organicTraffic.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Conversion Rate</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{client.analytics.conversion}%</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Bounce Rate</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{client.analytics.bounceRate}%</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Average Position</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{client.analytics.averagePosition}</dd>
                  </div>
                </dl>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow lg:col-span-2">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Issues</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Severity
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {client.issues.map((issue) => (
                        <tr key={issue.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {issue.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {issue.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${issue.severity === 'high' ? 'bg-red-100 text-red-800' : 
                                issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-green-100 text-green-800'}`}>
                              {issue.severity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${issue.status === 'open' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                              {issue.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link to={`/agency/clients/${client.id}/issues/${issue.id}`} className="text-blue-600 hover:text-blue-900">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow lg:col-span-2">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Client Information</h3>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <dt className="text-sm font-medium text-gray-500">Contact Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{client.contact.name}</dd>
                  </div>
                  <div className="sm:col-span-3">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{client.contact.email}</dd>
                  </div>
                  <div className="sm:col-span-3">
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{client.contact.phone}</dd>
                  </div>
                  <div className="sm:col-span-3">
                    <dt className="text-sm font-medium text-gray-500">Plan</dt>
                    <dd className="mt-1 text-sm text-gray-900">{client.plan}</dd>
                  </div>
                  <div className="sm:col-span-6">
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="mt-1 text-sm text-gray-900">{client.notes}</dd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="mt-6 bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Reports</h3>
              <p className="text-gray-500">Generate and view reports for this client.</p>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <DocumentTextIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                  SEO Performance Report
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <DocumentTextIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                  Technical Audit Report
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <DocumentTextIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                  Content Analysis Report
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <DocumentTextIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                  Mobile Optimization Report
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <DocumentTextIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                  Competitive Analysis Report
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <DocumentTextIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                  Custom Report
                </button>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="mt-6 bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Client Settings</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
                      Client Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="clientName"
                        id="clientName"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        defaultValue={client.name}
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                      Website
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="website"
                        id="website"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        defaultValue={client.website}
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
                      Contact Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="contactName"
                        id="contactName"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        defaultValue={client.contact.name}
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        defaultValue={client.contact.email}
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="phone"
                        id="phone"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        defaultValue={client.contact.phone}
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <label htmlFor="plan" className="block text-sm font-medium text-gray-700">
                      Plan
                    </label>
                    <div className="mt-1">
                      <select
                        id="plan"
                        name="plan"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        defaultValue={client.plan}
                      >
                        <option>Basic</option>
                        <option>Professional</option>
                        <option>Enterprise</option>
                      </select>
                    </div>
                  </div>
                  <div className="sm:col-span-6">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        defaultValue={client.notes}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center">
        <Link to="/agency/dashboard" className="text-blue-600 hover:text-blue-900">
          <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
        </Link>
        <h1 className="ml-2 text-2xl font-bold text-gray-900">{client.name}</h1>
        <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {client.status}
        </span>
        <span className="ml-2 text-sm text-gray-500">
          {client.website}
        </span>
      </div>
      
      <div className="mt-4 flex flex-wrap items-center justify-between">
        <div className="flex space-x-2">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" aria-hidden="true" />
            Run Scan
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PencilIcon className="h-4 w-4 mr-2" aria-hidden="true" />
            Edit Client
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <TrashIcon className="h-4 w-4 mr-2" aria-hidden="true" />
            Delete
          </button>
        </div>
        
        <div className="mt-4 sm:mt-0 text-sm text-gray-500">
          Last scan: {new Date(client.lastScan).toLocaleString()}
        </div>
      </div>
      
      <div className="mt-6 border-b border-gray-200">
        <nav className="flex -mb-px space-x-8">
          <button
            className={`${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`${
              activeTab === 'reports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </button>
          <button
            className={`${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </nav>
      </div>
      
      {renderTabContent()}
    </div>
  );
};

export default ClientDetails;
