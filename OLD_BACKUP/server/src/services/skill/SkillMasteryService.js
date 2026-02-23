/**
 * SkillMasteryService
 * Handles skill specialization/mastery system:
 * - Track skill usage counts
 * - Calculate mastery levels based on use counts
 * - Apply mastery bonuses to combat
 * 
 * Mastery Levels:
 * - Novice: 0 uses (no bonus)
 * - Apprentice: 100 uses (+5% skill damage)
 * - Expert: 250 uses (+10% skill damage, +5% effect duration)
 * - Master: 500 uses (+15% skill damage, +10% effect duration, +5% crit chance)
 * - Grandmaster: 1000 uses (+20% skill damage, +15% effect duration, +10% crit chance, +10% cost reduction)
 */
const prisma = require('../../db');
const logger = require('../../utils/logger');


class SkillMasteryService {
    constructor() {
        // Mastery thresholds
        this.THRESHOLDS = {
            NOVICE: 0,
            APPRENTICE: 100,
            EXPERT: 250,
            MASTER: 500,
            GRANDMASTER: 1000
        };
        
        // Bonus values per level
        this.BONUSES = {
            NOVICE: { skillDamage: 0, effectDuration: 0, critChance: 0, costReduction: 0 },
            APPRENTICE: { skillDamage: 0.05, effectDuration: 0, critChance: 0, costReduction: 0 },
            EXPERT: { skillDamage: 0.10, effectDuration: 0.05, critChance: 0, costReduction: 0 },
            MASTER: { skillDamage: 0.15, effectDuration: 0.10, critChance: 0.05, costReduction: 0 },
            GRANDMASTER: { skillDamage: 0.20, effectDuration: 0.15, critChance: 0.10, costReduction: 0.10 }
        };
    }

    /**
     * Get mastery level based on use count
     */
    getMasteryLevel(useCount) {
        if (useCount >= this.THRESHOLDS.GRANDMASTER) return 'GRANDMASTER';
        if (useCount >= this.THRESHOLDS.MASTER) return 'MASTER';
        if (useCount >= this.THRESHOLDS.EXPERT) return 'EXPERT';
        if (useCount >= this.THRESHOLDS.APPRENTICE) return 'APPRENTICE';
        return 'NOVICE';
    }

    /**
     * Get bonuses for a mastery level
     */
    getBonuses(level) {
        return this.BONUSES[level] || this.BONUSES.NOVICE;
    }

    /**
     * Record skill usage and update mastery
     * @param {number} userId - User ID
     * @param {number} heroId - Hero ID
     * @param {number} skillId - Skill ID
     * @returns {Object} Updated mastery data
     */
    async recordSkillUse(userId, heroId, skillId) {
        logger.debug(`[SkillMasteryService.recordSkillUse] userId=${userId}, heroId=${heroId}, skillId=${skillId}`);
        
        try {
            // Find or create mastery record
            let mastery = await prisma.skillMastery.findUnique({
                where: { heroId_skillId: { heroId, skillId } }
            });

            const oldLevel = mastery ? mastery.level : 'NOVICE';
            const oldUseCount = mastery ? mastery.useCount : 0;

            if (mastery) {
                // Increment use count
                mastery = await prisma.skillMastery.update({
                    where: { id: mastery.id },
                    data: {
                        useCount: { increment: 1 }
                    }
                });
            } else {
                // Create new mastery record
                mastery = await prisma.skillMastery.create({
                    data: {
                        userId,
                        heroId,
                        skillId,
                        useCount: 1,
                        level: 'NOVICE'
                    }
                });
            }

            // Check for level up
            const newLevel = this.getMasteryLevel(mastery.useCount);
            
            if (newLevel !== oldLevel) {
                // Update level
                mastery = await prisma.skillMastery.update({
                    where: { id: mastery.id },
                    data: { level: newLevel }
                });

                logger.info(`[SkillMasteryService] Skill mastery level up! heroId=${heroId}, skillId=${skillId}, ${oldLevel} -> ${newLevel} (${mastery.useCount} uses)`);

                return {
                    leveledUp: true,
                    oldLevel,
                    newLevel,
                    useCount: mastery.useCount,
                    bonuses: this.getBonuses(newLevel)
                };
            }

            return {
                leveledUp: false,
                level: newLevel,
                useCount: mastery.useCount,
                bonuses: this.getBonuses(newLevel)
            };
        } catch (error) {
            logger.error(`[SkillMasteryService.recordSkillUse] Error: ${error.message}`, { 
                userId, heroId, skillId, stack: error.stack 
            });
            throw error;
        }
    }

