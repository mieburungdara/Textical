const BaseController = require('./BaseController');
const inventoryService = require('../services/inventoryService');
const prisma = require('../db');

class InventoryController extends BaseController {
    async getInventory(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) return this.sendError(res, "Invalid User ID", 400);
            const items = await prisma.inventoryItem.findMany({
                where: { userId },
                include: { template: true }
            });
            const status = await inventoryService.getStatus(userId);
            this.sendSuccess(res, { status, items });
        });
    }
}

module.exports = new InventoryController();
