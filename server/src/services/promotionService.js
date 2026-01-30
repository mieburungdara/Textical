const prisma = require('../db');

class PromotionService {
    /**
     * AAA Class Promotion Logic
     * @param {number} heroId 
     * @param {number} targetClassId 
     */
    async promoteHero(heroId, targetClassId) {
        return await prisma.$transaction(async (tx) => {
            const hero = await tx.hero.findUnique({
                where: { id: heroId },
                include: { combatClass: true }
            });

            if (!hero) throw new Error("Hero not found.");

            // 1. Requirement: Level 20
            if (hero.level < 20) {
                throw new Error(`Promotion requires Level 20. Hero is currently Level ${hero.level}.`);
            }

            // 2. Branching Check
            const targetClass = await tx.classTemplate.findUnique({ where: { id: targetClassId } });
            if (!targetClass) throw new Error("Target class not found.");

            if (targetClass.parentClassId !== hero.classId) {
                throw new Error(`Invalid branch. Class ${targetClass.name} does not evolve from ${hero.combatClass.name}.`);
            }

            // 3. Apply Promotion (Update Class, Reset Level, Add Base Stat Boost)
            const PROMOTION_BONUS = 5;

            return await tx.hero.update({
                where: { id: heroId },
                data: {
                    classId: targetClassId,
                    level: 1,
                    xp: 0,
                    str: { increment: PROMOTION_BONUS },
                    dex: { increment: PROMOTION_BONUS },
                    int: { increment: PROMOTION_BONUS },
                    vit: { increment: PROMOTION_BONUS }
                }
            });
        });
    }
}

module.exports = new PromotionService();