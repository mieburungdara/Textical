const BaseController = require('./BaseController');
const tavernService = require('../services/tavernService');
const vitalityService = require('../services/vitalityService');

class TavernController extends BaseController {
    async enterTavern(req, res) {
        await this.execute(res, async () => {
            const { userId } = req.body;
            const user = await vitalityService.enterTavern(userId);
            this.sendSuccess(res, user, "Entered Tavern");
        });
    }

    async exitTavern(req, res) {
        await this.execute(res, async () => {
            const { userId } = req.body;
            const user = await vitalityService.exitTavern(userId);
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
            await tavernService.recruitMercenary(userId, mercenaryId);
            this.sendSuccess(res, null, "Mercenary recruited");
        });
    }
}

module.exports = new TavernController();
