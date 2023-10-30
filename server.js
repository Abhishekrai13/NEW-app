// app.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Storing rooms and users
const rooms = new Map();

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  let currentRoom;

  socket.on('join', (username, roomName) => {
    // Create a unique room if it doesn't exist
    const roomId = roomName || uuidv4();
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }

    currentRoom = roomId;
    socket.join(currentRoom);

    // Save user to the room
    rooms.get(currentRoom).add(username);

    // Notify room members of a new user joining
    io.to(currentRoom).emit('user joined', username);
  });

  socket.on('chat message', (msg) => {
    io.to(currentRoom).emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    if (currentRoom && rooms.has(currentRoom)) {
      rooms.get(currentRoom).delete(username);
      io.to(currentRoom).emit('user left', username);
    }
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
