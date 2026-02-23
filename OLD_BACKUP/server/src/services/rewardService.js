const userRepository = require('../repositories/userRepository');
const inventoryService = require('./inventoryService');
const lootService = require('./lootService');
const transactionManager = require('./economy/TransactionManager');
const questService = require('./questService');
const permadeathService = require('./PermadeathService');
const prisma = require('../db');

class RewardService {
    /**
     * processPostBattle
     * Orchestrates after-battle rewards, xp, and permadeath logic.
     * @param {Object} user - User object
     * @param {Object} result - Battle simulation result
     * @param {string} mode - Battle mode (ADVENTURE, ARENA, etc)
     */
    async processPostBattle(user, result, mode = "ADVENTURE") {
        const alerts = { evolution: [], death: [] };
        
        let zoneType = "GREEN";
        if (user.region && user.region.zoneType) {
            zoneType = user.region.zoneType;
        }

        // 1. Process Hero Death (Permadeath Logic)
        if (result.dead_heroes && result.dead_heroes.length > 0) {
            for (const deadHero of result.dead_heroes) {
                const deathResult = await permadeathService.processDeath(
                    deadHero, 
                    user.username, 
                    zoneType, 
                    "Killed in " + mode
                );
                if (deathResult.deleted || deathResult.archived) {
                    alerts.death.push(`${deadHero.name} has fallen permanently in the ${zoneType} zone.`);
                } else {
                    alerts.death.push(`${deadHero.name} was knocked out.`);
                }
            }
        }

        // 2. Gold & Items (Silver-based)
        const goldReward = BigInt(result.rewards ? (result.rewards.gold || 0) : 0);
        if (goldReward > 0) {
            await transactionManager.addCurrency(null, user.id, goldReward, "BATTLE_REWARD", null, "BATTLE");
        }

        // 3. Loot Generation
        const droppedItems = await lootService.generateLoot(result.killed_monsters || [], zoneType);
        for (let item of droppedItems) {
             const options = {
                isSoulbound: item.isSoulbound || false,
                isStolen: item.isStolen || false
            };
            await inventoryService.addItem(user.id, item.itemId, item.quantity, null, options);
        }

        // 3b. Gem Drops (from monsters)
        const gemDrops = [];
        for (const monsterId of (result.killed_monsters || [])) {
            // Check if monster is a boss (by checking monster template)
            const monster = await prisma.monsterTemplate.findUnique({
                where: { id: monsterId },
                select: { rank: true }
            });
            const isBoss = monster && (monster.rank === 'BOSS' || monster.rank === 'ELITE');
            
            const drops = await lootService.rollForGems(monsterId, isBoss);
            gemDrops.push(...drops);
        }
        
        for (const gem of gemDrops) {
            await inventoryService.addItem(user.id, gem.itemId, gem.quantity);
        }

        // 4. Update Quest Progress
        if (result.killed_monsters) {
            for (const monsterId of result.killed_monsters) {
                await questService.updateQuestProgress(user.id, "KILL", monsterId, 1);
            }
        }

        return { 
            alerts, 
            goldGained: result.rewards ? result.rewards.gold : 0, 
            droppedItems,
            gemDrops,
            progression: result.hero_progression || [] 
        };
    }
}

module.exports = new RewardService();
