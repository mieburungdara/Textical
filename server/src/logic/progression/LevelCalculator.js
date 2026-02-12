/**
 * LevelCalculator
 * Extracts XP and Level Up logic from RewardService.
 * Follows SRP - only responsible for XP/Level calculations.
 */

class LevelCalculator {
    /**
     * Calculate new level based on experience
     * @param {number} currentExp - Current experience points
     * @param {number} currentLevel - Current level
     * @param {number} expGained - Experience gained
     * @param {number} expPerLevel - EXP required per level (default: 100)
     * @returns {Object} { newLevel, newExp, levelsGained }
     */
    static calculateLevelUp(currentExp, currentLevel, expGained, expPerLevel = 100) {
        let newExp = currentExp + expGained;
        let newLevel = currentLevel;
        let levelsGained = 0;

        while (newExp >= newLevel * expPerLevel) {
            newExp -= newLevel * expPerLevel;
            newLevel++;
            levelsGained++;
        }

        return {
            newLevel,
            newExp,
            levelsGained
        };
    }

    /**
     * Calculate total EXP needed to reach target level
     * @param {number} currentLevel - Starting level
     * @param {number} targetLevel - Target level
     * @param {number} expPerLevel - EXP required per level (default: 100)
     * @returns {number} Total EXP needed
     */
    static expToReachLevel(currentLevel, targetLevel, expPerLevel = 100) {
        if (targetLevel <= currentLevel) return 0;

        let totalExp = 0;
        for (let level = currentLevel; level < targetLevel; level++) {
            totalExp += level * expPerLevel;
        }
        return totalExp;
    }

    /**
     * Calculate level from total EXP (reverse calculation)
     * @param {number} totalExp - Total accumulated EXP
     * @param {number} expPerLevel - EXP required per level (default: 100)
     * @returns {number} Current level
     */
    static levelFromExp(totalExp, expPerLevel = 100) {
        let level = 1;
        let expNeeded = expPerLevel;

        while (totalExp >= expNeeded) {
            totalExp -= expNeeded;
            level++;
            expNeeded = level * expPerLevel;
        }

        return level;
    }
}

module.exports = LevelCalculator;
