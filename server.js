import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for demo purposes
    methods: ["GET", "POST"]
  }
});

// Serve static files in production
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing
app.get('*', (req, res) => {
  // Skip if request is for socket.io (handled by io instance, but good to be safe)
  if (req.path.startsWith('/socket.io')) return;

  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Room State Management (In-memory)
const rooms = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // --- HOST EVENTS ---

  socket.on('create-room', (roomId) => {
    socket.join(roomId);
    rooms[roomId] = {
      hostId: socket.id,
      teams: [],
      gameState: null
    };
    console.log(`Room ${roomId} created by ${socket.id}`);
    socket.emit('room-created', roomId);
  });

  socket.on('sync-game-state', ({ roomId, state }) => {
    // Host sends state, server broadcasts to all players in room
    if (rooms[roomId]) {
      rooms[roomId].gameState = state;
      // Broadcast to everyone EXCEPT sender (host) usually, but broadcasting to room is fine
      socket.to(roomId).emit('game-state-updated', state);
    }
  });

  // --- PLAYER EVENTS ---

  socket.on('join-room', ({ roomId, team }) => {
    if (rooms[roomId]) {
      socket.join(roomId);
      // Add team to room state if new
      const teamExists = rooms[roomId].teams.find(t => t.id === team.id);
      if (!teamExists) {
        rooms[roomId].teams.push(team);
      }

      // Notify Host that a player joined
      io.to(rooms[roomId].hostId).emit('player-joined', team);

      // Send current game state to the new player immediately
      if (rooms[roomId].gameState) {
        socket.emit('game-state-updated', rooms[roomId].gameState);
      }

      console.log(`Team ${team.name} joined room ${roomId}`);
    } else {
      socket.emit('error', 'Room not found');
    }
  });

  socket.on('player-action', ({ roomId, action }) => {
    // Forward action (input text) to Host
    if (rooms[roomId]) {
      io.to(rooms[roomId].hostId).emit('player-action-received', action);
    }
  });

  socket.on('player-vote', ({ roomId, vote }) => {
    // Forward vote to Host
    if (rooms[roomId]) {
      io.to(rooms[roomId].hostId).emit('player-vote-received', vote);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Cleanup logic could go here
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});