/**
 * Issue Controller
 * Handles SEO issue management and fixes
 */

const Client = require('../models/client.model');
const Report = require('../models/report.model');

/**
 * Get all issues for a report
 */
exports.getIssues = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reportId = req.params.reportId;
    
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
    
    // Filter and sort issues if needed
    const severity = req.query.severity;
    const type = req.query.type;
    const fixStatus = req.query.fixed === 'true';
    
    let issues = report.issues;
    
    if (severity) {
      issues = issues.filter(issue => issue.severity === severity);
    }
    
    if (type) {
      issues = issues.filter(issue => issue.type === type);
    }
    
    if (req.query.hasOwnProperty('fixed')) {
      issues = issues.filter(issue => issue.fixImplemented === fixStatus);
    }
    
    return res.status(200).json({
      success: true,
      count: issues.length,
      data: issues
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific issue by ID
 */
exports.getIssue = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reportId = req.params.reportId;
    const issueId = req.params.issueId;
    
    // Find report and verify ownership
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
    
    // Find issue
    const issue = report.issues.id(issueId);
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Apply a fix for an issue
 */
exports.fixIssue = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reportId = req.params.reportId;
    const issueId = req.params.issueId;
    
    // Find report and verify ownership
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
    
    // Find issue
    const issue = report.issues.id(issueId);
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }
    
    // Check if issue is already fixed
    if (issue.fixImplemented) {
      return res.status(400).json({
        success: false,
        error: 'Issue is already fixed'
      });
    }
    
    // Simulate fix
    const fixDetails = {
      implementation: 'Automatic fix applied',
      gitCommitId: 'mock-commit-' + Date.now(),
      fixedAt: new Date(),
      previousValue: 'Previous value',
      newValue: 'New value'
    };
    
    // Update issue with fix details
    const updatedReport = await Report.findOneAndUpdate(
      { '_id': reportId, 'issues._id': issueId },
      {
        '$set': {
          'issues.$.fixImplemented': true,
          'issues.$.fixDetails': fixDetails
        }
      },
      { new: true }
    );
    
    // Update the fixed issue count in the summary
    await Report.findByIdAndUpdate(reportId, {
      $inc: { 'summary.fixedIssues': 1 }
    });
    
    return res.status(200).json({
      success: true,
      data: {
        message: 'Issue fixed successfully',
        issue: updatedReport.issues.id(issueId)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve fixes in bulk
 */
exports.approveFixesBulk = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reportId = req.params.reportId;
    const { issueIds } = req.body;
    
    if (!issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Issue IDs array is required'
      });
    }
    
    // Find report and verify ownership
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
    
    // Validate that all issues exist
    const validIssueIds = [];
    for (const issueId of issueIds) {
      const issue = report.issues.id(issueId);
      if (issue && !issue.fixImplemented) {
        validIssueIds.push(issueId);
      }
    }
    
    if (validIssueIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid unfixed issues found'
      });
    }
    
    // Simulate the bulk fix
    return res.status(200).json({
      success: true,
      data: {
        message: `Bulk fix operation started for ${validIssueIds.length} issues`,
        issueCount: validIssueIds.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ignore an issue
 */
exports.ignoreIssue = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reportId = req.params.reportId;
    const issueId = req.params.issueId;
    const { reason } = req.body;
    
    // Find report and verify ownership
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
    
    // Find issue
    const issue = report.issues.id(issueId);
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }
    
    // Update issue with ignored status
    await Report.findOneAndUpdate(
      { '_id': reportId, 'issues._id': issueId },
      {
        '$set': {
          'issues.$.ignored': true,
          'issues.$.ignoreReason': reason || 'Marked as ignored by user'
        }
      }
    );
    
    return res.status(200).json({
      success: true,
      data: {
        message: 'Issue marked as ignored'
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;