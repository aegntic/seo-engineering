/**
 * Agency Authorization Middleware
 * 
 * Verifies that the user has appropriate permissions for the requested action
 * within their agency context. Controls access based on role and permission settings.
 */

const { AuthorizationError } = require('../utils/errors');

/**
 * Authorize agency middleware
 * Verifies user has permission to access a resource or perform an action
 * 
 * @param {String} resource - The resource category (dashboard, reports, clients, etc.)
 * @param {String} action - The action type (view, edit, create, delete)
 * @returns {Function} Express middleware function
 */
module.exports = (resource, action) => {
  return async (req, res, next) => {
    try {
      // Skip authorization checks for API tests and development if needed
      if (process.env.NODE_ENV === 'test' && process.env.SKIP_AUTH === 'true') {
        return next();
      }
      
      const user = req.user;
      
      if (!user) {
        throw new AuthorizationError('User not authenticated');
      }
      
      // Admin role has access to everything
      if (user.role === 'admin') {
        return next();
      }
      
      // Check permissions based on custom role if present
      if (user.roleCustom) {
        const { permissions } = user.roleCustom;
        
        // Validate that the resource and action exist
        if (!permissions[resource] || permissions[resource][action] === undefined) {
          throw new AuthorizationError(`Invalid resource or action: ${resource}.${action}`);
        }
        
        // Check if user has permission for the action
        if (permissions[resource][action]) {
          return next();
        }
      } else {
        // Default permissions based on system role
        const defaultPermissions = getDefaultPermissions(user.role);
        
        // Validate that the resource and action exist
        if (!defaultPermissions[resource] || defaultPermissions[resource][action] === undefined) {
          throw new AuthorizationError(`Invalid resource or action: ${resource}.${action}`);
        }
        
        // Check if user has permission for the action
        if (defaultPermissions[resource][action]) {
          return next();
        }
      }
      
      throw new AuthorizationError(`You do not have permission to ${action} ${resource}`);
    } catch (error) {
      if (error instanceof AuthorizationError) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Authorization error',
        error: error.message
      });
    }
  };
};

/**
 * Get default permissions for a system role
 * @param {String} role - The system role name
 * @returns {Object} Permission object
 */
function getDefaultPermissions(role) {
  const permissions = {
    // Admin role (full access to everything)
    admin: {
      dashboard: { view: true, edit: true },
      reports: { view: true, edit: true, create: true },
      settings: { view: true, edit: true },
      clients: { view: true, edit: true, create: true, delete: true },
      users: { view: true, edit: true, create: true, delete: true },
      billing: { view: true, edit: true },
      agencies: { view: true, edit: true, create: true, delete: true }
    },
    
    // Manager role (can manage clients but not system settings)
    manager: {
      dashboard: { view: true, edit: true },
      reports: { view: true, edit: true, create: true },
      settings: { view: true, edit: false },
      clients: { view: true, edit: true, create: true, delete: false },
      users: { view: true, edit: false, create: false, delete: false },
      billing: { view: true, edit: false },
      agencies: { view: false, edit: false, create: false, delete: false }
    },
    
    // Specialist role (can work on assigned clients)
    specialist: {
      dashboard: { view: true, edit: false },
      reports: { view: true, edit: true, create: true },
      settings: { view: false, edit: false },
      clients: { view: true, edit: true, create: false, delete: false },
      users: { view: false, edit: false, create: false, delete: false },
      billing: { view: false, edit: false },
      agencies: { view: false, edit: false, create: false, delete: false }
    },
    
    // Viewer role (read-only access)
    viewer: {
      dashboard: { view: true, edit: false },
      reports: { view: true, edit: false, create: false },
      settings: { view: false, edit: false },
      clients: { view: true, edit: false, create: false, delete: false },
      users: { view: false, edit: false, create: false, delete: false },
      billing: { view: false, edit: false },
      agencies: { view: false, edit: false, create: false, delete: false }
    },
    
    // Client role (limited access to own data)
    client: {
      dashboard: { view: true, edit: false },
      reports: { view: true, edit: false, create: false },
      settings: { view: false, edit: false },
      clients: { view: false, edit: false, create: false, delete: false },
      users: { view: false, edit: false, create: false, delete: false },
      billing: { view: false, edit: false },
      agencies: { view: false, edit: false, create: false, delete: false }
    }
  };
  
  return permissions[role] || permissions.viewer;
}
