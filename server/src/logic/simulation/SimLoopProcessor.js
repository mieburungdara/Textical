const _ = require('lodash');
const traitService = require('../../services/traitService');
const delayCalculator = require('./DelayCalculator');

class SimLoopProcessor {
    constructor(sim) {
        this.sim = sim;
    }

    run() {
        this.sim.units.forEach(u => traitService.executeHook("onBattleStart", u, this.sim));
        this.sim.logger.startTick(0);
        this.sim.logger.addEvent("ENGINE", `Tactical Engine Engaged. Region: ${this.sim.regionType}`, {}, true);
        this.sim.logger.commitTick(this.sim.units);

        while (!this.sim.isFinished && this.sim.currentTick < this.sim.MAX_TICKS) {
            this.sim.processTick();
        }
        return { 
            winner: this.sim.winnerTeam, 
            logs: this.sim.logger.getLogs(), 
            rewards: this.sim.rewards,
            initialUnits: this.sim.units
        };
    }

    processTick() {
        this.sim.currentTick++;
        const s = this.sim;

        if (s.currentTick % 100 === 0) s.units.forEach(u => traitService.executeHook("onRoundStart", u, s));
        s.units.forEach(u => traitService.executeHook("onTickStart", u, s));
        s.grid.updateObstacles(s.units);
        s.logger.startTick(s.currentTick);

        s.environment.applyTerrainEffects();
        s.environment.applyAuras();

        _.forEach(s.units, (u) => { 
            if (!u.isDead) { 
                u.tick(1.0, s); 
                u.applyRegen(s); // Move regen here to sync with tick update
                const dotDamage = u.applyStatusDamage(s);
                if (dotDamage > 0) traitService.executeHook("onPostHit", u, null, dotDamage, s);
            } 
        });

        // AAA: Timeline Execution Loop
        // Filter units whose 'nextActionTick' has been reached
        const readyUnits = _.chain(s.units)
            .filter(u => !u.isDead && u.isReady(s))
            .orderBy(['nextActionTick'], ['asc']) // Oldest readiness first
            .value();

        for (let actor of readyUnits) {
            if (actor.isDead) continue; 
            traitService.executeHook("onTurnStart", actor, s);
            
            // Capture state BEFORE action for delay calculation
            const oldPos = { ...actor.gridPos };
            
            const actionTaken = s.ai.decideAction(actor);
            
            if (actionTaken) {
                traitService.executeHook("onTurnEnd", actor, s);
                
                // AAA: Calculate Delay based on what happened
                let delay = 100; // Default
                const moved = actor.gridPos.x !== oldPos.x || actor.gridPos.y !== oldPos.y;
                
                if (moved) {
                    delay = delayCalculator.calculateMoveDelay(actor);
                } else {
                    // Logic: If they attacked or used skill, use attack delay
                    delay = delayCalculator.calculateAttackDelay(actor);
                }
                
                actor.setActionDelay(delay, s);
                actor.stuckTicks = 0; 
            } else {
                // If blocked or nothing to do, rest for a standardized duration
                actor.setActionDelay(delayCalculator.calculateIdleDelay(actor), s);
                actor.stuckTicks = (actor.stuckTicks || 0) + 1;
            }
            
            if (s.rules.checkWinCondition()) break;
        }
        
        s.rules.resolveDeaths();
        if (s.currentTick % 100 === 0) s.units.forEach(u => traitService.executeHook("onRoundEnd", u, s));
        s.logger.commitTick(s.units);
    }
}

module.exports = SimLoopProcessor;

