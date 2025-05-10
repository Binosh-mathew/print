const express = require('express');
const Store = require('../models/Store');
const MaintenanceLog = require('../models/MaintenanceLog');
const auth = require('../middleware/auth');
const checkMaintenance = require('../middleware/checkMaintenance');

const router = express.Router();

// Create a new store
router.post('/', auth, async (req, res) => {
  try {
    const store = new Store(req.body);
    await store.save();
    res.status(201).json(store);
  } catch (error) {
    res.status(500).json({ message: 'Error creating store', error });
  }
});

// Get all stores
router.get('/', async (req, res) => {
  try {
    const stores = await Store.find();
    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stores', error });
  }
});

// Get a specific store
router.get('/:id', async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: 'Store not found' });
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching store', error });
  }
});

// Update a store
router.put('/:id', async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!store) return res.status(404).json({ message: 'Store not found' });
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: 'Error updating store', error });
  }
});

// Delete a store
router.delete('/:id', async (req, res) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);
    if (!store) return res.status(404).json({ message: 'Store not found' });
    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting store', error });
  }
});

// Enable maintenance mode
router.post('/:id/maintenance/enable', auth, async (req, res) => {
  try {
    const { message, startTime, endTime, reason } = req.body;
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    store.maintenance = {
      isEnabled: true,
      message: message || store.maintenance.message,
      startTime: startTime || new Date(),
      endTime,
      reason
    };
    store.status = 'maintenance';
    await store.save();
    // Log maintenance event
    await MaintenanceLog.create({
      store: store._id,
      isEnabled: true,
      message: store.maintenance.message,
      startTime: store.maintenance.startTime,
      endTime: store.maintenance.endTime,
      reason: store.maintenance.reason,
      changedBy: req.user.id,
      changedAt: new Date()
    });
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: 'Error enabling maintenance mode', error });
  }
});

// Disable maintenance mode
router.post('/:id/maintenance/disable', auth, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    // Log maintenance event BEFORE disabling
    await MaintenanceLog.create({
      store: store._id,
      isEnabled: false,
      message: store.maintenance.message,
      startTime: store.maintenance.startTime,
      endTime: new Date(), // Set endTime to now
      reason: store.maintenance.reason,
      changedBy: req.user.id,
      changedAt: new Date()
    });
    store.maintenance = {
      isEnabled: false,
      message: store.maintenance.message,
      startTime: null,
      endTime: null,
      reason: null
    };
    store.status = 'active';
    await store.save();
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: 'Error disabling maintenance mode', error });
  }
});

// Get maintenance logs for a store
router.get('/:id/maintenance/logs', auth, async (req, res) => {
  try {
    const logs = await MaintenanceLog.find({ store: req.params.id })
      .populate('changedBy', 'username email')
      .sort({ changedAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching maintenance logs', error });
  }
});

module.exports = router; 