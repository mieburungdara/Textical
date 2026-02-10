const BaseController = require('./BaseController');
const inventoryService = require('../services/inventoryService');
const consumableService = require('../services/consumableService');

class InventoryController extends BaseController {
    async discardItem(req, res) {
        await this.execute(res, async () => {
            const { userId, itemInstanceId, quantity } = req.body;
            
            if (!userId || !itemInstanceId) {
                return this.sendError(res, "Missing required parameters.", 400);
            }

            const qty = parseInt(quantity) || 1;
            const result = await inventoryService.removeItem(parseInt(userId), parseInt(itemInstanceId), qty);
            
            this.sendSuccess(res, result, "Item discarded successfully.");
        });
    }

    async useItem(req, res) {
        await this.execute(res, async () => {
            const { userId, heroId, itemInstanceId } = req.body;
            
            if (!userId || !itemInstanceId) {
                return this.sendError(res, "Missing required parameters.", 400);
            }

            // ConsumableService currently needs templateId, we need to get it from instanceId
            const result = await consumableService.useItemInstance(parseInt(userId), parseInt(heroId || 0), parseInt(itemInstanceId));
            
            this.sendSuccess(res, result, "Item used successfully.");
        });
    }
}

module.exports = new InventoryController();
