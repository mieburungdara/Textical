const BaseController = require('./BaseController');
const craftingService = require('../services/craftingService');

class CraftingController extends BaseController {
    async craft(req, res) {
        await this.execute(res, async () => {
            const { userId, recipeId } = req.body;
            const task = await craftingService.startCrafting(parseInt(userId), parseInt(recipeId));
            this.sendSuccess(res, task);
        });
    }
}

module.exports = new CraftingController();
