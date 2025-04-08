import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

/**
 * DashboardLayout component provides the common layout structure for both
 * client dashboard and agency portal, with proper navigation based on the module.
 */
const DashboardLayout = ({ children, userData, pageTitle, moduleName = 'client' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Menu items based on module type
  const getMenuItems = () => {
    if (moduleName === 'agency') {
      return [
        { name: 'Dashboard', path: '/agency/dashboard' },
        { name: 'Clients', path: '/agency/clients' },
        { name: 'Bulk Reports', path: '/agency/reports/bulk' },
        { name: 'Settings', path: '/agency/settings' }
      ];
    }
    
    // Default client dashboard menu
    return [
      { name: 'Overview', path: '/dashboard' },
      { name: 'Sites', path: '/dashboard/sites' },
      { name: 'Analytics', path: '/dashboard/analytics' },
      { name: 'Content Optimization', path: '/dashboard/content-optimization' },
      { name: 'Reports', path: '/dashboard/reports' },
      { name: 'Settings', path: '/dashboard/settings' }
    ];
  };
  
  const menuItems = getMenuItems();
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Determine correct logo text based on module
  const getLogoText = () => {
    return moduleName === 'agency' ? 'SEO.engineering Agency' : 'SEO.engineering';
  };
  
  // Determine title text
  const getTitleText = () => {
    return pageTitle || (moduleName === 'agency' ? 'Agency Portal' : 'Dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className={`${moduleName === 'agency' ? 'bg-blue-600' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link 
                  to={moduleName === 'agency' ? '/agency/dashboard' : '/dashboard'} 
                  className={`text-xl font-bold ${moduleName === 'agency' ? 'text-white' : 'text-indigo-600'}`}
                >
                  {getLogoText()}
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`${
                      location.pathname === item.path || 
                      (item.path !== '/dashboard' && item.path !== '/agency/dashboard' && location.pathname.startsWith(item.path))
                        ? moduleName === 'agency' 
                          ? 'border-white text-white' 
                          : 'border-indigo-500 text-gray-900'
                        : moduleName === 'agency'
                          ? 'border-transparent text-blue-100 hover:border-blue-200 hover:text-white'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div>
                  <span className={`text-sm font-medium ${moduleName === 'agency' ? 'text-white' : 'text-gray-700'} mr-2`}>
                    {userData?.name || 'Admin User'}
                  </span>
                  <button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                    <span className="sr-only">Open user menu</span>
                    <div className={`h-8 w-8 rounded-full ${
                      moduleName === 'agency' ? 'bg-blue-200 text-blue-600' : 'bg-indigo-200 text-indigo-600'
                    } flex items-center justify-center font-semibold`}>
                      {(userData?.name || 'A').charAt(0)}
                    </div>
                  </button>
                </div>
              </div>
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={toggleMobileMenu}
                className={`inline-flex items-center justify-center p-2 rounded-md ${
                  moduleName === 'agency' 
                    ? 'text-blue-100 hover:text-white hover:bg-blue-700' 
                    : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'
                } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500`}
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden">
            <div className={`pt-2 pb-3 space-y-1 ${moduleName === 'agency' ? 'bg-blue-600' : 'bg-white'}`}>
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`${
                    location.pathname === item.path
                      ? moduleName === 'agency'
                        ? 'bg-blue-700 border-white text-white'
                        : 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : moduleName === 'agency'
                        ? 'border-transparent text-blue-100 hover:bg-blue-700 hover:border-blue-200 hover:text-white'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className={`pt-4 pb-3 border-t ${
              moduleName === 'agency' 
                ? 'border-blue-400 bg-blue-600' 
                : 'border-gray-200 bg-white'
            }`}>
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className={`h-10 w-10 rounded-full ${
                    moduleName === 'agency' ? 'bg-blue-200 text-blue-600' : 'bg-indigo-200 text-indigo-600'
                  } flex items-center justify-center font-semibold`}>
                    {(userData?.name || 'A').charAt(0)}
                  </div>
                </div>
                <div className="ml-3">
                  <div className={`text-base font-medium ${
                    moduleName === 'agency' ? 'text-white' : 'text-gray-800'
                  }`}>
                    {userData?.name || 'Admin User'}
                  </div>
                  <div className={`text-sm font-medium ${
                    moduleName === 'agency' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {userData?.email || 'admin@example.com'}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <a
                  href="#"
                  className={`block px-4 py-2 text-base font-medium ${
                    moduleName === 'agency'
                      ? 'text-blue-100 hover:text-white hover:bg-blue-700'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    // Handle logout in a real implementation
                    console.log('Logging out');
                  }}
                >
                  Sign out
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Page header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">{getTitleText()}</h1>
        </div>
      </header>

      {/* Main content */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;