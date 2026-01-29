const { StatModifier } = require('../../logic/statSystem');

/**
 * StatGrowthSystem
 * Calculates incremental stat gains based on Hero Level and Class Template.
 */
class StatGrowthSystem {
    /**
     * @param {Object} stats - The stats object to modify (Map of Stat objects)
     * @param {Object} classTemplate - DB object with hpGrowth, atkGrowth, etc.
     * @param {number} level - Current hero level
     */
    applyGrowth(stats, classTemplate, level) {
        if (!classTemplate || level <= 1) return;

        const effectiveLevel = level - 1; // Gains start from level 2

        const growthMap = {
            health_max: classTemplate.hpGrowth,
            mana_max: classTemplate.mpGrowth,
            attack_damage: classTemplate.atkGrowth,
            defense: classTemplate.defGrowth,
            speed: classTemplate.spdGrowth
        };

        Object.entries(growthMap).forEach(([key, rate]) => {
            if (stats[key] && rate > 0) {
                const totalGain = rate * effectiveLevel;
                stats[key].addModifier({
                    value: totalGain,
                    type: 0, // FLAT
                    source: `ClassGrowth:${classTemplate.name}`
                });
            }
        });
    }
}

module.exports = new StatGrowthSystem();
