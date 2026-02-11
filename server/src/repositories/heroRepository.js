const prisma = require('../db');

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
        const id = parseInt(heroId);
        if (isNaN(id)) return null;
        return await prisma.hero.findUnique({ where: { id } });
    }

    async updateProgression(heroId, deeds, acquiredTraits, unlockedBehaviors) {
        const id = parseInt(heroId);
        return await prisma.hero.update({
            where: { id },
            data: { deeds: JSON.stringify(deeds), acquiredTraits: JSON.stringify(acquiredTraits), unlockedBehaviors: JSON.stringify(unlockedBehaviors) }
        });
    }

    async updateLineage(heroId, data) {
        const id = parseInt(heroId);
        return await prisma.hero.update({ where: { id }, data });
    }

    async markReproduced(heroId) {
        const id = parseInt(heroId);
        return await prisma.hero.update({ where: { id }, data: { hasReproduced: true } });
    }

    async delete(heroId) {
        const id = parseInt(heroId);
        return await prisma.hero.delete({ where: { id } });
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
