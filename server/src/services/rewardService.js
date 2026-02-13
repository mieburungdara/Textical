const userRepository = require('../repositories/userRepository');
const heroRepository = require('../repositories/heroRepository');
const inventoryService = require('./inventoryService'); // Added import

// ... inside class ...

        // 4. Gold & Items (Silver-based)
        const goldReward = BigInt(result.rewards.gold || 0);
        if (goldReward > 0) {
            await transactionManager.addCurrency(null, user.id, goldReward, "BATTLE_REWARD", null, null);
        }

        // Fetch Zone Type again if not in scope (it was in the permadeath block)
        // Optimization: Lift zoneType fetching to top of method
        let zoneType = "GREEN";
        if (user.region && user.region.zoneType) {
            zoneType = user.region.zoneType;
        }

        const droppedItems = await lootService.generateLoot(result.killed_monsters, zoneType);
        for (let item of droppedItems) {
             const options = {
                isSoulbound: item.isSoulbound || false
            };
            await inventoryService.addItem(user.id, item.itemId, item.quantity, null, options);
        }

        // 5. Update Quest Progress for Killed Monsters
        if (result.killed_monsters) {
            for (const monsterId of result.killed_monsters) {
                await questService.updateQuestProgress(user.id, "KILL", monsterId, 1);
            }
        }

        return { alerts, goldGained: result.rewards.gold, droppedItems };
    }
}

module.exports = new RewardService();
