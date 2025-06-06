import {Router} from 'express';
import {Message} from '../models/Message.js';
import {auth} from '../middleware/auth.js';

const router = Router();

// Get all messages
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error });
  }
});

// Create a new message
router.post('/', auth, async (req, res) => {
  try {
        let recipientPayload = req.body.recipient;
    if (typeof req.body.recipient === 'string') {
      // Assuming a string recipient implies a 'developer' role for now
      // and the name is the string itself.
      recipientPayload = {
        name: req.body.recipient,
        role: 'developer' // Default role for string recipients
      };
    }

    const message = new Message({
            ...req.body,
      recipient: recipientPayload, // Use the processed recipient
      sender: {
        id: req.user?.id,
        name: req.user?.username,
        role: req.user?.role
      }
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error creating message', error });
  }
});

// Mark a message as read by the recipient
router.put('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Authorization:
    let authorizedToRead = false;
    if (message.recipient?.id) {
      // If recipient.id exists, it must match the user's ID
      if (message.recipient.id.toString() === req.user.id) {
        authorizedToRead = true;
      }
    } else if (message.recipient?.role && message.recipient.role === req.user.role) {
      // If recipient.id does NOT exist, but recipient.role matches user's role
      // (e.g., message to 'admin' role, and user is an 'admin')
      // This also covers messages sent to 'store' role if a store representative is logged in and their role is 'store'.
      authorizedToRead = true;
    }

    if (!authorizedToRead) {
      return res.status(403).json({ message: 'Not authorized to mark this message as read' });
    }

    if (message.status === 'read') {
      // Optionally, you could just return the message if already read, or an indication.
      return res.status(200).json({ message: 'Message already marked as read', updatedMessage: message });
    }

    message.status = 'read';
    await message.save();
    res.json({ message: 'Message marked as read successfully', updatedMessage: message });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Error marking message as read', error });
  }
});

// Update a message
router.put('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Only allow sender to update their message
    if (message.sender.id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this message' });
    }
    
    Object.assign(message, req.body);
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
    
    // Only allow sender to delete their message
    if (message.sender.id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }
    
    await message.remove();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error });
  }
});

export default router;