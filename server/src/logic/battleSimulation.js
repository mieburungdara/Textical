const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');
const BattleUnit = require('./battleUnit');
const BattleGrid = require('./battleGrid');
const BattleLogger = require('./battleLogger');
const BattleRules = require('./battleRules');
const BattleAI = require('./battleAI');
const TraitsManager = require('./traitsManager');

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
        this.unitDeeds = {}; // NEW: { "p_hero_0": { "kills_orc": 5, "steps_lava": 10 } }
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
        // 1. HOOK: Battle Start
        this.units.forEach(u => TraitsManager.executeHook("onBattleStart", u, this));
        
        this.logger.addEntry(0, "GAME_START", `Battle [${this.battleId.substring(0,8)}] Engaged!`, this.units);
        
        while (!this.isFinished && this.currentTick < this.MAX_TICKS) {
            this.processTick();
        }
        
        return { winner: this.winnerTeam, logs: this.logger.getLogs(), killed_monsters: this.killedMonsterIds, rewards: this.rewards };
    }

    processTick() {
        this.currentTick++;
        
        // 2. HOOK: Tick Start
        this.units.forEach(u => TraitsManager.executeHook("onTickStart", u, this));

        this.grid.updateObstacles(this.units);
        
        _.forEach(this.units, (u) => { 
            if (!u.isDead) {
                u.tick(1.0);
                u.applyStatusDamage();
            }
        });

        const readyUnits = _.chain(this.units)
            .filter(u => !u.isDead && u.isReady())
            .orderBy(['currentActionPoints'], ['desc'])
            .value();

        for (let actor of readyUnits) {
            if (actor.isDead) continue; 
            
            // 3. HOOK: Turn Start
            const turnMods = TraitsManager.executeHook("onTurnStart", actor, this) || {};
            actor.tempDamageMult = turnMods.temporaryDamageMult || 1.0;

            this.ai.decideAction(actor);
            
            // 19. HOOK: Turn End
            TraitsManager.executeHook("onTurnEnd", actor, this);

            actor.currentActionPoints -= 100.0;
            actor.applyRegen();
            actor.tempDamageMult = 1.0;
            
            if (this.rules.checkWinCondition()) return;
        }
        this.rules.resolveDeaths();
    }
}

module.exports = BattleSimulation;