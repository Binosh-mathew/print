/**
 * Middleware to check if the authenticated user has admin role
 * This middleware should be used after the auth middleware
 */
const isAdmin = (req, res, next) => {
  try {
    // Check if user exists and has role property
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin' && req.user.role !== 'developer') {
      return res.status(403).json({ 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    // If user is admin or developer, proceed
    next();
  } catch (error) {
    console.error('isAdmin middleware error:', error);
    res.status(500).json({ message: 'Server error in authorization check' });
  }
};

module.exports = isAdmin;
