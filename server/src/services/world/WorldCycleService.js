const BaseService = require('../BaseService');

/**
 * WorldCycleService
 * Orchestrates the global time and weather cycles.
 */
class WorldCycleService extends BaseService {
    constructor() {
        super();
        this.WEATHER_TYPES = ["CLEAR", "RAIN", "STORM", "HEATWAVE"];
        this.WEATHER_CHANGE_CHANCE = 0.15; // 15% chance to change weather each tick
        this.MOON_PHASES = ["NEW", "WAXING", "FULL", "WANING"];
    }

    /**
     * Advances the world state by one tick.
     * Call this via cron or simulated game tick.
     */
    async updateWorldTick() {
        return await this.runTransaction(async (tx) => {
            let state = await tx.worldState.findUnique({ where: { id: 1 } });
            
            if (!state) {
                state = await tx.worldState.create({
                    data: { id: 1, currentHour: 12, weatherType: "CLEAR", moonPhase: "NEW" }
                });
            }

            // 1. Advance Hour
            const nextHour = (state.currentHour + 1) % 24;
            
            // 2. Advance Moon Phase (only when day changes)
            let nextMoonPhase = state.moonPhase;
            if (nextHour === 0) {
                // Simplified: Change phase every 7 game days
                // Since we don't track 'day' count in a simple way yet, we'll roll for it
                // or just cycle it periodically based on hour wrap
                const phases = this.MOON_PHASES;
                const currentIdx = phases.indexOf(state.moonPhase);
                // For now, let's just cycle it every day for testing, or use a pseudo-random chance
                if (Math.random() < 0.25) { // 25% chance each day to move to next phase
                    nextMoonPhase = phases[(currentIdx + 1) % phases.length];
                }
            }

            // 3. Roll for Weather Change
            let nextWeather = state.weatherType;
            if (Math.random() < this.WEATHER_CHANGE_CHANCE) {
                const filtered = this.WEATHER_TYPES.filter(w => w !== state.weatherType);
                nextWeather = filtered[Math.floor(Math.random() * filtered.length)];
            }

            // 4. Persist
            const updated = await tx.worldState.update({
                where: { id: 1 },
                data: {
                    currentHour: nextHour,
                    weatherType: nextWeather,
                    moonPhase: nextMoonPhase,
                    lastTick: new Date()
                }
            });

            this.log(`World Tick: Hour ${updated.currentHour}, Weather ${updated.weatherType}, Moon ${updated.moonPhase}`, "World");
            return updated;
        });
    }

    /**
     * Retrieves current global world state.
     */
    async getWorldState() {
        let state = await this.db.worldState.findUnique({ where: { id: 1 } });
        if (!state) {
            state = await this.db.worldState.create({
                data: { id: 1, currentHour: 12, weatherType: "CLEAR", moonPhase: "NEW" }
            });
        }
        return state;
    }
}

module.exports = new WorldCycleService();
