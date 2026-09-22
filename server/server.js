// AI Crisis Command - Server & Socket.IO Multiplayer Hub

const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const GameRoom = require('./gameEngine');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Serve static frontend assets
app.use(express.static(path.join(__dirname, '..', 'public')));

// Fallback route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Rooms storage: roomCode -> GameRoom
const rooms = new Map();
// Socket to room lookup: socketId -> roomCode
const socketRoomMap = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rooms.has(code) ? generateRoomCode() : code;
}

function broadcastRoomState(room) {
  for (const [socketId] of room.players) {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      socket.emit('game_state', room.getPublicState(socketId));
    }
  }
}

function broadcastTimerTick(room, secondsRemaining) {
  io.to(room.roomCode).emit('timer_tick', { seconds: secondsRemaining });
}

io.on('connection', (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // Create new game room
  socket.on('create_room', ({ playerName }) => {
    const code = generateRoomCode();
    const cleanName = (playerName || 'Commander 1').trim().substring(0, 18);
    const room = new GameRoom(code, socket.id, cleanName);

    rooms.set(code, room);
    socketRoomMap.set(socket.id, code);
    socket.join(code);

    socket.emit('room_created', { roomCode: code });
    broadcastRoomState(room);
    console.log(`[Room Created] Code: ${code} by ${cleanName} (${socket.id})`);
  });

  // Join existing room
  socket.on('join_room', ({ roomCode, playerName }) => {
    if (!roomCode) {
      return socket.emit('error_message', { message: 'Please provide a 4-letter room code.' });
    }
    const code = roomCode.toUpperCase().trim();
    const room = rooms.get(code);

    if (!room) {
      return socket.emit('error_message', { message: `Room "${code}" not found. Please verify the code.` });
    }
    if (room.state !== 'LOBBY') {
      return socket.emit('error_message', { message: 'Operation already in progress for this room.' });
    }
    if (room.players.size >= 8) {
      return socket.emit('error_message', { message: 'Room has reached the maximum capacity of 8 players.' });
    }

    const cleanName = (playerName || `Commander ${room.players.size + 1}`).trim().substring(0, 18);
    const added = room.addPlayer(socket.id, cleanName, false);
    if (!added) {
      return socket.emit('error_message', { message: 'Unable to join room at this time.' });
    }

    socketRoomMap.set(socket.id, code);
    socket.join(code);

    socket.emit('joined_room', { roomCode: code });
    broadcastRoomState(room);
    console.log(`[Player Joined] ${cleanName} joined room ${code}`);
  });

  // Select tactical role
  socket.on('select_role', ({ roleId }) => {
    const code = socketRoomMap.get(socket.id);
    if (!code) return;
    const room = rooms.get(code);
    if (!room || room.state !== 'LOBBY') return;

    const success = room.setPlayerRole(socket.id, roleId);
    if (success) {
      broadcastRoomState(room);
    } else {
      socket.emit('error_message', { message: 'That role is already occupied by another commander.' });
    }
  });

  // Toggle ready status
  socket.on('toggle_ready', () => {
    const code = socketRoomMap.get(socket.id);
    if (!code) return;
    const room = rooms.get(code);
    if (!room || room.state !== 'LOBBY') return;

    room.toggleReady(socket.id);
    broadcastRoomState(room);
  });

  // Start game (Host only)
  socket.on('start_game', () => {
    const code = socketRoomMap.get(socket.id);
    if (!code) return;
    const room = rooms.get(code);
    if (!room || room.state !== 'LOBBY') return;
    if (room.hostId !== socket.id) {
      return socket.emit('error_message', { message: 'Only the Host can authorize mission launch.' });
    }

    const result = room.startGame(
      () => broadcastRoomState(room),
      (sec) => broadcastTimerTick(room, sec)
    );

    if (!result.canStart) {
      return socket.emit('error_message', { message: result.reason });
    }

    broadcastRoomState(room);
    console.log(`[Game Started] Room ${code} initiated Crisis 1.`);
  });

  // Submit action during crisis countdown
  socket.on('submit_action', ({ actionId }) => {
    const code = socketRoomMap.get(socket.id);
    if (!code) return;
    const room = rooms.get(code);
    if (!room || room.state !== 'ACTION_PHASE') return;

    const accepted = room.submitAction(
      socket.id,
      actionId,
      () => broadcastRoomState(room),
      (sec) => broadcastTimerTick(room, sec)
    );

    if (accepted) {
      broadcastRoomState(room);
    }
  });

  // In-game tactical comm / message
  socket.on('send_comm', ({ text }) => {
    const code = socketRoomMap.get(socket.id);
    if (!code) return;
    const room = rooms.get(code);
    if (!room) return;

    const player = room.players.get(socket.id);
    if (!player || !text) return;

    const cleanText = text.trim().substring(0, 120);
    room.addLog(`[${player.roleIcon} ${player.name}]: ${cleanText}`, 'comm');
    broadcastRoomState(room);
  });

  // Return / restart to lobby
  socket.on('restart_game', () => {
    const code = socketRoomMap.get(socket.id);
    if (!code) return;
    const room = rooms.get(code);
    if (!room || room.state !== 'GAME_OVER') return;
    if (room.hostId !== socket.id) {
      return socket.emit('error_message', { message: 'Only the Host can reset the operation.' });
    }

    room.resetToLobby();
    broadcastRoomState(room);
  });

  // Disconnect
  socket.on('disconnect', () => {
    const code = socketRoomMap.get(socket.id);
    if (code) {
      const room = rooms.get(code);
      if (room) {
        room.removePlayer(socket.id);
        if (room.players.size === 0) {
          if (room.timerInterval) clearInterval(room.timerInterval);
          rooms.delete(code);
          console.log(`[Room Deleted] Room ${code} empty.`);
        } else {
          broadcastRoomState(room);
        }
      }
      socketRoomMap.delete(socket.id);
    }
    console.log(`[Socket Disconnected] ID: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`  AI CRISIS COMMAND - MULTIPLAYER SERVER ONLINE  `);
  console.log(`  Listening on: http://localhost:${PORT}        `);
  console.log(`=================================================`);
});

