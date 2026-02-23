const BaseService = require('./BaseService');
const resolver = require('./spawner/SpawnResolver');

/**
 * WorldSpawnerService
 * Thin orchestrator for dynamic world entities.
 * Decouples region data from active phenomenal injections.
 */
class WorldSpawnerService extends BaseService {
    async getAvailableResources(regionId) {
        return await resolver.resolveResources(this.db, regionId);
    }

    async getAvailableMonsters(regionId) {
        return await resolver.resolveMonsters(this.db, regionId);
    }

    /**
     * Validates if a specific resource is currently available.
     */
    async isResourceAvailable(regionId, templateId) {
        const resources = await this.getAvailableResources(regionId);
        return resources.some(r => r.templateId === templateId);
    }
}

module.exports = new WorldSpawnerService();
