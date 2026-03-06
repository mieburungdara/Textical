import { createServer } from 'http';
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { CombatSimulator } from './combat/CombatSimulator.js';
import { PlayerManager } from './players/PlayerManager.js';
import { Database } from './database/Database.js';

const PORT = process.env.PORT || 3000;

// Initialize Express
const app = express();
app.use(express.json());

// Create HTTP server and Socket.IO
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Initialize services
const db = new Database();
const playerManager = new PlayerManager(db);
const combatSimulator = new CombatSimulator();

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Combat simulation
  socket.on('combat:simulate', async (data) => {
    try {
      const { playerTeam, enemyTeam } = data;
      const result = await combatSimulator.simulate(playerTeam, enemyTeam);
      socket.emit('combat:result', result);
    } catch (error) {
      console.error('Combat simulation error:', error);
      socket.emit('combat:error', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
  });
});

// REST API endpoints
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    players: io.sockets.sockets.size,
    timestamp: new Date().toISOString()
  });
});

// Start server
async function main() {
  await db.connect();
  console.log('Database connected');

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

main().catch(error => {
  console.error('Server startup error:', error);
  process.exit(1);
});
