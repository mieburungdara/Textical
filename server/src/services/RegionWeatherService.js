const BaseService = require('./BaseService');

/**
 * RegionWeatherService
 * Manages dynamic weather patterns across the world.
 * Provides real-time weather data for regions and notifies connected clients.
 */
class RegionWeatherService extends BaseService {
    constructor() {
        super();
        this.weatherStates = new Map(); // regionId -> { weather, intensity, lastUpdate }
        this.weatherTypes = ['CLEAR', 'RAIN', 'STORM', 'SNOW', 'FOG', 'SANDSTORM'];
        this.updateInterval = 5 * 60 * 1000; // 5 minutes
        this.timer = null;
    }

    /**
     * Initialize the weather service and start the update cycle.
     */
    init() {
        this.log("Initializing dynamic weather system...", "WeatherService");
        this.updateAllWeather();
        
        // Clear existing timer if any
        if (this.timer) clearInterval(this.timer);
        
        this.timer = setInterval(() => this.updateAllWeather(), this.updateInterval);
    }

    /**
     * Updates weather for all regions based on terrain and random patterns.
     */
    async updateAllWeather() {
        try {
            // Get all regions to determine their base conditions
            const regions = await this.db.regionTemplate.findMany({
                select: { 
                    id: true, 
                    weatherOverride: true,
                    zoneType: true
                }
            });

            const timestamp = Date.now();
            const updates = [];
            
            for (const region of regions) {
                let weather = 'CLEAR';
                let intensity = 0.0;

                // 1. Check for manual overrides in DB
                if (region.weatherOverride && region.weatherOverride !== 'DYNAMIC') {
                    weather = region.weatherOverride;
                    intensity = 1.0;
                } else {
                    // 2. Dynamic generation logic
                    const state = this._generateWeatherForRegion(region);
                    weather = state.weather;
                    intensity = state.intensity;
                }

                const stateObj = { weather, intensity, lastUpdate: timestamp };
                this.weatherStates.set(region.id, stateObj);
                
                // Only send non-clear weather or changes to save bandwidth? 
                // For now, let's keep it simple and send everything needed.
                updates.push({ regionId: region.id, ...stateObj });
            }

            this.log(`Weather cycle complete. ${updates.filter(u => u.weather !== 'CLEAR').length} regions active weather.`, "WeatherService");
            
            // Broadcast to all connected clients via SocketService
            // We use a lazy requirement to avoid circular dependencies during boot
            try {
                const socketService = require('./socketService');
                if (socketService && socketService.broadcast) {
                    socketService.broadcast('map:weather_update', {
                        timestamp,
                        regions: updates
                    });
                }
            } catch (socketErr) {
                // Socket service might not be ready yet
            }

        } catch (error) {
            console.error('[WEATHER-SERVICE] Update failed:', error instanceof Error ? error.message : String(error));
        }
    }

    /**
     * Manually updates the weather for a specific region and broadcasts the change.
     * @param {string} regionId The ID of the region to update.
     * @param {string} weather The new weather type (e.g., 'RAIN', 'CLEAR').
     * @param {number} intensity The intensity of the weather (0.0 to 1.0).
     */
    async updateRegionWeather(regionId, weather, intensity) {
        if (!this.weatherStates.has(regionId)) {
            this.log(`Attempted to update weather for unknown region: ${regionId}`, "WeatherService", "warn");
            return;
        }
        
        const timestamp = Date.now();
        const newState = { weather, intensity, lastUpdate: timestamp };
        this.weatherStates.set(regionId, newState);

        this.log(`Manual weather update for region ${regionId}: ${weather} (${intensity})`, "WeatherService");

        // Broadcast this specific update
        try {
            const socketService = require('./socketService');
            if (socketService && socketService.broadcast) {
                socketService.broadcast('map:weather_update', {
                    timestamp,
                    regions: [{ regionId, ...newState }]
                });
            }
        } catch (socketErr) {
            // Socket service might not be ready yet
            this.log(`Failed to broadcast manual weather update for ${regionId}: ${socketErr.message}`, "WeatherService", "error");
        }
    }

    /**
     * Internal logic for weather generation.
     * @private
     * @param {any} region
     */
    _generateWeatherForRegion(region) {
        // Simple weighted random based on region tags/type
        const tags = (region.tags || '').toUpperCase();
        let weather = 'CLEAR';
        let intensity = 0.0;
        const rand = Math.random();

        // Base probabilities
        if (region.zoneType === 'BLACK' || region.zoneType === 'RED') {
            // Dangerous zones have worse weather
            if (rand > 0.7) {
                weather = 'FOG';
                intensity = Math.random() * 0.8;
            } else if (rand > 0.4) {
                weather = 'RAIN';
                intensity = Math.random() * 0.9;
            }
        } else if (region.zoneType === 'WHITE' || tags.includes('SNOW')) {
            if (rand > 0.5) {
                weather = 'SNOW';
                intensity = Math.random() * 0.7;
            }
        } else if (region.zoneType === 'CORRUPTED') {
            weather = 'FOG';
            intensity = 0.9;
        } else {
            // Normal zones
            if (rand > 0.85) {
                weather = 'RAIN';
                intensity = Math.random() * 0.6;
            } else if (rand > 0.98) {
                weather = 'STORM';
                intensity = Math.random() * 0.3 + 0.7;
            }
        }

        return { weather, intensity };
    }

    /**
     * Returns a snapshot of current weather for all regions.
     */
    getWeatherSnapshot() {
        const snapshot = [];
        for (const [id, state] of this.weatherStates.entries()) {
            snapshot.push({ regionId: id, ...state });
        }
        return snapshot;
    }

    /**
     * Get weather for a specific region.
     */
    getRegionWeather(regionId) {
        return this.weatherStates.get(regionId) || { weather: 'CLEAR', intensity: 0, lastUpdate: Date.now() };
    }
}

module.exports = new RegionWeatherService();
