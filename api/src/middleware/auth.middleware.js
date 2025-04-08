/**
 * Authentication middleware
 */

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Verify JWT token
 */
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, process.env.JWT_ACCESS_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
      
      // Check if user exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(403).json({ message: 'User not found' });
      }
      
      // Attach user to request
      req.user = decoded;
      next();
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Verify admin role
 */
exports.verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin privileges required' });
  }
  next();
};

/**
 * Verify user is client or admin
 */
exports.verifyClientAccess = async (req, res, next) => {
  try {
    const clientId = req.params.id;
    
    // Admins can access any client
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check if user has access to this client
    const user = await User.findById(req.user.id);
    if (!user.clients.includes(clientId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};