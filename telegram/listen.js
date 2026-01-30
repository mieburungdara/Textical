const express = require('express');
const { spawn } = require('child_process');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.LISTEN_PORT || 3000;

app.use(bodyParser.json());

app.get('/health', (req, res) => {
    res.send('OK');
});

app.post('/event', async (req, res) => {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).send({ error: 'Message is required' });
    }

    console.log(`Received message: ${message}`);

    try {
        // Escape double quotes for PowerShell
        const escapedMessage = message.replace(/"/g, '`"');
        const gemini = spawn('powershell.exe', ['-NoProfile', '-Command', `gemini "${escapedMessage}"`]);

        let output = '';
        let errorOutput = '';

        gemini.stdout.on('data', (data) => {
            output += data.toString();
        });

        gemini.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        gemini.on('close', (code) => {
            console.log(`Gemini process exited with code ${code}`);
            if (code === 0) {
                res.send({ response: output.trim() });
            } else {
                res.status(500).send({ 
                    error: 'Gemini CLI error', 
                    details: errorOutput.trim() || 'Process exited with non-zero code' 
                });
            }
        });

    } catch (err) {
        console.error('Failed to start Gemini process:', err);
        res.status(500).send({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Listen server running on port ${PORT}`);
});
