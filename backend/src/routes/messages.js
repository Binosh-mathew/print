const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// Get all messages
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ createdAt: -1 })
      .populate('sender', 'username')
      .populate('recipient', 'username');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error });
  }
});

// Send a new message
router.post('/', auth, async (req, res) => {
  try {
    const { content, recipient } = req.body;
    const message = new Message({
      content,
      sender: req.user.id,
      senderRole: req.user.role,
      recipient,
      isRead: false
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error });
  }
});

// Mark message as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    message.isRead = true;
    await message.save();
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error updating message', error });
  }
});

// Delete a message
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    // Only allow sender or recipient to delete
    if (message.sender.toString() !== req.user.id && 
        message.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await message.remove();
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error });
  }
});

module.exports = router; 