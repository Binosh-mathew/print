const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Store = require('../models/Store');
const User = require('../models/User');

// GET /api/platform-stats
router.get('/', async (req, res) => {
  try {
    // Orders today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const dailyOrders = await Order.countDocuments({ createdAt: { $gte: startOfToday } });
    const monthlyOrders = await Order.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);
    const activeStores = await Store.countDocuments({ status: 'active' });
    const activeAdmins = await User.countDocuments({ role: 'admin' });

    // If you track storage, fetch it here; otherwise, use static values
    const storageUsed = 50;
    const totalStorage = 100;

    res.json({
      dailyOrders,
      monthlyOrders,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      activeStores,
      activeAdmins,
      storageUsed,
      totalStorage
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching platform stats', error });
  }
});

module.exports = router; 