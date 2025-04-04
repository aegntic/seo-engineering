import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  UserAddIcon, 
  SearchIcon, 
  PencilAltIcon, 
  TrashIcon,
  PlusIcon,
  XIcon
} from '@heroicons/react/outline';

/**
 * UserPermissionsManager component allows agencies to manage user access
 * and permissions for their team members and clients.
 */
const UserPermissionsManager = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    clients: []
  });
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: {
      dashboard: { view: true, edit: false },
      reports: { view: true, edit: false, create: false },
      settings: { view: false, edit: false },
      clients: { view: true, edit: false, create: false, delete: false },
      users: { view: false, edit: false, create: false, delete: false },
      billing: { view: false, edit: false }
    }
  });
  const [availableClients, setAvailableClients] = useState([]);
  
  // Simulated data fetching
  useEffect(() => {
    // In production, this would be API calls
    setTimeout(() => {
      setUsers([
        {
          id: 1,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@agency.com',
          role: 'Admin',
          active: true,
          lastLogin: '2025-04-07T14:25:00Z',
          clients: ['All Clients']
        },
        {
          id: 2,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@agency.com',
          role: 'Manager',
          active: true,
          lastLogin: '2025-04-06T09:12:00Z',
          clients: ['TechCorp', 'FashionBrand', 'RestaurantChain']
        },
        {
          id: 3,
          firstName: 'Alice',
          lastName: 'Cooper',
          email: 'alice@agency.com',
          role: 'SEO Specialist',
          active: true,
          lastLogin: '2025-04-07T11:45:00Z',
          clients: ['TechCorp', 'E-commerce Store']
        },
        {
          id: 4,
          firstName: 'Bob',
          lastName: 'Johnson',
          email: 'bob@agency.com',
          role: 'Report Viewer',
          active: false,
          lastLogin: '2025-03-15T16:30:00Z',
          clients: ['LocalBusiness']
        },
        {
          id: 5,
          firstName: 'Sarah',
          lastName: 'Williams',
          email: 'sarah@techcorp.com',
          role: 'Client',
          active: true,
          lastLogin: '2025-04-05T10:20:00Z',
          clients: ['TechCorp']
        }
      ]);
      
      setRoles([
        {
          id: 1,
          name: 'Admin',
          description: 'Full access to all features and clients',
          userCount: 1,
          systemDefined: true
        },
        {
          id: 2,
          name: 'Manager',
          description: 'Can manage assigned clients but cannot change billing or system settings',
          userCount: 1,
          systemDefined: true
        },
        {
          id: 3,
          name: 'SEO Specialist',
          description: 'Can view and edit SEO settings for assigned clients',
          userCount: 1,
          systemDefined: false
        },
        {
          id: 4,
          name: 'Report Viewer',
          description: 'Can only view reports for assigned clients',
          userCount: 1,
          systemDefined: false
        },
        {
          id: 5,
          name: 'Client',
          description: 'Client access with limited view of their own site',
          userCount: 1,
          systemDefined: true
        }
      ]);
      
      setAvailableClients([
        { id: 1, name: 'TechCorp' },
        { id: 2, name: 'FashionBrand' },
        { id: 3, name: 'RestaurantChain' },
        { id: 4, name: 'LocalBusiness' },
        { id: 5, name: 'E-commerce Store' }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);
  
  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };
  
  const handleRoleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRole({ ...newRole, [name]: value });
  };
  
  const handlePermissionChange = (section, permission, checked) => {
    setNewRole({
      ...newRole,
      permissions: {
        ...newRole.permissions,
        [section]: {
          ...newRole.permissions[section],
          [permission]: checked
        }
      }
    });
  };
  
  const handleClientSelection = (clientId) => {
    const client = availableClients.find(c => c.id === clientId);
    if (client && !newUser.clients.includes(client.name)) {
      setNewUser({
        ...newUser,
        clients: [...newUser.clients, client.name]
      });
    }
  };
  
  const removeClient = (clientName) => {
    setNewUser({
      ...newUser,
      clients: newUser.clients.filter(c => c !== clientName)
    });
  };
  
  const handleAddUser = () => {
    // In production, this would be an API call
    // For now, just close the modal
    setShowAddUserModal(false);
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      clients: []
    });
  };
  
  const handleAddRole = () => {
    // In production, this would be an API call
    // For now, just close the modal
    setShowAddRoleModal(false);
    setNewRole({
      name: '',
      description: '',
      permissions: {
        dashboard: { view: true, edit: false },
        reports: { view: true, edit: false, create: false },
        settings: { view: false, edit: false },
        clients: { view: true, edit: false, create: false, delete: false },
        users: { view: false, edit: false, create: false, delete: false },
        billing: { view: false, edit: false }
      }
    });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Link to="/agency/settings" className="text-blue-600 hover:text-blue-900 mr-4">
          <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">User Permissions</h1>
      </div>
      
      <div className="mt-6 grid grid-cols-1 gap-y-6 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-0">
        {/* Users Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Users & Team Members
              </h3>
              <div className="mt-3 sm:mt-0">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <UserAddIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                  Add User
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="font-medium text-gray-500">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.role}</div>
                        <div className="text-xs text-gray-500">
                          {user.clients.join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${user.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {user.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.lastLogin).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <PencilAltIcon className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-6">
                <p className="text-gray-500">No users found matching your search criteria.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Roles Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Roles & Permissions
              </h3>
              <div className="mt-3 sm:mt-0">
                <button
                  type="button"
                  onClick={() => setShowAddRoleModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                  Add Role
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Users
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {roles.map((role) => (
                    <tr key={role.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {role.name}
                          {role.systemDefined && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              System
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-normal">
                        <div className="text-sm text-gray-900 max-w-xs">{role.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {role.userCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {!role.systemDefined ? (
                          <>
                            <button
                              type="button"
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <PencilAltIcon className="h-4 w-4" aria-hidden="true" />
                              <span className="sr-only">Edit</span>
                            </button>
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-4 w-4" aria-hidden="true" />
                              <span className="sr-only">Delete</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Add User
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={() => setShowAddUserModal(false)}
                  >
                    <XIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="mt-2">
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          id="firstName"
                          value={newUser.firstName}
                          onChange={handleUserInputChange}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          id="lastName"
                          value={newUser.lastName}
                          onChange={handleUserInputChange}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={newUser.email}
                        onChange={handleUserInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Role
                      </label>
                      <select
                        id="role"
                        name="role"
                        value={newUser.role}
                        onChange={handleUserInputChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Select a role</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.name}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Assign Clients
                      </label>
                      <div className="mt-1">
                        <select
                          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          onChange={(e) => handleClientSelection(parseInt(e.target.value))}
                          defaultValue=""
                        >
                          <option value="" disabled>Select clients to assign</option>
                          <option value="all">All Clients</option>
                          {availableClients.map((client) => (
                            <option key={client.id} value={client.id}>
                              {client.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="mt-2 flex flex-wrap gap-2">
                        {newUser.clients.map((client) => (
                          <span 
                            key={client} 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {client}
                            <button
                              type="button"
                              className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:bg-blue-500 focus:text-white focus:outline-none"
                              onClick={() => removeClient(client)}
                            >
                              <span className="sr-only">Remove {client}</span>
                              <XIcon className="h-3 w-3" aria-hidden="true" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleAddUser}
                >
                  Add User
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Role Modal */}
      {showAddRoleModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Add Role
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={() => setShowAddRoleModal(false)}
                  >
                    <XIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="mt-2">
                  <form className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Role Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={newRole.name}
                        onChange={handleRoleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={2}
                        value={newRole.description}
                        onChange={handleRoleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions</h4>
                      
                      <div className="space-y-4">
                        {/* Dashboard permissions */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Dashboard</h5>
                          <div className="flex space-x-4">
                            <div className="flex items-center">
                              <input
                                id="dashboard-view"
                                name="dashboard-view"
                                type="checkbox"
                                checked={newRole.permissions.dashboard.view}
                                onChange={(e) => handlePermissionChange('dashboard', 'view', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="dashboard-view" className="ml-2 block text-xs font-normal text-gray-700">
                                View
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id="dashboard-edit"
                                name="dashboard-edit"
                                type="checkbox"
                                checked={newRole.permissions.dashboard.edit}
                                onChange={(e) => handlePermissionChange('dashboard', 'edit', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="dashboard-edit" className="ml-2 block text-xs font-normal text-gray-700">
                                Edit
                              </label>
                            </div>
                          </div>
                        </div>
                        
                        {/* Reports permissions */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Reports</h5>
                          <div className="flex space-x-4">
                            <div className="flex items-center">
                              <input
                                id="reports-view"
                                name="reports-view"
                                type="checkbox"
                                checked={newRole.permissions.reports.view}
                                onChange={(e) => handlePermissionChange('reports', 'view', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="reports-view" className="ml-2 block text-xs font-normal text-gray-700">
                                View
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id="reports-edit"
                                name="reports-edit"
                                type="checkbox"
                                checked={newRole.permissions.reports.edit}
                                onChange={(e) => handlePermissionChange('reports', 'edit', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="reports-edit" className="ml-2 block text-xs font-normal text-gray-700">
                                Edit
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id="reports-create"
                                name="reports-create"
                                type="checkbox"
                                checked={newRole.permissions.reports.create}
                                onChange={(e) => handlePermissionChange('reports', 'create', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="reports-create" className="ml-2 block text-xs font-normal text-gray-700">
                                Create
                              </label>
                            </div>
                          </div>
                        </div>
                        
                        {/* Settings permissions */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Settings</h5>
                          <div className="flex space-x-4">
                            <div className="flex items-center">
                              <input
                                id="settings-view"
                                name="settings-view"
                                type="checkbox"
                                checked={newRole.permissions.settings.view}
                                onChange={(e) => handlePermissionChange('settings', 'view', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="settings-view" className="ml-2 block text-xs font-normal text-gray-700">
                                View
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id="settings-edit"
                                name="settings-edit"
                                type="checkbox"
                                checked={newRole.permissions.settings.edit}
                                onChange={(e) => handlePermissionChange('settings', 'edit', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="settings-edit" className="ml-2 block text-xs font-normal text-gray-700">
                                Edit
                              </label>
                            </div>
                          </div>
                        </div>
                        
                        {/* Clients permissions */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Clients</h5>
                          <div className="flex flex-wrap gap-x-4 gap-y-2">
                            <div className="flex items-center">
                              <input
                                id="clients-view"
                                name="clients-view"
                                type="checkbox"
                                checked={newRole.permissions.clients.view}
                                onChange={(e) => handlePermissionChange('clients', 'view', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="clients-view" className="ml-2 block text-xs font-normal text-gray-700">
                                View
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id="clients-edit"
                                name="clients-edit"
                                type="checkbox"
                                checked={newRole.permissions.clients.edit}
                                onChange={(e) => handlePermissionChange('clients', 'edit', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="clients-edit" className="ml-2 block text-xs font-normal text-gray-700">
                                Edit
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id="clients-create"
                                name="clients-create"
                                type="checkbox"
                                checked={newRole.permissions.clients.create}
                                onChange={(e) => handlePermissionChange('clients', 'create', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="clients-create" className="ml-2 block text-xs font-normal text-gray-700">
                                Create
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id="clients-delete"
                                name="clients-delete"
                                type="checkbox"
                                checked={newRole.permissions.clients.delete}
                                onChange={(e) => handlePermissionChange('clients', 'delete', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="clients-delete" className="ml-2 block text-xs font-normal text-gray-700">
                                Delete
                              </label>
                            </div>
                          </div>
                        </div>
                        
                        {/* Users permissions */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Users</h5>
                          <div className="flex flex-wrap gap-x-4 gap-y-2">
                            <div className="flex items-center">
                              <input
                                id="users-view"
                                name="users-view"
                                type="checkbox"
                                checked={newRole.permissions.users.view}
                                onChange={(e) => handlePermissionChange('users', 'view', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="users-view" className="ml-2 block text-xs font-normal text-gray-700">
                                View
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id="users-edit"
                                name="users-edit"
                                type="checkbox"
                                checked={newRole.permissions.users.edit}
                                onChange={(e) => handlePermissionChange('users', 'edit', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="users-edit" className="ml-2 block text-xs font-normal text-gray-700">
                                Edit
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id="users-create"
                                name="users-create"
                                type="checkbox"
                                checked={newRole.permissions.users.create}
                                onChange={(e) => handlePermissionChange('users', 'create', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="users-create" className="ml-2 block text-xs font-normal text-gray-700">
                                Create
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id="users-delete"
                                name="users-delete"
                                type="checkbox"
                                checked={newRole.permissions.users.delete}
                                onChange={(e) => handlePermissionChange('users', 'delete', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="users-delete" className="ml-2 block text-xs font-normal text-gray-700">
                                Delete
                              </label>
                            </div>
                          </div>
                        </div>
                        
                        {/* Billing permissions */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Billing</h5>
                          <div className="flex space-x-4">
                            <div className="flex items-center">
                              <input
                                id="billing-view"
                                name="billing-view"
                                type="checkbox"
                                checked={newRole.permissions.billing.view}
                                onChange={(e) => handlePermissionChange('billing', 'view', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="billing-view" className="ml-2 block text-xs font-normal text-gray-700">
                                View
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                id="billing-edit"
                                name="billing-edit"
                                type="checkbox"
                                checked={newRole.permissions.billing.edit}
                                onChange={(e) => handlePermissionChange('billing', 'edit', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="billing-edit" className="ml-2 block text-xs font-normal text-gray-700">
                                Edit
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleAddRole}
                >
                  Add Role
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowAddRoleModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPermissionsManager;
