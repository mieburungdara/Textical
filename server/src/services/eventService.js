const BaseService = require('./BaseService');

/**
 * EventService
 * Orchestrates the lifecycle of dynamic world phenomena.
 */
class EventService extends BaseService {
    /**
     * Get all active events for a specific region
     */
    async getActiveEvents(regionId) {
        const now = new Date();
        const active = await this.db.activeEvent.findMany({
            where: {
                regionId,
                expiresAt: { gt: now }
            },
            include: { template: true }
        });

        return active.map(a => ({
            id: a.id,
            templateId: a.template.id,
            name: a.template.name,
            description: a.template.description,
            metadata: JSON.parse(a.template.metadata),
            expiresAt: a.expiresAt
        }));
    }

    /**
     * Trigger a new world event in a region
     */
    async triggerEvent(templateId, regionId, durationSeconds = 3600) {
        const template = await this.db.worldEventTemplate.findUnique({ where: { id: templateId } });
        if (!template) throw new Error("Event template not found.");

        const now = new Date();
        const expiresAt = new Date(now.getTime() + (durationSeconds * 1000));

        this.log(`Triggering world event: ${template.name} in Region ${regionId}`, "Event");

        return await this.db.activeEvent.upsert({
            where: { regionId_templateId: { regionId, templateId } },
            update: { startedAt: now, expiresAt: expiresAt },
            create: { regionId, templateId, startedAt: now, expiresAt: expiresAt }
        });
    }
}

module.exports = new EventService();
