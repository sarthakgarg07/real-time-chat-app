import React, { useState } from 'react';
import { Box, TextField, IconButton, Paper, Popover } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

const MessageInput = ({ conversation, user, onSendMessage, disabled }) => {
  const [text, setText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  const handleSend = (e) => {
    e.preventDefault();
    if (text.trim() && conversation && user) {
      onSendMessage(text);
      setText('');
    }
  };

  const handleEmojiClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleEmojiClose = () => {
    setAnchorEl(null);
  };

  const handleEmojiSelect = (emoji) => {
    setText((prev) => prev + (emoji.native || emoji.shortcodes || ''));
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Paper
      component="form"
      onSubmit={handleSend}
      sx={{
        p: 1.5,
        display: 'flex',
        alignItems: 'center',
        borderRadius: 4,
        boxShadow: 3,
        bgcolor: 'background.paper',
      }}
      elevation={3}
    >
      <IconButton sx={{ mr: 1 }} disabled={disabled} onClick={handleEmojiClick}>
        <InsertEmoticonIcon />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleEmojiClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" />
      </Popover>
      <IconButton sx={{ mr: 1 }} disabled={disabled}>
        <AttachFileIcon />
      </IconButton>
      <TextField
        fullWidth
        placeholder="Type a message..."
        variant="standard"
        value={text}
        onChange={(e) => setText(e.target.value)}
        InputProps={{
          disableUnderline: true,
          sx: { fontSize: 16, px: 1 },
        }}
        sx={{ ml: 1, bgcolor: 'transparent' }}
        disabled={disabled}
      />
      <IconButton type="submit" color="primary" sx={{ ml: 1 }} disabled={disabled || !text.trim()}>
        <SendIcon />
      </IconButton>
    </Paper>
  );
};

export default MessageInput; 