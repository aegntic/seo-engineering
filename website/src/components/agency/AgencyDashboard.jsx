import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ClientList from './ClientList';
import AgencyMetrics from './AgencyMetrics';
import AgencyActionPanel from './AgencyActionPanel';
import AgencyHeader from './AgencyHeader';

/**
 * AgencyDashboard component serves as the main dashboard for agency partners.
 * It provides an overview of all clients, agency performance metrics, and
 * quick actions for the agency.
 */
const AgencyDashboard = () => {
  const [agencyData, setAgencyData] = useState({
    name: '',
    totalClients: 0,
    activeProjects: 0,
    recentIssues: [],
    performance: {
      overallScore: 0,
      clientSatisfaction: 0,
      revenueGrowth: 0,
      issueResolution: 0
    }
  });
  
  const [loading, setLoading] = useState(true);
  
  // Simulate data fetching
  useEffect(() => {
    // In production, this would be an API call
    setTimeout(() => {
      setAgencyData({
        name: 'Acme Digital Marketing',
        totalClients: 23,
        activeProjects: 17,
        recentIssues: [
          { id: 1, client: 'TechCorp', description: 'Mobile performance issues', severity: 'high', date: '2025-04-07' },
          { id: 2, client: 'FashionBrand', description: 'Duplicate content', severity: 'medium', date: '2025-04-06' },
          { id: 3, client: 'RestaurantChain', description: 'Broken links', severity: 'low', date: '2025-04-05' }
        ],
        performance: {
          overallScore: 87,
          clientSatisfaction: 92,
          revenueGrowth: 23,
          issueResolution: 89
        }
      });
      setLoading(false);
    }, 1000);
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <AgencyHeader 
        agencyName={agencyData.name}
        totalClients={agencyData.totalClients}
        activeProjects={agencyData.activeProjects}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <ClientList />
        </div>
        <div className="space-y-6">
          <AgencyMetrics performance={agencyData.performance} />
          <AgencyActionPanel />
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Recent Issues Across Clients</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agencyData.recentIssues.map((issue) => (
                <tr key={issue.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{issue.client}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{issue.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${issue.severity === 'high' ? 'bg-red-100 text-red-800' : 
                        issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {issue.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {issue.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link to={`/agency/clients/${issue.client.toLowerCase()}/issues/${issue.id}`} className="text-blue-600 hover:text-blue-900">
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
  );
};

export default AgencyDashboard;
