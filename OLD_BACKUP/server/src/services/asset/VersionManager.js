/**
 * VersionManager
 * Unified version tracking for all template categories
 */

const BaseService = require('../BaseService');
const prisma = require('../../db');

const CATEGORIES = [
    'items', 'monsters', 'regions', 'npcs', 'skills',
    'classes', 'recipes', 'quests',
    'achievements', 'factions', 'world_events', 'dialogues'
];

const MODEL_MAP = {
    items: 'ItemTemplate',
    monsters: 'MonsterTemplate',
    regions: 'RegionTemplate',
    npcs: 'NPCTemplate',
    skills: 'SkillTemplate',
    classes: 'ClassTemplate',
    recipes: 'RecipeTemplate',
    quests: 'QuestTemplate',
    achievements: 'AchievementTemplate',
    factions: 'Faction',
    world_events: 'WorldEventTemplate',
    dialogues: 'DialogueNode'
};

class VersionManager extends BaseService {
    /**
     * Get version for all categories
     * DEBUG: Add detailed logging to trace issues
     */
    async getAllVersions() {
        const versions = {};
        
        for (const category of CATEGORIES) {
            const modelName = MODEL_MAP[category];
            if (!modelName) continue;
            
            try {
                // DEBUG: Log model name to verify mapping
                console.log(`[VersionManager.DEBUG] Querying ${modelName} for version...`);
                
                // Try to get count first to verify table exists
                const countResult = await this.db[modelName].count();
                console.log(`[VersionManager.DEBUG] ${modelName}: ${countResult} records found`);
                
                // Try aggregate - this will fail if version field doesn't exist
                const result = await this.db[modelName].aggregate({
                    _max: { version: true }
                });
                
                versions[category] = result._max.version || 1;
                console.log(`[VersionManager.DEBUG] ${category}: version = ${versions[category]}`);
            } catch (error) {
                console.warn(`[VersionManager] ERROR getting version for ${category}:`, error.message);
                console.warn(`[VersionManager] This usually means the 'version' field doesn't exist in ${modelName}`);
                versions[category] = 1; // Default fallback
            }
        }
        
        return versions;
    }

    /**
     * Get version for a specific category
     */
    async getCategoryVersion(category) {
        const modelName = MODEL_MAP[category];
        if (!modelName) return null;
        
        try {
            const result = await this.db[modelName].aggregate({
                _max: { version: true }
            });
            return result._max.version || 1;
        } catch {
            return null;
        }
    }

    /**
     * Bump version for a category (after template changes)
     * This increments ALL records in the category to force client update
     */
    async bumpVersion(category) {
        const modelName = MODEL_MAP[category];
        if (!modelName) return 1;
        
        try {
            const result = await this.db[modelName].aggregate({
                _max: { version: true }
            });
            
            const newVersion = (result._max.version || 0) + 1;
            
            // Update all records in category to new version
            await this.db[modelName].updateMany({
                data: {
                    version: newVersion,
                    updatedAt: new Date()
                }
            });
            
            console.log(`[VersionManager] ${category} bumped to v${newVersion}`);
            return newVersion;
        } catch (error) {
            console.error(`[VersionManager] Error bumping ${category}:`, error.message);
            throw error;
        }
    }

    /**
     * Get manifest of all available assets (category → list of IDs)
     */
    async getManifest() {
        const manifest = {};
        
        for (const category of CATEGORIES) {
            const modelName = MODEL_MAP[category];
            if (!modelName) continue;
            
            try {
                const records = await this.db[modelName].findMany({
                    select: { id: true, version: true },
                    orderBy: { id: 'asc' }
                });
                
                manifest[category] = {
                    version: await this.getCategoryVersion(category),
                    entries: records.map(r => ({ id: r.id, version: r.version }))
                };
            } catch (error) {
                console.warn(`[VersionManager] Error getting manifest for ${category}:`, error.message);
                manifest[category] = { version: 1, entries: [] };
            }
        }
        
        return manifest;
    }

    /**
     * Get single asset with version info
     */
    async getAsset(category, id) {
        const modelName = MODEL_MAP[category];
        if (!modelName) return null;
        
        const idInt = parseInt(id);
        
        try {
            return await this.db[modelName].findUnique({
                where: { id: idInt }
            });
        } catch {
            return null;
        }
    }

    /**
     * Initialize version field for existing records (run once during migration)
     */
    async initializeVersions() {
        console.log('[VersionManager] Initializing version fields...');
        
        for (const category of CATEGORIES) {
            const modelName = MODEL_MAP[category];
            if (!modelName) continue;
            
            try {
                // Set version = 1 for all records that don't have version
                const result = await this.db[modelName].updateMany({
                    where: {
                        version: null
                    },
                    data: {
                        version: 1,
                        updatedAt: new Date()
                    }
                });
                
                console.log(`[VersionManager] ${category}: ${result.count} records initialized`);
            } catch (error) {
                // Column might not exist yet, that's OK
                console.log(`[VersionManager] ${category}: Not yet migrated, skipping`);
            }
        }
        
        console.log('[VersionManager] Initialization complete');
    }
}

module.exports = new VersionManager();
module.exports.VersionManager = VersionManager;
module.exports.CATEGORIES = CATEGORIES;
module.exports.MODEL_MAP = MODEL_MAP;
