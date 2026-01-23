const userRepository = require('../repositories/userRepository');
const heroRepository = require('../repositories/heroRepository');
const inventoryRepository = require('../repositories/inventoryRepository');
const EvolutionEngine = require('../logic/evolutionEngine');
const ProgressionManager = require('../logic/progressionManager');
const LootFactory = require('../logic/lootFactory');

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

            const update = EvolutionEngine.processEvolution({ ...hero, deeds: JSON.stringify(currentDeeds) });
            if (update.newlyUnlocked.length > 0) alerts.evolution.push({ name: hero.name, unlocked: update.newlyUnlocked });
            
            await heroRepository.updateProgression(hero.id, currentDeeds, update.acquiredTraits, update.unlockedBehaviors);
        }

        // 3. Gold & Items
        const droppedItems = LootFactory.generateLoot(result.killed_monsters);
        const progResult = await ProgressionManager.processRewards(user, result, droppedItems);

        return { alerts, progression: progResult };
    }
}

module.exports = new RewardService();
