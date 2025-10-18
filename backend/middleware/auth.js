// JWT Authentication Middleware
// Verifies JWT tokens and extracts user information

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate JWT Token
const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: '24h' } // Token valid for 24 hours
  );
};

// Verify JWT Token Middleware
const verifyToken = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    console.log(`✅ Token verified for user: ${decoded.email}`);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Check if user owns the resource
const authorizeUser = (req, res, next) => {
  try {
    // Get userId from request (could be params or query)
    const requestedUserId = req.params.userId || req.query.userId;

    // If specific userId is being requested, verify it matches the token
    if (requestedUserId && requestedUserId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to access this resource',
        code: 'UNAUTHORIZED_ACCESS'
      });
    }

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Authorization failed'
    });
  }
};

module.exports = {
  generateToken,
  verifyToken,
  authorizeUser,
  JWT_SECRET
};
