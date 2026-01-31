const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/errors');

const authenticate = (req, res, next) => {
  try {
    // 1. Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError('Authentication required. Please login.', 401);
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new ApiError('Authentication token missing.', 401);
    }
    
    // 2. Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 3. Attach user to request
      req.user = decoded; // Contains { id, email, role }
      next();
      
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new ApiError('Session expired. Please login again.', 401);
      }
      throw new ApiError('Invalid token. Please login.', 401);
    }
  } catch (error) {
    next(error);
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure user is authenticated first
    if (!req.user) {
      return next(new ApiError('User context missing. Use authenticate first.', 500));
    }
    
    // Check role
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError('You do not have permission to perform this action', 403));
    }
    
    next();
  };
};

module.exports = { authenticate, authorize };
