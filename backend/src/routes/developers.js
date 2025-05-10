const express = require('express');
const Developer = require('../models/Developer');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all developers
router.get('/', auth, async (req, res) => {
  try {
    const developers = await Developer.find().select('-password');
    res.json(developers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching developers', error });
  }
});

// Get a specific developer
router.get('/:id', auth, async (req, res) => {
  try {
    const developer = await Developer.findById(req.params.id).select('-password');
    if (!developer) return res.status(404).json({ message: 'Developer not found' });
    res.json(developer);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching developer', error });
  }
});

// Update a developer
router.put('/:id', auth, async (req, res) => {
  try {
    const developer = await Developer.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!developer) return res.status(404).json({ message: 'Developer not found' });
    res.json(developer);
  } catch (error) {
    res.status(500).json({ message: 'Error updating developer', error });
  }
});

// Delete a developer
router.delete('/:id', auth, async (req, res) => {
  try {
    const developer = await Developer.findByIdAndDelete(req.params.id);
    if (!developer) return res.status(404).json({ message: 'Developer not found' });
    res.json({ message: 'Developer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting developer', error });
  }
});

module.exports = router; 