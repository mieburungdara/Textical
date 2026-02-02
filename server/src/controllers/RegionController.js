const BaseController = require('./BaseController');
const prisma = require('../db');

class RegionController extends BaseController {
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
