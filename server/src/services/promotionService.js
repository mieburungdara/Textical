const prisma = require('../db');

class PromotionService {
    /**
     * AAA Class Promotion Logic (Dual-Level Aware)
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

            // 1. Requirement: Class Level 20
            if (hero.classLevel < 20) {
                throw new Error(`Promotion requires Class Level 20. Hero is currently Class Level ${hero.classLevel}.`);
            }

            // 2. Branching Check
            const targetClass = await tx.classTemplate.findUnique({ where: { id: targetClassId } });
            if (!targetClass) throw new Error("Target class not found.");

            if (targetClass.parentClassId !== hero.classId) {
                throw new Error(`Invalid branch. Class ${targetClass.name} does not evolve from ${hero.combatClass.name}.`);
            }

            // 3. Save Old Class Progress to Mastery
            await tx.heroClassMastery.upsert({
                where: { heroId_classId: { heroId, classId: hero.classId } },
                update: { level: hero.classLevel, xp: hero.classXp, isMastered: true },
                create: { heroId, classId: hero.classId, level: hero.classLevel, xp: hero.classXp, isMastered: true }
            });

            // 4. Apply Promotion (Update Class, Reset Class Level, Add Base Stat Boost)
            const PROMOTION_BONUS = 5;

            return await tx.hero.update({
                where: { id: heroId },
                data: {
                    classId: targetClassId,
                    classLevel: 1, // Professional Reset
                    classXp: 0,
                    
                    // Unit Progression is PERMANENT (No Reset)
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
