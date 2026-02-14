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
                    region: true,
                    attributes: true // Fetch relational settings
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

            // Transform attributes to settings object
            const settingsObj = {};
            if (user.attributes) {
                user.attributes.forEach(attr => {
                    if (attr.valBool !== null) settingsObj[attr.key] = attr.valBool;
                    else if (attr.valInt !== null) settingsObj[attr.key] = attr.valInt;
                    else if (attr.valFloat !== null) settingsObj[attr.key] = attr.valFloat;
                    else settingsObj[attr.key] = attr.valStr;
                });
            } else {
                // Fallback to legacy JSON if no attributes found (or during transition)
                try {
                    Object.assign(settingsObj, JSON.parse(user.settings || "{}"));
                } catch (e) {}
            }

            // Mask the internal attributes array and legacy settings string
            const { attributes, settings, ...userRest } = user;

            this.sendSuccess(res, { 
                ...userRest, 
                settings: settingsObj,
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

            // Process settings one by one
            const updatedSettings = {};
            for (const [key, value] of Object.entries(settings)) {
                let valStr = null, valInt = null, valFloat = null, valBool = null;
                if (typeof value === 'boolean') valBool = value;
                else if (typeof value === 'number') {
                    if (Number.isInteger(value)) valInt = value;
                    else valFloat = value;
                } else {
                    valStr = String(value);
                }

                await prisma.userAttribute.upsert({
                    where: { userId_key: { userId, key } },
                    update: { valStr, valInt, valFloat, valBool },
                    create: { userId, key, valStr, valInt, valFloat, valBool }
                });
                updatedSettings[key] = value;
            }

            // Fallback for legacy clients: also update the JSON field for now (Double Write)
            // until we fully remove it in Phase 2
            await prisma.user.update({
                where: { id: userId },
                data: { settings: JSON.stringify(settings) }
            });

            this.sendSuccess(res, { settings: updatedSettings });
        });
    }
}

module.exports = new UserController();
