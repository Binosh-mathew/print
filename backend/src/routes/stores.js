const express = require('express');
const Store = require('../models/Store');

const router = express.Router();

// Create a new store
router.post('/', async (req, res) => {
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

module.exports = router; 