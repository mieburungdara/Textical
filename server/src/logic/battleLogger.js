class BattleLogger {
    constructor() {
        this.logs = [];
        this.currentTickData = null;
    }

    /**
     * Memulai pengumpulan data untuk satu tick visual.
     */
    startTick(tick) {
        this.currentTickData = {
            tick: tick,
            events: [],
            unit_states: {}
        };
    }

    /**
     * Menambahkan event ke dalam tick yang sedang berjalan.
     */
    addEvent(type, message, data = {}) {
        if (!this.currentTickData) return;
        this.currentTickData.events.push({
            type: type,
            message: message,
            data: data
        });
    }

    /**
     * Mengunci state posisi dan HP unit di akhir tick, lalu menyimpan tick tersebut.
     */
    commitTick(units) {
        if (!this.currentTickData) return;
        
        units.forEach(u => {
            this.currentTickData.unit_states[u.instanceId] = { 
                hp: u.currentHealth, 
                mana: u.currentMana, 
                ap: u.currentActionPoints, 
                pos: { x: u.gridPos.x, y: u.gridPos.y } 
            };
        });

        this.logs.push(this.currentTickData);
        this.currentTickData = null;
    }

    getLogs() {
        return this.logs;
    }
}

module.exports = BattleLogger;