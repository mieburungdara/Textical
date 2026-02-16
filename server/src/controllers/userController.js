const BaseController = require('./BaseController');
const energyService = require('../services/energyService');
const prisma = require('../db');
const logger = require('../utils/logger');

class UserController extends BaseController {
    /**
     * Get comprehensive user profile including inventory, tasks, and attributes.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     * @returns {Promise<void>}
     */
    async getUserProfile(req, res) {
        await this.execute(res, async () => {
            if (!req.params?.id) return this.sendError(res, "Missing User ID", 400);

            const userId = parseInt(req.params.id);
            if (isNaN(userId)) return this.sendError(res, "Invalid User ID", 400);
            
            // Sync energy first
            try {
                await energyService.syncUserEnergy(userId);
            } catch (e) {
                logger.error(`Failed to sync energy for user ${userId}:`, e);
            }

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
                    attributes: true 
                }
            });
            
            if (!user) return this.sendError(res, "User not found", 404);

            const activeTask = (Array.isArray(user.taskQueue) && user.taskQueue.length > 0) ? {
                ...user.taskQueue[0],
                targetRegionType: user.taskQueue[0].targetRegion ? user.taskQueue[0].targetRegion.type : "TOWN",
                targetRegionName: user.taskQueue[0].targetRegion ? user.taskQueue[0].targetRegion.name : "Destination"
            } : null;
            
            const regionMetadata = user.region ? { 
                type: user.region.visualType, 
                visualType: user.region.visualType,
                name: user.region.name 
            } : { type: "TOWN", visualType: "TOWN", name: "Unknown" };

            // Transform attributes to settings object
            const settingsObj = {};
            if (user.attributes && user.attributes.length > 0) {
                user.attributes.forEach(attr => {
                    if (!attr.key) return; // Fix #17: Skip null/undefined keys
                    if (attr.valBool !== null) settingsObj[attr.key] = attr.valBool;
                    else if (attr.valInt !== null) settingsObj[attr.key] = attr.valInt;
                    else if (attr.valFloat !== null) settingsObj[attr.key] = attr.valFloat;
                    else settingsObj[attr.key] = attr.valStr;
                });
            } else {
                // Fallback to legacy JSON if no attributes found
                try {
                    Object.assign(settingsObj, JSON.parse(user.settings || "{}"));
                } catch (e) {
                    logger.warn(`Failed to parse legacy settings for user ${userId}:`, e);
                }
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

    /**
     * Update user settings with validation and double-write protection.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     * @returns {Promise<void>}
     */
    async updateSettings(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) return this.sendError(res, "Invalid User ID", 400);

            if (!req.body || !req.body.settings || typeof req.body.settings !== 'object' || Array.isArray(req.body.settings)) {
                return this.sendError(res, "Invalid settings format", 400);
            }

            const { settings } = req.body;
            const updatedSettings = {};
            
            // Security limits
            const MAX_KEY_LENGTH = 255;
            const MAX_VALUE_LENGTH = 10000;
            const BLOCKED_KEYS = ['__proto__', 'constructor', 'prototype'];

            // Prepare upsert operations
            const operations = Object.entries(settings)
                .filter(([key, value]) => {
                    // Filter out blocked keys and excessive lengths
                    if (BLOCKED_KEYS.includes(key)) return false;
                    if (key.length > MAX_KEY_LENGTH) return false;
                    return true;
                })
                .map(([key, value]) => {
                    let valStr = null, valInt = null, valFloat = null, valBool = null;
                    
                    if (typeof value === 'boolean') {
                        valBool = value;
                    } else if (typeof value === 'number') {
                        // Fix #12: Guard against NaN and Infinity
                        if (!Number.isFinite(value)) {
                            valStr = String(value);
                        } else if (Number.isInteger(value)) {
                            valInt = value;
                        } else {
                            valFloat = value;
                        }
                    } else if (typeof value === 'object' && value !== null) {
                        // Fix #20: Handle objects/arrays with stringify
                        valStr = JSON.stringify(value).substring(0, MAX_VALUE_LENGTH);
                    } else {
                        valStr = String(value || "").substring(0, MAX_VALUE_LENGTH);
                    }

                    updatedSettings[key] = value;

                    return prisma.userAttribute.upsert({
                        where: { userId_key: { userId, key } },
                        update: { valStr, valInt, valFloat, valBool },
                        create: { userId, key, valStr, valInt, valFloat, valBool }
                    });
                });

            // Double write stringified JSON for legacy support
            let settingsJson = "{}";
            try {
                settingsJson = JSON.stringify(settings);
            } catch (e) {
                logger.error(`Failed to stringify settings for legacy double-write:`, e);
            }

            // Fix #3 & #9: Execute everything in a single transaction for atomicity and speed
            await prisma.$transaction([
                ...operations,
                prisma.user.update({
                    where: { id: userId },
                    data: { settings: settingsJson }
                })
            ]);

            this.sendSuccess(res, { settings: updatedSettings }, "Settings updated successfully");
        });
    }
}

module.exports = new UserController();
