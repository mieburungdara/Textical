const _ = require('lodash');
const traitService = require('../../services/traitService');

class SimLoopProcessor {
    constructor(sim) {
        this.sim = sim;
    }

    run() {
        this.sim.units.forEach(u => traitService.executeHook("onBattleStart", u, this.sim));
        this.sim.logger.startTick(0);
        this.sim.logger.addEvent("ENGINE", `Tactical Engine Engaged. Region: ${this.sim.regionType}`);
        this.sim.logger.commitTick(this.sim.units);

        while (!this.sim.isFinished && this.sim.currentTick < this.sim.MAX_TICKS) {
            this.sim.processTick();
        }
        return { winner: this.sim.winnerTeam, logs: this.sim.logger.getLogs() };
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
                const dotDamage = u.applyStatusDamage(s);
                if (dotDamage > 0) traitService.executeHook("onPostHit", u, null, dotDamage, s);
            } 
        });

        const readyUnits = _.chain(s.units).filter(u => !u.isDead && u.isReady()).orderBy(['currentActionPoints'], ['desc']).value();
        for (let actor of readyUnits) {
            if (actor.isDead) continue; 
            traitService.executeHook("onTurnStart", actor, s);
            s.ai.decideAction(actor);
            traitService.executeHook("onTurnEnd", actor, s);
            actor.modifyAP(-100.0, s);
            actor.applyRegen(s);
            if (s.rules.checkWinCondition()) break;
        }
        
        s.rules.resolveDeaths();
        if (s.currentTick % 100 === 0) s.units.forEach(u => traitService.executeHook("onRoundEnd", u, s));
        s.logger.commitTick(s.units);
    }
}

module.exports = SimLoopProcessor;
