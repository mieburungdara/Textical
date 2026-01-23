const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

class DatabaseManager {
    // ... (User & Hero Management remain) ...

    async createUser(username, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            return await prisma.user.create({ data: { username, password: hashedPassword, gold: 500 } });
        } catch (e) { return null; }
    }

    async verifyUser(username, password) {
        return await prisma.user.findUnique({ where: { username }, include: { heroes: true, inventory: true } });
    }

    async getUserData(username) {
        return await prisma.user.findUnique({ where: { username }, include: { heroes: true, inventory: true } });
    }

    async createHero(userId, templateId, name, stats = {}) {
        return await prisma.hero.create({
            data: {
                userId, templateId, name,
                race: stats.race || "human",
                gender: stats.gender || "MALE",
                classTier: stats.classTier || 1,
                baseStats: JSON.stringify(stats),
                equipment: JSON.stringify({}),
                deeds: JSON.stringify({}),
                naturalTraits: JSON.stringify(stats.naturalTraits || []),
                acquiredTraits: JSON.stringify([]),
                unlockedBehaviors: JSON.stringify(["balanced"])
            }
        });
    }

    /**
     * AAA PERMADEATH LOGIC:
     * Removes from main table. Moves to Hall of Fame if Legendary.
     */
    async handleHeroDeath(hero, ownerName, cause) {
        const isLegendary = hero.level >= 100 && hero.classTier >= 3;

        if (isLegendary) {
            console.log(`[HOF] Legendary Hero ${hero.name} has fallen! Archiving...`);
            await prisma.hallOfFame.create({
                data: {
                    originalId: hero.id,
                    ownerName: ownerName,
                    name: hero.name,
                    race: hero.race,
                    gender: hero.gender,
                    level: hero.level,
                    classTier: hero.classTier,
                    generation: hero.generation,
                    finalDeeds: hero.deeds,
                    causeOfDeath: cause
                }
            });
        }

        // Always delete from main hero table
        await prisma.hero.delete({ where: { id: hero.id } });
        return isLegendary;
    }

    // ... (Existing update functions) ...
    async updateHeroProgression(heroId, newDeeds, acquiredTraits, unlockedBehaviors) {
        return await prisma.hero.update({
            where: { id: heroId },
            data: {
                deeds: JSON.stringify(newDeeds),
                acquiredTraits: JSON.stringify(acquiredTraits),
                unlockedBehaviors: JSON.stringify(unlockedBehaviors)
            }
        });
    }

    async markReproduced(heroId) { return await prisma.hero.update({ where: { id: heroId }, data: { hasReproduced: true } }); }
    
    async updateHeroLineage(heroId, data) {
        return await prisma.hero.update({
            where: { id: heroId },
            data: {
                gender: data.gender, fatherId: data.fatherId, motherId: data.motherId,
                generation: data.generation, naturalTraits: data.naturalTraits
            }
        });
    }

    async addItem(userId, templateId, quantity = 1, uniqueData = {}) {
        const isStackable = Object.keys(uniqueData).length === 0;
        if (isStackable) {
            const existing = await prisma.inventoryItem.findFirst({ where: { userId, templateId, isEquipped: false } });
            if (existing) return await prisma.inventoryItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + quantity } });
        }
        return await prisma.inventoryItem.create({ data: { userId, templateId, quantity, uniqueData: JSON.stringify(uniqueData) } });
    }
}

const db = new DatabaseManager();
module.exports = db;
