require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const app = express();
const server = http.createServer(app);

const taskProcessor = require('./services/taskProcessor');
const socketService = require('./services/socketService');
const apiRoutes = require('./routes/api');

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Real-time Engine
socketService.init(server);

// Start the Heartbeat
taskProcessor.start();

// Mount API
app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
    res.json({ status: "alive", engine: "Textical WebSocket Enabled" });
});

server.listen(PORT, () => {
    console.log(`[SERVER] Textical Engine running on port ${PORT}`);
});