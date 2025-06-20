import React, { useState, useEffect, useRef } from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Avatar, Button, Menu, MenuItem, Divider, Tooltip, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';
import API from '../utils/api';
import socket from '../utils/socket';
import { useAuth } from '../AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

const Chat = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id || user?.id;
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const prevConversationId = useRef(null);
  const socketConnected = useRef(false);
  const { logout } = useAuth();

  // Theme state
  const [mode, setMode] = useState('light');
  const theme = createTheme({
    palette: {
      mode,
      primary: { main: '#1976d2' },
    },
  });
  const toggleTheme = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  // User menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Connect to socket on mount (only once)
  useEffect(() => {
    if (!userId || socketConnected.current) return;
    socket.auth = { userId };
    socket.connect();
    socketConnected.current = true;
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });
    return () => {
      socket.disconnect();
      socketConnected.current = false;
    };
  }, [userId]);

  // Join conversation room when selected
  useEffect(() => {
    if (!selectedConversation) return;
    if (prevConversationId.current) {
      socket.emit('leaveConversation', prevConversationId.current);
    }
    socket.emit('joinConversation', selectedConversation._id);
    prevConversationId.current = selectedConversation._id;
  }, [selectedConversation]);

  // Listen for real-time messages
  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      console.log('Received real-time message:', msg, 'Current conversation:', selectedConversation?._id);
      if (msg.conversation === selectedConversation?._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socket.on('receiveMessage', handleReceiveMessage);
    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [selectedConversation]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await API.get(`/api/messages/${selectedConversation._id}`);
        setMessages(res.data);
      } catch (err) {
        setMessages([]);
      }
      setLoadingMessages(false);
    };
    fetchMessages();
  }, [selectedConversation]);

  const handleSendMessage = async (text) => {
    if (!selectedConversation || !userId) return;
    // Emit via socket for real-time (let the real-time event update the UI)
    socket.emit('sendMessage', {
      conversationId: selectedConversation._id,
      senderId: userId,
      text,
    });
    // Also POST to backend for persistence
    try {
      await API.post('/api/messages', {
        conversationId: selectedConversation._id,
        senderId: userId,
        text,
      });
    } catch (err) {
      // Optionally show error
    }
  };

  const handleClearChat = async () => {
    if (!selectedConversation) return;
    try {
      await API.delete(`/api/messages/${selectedConversation._id}`);
      setMessages([]);
    } catch (err) {
      // Optionally show error
      alert('Failed to clear chat.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, boxShadow: 3 }}>
          <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Messenger Icon */}
            <ChatBubbleOutlineIcon sx={{ fontSize: 32, mr: 2, color: 'white' }} />
            <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
              Messenger
            </Typography>
            {/* Theme Toggle Button */}
            <Tooltip title={mode === 'light' ? 'Dark Mode' : 'Light Mode'}>
              <IconButton color="inherit" onClick={toggleTheme}>
                {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>
            {/* Username and Avatar with Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title={user?.username || ''}>
                <Avatar src={user?.avatar || ''} alt={user?.username || 'U'} sx={{ width: 36, height: 36, cursor: 'pointer' }} onClick={handleMenuOpen} />
              </Tooltip>
              <IconButton color="inherit" onClick={handleMenuOpen}>
                <MoreVertIcon />
              </IconButton>
              <Menu anchorEl={anchorEl} open={openMenu} onClose={handleMenuClose}>
                <MenuItem onClick={handleMenuClose}>
                  <PersonIcon sx={{ mr: 1 }} /> Profile
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                  <SettingsIcon sx={{ mr: 1 }} /> Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleMenuClose(); logout(); }}>
                  <LogoutIcon sx={{ mr: 1 }} /> Logout
                </MenuItem>
              </Menu>
            </Box>
            {/* Clear Chat Button (icon) */}
            {selectedConversation && (
              <Tooltip title="Clear Chat">
                <IconButton color="inherit" onClick={handleClearChat} sx={{ ml: 2 }}>
                  <DeleteOutlineIcon />
                </IconButton>
              </Tooltip>
            )}
          </Toolbar>
        </AppBar>
        <Sidebar
          userId={userId}
          selectedConversationId={selectedConversation?._id}
          onSelectConversation={setSelectedConversation}
        />
        <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', ml: '300px' }}>
          <Toolbar />
          <ChatWindow conversation={selectedConversation} user={user} messages={messages} loading={loadingMessages} mode={mode} />
          <Box sx={{ p: 2, borderTop: '1px solid #eee', background: 'background.paper' }}>
            <MessageInput
              conversation={selectedConversation}
              user={user}
              onSendMessage={handleSendMessage}
              disabled={!selectedConversation}
            />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Chat; 