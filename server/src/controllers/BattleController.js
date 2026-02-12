const BaseController = require('./BaseController');
const battleService = require('../services/battleService');
const formationService = require('../services/formationService');
const replayService = require('../services/battle/ReplayService');

class BattleController extends BaseController {
    async getReplay(req, res) {
        await this.execute(res, async () => {
            const { battleId } = req.params;
            const replay = await replayService.getReplay(battleId);
            if (!replay) throw new Error("Replay not found");
            this.sendSuccess(res, replay);
        });
    }

    async startBattle(req, res) {
        await this.execute(res, async () => {
            const { userId, monsterId } = req.body;
            const result = await battleService.startAsyncBattle(parseInt(userId), parseInt(monsterId));
            this.sendSuccess(res, result);
        });
    }

    /**
     * Get current battle status (optional - for debugging/monitoring)
     */
    async getBattleStatus(req, res) {
        await this.execute(res, async () => {
            const { battleId } = req.params;
            const status = battleService.getBattleStatus(battleId);
            this.sendSuccess(res, status, "Battle status retrieved");
        });
    }

    async updateFormation(req, res) {
        await this.execute(res, async () => {
            const { userId, presetId, slots } = req.body;
            const result = await formationService.updateFormation(parseInt(userId), parseInt(presetId), slots);
            this.sendSuccess(res, result, "Formation updated");
        });
    }

    async moveFormationUnit(req, res) {
        await this.execute(res, async () => {
            const { userId, presetId, heroId, gridX, gridY } = req.body;
            const result = await formationService.moveUnit(parseInt(userId), parseInt(presetId), parseInt(heroId), parseInt(gridX), parseInt(gridY));
            this.sendSuccess(res, result, "Unit moved");
        });
    }

    async swapFormationUnits(req, res) {
        await this.execute(res, async () => {
            const { userId, presetId, heroA, heroB } = req.body;
            const result = await formationService.swapUnits(parseInt(userId), parseInt(presetId), parseInt(heroA), parseInt(heroB));
            this.sendSuccess(res, result, "Units swapped");
        });
    }
}

module.exports = new BattleController();
