const BaseService = require('./BaseService');

/**
 * PromotionService
 * Handles Hero Class Advancement (Promotion).
 */
class PromotionService extends BaseService {
    /**
     * Attempts to promote a hero to a target class.
     */
    async promoteHero(heroId, targetClassId) {
        const hero = await this.db.hero.findUnique({
            where: { id: heroId },
            include: { combatClass: true }
        });

        if (!hero) throw new Error("Hero not found");

        const targetClass = await this.db.classTemplate.findUnique({
            where: { id: targetClassId }
        });

        if (!targetClass) throw new Error("Target class template not found");

        // 1. Level Requirement Check
        if (hero.level < hero.combatClass.promotionReqLevel) {
            throw new Error(`Hero is only Level ${hero.level}. Needs Level ${hero.combatClass.promotionReqLevel} to promote.`);
        }

        // 2. Hierarchy Check (Must be a child class)
        if (targetClass.parentClassId !== hero.classId) {
            throw new Error(`The class ${targetClass.name} is not a valid promotion for ${hero.combatClass.name}.`);
        }

        // 3. Execution
        return await this.db.hero.update({
            where: { id: heroId },
            data: { 
                classId: targetClassId,
                // Optional: Reset level or keep progress? Standard AAA: Keep level, reset XP?
                // For Textical, let's keep everything but update identity.
            },
            include: { combatClass: true }
        });
    }

    /**
     * Gets available promotion options for a hero.
     */
    async getEligiblePromotions(heroId) {
        const hero = await this.db.hero.findUnique({ where: { id: heroId } });
        if (!hero) return [];

        return await this.db.classTemplate.findMany({
            where: { parentClassId: hero.classId }
        });
    }
}

module.exports = new PromotionService();
