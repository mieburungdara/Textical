const BaseService = require('./BaseService');

/**
 * TavernEventService
 * Manages scheduled events like Festivals, Happy Hours, etc.
 */
class TavernEventService extends BaseService {
    constructor() {
        super();
    }

    /**
     * Create a new scheduled event
     */
    async scheduleEvent(data) {
        return await this.db.tavernEvent.create({
            data: {
                name: data.name,
                description: data.description,
                type: data.type,
                regionId: data.regionId || null,
                startsAt: new Date(data.startsAt),
                endsAt: new Date(data.endsAt),
                buffMultiplier: data.buffMultiplier || 1.5
            }
        });
    }

    /**
     * Get active events for a specific region
     */
    async getActiveEvents(regionId) {
        const now = new Date();
        return await this.db.tavernEvent.findMany({
            where: {
                OR: [
                    { regionId: regionId },
                    { regionId: null } // Global events
                ],
                startsAt: { lte: now },
                endsAt: { gte: now },
                isActive: true
            }
        });
    }

    /**
     * Ticker to update event active states based on current time
     */
    async updateEventStates() {
        const now = new Date();
        
        // Activate started events
        await this.db.tavernEvent.updateMany({
            where: {
                startsAt: { lte: now },
                endsAt: { gte: now },
                isActive: false
            },
            data: { isActive: true }
        });

        // Deactivate finished events
        await this.db.tavernEvent.updateMany({
            where: {
                endsAt: { lt: now },
                isActive: true
            },
            data: { isActive: false }
        });
    }

    /**
     * Get the combined buff multiplier for a region
     */
    async getRegionMultiplier(regionId) {
        const activeEvents = await this.getActiveEvents(regionId);
        if (activeEvents.length === 0) return 1.0;
        
        // Compound multipliers or pick highest? Let's pick highest for balance.
        return Math.max(...activeEvents.map(e => e.buffMultiplier));
    }
}

module.exports = new TavernEventService();
