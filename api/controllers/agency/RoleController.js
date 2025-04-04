/**
 * RoleController.js
 * 
 * Manages custom role definitions and permission sets within the agency context.
 * Implements the interface between HTTP endpoints and role data operations.
 */

const { Role, AgencyUser, Agency } = require('../../src/models');
const mongoose = require('mongoose');
const { ValidationError, NotFoundError, ConflictError } = require('../../utils/errors');

module.exports = {
  /**
   * Get all roles for an agency
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getRoles(req, res) {
    try {
      const agencyId = req.params.agencyId || req.agency._id;
      
      if (!mongoose.Types.ObjectId.isValid(agencyId)) {
        throw new ValidationError('Invalid agency ID format');
      }
      
      // Fetch all roles for the agency
      const roles = await Role.find({ agency: agencyId })
        .sort({ isSystemDefined: -1, name: 1 })
        .lean();
      
      // For each role, get the user count
      const roleIds = roles.map(role => role._id);
      
      const userCounts = await AgencyUser.aggregate([
        { $match: { 
          $or: [
            { roleCustom: { $in: roleIds } },
            { 
              agency: mongoose.Types.ObjectId(agencyId),
              roleCustom: null
            }
          ]
        }},
        { $group: {
          _id: { 
            roleCustom: '$roleCustom',
            role: '$role'
          },
          count: { $sum: 1 }
        }}
      ]);
      
      // Map user counts to roles
      const rolesWithCounts = roles.map(role => {
        // Find users with this custom role
        const customRoleCount = userCounts.find(
          count => count._id.roleCustom && count._id.roleCustom.toString() === role._id.toString()
        );
        
        // Find users with system role matching name, but no custom role
        const systemRoleCount = userCounts.find(
          count => !count._id.roleCustom && count._id.role === role.name
        );
        
        return {
          ...role,
          userCount: (customRoleCount ? customRoleCount.count : 0) + 
                     (systemRoleCount ? systemRoleCount.count : 0)
        };
      });
      
      return res.status(200).json({
        success: true,
        data: rolesWithCounts
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ success: false, message: error.message });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error retrieving roles',
        error: error.message
      });
    }
  },
  
  /**
   * Get role by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getRole(req, res) {
    try {
      const { id } = req.params;
      const agencyId = req.agency._id;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ValidationError('Invalid role ID format');
      }
      
      // Find role
      const role = await Role.findOne({
        _id: id,
        agency: agencyId
      }).lean();
      
      if (!role) {
        throw new NotFoundError('Role not found');
      }
      
      // Get user count for this role
      const userCount = await AgencyUser.countDocuments({
        $or: [
          { roleCustom: id },
          { 
            agency: agencyId,
            role: role.name,
            roleCustom: null
          }
        ]
      });
      
      return res.status(200).json({
        success: true,
        data: {
          ...role,
          userCount
        }
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
        message: 'Error retrieving role',
        error: error.message
      });
    }
  },
  
  /**
   * Create new role
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createRole(req, res) {
    try {
      const agencyId = req.agency._id;
      
      const {
        name,
        description,
        permissions
      } = req.body;
      
      // Validate required fields
      if (!name) {
        throw new ValidationError('Role name is required');
      }
      
      // Ensure agency exists
      const agency = await Agency.findById(agencyId);
      if (!agency) {
        throw new NotFoundError('Agency not found');
      }
      
      // Check if role with same name already exists
      const existingRole = await Role.findOne({
        agency: agencyId,
        name: name
      });
      
      if (existingRole) {
        throw new ConflictError('Role with this name already exists');
      }
      
      // Create new role
      const role = new Role({
        name,
        agency: agencyId,
        description,
        permissions: permissions || {
          dashboard: { view: true, edit: false },
          reports: { view: true, edit: false, create: false },
          settings: { view: false, edit: false },
          clients: { view: true, edit: false, create: false, delete: false },
          users: { view: false, edit: false, create: false, delete: false },
          billing: { view: false, edit: false }
        },
        isSystemDefined: false,
        createdBy: req.user._id
      });
      
      await role.save();
      
      return res.status(201).json({
        success: true,
        data: role,
        message: 'Role created successfully'
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ success: false, message: error.message });
      }
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({ success: false, message: error.message });
      }
      
      if (error instanceof ConflictError) {
        return res.status(409).json({ success: false, message: error.message });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error creating role',
        error: error.message
      });
    }
  },
  
  /**
   * Update role by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const agencyId = req.agency._id;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ValidationError('Invalid role ID format');
      }
      
      const {
        name,
        description,
        permissions
      } = req.body;
      
      // Find the role
      const role = await Role.findOne({
        _id: id,
        agency: agencyId
      });
      
      if (!role) {
        throw new NotFoundError('Role not found');
      }
      
      // Prevent updating system-defined roles
      if (role.isSystemDefined) {
        throw new ValidationError('System-defined roles cannot be modified');
      }
      
      // Check if new name conflicts with existing role
      if (name && name !== role.name) {
        const existingRole = await Role.findOne({
          agency: agencyId,
          name: name,
          _id: { $ne: id }
        });
        
        if (existingRole) {
          throw new ConflictError('Role with this name already exists');
        }
        
        role.name = name;
      }
      
      // Update fields
      if (description !== undefined) {
        role.description = description;
      }
      
      if (permissions) {
        role.permissions = permissions;
      }
      
      role.updatedAt = Date.now();
      
      await role.save();
      
      return res.status(200).json({
        success: true,
        data: role,
        message: 'Role updated successfully'
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ success: false, message: error.message });
      }
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({ success: false, message: error.message });
      }
      
      if (error instanceof ConflictError) {
        return res.status(409).json({ success: false, message: error.message });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error updating role',
        error: error.message
      });
    }
  },
  
  /**
   * Delete role by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteRole(req, res) {
    try {
      const { id } = req.params;
      const agencyId = req.agency._id;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ValidationError('Invalid role ID format');
      }
      
      // Find the role
      const role = await Role.findOne({
        _id: id,
        agency: agencyId
      });
      
      if (!role) {
        throw new NotFoundError('Role not found');
      }
      
      // Prevent deleting system-defined roles
      if (role.isSystemDefined) {
        throw new ValidationError('System-defined roles cannot be deleted');
      }
      
      // Check if role is in use
      const usersWithRole = await AgencyUser.countDocuments({
        roleCustom: id
      });
      
      if (usersWithRole > 0) {
        throw new ValidationError(`Cannot delete role that is assigned to ${usersWithRole} users`);
      }
      
      // Delete the role
      await Role.deleteOne({ _id: id });
      
      return res.status(200).json({
        success: true,
        message: 'Role deleted successfully'
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
        message: 'Error deleting role',
        error: error.message
      });
    }
  },
  
  /**
   * Create default system roles for a new agency
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createDefaultRoles(req, res) {
    try {
      const agencyId = req.params.agencyId || req.agency._id;
      
      if (!mongoose.Types.ObjectId.isValid(agencyId)) {
        throw new ValidationError('Invalid agency ID format');
      }
      
      // Check if agency exists
      const agency = await Agency.findById(agencyId);
      if (!agency) {
        throw new NotFoundError('Agency not found');
      }
      
      // Check if default roles already exist
      const existingRolesCount = await Role.countDocuments({
        agency: agencyId,
        isSystemDefined: true
      });
      
      if (existingRolesCount > 0) {
        throw new ConflictError('Default roles already exist for this agency');
      }
      
      // Define default roles
      const defaultRoles = [
        {
          name: 'Admin',
          description: 'Full access to all features and clients',
          permissions: {
            dashboard: { view: true, edit: true },
            reports: { view: true, edit: true, create: true },
            settings: { view: true, edit: true },
            clients: { view: true, edit: true, create: true, delete: true },
            users: { view: true, edit: true, create: true, delete: true },
            billing: { view: true, edit: true }
          },
          isSystemDefined: true,
          createdBy: req.user._id,
          agency: agencyId
        },
        {
          name: 'Manager',
          description: 'Can manage assigned clients but cannot change billing or system settings',
          permissions: {
            dashboard: { view: true, edit: true },
            reports: { view: true, edit: true, create: true },
            settings: { view: true, edit: false },
            clients: { view: true, edit: true, create: true, delete: false },
            users: { view: true, edit: false, create: false, delete: false },
            billing: { view: true, edit: false }
          },
          isSystemDefined: true,
          createdBy: req.user._id,
          agency: agencyId
        },
        {
          name: 'SEO Specialist',
          description: 'Can view and edit SEO settings for assigned clients',
          permissions: {
            dashboard: { view: true, edit: false },
            reports: { view: true, edit: true, create: true },
            settings: { view: false, edit: false },
            clients: { view: true, edit: true, create: false, delete: false },
            users: { view: false, edit: false, create: false, delete: false },
            billing: { view: false, edit: false }
          },
          isSystemDefined: true,
          createdBy: req.user._id,
          agency: agencyId
        },
        {
          name: 'Report Viewer',
          description: 'Can only view reports for assigned clients',
          permissions: {
            dashboard: { view: true, edit: false },
            reports: { view: true, edit: false, create: false },
            settings: { view: false, edit: false },
            clients: { view: true, edit: false, create: false, delete: false },
            users: { view: false, edit: false, create: false, delete: false },
            billing: { view: false, edit: false }
          },
          isSystemDefined: true,
          createdBy: req.user._id,
          agency: agencyId
        },
        {
          name: 'Client',
          description: 'Client access with limited view of their own site',
          permissions: {
            dashboard: { view: true, edit: false },
            reports: { view: true, edit: false, create: false },
            settings: { view: false, edit: false },
            clients: { view: false, edit: false, create: false, delete: false },
            users: { view: false, edit: false, create: false, delete: false },
            billing: { view: false, edit: false }
          },
          isSystemDefined: true,
          createdBy: req.user._id,
          agency: agencyId
        }
      ];
      
      // Create all default roles
      await Role.insertMany(defaultRoles);
      
      return res.status(201).json({
        success: true,
        message: 'Default roles created successfully',
        data: defaultRoles
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ success: false, message: error.message });
      }
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({ success: false, message: error.message });
      }
      
      if (error instanceof ConflictError) {
        return res.status(409).json({ success: false, message: error.message });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error creating default roles',
        error: error.message
      });
    }
  }
};
