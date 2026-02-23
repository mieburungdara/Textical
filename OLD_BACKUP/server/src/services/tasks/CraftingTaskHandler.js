const TaskHandler = require('./TaskHandler');
const craftingService = require('../craftingService');

class CraftingTaskHandler extends TaskHandler {
    async complete(task) {
        return await craftingService.completeCrafting(task.userId, task.id);
    }

    async getDuration(task, user) {
        const recipe = await this.db.recipeTemplate.findFirst({ 
            where: { resultItemId: task.targetItemId } 
        });
        return recipe ? recipe.craftTimeSeconds : 5;
    }
}

module.exports = CraftingTaskHandler;
