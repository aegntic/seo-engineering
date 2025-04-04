/**
 * Scan Controller
 * Handles SEO scan operations and scheduling
 */

const { Client, Report } = require('../models');
const axios = require('axios');

/**
 * Start a new SEO scan for a client website
 */
exports.startScan = async (req, res, next) => {
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
    
    // Create a new report for this scan
    const report = await Report.create({
      client: clientId,
      status: 'in_progress',
      pagesScanned: 0,
      crawlDuration: 0
    });
    
    // Trigger the n8n workflow to start the scan
    // In production, use a queue system for better reliability
    const n8nApiUrl = process.env.N8N_API_URL;
    const n8nApiKey = process.env.N8N_API_KEY;
    
    if (!n8nApiUrl || !n8nApiKey) {
      return res.status(500).json({
        success: false,
        error: 'Scan service configuration error'
      });
    }
    
    try {
      // Trigger the n8n workflow
      await axios.post(`${n8nApiUrl}/webhook/seo-scan`, {
        clientId,
        reportId: report._id,
        websiteUrl: client.websiteUrl,
        crawlSettings: client.crawlSettings
      }, {
        headers: {
          'X-N8N-API-KEY': n8nApiKey
        }
      });
      
      // Update client with scan status
      await Client.findByIdAndUpdate(clientId, {
        'crawlSettings.lastCrawled': new Date()
      });
      
      return res.status(200).json({
        success: true,
        data: {
          reportId: report._id,
          status: 'scan_initiated',
          message: 'SEO scan has been initiated'
        }
      });
    } catch (apiError) {
      // Update report status to failed
      await Report.findByIdAndUpdate(report._id, {
        status: 'failed'
      });
      
      return res.status(500).json({
        success: false,
        error: 'Failed to start scan workflow'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get scan status for a specific report
 */
exports.getScanStatus = async (req, res, next) => {
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
    
    return res.status(200).json({
      success: true,
      data: {
        reportId: report._id,
        status: report.status,
        pagesScanned: report.pagesScanned,
        crawlDuration: report.crawlDuration,
        crawlDate: report.crawlDate,
        seoScore: report.seoScore
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get scan history for a client
 */
exports.getScanHistory = async (req, res, next) => {
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
    
    // Get scan history
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    
    const reports = await Report.find({ client: clientId })
      .sort({ crawlDate: -1 })
      .skip(skip)
      .limit(limit)
      .select('_id status crawlDate seoScore pagesScanned crawlDuration summary');
    
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
 * Cancel an in-progress scan
 */
exports.cancelScan = async (req, res, next) => {
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
    
    // Verify that scan is in progress
    if (report.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        error: 'Scan is not in progress and cannot be canceled'
      });
    }
    
    // Cancel the scan in n8n
    const n8nApiUrl = process.env.N8N_API_URL;
    const n8nApiKey = process.env.N8N_API_KEY;
    
    if (n8nApiUrl && n8nApiKey) {
      try {
        await axios.post(`${n8nApiUrl}/webhook/cancel-scan`, {
          reportId: report._id
        }, {
          headers: {
            'X-N8N-API-KEY': n8nApiKey
          }
        });
      } catch (apiError) {
        console.error('Failed to cancel scan in n8n:', apiError);
      }
    }
    
    // Update report status
    await Report.findByIdAndUpdate(reportId, {
      status: 'failed',
      summary: {
        ...report.summary,
        message: 'Scan canceled by user'
      }
    });
    
    return res.status(200).json({
      success: true,
      data: {
        message: 'Scan canceled successfully'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Schedule a recurring scan
 */
exports.scheduleScan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const clientId = req.params.clientId;
    const { frequency } = req.body;
    
    if (!frequency || !['daily', 'weekly', 'monthly'].includes(frequency)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid frequency. Must be daily, weekly, or monthly'
      });
    }
    
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
    
    // Update client's crawl frequency
    await Client.findByIdAndUpdate(clientId, {
      'crawlSettings.crawlFrequency': frequency
    });
    
    // Schedule in n8n (or your scheduling system)
    const n8nApiUrl = process.env.N8N_API_URL;
    const n8nApiKey = process.env.N8N_API_KEY;
    
    if (n8nApiUrl && n8nApiKey) {
      try {
        await axios.post(`${n8nApiUrl}/webhook/schedule-scan`, {
          clientId,
          frequency
        }, {
          headers: {
            'X-N8N-API-KEY': n8nApiKey
          }
        });
      } catch (apiError) {
        console.error('Failed to schedule scan in n8n:', apiError);
        return res.status(500).json({
          success: false,
          error: 'Scan scheduled in database but failed to set up automated schedule'
        });
      }
    }
    
    return res.status(200).json({
      success: true,
      data: {
        message: `Scan scheduled to run ${frequency}`
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;