const { v4: uuidv4 } = require('uuid');
const BattleGrid = require('./battleGrid');
const BattleLogger = require('./battleLogger');
const BattleRules = require('./battleRules');
const BattleAI = require('./battleAI');

// Modular Simulation Components
const SimUnitManager = require('./simulation/SimUnitManager');
const SimEnvironmentSystem = require('./simulation/SimEnvironmentSystem');
const SimLoopProcessor = require('./simulation/SimLoopProcessor');

/**
 * BattleSimulation (v2.0 - Component-Based Orchestrator)
 * Manages the high-level flow of a tactical engagement by delegating to specialized components.
 */
class BattleSimulation {
    constructor(width, height, regionType = "FOREST") {
        this.battleId = uuidv4();
        this.width = width;
        this.height = height;
        this.regionType = regionType.toUpperCase();
        this.units = [];
        this.currentTick = 0;
        this.isFinished = false;
        this.winnerTeam = -1;
        this.MAX_TICKS = 10000;
        this.killedMonsterIds = [];
        this.unitDeeds = {};
        this.rewards = { gold: 0, exp: 0 };
        this.terrainEffects = []; 

        // Core Infrastructure
        this.grid = new BattleGrid(width, height);
        this.logger = new BattleLogger();
        this.rules = new BattleRules(this);
        this.ai = new BattleAI(this);

        // Composition: Simulation Components
        this.unitManager = new SimUnitManager(this);
        this.environment = new SimEnvironmentSystem(this);
        this.loop = new SimLoopProcessor(this);
    }

    async addUnit(data, teamId, pos, stats) {
        return await this.unitManager.addUnit(data, teamId, pos, stats);
    }

    notifyAdjacencyGained(unit) {
        this.unitManager.notifyAdjacencyGained(unit);
    }

    notifyAdjacencyLost(unit) {
        this.unitManager.notifyAdjacencyLost(unit);
    }

    run() {
        return this.loop.run();
    }

    processTick() {
        this.loop.processTick();
    }
}

module.exports = BattleSimulation;
