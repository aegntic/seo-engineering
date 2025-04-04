/**
 * Issue Controller
 * Handles SEO issue management and fixes
 */

const { Client, Report } = require('../models');
const axios = require('axios');

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
    
    // Trigger fix implementation in n8n
    const n8nApiUrl = process.env.N8N_API_URL;
    const n8nApiKey = process.env.N8N_API_KEY;
    
    if (!n8nApiUrl || !n8nApiKey) {
      return res.status(500).json({
        success: false,
        error: 'Fix implementation service configuration error'
      });
    }
    
    try {
      // Call n8n workflow to implement the fix
      const response = await axios.post(`${n8nApiUrl}/webhook/implement-fix`, {
        clientId: report.client._id,
        websiteUrl: report.client.websiteUrl,
        reportId,
        issueId,
        issueType: issue.type,
        url: issue.url
      }, {
        headers: {
          'X-N8N-API-KEY': n8nApiKey
        }
      });
      
      // Get the fix details from n8n response
      const fixDetails = response.data;
      
      // Update issue with fix details
      const updatedReport = await Report.findOneAndUpdate(
        { '_id': reportId, 'issues._id': issueId },
        {
          '$set': {
            'issues.$.fixImplemented': true,
            'issues.$.fixDetails': {
              implementation: fixDetails.implementation || 'Automatic fix applied',
              gitCommitId: fixDetails.gitCommitId,
              fixedAt: new Date(),
              previousValue: fixDetails.previousValue,
              newValue: fixDetails.newValue
            }
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
    } catch (apiError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to implement fix',
        details: apiError.response?.data || apiError.message
      });
    }
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
    
    // Trigger bulk fix implementation in n8n
    const n8nApiUrl = process.env.N8N_API_URL;
    const n8nApiKey = process.env.N8N_API_KEY;
    
    if (!n8nApiUrl || !n8nApiKey) {
      return res.status(500).json({
        success: false,
        error: 'Fix implementation service configuration error'
      });
    }
    
    try {
      // Call n8n workflow to implement bulk fixes
      await axios.post(`${n8nApiUrl}/webhook/implement-fixes-bulk`, {
        clientId: report.client._id,
        websiteUrl: report.client.websiteUrl,
        reportId,
        issueIds: validIssueIds
      }, {
        headers: {
          'X-N8N-API-KEY': n8nApiKey
        }
      });
      
      return res.status(200).json({
        success: true,
        data: {
          message: `Bulk fix operation started for ${validIssueIds.length} issues`,
          issueCount: validIssueIds.length
        }
      });
    } catch (apiError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to implement bulk fixes',
        details: apiError.response?.data || apiError.message
      });
    }
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