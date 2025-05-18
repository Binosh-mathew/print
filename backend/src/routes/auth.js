const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Developer = require('../models/Developer');
const Store = require('../models/Store');
const LoginActivity = require('../models/LoginActivity');

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    console.log('Received registration data:', req.body);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ username, email, password });
    await user.save();
    console.log('User registered:', user);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error });
  }
});

// Login a user, admin, or developer
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    let user;
    if (role === 'developer') {
      user = await Developer.findOne({ email });
    } else if (role === 'admin') {
      // Find the store with this admin email
      const store = await Store.findOne({ 'admin.email': email });
      if (store && store.admin) {
        user = {
          _id: store._id,
          username: store.admin.username,
          email: store.admin.email,
          password: store.admin.password,
          role: 'admin'
        };
      }
    } else {
      user = await User.findOne({ email });
    }
    console.log('Login attempt:', email, user);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await LoginActivity.create({
      userName: user.username,
      userRole: user.role,
      timestamp: new Date(),
      ipAddress: req.ip,
      action: 'login'
    });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});

// Import auth middleware
const auth = require('../middleware/auth');

// Update user profile
router.put('/update', auth, async (req, res) => {
  try {
    const { userId, name, username } = req.body;
    
    // Verify the authenticated user is updating their own profile
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields
    if (username) {
      // Check if username is already taken
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }
    
    // Save the updated user
    await user.save();
    
    // Return the updated user data
    res.json({ 
      id: user._id, 
      username: user.username, 
      email: user.email, 
      role: user.role 
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

module.exports = router;