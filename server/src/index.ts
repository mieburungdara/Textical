import { createServer } from 'http';
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { CombatEngine } from './combat/CombatSimulator.js';
import { PlayerManager } from './players/PlayerManager.js';
import { Database } from './database/Database.js';
import { ReplayBuilder, saveReplayToFile, ReplayEventType, HitResult } from './combat/CombatReplay.js';
import { CombatAction } from './combat/TickCost.js';
import logger from './utils/logger.js';
import * as path from 'path';

const PORT = process.env.PORT || 3000;

// Path to client replays folder
const CLIENT_REPLAYS_PATH = path.resolve(__dirname, '../../client/replays');

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
const combatEngine = new CombatEngine();

/**
 * Build replay from combat result logs
 */
function buildReplayFromResult(
  playerTeam: any[],
  enemyTeam: any[],
  result: any,
  seed: string
): any {
  const builder = new ReplayBuilder();
  builder.setSeed(seed);
  
  // Add units
  builder.addUnits(playerTeam, enemyTeam);
  
  // Set initial positions
  const initialState = [...playerTeam, ...enemyTeam].map(u => ({
    ...u,
    currentHp: u.hp,
    isAlive: true,
    statusEffects: []
  }));
  builder.setInitialPositions(initialState);
  
  // Record combat start
  builder.recordCombatStart();
  
  // Process logs to events
  for (const log of result.logs) {
    if (log.actionType === 'move') {
      builder.recordMove(log.tick, log.unitId, log.oldPosition, log.position);
    } else if (log.actionType === 'attack' || log.actionType === 'basic_attack') {
      // Record damage taken (target perspective)
      if (log.targetId && log.damage !== undefined) {
        const hpBefore = (log.target as any)?.currentHp + log.damage || 0;
        const hpAfter = (log.target as any)?.currentHp || 0;
        builder.recordDamageTaken(
          log.tick,
          log.targetId,
          log.unitId,
          log.damage,
          hpBefore,
          hpAfter,
          log.isCrit || false,
          log.isMiss || false,
          log.isDodge || false
        );
      }
    } else if (log.actionType === 'heal') {
      if (log.targetId && log.heal) {
        const hpBefore = (log.target as any)?.currentHp - log.heal || 0;
        const hpAfter = (log.target as any)?.currentHp || 0;
        builder.recordHealReceived(log.tick, log.targetId, log.unitId, log.heal, hpBefore, hpAfter);
      }
    } else if (log.eventType === 'unit_death' || (log.target && !(log.target as any)?.isAlive)) {
      builder.recordDeath(log.tick, log.targetId, log.unitId);
    }
  }
  
  // Build final replay
  return builder.build(
    result.winner,
    result.totalTicks,
    result.finalState?.playerTeam || [],
    result.finalState?.enemyTeam || [],
    result.rewards
  );
}

// Socket.IO connection handler
io.on('connection', (socket: any) => {
  logger.info(`Player connected: ${socket.id}`);

  // Combat simulation - runs combat and auto-saves replay
  socket.on('combat:simulate', async (data: any) => {
    try {
      const { playerTeam, enemyTeam, seed } = data;
      const combatSeed = seed || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Run combat simulation
      const result = await combatEngine.simulate(playerTeam, enemyTeam);
      
      // Build replay from result
      const replay = buildReplayFromResult(playerTeam, enemyTeam, result, combatSeed);
      replay.seed = combatSeed;
      
      // Auto-save replay to client folder
      const filename = `combat_${combatSeed}.json`;
      const filepath = saveReplayToFile(replay, filename, CLIENT_REPLAYS_PATH);
      logger.info(`Replay saved: ${filepath}`);
      
      // Send result + replay path to client
      socket.emit('combat:result', {
        ...result,
        replay,
        replayPath: filepath,
        replayFilename: filename
      });
    } catch (error: any) {
      logger.error('Combat simulation error:', error);
      socket.emit('combat:error', error.message);
    }
  });

  socket.on('disconnect', () => {
    logger.info(`Player disconnected: ${socket.id}`);
  });
});

// REST API endpoints
app.get('/api/status', (req: express.Request, res: express.Response) => {
  res.json({
    status: 'online',
    players: io.sockets.sockets.size,
    timestamp: new Date().toISOString()
  });
});

// API to get saved replays
app.get('/api/replays', (req: express.Request, res: express.Response) => {
  const fs = require('fs');
  const replaysDir = CLIENT_REPLAYS_PATH;
  
  if (!fs.existsSync(replaysDir)) {
    return res.json({ replays: [] });
  }
  
  const files = fs.readdirSync(replaysDir)
    .filter((f: string) => f.endsWith('.json'))
    .map((f: string) => ({
      filename: f,
      path: `/replays/${f}`
    }));
  
  res.json({ replays: files });
});

// Serve replays folder statically
app.use('/replays', express.static(CLIENT_REPLAYS_PATH));

// Start server
async function main() {
  await db.connect();
  logger.info('Database connected');

  httpServer.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

main().catch(error => {
  logger.error('Server startup error:', error);
  process.exit(1);
});
