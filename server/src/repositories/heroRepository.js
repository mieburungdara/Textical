const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class HeroRepository {
    async create(userId, templateId, name, stats = {}) {
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

    async findById(heroId) {
        return await prisma.hero.findUnique({ where: { id: heroId } });
    }

    async updateProgression(heroId, deeds, acquiredTraits, unlockedBehaviors) {
        return await prisma.hero.update({
            where: { id: heroId },
            data: { deeds: JSON.stringify(deeds), acquiredTraits: JSON.stringify(acquiredTraits), unlockedBehaviors: JSON.stringify(unlockedBehaviors) }
        });
    }

    async updateLineage(heroId, data) {
        return await prisma.hero.update({ where: { id: heroId }, data });
    }

    async markReproduced(heroId) {
        return await prisma.hero.update({ where: { id: heroId }, data: { hasReproduced: true } });
    }

    async delete(heroId) {
        return await prisma.hero.delete({ where: { id: heroId } });
    }

    async archiveToHallOfFame(hero, ownerName, cause) {
        return await prisma.hallOfFame.create({
            data: {
                originalId: hero.id, ownerName, name: hero.name, race: hero.race,
                gender: hero.gender, level: hero.level, classTier: hero.classTier,
                generation: hero.generation, finalDeeds: hero.deeds, causeOfDeath: cause
            }
        });
    }
}

module.exports = new HeroRepository();
