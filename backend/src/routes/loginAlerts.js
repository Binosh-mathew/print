import {Router} from 'express';
import {FailedLogin} from '../models/FailedLogin.js';
import {auth} from '../middleware/auth.js';
import {isAdmin} from '../middleware/isAdmin.js';

const router = Router();

// Get all unresolved failed login alerts
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    // Find all unresolved alerts with at least 3 attempts
    const alerts = await FailedLogin.find({
      isResolved: false,
      attemptCount: { $gte: 3 }
    }).sort({ lastAttempt: -1 });
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching failed login alerts', 
      error: error.message 
    });
  }
});

// Mark an alert as resolved
router.put('/:id/resolve', auth, isAdmin, async (req, res) => {
  try {
    const alert = await FailedLogin.findByIdAndUpdate(
      req.params.id, 
      { isResolved: true },
      { new: true }
    );
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    res.json({ 
      message: 'Alert marked as resolved',
      alert 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error resolving alert', 
      error: error.message 
    });
  }
});

// Clear all resolved alerts
router.delete('/clear-resolved', auth, isAdmin, async (req, res) => {
  try {
    const result = await FailedLogin.deleteMany({ isResolved: true });
    
    res.json({
      message: `${result.deletedCount} resolved alerts cleared`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error clearing resolved alerts', 
      error: error.message 
    });
  }
});

export default router;
