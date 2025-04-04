/**
 * Report Controller
 * Handles report generation, retrieval, and management
 */

const { Client, Report } = require('../models');

/**
 * Get a specific report by ID
 */
exports.getReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reportId = req.params.id;
    
    // Find report and verify ownership through client
    const report = await Report.findById(reportId).populate('client');
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    
    // Verify ownership
    if (report.client.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all reports for a client
 */
exports.getClientReports = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const clientId = req.params.clientId;
    
    // Find client and verify ownership
    const client = await Client.findOne({
      _id: clientId,
      owner: userId
    });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }
    
    // Pagination
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    
    // Get reports
    const reports = await Report.find({ client: clientId })
      .sort({ crawlDate: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Report.countDocuments({ client: clientId });
    
    return res.status(200).json({
      success: true,
      count: reports.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate a PDF report
 */
exports.generatePdfReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reportId = req.params.id;
    
    // Find report and verify ownership through client
    const report = await Report.findById(reportId).populate('client');
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    
    // Verify ownership
    if (report.client.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }
    
    // This would trigger a PDF generation process
    // For now, we'll just return a success message
    return res.status(200).json({
      success: true,
      data: {
        message: 'PDF generation initiated',
        reportId: report._id,
        downloadUrl: `/api/reports/${report._id}/download`
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Compare two reports
 */
exports.compareReports = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { reportId1, reportId2 } = req.query;
    
    if (!reportId1 || !reportId2) {
      return res.status(400).json({
        success: false,
        error: 'Two report IDs are required for comparison'
      });
    }
    
    // Find reports and verify ownership
    const report1 = await Report.findById(reportId1).populate('client');
    const report2 = await Report.findById(reportId2).populate('client');
    
    if (!report1 || !report2) {
      return res.status(404).json({
        success: false,
        error: 'One or both reports not found'
      });
    }
    
    // Verify ownership of both reports
    if (report1.client.owner.toString() !== userId || report2.client.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access one or both reports'
      });
    }
    
    // Verify reports are for the same client
    if (report1.client._id.toString() !== report2.client._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Cannot compare reports from different clients'
      });
    }
    
    // Compare the reports
    const comparison = {
      reportDate1: report1.crawlDate,
      reportDate2: report2.crawlDate,
      scoreDifference: report2.seoScore - report1.seoScore,
      metrics: {
        pagespeed: {
          mobile: {
            before: report1.metrics.pagespeed.mobile,
            after: report2.metrics.pagespeed.mobile,
            difference: report2.metrics.pagespeed.mobile - report1.metrics.pagespeed.mobile
          },
          desktop: {
            before: report1.metrics.pagespeed.desktop,
            after: report2.metrics.pagespeed.desktop,
            difference: report2.metrics.pagespeed.desktop - report1.metrics.pagespeed.desktop
          }
        },
        issuesSummary: {
          critical: {
            before: report1.summary.criticalIssues,
            after: report2.summary.criticalIssues,
            difference: report1.summary.criticalIssues - report2.summary.criticalIssues
          },
          high: {
            before: report1.summary.highIssues,
            after: report2.summary.highIssues,
            difference: report1.summary.highIssues - report2.summary.highIssues
          },
          medium: {
            before: report1.summary.mediumIssues,
            after: report2.summary.mediumIssues,
            difference: report1.summary.mediumIssues - report2.summary.mediumIssues
          },
          low: {
            before: report1.summary.lowIssues,
            after: report2.summary.lowIssues,
            difference: report1.summary.lowIssues - report2.summary.lowIssues
          },
          fixed: {
            before: report1.summary.fixedIssues,
            after: report2.summary.fixedIssues,
            difference: report2.summary.fixedIssues - report1.summary.fixedIssues
          }
        }
      }
    };
    
    return res.status(200).json({
      success: true,
      data: comparison
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get insights and recommendations from the report
 */
exports.getInsights = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reportId = req.params.id;
    
    // Find report and verify ownership through client
    const report = await Report.findById(reportId).populate('client');
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    
    // Verify ownership
    if (report.client.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }
    
    // Generate insights
    // This would be a more complex algorithm in production
    const insights = {
      topIssues: report.issues
        .filter(issue => issue.severity === 'critical' || issue.severity === 'high')
        .slice(0, 5),
      quickWins: report.issues
        .filter(issue => !issue.fixImplemented && (issue.severity === 'medium' || issue.severity === 'low'))
        .sort((a, b) => {
          // Sort by impact and ease of implementation
          if (a.impact === b.impact) {
            return 0;
          }
          return a.impact === 'high' ? -1 : 1;
        })
        .slice(0, 3),
      performanceInsights: {
        pagespeed: {
          mobile: report.metrics.pagespeed.mobile,
          desktop: report.metrics.pagespeed.desktop,
          recommendation: report.metrics.pagespeed.mobile < 70 ? 
            'Mobile page speed needs improvement' : 'Mobile page speed is good'
        },
        coreWebVitals: {
          LCP: report.metrics.coreWebVitals.LCP,
          FID: report.metrics.coreWebVitals.FID,
          CLS: report.metrics.coreWebVitals.CLS,
          recommendation: 'Focus on improving Core Web Vitals for better user experience'
        }
      },
      seoHealthScore: report.seoScore,
      recommendationSummary: `Based on our analysis, your site has ${report.summary.criticalIssues} critical issues that need immediate attention.`
    };
    
    return res.status(200).json({
      success: true,
      data: insights
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;