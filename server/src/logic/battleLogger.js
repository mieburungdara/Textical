class BattleLogger {
    constructor() {
        this.logs = [];
    }

    /**
     * @param {number} tick 
     * @param {string} type 
     * @param {string} message 
     * @param {Array} units 
     * @param {Object} data 
     */
    addEntry(tick, type, message, units, data = {}) {
        const states = {};
        units.forEach(u => {
            states[u.instanceId] = { 
                hp: u.currentHealth, 
                mana: u.currentMana, 
                ap: u.currentActionPoints, 
                // FIX: Clone the position object to prevent reference mutation
                pos: { x: u.gridPos.x, y: u.gridPos.y } 
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

    /**
     * @returns {Array}
     */
    getLogs() {
        return this.logs;
    }
}

module.exports = BattleLogger;
