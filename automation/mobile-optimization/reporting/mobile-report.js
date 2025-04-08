/**
 * Mobile Optimization Reporting Module
 * 
 * Generates detailed reports based on mobile optimization audit results.
 */

const { getScoreRating, getScoreColor } = require('../utils/scoring');
const fs = require('fs').promises;
const path = require('path');

/**
 * Generate a comprehensive mobile optimization report
 * @param {Object} auditResults - Results from runMobileOptimizationAudit
 * @param {Object} options - Report generation options
 * @returns {Object} - Formatted report data
 */
function generateMobileReport(auditResults, options = {}) {
  try {
    console.log('Generating mobile optimization report...');
    
    // Default options
    const defaultOptions = {
      includeScreenshots: true,
      detailedIssues: true,
      format: 'json',
      brandName: 'SEO.engineering',
      clientName: 'Client',
      projectName: 'Website Audit'
    };
    
    // Merge options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Build report structure
    const report = {
      meta: {
        generatedAt: new Date().toISOString(),
        url: auditResults.url,
        scanDate: auditResults.scanDate,
        brand: mergedOptions.brandName,
        client: mergedOptions.clientName,
        project: mergedOptions.projectName
      },
      scores: {
        overall: {
          value: auditResults.scores.overall,
          rating: getScoreRating(auditResults.scores.overall),
          color: getScoreColor(auditResults.scores.overall)
        }
      },
      summary: {
        overview: auditResults.summary.overall,
        keyIssues: getTopIssues(auditResults.issues, 5),
        keyRecommendations: getTopRecommendations(auditResults.issues, 3)
      },
      details: {
        components: {}
      }
    };
    
    // Add component scores if available
    if (auditResults.scores.viewportConfig !== undefined) {
      report.scores.viewportConfig = {
        value: auditResults.scores.viewportConfig,
        rating: getScoreRating(auditResults.scores.viewportConfig),
        color: getScoreColor(auditResults.scores.viewportConfig)
      };
      
      report.details.components.viewportConfig = {
        score: auditResults.scores.viewportConfig,
        summary: auditResults.summary.viewportConfig || {},
        issues: auditResults.issues.filter(issue => issue.category === 'viewport-configuration')
      };
    }
    
    if (auditResults.scores.touchElements !== undefined) {
      report.scores.touchElements = {
        value: auditResults.scores.touchElements,
        rating: getScoreRating(auditResults.scores.touchElements),
        color: getScoreColor(auditResults.scores.touchElements)
      };
      
      report.details.components.touchElements = {
        score: auditResults.scores.touchElements,
        summary: auditResults.summary.touchElements || {},
        issues: auditResults.issues.filter(issue => issue.category === 'touch-elements')
      };
    }
    
    if (auditResults.scores.responsiveDesign !== undefined) {
      report.scores.responsiveDesign = {
        value: auditResults.scores.responsiveDesign,
        rating: getScoreRating(auditResults.scores.responsiveDesign),
        color: getScoreColor(auditResults.scores.responsiveDesign)
      };
      
      report.details.components.responsiveDesign = {
        score: auditResults.scores.responsiveDesign,
        summary: auditResults.summary.responsiveDesign || {},
        issues: auditResults.issues.filter(issue => issue.category === 'responsive-design')
      };
      
      // Add screenshots if available and requested
      if (mergedOptions.includeScreenshots && auditResults.screenshots) {
        report.details.components.responsiveDesign.screenshots = auditResults.screenshots;
      }
    }
    
    if (auditResults.scores.mobilePerformance !== undefined) {
      report.scores.mobilePerformance = {
        value: auditResults.scores.mobilePerformance,
        rating: getScoreRating(auditResults.scores.mobilePerformance),
        color: getScoreColor(auditResults.scores.mobilePerformance)
      };
      
      report.details.components.mobilePerformance = {
        score: auditResults.scores.mobilePerformance,
        summary: auditResults.summary.mobilePerformance || {},
        issues: auditResults.issues.filter(issue => issue.category === 'mobile-performance')
      };
      
      // Add performance metrics if available
      if (auditResults.metrics) {
        report.details.components.mobilePerformance.metrics = auditResults.metrics;
      }
    }
    
    // Include all issues if detailed reporting is requested
    if (mergedOptions.detailedIssues) {
      report.issues = auditResults.issues.map(issue => ({
        ...issue,
        severityColor: getSeverityColor(issue.severity)
      }));
    } else {
      // Just include high and critical issues
      report.issues = auditResults.issues
        .filter(issue => ['critical', 'high'].includes(issue.severity))
        .map(issue => ({
          ...issue,
          severityColor: getSeverityColor(issue.severity)
        }));
    }
    
    // Generate action plan based on issues
    report.actionPlan = generateActionPlan(auditResults.issues);
    
    // Return the formatted report
    return report;
  } catch (error) {
    console.error('Error generating mobile optimization report:', error);
    throw error;
  }
}

