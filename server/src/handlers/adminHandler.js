const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const assetService = require('../services/assetService');
const Registry = require('../data/registry'); // NEW

class AdminHandler {
    constructor(app) {
        this.app = app;
        this.setupRoutes();
    }

    setupRoutes() {
        // CONFIG ROUTES
        this.app.get('/api/admin/monster-categories', async (req, res) => {
            const cats = await prisma.monsterCategory.findMany();
            res.json(cats);
        });

        // LOAD ALL (Initial Sync)
        this.app.post('/api/admin/reload', async (req, res) => {
            await assetService.loadAllAssets();
            res.json({ message: "Assets Reloaded" });
        });

        this.app.get('/api/admin/:resource', async (req, res) => {
            const { resource } = req.params;
            try {
                let data;
                if (resource === 'monsters') data = await prisma.monsterTemplate.findMany();
                else if (resource === 'regions') data = await prisma.regionTemplate.findMany();
                res.json(data || []);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // SAVE SINGLE (Database-Driven Mirroring)
        this.app.post('/api/admin/:resource', async (req, res) => {
            const { resource } = req.params;
            const body = req.body;
            const id = body.id;
            
            if (!id) return res.status(400).json({ error: "ID is required" });

            try {
                if (resource === 'monsters') {
                    await assetService.saveMonster(id, body);
                } else if (resource === 'regions') {
                    await assetService.saveRegion(id, body);
                }
                res.json({ success: true, message: `Updated ${id} and mirrored to disk.` });
            } catch (e) { 
                res.status(500).json({ error: e.message }); 
            }
        });
    }
}

module.exports = AdminHandler;