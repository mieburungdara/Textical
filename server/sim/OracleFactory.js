const prisma = require('../src/db');

/**
 * BotFactory
 * Mass generates test agents with specific archetypes.
 */
class BotFactory {
    constructor() {
        this.ARCHETYPES = ["GATHERER", "CRAFTER", "WARRIOR", "OUTLAW"];
    }

    /**
     * Spawns 100 bots into the database.
     */
    async spawnBots(count = 100) {
        console.log(`🤖 Spawning ${count} bots...`);
        const bots = [];

        for (let i = 1; i <= count; i++) {
            const username = `Bot_${i.toString().padStart(3, '0')}`;
            const archetype = this.ARCHETYPES[Math.floor(Math.random() * this.ARCHETYPES.length)];

            const user = await prisma.user.upsert({
                where: { username },
                update: { silver: 5000, currentRegion: 1 },
                create: {
                    username,
                    password: "bot_password",
                    silver: 5000,
                    currentRegion: 1
                }
            });

            // Ensure Hero exists for Bot
            const hero = await prisma.hero.upsert({
                where: { id: 1000 + i }, // Offset for bots
                update: { userId: user.id },
                create: {
                    id: 1000 + i,
                    userId: user.id,
                    name: `${username}_Pahlawan`,
                    unitLevel: 1,
                    isMain: true,
                    classId: 1001 // Recruit
                }
            });

            bots.push({ userId: user.id, archetype });
        }

        console.log(`✅ ${count} bots ready for simulation.`);
        return bots;
    }

    async cleanupBots() {
        console.log("🧹 Cleaning up old bots and their dependencies...");
        const botHeroes = await prisma.hero.findMany({ where: { id: { gte: 1000 } } });
        const botHeroIds = botHeroes.map(h => h.id);

        if (botHeroIds.length > 0) {
            await prisma.heroEquipment.deleteMany({ where: { heroId: { in: botHeroIds } } });
            await prisma.heroSkill.deleteMany({ where: { heroId: { in: botHeroIds } } });
            await prisma.heroBuff.deleteMany({ where: { heroId: { in: botHeroIds } } });
            await prisma.heroTrait.deleteMany({ where: { heroId: { in: botHeroIds } } });
            await prisma.heroClassMastery.deleteMany({ where: { heroId: { in: botHeroIds } } });
            await prisma.formationSlot.deleteMany({ where: { heroId: { in: botHeroIds } } });
            await prisma.taskQueue.deleteMany({ where: { heroId: { in: botHeroIds } } });
            await prisma.hero.deleteMany({ where: { id: { in: botHeroIds } } });
        }

        // Cleanup bot users and their dependencies
        const botUsers = await prisma.user.findMany({ where: { username: { startsWith: "Bot_" } } });
        const botUserIds = botUsers.map(u => u.id);

        if (botUserIds.length > 0) {
            await prisma.inventoryItem.deleteMany({ where: { userId: { in: botUserIds } } });
            await prisma.marketOrder.deleteMany({ where: { creatorId: { in: botUserIds } } });
            await prisma.taskQueue.deleteMany({ where: { userId: { in: botUserIds } } });
            await prisma.transactionLedger.deleteMany({ where: { userId: { in: botUserIds } } });
            await prisma.user.deleteMany({ where: { id: { in: botUserIds } } });
        }
    }
}

module.exports = new BotFactory();
