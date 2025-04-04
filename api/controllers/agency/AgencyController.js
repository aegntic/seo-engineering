/**
 * AgencyController.js
 * 
 * Handles CRUD operations and business logic for agency entities.
 * Implements the domain boundary between HTTP requests and agency data operations.
 */

const { Agency } = require('../../src/models');
const mongoose = require('mongoose');
const { ValidationError, NotFoundError } = require('../../utils/errors');

module.exports = {
  /**
   * Retrieve agency by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAgency(req, res) {
    try {
      const agencyId = req.params.id;
      
      if (!mongoose.Types.ObjectId.isValid(agencyId)) {
        throw new ValidationError('Invalid agency ID format');
      }
      
      const agency = await Agency.findById(agencyId);
      
      if (!agency) {
        throw new NotFoundError('Agency not found');
      }
      
      return res.status(200).json({
        success: true,
        data: agency
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ success: false, message: error.message });
      }
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({ success: false, message: error.message });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error retrieving agency',
        error: error.message
      });
    }
  },
  
  /**
   * Create new agency
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createAgency(req, res) {
    try {
      const {
        name,
        slug,
        website,
        email,
        phone,
        address,
        plan
      } = req.body;
      
      // Validate required fields
      if (!name || !email) {
        throw new ValidationError('Agency name and email are required');
      }
      
      // Check if agency with same email already exists
      const existingAgency = await Agency.findOne({ email });
      if (existingAgency) {
        throw new ValidationError('Agency with this email already exists');
      }
      
      // Create new agency
      const agency = new Agency({
        name,
        slug,
        website,
        email,
        phone,
        address,
        plan: plan || 'basic'
      });
      
      await agency.save();
      
      return res.status(201).json({
        success: true,
        data: agency,
        message: 'Agency created successfully'
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ success: false, message: error.message });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error creating agency',
        error: error.message
      });
    }
  },
  
  /**
   * Update agency by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateAgency(req, res) {
    try {
      const agencyId = req.params.id;
      
      if (!mongoose.Types.ObjectId.isValid(agencyId)) {
        throw new ValidationError('Invalid agency ID format');
      }
      
      const updateData = req.body;
      
      // Prevent updating critical fields directly
      delete updateData._id;
      delete updateData.createdAt;
      
      // Find and update agency
      const agency = await Agency.findByIdAndUpdate(
        agencyId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      
      if (!agency) {
        throw new NotFoundError('Agency not found');
      }
      
      return res.status(200).json({
        success: true,
        data: agency,
        message: 'Agency updated successfully'
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ success: false, message: error.message });
      }
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({ success: false, message: error.message });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error updating agency',
        error: error.message
      });
    }
  },
  
  /**
   * Update agency white label settings
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateWhiteLabelSettings(req, res) {
    try {
      const agencyId = req.params.id;
      
      if (!mongoose.Types.ObjectId.isValid(agencyId)) {
        throw new ValidationError('Invalid agency ID format');
      }
      
      const {
        enabled,
        brandName,
        logoUrl,
        faviconUrl,
        primaryColor,
        accentColor,
        customDomain,
        customEmailEnabled,
        customEmail,
        emailFooter,
        hideSeoBranding
      } = req.body;
      
      // Find and update agency white label settings
      const agency = await Agency.findByIdAndUpdate(
        agencyId,
        {
          $set: {
            'whiteLabelSettings.enabled': enabled !== undefined ? enabled : true,
            'whiteLabelSettings.brandName': brandName,
            'whiteLabelSettings.logoUrl': logoUrl,
            'whiteLabelSettings.faviconUrl': faviconUrl,
            'whiteLabelSettings.primaryColor': primaryColor,
            'whiteLabelSettings.accentColor': accentColor,
            'whiteLabelSettings.customDomain': customDomain,
            'whiteLabelSettings.customEmailEnabled': customEmailEnabled,
            'whiteLabelSettings.customEmail': customEmail,
            'whiteLabelSettings.emailFooter': emailFooter,
            'whiteLabelSettings.hideSeoBranding': hideSeoBranding !== undefined ? hideSeoBranding : true
          }
        },
        { new: true, runValidators: true }
      );
      
      if (!agency) {
        throw new NotFoundError('Agency not found');
      }
      
      return res.status(200).json({
        success: true,
        data: agency.whiteLabelSettings,
        message: 'White label settings updated successfully'
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ success: false, message: error.message });
      }
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({ success: false, message: error.message });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error updating white label settings',
        error: error.message
      });
    }
  },
  
  /**
   * Get agency dashboard metrics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAgencyMetrics(req, res) {
    try {
      const agencyId = req.params.id;
      
      if (!mongoose.Types.ObjectId.isValid(agencyId)) {
        throw new ValidationError('Invalid agency ID format');
      }
      
      // Find agency
      const agency = await Agency.findById(agencyId);
      
      if (!agency) {
        throw new NotFoundError('Agency not found');
      }
      
      // Get metrics from related models
      // Simplified for example - in production, would query Client and other models
      
      const metrics = {
        totalClients: agency.clientCount || 0,
        activeProjects: Math.floor(agency.clientCount * 0.8) || 0, // Simplified calculation
        overallScore: 87, // Example value
        clientSatisfaction: 92, // Example value
        revenueGrowth: 23, // Example value
        issueResolution: 89 // Example value
      };
      
      return res.status(200).json({
        success: true,
        data: metrics
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ success: false, message: error.message });
      }
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({ success: false, message: error.message });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error retrieving agency metrics',
        error: error.message
      });
    }
  }
};
