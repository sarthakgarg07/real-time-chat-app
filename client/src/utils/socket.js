import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5001';

const socket = io(SOCKET_URL, {
  autoConnect: false, // We'll connect manually
});

export default socket; 