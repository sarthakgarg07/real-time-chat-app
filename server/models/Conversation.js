const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }]
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema); 