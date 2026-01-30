/**
 * AAA CraftingValidator
 */
class CraftingValidator {
    validateAvailability(user) {
        if (user.taskQueue.length > 0) throw new Error("Hero is busy.");
    }

    validateLocation(region) {
        if (!region || region.visualType !== "TOWN") {
            throw new Error("Complex crafting requires a Town Forge or Lab.");
        }
    }

    async checkMaterials(prisma, userId, ingredients) {
        for (const ing of ingredients) {
            const inv = await prisma.inventoryItem.findFirst({
                where: { 
                    userId, 
                    templateId: ing.itemId,
                    marketListing: null,
                    equippedIn: null 
                }
            });
            if (!inv || inv.quantity < ing.quantity) {
                throw new Error(`Missing: ${ing.item.name} (${inv ? inv.quantity : 0}/${ing.quantity})`);
            }
        }
    }
}

module.exports = new CraftingValidator();
