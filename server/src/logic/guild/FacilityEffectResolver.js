/**
 * AAA FacilityEffectResolver
 * Pure component for calculating cumulative guild facility bonuses.
 * Enhanced with stat system integration.
 */
class FacilityEffectResolver {
    /**
     * Resolves all active buffs from a list of guild facilities.
     * Returns an object mapping statKeys to their total bonus values.
     */
    resolveTotalBuffs(facilities) {
        const buffs = {};

        for (const f of facilities) {
            const template = f.template;
            if (!template || !template.statKey || !template.statValuePerLevel) continue;

            const totalValue = template.statValuePerLevel * f.level;
            
            if (!buffs[template.statKey]) buffs[template.statKey] = 0;
            buffs[template.statKey] += totalValue;
        }

        return buffs;
    }

    /**
     * Get facility bonuses with detailed breakdown.
     * @param {Array} facilities - List of guild facilities
     * @returns {Object} { totalBuffs, breakdown }
     */
    resolveDetailedBuffs(facilities) {
        const totalBuffs = {};
        const breakdown = [];

        for (const f of facilities) {
            const template = f.template;
            if (!template || !template.statKey || !template.statValuePerLevel) continue;

            const totalValue = template.statValuePerLevel * f.level;
            
            if (!totalBuffs[template.statKey]) totalBuffs[template.statKey] = 0;
            totalBuffs[template.statKey] += totalValue;
            
            breakdown.push({
                facilityId: f.id,
                facilityName: template.name || f.name,
                statKey: template.statKey,
                level: f.level,
                valuePerLevel: template.statValuePerLevel,
                totalValue: totalValue
            });
        }

        return { totalBuffs, breakdown };
    }

    /**
     * Get stat modifiers from facility buffs for EnhancedStat system.
     * @param {Array} facilities - List of guild facilities
     * @returns {Array} Array of { statKey, value, source }
     */
    getStatModifiers(facilities) {
        const modifiers = [];
        
        for (const f of facilities) {
            const template = f.template;
            if (!template || !template.statKey || !template.statValuePerLevel) continue;

            const totalValue = template.statValuePerLevel * f.level;
            
            modifiers.push({
                statKey: template.statKey,
                value: totalValue,
                source: `GuildFacility:${template.name}`,
                isPercent: template.statValuePerLevel < 1.0 && template.statValuePerLevel > 0
            });
        }
        
        return modifiers;
    }
}

module.exports = new FacilityEffectResolver();
