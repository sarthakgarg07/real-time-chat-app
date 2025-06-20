const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');

// Load environment variables
dotenv.config();

const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const conversationRoutes = require('./routes/conversation');
const messageRoutes = require('./routes/message');
const userRoutes = require('./routes/user');

const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'https://real-time-chat-app-cyan-seven.vercel.app'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

const io = new Server(server, {
  cors: corsOptions
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Use authentication routes
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join conversation rooms
  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // Real-time message sending
  socket.on('sendMessage', async (data) => {
    // data: { conversationId, senderId, text }
    try {
      const { conversationId, senderId, text } = data;
      if (!conversationId || !senderId || !text) return;
      // Save message to DB
      const message = new Message({
        conversation: conversationId,
        sender: senderId,
        text
      });
      await message.save();
      // Update conversation's updatedAt
      await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });
      // Emit to all users in the conversation room
      io.to(conversationId).emit('receiveMessage', {
        _id: message._id,
        conversation: message.conversation,
        sender: message.sender,
        text: message.text,
        createdAt: message.createdAt
      });
    } catch (err) {
      console.error('Socket sendMessage error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/realtime_chat';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
}); 