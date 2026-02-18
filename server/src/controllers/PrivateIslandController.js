const BaseController = require('./BaseController');
const privateIslandService = require('../services/privateIslandService');

class PrivateIslandController extends BaseController {
    /**
     * Get user's private island data
     */
    async getIsland(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.params.userId);
            if (isNaN(userId)) {
                return this.sendError(res, "Invalid User ID", 400);
            }
            
            const island = await privateIslandService.getIslandWithStatus(userId);
            this.sendSuccess(res, island);
        });
    }

    /**
     * Unlock private island (cost: 1 Gold)
     */
    async unlockIsland(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.body.userId);
            if (isNaN(userId)) {
                return this.sendError(res, "Invalid User ID", 400);
            }
            
            const result = await privateIslandService.unlockIsland(userId);
            this.sendSuccess(res, result);
        });
    }

    /**
     * Plant seed in a plot
     */
    async plant(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.body.userId);
            const plotIndex = parseInt(req.body.plotIndex);
            const seedItemId = parseInt(req.body.seedItemId);
            
            if (isNaN(userId) || isNaN(plotIndex) || isNaN(seedItemId)) {
                return this.sendError(res, "Invalid parameters", 400);
            }
            
            const result = await privateIslandService.plant(userId, plotIndex, seedItemId);
            this.sendSuccess(res, result);
        });
    }

    /**
     * Harvest ready crops
     */
    async harvest(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.body.userId);
            const plotIndex = parseInt(req.body.plotIndex);
            
            if (isNaN(userId) || isNaN(plotIndex)) {
                return this.sendError(res, "Invalid parameters", 400);
            }
            
            const result = await privateIslandService.harvest(userId, plotIndex);
            this.sendSuccess(res, result);
        });
    }

    /**
     * Get island with updated crop statuses
     */
    async getIslandStatus(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.params.userId);
            if (isNaN(userId)) {
                return this.sendError(res, "Invalid User ID", 400);
            }
            
            const island = await privateIslandService.getIslandWithStatus(userId);
            this.sendSuccess(res, island);
        });
    }

    /**
     * Add item to island storage
     */
    async addToStorage(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.body.userId);
            const itemTemplateId = parseInt(req.body.itemTemplateId);
            const quantity = parseInt(req.body.quantity);
            
            if (isNaN(userId) || isNaN(itemTemplateId) || isNaN(quantity)) {
                return this.sendError(res, "Invalid parameters", 400);
            }
            
            const result = await privateIslandService.addToStorage(userId, itemTemplateId, quantity);
            this.sendSuccess(res, result);
        });
    }

    /**
     * Remove item from island storage
     */
    async removeFromStorage(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.body.userId);
            const storageItemId = parseInt(req.body.storageItemId);
            const quantity = parseInt(req.body.quantity);
            
            if (isNaN(userId) || isNaN(storageItemId) || isNaN(quantity)) {
                return this.sendError(res, "Invalid parameters", 400);
            }
            
            const result = await privateIslandService.removeFromStorage(userId, storageItemId, quantity);
            this.sendSuccess(res, result);
        });
    }

    /**
     * Upgrade plot count
     */
    async upgradePlots(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.body.userId);
            if (isNaN(userId)) {
                return this.sendError(res, "Invalid User ID", 400);
            }
            
            const result = await privateIslandService.upgradePlots(userId);
            this.sendSuccess(res, result);
        });
    }

    /**
     * Upgrade storage slots
     */
    async upgradeStorage(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.body.userId);
            if (isNaN(userId)) {
                return this.sendError(res, "Invalid User ID", 400);
            }
            
            const result = await privateIslandService.upgradeStorage(userId);
            this.sendSuccess(res, result);
        });
    }

    /**
     * Get all available crop templates
     */
    async getCropTemplates(req, res) {
        await this.execute(res, async () => {
            const templates = await privateIslandService.getCropTemplates();
            this.sendSuccess(res, templates);
        });
    }
}

module.exports = new PrivateIslandController();
