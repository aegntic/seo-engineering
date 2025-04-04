import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, SaveIcon, PhotographIcon } from '@heroicons/react/outline';

/**
 * WhiteLabelSettings component allows agencies to customize the branding and appearance
 * of the platform, including logo, colors, and domain.
 */
const WhiteLabelSettings = () => {
  const [settings, setSettings] = useState({
    customLogo: null,
    logoPreviewUrl: null,
    primaryColor: '#3B82F6', // Default blue
    accentColor: '#10B981', // Default green
    customDomain: '',
    enableCustomDomain: false,
    customEmail: '',
    enableCustomEmail: false,
    customFavicon: null,
    faviconPreviewUrl: null,
    clientPortalName: 'SEO Dashboard',
    emailFooter: 'Powered by Your Agency',
    hideSeoBrandingInReports: true,
  });
  
  const [previewMode, setPreviewMode] = useState('light');
  
  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({
          ...settings,
          customLogo: file,
          logoPreviewUrl: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleFaviconChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({
          ...settings,
          customFavicon: file,
          faviconPreviewUrl: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Link to="/agency/settings" className="text-blue-600 hover:text-blue-900 mr-4">
          <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">White Label Settings</h1>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-8">
            Customize the appearance of your SEOAutomate instance for clients
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Branding Section */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Branding</h4>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Logo</label>
                    <div className="mt-1 flex items-center">
                      <div className="flex-shrink-0 h-16 w-16 border border-gray-200 rounded-md overflow-hidden">
                        {settings.logoPreviewUrl ? (
                          <img src={settings.logoPreviewUrl} alt="Logo preview" className="h-full w-full object-contain" />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full bg-gray-100">
                            <PhotographIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="relative rounded-md shadow-sm">
                          <input
                            type="file"
                            name="logo"
                            id="logo"
                            className="sr-only"
                            onChange={handleLogoChange}
                          />
                          <label
                            htmlFor="logo"
                            className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Upload Logo
                          </label>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Recommended size: 200x50px. PNG or SVG with transparent background.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Favicon</label>
                    <div className="mt-1 flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 border border-gray-200 rounded-md overflow-hidden">
                        {settings.faviconPreviewUrl ? (
                          <img src={settings.faviconPreviewUrl} alt="Favicon preview" className="h-full w-full object-contain" />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full bg-gray-100">
                            <PhotographIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="relative rounded-md shadow-sm">
                          <input
                            type="file"
                            name="favicon"
                            id="favicon"
                            className="sr-only"
                            onChange={handleFaviconChange}
                          />
                          <label
                            htmlFor="favicon"
                            className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Upload Favicon
                          </label>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Square image, at least 32x32px. Will be displayed in browser tabs.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
                        Primary Color
                      </label>
                      <div className="mt-1 flex items-center">
                        <input
                          type="color"
                          name="primaryColor"
                          id="primaryColor"
                          value={settings.primaryColor}
                          onChange={handleInputChange}
                          className="h-8 w-8 border border-gray-300 rounded-md"
                        />
                        <input
                          type="text"
                          name="primaryColor"
                          value={settings.primaryColor}
                          onChange={handleInputChange}
                          className="ml-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Used for buttons, links, and primary actions.
                      </p>
                    </div>
                    <div className="sm:col-span-3">
                      <label htmlFor="accentColor" className="block text-sm font-medium text-gray-700">
                        Accent Color
                      </label>
                      <div className="mt-1 flex items-center">
                        <input
                          type="color"
                          name="accentColor"
                          id="accentColor"
                          value={settings.accentColor}
                          onChange={handleInputChange}
                          className="h-8 w-8 border border-gray-300 rounded-md"
                        />
                        <input
                          type="text"
                          name="accentColor"
                          value={settings.accentColor}
                          onChange={handleInputChange}
                          className="ml-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Used for secondary elements and highlights.
                      </p>
                    </div>
                    <div className="sm:col-span-6">
                      <label htmlFor="clientPortalName" className="block text-sm font-medium text-gray-700">
                        Client Portal Name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="clientPortalName"
                          id="clientPortalName"
                          value={settings.clientPortalName}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        This is what clients will see in the title bar and welcome messages.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Domain & Email Section */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Domain & Email</h4>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="enableCustomDomain"
                            name="enableCustomDomain"
                            type="checkbox"
                            checked={settings.enableCustomDomain}
                            onChange={handleInputChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="enableCustomDomain" className="font-medium text-gray-700">
                            Enable Custom Domain
                          </label>
                          <p className="text-gray-500">Requires Enterprise plan or higher.</p>
                        </div>
                      </div>
                    </div>
                    
                    {settings.enableCustomDomain && (
                      <div className="sm:col-span-6">
                        <label htmlFor="customDomain" className="block text-sm font-medium text-gray-700">
                          Custom Domain
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="customDomain"
                            id="customDomain"
                            placeholder="dashboard.youragency.com"
                            value={settings.customDomain}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          You'll need to set up a CNAME record pointing to our servers.
                        </p>
                      </div>
                    )}
                    
                    <div className="sm:col-span-6">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="enableCustomEmail"
                            name="enableCustomEmail"
                            type="checkbox"
                            checked={settings.enableCustomEmail}
                            onChange={handleInputChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="enableCustomEmail" className="font-medium text-gray-700">
                            Enable Custom Email Sending
                          </label>
                          <p className="text-gray-500">Send reports and notifications from your own domain.</p>
                        </div>
                      </div>
                    </div>
                    
                    {settings.enableCustomEmail && (
                      <div className="sm:col-span-6">
                        <label htmlFor="customEmail" className="block text-sm font-medium text-gray-700">
                          From Email Address
                        </label>
                        <div className="mt-1">
                          <input
                            type="email"
                            name="customEmail"
                            id="customEmail"
                            placeholder="reports@youragency.com"
                            value={settings.customEmail}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Additional verification steps will be required for email sending.
                        </p>
                      </div>
                    )}
                    
                    <div className="sm:col-span-6">
                      <label htmlFor="emailFooter" className="block text-sm font-medium text-gray-700">
                        Email Footer Text
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="emailFooter"
                          id="emailFooter"
                          value={settings.emailFooter}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        This text will appear in the footer of all emails sent to clients.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Reports Section */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Reports & Documents</h4>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="hideSeoBrandingInReports"
                        name="hideSeoBrandingInReports"
                        type="checkbox"
                        checked={settings.hideSeoBrandingInReports}
                        onChange={handleInputChange}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="hideSeoBrandingInReports" className="font-medium text-gray-700">
                        Hide SEOAutomate Branding in Reports
                      </label>
                      <p className="text-gray-500">Remove all mentions of SEOAutomate from client-facing reports.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Preview Section */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-md font-medium text-gray-900 mb-4">Preview</h4>
              
              <div className="mb-4">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('light')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      previewMode === 'light'
                        ? 'bg-gray-200 text-gray-800'
                        : 'bg-transparent text-gray-600'
                    }`}
                  >
                    Light Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('dark')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      previewMode === 'dark'
                        ? 'bg-gray-700 text-white'
                        : 'bg-transparent text-gray-600'
                    }`}
                  >
                    Dark Mode
                  </button>
                </div>
              </div>
              
              <div className={`rounded-lg overflow-hidden border ${
                previewMode === 'light' ? 'border-gray-200 bg-white' : 'border-gray-700 bg-gray-800'
              }`}>
                {/* Header */}
                <div 
                  className={`px-4 py-3 flex items-center border-b ${
                    previewMode === 'light' ? 'border-gray-200' : 'border-gray-700'
                  }`}
                  style={{ 
                    backgroundColor: settings.primaryColor,
                    color: '#ffffff'
                  }}
                >
                  <div className="h-8 w-24 bg-white bg-opacity-20 rounded flex items-center justify-center overflow-hidden">
                    {settings.logoPreviewUrl ? (
                      <img src={settings.logoPreviewUrl} alt="Logo preview" className="h-6 object-contain" />
                    ) : (
                      <span className="text-xs font-medium">LOGO</span>
                    )}
                  </div>
                  <div className="ml-auto flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-full bg-white bg-opacity-20"></div>
                    <div className="h-4 w-20 rounded bg-white bg-opacity-20"></div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <div 
                    className={`mb-4 p-3 rounded-lg ${
                      previewMode === 'light' ? 'bg-gray-100' : 'bg-gray-700'
                    }`}
                  >
                    <div className="h-5 w-36 rounded bg-current opacity-30 mb-2"></div>
                    <div className="flex space-x-2">
                      <div 
                        className="h-10 w-24 rounded flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: settings.primaryColor }}
                      >
                        Primary
                      </div>
                      <div 
                        className="h-10 w-24 rounded flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: settings.accentColor }}
                      >
                        Accent
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`h-4 w-48 rounded ${
                      previewMode === 'light' ? 'bg-gray-200' : 'bg-gray-700'
                    } mb-2`}
                  ></div>
                  <div 
                    className={`h-4 w-64 rounded ${
                      previewMode === 'light' ? 'bg-gray-200' : 'bg-gray-700'
                    } mb-2`}
                  ></div>
                  <div 
                    className={`h-4 w-56 rounded ${
                      previewMode === 'light' ? 'bg-gray-200' : 'bg-gray-700'
                    } mb-4`}
                  ></div>
                  
                  <div 
                    className="h-20 rounded flex items-center justify-center text-xs"
                    style={{ 
                      backgroundColor: `${settings.primaryColor}20`,
                      color: settings.primaryColor
                    }}
                  >
                    {settings.clientPortalName}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <SaveIcon className="h-4 w-4 mr-2" aria-hidden="true" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhiteLabelSettings;
