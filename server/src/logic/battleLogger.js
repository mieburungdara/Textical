const _ = require('lodash');

class BattleLogger {
    constructor() {
        this.ticks = [];
        this.currentTick = null;
    }

    startTick(tickNumber) {
        this.currentTick = {
            tick: tickNumber,
            events: [],
            units: []
        };
    }

    addEvent(type, msg, data = {}) {
        if (!this.currentTick) return;
        this.currentTick.events.push({
            type, // MOVE, ATTACK, HEAL, TRAIT, AI, STATUS
            msg,
            data,
            timestamp: Date.now()
        });
    }

    commitTick(units) {
        if (!this.currentTick) return;
        
        // AAA: Capture rich unit state snapshots
        this.currentTick.units = units.map(u => ({
            id: u.instanceId,
            name: u.data.name,
            team: u.teamId,
            pos: { ...u.gridPos },
            hp: u.currentHealth,
            maxHp: u.stats.health_max,
            mp: u.currentMana,
            maxMp: u.stats.mana_max,
            ap: u.currentActionPoints,
            effects: u.activeEffects.map(e => ({ type: e.type, duration: e.duration })),
            traits: [...u.traits],
            // We'll capture a simplified view of unit's intent if available
            targetId: u.currentTargetId || null 
        }));

        this.ticks.push(this.currentTick);
        this.currentTick = null;
    }

    getLogs() {
        return this.ticks;
    }
}

module.exports = BattleLogger;
