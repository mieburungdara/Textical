const BaseService = require('./BaseService');
const xpFormula = require('../logic/progression/XPFormula');

/**
 * ProgressionService
 * Orchestrates hero growth and professional mastery.
 */
class ProgressionService extends BaseService {
    constructor() {
        super();
    }

    getRequiredXP(level) {
        return xpFormula.calculateRequiredXP(level);
    }

    async addHeroExperience(heroId, amount) {
        return await this.runTransaction(async (tx) => {
            const hero = await tx.hero.findUnique({
                where: { id: heroId },
                include: { combatClass: true }
            });

            if (!hero) throw new Error("Hero not found.");

            // 1. Process Physical Progression
            const newUnitXp = hero.unitXp + amount;
            const newUnitLevel = xpFormula.calculateLevelFromXP(hero.unitLevel, newUnitXp);
            const unitLeveledUp = newUnitLevel > hero.unitLevel;

            // 2. Process Professional Progression
            const newClassXp = hero.classXp + amount;
            const newClassLevel = xpFormula.calculateLevelFromXP(hero.classLevel, newClassXp);
            const classLeveledUp = newClassLevel > hero.classLevel;

            // 3. Apply Updates
            const updateData = {
                unitXp: newUnitXp, unitLevel: newUnitLevel,
                classXp: newClassXp, classLevel: newClassLevel,
                xp: newUnitXp, level: newUnitLevel
            };

            if (unitLeveledUp) {
                const boost = (newUnitLevel - hero.unitLevel) * 2;
                updateData.str = { increment: boost };
                updateData.dex = { increment: boost };
                updateData.int = { increment: boost };
                updateData.vit = { increment: boost };
            }

            const updatedHero = await tx.hero.update({ where: { id: heroId }, data: updateData });

            // 4. Archive Mastery
            await tx.heroClassMastery.upsert({
                where: { heroId_classId: { heroId, classId: hero.classId } },
                update: { level: newClassLevel, xp: newClassXp },
                create: { heroId, classId: hero.classId, level: newClassLevel, xp: newClassXp }
            });

            // 5. Check Skill Unlocks
            const unlockedSkills = [];
            if (classLeveledUp) {
                const potential = await tx.classSkillTree.findMany({
                    where: { classId: hero.classId, unlockLevel: { lte: newClassLevel } },
                    include: { skill: true }
                });

                for (const ps of potential) {
                    const existing = await tx.heroSkill.findUnique({ where: { heroId_skillId: { heroId, skillId: ps.skillId } } });
                    if (!existing) {
                        await tx.heroSkill.create({ data: { heroId, skillId: ps.skillId } });
                        unlockedSkills.push(ps.skill.name);
                    }
                }
            }

            this.log(`Hero ${hero.name} processed +${amount} XP.`, "Progression");
            return { hero: updatedHero, unitLeveledUp, classLeveledUp, unlockedSkills };
        });
    }
}

module.exports = new ProgressionService();