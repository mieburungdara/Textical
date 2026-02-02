const battleInitializer = require('./battle/BattleInitializer');
const rewardProcessor = require('./battle/RewardProcessor');
const replayService = require('./battle/ReplayService');
const lootService = require('./logistics/LootService');

/**
 * BattleService (v2.0 - Modular Orchestrator)
 */
class BattleService {
    async startBattle(userId, monsterTemplateId) {
        // 0. AAA: Loot Interruption Logic
        // If user is currently looting, and they enter a NEW battle (attacked or attacking),
        // their current loot session is interrupted and the cargo is destroyed.
        await lootService.interruptSession(userId);

        // 1. Setup and Initialize
        const { sim, monsterTemplate } = await battleInitializer.setupSimulation(userId, monsterTemplateId);
        
        // 2. Run Simulation
        const battleResult = sim.run();

        // 3. Save Replay (AAA Integration)
        await replayService.saveReplay(sim.battleId, battleResult.logs);

        // 4. Process Rewards
        const { lootEarned, heroResults } = await rewardProcessor.process(
            userId, 
            { ...battleResult, victimUserId: monsterTemplate.userId || null }, // In case of PvP, monsterTemplate might hold user context
            monsterTemplate, 
            sim.units.filter(u => u.teamId === 0).length
        );

        return {
            battleId: sim.battleId, // Return ID so client can fetch replay
            result: battleResult.winner === 0 ? "VICTORY" : "DEFEAT",
            // replay: battleResult.logs, // Optional: Don't send full log if too big, client fetches via ID
            loot: lootEarned,
            rewards: battleResult.rewards,
            heroProgress: heroResults,
            initialUnits: sim.units.map(u => ({
                id: u.instanceId,
                name: u.data.name,
                team: u.teamId === 0 ? "PLAYER" : "MONSTER",
                maxHp: u.stats.health_max,
                x: u.gridPos.x,
                y: u.gridPos.y
            }))
        };
    }
}

module.exports = new BattleService();
