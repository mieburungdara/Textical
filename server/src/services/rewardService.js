const userRepository = require('../repositories/userRepository');
const heroRepository = require('../repositories/heroRepository');
const inventoryRepository = require('../repositories/inventoryRepository');
const evolutionService = require('./evolutionService');
const lootService = require('./lootService');

class RewardService {
    async processPostBattle(user, result, mode) {
        const deadHeroIds = result.logs
            .filter(l => l.type === "DEATH" && l.data.target_id.startsWith("p_hero_"))
            .map(l => l.data.target_id.replace("p_hero_", ""));

        const alerts = { evolution: [], death: [] };

        for (let hero of user.heroes) {
            // 1. Permadeath
            if (deadHeroIds.includes(hero.id) && mode === "ADVENTURE") {
                const isLegendary = hero.level >= 100 && hero.classTier >= 3;
                if (isLegendary) await heroRepository.archiveToHallOfFame(hero, user.username, "Killed in Adventure");
                await heroRepository.delete(hero.id);
                alerts.death.push({ name: hero.name, isLegendary });
                continue;
            }

            // 2. Deeds & Evolution
            const simDeeds = result.unitDeeds[`p_hero_${hero.id}`] || {};
            const currentDeeds = JSON.parse(hero.deeds || "{}");
            Object.entries(simDeeds).forEach(([key, val]) => { currentDeeds[key] = (currentDeeds[key] || 0) + val; });

            const update = evolutionService.processEvolution({ ...hero, deeds: JSON.stringify(currentDeeds) });
            if (update.newlyUnlocked.length > 0) alerts.evolution.push({ name: hero.name, unlocked: update.newlyUnlocked });
            
            // Handle XP and Level Up (Logic moved here from progressionManager)
            let currentExp = hero.exp + (result.rewards.exp || 0);
            let currentLevel = hero.level;
            while (currentExp >= currentLevel * 100) {
                currentExp -= currentLevel * 100;
                currentLevel++;
            }

            // Save updates
            await heroRepository.updateProgression(hero.id, currentDeeds, update.acquiredTraits, update.unlockedBehaviors);
            // Need a new method or use updateLineage for XP
            await heroRepository.updateLineage(hero.id, { level: currentLevel, exp: currentExp });
        }

        // 3. Gold & Items
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
