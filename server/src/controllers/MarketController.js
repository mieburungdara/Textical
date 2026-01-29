const BaseController = require('./BaseController');
const marketService = require('../services/marketService');

class MarketController extends BaseController {
    async getListings(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.query.userId);
            const list = await marketService.getActiveListings(userId);
            this.sendSuccess(res, list);
        });
    }

    async listMarketItem(req, res) {
        await this.execute(res, async () => {
            const { userId, itemId, price } = req.body;
            await marketService.listItem(userId, itemId, price);
            this.sendSuccess(res, null, "Item listed");
        });
    }

    async buyMarketItem(req, res) {
        await this.execute(res, async () => {
            const { userId, listingId } = req.body;
            await marketService.purchaseItem(userId, listingId);
            this.sendSuccess(res, null, "Item purchased");
        });
    }

    async sellToNPC(req, res) {
        await this.execute(res, async () => {
            const { userId, itemId } = req.body;
            await marketService.npcSell(userId, itemId);
            this.sendSuccess(res, null, "Item sold to NPC");
        });
    }
}

module.exports = new MarketController();
