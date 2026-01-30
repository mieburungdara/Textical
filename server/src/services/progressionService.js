const prisma = require('../db');

/**
 * AAA Progression Service (Dual-Level Architecture)
 * Handles Unit XP (Physical) and Class XP (Professional).
 */
class ProgressionService {
    constructor() {
        this.BASE_XP = 100;
        this.EXPONENT = 1.55;
        this.LINEAR_FACTOR = 45;
    }

    /**
     * Calculates total XP required to reach a specific level.
     */
    getRequiredXP(level) {
        if (level <= 1) return 0;
        const prevLevel = level - 1;
        const exponentialPart = this.BASE_XP * Math.pow(prevLevel, this.EXPONENT);
        const linearPart = this.LINEAR_FACTOR * prevLevel;
        return Math.floor(exponentialPart + linearPart);
    }

    /**
     * Checks if a hero can level up and returns the new level.
     */
    calculateNewLevel(currentLevel, totalXP) {
        let newLevel = currentLevel;
        while (true) {
            const nextLevelXP = this.getRequiredXP(newLevel + 1);
            if (totalXP >= nextLevelXP) {
                newLevel++;
            } else {
                break;
            }
        }
        return newLevel;
    }

    /**
     * Core Logic: Adds XP to both Unit and Active Class.
     * Handles level-up bonuses and mastery syncing.
     */
    async addHeroExperience(heroId, amount) {
        return await prisma.$transaction(async (tx) => {
            const hero = await tx.hero.findUnique({
                where: { id: heroId },
                include: { combatClass: true }
            });

            if (!hero) throw new Error("Hero not found.");

            // 1. Process Unit Progression (Physical)
            const newUnitXp = hero.unitXp + amount;
            const newUnitLevel = this.calculateNewLevel(hero.unitLevel, newUnitXp);
            const unitLeveledUp = newUnitLevel > hero.unitLevel;

            // 2. Process Class Progression (Professional)
            const newClassXp = hero.classXp + amount;
            const newClassLevel = this.calculateNewLevel(hero.classLevel, newClassXp);
            const classLeveledUp = newClassLevel > hero.classLevel;

            // 3. Prepare Update Data
            const updateData = {
                unitXp: newUnitXp,
                unitLevel: newUnitLevel,
                classXp: newClassXp,
                classLevel: newClassLevel,
                
                // Keep legacy fields in sync for now
                xp: newUnitXp,
                level: newUnitLevel
            };

            // If Unit levels up, grant physical attribute boost
            if (unitLeveledUp) {
                const levelsGained = newUnitLevel - hero.unitLevel;
                const ATTR_PER_LEVEL = 2; // Flat 2 points to all per level for now
                updateData.str = { increment: levelsGained * ATTR_PER_LEVEL };
                updateData.dex = { increment: levelsGained * ATTR_PER_LEVEL };
                updateData.int = { increment: levelsGained * ATTR_PER_LEVEL };
                updateData.vit = { increment: levelsGained * ATTR_PER_LEVEL };
            }

            const updatedHero = await tx.hero.update({
                where: { id: heroId },
                data: updateData
            });

            // 4. Sync Mastery Table
            await tx.heroClassMastery.upsert({
                where: { heroId_classId: { heroId, classId: hero.classId } },
                update: { level: newClassLevel, xp: newClassXp },
                create: { heroId, classId: hero.classId, level: newClassLevel, xp: newClassXp }
            });

            return {
                hero: updatedHero,
                unitLeveledUp,
                classLeveledUp,
                xpGained: amount
            };
        });
    }
}

module.exports = new ProgressionService();