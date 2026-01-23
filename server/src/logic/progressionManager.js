const DB = require('./dbManager');

class ProgressionManager {
    /**
     * Handles rewarding heroes and leveling them up.
     */
    async processRewards(user, result, droppedItems) {
        // 1. Give Gold to User
        const totalGold = user.gold + (result.rewards.gold || 0);
        await DB.updateUserGold(user.id, totalGold);

        // 2. Add Loot to Inventory
        for (let item of droppedItems) {
            await DB.addItem(user.id, item.id, 1, item.uniqueData || {});
        }

        // 3. Process Hero EXP and Level Up
        const heroResults = [];
        for (let hero of user.heroes) {
            // Only reward living heroes
            if (hero.isDead) continue; 

            let currentExp = hero.exp + (result.rewards.exp || 0);
            let currentLevel = hero.level;
            let leveledUp = false;

            // Simple AAA Level Up Formula: Level * 100 EXP needed
            while (currentExp >= currentLevel * 100) {
                currentExp -= currentLevel * 100;
                currentLevel++;
                leveledUp = true;
            }

            await DB.updateHeroExp(hero.id, currentLevel, currentExp);
            heroResults.push({ name: hero.name, level: currentLevel, leveledUp });
        }

        return { goldGained: result.rewards.gold, heroResults };
    }
}

module.exports = new ProgressionManager();
