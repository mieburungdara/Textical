/**
 * CraftingFailResolver
 * 
 * Handles the crafting fail system with risk/reward mechanics.
 * 
 * Features:
 * - Base success rate: 40% (Very Hard)
 * - Failure outcomes: Safe Fail (30%), Quality Drop (25%), Item Destroyed (25%), Catastrophic (20%)
 * - Profession system: BLACKSMITH, ENCHANTER, ALCHEMIST, TAILOR
 * - Skill-based mitigation to reduce failure chance
 * - Rank progression: Novice → Grandmaster
 */

// Profession types
const PROFESSIONS = {
    BLACKSMITH: 'BLACKSMITH',
    ENCHANTER: 'ENCHANTER',
    ALCHEMIST: 'ALCHEMIST',
    TAILOR: 'TAILOR'
};

// Rank levels
const RANKS = {
    NOVICE: { level: 1, failReduction: 0, name: 'Novice' },
    APPRENTICE: { level: 2, failReduction: 0.10, name: 'Apprentice' },
    EXPERT: { level: 3, failReduction: 0.20, qualityProtection: true, name: 'Expert' },
    MASTER: { level: 4, failReduction: 0.30, noCatastrophic: true, name: 'Master' },
    GRANDMASTER: { level: 5, failReduction: 0.40, guaranteedSuccess: true, name: 'Grandmaster' }
};

// Failure outcome weights (normalized to sum to 1)
const FAILURE_OUTCOMES = {
    SAFE_FAIL: { weight: 0.30, name: 'Safe Fail', description: 'Materials lost, item not created' },
    QUALITY_DROP: { weight: 0.25, name: 'Quality Drop', description: 'Item created but -20% quality' },
    DESTROYED: { weight: 0.25, name: 'Item Destroyed', description: 'Existing item (if upgrading) destroyed' },
    CATASTROPHIC: { weight: 0.20, name: 'Catastrophic', description: 'All materials + tools lost' }
};

// Base success rate for high-tier items (Very Hard)
const BASE_SUCCESS_RATE = 0.40;

// Minimum level requirement for fail system to apply
const FAIL_SYSTEM_MIN_LEVEL = 50;

// Rarities that trigger the fail system
const FAIL_SYSTEM_RARITIES = ['EPIC', 'LEGENDARY'];

// Experience required per level
const EXP_PER_LEVEL = 100;

class CraftingFailResolver {
    /**
     * Check if fail system applies to this item
     * @param {string} rarity - Item rarity
     * @returns {boolean}
     */
    shouldApplyFailSystem(rarity) {
        return FAIL_SYSTEM_RARITIES.includes(rarity);
    }

    /**
     * Get profession from recipe category
     * @param {string} category - Item category
     * @returns {string}
     */
    getProfessionFromCategory(category) {
        const categoryToProfession = {
            WEAPON: PROFESSIONS.BLACKSMITH,
            ARMOR: PROFESSIONS.BLACKSMITH,
            HELMET: PROFESSIONS.BLACKSMITH,
            BOOTS: PROFESSIONS.BLACKSMITH,
            ACCESSORY: PROFESSIONS.BLACKSMITH,
            POTION: PROFESSIONS.ALCHEMIST,
            SCROLL: PROFESSIONS.ENCHANTER,
            ENCHANTMENT: PROFESSIONS.ENCHANTER,
            CLOTHING: PROFESSIONS.TAILOR,
            FABRIC: PROFESSIONS.TAILOR
        };
        return categoryToProfession[category] || PROFESSIONS.BLACKSMITH;
    }

    /**
     * Calculate final success rate based on skill
     * @param {object} skill - CraftingSkill object
     * @returns {number} - Success rate between 0 and 1
     */
    calculateSuccessRate(skill) {
        if (!skill) {
            return BASE_SUCCESS_RATE;
        }

        const rank = RANKS[skill.rank] || RANKS.NOVICE;
        
        // Grandmaster has guaranteed success
        if (rank.guaranteedSuccess) {
            return 1.0;
        }

        const skillBonus = Math.min(rank.failReduction, 0.40);
        return Math.min(1.0, BASE_SUCCESS_RATE + skillBonus);
    }

