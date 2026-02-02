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
                    data: { id: 1, currentHour: 12, weatherType: "CLEAR" }
                });
            }

            // 1. Advance Hour
            const nextHour = (state.currentHour + 1) % 24;

            // 2. Roll for Weather Change
            let nextWeather = state.weatherType;
            if (Math.random() < this.WEATHER_CHANGE_CHANCE) {
                const filtered = this.WEATHER_TYPES.filter(w => w !== state.weatherType);
                nextWeather = filtered[Math.floor(Math.random() * filtered.length)];
            }

            // 3. Persist
            const updated = await tx.worldState.update({
                where: { id: 1 },
                data: {
                    currentHour: nextHour,
                    weatherType: nextWeather,
                    lastTick: new Date()
                }
            });

            this.log(`World Tick: Hour ${updated.currentHour}, Weather ${updated.weatherType}`, "World");
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
                data: { id: 1, currentHour: 12, weatherType: "CLEAR" }
            });
        }
        return state;
    }
}

module.exports = new WorldCycleService();
