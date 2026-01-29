const battleInitializer = require('./battle/BattleInitializer');
const rewardProcessor = require('./battle/RewardProcessor');

/**
 * BattleService (v2.0 - Modular Orchestrator)
 */
class BattleService {
    async startBattle(userId, monsterTemplateId) {
        // 1. Setup and Initialize
        const { sim, monsterTemplate } = await battleInitializer.setupSimulation(userId, monsterTemplateId);
        
        // 2. Run Simulation
        const battleResult = sim.run();

        // 3. Process Rewards
        const { lootEarned, heroResults } = await rewardProcessor.process(
            userId, 
            battleResult, 
            monsterTemplate, 
            sim.units.filter(u => u.teamId === 0).length
        );

        return {
            result: battleResult.winner === 0 ? "VICTORY" : "DEFEAT",
            replay: battleResult.logs,
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
