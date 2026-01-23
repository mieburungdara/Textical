const userRepository = require('../repositories/userRepository');
const craftingService = require('../services/craftingService');
const prisma = new (require('@prisma/client').PrismaClient)();

class BuildingHandler {
    /**
     * Handles crafting requests at a specific building.
     */
    async handleCraft(ws, request) {
        try {
            const user = await userRepository.findByUsername(request.account);
            if (!user) throw new Error("User not found");

            // 1. Get Recipe
            const recipe = await prisma.recipeTemplate.findUnique({
                where: { id: request.recipeId }
            });
            if (!recipe) throw new Error("Recipe not found");

            // 2. Validate Building Requirement
            if (recipe.requiredBuildingId) {
                // Check if user's current region has this building
                const instance = await prisma.buildingInstance.findFirst({
                    where: { 
                        regionId: user.currentRegion,
                        templateId: recipe.requiredBuildingId
                    }
                });
                if (!instance) throw new Error(`This region does not have the required facility: ${recipe.requiredBuildingId}`);
            }

            // 3. Execute Crafting
            const result = await craftingService.craft(user, recipe, request.quantity || 1);

            // 4. Sync User Data
            const updatedUser = await userRepository.findByUsername(request.account);
            ws.send(JSON.stringify({ 
                type: "login_success", 
                user: updatedUser,
                message: `Successfully crafted: ${recipe.resultItemId}`
            }));

        } catch (e) {
            ws.send(JSON.stringify({ type: "error", message: e.message }));
        }
    }

    /**
     * Fetches available recipes for a building in the current region.
     */
    async handleGetRecipes(ws, request) {
        try {
            const user = await userRepository.findByUsername(request.account);
            const recipes = await prisma.recipeTemplate.findMany({
                where: { requiredBuildingId: request.buildingId }
            });
            ws.send(JSON.stringify({ type: "recipe_list", recipes }));
        } catch (e) {
            ws.send(JSON.stringify({ type: "error", message: e.message }));
        }
    }
}

module.exports = new BuildingHandler();
