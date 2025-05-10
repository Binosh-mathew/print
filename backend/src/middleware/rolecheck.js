const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
    next();
  };
  
  const isDeveloper = (req, res, next) => {
    if (req.user.role !== 'developer') {
      return res.status(403).json({ message: 'Access denied. Developer role required.' });
    }
    next();
  };
  
  const isUser = (req, res, next) => {
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Access denied. User role required.' });
    }
    next();
  };
  
  module.exports = {
    isAdmin,
    isDeveloper,
    isUser
  }; 
  