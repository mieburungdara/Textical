/**
 * AAA XP Formula Logic
 * Pure functions for progression curves.
 */
class XPFormula {
    constructor() {
        this.BASE_XP = 100;
        this.EXPONENT = 1.55;
        this.LINEAR_FACTOR = 45;
    }

    calculateRequiredXP(level) {
        if (level <= 1) return 0;
        const prevLevel = level - 1;
        const exponentialPart = this.BASE_XP * Math.pow(prevLevel, this.EXPONENT);
        const linearPart = this.LINEAR_FACTOR * prevLevel;
        return Math.floor(exponentialPart + linearPart);
    }

    calculateLevelFromXP(currentLevel, totalXP) {
        let newLevel = currentLevel;
        while (true) {
            const nextLevelXP = this.calculateRequiredXP(newLevel + 1);
            if (totalXP >= nextLevelXP) {
                newLevel++;
            } else {
                break;
            }
        }
        return newLevel;
    }
}

module.exports = new XPFormula();
