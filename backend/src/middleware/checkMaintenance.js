const Store = require('../models/Store');

const checkMaintenance = async (req, res, next) => {
  try {
    // Skip maintenance check for admin and developer routes
    if (req.path.startsWith('/api/auth') || 
        req.path.startsWith('/api/developers') ||
        req.user?.role === 'admin' || 
        req.user?.role === 'developer') {
      return next();
    }

    // Get store ID from request (either from params or body)
    const storeId = req.params.storeId || req.body.storeId;
    
    if (!storeId) {
      return next();
    }

    const store = await Store.findById(storeId);
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    if (store.maintenance.isEnabled) {
      return res.status(503).json({
        message: store.maintenance.message,
        maintenance: {
          isEnabled: true,
          startTime: store.maintenance.startTime,
          endTime: store.maintenance.endTime,
          reason: store.maintenance.reason
        }
      });
    }

    next();
  } catch (error) {
    console.error('Maintenance check error:', error);
    next(error);
  }
};

module.exports = checkMaintenance; 