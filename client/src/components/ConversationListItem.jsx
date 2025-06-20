import React from 'react';
import { ListItem, ListItemAvatar, Avatar, ListItemText, ListItemButton } from '@mui/material';

const ConversationListItem = ({ conversation, selected, onClick, userId }) => {
  // Find the other user in the conversation
  const otherUser = conversation.members.find((m) => m._id !== userId);

  return (
    <ListItem disablePadding>
      <ListItemButton selected={selected} onClick={onClick}>
        <ListItemAvatar>
          <Avatar src={otherUser?.avatar || ''} alt={otherUser?.username || 'U'} />
        </ListItemAvatar>
        <ListItemText
          primary={otherUser?.username || 'Unknown'}
          secondary={conversation.lastMessage || ''}
        />
      </ListItemButton>
    </ListItem>
  );
};

export default ConversationListItem; 