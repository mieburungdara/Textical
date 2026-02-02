const BaseService = require('../BaseService');
const progressionService = require('../progressionService');
const inventoryService = require('../inventoryService');

class RewardProcessor extends BaseService {
    async process(userId, battleResult, monsterTemplate, partyCount) {
        let lootEarned = [];
        let heroResults = [];

        if (battleResult.winner === 0) { 
            const totalExp = battleResult.rewards.exp || 0;
            const heroShare = Math.floor(totalExp / partyCount);

            // Update Heroes XP and Level
            for (const p of battleResult.initialUnits.filter(u => u.team === "PLAYER")) {
                const hero = await this.db.hero.findUnique({ 
                    where: { id: parseInt(u.id.split('_')[1]) || 0 } // This is a bit hacky, better if sim unit holds DB ID
                });
                
                // Fallback: If we can't find by ID from string, we might need a better mapping
                // For now let's assume we need to pass party info better
            }
            
            // Re-fetching party to be safe
            const heroes = await this.db.hero.findMany({
                where: { formationSlots: { some: { preset: { userId } } } }
            });

            // 1. Process XP and Levels
            for (const hero of heroes) {
                // ... XP Logic already there ...
                const progression = await progressionService.addHeroExperience(hero.id, heroShare);

                // 2. AAA: Persist Durability Loss
                const simUnit = battleResult.initialUnits.find(u => u.data.db_id === hero.id);
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

            // Process Loot
            for (const entry of monsterTemplate.loot) {
                if (Math.random() < entry.chance) {
                    try {
                        await inventoryService.addItem(userId, entry.itemId, 1);
                        lootEarned.push({ templateId: entry.itemId, quantity: 1 });
                    } catch (e) { /* Inventory full */ }
                }
            }

            // Process Gold
            if (battleResult.rewards.gold > 0) {
                await this.db.user.update({
                    where: { id: userId },
                    data: { gold: { increment: battleResult.rewards.gold } }
                });
            }
        }

        return { lootEarned, heroResults };
    }
}

module.exports = new RewardProcessor();
