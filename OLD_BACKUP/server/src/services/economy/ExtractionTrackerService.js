const BaseService = require('../BaseService');

/**
 * ExtractionTrackerService
 * Orchestrates regional item extraction volume tracking.
 */
class ExtractionTrackerService extends BaseService {
    /**
     * Records an extraction event (Mining, Lumbering, etc.).
     */
    async recordExtraction(regionId, templateId, amount) {
        if (amount <= 0) return;

        return await this.db.regionalExtractionStats.upsert({
            where: { regionId_templateId: { regionId, templateId } },
            update: { 
                volume24h: { increment: amount },
                lastUpdated: new Date()
            },
            create: {
                regionId,
                templateId,
                volume24h: amount
            }
        });
    }

    /**
     * Retrieves current stats for a specific commodity in a region.
     */
    async getStats(regionId, templateId) {
        return await this.db.regionalExtractionStats.findUnique({
            where: { regionId_templateId: { regionId, templateId } }
        });
    }
}

module.exports = new ExtractionTrackerService();
