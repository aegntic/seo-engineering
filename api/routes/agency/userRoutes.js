/**
 * User Routes
 * 
 * Defines API endpoints for user management within an agency.
 * Maps HTTP requests to controller methods.
 */

const express = require('express');
const router = express.Router();
const { UserController } = require('../../controllers/agency');
const { authenticate, authorizeAgency, validateSchema } = require('../../middleware');
const { userSchema } = require('../../validation/userSchemas');

/**
 * @route   GET /api/agency/users
 * @desc    Get all users for agency
 * @access  Private (Agency users with user view permission)
 */
router.get(
  '/',
  authenticate,
  authorizeAgency('users', 'view'),
  UserController.getUsers
);

/**
 * @route   GET /api/agency/users/:id
 * @desc    Get user by ID
 * @access  Private (Agency users with user view permission)
 */
router.get(
  '/:id',
  authenticate,
  authorizeAgency('users', 'view'),
  UserController.getUser
);

/**
 * @route   POST /api/agency/users
 * @desc    Create new user
 * @access  Private (Agency users with user create permission)
 */
router.post(
  '/',
  authenticate,
  validateSchema(userSchema.create),
  authorizeAgency('users', 'create'),
  UserController.createUser
);

/**
 * @route   PUT /api/agency/users/:id
 * @desc    Update user
 * @access  Private (Agency users with user edit permission)
 */
router.put(
  '/:id',
  authenticate,
  validateSchema(userSchema.update),
  authorizeAgency('users', 'edit'),
  UserController.updateUser
);

/**
 * @route   DELETE /api/agency/users/:id
 * @desc    Delete user
 * @access  Private (Agency users with user delete permission)
 */
router.delete(
  '/:id',
  authenticate,
  authorizeAgency('users', 'delete'),
  UserController.deleteUser
);

/**
 * @route   POST /api/agency/users/:id/resend-invitation
 * @desc    Resend invitation to user
 * @access  Private (Agency users with user edit permission)
 */
router.post(
  '/:id/resend-invitation',
  authenticate,
  authorizeAgency('users', 'edit'),
  UserController.resendInvitation
);

module.exports = router;
