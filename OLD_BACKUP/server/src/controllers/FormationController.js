const BaseController = require('./BaseController');
const prisma = require('../db');

class FormationController extends BaseController {
    async getFormation(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) return this.sendError(res, "Invalid User ID", 400);
            const presets = await prisma.formationPreset.findMany({
                where: { userId },
                include: { slots: { include: { hero: true } } }
            });
            this.sendSuccess(res, presets);
        });
    }
}

module.exports = new FormationController();
