const prisma = require('../db');

class HeroRepository {
    /**
     * Create a new hero for a user.
     * @param {number} userId - The owner's user ID.
     * @param {string} className - Initial class template name.
     * @param {string} name - Hero name.
     * @param {Object} stats - Initial stats object.
     * @returns {Promise<Object>} The created hero.
     */
    async create(userId, className, name, stats = {}) {
        // Find the starting class
        const classTemplate = await prisma.classTemplate.findFirst({ where: { name: className } });

        return await prisma.hero.create({
            data: {
                userId,
                classId: classTemplate?.id || 1,
                name,
                race: (stats.race || 'HUMAN').toUpperCase(),
                hp_base: stats.hp_base || 100,
                damage_base: stats.damage_base || 10,
                speed_base: stats.speed_base || 5,
                str: stats.str || 10,
                dex: stats.dex || 10,
                int: stats.int || 10,
                def: stats.def || 10,
            }
        });
    }

    /**
     * Find a hero by its ID.
     * @param {number} heroId - The hero ID.
     * @returns {Promise<Object|null>} The hero with equipment relation.
     */
    async findById(heroId) {
        const id = parseInt(heroId);
        if (isNaN(id)) return null;
        return await prisma.hero.findUnique({
            where: { id },
            include: {
                equipment: {
                    include: {
                        itemInstance: {
                            include: { template: true }
                        }
                    }
                },
                traits: true,
                buffs: true,
            }
        });
    }

    /**
     * Update hero's data fields.
     * @param {number} heroId - The hero ID.
     * @param {Object} data - Fields to update.
     * @returns {Promise<Object>} Updated hero.
     */
    async updateLineage(heroId, data) {
        const id = parseInt(heroId);
        return await prisma.hero.update({ where: { id }, data });
    }

    /**
     * Mark a hero as having reproduced.
     * @param {number} heroId - The hero ID.
     * @returns {Promise<Object>} Updated hero.
     */
    async markReproduced(heroId) {
        const id = parseInt(heroId);
        return await prisma.hero.update({ where: { id }, data: { hasOffspring: true } });
    }

    /**
     * Delete a hero by ID.
     * @param {number} heroId - The hero ID.
     * @returns {Promise<void>}
     */
    async delete(heroId) {
        const id = parseInt(heroId);
        return await prisma.hero.delete({ where: { id } });
    }

    /**
     * Archive a hero to the Hall of Fame.
     * @param {Object} hero - The hero object.
     * @param {string} ownerName - The owner's username.
     * @param {string} cause - Cause of death.
     * @returns {Promise<Object>} The created HallOfFame entry.
     */
    async archiveToHallOfFame(hero, ownerName, cause) {
        return await prisma.hallOfFame.create({
            data: {
                originalId: hero.id,
                ownerName,
                name: hero.name,
                race: hero.race,
                generation: hero.generation,
                causeOfDeath: cause,
                level: hero.level,
            }
        });
    }
}

module.exports = new HeroRepository();
