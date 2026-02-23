const BaseService = require('../BaseService');
const detector = require('../../logic/faction/ConflictDetector');
const eventService = require('../eventService');

/**
 * ConflictEventService
 * Orchestrates automated war triggers based on regional competition.
 */
class ConflictEventService extends BaseService {
    constructor() {
        super();
        this.CONFLICT_TEMPLATE_ID = 10; // Placeholder for "Frontline Skirmish" Event Template
        this.CONFLICT_DURATION_MINS = 60;
    }

    /**
     * Scans all regions and triggers conflict events where parity is high.
     */
    async checkAndTriggerConflicts() {
        // 1. Fetch all influence data
        const influenceData = await this.db.regionalInfluence.findMany();
        const grouped = {};
        influenceData.forEach(i => {
            if (!grouped[i.regionId]) grouped[i.regionId] = [];
            grouped[i.regionId].push(i);
        });

        // 2. Fetch all war-status relations
        const relations = await this.db.factionRelation.findMany({ where: { status: "WAR" } });
        const warMap = {};
        relations.forEach(r => {
            const key = `${Math.min(r.factionAId, r.factionBId)}_${Math.max(r.factionAId, r.factionBId)}`;
            warMap[key] = "WAR";
        });

        // 3. Detect Hotspots
        const hotspots = detector.detectConflicts(grouped, warMap);

        const triggers = [];
        for (const spot of hotspots) {
            // Check if there is already an active conflict event in this region
            const existing = await this.db.activeEvent.findFirst({
                where: { regionId: spot.regionId, templateId: this.CONFLICT_TEMPLATE_ID }
            });

            if (!existing) {
                this.log(`Conflict Detected in Region ${spot.regionId}! Triggering Frontline Skirmish...`, "Conflict");
                triggers.push(eventService.triggerEvent(this.CONFLICT_TEMPLATE_ID, spot.regionId, this.CONFLICT_DURATION_MINS));
            }
        }

        return await Promise.all(triggers);
    }
}

module.exports = new ConflictEventService();