    /**
     * Determine the crafting outcome
     * @param {number} successRate - The calculated success rate
     * @param {object} skill - CraftingSkill object
     * @returns {object} - { outcome, isSuccess }
     */
    determineOutcome(successRate, skill) {
        const roll = Math.random();
        
        // Success case
        if (roll < successRate) {
            return { outcome: 'SUCCESS', isSuccess: true, roll };
        }

        // Failure case - determine outcome type
        const rank = skill ? (RANKS[skill.rank] || RANKS.NOVICE) : RANKS.NOVICE;
        
        let availableOutcomes = { ...FAILURE_OUTCOMES };
        
        // Master rank eliminates catastrophic failures
        if (rank.noCatastrophic) {
            // Redistribute catastrophic weight to other outcomes
            const catastrophicWeight = availableOutcomes.CATASTROPHIC.weight;
            delete availableOutcomes.CATASTROPHIC;
            
            // Normalize remaining weights
            const totalWeight = Object.values(availableOutcomes).reduce((sum, o) => sum + o.weight, 0);
            for (const key in availableOutcomes) {
                availableOutcomes[key] = {
                    ...availableOutcomes[key],
                    weight: availableOutcomes[key].weight / totalWeight
                };
            }
        }

        // Expert rank protects quality (convert to safe fail)
        if (rank.qualityProtection) {
            const qualityDropWeight = availableOutcomes.QUALITY_DROP.weight;
            availableOutcomes.QUALITY_DROP.weight = 0;
            availableOutcomes.SAFE_FAIL.weight += qualityDropWeight;
            
            // Normalize
            const totalWeight = Object.values(availableOutcomes).reduce((sum, o) => sum + o.weight, 0);
            for (const key in availableOutcomes) {
                availableOutcomes[key] = {
                    ...availableOutcomes[key],
                    weight: availableOutcomes[key].weight / totalWeight
                };
            }
        }

        // Determine failure outcome
        let cumulative = 0;
        const failRoll = Math.random();
        
        for (const [key, outcome] of Object.entries(availableOutcomes)) {
            cumulative += outcome.weight;
            if (failRoll < cumulative) {
                return { 
                    outcome: key, 
                    isSuccess: false, 
                    roll,
                    failRoll,
                    description: outcome.description 
                };
            }
        }

        // Fallback to safe fail
        return { 
            outcome: 'SAFE_FAIL', 
            isSuccess: false, 
            roll,
            failRoll,
            description: FAILURE_OUTCOMES.SAFE_FAIL.description 
        };
    }

    /**
     * Calculate quality reduction for QUALITY_DROP outcome
     * @param {number} currentQuality - Current quality multiplier
     * @returns {number} - Reduced quality multiplier
     */
    calculateQualityDrop(currentQuality) {
        // 20% quality reduction
        return Math.max(0.5, currentQuality * 0.8);
    }

    /**
     * Get rank from experience level
     * @param {number} level - Skill level (1-100)
     * @returns {string} - Rank name
     */
    getRankFromLevel(level) {
        if (level >= 80) return 'GRANDMASTER';
        if (level >= 60) return 'MASTER';
        if (level >= 40) return 'EXPERT';
        if (level >= 20) return 'APPRENTICE';
        return 'NOVICE';
    }

    /**
     * Calculate experience needed for next level
     * @param {number} currentLevel - Current skill level
     * @returns {number}
     */
    getExpForNextLevel(currentLevel) {
        return EXP_PER_LEVEL * currentLevel;
    }

    /**
     * Process crafting outcome and update skill
     * @param {object} skill - Current CraftingSkill or null
     * @param {boolean} isSuccess - Whether crafting succeeded
     * @returns {object} - Updated skill values
     */
    processOutcome(skill, isSuccess) {
        const currentLevel = skill?.level || 1;
        const currentExp = skill?.experience || 0;
        const currentSuccessCount = skill?.successCount || 0;
        const currentFailCount = skill?.failCount || 0;
        const currentTotalCrafts = skill?.totalCrafts || 0;

        let newExp = currentExp;
        let newLevel = currentLevel;
        let newRank = skill?.rank || 'NOVICE';
        
        // Add experience based on outcome
        if (isSuccess) {
            newExp += 20; // Success gives more XP
        } else {
            newExp += 5; // Failure gives less XP but still learning
        }

        // Check for level up
        const expNeeded = this.getExpForNextLevel(newLevel);
        if (newExp >= expNeeded && newLevel < 100) {
            newLevel++;
            newExp = newExp - expNeeded;
            newRank = this.getRankFromLevel(newLevel);
        }

        return {
            level: newLevel,
            experience: newExp,
            rank: newRank,
            totalCrafts: currentTotalCrafts + 1,
            successCount: isSuccess ? currentSuccessCount + 1 : currentSuccessCount,
            failCount: isSuccess ? currentFailCount : currentFailCount + 1
        };
    }

    /**
     * Get success rate display info for UI
     * @param {object} skill - CraftingSkill
     * @returns {object}
     */
    getSuccessRateInfo(skill) {
        const successRate = this.calculateSuccessRate(skill);
        const rank = skill ? RANKS[skill.rank] : RANKS.NOVICE;
        
        return {
            baseRate: BASE_SUCCESS_RATE,
            skillBonus: rank?.failReduction || 0,
            finalRate: successRate,
            rank: skill?.rank || 'NOVICE',
            level: skill?.level || 1,
            isElite: this.shouldApplyFailSystem('EPIC') || this.shouldApplyFailSystem('LEGENDARY')
        };
    }

    /**
     * Get profession display name
     * @param {string} profession 
     * @returns {string}
     */
    getProfessionDisplayName(profession) {
        const names = {
            [PROFESSIONS.BLACKSMITH]: 'Blacksmith',
            [PROFESSIONS.ENCHANTER]: 'Enchanter',
            [PROFESSIONS.ALCHEMIST]: 'Alchemist',
            [PROFESSIONS.TAILOR]: 'Tailor'
        };
        return names[profession] || profession;
    }
}

module.exports = new CraftingFailResolver();
module.exports.PROFESSIONS = PROFESSIONS;
module.exports.RANKS = RANKS;
module.exports.FAILURE_OUTCOMES = FAILURE_OUTCOMES;
module.exports.BASE_SUCCESS_RATE = BASE_SUCCESS_RATE;
