const express = require('express');
const { isDeveloper } = require('../middleware/roleCheck');
const auth = require('../middleware/auth');
const os = require('os');
const mongoose = require('mongoose');

const router = express.Router();

// Get system status (developer only)
router.get('/status', auth, isDeveloper, async (req, res) => {
  try {
    const status = {
      uptime: process.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem()
      },
      cpu: {
        cores: os.cpus().length,
        load: os.loadavg()
      },
      platform: os.platform(),
      hostname: os.hostname(),
      mongodb: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        collections: Object.keys(mongoose.connection.collections).length
      }
    };
    res.json(status);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching system status', error });
  }
});

// Get database stats (developer only)
router.get('/database-stats', auth, isDeveloper, async (req, res) => {
  try {
    const stats = await mongoose.connection.db.stats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching database stats', error });
  }
});

// Get system logs (developer only)
router.get('/logs', auth, isDeveloper, async (req, res) => {
  try {
    // In a real application, you would implement proper log management
    // This is just a placeholder that returns recent console logs
    const logs = {
      message: 'Log retrieval not implemented. Implement proper log management system.',
      timestamp: new Date()
    };
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs', error });
  }
});

module.exports = router; 