const BaseController = require('./BaseController');
const energyService = require('../services/energyService');
const prisma = require('../db');
const logger = require('../utils/logger');

// ============================================================================
// CONSTANTS - Security limits for settings
// ============================================================================
const SETTINGS_CONSTANTS = {
    MAX_KEY_LENGTH: 255,
    MAX_VALUE_LENGTH: 10000,
    BLOCKED_KEYS: Object.freeze(['__proto__', 'constructor', 'prototype'])
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Transforms user attributes array to a settings object.
 * @param {Array} attributes - User attributes from database
 * @param {string} legacySettings - Legacy JSON string settings
 * @returns {object} Transformed settings object
 */
function transformAttributesToSettings(attributes, settingsArray) {
    const settingsObj = {};

    if (attributes && attributes.length > 0) {
        attributes.forEach(attr => {
            if (!attr.key) return; // Skip null/undefined keys
            if (attr.valBool !== null) settingsObj[attr.key] = attr.valBool;
            else if (attr.valInt !== null) settingsObj[attr.key] = attr.valInt;
            else if (attr.valFloat !== null) settingsObj[attr.key] = attr.valFloat;
            else settingsObj[attr.key] = attr.valStr;
        });
    } else if (Array.isArray(settingsArray)) {
        // Fallback to relational UserSetting if no attributes found
        settingsArray.forEach(setting => {
            if (!setting.key) return;
            try {
                settingsObj[setting.key] = JSON.parse(setting.value);
            } catch {
                settingsObj[setting.key] = setting.value;
            }
        });
    }

    return settingsObj;
}

/**
 * Transforms active task from database to API response format.
 * @param {Array} taskQueue - User's task queue
 * @returns {object|null} Transformed active task or null
 */
function transformActiveTask(taskQueue) {
    if (!Array.isArray(taskQueue) || taskQueue.length === 0) {
        return null;
    }

    const task = taskQueue[0];
    const targetRegion = task.targetRegion;

    return {
        ...task,
        targetRegionType: targetRegion ? targetRegion.type : "TOWN",
        targetRegionName: targetRegion ? targetRegion.name : "Destination"
    };
}

/**
 * Transforms region data to metadata format.
 * @param {object} region - User's region from database
 * @returns {object} Region metadata
 */
function transformRegionMetadata(region) {
    if (!region) {
        return { type: "TOWN", visualType: "TOWN", name: "Unknown" };
    }

    return {
        type: region.visualType,
        visualType: region.visualType,
        name: region.name
    };
}

/**
 * Validates and transforms a single settings value.
 * @param {any} value - The value to validate and transform
 * @param {number} maxLength - Maximum string length
 * @returns {object} Object with appropriate valStr, valInt, valFloat, or valBool
 */
function validateAndTransformSettingsValue(value, maxLength = SETTINGS_CONSTANTS.MAX_VALUE_LENGTH) {
    let valStr = null, valInt = null, valFloat = null, valBool = null;

    if (typeof value === 'boolean') {
        valBool = value;
    } else if (typeof value === 'number') {
        // Guard against NaN and Infinity
        if (!Number.isFinite(value)) {
            valStr = String(value);
        } else if (Number.isInteger(value)) {
            valInt = value;
        } else {
            valFloat = value;
        }
    } else if (typeof value === 'object' && value !== null) {
        // Handle objects/arrays with stringify
        valStr = JSON.stringify(value).substring(0, maxLength);
    } else {
        valStr = String(value || "").substring(0, maxLength);
    }

    return { valStr, valInt, valFloat, valBool };
}

/**
 * Filters and prepares settings entries for upsert.
 * @param {object} settings - Raw settings object from request
 * @returns {Array} Array of { key, value, transformed } objects
 */
function filterAndPrepareSettings(settings) {
    const { MAX_KEY_LENGTH, BLOCKED_KEYS } = SETTINGS_CONSTANTS;
    const preparedEntries = [];

    Object.entries(settings)
        .filter(([key]) => {
            // Filter out blocked keys and excessive lengths
            if (BLOCKED_KEYS.includes(key)) return false;
            if (key.length > MAX_KEY_LENGTH) return false;
            return true;
        })
        .forEach(([key, value]) => {
            const transformed = validateAndTransformSettingsValue(value);
            preparedEntries.push({ key, value, transformed });
        });

    return preparedEntries;
}

// ============================================================================
// CONTROLLER CLASS
// ============================================================================

class UserController extends BaseController {
    /**
     * Get comprehensive user profile including inventory, tasks, and attributes.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     * @returns {Promise<void>}
     */
    async getUserProfile(req, res) {
        logger.debug('[UserController.getUserProfile] Entry', { params: req.params });

        await this.execute(res, async () => {
            // Validate user ID
            if (!req.params?.id) {
                logger.warn('[UserController.getUserProfile] Missing User ID');
                return this.sendError(res, "Missing User ID", 400);
            }

            const userId = parseInt(req.params.id);
            if (isNaN(userId)) {
                logger.warn('[UserController.getUserProfile] Invalid User ID', { id: req.params.id });
                return this.sendError(res, "Invalid User ID", 400);
            }

            logger.debug('[UserController.getUserProfile] Fetching user profile', { userId });

            // Sync energy first
            try {
                await energyService.syncUserEnergy(userId);
                logger.debug('[UserController.getUserProfile] Energy synced', { userId });
            } catch (e) {
                logger.error(`[UserController.getUserProfile] Failed to sync energy for user ${userId}:`, e);
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
                    attributes: true,
                    settings: true
                }
            });

            if (!user) {
                logger.warn('[UserController.getUserProfile] User not found', { userId });
                return this.sendError(res, "User not found", 404);
            }

            // Transform data using helper functions
            const activeTask = transformActiveTask(user.taskQueue);
            const regionMetadata = transformRegionMetadata(user.region);
            const settingsObj = transformAttributesToSettings(user.attributes, user.settings);

            // Mask the internal attributes array and legacy settings string
            const { attributes, settings, ...userRest } = user;

            logger.info('[UserController.getUserProfile] User profile retrieved', { userId });

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
        logger.debug('[UserController.updateSettings] Entry', { params: req.params });

        await this.execute(res, async () => {
            // Validate user ID
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) {
                logger.warn('[UserController.updateSettings] Invalid User ID', { id: req.params.id });
                return this.sendError(res, "Invalid User ID", 400);
            }

            // Validate settings format
            if (!req.body || !req.body.settings || typeof req.body.settings !== 'object' || Array.isArray(req.body.settings)) {
                logger.warn('[UserController.updateSettings] Invalid settings format', { body: req.body });
                return this.sendError(res, "Invalid settings format", 400);
            }

            const { settings } = req.body;
            logger.debug('[UserController.updateSettings] Processing settings update', { userId, keyCount: Object.keys(settings).length });

            // Filter and prepare settings entries
            const preparedEntries = filterAndPrepareSettings(settings);
            const updatedSettings = {};

            // Build upsert operations
            const operations = preparedEntries.map(({ key, value, transformed }) => {
                updatedSettings[key] = value;

                return prisma.userAttribute.upsert({
                    where: { userId_key: { userId, key } },
                    update: transformed,
                    create: { userId, key, ...transformed }
                });
            });

            // Write to new UserSetting relation for fallback support
            const settingOps = Object.entries(updatedSettings).map(([key, value]) => {
                let valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
                return prisma.userSetting.upsert({
                    where: { userId_key: { userId, key } },
                    update: { value: valueStr },
                    create: { userId, key, value: valueStr }
                });
            });

            // Execute everything in a single transaction for atomicity and speed
            await prisma.$transaction([
                ...operations,
                ...settingOps
            ]);

            logger.info('[UserController.updateSettings] Settings updated successfully', { userId, keyCount: preparedEntries.length });

            this.sendSuccess(res, { settings: updatedSettings }, "Settings updated successfully");
        });
    }

    // ============================================================================
    // ADDITIONAL METHODS CAN BE ADDED HERE
    // ============================================================================

    /**
     * Get user by ID (simple endpoint).
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     * @returns {Promise<void>}
     */
    async getUserById(req, res) {
        logger.debug('[UserController.getUserById] Entry', { params: req.params });

        await this.execute(res, async () => {
            if (!req.params?.id) {
                return this.sendError(res, "Missing User ID", 400);
            }

            const userId = parseInt(req.params.id);
            if (isNaN(userId)) {
                return this.sendError(res, "Invalid User ID", 400);
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    currentRegionId: true,
                    currentRegion: true,
                    premiumTier: true,
                    createdAt: true
                }
            });

            if (!user) {
                return this.sendError(res, "User not found", 404);
            }

            logger.debug('[UserController.getUserById] User found', { userId });
            this.sendSuccess(res, user);
        });
    }
}

module.exports = new UserController();
