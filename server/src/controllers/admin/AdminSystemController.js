const prisma = require('../../db');

/**
 * Controller for System Management, Bulk Operations, and Logs in the admin portal.
 */
class AdminSystemController {
    // --- Server Management ---
    async getServerHealth(req, res) {
        try {
            const os = require('os');
            const memoryUsage = process.memoryUsage();
            const uptime = process.uptime();
            
            const healthData = {
                uptime: Math.floor(uptime),
                uptimeFormatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
                memoryUsage: {
                    heapUsed: Number(Math.round(memoryUsage.heapUsed / 1024 / 1024)),
                    heapTotal: Number(Math.round(memoryUsage.heapTotal / 1024 / 1024)),
                    rss: Number(Math.round(memoryUsage.rss / 1024 / 1024))
                },
                systemMemory: {
                    total: Number(Math.round(os.totalmem() / 1024 / 1024 / 1024)),
                    free: Number(Math.round(os.freemem() / 1024 / 1024 / 1024))
                },
                cpuLoad: os.loadavg().map(n => Number(n.toFixed(2))),
                nodeVersion: process.version,
                platform: os.platform()
            };
            
            res.json({ success: true, data: healthData });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getDatabaseStats(req, res) {
        try {
            const [userCount, heroCount, monsterCount, itemCount, questCount, guildCount] = await Promise.all([
                prisma.user.count(),
                prisma.hero.count(),
                prisma.monsterTemplate.count(),
                prisma.itemTemplate.count(),
                prisma.questTemplate.count(),
                prisma.guild.count()
            ]);
            
            res.json({
                success: true,
                data: {
                    tables: {
                        users: userCount,
                        heroes: heroCount,
                        monsters: monsterCount,
                        items: itemCount,
                        quests: questCount,
                        guilds: guildCount
                    },
                    totalRecords: userCount + heroCount + monsterCount + itemCount + questCount + guildCount
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // --- Bulk Operations ---
    async bulkUpdateItems(req, res) {
        try {
            const { updates } = req.body;
            if (!Array.isArray(updates)) {
                return res.status(400).json({ success: false, error: 'Updates must be an array' });
            }
            const results = await Promise.all(
                updates.map(async (update) => {
                    const { id, ...data } = update;
                    return await prisma.itemTemplate.update({
                        where: { id: parseInt(id) },
                        data
                    });
                })
            );
            res.json({ success: true, data: { updated: results.length, items: results } });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async bulkCreateMonsters(req, res) {
        try {
            const { monsters } = req.body;
            if (!Array.isArray(monsters)) {
                return res.status(400).json({ success: false, error: 'Monsters must be an array' });
            }
            const results = await Promise.all(
                monsters.map(monster => prisma.monsterTemplate.create({ data: monster }))
            );
            res.json({ success: true, data: { created: results.length, monsters: results } });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async bulkPlayerAction(req, res) {
        try {
            const { userIds, action, amount } = req.body;
            if (!Array.isArray(userIds)) {
                return res.status(400).json({ success: false, error: 'userIds must be an array' });
            }
            let updateData = {};
            if (action === 'add_silver') updateData = { silver: { increment: amount } };
            else if (action === 'add_gold') updateData = { gold: { increment: amount } };
            else if (action === 'ban') updateData = { isBanned: true };
            else if (action === 'unban') updateData = { isBanned: false };
            
            const results = await Promise.all(
                userIds.map(userId => 
                    prisma.user.update({
                        where: { id: parseInt(userId) },
                        data: updateData
                    })
                )
            );
            res.json({ success: true, data: { affected: results.length, action } });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // --- Activity Logs ---
    async getAdminActionLogs(req, res) {
        try {
            const { page = 1, limit = 50 } = req.query;
            res.json({
                success: true,
                data: {
                    logs: [],
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: 0,
                        pages: 0
                    }
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getTransactionLogs(req, res) {
        try {
            const { page = 1, limit = 50 } = req.query;
            res.json({
                success: true,
                data: {
                    transactions: [],
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: 0,
                        pages: 0
                    }
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new AdminSystemController();
