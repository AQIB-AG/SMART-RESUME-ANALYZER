import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT token
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please provide a valid token.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // MongoDB uses _id, so we need to map id to _id for consistency
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

/**
 * Middleware to check user roles
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

