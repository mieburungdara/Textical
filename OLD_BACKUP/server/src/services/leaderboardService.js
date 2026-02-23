const prisma = new (require('@prisma/client').PrismaClient)();
const economyService = require('./economyService');

class LeaderboardService {
    /**
     * Ranks players by total wealth (All currency tiers converted to Copper).
     */
    async getWealthLeaderboard(limit = 10) {
        const users = await prisma.user.findMany({
            select: { id: true, username: true, copper: true, silver: true, gold: true, platinum: true, mithril: true }
        });

        // Calculate absolute copper value for each user
        const ranked = users.map(u => ({
            id: u.id,
            username: u.username,
            totalCopper: economyService.getTotalValueInCopper(u).toString() // Using string for BigInt safety
        }));

        // Sort descending
        return ranked.sort((a, b) => {
            if (a.totalCopper.length !== b.totalCopper.length) return b.totalCopper.length - a.totalCopper.length;
            return b.totalCopper.localeCompare(a.totalCopper);
        }).slice(0, limit);
    }

    /**
     * Ranks guilds by the number of territories they own.
     */
    async getTerritoryLeaderboard(limit = 10) {
        return await prisma.guild.findMany({
            select: {
                id: true,
                name: true,
                _count: {
                    select: { territories: true }
                }
            },
            orderBy: {
                territories: { _count: 'desc' }
            },
            take: limit
        });
    }

    /**
     * Ranks players by their "Dynasty Power" (Sum of levels of top 5 heroes).
     */
    async getPowerLeaderboard(limit = 10) {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                heroes: {
                    orderBy: { level: 'desc' },
                    take: 5,
                    select: { level: true }
                }
            }
        });

        const ranked = users.map(u => ({
            id: u.id,
            username: u.username,
            totalPower: u.heroes.reduce((sum, h) => sum + h.level, 0)
        }));

        return ranked.sort((a, b) => b.totalPower - a.totalPower).slice(0, limit);
    }
}

module.exports = new LeaderboardService();
