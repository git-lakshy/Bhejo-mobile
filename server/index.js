const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // For local network simplicity
    methods: ['GET', 'POST']
  }
});

const PORT = 3000;

io.on('connection', (socket) => {

  socket.on('offer', ({ roomCode, offer }) => {
    console.log(`Forwarding offer in room ${roomCode}`);
    socket.to(roomCode).emit('offer', { from: socket.id, offer });
  });

  socket.on('answer', ({ roomCode, answer }) => {
    console.log(`Forwarding answer in room ${roomCode}`);
    socket.to(roomCode).emit('answer', { from: socket.id, answer });
  });

  socket.on('ice-candidate', ({ roomCode, candidate }) => {
    console.log(`Forwarding ICE candidate in room ${roomCode}`);
    socket.to(roomCode).emit('ice-candidate', { from: socket.id, candidate });
  });

  socket.on('disconnecting', () => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket.to(room).emit('peer-left', socket.id);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Signaling server running on port ${PORT}`);
});
