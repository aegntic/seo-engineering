# SEOAutomate Reporting System

This module provides a comprehensive system for generating, displaying, and exporting SEO reports based on scan results. The reporting system is designed to be flexible, customizable, and easy to integrate with the rest of the SEOAutomate platform.

## Features

- Multiple report templates (Default, Executive Summary)
- Responsive design that works on all devices
- Interactive components (filtering, sorting)
- PDF export functionality
- Visual data representation (score indicators, charts)
- Custom hooks for data fetching
- Mock data for development and testing

## Structure

The reporting system is organized into the following directories:

- `/templates` - Report templates for different use cases
- `/components` - Reusable UI components for reports
- `/utils` - Utility functions for report generation and export
- `/hooks` - Custom React hooks for data management
- `/api` - API services for fetching and managing report data
- `/examples` - Example implementations

## Usage

### Basic Usage

```jsx
import React from 'react';
import { DefaultTemplate, useReportData } from '../reporting';

const ReportView = ({ siteId }) => {
  const { report, isLoading, error } = useReportData(siteId);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!report) return <div>No report available</div>;
  
  return (
    <DefaultTemplate 
      data={report}
      branding={{
        logo: '/logo.svg',
        companyName: 'SEOAutomate'
      }}
    />
  );
};

export default ReportView;
```

### Exporting to PDF

```jsx
import React from 'react';
import { exportToPDF } from '../reporting';

const ReportActions = ({ reportData }) => {
  const handleExport = async () => {
    try {
      const result = await exportToPDF(reportData, {
        filename: 'seo-report.pdf'
      });
      alert(`Report exported successfully: ${result.filename}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report');
    }
  };
  
  return (
    <button onClick={handleExport}>
      Export to PDF
    </button>
  );
};
```

### Customizing Templates

You can create custom templates by extending the existing ones:

```jsx
import React from 'react';
import { DefaultTemplate } from '../reporting';

const CustomTemplate = (props) => {
  return (
    <div className="custom-wrapper">
      <h1>Custom Report Header</h1>
      <DefaultTemplate {...props} />
      <div className="custom-footer">
        <p>Custom footer content</p>
      </div>
    </div>
  );
};

export default CustomTemplate;
```

## Available Templates

### DefaultTemplate

A comprehensive template that includes all report sections:
- Header with site information
- SEO score visualization
- Key metrics
- Issues table with filtering
- Recommendations with implementation steps

### ExecutiveSummaryTemplate

A concise template designed for executives and stakeholders:
- Header with site information
- Brief executive summary text
- SEO score visualization
- Key metrics (limited to top 4)
- High-priority issues only
- Recommended next steps

## Components

The reporting system includes the following components:

- `ReportHeader` - Header with branding and site information
- `MetricsSection` - Grid display of key performance metrics
- `IssuesTable` - Interactive table of SEO issues with filtering
- `ScoreVisual` - Visual representation of the SEO score
- `RecommendationsList` - Actionable recommendations with implementation steps

## API Integration

The reporting system is designed to work with the SEOAutomate API, but includes mock data for development and testing. To connect to the actual API, ensure that the `API_BASE_URL` in `reportService.js` is set correctly.

## Customization

You can customize the appearance of reports by:

1. Creating new templates that use the existing components
2. Modifying the component styles (all components use Tailwind CSS)
3. Extending the utility functions to add additional functionality

## PDF Export

The PDF export functionality is currently implemented as a mock service. In production, you would integrate with a PDF generation library like jsPDF, html2pdf, or a server-side PDF generation service.

## Future Enhancements

Planned enhancements for the reporting system include:

- Additional report templates for specific use cases
- Interactive data visualizations and charts
- Historical comparison of metrics
- Custom branding options
- Scheduled report generation
- Email delivery of reports
