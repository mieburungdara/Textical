const battleInitializer = require('./battle/BattleInitializer');
const rewardProcessor = require('./battle/RewardProcessor');
const replayService = require('./battle/ReplayService');
const lootService = require('./logistics/LootService');

/**
 * BattleService (v2.1 - Dual-Replay Orchestrator)
 * Exports separate files for UI visualization and Engine debugging.
 */
class BattleService {
    async startHordeBattle(userId, monsterTemplateIds) {
        const { sim } = await battleInitializer.setupHordeSimulation(userId, monsterTemplateIds);
        sim.logger.setMetadata({
            battle_type: "HORDE",
            user_id: userId,
            monsters: monsterTemplateIds
        });
        
        const battleResult = sim.run();

        // 3. Save DUAL Replays
        // Save Debug Replay (Full with AI Traces)
        const debugData = sim.logger.getReplayData(true);
        await replayService.saveReplay(`debug_${sim.battleId}`, debugData);

        // Save View Replay (Clean for Godot UI)
        const viewData = sim.logger.getReplayData(false);
        await replayService.saveReplay(`view_${sim.battleId}`, viewData);

        // 4. Process Rewards
        const { lootEarned, heroResults } = await rewardProcessor.process(
            userId, 
            battleResult,
            { name: "Horde", loot: [] }, 
            sim.units.filter(u => u.teamId === 0).length
        );

        return {
            battleId: sim.battleId,
            result: battleResult.winner === 0 ? "VICTORY" : "DEFEAT",
            replay: viewData, // Return clean version to UI
            loot: lootEarned,
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

    async startBattle(userId, monsterTemplateId) {
        await lootService.interruptSession(userId);
        const { sim, monsterTemplate } = await battleInitializer.setupSimulation(userId, monsterTemplateId);
        sim.logger.setMetadata({
            battle_type: "SOLO",
            user_id: userId,
            monster_id: monsterTemplateId
        });

        const battleResult = sim.run();

        // 3. Save DUAL Replays
        const debugData = sim.logger.getReplayData(true);
        await replayService.saveReplay(`debug_${sim.battleId}`, debugData);

        const viewData = sim.logger.getReplayData(false);
        await replayService.saveReplay(`view_${sim.battleId}`, viewData);

        // 4. Process Rewards
        const { lootEarned, heroResults } = await rewardProcessor.process(
            userId, 
            { ...battleResult, victimUserId: monsterTemplate.userId || null }, 
            monsterTemplate, 
            sim.units.filter(u => u.teamId === 0).length
        );

        return {
            battleId: sim.battleId,
            result: battleResult.winner === 0 ? "VICTORY" : "DEFEAT",
            replay: viewData,
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