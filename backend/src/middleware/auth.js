const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    // First try to authenticate with JWT token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        return next();
      } catch (tokenError) {
        console.log('Token verification failed, trying custom headers');
      }
    }
    
    // If JWT authentication fails, try custom headers
    const userId = req.header('X-User-ID');
    const userRole = req.header('X-User-Role');
    
    if (userId && userRole) {
      req.user = { id: userId, role: userRole };
      return next();
    }
    
    // If both authentication methods fail
    return res.status(401).json({ message: 'Authentication failed, access denied' });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication error' });
  }
};

module.exports = auth;