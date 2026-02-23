const BaseController = require('./BaseController');
const prisma = require('../db');

class RecipeController extends BaseController {
    async getRecipes(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) return this.sendError(res, "Invalid User ID", 400);
            const recipes = await prisma.userRecipe.findMany({
                where: { userId },
                include: { recipe: { include: { resultItem: true } } }
            });
            this.sendSuccess(res, recipes.map(r => r.recipe));
        });
    }
}

module.exports = new RecipeController();
