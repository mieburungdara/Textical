const BaseController = require('./BaseController');
const prisma = require('../db');

class RegionController extends BaseController {
    /**
     * Get the current regions version for delta sync
     * Returns the version number that client can use to determine if cache needs update
     */
    async getVersion(req, res) {
        await this.execute(res, async () => {
            // Try to get version from SystemSetting (if exists)
            const setting = await prisma.systemSetting.findUnique({
                where: { key: 'regions_version' }
            });
            
            let version = 1; // Default version
            
            if (setting) {
                version = parseInt(setting.value) || 1;
            } else {
                // If no setting exists, create one with default version
                // This ensures version tracking starts
                await prisma.systemSetting.upsert({
                    where: { key: 'regions_version' },
                    update: {},
                    create: { key: 'regions_version', value: '1' }
                });
            }
            
            this.sendSuccess(res, { version });
        });
    }

    async getGlobalInfluence(req, res) {
        await this.execute(res, async () => {
            const regions = await prisma.regionTemplate.findMany({
                include: {
                    influence: { include: { faction: true } },
                    activeEvents: { include: { template: true } }
                }
            });
            this.sendSuccess(res, regions);
        });
    }

    async getAllRegions(req, res) {
        await this.execute(res, async () => {
            const regions = await prisma.regionTemplate.findMany({
                include: { connections: true }
            });
            const mapped = regions.map(r => ({ ...r, type: r.visualType }));
            this.sendSuccess(res, mapped);
        });
    }

    async getRegionDetails(req, res) {
        await this.execute(res, async () => {
            const regionId = parseInt(req.params.id);
            const region = await prisma.regionTemplate.findUnique({
                where: { id: regionId },
                include: { 
                    resources: { include: { item: true } },
                    connections: { include: { target: true } },
                    monsters: { include: { monster: true } }
                }
            });
            if (!region) return this.sendError(res, "Region not found", 404);
            
            const flattenedMonsters = region.monsters.map(m => m.monster);
            this.sendSuccess(res, { ...region, type: region.visualType, monsters: flattenedMonsters });
        });
    }
}

module.exports = new RegionController();
