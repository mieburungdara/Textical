
const BaseService = require('./BaseService');
const eventService = require('./eventService');
const { EVENT_TEMPLATES } = require('../constants/events'); // Assuming this exists or will exist

/**
 * EventCoordinator
 * Orchestrates global and regional events.
 */
class EventCoordinator extends BaseService {
    constructor() {
        super();
    }

    /**
     * Trigger a random event in a random region (Base implementation)
     */
    async startRandomEvent() {
        // TODO: Implement logic to pick random region and random event template
        // For now, this is a placeholder for future expansion
        this.log("Random event triggering not yet implemented.", "EventCoordinator");
    }

    /**
     * Stop an active event manually.
     * @param {number} activeEventId 
     */
    async stopEvent(activeEventId) {
        const event = await this.db.activeEvent.findUnique({ where: { id: activeEventId } });
        if (!event) return;

        await this.db.activeEvent.delete({ where: { id: activeEventId } });
        this.log(`Event ${activeEventId} stopped manually.`, "EventCoordinator");
    }

    /**
     * Get global modifiers active from all current events.
     * Returns an object with aggregated multipliers/bonuses.
     */
    async getGlobalModifiers() {
        const activeEvents = await this.db.activeEvent.findMany({
            include: { template: true }
        });

        const modifiers = {
            expGainMult: 1.0,
            lootChanceMult: 1.0,
            goldGainMult: 1.0,
            // Add other modifiers as needed
        };

        for (const event of activeEvents) {
            const tmpl = event.template;
            if (tmpl.expGainMult) modifiers.expGainMult *= tmpl.expGainMult;
            if (tmpl.lootChanceMult) modifiers.lootChanceMult *= tmpl.lootChanceMult;
            // Add other modifier logic here
        }

        return modifiers;
    }
}

module.exports = new EventCoordinator();
