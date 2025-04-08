/**
 * UserController.js
 * 
 * Manages user entities within the agency context, including role assignment,
 * permissions management, and invitation workflows.
 */

const { AgencyUser, Role, Agency, Client } = require('../../src/models');
const mongoose = require('mongoose');
const { ValidationError, NotFoundError, AuthorizationError } = require('../../utils/errors');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
  /**
   * Get all users for an agency
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUsers(req, res) {
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
      
      if (req.query.role) {
        filters.role = req.query.role;
      }
      
      // Handle search term
      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        filters.$or = [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex }
        ];
      }
      
      // Fetch users with pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      const users = await AgencyUser.find(filters)
        .select('-password -inviteToken -resetPasswordToken')
        .populate('roleCustom', 'name description')
        .populate('clients', 'name website')
        .sort({ firstName: 1, lastName: 1 })
        .skip(skip)
        .limit(limit)
        .lean();
      
      const totalUsers = await AgencyUser.countDocuments(filters);
      
      return res.status(200).json({
        success: true,
        data: users,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalUsers / limit),
          totalRecords: totalUsers
        }
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ success: false, message: error.message });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error retrieving users',
        error: error.message
      });
    }
  },
  
  /**
   * Get single user by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUser(req, res) {
    try {
      const { id } = req.params;
      const agencyId = req.agency._id;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ValidationError('Invalid user ID format');
      }
      
      // Find user and ensure they belong to the agency
      const user = await AgencyUser.findOne({
        _id: id,
        agency: agencyId
      })
        .select('-password -inviteToken -resetPasswordToken')
        .populate('roleCustom', 'name description')
        .populate('clients', 'name website')
        .lean();
      
      if (!user) {
        throw new NotFoundError('User not found');
      }
      
      return res.status(200).json({
        success: true,
        data: user
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
        message: 'Error retrieving user',
        error: error.message
      });
    }
  },
  
  /**
   * Create a new user or invite existing user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createUser(req, res) {
    try {
      const agencyId = req.agency._id;
      
      const {
        firstName,
        lastName,
        email,
        role,
        roleCustomId,
        clientIds,
        sendInvite = true
      } = req.body;
      
      // Validate required fields
      if (!firstName || !lastName || !email) {
        throw new ValidationError('First name, last name, and email are required');
      }
      
      // Check for valid role
      if (role && !['admin', 'manager', 'specialist', 'viewer', 'client'].includes(role)) {
        throw new ValidationError('Invalid role');
      }
      
      // Ensure agency exists
      const agency = await Agency.findById(agencyId);
      if (!agency) {
        throw new NotFoundError('Agency not found');
      }
      
      // Check if user already exists
      let existingUser = await AgencyUser.findOne({ email: email.toLowerCase() });
      
      if (existingUser) {
        // If user exists but is not part of this agency, handle as invite
        if (existingUser.agency.toString() !== agencyId.toString()) {
          throw new ValidationError('User already exists in another agency');
        }
        
        throw new ValidationError('User with this email already exists in your agency');
      }
      
      // Validate role custom ID if provided
      if (roleCustomId && !mongoose.Types.ObjectId.isValid(roleCustomId)) {
        throw new ValidationError('Invalid role custom ID format');
      }
      
      // Validate clients if provided
      let clients = [];
      if (clientIds && clientIds.length > 0) {
        // Validate client IDs
        for (const id of clientIds) {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ValidationError(`Invalid client ID format: ${id}`);
          }
        }
        
        // Check if clients belong to agency
        clients = await Client.find({
          _id: { $in: clientIds },
          agency: agencyId
        }).select('_id');
        
        if (clients.length !== clientIds.length) {
          throw new ValidationError('One or more clients do not belong to this agency');
        }
      }
      
      // Generate random password for new user
      const temporaryPassword = crypto.randomBytes(10).toString('hex');
      
      // Create new user
      const user = new AgencyUser({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: temporaryPassword, // Will be hashed by pre-save hook
        agency: agencyId,
        role: role || 'viewer',
        roleCustom: roleCustomId || null,
        status: sendInvite ? 'invited' : 'active',
        clients: clients.map(client => client._id),
        invitedBy: req.user._id,
        invitedAt: Date.now()
      });
      
      // Generate invite token if sending invite
      if (sendInvite) {
        // Create invitation token valid for 7 days
        const inviteToken = crypto.randomBytes(20).toString('hex');
        user.inviteToken = inviteToken;
        user.inviteTokenExpires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
      }
      
      await user.save();
      
      // Send invitation email (would implement email service in production)
      if (sendInvite) {
        // Example: emailService.sendInvitation(user, agency);
        console.log(`Invitation would be sent to ${email}`);
      }
      
      // Remove sensitive fields
      const userData = user.toObject();
      delete userData.password;
      delete userData.inviteToken;
      delete userData.inviteTokenExpires;
      delete userData.resetPasswordToken;
      delete userData.resetPasswordExpires;
      
      return res.status(201).json({
        success: true,
        data: userData,
        message: sendInvite ? 'User invited successfully' : 'User created successfully'
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
        message: 'Error creating user',
        error: error.message
      });
    }
  },
  
  /**
   * Update user by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const agencyId = req.agency._id;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ValidationError('Invalid user ID format');
      }
      
      const {
        firstName,
        lastName,
        role,
        roleCustomId,
        clientIds,
        status,
        permissions
      } = req.body;
      
      // Prepare update data
      const updateData = {};
      
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (role) {
        if (!['admin', 'manager', 'specialist', 'viewer', 'client'].includes(role)) {
          throw new ValidationError('Invalid role');
        }
        updateData.role = role;
      }
      
      // Handle role custom ID
      if (roleCustomId) {
        if (roleCustomId === 'null' || roleCustomId === '') {
          updateData.roleCustom = null;
        } else if (mongoose.Types.ObjectId.isValid(roleCustomId)) {
          // Validate custom role
          const roleExists = await Role.findOne({
            _id: roleCustomId,
            agency: agencyId
          });
          
          if (!roleExists) {
            throw new NotFoundError('Custom role not found');
          }
          
          updateData.roleCustom = roleCustomId;
        } else {
          throw new ValidationError('Invalid role custom ID format');
        }
      }
      
      // Handle client assignments
      if (clientIds) {
        // Validate client IDs
        for (const clientId of clientIds) {
          if (!mongoose.Types.ObjectId.isValid(clientId)) {
            throw new ValidationError(`Invalid client ID format: ${clientId}`);
          }
        }
        
        // Verify clients belong to agency
        const clientCount = await Client.countDocuments({
          _id: { $in: clientIds },
          agency: agencyId
        });
        
        if (clientCount !== clientIds.length) {
          throw new ValidationError('One or more clients do not belong to this agency');
        }
        
        updateData.clients = clientIds;
      }
      
      // Handle status update
      if (status) {
        if (!['active', 'inactive', 'invited', 'suspended'].includes(status)) {
          throw new ValidationError('Invalid status');
        }
        updateData.status = status;
      }
      
      // Handle permissions update
      if (permissions) {
        updateData.permissions = permissions;
      }
      
      // Find and update user
      const user = await AgencyUser.findOneAndUpdate(
        { _id: id, agency: agencyId },
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .select('-password -inviteToken -resetPasswordToken')
        .populate('roleCustom', 'name description')
        .populate('clients', 'name website');
      
      if (!user) {
        throw new NotFoundError('User not found');
      }
      
      return res.status(200).json({
        success: true,
        data: user,
        message: 'User updated successfully'
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
        message: 'Error updating user',
        error: error.message
      });
    }
  },
  
  /**
   * Delete user by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const agencyId = req.agency._id;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ValidationError('Invalid user ID format');
      }
      
      // Prevent deleting self
      if (id === req.user._id.toString()) {
        throw new ValidationError('You cannot delete your own account');
      }
      
      // Find and delete user
      const user = await AgencyUser.findOneAndDelete({
        _id: id,
        agency: agencyId
      });
      
      if (!user) {
        throw new NotFoundError('User not found');
      }
      
      return res.status(200).json({
        success: true,
        message: 'User deleted successfully'
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
        message: 'Error deleting user',
        error: error.message
      });
    }
  },
  
  /**
   * Resend invitation to user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async resendInvitation(req, res) {
    try {
      const { id } = req.params;
      const agencyId = req.agency._id;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ValidationError('Invalid user ID format');
      }
      
      // Find user
      const user = await AgencyUser.findOne({
        _id: id,
        agency: agencyId
      });
      
      if (!user) {
        throw new NotFoundError('User not found');
      }
      
      // Generate new invitation token
      const inviteToken = crypto.randomBytes(20).toString('hex');
      user.inviteToken = inviteToken;
      user.inviteTokenExpires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
      user.invitedAt = Date.now();
      user.status = 'invited';
      
      await user.save();
      
      // Get agency for branding
      const agency = await Agency.findById(agencyId);
      
      // Send invitation email (would implement email service in production)
      // Example: emailService.sendInvitation(user, agency);
      console.log(`Invitation would be resent to ${user.email}`);
      
      return res.status(200).json({
        success: true,
        message: 'Invitation resent successfully'
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
        message: 'Error resending invitation',
        error: error.message
      });
    }
  }
};
