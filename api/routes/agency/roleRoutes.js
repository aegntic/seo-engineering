/**
 * Role Routes
 * 
 * Defines API endpoints for role and permission management within an agency.
 * Maps HTTP requests to controller methods.
 */

const express = require('express');
const router = express.Router();
const { RoleController } = require('../../controllers/agency');
const { authenticate, authorizeAgency, validateSchema } = require('../../middleware');
const { roleSchema } = require('../../validation/roleSchemas');

/**
 * @route   GET /api/agency/roles
 * @desc    Get all roles for agency
 * @access  Private (Agency users with user view permission)
 */
router.get(
  '/',
  authenticate,
  authorizeAgency('users', 'view'),
  RoleController.getRoles
);

/**
 * @route   GET /api/agency/roles/:id
 * @desc    Get role by ID
 * @access  Private (Agency users with user view permission)
 */
router.get(
  '/:id',
  authenticate,
  authorizeAgency('users', 'view'),
  RoleController.getRole
);

/**
 * @route   POST /api/agency/roles
 * @desc    Create new role
 * @access  Private (Agency users with user create permission)
 */
router.post(
  '/',
  authenticate,
  validateSchema(roleSchema.create),
  authorizeAgency('users', 'create'),
  RoleController.createRole
);

/**
 * @route   PUT /api/agency/roles/:id
 * @desc    Update role
 * @access  Private (Agency users with user edit permission)
 */
router.put(
  '/:id',
  authenticate,
  validateSchema(roleSchema.update),
  authorizeAgency('users', 'edit'),
  RoleController.updateRole
);

/**
 * @route   DELETE /api/agency/roles/:id
 * @desc    Delete role
 * @access  Private (Agency users with user delete permission)
 */
router.delete(
  '/:id',
  authenticate,
  authorizeAgency('users', 'delete'),
  RoleController.deleteRole
);

/**
 * @route   POST /api/agency/roles/default/:agencyId
 * @desc    Create default system roles for a new agency
 * @access  Private (Admin)
 */
router.post(
  '/default/:agencyId',
  authenticate,
  authorizeAgency('agencies', 'edit'),
  RoleController.createDefaultRoles
);

module.exports = router;
