const BaseService = require('../BaseService');
const taxResolver = require('../../logic/economy/TaxRateResolver');
const factionWarService = require('../faction/FactionWarService');
const facilityResolver = require('../../logic/guild/FacilityEffectResolver');

/**
 * TaxationService
 * Orchestrates periodic tax rate updates based on world state.
 */
class TaxationService extends BaseService {
    /**
     * Updates regional tax rates across all regions.
     */
    async updateAllRegionalTaxes() {
        const regions = await this.db.regionTemplate.findMany({
            include: {
                faction: true,
                territory: { include: { guild: { include: { facilities: { include: { template: true } } } } } }
            }
        });

        const updates = [];

        for (const region of regions) {
            // 1. Determine War Status
            let isAtWar = false;
            if (region.factionId) {
                // Check if faction is at war with ANYONE
                const relations = await this.db.factionRelation.findMany({
                    where: {
                        OR: [
                            { factionAId: region.factionId, status: "WAR" },
                            { factionBId: region.factionId, status: "WAR" }
                        ]
                    }
                });
                isAtWar = relations.length > 0;
            }

            // 2. Determine Infrastructure Bonus
            let infraBonus = 0;
            if (region.territory && region.territory.guild) {
                const buffs = facilityResolver.resolveTotalBuffs(region.territory.guild.facilities);
                infraBonus = buffs["MARKET_TAX_REDUCTION"] || 0;
            }

            // 3. Resolve Rate
            const newRate = taxResolver.resolve(isAtWar, infraBonus);

            // 4. Queue Update
            updates.push(this.db.regionTemplate.update({
                where: { id: region.id },
                data: { regionalTaxRate: newRate }
            }));
        }

        await Promise.all(updates);
        this.log(`Regional Taxes updated for ${regions.length} regions.`, "Economy");
        return regions.length;
    }
}

module.exports = new TaxationService();
