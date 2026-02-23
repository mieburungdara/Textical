const BaseService = require('../BaseService');
const progressionService = require('../progressionService');

class ExpManager extends BaseService {
    /**
     * Distribute experience to hero party.
     * @param {number} userId - User ID.
     * @param {number} totalExp - Total raw EXP.
     * @param {number} xpMultiplier - multiplier from danger level.
     * @param {number} partyCount - Number of heroes in party.
     * @param {Array} battleUnits - units from battle result for durability processing.
     * @returns {Promise<Array>} Results for each hero.
     */
    async distributeExp(userId, totalExp, xpMultiplier, partyCount, battleUnits) {
        const adjustedTotalExp = Math.floor(totalExp * xpMultiplier);
        const heroShare = Math.floor(adjustedTotalExp / partyCount);
        const heroResults = [];

        const heroes = await this.db.hero.findMany({
            where: { formationSlots: { some: { preset: { userId } } } }
        });

        for (const hero of heroes) {
            const simUnit = battleUnits.find(u => u.data.db_id === hero.id);
            
            // Victory Irrelevance Check for Main unit in RED
            // This logic is simplified; actual check happens in RewardProcessor
            if (simUnit && simUnit.isDead && hero.isMain && simUnit.zoneType === "RED") {
                continue;
            }

            const progression = await progressionService.addHeroExperience(hero.id, heroShare);

            // Persist Durability Loss
            if (simUnit && simUnit.durabilityLoss) {
                for (const [instanceId, loss] of Object.entries(simUnit.durabilityLoss)) {
                    if (loss > 0) {
                        await this.db.inventoryItem.update({
                            where: { id: parseInt(instanceId) },
                            data: { currentDurability: { decrement: loss } }
                        });
                    }
                }
            }

            heroResults.push({
                id: hero.id,
                name: hero.name,
                xpGained: heroShare,
                totalXp: progression.hero.unitXp,
                unitLevel: progression.hero.unitLevel,
                classLevel: progression.hero.classLevel,
                leveledUp: progression.unitLeveledUp || progression.classLeveledUp
            });
        }

        return heroResults;
    }
}

module.exports = new ExpManager();