/**
 * Save a report to file in specified format
 * @param {Object} report - The formatted report data
 * @param {string} filePath - Path to save the report
 * @param {string} format - Format to save (json, html, pdf)
 * @returns {Promise<string>} - Path to the saved file
 */
async function saveReport(report, filePath, format = 'json') {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    
    if (format === 'json') {
      await fs.writeFile(filePath, JSON.stringify(report, null, 2));
      return filePath;
    } else if (format === 'html') {
      const html = generateHtmlReport(report);
      await fs.writeFile(filePath, html);
      return filePath;
    } else if (format === 'pdf') {
      throw new Error('PDF format not implemented yet');
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    console.error('Error saving report:', error);
    throw error;
  }
}

/**
 * Get the top issues based on severity
 * @param {Array} issues - List of issues
 * @param {number} count - Number of issues to return
 * @returns {Array} - Top issues
 */
function getTopIssues(issues, count = 5) {
  // Define severity order
  const severityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
  
  // Sort issues by severity
  const sortedIssues = [...issues].sort((a, b) => {
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
  
  // Return top issues
  return sortedIssues.slice(0, count);
}

/**
 * Get top recommendations based on issues
 * @param {Array} issues - List of issues
 * @param {number} count - Number of recommendations to return
 * @returns {Array} - Top recommendations
 */
function getTopRecommendations(issues, count = 3) {
  // Get high and critical issues first
  const criticalIssues = issues.filter(issue => issue.severity === 'critical');
  const highIssues = issues.filter(issue => issue.severity === 'high');
  
  // Generate recommendations
  const recommendations = [];
  
  // Add critical issues recommendations
  for (const issue of criticalIssues) {
    if (recommendations.length < count) {
      recommendations.push({
        title: `Fix: ${issue.title}`,
        description: issue.recommendation,
        priority: 'Critical',
        impact: 'High'
      });
    }
  }
  
  // Add high issues recommendations
  for (const issue of highIssues) {
    if (recommendations.length < count) {
      recommendations.push({
        title: `Fix: ${issue.title}`,
        description: issue.recommendation,
        priority: 'High',
        impact: 'Medium to High'
      });
    }
  }
  
  // If we still have room, add medium issues
  if (recommendations.length < count) {
    const mediumIssues = issues.filter(issue => issue.severity === 'medium');
    for (const issue of mediumIssues) {
      if (recommendations.length < count) {
        recommendations.push({
          title: `Improve: ${issue.title}`,
          description: issue.recommendation,
          priority: 'Medium',
          impact: 'Medium'
        });
      }
    }
  }
  
  return recommendations;
}

/**
 * Generate an action plan based on issues
 * @param {Array} issues - List of issues
 * @returns {Object} - Action plan with prioritized tasks
 */
function generateActionPlan(issues) {
  const actionPlan = {
    criticalTasks: [],
    highPriorityTasks: [],
    mediumPriorityTasks: [],
    lowPriorityTasks: []
  };
  
  for (const issue of issues) {
    const task = {
      title: `Fix: ${issue.title}`,
      description: issue.description,
      action: issue.recommendation,
      impact: issue.impact || 'Unknown',
      effort: issue.effort || 'Unknown',
      category: issue.category
    };
    
    if (issue.severity === 'critical') {
      actionPlan.criticalTasks.push(task);
    } else if (issue.severity === 'high') {
      actionPlan.highPriorityTasks.push(task);
    } else if (issue.severity === 'medium') {
      actionPlan.mediumPriorityTasks.push(task);
    } else {
      actionPlan.lowPriorityTasks.push(task);
    }
  }
  
  return actionPlan;
}

/**
 * Get color for issue severity
 * @param {string} severity - Issue severity
 * @returns {string} - Hex color code
 */
function getSeverityColor(severity) {
  switch (severity) {
    case 'critical': return '#F44336'; // Red
    case 'high': return '#FF9800';     // Orange
    case 'medium': return '#FFEB3B';   // Yellow
    case 'low': return '#8BC34A';      // Light Green
    default: return '#9E9E9E';         // Grey
  }
}

/**
 * Generate an HTML report from report data
 * @param {Object} report - The report data
 * @returns {string} - HTML content
 */
function generateHtmlReport(report) {
  // This is a simplified implementation, in a real project this would be more sophisticated
  // with proper HTML templates and styling
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mobile Optimization Report - ${report.meta.url}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { color: #1a73e8; }
    .score-card { display: inline-block; padding: 15px; border-radius: 5px; width: 150px; text-align: center; margin: 10px; }
    .issues { margin-top: 20px; }
    .issue { border-left: 5px solid #ccc; padding: 10px; margin-bottom: 15px; background-color: #f9f9f9; }
    .critical { border-left-color: #F44336; }
    .high { border-left-color: #FF9800; }
    .medium { border-left-color: #FFEB3B; }
    .low { border-left-color: #8BC34A; }
    .score-value { font-size: 36px; font-weight: bold; }
    .score-label { font-size: 14px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <header>
    <h1>Mobile Optimization Report</h1>
    <p>URL: <a href="${report.meta.url}" target="_blank">${report.meta.url}</a></p>
    <p>Generated on: ${new Date(report.meta.generatedAt).toLocaleString()}</p>
  </header>
  
  <section>
    <h2>Overall Score</h2>
    <div class="score-card" style="background-color: ${report.scores.overall.color}; color: white;">
      <div class="score-value">${report.scores.overall.value}</div>
      <div class="score-label">${report.scores.overall.rating}</div>
    </div>
    
    <div class="component-scores">
      ${Object.entries(report.scores)
        .filter(([key]) => key !== 'overall')
        .map(([key, score]) => `
          <div class="score-card" style="background-color: ${score.color}; color: white;">
            <div class="score-value">${score.value}</div>
            <div class="score-label">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
          </div>
        `).join('')}
    </div>
  </section>
  
  <section>
    <h2>Summary</h2>
    <p>${report.summary.overview.recommendation || 'No summary available.'}</p>
    
    <h3>Key Issues</h3>
    <ul>
      ${report.summary.keyIssues.map(issue => `
        <li><strong>${issue.title}</strong>: ${issue.description}</li>
      `).join('')}
    </ul>
    
    <h3>Top Recommendations</h3>
    <ul>
      ${report.summary.keyRecommendations.map(rec => `
        <li><strong>${rec.title}</strong> (${rec.priority}): ${rec.description}</li>
      `).join('')}
    </ul>
  </section>
  
  <section>
    <h2>Detailed Issues</h2>
    <div class="issues">
      ${report.issues.map(issue => `
        <div class="issue ${issue.severity}">
          <h3>${issue.title}</h3>
          <p>${issue.description}</p>
          <p><strong>Recommendation</strong>: ${issue.recommendation}</p>
          <p><strong>Severity</strong>: ${issue.severity}</p>
          ${issue.impact ? `<p><strong>Impact</strong>: ${issue.impact}</p>` : ''}
          ${issue.effort ? `<p><strong>Effort</strong>: ${issue.effort}</p>` : ''}
        </div>
      `).join('')}
    </div>
  </section>
  
  <section>
    <h2>Action Plan</h2>
    
    <h3>Critical Tasks</h3>
    ${report.actionPlan.criticalTasks.length ? `
      <table>
        <tr>
          <th>Task</th>
          <th>Action</th>
          <th>Impact</th>
          <th>Effort</th>
        </tr>
        ${report.actionPlan.criticalTasks.map(task => `
          <tr>
            <td>${task.title}</td>
            <td>${task.action}</td>
            <td>${task.impact}</td>
            <td>${task.effort}</td>
          </tr>
        `).join('')}
      </table>
    ` : '<p>No critical tasks found.</p>'}
    
    <h3>High Priority Tasks</h3>
    ${report.actionPlan.highPriorityTasks.length ? `
      <table>
        <tr>
          <th>Task</th>
          <th>Action</th>
          <th>Impact</th>
          <th>Effort</th>
        </tr>
        ${report.actionPlan.highPriorityTasks.map(task => `
          <tr>
            <td>${task.title}</td>
            <td>${task.action}</td>
            <td>${task.impact}</td>
            <td>${task.effort}</td>
          </tr>
        `).join('')}
      </table>
    ` : '<p>No high priority tasks found.</p>'}
    
    <h3>Medium Priority Tasks</h3>
    ${report.actionPlan.mediumPriorityTasks.length ? `
      <table>
        <tr>
          <th>Task</th>
          <th>Action</th>
          <th>Impact</th>
          <th>Effort</th>
        </tr>
        ${report.actionPlan.mediumPriorityTasks.map(task => `
          <tr>
            <td>${task.title}</td>
            <td>${task.action}</td>
            <td>${task.impact}</td>
            <td>${task.effort}</td>
          </tr>
        `).join('')}
      </table>
    ` : '<p>No medium priority tasks found.</p>'}
  </section>
  
  <footer>
    <p>Generated by ${report.meta.brand} for ${report.meta.client} - ${report.meta.project}</p>
  </footer>
</body>
</html>`;

  return html;
}

module.exports = {
  generateMobileReport,
  saveReport
};
