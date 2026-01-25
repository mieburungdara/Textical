require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Good practice for Client dev
const app = express();
const taskProcessor = require('./services/taskProcessor');
const apiRoutes = require('./routes/api');

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Start the Heartbeat
taskProcessor.start();

// Mount API
app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
    res.json({ status: "alive", engine: "Textical AAA", heartbeat: "running" });
});

app.listen(PORT, () => {
    console.log(`[SERVER] Textical Engine running on port ${PORT}`);
});
