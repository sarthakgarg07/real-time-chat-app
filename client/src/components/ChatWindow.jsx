import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, CircularProgress, Avatar, List, ListItem, ListItemAvatar, ListItemText, Paper, IconButton, Tooltip } from '@mui/material';
import moment from 'moment';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

const ChatWindow = ({ conversation, user, messages = [], loading = false, mode = 'light' }) => {
  const messagesEndRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!conversation) {
    return (
      <Box sx={{ flex: 1, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
        <Typography variant="h6">Select a conversation to start chatting</Typography>
      </Box>
    );
  }

  // Find the other user in the conversation
  const otherUser = conversation.members.find((m) => (m._id || m.id) !== (user._id || user.id));

  // Helper to check if the previous message is from the same sender
  const isSameSender = (msg, idx) => {
    if (idx === 0) return false;
    const prev = messages[idx - 1];
    return (prev.sender === msg.sender);
  };

  return (
    <Box
      sx={{
        width: isFullScreen ? '100vw' : 'auto',
        height: isFullScreen ? '100vh' : 'calc(100vh - 64px)',
        position: isFullScreen ? 'fixed' : 'relative',
        top: isFullScreen ? 0 : 'auto',
        left: isFullScreen ? 0 : 'auto',
        zIndex: isFullScreen ? 1300 : 'auto',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #f4f6fa 100%)',
      }}
    >
      {/* Chat header with other user's avatar and name */}
      <Paper elevation={1} sx={{ display: 'flex', alignItems: 'center', p: 2, mb: 1, borderRadius: 2, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={otherUser?.avatar || ''} alt={otherUser?.username || 'U'} sx={{ mr: 2 }} />
          <Typography variant="h6">{otherUser?.username || 'Unknown'}</Typography>
        </Box>
        <Tooltip title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}>
          <IconButton onClick={() => setIsFullScreen((prev) => !prev)}>
            {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Tooltip>
      </Paper>
      {/* Chat window with soft vertical gradient */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          overflowY: 'auto',
          borderRadius: 2,
          position: 'relative',
          background: mode === 'dark' ? '#212121' : 'linear-gradient(180deg, #e0e7ff 0%, #f4f6fa 100%)',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
            No messages yet. Start the conversation!
          </Typography>
        ) : (
          <List sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {messages.map((msg, idx) => {
              const isMe = msg.sender === user._id || msg.sender === user.id;
              const showAvatar = !isMe && (!isSameSender(msg, idx));
              const showMargin = !isSameSender(msg, idx);
              return (
                <ListItem
                  key={msg._id}
                  sx={{
                    display: 'flex',
                    flexDirection: isMe ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    border: 'none',
                    background: 'none',
                    px: 0,
                    py: showMargin ? 1.5 : 0.3,
                  }}
                  disableGutters
                >
                  {showAvatar && (
                    <ListItemAvatar sx={{ minWidth: 40 }}>
                      <Avatar src={otherUser?.avatar || ''} alt={otherUser?.username || 'U'} />
                    </ListItemAvatar>
                  )}
                  <Box
                    sx={{
                      position: 'relative',
                      bgcolor: isMe
                        ? (mode === 'dark' ? '#1565c0' : '#1976d2')
                        : (mode === 'dark' ? '#222' : 'grey.200'),
                      color: isMe
                        ? (mode === 'dark' ? '#fff' : 'primary.contrastText')
                        : (mode === 'dark' ? '#fff' : 'text.primary'),
                      px: 1.5,
                      py: 0.6,
                      borderRadius: 20,
                      maxWidth: '60%',
                      minWidth: 40,
                      boxShadow: '0 2px 8px 0 rgba(60,60,60,0.08)',
                      ml: isMe ? 2 : 0,
                      mr: isMe ? 0 : 2,
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        width: 0,
                        height: 0,
                        border: isMe
                          ? '10px solid transparent'
                          : '10px solid transparent',
                        borderTop: isMe
                          ? `10px solid ${mode === 'dark' ? '#1565c0' : '#1976d2'}`
                          : `10px solid ${mode === 'dark' ? '#222' : '#e0e0e0'}`,
                        right: isMe ? -10 : 'auto',
                        left: isMe ? 'auto' : -10,
                        borderLeft: isMe ? `10px solid ${mode === 'dark' ? '#1565c0' : '#1976d2'}` : 'none',
                        borderRight: isMe ? 'none' : `10px solid ${mode === 'dark' ? '#222' : '#e0e0e0'}`,
                        borderTopColor: 'transparent',
                        borderBottom: 'none',
                        display: showMargin ? 'block' : 'none',
                      },
                    }}
                  >
                    <ListItemText
                      primary={msg.text}
                      primaryTypographyProps={{ sx: { wordBreak: 'break-word' } }}
                      secondary={
                        <Typography variant="caption" color={isMe ? 'primary.contrastText' : 'text.secondary'}>
                          {moment(msg.createdAt).format('LT')}
                        </Typography>
                      }
                    />
                  </Box>
                </ListItem>
              );
            })}
            <div ref={messagesEndRef} />
          </List>
        )}
      </Box>
    </Box>
  );
};

export default ChatWindow; 