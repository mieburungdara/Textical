const battleInitializer = require('./battle/BattleInitializer');
const rewardProcessor = require('./battle/RewardProcessor');
const replayService = require('./battle/ReplayService');
const lootService = require('../logistics/LootService');
const battleRegistry = require('../../logic/battle/BattleRegistry');

/**
 * BattleService (v2.2 - Async Battle Support with Potion System)
 * Exports separate files for UI visualization and Engine debugging.
 * Supports Health Potion usage during combat via BattleRegistry.
 */
class BattleService {
    /**
     * Start async battle - registers to BattleRegistry for potion support
     * @param {number} userId 
     * @param {string} monsterTemplateId 
     * @returns {Object} battleId and initial state
     */
    async startAsyncBattle(userId, monsterTemplateId) {
        // Interrupt any active sessions
        await lootService.interruptSession(userId);
        
        // Setup simulation
        const { sim, monsterTemplate } = await battleInitializer.setupSimulation(userId, monsterTemplateId);
        sim.logger.setMetadata({
            battle_type: "SOLO",
            user_id: userId,
            monster_id: monsterTemplateId
        });
        
        // Register to BattleRegistry
        sim.userId = userId;
        sim.battleType = "SOLO";
        battleRegistry.register(sim.battleId, sim, userId);
        
        // Start battle in background (async)
        this._runBattleAsync(sim);
        
        return {
            battleId: sim.battleId,
            status: "IN_PROGRESS",
            initialUnits: sim.units.map(u => ({
                id: u.instanceId,
                heroId: u.heroId,
                name: u.data.name,
                team: u.teamId === 0 ? "PLAYER" : "MONSTER",
                maxHp: u.stats.health_max,
                currentHp: u.currentHealth,
                x: u.gridPos.x,
                y: u.gridPos.y
            })),
            message: "Battle started. Health Potion available."
        };
    }
    
    /**
     * Run battle asynchronously
     * @param {BattleSimulation} sim 
     */
    _runBattleAsync(sim) {
        // Use setImmediate untuk run di event loop terpisah
        setImmediate(async () => {
            try {
                const battleResult = sim.run();
                
                // Save replays
                const debugData = sim.logger.getReplayData(true);
                await replayService.saveReplay(`debug_${sim.battleId}`, debugData);
                
                const viewData = sim.logger.getReplayData(false);
                await replayService.saveReplay(`view_${sim.battleId}`, viewData);
                
                // Process rewards
                await rewardProcessor.process(
                    sim.userId, 
                    { ...battleResult, victimUserId: null }, 
                    null, 
                    sim.units.filter(u => u.teamId === 0).length
                );
                
                // End battle in registry
                const result = battleRegistry.endBattle(sim.battleId);
                
                console.log(`[BATTLE_SERVICE] Async battle ${sim.battleId} completed. Winner: ${result?.winner === 0 ? 'PLAYER' : 'MONSTER'}`);
                
            } catch (error) {
                console.error(`[BATTLE_SERVICE] Async battle ${sim.battleId} failed:`, error);
                battleRegistry.endBattle(sim.battleId);
            }
        });
    }
    
    /**
     * Get current battle status
     * @param {string} battleId 
     */
    getBattleStatus(battleId) {
        const sim = battleRegistry.get(battleId);
        if (!sim) {
            return { found: false, message: "Battle not found or has ended" };
        }
        
        return {
            found: true,
            battleId: sim.battleId,
            status: sim.isFinished ? "COMPLETED" : "IN_PROGRESS",
            currentTick: sim.currentTick,
            winner: sim.winnerTeam,
            units: sim.units.map(u => ({
                id: u.instanceId,
                heroId: u.heroId,
                name: u.data.name,
                team: u.teamId === 0 ? "PLAYER" : "MONSTER",
                isDead: u.isDead,
                currentHealth: u.currentHealth,
                maxHealth: u.stats.health_max,
                potionUsed: u.potionUsedInBattle,
                potionCooldown: u.getCooldownRemaining(sim)
            }))
        };
    }
    
    /**
     * Get battle status by user
     * @param {number} userId 
     */
    getBattleStatusByUser(userId) {
        const battleId = battleRegistry.getBattleIdByUser(userId);
        if (battleId) {
            return this.getBattleStatus(battleId);
        }
        return { found: false, message: "User is not in battle" };
    }
    
    // === Legacy Synchronous Methods (Still available for backward compatibility) ===
    
    async startHordeBattle(userId, monsterTemplateIds) {
        const { sim } = await battleInitializer.setupHordeSimulation(userId, monsterTemplateIds);
        sim.logger.setMetadata({
            battle_type: "HORDE",
            user_id: userId,
            monsters: monsterTemplateIds
        });
        
        const battleResult = sim.run();

        const debugData = sim.logger.getReplayData(true);
        await replayService.saveReplay(`debug_${sim.battleId}`, debugData);

        const viewData = sim.logger.getReplayData(false);
        await replayService.saveReplay(`view_${sim.battleId}`, viewData);

        const { lootEarned, heroResults } = await rewardProcessor.process(
            userId, 
            battleResult,
            { name: "Horde", loot: [] }, 
            sim.units.filter(u => u.teamId === 0).length
        );

        return {
            battleId: sim.battleId,
            result: battleResult.winner === 0 ? "VICTORY" : "DEFEAT",
            replay: viewData,
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

        const debugData = sim.logger.getReplayData(true);
        await replayService.saveReplay(`debug_${sim.battleId}`, debugData);

        const viewData = sim.logger.getReplayData(false);
        await replayService.saveReplay(`view_${sim.battleId}`, viewData);

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
