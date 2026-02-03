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
                    classId: 1001, // Recruit
                    str: 20, // AAA: Boost for immediate gathering
                    vit: 20,
                    dex: 20,
                    int: 20
                }
            });

            // AAA: Ensure Formation exists for Bot
            const preset = await prisma.formationPreset.upsert({
                where: { id: 1000 + i },
                update: { userId: user.id },
                create: {
                    id: 1000 + i,
                    userId: user.id,
                    name: "Default"
                }
            });

            await prisma.formationSlot.upsert({
                where: { presetId_heroId: { presetId: preset.id, heroId: hero.id } },
                update: { gridX: 2, gridY: 2 },
                create: { presetId: preset.id, heroId: hero.id, gridX: 2, gridY: 2 }
            });

            // AAA: Provide T1 Tools (Jumpstart for Gear Sim)
            await prisma.inventoryItem.create({
                data: { userId: user.id, templateId: 2302, quantity: 1 } // Iron Pickaxe
            });
            await prisma.inventoryItem.create({
                data: { userId: user.id, templateId: 2502, quantity: 1 } // Iron Axe
            });

            // AAA: Jumpstart Materials
            await prisma.inventoryItem.create({
                data: { userId: user.id, templateId: 2703, quantity: 10 } // Iron Bar
            });
            await prisma.inventoryItem.create({
                data: { userId: user.id, templateId: 3102, quantity: 5 } // Boar Leather
            });

            // AAA: Teach Tool & Gear Recipes
            const basicRecipes = [
                5001, 5002, 5101, 5102, // Tools
                5403, 5602,             // Iron Bar, Boar Leather
                8001, 8301, 5201        // Sword, Plate, Boots
            ];
            for (const rid of basicRecipes) {
                await prisma.userRecipe.upsert({
                    where: { userId_recipeId: { userId: user.id, recipeId: rid } },
                    update: {},
                    create: { userId: user.id, recipeId: rid }
                });
            }

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
            await prisma.userRecipe.deleteMany({ where: { userId: { in: botUserIds } } });
            await prisma.userReputation.deleteMany({ where: { userId: { in: botUserIds } } });
            await prisma.bounty.deleteMany({ where: { targetId: { in: botUserIds } } });
            await prisma.bounty.deleteMany({ where: { hunterId: { in: botUserIds } } });
            await prisma.lootSession.deleteMany({ where: { looterId: { in: botUserIds } } });
            await prisma.lootSession.deleteMany({ where: { victimId: { in: botUserIds } } });
            await prisma.wagon.deleteMany({ where: { userId: { in: botUserIds } } });
            await prisma.formationPreset.deleteMany({ where: { userId: { in: botUserIds } } });
            await prisma.inventoryItem.deleteMany({ where: { userId: { in: botUserIds } } });
            await prisma.marketOrder.deleteMany({ where: { creatorId: { in: botUserIds } } });
            await prisma.taskQueue.deleteMany({ where: { userId: { in: botUserIds } } });
            await prisma.transactionLedger.deleteMany({ where: { userId: { in: botUserIds } } });
            await prisma.user.deleteMany({ where: { id: { in: botUserIds } } });
        }
    }
}

module.exports = new BotFactory();
