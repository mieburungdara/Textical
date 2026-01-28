const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const BT_DIR = path.join(__dirname, '../logic/bt');

// Ensure directory exists
if (!fs.existsSync(BT_DIR)) fs.mkdirSync(BT_DIR, { recursive: true });

// List all BT files
router.get('/list', (req, res) => {
    try {
        const files = fs.readdirSync(BT_DIR).filter(f => f.endsWith('.json'));
        res.json(files.map(f => f.replace('.json', '')));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Load specific BT
router.get('/:name', (req, res) => {
    try {
        const filePath = path.join(BT_DIR, `${req.params.name}.json`);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Not found" });
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Save BT
router.post('/:name', (req, res) => {
    try {
        const filePath = path.join(BT_DIR, `${req.params.name}.json`);
        fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
