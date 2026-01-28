const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');
const BattleUnit = require('./battleUnit');
const BattleGrid = require('./battleGrid');
const BattleLogger = require('./battleLogger');
const BattleRules = require('./battleRules');
const BattleAI = require('./battleAI');
const traitService = require('../services/traitService'); // UPDATED

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

        // --- NEW: Terrain & Auras ---
        this._applyTerrainEffects();
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

    _applyTerrainEffects() {
        if (!this.terrainEffects || this.terrainEffects.length === 0) return;

        for (const unit of this.units.filter(u => !u.isDead)) {
            for (const eff of this.terrainEffects) {
                // Check frequency
                if (this.currentTick % eff.tickInterval !== 0) continue;
                
                // Check chance
                if (Math.random() > eff.chance) continue;

                switch (eff.effectType) {
                    case "BURN":
                        unit.applyEffect({ type: "BURN", power: eff.power, duration: 3 });
                        this.logger.addEvent("TERRAIN_MOD", `${unit.data.name} scorched by heat`, { type: "BURN", target_id: unit.instanceId });
                        break;
                    case "SLOW":
                        if (eff.statKey && eff.statValue) {
                            unit.temporaryStats[eff.statKey] = (unit.temporaryStats[eff.statKey] || 0) + (unit.stats[eff.statKey] * eff.statValue);
                        }
                        break;
                    case "HEAL":
                        unit.currentHealth = Math.min(unit.stats.health_max, unit.currentHealth + eff.power);
                        break;
                    case "DRAIN":
                        unit.takeDamage(eff.power);
                        break;
                    case "NO_MANA":
                        unit.temporaryStats.mana_regen = -999;
                        break;
                }
            }
        }
    }

    _applyAuras() {
        for (const unit of this.units.filter(u => !u.isDead)) {
            const allies = this.units.filter(u => !u.isDead && u.teamId === unit.teamId && u.instanceId !== unit.instanceId);
            
            for (const ally of allies) {
                const dist = this.grid.getDistance(unit.gridPos, ally.gridPos);
                if (dist <= 1) {
                    unit.temporaryStats.defense = (unit.temporaryStats.defense || 0) + 5;
                }
                if (dist <= 2 && ally.stats.health_max > 150) {
                    unit.temporaryStats.crit_chance = (unit.temporaryStats.crit_chance || 0) + 0.1;
                }
            }
        }
    }
}

module.exports = BattleSimulation;
