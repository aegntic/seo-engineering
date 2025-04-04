import React from 'react';
import PropTypes from 'prop-types';

/**
 * Report header component with branding and site information
 * @param {Object} props Component props
 * @param {string} props.siteUrl The URL of the site being analyzed
 * @param {string} props.scanDate Date of the scan
 * @param {string} props.logo Logo URL
 * @param {string} props.companyName Company name
 */
const ReportHeader = ({ siteUrl, scanDate, logo, companyName }) => {
  return (
    <div className="report-header mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="branding flex items-center mb-4 md:mb-0">
          <img 
            src={logo} 
            alt={`${companyName} Logo`} 
            className="h-10 w-auto mr-2"
          />
          <h1 className="text-xl font-bold text-gray-900">{companyName} SEO Report</h1>
        </div>
        
        <div className="report-meta text-right">
          <p className="text-gray-700 mb-1">
            <span className="font-semibold">Site:</span> {siteUrl}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Scan Date:</span> {scanDate}
          </p>
        </div>
      </div>
      
      <div className="border-b border-gray-200 mt-4 mb-2"></div>
    </div>
  );
};

ReportHeader.propTypes = {
  siteUrl: PropTypes.string.isRequired,
  scanDate: PropTypes.string.isRequired,
  logo: PropTypes.string.isRequired,
  companyName: PropTypes.string.isRequired
};

export default ReportHeader;
