const inventoryRepository = require('../repositories/inventoryRepository');
const userRepository = require('../repositories/userRepository');
const math = require('mathjs');

class CraftingService {
    async craft(user, recipe, quantity = 1) {
        // 1. Check Gold
        const totalGoldCost = math.multiply(recipe.goldCost, quantity);
        if (user.gold < totalGoldCost) throw new Error("Insufficient Gold.");

        // 2. Check Ingredients (Parsing JSON string from DB)
        const ingredients = JSON.parse(recipe.ingredients);
        for (let ing of ingredients) {
            const userItem = user.inventory.find(i => i.templateId === ing.itemId);
            if (!userItem || userItem.quantity < (ing.qty * quantity)) {
                throw new Error(`Insufficient ingredient: ${ing.itemId}`);
            }
        }

        // 3. Deduct Gold & Materials
        await userRepository.updateGold(user.id, math.subtract(user.gold, totalGoldCost));
        for (let ing of ingredients) {
            const userItem = user.inventory.find(i => i.templateId === ing.itemId);
            await inventoryRepository.updateQuantity(userItem.id, userItem.quantity - (ing.qty * quantity));
        }

        // 4. Create Result Item
        // Note: Success rate check can be added here
        const result = await inventoryRepository.addItem(user.id, recipe.resultItemId, recipe.resultQuantity * quantity);

        console.log(`[CRAFTING] ${user.username} crafted ${quantity}x ${recipe.resultItemId}`);
        return result;
    }
}

module.exports = new CraftingService();
