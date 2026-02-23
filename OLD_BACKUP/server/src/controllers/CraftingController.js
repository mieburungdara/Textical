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
    
    /**
     * Get crafting success rate preview for a recipe
     */
    async getSuccessRate(req, res) {
        await this.execute(res, async () => {
            const { userId, recipeId } = req.query;
            const result = await craftingService.getCraftingSuccessRate(
                parseInt(userId), 
                parseInt(recipeId)
            );
            this.sendSuccess(res, result);
        });
    }
    
    /**
     * Get all crafting skills for a user
     */
    async getSkills(req, res) {
        await this.execute(res, async () => {
            const { userId } = req.query;
            const skills = await craftingService.getAllCraftingSkills(parseInt(userId));
            this.sendSuccess(res, skills);
        });
    }
    
    /**
     * Get crafting skill for a specific profession
     */
    async getSkill(req, res) {
        await this.execute(res, async () => {
            const { userId, profession } = req.query;
            const skill = await craftingService.getCraftingSkill(
                parseInt(userId), 
                profession
            );
            this.sendSuccess(res, skill);
        });
    }
}

module.exports = new CraftingController();
