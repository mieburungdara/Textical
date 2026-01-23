const Registry = require('../data/registry');

class EvolutionEngine {
    /**
     * Checks and unlocks traits/behaviors based on unit deeds.
     * @param {Object} hero - Database Hero Object
     * @returns {Object} Updated arrays
     */
    processEvolution(hero) {
        const deeds = JSON.parse(hero.deeds || "{}");
        const acquiredTraits = JSON.parse(hero.acquiredTraits || "[]");
        const unlockedBehaviors = JSON.parse(hero.unlockedBehaviors || "[]");
        
        let newlyUnlocked = [];

        // 1. Check Traits
        Object.entries(Registry.TRAITS).forEach(([id, data]) => {
            if (data.type === "ACQUIRED" && !acquiredTraits.includes(id)) {
                if (this._checkCondition(data.condition, deeds)) {
                    acquiredTraits.push(id);
                    newlyUnlocked.push(data.name);
                }
            }
        });

        // 2. Check Behaviors
        Object.entries(Registry.BEHAVIORS).forEach(([id, data]) => {
            if (data.type === "ACQUIRED" && !unlockedBehaviors.includes(id)) {
                if (this._checkCondition(data.condition, deeds)) {
                    unlockedBehaviors.push(id);
                    newlyUnlocked.push(`Behavior: ${data.name}`);
                }
            }
        });

        return { acquiredTraits, unlockedBehaviors, newlyUnlocked };
    }

    _checkCondition(cond, deeds) {
        if (!cond) return false;
        
        switch (cond.type) {
            case "KILL_COUNT":
                return (deeds[`kills_${cond.target}`] || 0) >= cond.amount;
            case "STEP_COUNT":
                return (deeds[`steps_${cond.target}`] || 0) >= cond.amount;
            case "BACKLINE_KILLS":
                return (deeds["backline_kills"] || 0) >= cond.amount;
            case "DAMAGE_ABSORBED":
                return (deeds["dmg_absorbed"] || 0) >= cond.amount;
            default:
                return false;
        }
    }
}

module.exports = new EvolutionEngine();
