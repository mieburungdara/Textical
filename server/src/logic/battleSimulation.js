const BattleUnit = require('./battleUnit');
const BattleGrid = require('./battleGrid');
const BattleLogger = require('./battleLogger');
const BattleRules = require('./battleRules');
const BattleAI = require('./battleAI');

class BattleSimulation {
    /**
     * @param {number} width 
     * @param {number} height 
     */
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.units = [];
        this.currentTick = 0;
        this.isFinished = false;
        this.winnerTeam = -1;
        this.MAX_TICKS = 1500;
        this.killedMonsterIds = [];
        this.rewards = { gold: 0, exp: 0 };

        // Modular Components (Composition)
        this.grid = new BattleGrid(width, height);
        this.logger = new BattleLogger();
        this.rules = new BattleRules(this);
        this.ai = new BattleAI(this);
    }

    /**
     * @param {Object} data 
     * @param {number} teamId 
     * @param {Object} pos 
     * @param {Object} stats 
     */
    addUnit(data, teamId, pos, stats) {
        const safeX = Math.max(0, Math.min(this.width - 1, pos.x));
        const safeY = Math.max(0, Math.min(this.height - 1, pos.y));
        
        const unit = new BattleUnit(data, teamId, { x: safeX, y: safeY }, stats);
        this.units.push(unit);
        this.grid.unitGrid[safeY][safeX] = unit;
        return unit;
    }

    run() {
        this.logger.addEntry(0, "GAME_START", "Modular Authoritative Master Engine Active!", this.units);
        
        while (!this.isFinished && this.currentTick < this.MAX_TICKS) {
            this.processTick();
        }
        
        return { 
            winner: this.winnerTeam, 
            logs: this.logger.getLogs(), 
            killed_monsters: this.killedMonsterIds, 
            rewards: this.rewards 
        };
    }

    processTick() {
        this.currentTick++;
        
        // 1. Update Sub-systems
        this.grid.updateObstacles(this.units);
        
        // 2. Unit Maintenance
        this.units.forEach(u => { 
            if (!u.isDead) {
                u.tick(1.0);
                const dot = u.applyStatusDamage();
                if (dot > 0) {
                    this.logger.addEntry(this.currentTick, "VFX", `${u.data.name} status damage`, this.units, { 
                        actor_id: u.instanceId, 
                        vfx: "burn" 
                    });
                }
            }
        });

        // 3. Turn Execution
        const readyUnits = this.units
            .filter(u => !u.isDead && u.isReady())
            .sort((a, b) => b.currentActionPoints - a.currentActionPoints);

        for (let actor of readyUnits) {
            if (actor.isDead) continue; 
            
            this.ai.decideAction(actor);
            
            actor.currentActionPoints -= 100.0;
            actor.applyRegen();
            
            this.logger.addEntry(this.currentTick, "WAIT", `${actor.data.name} turn end`, this.units, { 
                actor_id: actor.instanceId 
            });
            
            if (this.rules.checkWinCondition()) return;
        }

        // 4. Resolve deaths at end of batch
        this.rules.resolveDeaths();
    }
}

module.exports = BattleSimulation;
