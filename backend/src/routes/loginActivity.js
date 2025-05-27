import {Router} from 'express';
import {LoginActivity} from '../models/LoginActivity.js';

const router = Router();

// GET /api/login-activity
router.get('/', async (req, res) => {
  try {
    // Fetch the latest 50 login activities, most recent first
    const activity = await LoginActivity.find().sort({ timestamp: -1 }).limit(50);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching login activity', error });
  }
});

export default router;