/**
 * AAA Progression Service
 * Handles XP curves, Leveling logic, and Attribute rewards.
 */
class ProgressionService {
    constructor() {
        this.BASE_XP = 100;
        this.EXPONENT = 1.55;
        this.LINEAR_FACTOR = 45;
    }

    /**
     * Calculates total XP required to reach a specific level.
     * Formula: Base * (Level^Exp) + (Linear * Level)
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
    checkLevelUp(currentLevel, currentXP) {
        let newLevel = currentLevel;
        while (true) {
            const nextLevelXP = this.getRequiredXP(newLevel + 1);
            if (currentXP >= nextLevelXP) {
                newLevel++;
            } else {
                break;
            }
        }
        return newLevel;
    }

    /**
     * Get attribute points reward for leveling up.
     */
    getAttributePointsOnLevel(level) {
        // AAA: Dynamic rewards (e.g. more points every 10 levels)
        let points = 5;
        if (level % 10 === 0) points += 5;
        return points;
    }
}

module.exports = new ProgressionService();
