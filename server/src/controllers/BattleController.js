const BaseController = require('./BaseController');
const battleService = require('../services/battleService');
const formationService = require('../services/formationService');

class BattleController extends BaseController {
    async startBattle(req, res) {
        await this.execute(res, async () => {
            const { userId, monsterId } = req.body;
            const result = await battleService.startBattle(userId, monsterId);
            this.sendSuccess(res, result);
        });
    }

    async updateFormation(req, res) {
        await this.execute(res, async () => {
            const { userId, presetId, slots } = req.body;
            const result = await formationService.updateFormation(userId, presetId, slots);
            this.sendSuccess(res, result, "Formation updated");
        });
    }

    async moveFormationUnit(req, res) {
        await this.execute(res, async () => {
            const { userId, presetId, heroId, gridX, gridY } = req.body;
            const result = await formationService.moveUnit(userId, presetId, heroId, gridX, gridY);
            this.sendSuccess(res, result, "Unit moved");
        });
    }

    async swapFormationUnits(req, res) {
        await this.execute(res, async () => {
            const { userId, presetId, heroA, heroB } = req.body;
            const result = await formationService.swapUnits(userId, presetId, heroA, heroB);
            this.sendSuccess(res, result, "Units swapped");
        });
    }
}

module.exports = new BattleController();
