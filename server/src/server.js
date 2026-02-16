require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const app = express();
const server = http.createServer(app);

const taskProcessor = require('./services/taskProcessor');
const socketService = require('./services/socketService');
const apiRoutes = require('./routes/api');
const debugRoutes = require('./routes/debugRoutes');
const adminRoutes = require('./routes/adminRoutes');
const assetsRoutes = require('./routes/assets');
const logger = require('./utils/logger'); // Import logger

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ============================================
// Godot Web Export Configuration
// ============================================

// Custom MIME types for Godot Web Export
express.static.mime.define({
    'application/wasm': ['wasm'],
    'application/octet-stream': ['pck'],
    'application/javascript': ['js', 'mjs', 'cjs']
});

// Cross-Origin headers for SharedArrayBuffer (thread support)
// Only apply to /web/ path to avoid breaking other resources
/** 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 * */
app.use('/web', (req, res, next) => {
    // Required for SharedArrayBuffer (Godot thread support)
    // Only enable in production with HTTPS
    if (process.env.ENABLE_THREADS === 'true') {
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    }
    next();
});

// Serve static files from public directory
app.use(express.static('public'));

// Initialize Real-time Engine
socketService.init(server);

// Initialize Boss Manager (World Boss state tracking)
const bossManager = require('./services/BossManager');
/** @param {Error} err */
bossManager.init().catch(err => logger.error('[BOSS-MANAGER] Init failed:', err));

// Initialize Weather Service (Dynamic Weather)
const weatherService = require('./services/RegionWeatherService');
weatherService.init();

// Start the Heartbeat
taskProcessor.start();

// Start Cron Scheduler (Daily Maintenance)
const cronScheduler = require('./services/world/DailyScheduler');
cronScheduler.start();

// Mount API
app.use('/api', apiRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/admin', adminRoutes);
app.use('/assets', assetsRoutes);
app.use('/api/assets', assetsRoutes);

/** @param {import('express').Request} req @param {import('express').Response} res */
app.get('/health', (req, res) => {
    res.json({ status: "alive", engine: "Textical AAA Tactical Enabled" });
});

server.listen(PORT, () => {
    logger.info(`[SERVER] Textical Engine running on port ${PORT}`);
});
