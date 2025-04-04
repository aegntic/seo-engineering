/**
 * Authentication Middleware
 * 
 * Verifies user JWT tokens and attaches user information to the request.
 * Ensures that only authenticated users can access protected routes.
 */

const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('../utils/errors');
const { AgencyUser } = require('../src/models');

/**
 * Authenticate middleware
 * Verifies JWT token and attaches user data to request
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new AuthenticationError('No token provided');
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await AgencyUser.findById(decoded.id)
      .select('-password -inviteToken -resetPasswordToken')
      .populate('roleCustom', 'name permissions');
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    
    if (user.status !== 'active') {
      throw new AuthenticationError('Account is not active');
    }
    
    // Attach user to request
    req.user = user;
    
    // Attach agency to request
    req.agency = { _id: user.agency };
    
    // Update last login time
    await AgencyUser.findByIdAndUpdate(user._id, {
      lastLoginAt: Date.now()
    });
    
    // Continue to next middleware
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    if (error instanceof AuthenticationError) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};
