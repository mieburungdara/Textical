const BaseController = require('./BaseController');
const equipmentService = require('../services/equipmentService');

class EquipmentController extends BaseController {
    async equipItem(req, res) {
        await this.execute(res, async () => {
            const { userId, heroId, itemInstanceId, slotKey } = req.body;
            const result = await equipmentService.equipItem(parseInt(userId), parseInt(heroId), parseInt(itemInstanceId), slotKey);
            this.sendSuccess(res, result, "Item equipped");
        });
    }

    async unequipItem(req, res) {
        await this.execute(res, async () => {
            const { userId, heroId, slotKey } = req.body;
            await equipmentService.unequipItem(parseInt(userId), parseInt(heroId), slotKey);
            this.sendSuccess(res, null, "Item unequipped");
        });
    }
}

module.exports = new EquipmentController();
