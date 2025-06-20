const express = require('express');
const Message = require('../models/Message');

const router = express.Router();

// Send a message
router.post('/', async (req, res) => {
  try {
    const { conversationId, senderId, text } = req.body;
    if (!conversationId || !senderId || !text) {
      return res.status(400).json({ message: 'conversationId, senderId, and text are required.' });
    }
    const message = new Message({
      conversation: conversationId,
      sender: senderId,
      text
    });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get all messages in a conversation
router.get('/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversation: conversationId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Delete all messages in a conversation
router.delete('/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    await Message.deleteMany({ conversation: conversationId });
    res.json({ message: 'All messages deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router; 