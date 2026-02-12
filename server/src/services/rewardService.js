const userRepository = require('../repositories/userRepository');
const heroRepository = require('../repositories/heroRepository');
const inventoryRepository = require('../repositories/inventoryRepository');
const evolutionService = require('./evolutionService');
const lootService = require('./lootService');
const LevelCalculator = require('../logic/progression/LevelCalculator');
const permadeathService = require('./PermadeathService');

class RewardService {
    async processPostBattle(user, result, mode) {
        const deadHeroIds = result.logs
            .filter(l => l.type === "DEATH" && l.data.target_id.startsWith("p_hero_"))
            .map(l => l.data.target_id.replace("p_hero_", ""));

        const alerts = { evolution: [], death: [] };

        for (let hero of user.heroes) {
            // 1. Permadeath - delegated to PermadeathService
            if (deadHeroIds.includes(hero.id) && mode === "ADVENTURE") {
                const deathResult = await permadeathService.processDeath(hero, user.username, "Killed in Adventure");
                alerts.death.push(deathResult);
                continue;
            }

            // 2. Deeds & Evolution aggregation
            const simDeeds = result.unitDeeds[`p_hero_${hero.id}`] || {};
            const currentDeeds = JSON.parse(hero.deeds || "{}");
            Object.entries(simDeeds).forEach(([key, val]) => { currentDeeds[key] = (currentDeeds[key] || 0) + val; });

            const update = evolutionService.processEvolution({ ...hero, deeds: JSON.stringify(currentDeeds) });
            if (update.newlyUnlocked.length > 0) alerts.evolution.push({ name: hero.name, unlocked: update.newlyUnlocked });
            
            // 3. XP and Level Up - using LevelCalculator for SRP
            const { newLevel, newExp } = LevelCalculator.calculateLevelUp(
                hero.exp,
                hero.level,
                result.rewards.exp || 0
            );

            // Save updates
            await heroRepository.updateProgression(hero.id, currentDeeds, update.acquiredTraits, update.unlockedBehaviors);
            await heroRepository.updateLineage(hero.id, { level: newLevel, exp: newExp });
        }

        // 4. Gold & Items
        const totalGold = user.gold + (result.rewards.gold || 0);
        await userRepository.updateGold(user.id, totalGold);

        const droppedItems = lootService.generateLoot(result.killed_monsters);
        for (let item of droppedItems) {
            await inventoryRepository.addItem(user.id, item.id, 1, item.uniqueData || {});
        }

        return { alerts, goldGained: result.rewards.gold, droppedItems };
    }
}

module.exports = new RewardService();
