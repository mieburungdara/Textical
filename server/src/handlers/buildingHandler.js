const userRepository = require('../repositories/userRepository');
const craftingService = require('../services/craftingService');
const prisma = new (require('@prisma/client').PrismaClient)();

class BuildingHandler {
    /**
     * Handles item crafting via town facilities.
     */
    async handleCraft(ws, request) {
        try {
            const user = await userRepository.findByUsername(request.account);
            
            // 1. Get Recipe Template
            const recipe = await prisma.recipeTemplate.findUnique({
                where: { id: request.recipeId }
            });
            if (!recipe) throw new Error("Recipe not found.");

            // 2. AAA Validation: Is the required building present in the current region?
            if (recipe.requiredBuildingId) {
                const building = await prisma.buildingInstance.findFirst({
                    where: { 
                        regionId: user.currentRegion,
                        templateId: recipe.requiredBuildingId 
                    }
                });
                if (!building) throw new Error(`This region lacks the required facility: ${recipe.requiredBuildingId}`);
            }

            // 3. Process Crafting via Service
            await craftingService.craft(user, recipe, request.quantity || 1);

            // 4. Sync Updated State
            const updatedUser = await userRepository.findByUsername(request.account);
            ws.send(JSON.stringify({ 
                type: "login_success", 
                user: updatedUser,
                message: `Successfully crafted ${recipe.name}!`
            }));

        } catch (e) {
            ws.send(JSON.stringify({ type: "error", message: e.message }));
        }
    }

    /**
     * Retrieves available recipes for the current town.
     */
    async handleFetchRecipes(ws, request) {
        const user = await userRepository.findByUsername(request.account);
        const buildings = await prisma.buildingInstance.findMany({
            where: { regionId: user.currentRegion }
        });
        
        const buildingIds = buildings.map(b => b.templateId);
        const availableRecipes = await prisma.recipeTemplate.findMany({
            where: {
                requiredBuildingId: { in: buildingIds }
            }
        });

        ws.send(JSON.stringify({ type: "recipe_list", recipes: availableRecipes }));
    }
}

module.exports = new BuildingHandler();