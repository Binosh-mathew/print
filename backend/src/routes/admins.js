const express = require('express');
const router = express.Router();
const Store = require('../models/Store');
const bcrypt = require('bcryptjs');

// POST /api/admins
router.post('/', async (req, res) => {
  const { name, email, password, storeName, storeLocation } = req.body;
  try {
    // Check if an admin with this email already exists in any store
    const existingStore = await Store.findOne({ 'admin.email': email });
    if (existingStore) {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new store with embedded admin
    const store = new Store({
      name: storeName,
      location: storeLocation,
      admin: {
        username: name,
        email,
        password: hashedPassword,
        createdAt: new Date()
      }
    });
    await store.save();
    res.status(201).json(store);
  } catch (error) {
    console.error('Error creating admin/store:', error);
    res.status(500).json({ message: 'Error creating admin/store', error });
  }
});

module.exports = router;
