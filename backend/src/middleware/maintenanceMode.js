const MaintenanceMode = require('../models/maintenanceMode');

/**
 * Middleware to check if the system is in maintenance mode
 * If in maintenance mode, only developers can access the system
 */
const maintenanceCheck = async (req, res, next) => {
  try {
    // Skip maintenance check for maintenance mode API endpoints
    if (req.path.startsWith('/api/system/maintenance')) {
      return next();
    }

    // Skip maintenance check for authentication endpoints
    if (req.path.startsWith('/api/auth')) {
      return next();
    }
    
    // Skip maintenance check for platform stats and login activity during development
    // This is a temporary solution for development purposes
    if (process.env.NODE_ENV !== 'production' && 
        (req.path.startsWith('/api/platform-stats') || 
         req.path.startsWith('/api/login-activity'))) {
      return next();
    }

    const maintenanceStatus = await MaintenanceMode.getStatus();
    
    // If maintenance mode is not enabled, allow all requests
    if (!maintenanceStatus.enabled) {
      return next();
    }
    
    // If maintenance mode is enabled, only allow developers to access
    if (req.user && req.user.role === 'developer') {
      return next();
    }
    
    // Return maintenance mode message for all other users
    return res.status(503).json({
      status: 'error',
      message: maintenanceStatus.message || 'System is under maintenance',
      maintenanceMode: true,
      estimatedEndTime: maintenanceStatus.endTime
    });
  } catch (error) {
    console.error('Maintenance mode check error:', error);
    // In case of error, let the request proceed to avoid blocking the system
    next();
  }
};

module.exports = maintenanceCheck;
