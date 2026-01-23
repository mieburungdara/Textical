class BattleLogger {
    constructor() {
        this.logs = [];
    }

    addEntry(tick, type, message, units, data = {}) {
        const states = {};
        units.forEach(u => {
            states[u.instanceId] = { 
                hp: u.currentHealth, 
                mana: u.currentMana, 
                ap: u.currentActionPoints, 
                pos: u.gridPos 
            };
        });

        this.logs.push({
            tick: tick,
            type: type,
            message: message,
            data: data,
            unit_states: states
        });
    }

    getLogs() {
        return this.logs;
    }
}

module.exports = BattleLogger;
