const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');
const BattleUnit = require('./battleUnit');
const BattleGrid = require('./battleGrid');
const BattleLogger = require('./battleLogger');
const BattleRules = require('./battleRules');
const BattleAI = require('./battleAI');
const traitService = require('../services/traitService');

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
        this.terrainEffects = []; // Injected from Service

        this.grid = new BattleGrid(width, height);
        this.logger = new BattleLogger();
        this.rules = new BattleRules(this);
        this.ai = new BattleAI(this);
    }

    addUnit(data, teamId, pos, stats) {
        const unit = new BattleUnit(data, teamId, { x: _.clamp(pos.x, 0, this.width-1), y: _.clamp(pos.y, 0, this.height-1) }, stats);
        this.units.push(unit);
        this.grid.unitGrid[unit.gridPos.y][unit.gridPos.x] = unit;
        this.notifyAdjacencyGained(unit);
        return unit;
    }

    notifyAdjacencyGained(unit) {
        const neighbors = this.grid.getNeighbors(unit.gridPos);
        neighbors.forEach(nPos => {
            const neighbor = this.grid.unitGrid[nPos.y][nPos.x];
            if (neighbor && !neighbor.isDead) {
                traitService.executeHook("onAdjacencyGained", unit, neighbor, this);
                traitService.executeHook("onAdjacencyGained", neighbor, unit, this);
            }
        });
    }

    notifyAdjacencyLost(unit) {
        const neighbors = this.grid.getNeighbors(unit.gridPos);
        neighbors.forEach(nPos => {
            const neighbor = this.grid.unitGrid[nPos.y][nPos.x];
            if (neighbor) {
                traitService.executeHook("onAdjacencyLost", unit, neighbor, this);
                traitService.executeHook("onAdjacencyLost", neighbor, unit, this);
            }
        });
    }

    run() {
        this.units.forEach(u => traitService.executeHook("onBattleStart", u, this));
        this.logger.startTick(0);
        this.logger.addEvent("ENGINE", `Tactical Engine Engaged. Region: ${this.regionType}`);
        this.logger.commitTick(this.units);

        while (!this.isFinished && this.currentTick < this.MAX_TICKS) {
            this.processTick();
        }
        return { winner: this.winnerTeam, logs: this.logger.getLogs() };
    }

    processTick() {
        this.currentTick++;
        if (this.currentTick % 100 === 0) this.units.forEach(u => traitService.executeHook("onRoundStart", u, this));
        
        this.units.forEach(u => traitService.executeHook("onTickStart", u, this));
        this.grid.updateObstacles(this.units);
        this.logger.startTick(this.currentTick);

        this._applyTerrainEffects();
        this._applyAuras();

        _.forEach(this.units, (u) => { 
            if (!u.isDead) { 
                u.tick(1.0, this); 
                const dotDamage = u.applyStatusDamage(this);
                if (dotDamage > 0) traitService.executeHook("onPostHit", u, null, dotDamage, this);
            } 
        });

        const readyUnits = _.chain(this.units).filter(u => !u.isDead && u.isReady()).orderBy(['currentActionPoints'], ['desc']).value();
        for (let actor of readyUnits) {
            if (actor.isDead) continue; 
            traitService.executeHook("onTurnStart", actor, this);
            this.ai.decideAction(actor);
            traitService.executeHook("onTurnEnd", actor, this);
            actor.modifyAP(-100.0, this);
            actor.applyRegen(this);
            if (this.rules.checkWinCondition()) break;
        }
        this.rules.resolveDeaths();
        if (this.currentTick % 100 === 0) this.units.forEach(u => traitService.executeHook("onRoundEnd", u, this));
        this.logger.commitTick(this.units);
    }

    _applyTerrainEffects() {
        if (!this.terrainEffects || this.terrainEffects.length === 0) return;
        
        for (const unit of this.units.filter(u => !u.isDead)) {
            const tileId = this.grid.terrainGrid[unit.gridPos.y][unit.gridPos.x];
            
            for (const eff of this.terrainEffects) {
                // AAA: Only apply if unit is on the correct Tile ID OR if it's region-wide (tileId 0)
                // Let's assume eff.requiredTileId is needed. For now, we use a simple mapping:
                // LAVA Tile ID = 6
                const isLavaEffect = eff.effectType === "BURN" && tileId === 6;
                const isGeneralEffect = !eff.requiredTileId || eff.requiredTileId === tileId;

                if (!isLavaEffect && !isGeneralEffect) continue;
                if (this.currentTick % eff.tickInterval !== 0) continue;
                if (Math.random() > eff.chance) continue;

                switch (eff.effectType) {
                    case "BURN":
                        const BurnStatus = require('./status/definitions/Burn');
                        unit.applyEffect(new BurnStatus(3, eff.power), this);
                        break;
                    case "HEAL":
                        unit.currentHealth = Math.min(unit.stats.health_max, unit.currentHealth + eff.power);
                        traitService.executeHook("onHealthRegen", unit, eff.power, this);
                        break;
                    case "DRAIN":
                        const impactMods = traitService.executeHook("onTakeDamage", unit, null, eff.power, this) || {};
                        const finalDmg = impactMods.finalDamage !== undefined ? impactMods.finalDamage : eff.power;
                        unit.takeDamage(finalDmg);
                        traitService.executeHook("onPostHit", unit, null, finalDmg, this);
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
                if (dist <= 1) unit.temporaryStats.defense = (unit.temporaryStats.defense || 0) + 5;
            }
        }
    }
}

module.exports = BattleSimulation;