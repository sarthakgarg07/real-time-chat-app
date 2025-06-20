const express = require('express');
const Conversation = require('../models/Conversation');

const router = express.Router();

// Create a new conversation
router.post('/', async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    if (!senderId || !receiverId) {
      return res.status(400).json({ message: 'senderId and receiverId are required.' });
    }
    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] }
    });
    if (conversation) {
      return res.status(200).json(conversation);
    }
    // Create new conversation
    conversation = new Conversation({
      members: [senderId, receiverId]
    });
    await conversation.save();
    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get all conversations for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const conversations = await Conversation.find({
      members: userId
    })
    .sort({ updatedAt: -1 })
    .populate('members', 'username email avatar');
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router; 