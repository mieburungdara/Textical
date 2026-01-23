const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

class DatabaseManager {
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

    async updateUserGold(userId, amount) {
        return await prisma.user.update({ where: { id: userId }, data: { gold: amount } });
    }

    async updateHeroExp(heroId, level, exp) {
        return await prisma.hero.update({ where: { id: heroId }, data: { level, exp } });
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

    async equipItem(userId, heroId, itemId, slot) {
        const item = await prisma.inventoryItem.findFirst({ where: { id: itemId, userId } });
        const hero = await prisma.hero.findUnique({ where: { id: heroId } });
        const equipment = JSON.parse(hero.equipment || "{}");
        if (equipment[slot]) await this.unequipItem(userId, heroId, slot);
        equipment[slot] = itemId;
        await prisma.hero.update({ where: { id: heroId }, data: { equipment: JSON.stringify(equipment) } });
        return await prisma.inventoryItem.update({ where: { id: itemId }, data: { isEquipped: true } });
    }

    async unequipItem(userId, heroId, slot) {
        const hero = await prisma.hero.findUnique({ where: { id: heroId } });
        const equipment = JSON.parse(hero.equipment || "{}");
        const itemId = equipment[slot];
        if (!itemId) return;
        delete equipment[slot];
        await prisma.hero.update({ where: { id: heroId }, data: { equipment: JSON.stringify(equipment) } });
        return await prisma.inventoryItem.update({ where: { id: itemId }, data: { isEquipped: false } });
    }

    async handleHeroDeath(hero, ownerName, cause) {
        const isLegendary = hero.level >= 100 && hero.classTier >= 3;
        if (isLegendary) {
            await prisma.hallOfFame.create({
                data: {
                    originalId: hero.id, ownerName, name: hero.name, race: hero.race,
                    gender: hero.gender, level: hero.level, classTier: hero.classTier,
                    generation: hero.generation, finalDeeds: hero.deeds, causeOfDeath: cause
                }
            });
        }
        await prisma.hero.delete({ where: { id: hero.id } });
        return isLegendary;
    }

    async updateHeroProgression(heroId, newDeeds, acquiredTraits, unlockedBehaviors) {
        return await prisma.hero.update({ where: { id: heroId }, data: { deeds: JSON.stringify(newDeeds), acquiredTraits: JSON.stringify(acquiredTraits), unlockedBehaviors: JSON.stringify(unlockedBehaviors) } });
    }

    async markReproduced(heroId) { return await prisma.hero.update({ where: { id: heroId }, data: { hasReproduced: true } }); }
    async updateHeroLineage(heroId, data) { return await prisma.hero.update({ where: { id: heroId }, data: { gender: data.gender, fatherId: data.fatherId, motherId: data.motherId, generation: data.generation, naturalTraits: data.naturalTraits } }); }

    async addItem(userId, templateId, quantity = 1, uniqueData = {}) {
        const isStackable = Object.keys(uniqueData).length === 0;
        if (isStackable) {
            const existing = await prisma.inventoryItem.findFirst({ where: { userId, templateId, isEquipped: false } });
            if (existing) return await prisma.inventoryItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + quantity } });
        }
        return await prisma.inventoryItem.create({ data: { userId, templateId, quantity, uniqueData: JSON.stringify(uniqueData) } });
    }
}

module.exports = new DatabaseManager();
