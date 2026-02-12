const BaseController = require('./BaseController');
const vitalityService = require('../services/vitalityService');
const prisma = require('../db');

class UserController extends BaseController {
    async getUserProfile(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) return this.sendError(res, "Invalid User ID", 400);
            
            // Sync vitality first
            await vitalityService.syncUserVitality(userId);

            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { 
                    inventory: { include: { template: true } },
                    taskQueue: { 
                        where: { status: "RUNNING" },
                        include: { targetRegion: true }
                    },
                    premiumTier: true,
                    region: true
                }
            });
            
            if (!user) return this.sendError(res, "User not found", 404);

            const activeTask = user.taskQueue.length > 0 ? {
                ...user.taskQueue[0],
                targetRegionType: user.taskQueue[0].targetRegion ? user.taskQueue[0].targetRegion.type : "TOWN",
                targetRegionName: user.taskQueue[0].targetRegion ? user.taskQueue[0].targetRegion.name : "Destination"
            } : null;
            
            const regionMetadata = user.region ? { 
                type: user.region.visualType, 
                visualType: user.region.visualType,
                name: user.region.name 
            } : { type: "TOWN", name: "Unknown" };

            this.sendSuccess(res, { 
                ...user, 
                activeTask,
                currentRegionData: regionMetadata
            });
        });
    }

    async updateSettings(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.body.userId);
            const { settings } = req.body;
            if (isNaN(userId)) return this.sendError(res, "Invalid User ID", 400);

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { settings: JSON.stringify(settings) }
            });

            this.sendSuccess(res, { settings: JSON.parse(updatedUser.settings) });
        });
    }
}

module.exports = new UserController();
