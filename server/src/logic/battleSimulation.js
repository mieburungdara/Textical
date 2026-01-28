const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');
const BattleUnit = require('./battleUnit');
const BattleGrid = require('./battleGrid');
const BattleLogger = require('./battleLogger');
const BattleRules = require('./battleRules');
const BattleAI = require('./battleAI');
const traitService = require('../services/traitService'); // UPDATED

class BattleSimulation {
    constructor(width, height) {
        this.battleId = uuidv4();
        this.width = width;
        this.height = height;
        this.units = [];
        this.currentTick = 0;
        this.isFinished = false;
        this.winnerTeam = -1;
        this.MAX_TICKS = 1500;
        this.killedMonsterIds = [];
        this.unitDeeds = {};
        this.rewards = { gold: 0, exp: 0 };

        this.grid = new BattleGrid(width, height);
        this.logger = new BattleLogger();
        this.rules = new BattleRules(this);
        this.ai = new BattleAI(this);
    }

    addUnit(data, teamId, pos, stats) {
        const unit = new BattleUnit(data, teamId, { x: _.clamp(pos.x, 0, this.width-1), y: _.clamp(pos.y, 0, this.height-1) }, stats);
        this.units.push(unit);
        this.grid.unitGrid[unit.gridPos.y][unit.gridPos.x] = unit;
        return unit;
    }

    run() {
        this.units.forEach(u => traitService.executeHook("onBattleStart", u, this));
        this.logger.startTick(0);
        this.logger.addEvent("GAME_START", `Battle Engaged!`, { units: this.units.map(u => u.instanceId) });
        this.logger.commitTick(this.units);

        while (!this.isFinished && this.currentTick < this.MAX_TICKS) {
            this.processTick();
        }
        return { winner: this.winnerTeam, logs: this.logger.getLogs(), killed_monsters: this.killedMonsterIds, unitDeeds: this.unitDeeds, rewards: this.rewards };
    }

    processTick() {
        this.currentTick++;
        this.units.forEach(u => traitService.executeHook("onTickStart", u, this));
        this.grid.updateObstacles(this.units);
        
        // Start grouping events for this visual tick
        this.logger.startTick(this.currentTick);

        // --- NEW: Calculate Synergies & Auras ---
        this._applyAuras();

        _.forEach(this.units, (u) => { if (!u.isDead) { u.tick(1.0); u.applyStatusDamage(); } });

        const readyUnits = _.chain(this.units).filter(u => !u.isDead && u.isReady()).orderBy(['currentActionPoints'], ['desc']).value();

        for (let actor of readyUnits) {
            if (actor.isDead) continue; 
            const turnMods = traitService.executeHook("onTurnStart", actor, this) || {};
            actor.tempDamageMult = turnMods.temporaryDamageMult || 1.0;
            this.ai.decideAction(actor);
            traitService.executeHook("onTurnEnd", actor, this);
            actor.currentActionPoints -= 100.0;
            actor.applyRegen();
            actor.tempDamageMult = 1.0;
            if (this.rules.checkWinCondition()) break;
        }
        
        this.rules.resolveDeaths();

        // Commit all events and state snapshots for this tick
        this.logger.commitTick(this.units);
    }

    _applyAuras() {
        for (const unit of this.units.filter(u => !u.isDead)) {
            const allies = this.units.filter(u => !u.isDead && u.teamId === unit.teamId && u.instanceId !== unit.instanceId);
            
            for (const ally of allies) {
                const dist = this.grid.getDistance(unit.gridPos, ally.gridPos);
                
                // 1. Shield Wall (Adjacent allies gain +DEF)
                if (dist <= 1) {
                    unit.temporaryStats.defense = (unit.temporaryStats.defense || 0) + 5;
                }

                // 2. Protector (Allies behind high-HP units gain CRIT)
                if (dist <= 2 && ally.stats.health_max > 150) {
                    unit.temporaryStats.crit_chance = (unit.temporaryStats.crit_chance || 0) + 0.1;
                }
            }
        }
    }
}

module.exports = BattleSimulation;