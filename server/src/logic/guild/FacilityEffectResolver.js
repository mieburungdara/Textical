/**
 * AAA FacilityEffectResolver
 * Pure component for calculating cumulative guild facility bonuses.
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
}

module.exports = new FacilityEffectResolver();
