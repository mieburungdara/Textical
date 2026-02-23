const BaseController = require('./BaseController');
const tavernService = require('../services/tavernService');
const energyService = require('../services/energyService');

class TavernController extends BaseController {
    async enterTavern(req, res) {
        await this.execute(res, async () => {
            const { userId } = req.body;
            const user = await energyService.enterTavern(parseInt(userId));
            this.sendSuccess(res, user, "Entered Tavern");
        });
    }

    async exitTavern(req, res) {
        await this.execute(res, async () => {
            const { userId } = req.body;
            const user = await energyService.exitTavern(parseInt(userId));
            this.sendSuccess(res, user, "Exited Tavern");
        });
    }

    async getMercenaries(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.query.userId);
            const list = await tavernService.getAvailableMercenaries(userId);
            this.sendSuccess(res, list);
        });
    }

    async recruit(req, res) {
        await this.execute(res, async () => {
            const { userId, mercenaryId } = req.body;
            await tavernService.recruitMercenary(parseInt(userId), parseInt(mercenaryId));
            this.sendSuccess(res, null, "Mercenary recruited");
        });
    }
}

module.exports = new TavernController();
