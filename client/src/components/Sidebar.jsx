import React, { useEffect, useState } from 'react';
import { Drawer, Toolbar, Box, Typography, List, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, ListItem, ListItemAvatar, Avatar, ListItemText, IconButton, InputBase, Badge } from '@mui/material';
import ConversationListItem from './ConversationListItem';
import API from '../utils/api';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search';
import CircleIcon from '@mui/icons-material/Circle';

const drawerWidth = 300;

const Sidebar = ({ userId: propUserId, selectedConversationId, onSelectConversation }) => {
  // Get user from localStorage and support both _id and id
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = propUserId || user?._id || user?.id;

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [otherEmail, setOtherEmail] = useState('');
  const [dialogError, setDialogError] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchConversations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get(`/api/conversations/${userId}`);
      setConversations(res.data);
    } catch (err) {
      setError('Failed to load conversations.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userId) fetchConversations();
    // eslint-disable-next-line
  }, [userId]);

  const handleStartConversation = async () => {
    setDialogError('');
    setCreating(true);
    try {
      // Find user by email
      const res = await API.get(`/api/users/email/${encodeURIComponent(otherEmail)}`);
      const otherUser = res.data;
      if (!otherUser || !(otherUser._id || otherUser.id)) {
        setDialogError('User not found.');
        setCreating(false);
        return;
      }
      // Use _id or id for receiverId
      const receiverId = otherUser._id || otherUser.id;
      // Create conversation and get its response
      const convRes = await API.post('/api/conversations', {
        senderId: userId,
        receiverId,
      });
      const newConv = convRes.data;
      setOpenDialog(false);
      setOtherEmail('');
      await fetchConversations();
      // Select the new conversation (call onSelectConversation)
      if (onSelectConversation && newConv && newConv._id) {
        onSelectConversation(newConv);
      }
    } catch (err) {
      setDialogError(err.response?.data?.message || 'Could not start conversation.');
    }
    setCreating(false);
  };

  // Dummy online status for demo; replace with real status if available
  const isOnline = (user) => true;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ChatBubbleOutlineIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Conversations
            </Typography>
          </Box>
          <IconButton color="primary" onClick={() => setOpenDialog(true)} size="large">
            <AddCircleIcon fontSize="large" />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, pb: 1 }}>
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', bgcolor: 'grey.100', borderRadius: 2, px: 1 }}>
            <SearchIcon color="action" />
            <InputBase placeholder="Search..." sx={{ ml: 1, flex: 1 }} inputProps={{ 'aria-label': 'search conversations' }} />
          </Box>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : conversations.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
            No conversations yet. Start a new chat!
          </Typography>
        ) : (
          <List sx={{ flex: 1, overflowY: 'auto', px: 1 }}>
            {conversations.map((conv) => {
              const otherUser = conv.members?.find((m) => !m.isSelf);
              return (
                <ListItem
                  key={conv._id}
                  selected={selectedConversationId === conv._id}
                  onClick={() => onSelectConversation(conv)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    cursor: 'pointer',
                    bgcolor: selectedConversationId === conv._id ? 'primary.light' : 'transparent',
                    '&:hover': { bgcolor: 'grey.100' },
                    transition: 'background 0.2s',
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        isOnline(otherUser) ? (
                          <CircleIcon sx={{ color: '#44b700', fontSize: 14, border: '2px solid white', borderRadius: '50%' }} />
                        ) : null
                      }
                    >
                      <Avatar src={otherUser?.avatar || ''} alt={otherUser?.username || 'U'} />
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={otherUser?.username || 'Unknown'}
                    secondary={conv.lastMessage ? conv.lastMessage.text : ''}
                    secondaryTypographyProps={{ noWrap: true }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60, textAlign: 'right' }}>
                    {conv.lastMessage ? conv.lastMessage.time : ''}
                  </Typography>
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Start New Conversation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Other User's Email"
            type="email"
            fullWidth
            value={otherEmail}
            onChange={(e) => setOtherEmail(e.target.value)}
            disabled={creating}
          />
          {dialogError && <Alert severity="error" sx={{ mt: 2 }}>{dialogError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={creating}>Cancel</Button>
          <Button onClick={handleStartConversation} variant="contained" disabled={creating || !otherEmail}>
            {creating ? 'Starting...' : 'Start'}
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
};

export default Sidebar; 