    /**
     * Get mastery data for a hero's skill
     */
    async getMastery(heroId, skillId) {
        try {
            const mastery = await prisma.skillMastery.findUnique({
                where: { heroId_skillId: { heroId, skillId } }
            });

            if (!mastery) {
                return {
                    exists: false,
                    level: 'NOVICE',
                    useCount: 0,
                    bonuses: this.BONUSES.NOVICE
                };
            }

            return {
                exists: true,
                level: mastery.level,
                useCount: mastery.useCount,
                bonuses: this.getBonuses(mastery.level)
            };
        } catch (error) {
            logger.error(`[SkillMasteryService.getMastery] Error: ${error.message}`, { heroId, skillId });
            return null;
        }
    }

    /**
     * Get all mastery data for a hero
     */
    async getHeroMasteries(heroId) {
        try {
            const masteries = await prisma.skillMastery.findMany({
                where: { heroId },
                orderBy: { useCount: 'desc' }
            });

            return masteries.map(m => ({
                skillId: m.skillId,
                level: m.level,
                useCount: m.useCount,
                bonuses: this.getBonuses(m.level)
            }));
        } catch (error) {
            logger.error(`[SkillMasteryService.getHeroMasteries] Error: ${error.message}`, { heroId });
            return [];
        }
    }

    /**
     * Get mastery bonuses for combat calculations
     * @param {number} heroId - Hero ID
     * @param {number} skillId - Skill ID
     * @returns {Object} Combined bonuses object
     */
    async getCombatBonuses(heroId, skillId) {
        const mastery = await this.getMastery(heroId, skillId);
        if (!mastery || !mastery.exists) {
            return {
                skillDamageMultiplier: 1.0,
                effectDurationMultiplier: 1.0,
                critChanceBonus: 0,
                costReductionMultiplier: 1.0
            };
        }

        const bonuses = mastery.bonuses;

        return {
            skillDamageMultiplier: 1.0 + bonuses.skillDamage,
            effectDurationMultiplier: 1.0 + bonuses.effectDuration,
            critChanceBonus: bonuses.critChance,
            costReductionMultiplier: 1.0 - bonuses.costReduction
        };
    }

    /**
     * Apply mastery bonuses to skill damage calculation
     * @param {number} baseDamage - Base skill damage
     * @param {Object} bonuses - Bonuses from getCombatBonuses
     * @returns {number} Final damage with bonuses applied
     */
    applyDamageBonus(baseDamage, bonuses) {
        return Math.floor(baseDamage * bonuses.skillDamageMultiplier);
    }

    /**
     * Apply mastery bonuses to effect duration
     * @param {number} baseDuration - Base effect duration (in turns)
     * @param {Object} bonuses - Bonuses from getCombatBonuses
     * @returns {number} Final duration with bonuses applied
     */
    applyDurationBonus(baseDuration, bonuses) {
        return Math.floor(baseDuration * bonuses.effectDurationMultiplier);
    }

    /**
     * Apply mastery bonus to skill cost (mana/energy)
     * @param {number} baseCost - Base skill cost
     * @param {Object} bonuses - Bonuses from getCombatBonuses
     * @returns {number} Final cost with reduction applied
     */
    applyCostReduction(baseCost, bonuses) {
        return Math.max(1, Math.floor(baseCost * bonuses.costReductionMultiplier));
    }

    /**
     * Seed mastery rewards (called once during initialization)
     */
    async seedRewards() {
        const rewards = [
            {
                level: 'APPRENTICE',
                usesRequired: 100,
                skillDamageBonus: 0.05,
                effectDurationBonus: 0,
                critChanceBonus: 0,
                costReduction: 0,
                description: '+5% Skill Damage'
            },
            {
                level: 'EXPERT',
                usesRequired: 250,
                skillDamageBonus: 0.10,
                effectDurationBonus: 0.05,
                critChanceBonus: 0,
                costReduction: 0,
                description: '+10% Skill Damage, +5% Effect Duration'
            },
            {
                level: 'MASTER',
                usesRequired: 500,
                skillDamageBonus: 0.15,
                effectDurationBonus: 0.10,
                critChanceBonus: 0.05,
                costReduction: 0,
                description: '+15% Skill Damage, +10% Effect Duration, +5% Crit Chance'
            },
            {
                level: 'GRANDMASTER',
                usesRequired: 1000,
                skillDamageBonus: 0.20,
                effectDurationBonus: 0.15,
                critChanceBonus: 0.10,
                costReduction: 0.10,
                description: '+20% Skill Damage, +15% Effect Duration, +10% Crit Chance, +10% Cost Reduction'
            }
        ];

        for (const reward of rewards) {
            await prisma.skillMasteryReward.upsert({
                where: { level: reward.level },
                update: reward,
                create: reward
            });
        }

        logger.info('[SkillMasteryService] Mastery rewards seeded successfully');
    }
}

module.exports = new SkillMasteryService();
