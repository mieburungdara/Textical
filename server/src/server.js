require('dotenv').config();
const express = require('express');
const app = express();
const taskProcessor = require('./services/taskProcessor');

const PORT = process.env.PORT || 3000;

app.use(express.json());

// Start the Heartbeat
taskProcessor.start();

app.get('/health', (req, res) => {
    res.json({ status: "alive", engine: "Textical AAA", heartbeat: "running" });
});

app.listen(PORT, () => {
    console.log(`[SERVER] Textical Engine running on port ${PORT}`);
});