/**
 * ClientController.js
 * 
 * Manages client entities within the agency context.
 * Implements the interface layer between HTTP requests and client data operations.
 */

const { Client, Agency } = require('../../src/models');
const mongoose = require('mongoose');
const { ValidationError, NotFoundError, AuthorizationError } = require('../../utils/errors');

module.exports = {
  /**
   * Get all clients for an agency
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getClients(req, res) {
    try {
      const agencyId = req.params.agencyId || req.agency._id;
      
      if (!mongoose.Types.ObjectId.isValid(agencyId)) {
        throw new ValidationError('Invalid agency ID format');
      }
      
      // Apply filters from query parameters
      const filters = { agency: agencyId };
      
      if (req.query.status) {
        filters.status = req.query.status;
      }
      
      // Handle search term
      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        filters.$or = [
          { name: searchRegex },
          { website: searchRegex },
          { 'contact.email': searchRegex }
        ];
      }
      
      // Apply sorting
      let sortOption = {};
      if (req.query.sortBy) {
        switch (req.query.sortBy) {
          case 'name':
            sortOption.name = 1;
            break;
          case 'score':
            sortOption.seoScore = -1;
            break;
          case 'issues':
            // Special case - sorting by issues count
            // Use aggregation in production
            sortOption.seoScore = 1; // Simplified for example
            break;
          default:
            sortOption.name = 1;
        }
      } else {
        sortOption.name = 1; // Default sort
      }
      
      // Fetch clients with pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      const clients = await Client.find(filters)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean();
      
      const totalClients = await Client.countDocuments(filters);
      
      return res.status(200).json({
        success: true,
        data: clients,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalClients / limit),
          totalRecords: totalClients
        }
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ success: false, message: error.message });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error retrieving clients',
        error: error.message
      });
    }
  },
  
  /**
   * Get single client by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getClient(req, res) {
    try {
      const { id } = req.params;
      const agencyId = req.agency._id;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ValidationError('Invalid client ID format');
      }
      
      // Find client and ensure it belongs to the agency
      const client = await Client.findOne({
        _id: id,
        agency: agencyId
      }).lean();
      
      if (!client) {
        throw new NotFoundError('Client not found');
      }
      
      return res.status(200).json({
        success: true,
        data: client
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
        message: 'Error retrieving client',
        error: error.message
      });
    }
  },
  
  /**
   * Create a new client
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createClient(req, res) {
    try {
      const agencyId = req.agency._id;
      
      const {
        name,
        website,
        status,
        contact,
        plan,
        notes,
        tags
      } = req.body;
      
      // Validate required fields
      if (!name || !website) {
        throw new ValidationError('Client name and website are required');
      }
      
      // Ensure agency exists
      const agency = await Agency.findById(agencyId);
      if (!agency) {
        throw new NotFoundError('Agency not found');
      }
      
      // Create new client
      const client = new Client({
        name,
        agency: agencyId,
        website,
        status: status || 'active',
        contact,
        plan: plan || 'basic',
        notes,
        tags,
        createdBy: req.user._id,
        assignedTo: [req.user._id]
      });
      
      await client.save();
      
      // Update agency client count
      await Agency.findByIdAndUpdate(
        agencyId,
        { $inc: { clientCount: 1 } }
      );
      
      return res.status(201).json({
        success: true,
        data: client,
        message: 'Client created successfully'
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
        message: 'Error creating client',
        error: error.message
      });
    }
  },
  
  /**
   * Update client by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateClient(req, res) {
    try {
      const { id } = req.params;
      const agencyId = req.agency._id;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ValidationError('Invalid client ID format');
      }
      
      const updateData = req.body;
      
      // Prevent updating critical fields directly
      delete updateData._id;
      delete updateData.agency;
      delete updateData.createdAt;
      delete updateData.createdBy;
      
      // Find the client and ensure it belongs to the agency
      const client = await Client.findOneAndUpdate(
        { _id: id, agency: agencyId },
        { $set: updateData },
        { new: true, runValidators: true }
      );
      
      if (!client) {
        throw new NotFoundError('Client not found');
      }
      
      return res.status(200).json({
        success: true,
        data: client,
        message: 'Client updated successfully'
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
        message: 'Error updating client',
        error: error.message
      });
    }
  },
  
  /**
   * Delete client by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteClient(req, res) {
    try {
      const { id } = req.params;
      const agencyId = req.agency._id;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ValidationError('Invalid client ID format');
      }
      
      // Find the client and ensure it belongs to the agency
      const client = await Client.findOneAndDelete({
        _id: id,
        agency: agencyId
      });
      
      if (!client) {
        throw new NotFoundError('Client not found');
      }
      
      // Update agency client count
      await Agency.findByIdAndUpdate(
        agencyId,
        { $inc: { clientCount: -1 } }
      );
      
      return res.status(200).json({
        success: true,
        message: 'Client deleted successfully'
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
        message: 'Error deleting client',
        error: error.message
      });
    }
  },
  
  /**
   * Run bulk action across multiple clients
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async bulkAction(req, res) {
    try {
      const { action, clientIds } = req.body;
      const agencyId = req.agency._id;
      
      if (!action || !clientIds || !Array.isArray(clientIds)) {
        throw new ValidationError('Action and clientIds array are required');
      }
      
      // Validate all client IDs
      for (const id of clientIds) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new ValidationError(`Invalid client ID format: ${id}`);
        }
      }
      
      // Verify all clients belong to the agency
      const clientCount = await Client.countDocuments({
        _id: { $in: clientIds },
        agency: agencyId
      });
      
      if (clientCount !== clientIds.length) {
        throw new AuthorizationError('One or more clients do not belong to this agency');
      }
      
      let result;
      
      // Process different bulk actions
      switch (action) {
        case 'scan':
          // Trigger scans for all clients
          // In production, this would call a scanning service
          result = { message: `Scanning initiated for ${clientCount} clients` };
          break;
          
        case 'archive':
          // Archive clients
          await Client.updateMany(
            { _id: { $in: clientIds }, agency: agencyId },
            { $set: { status: 'archived' } }
          );
          result = { message: `${clientCount} clients archived successfully` };
          break;
          
        case 'activate':
          // Activate clients
          await Client.updateMany(
            { _id: { $in: clientIds }, agency: agencyId },
            { $set: { status: 'active' } }
          );
          result = { message: `${clientCount} clients activated successfully` };
          break;
          
        case 'generate_reports':
          // Generate reports for clients
          // In production, this would call a reporting service
          result = { message: `Report generation initiated for ${clientCount} clients` };
          break;
          
        default:
          throw new ValidationError(`Unsupported action: ${action}`);
      }
      
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ success: false, message: error.message });
      }
      
      if (error instanceof AuthorizationError) {
        return res.status(403).json({ success: false, message: error.message });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error processing bulk action',
        error: error.message
      });
    }
  }
};
