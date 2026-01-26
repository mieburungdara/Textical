const prisma = require('../db');


/**
 * InventoryService
 * Centralizes slot-based capacity logic.
 * Ensures no service can bypass the User's inventory limit.
 */
class InventoryService {
    /**
     * Checks if a user has space for a specific number of NEW items.
     * Note: Stacking items (increasing quantity) does not take a new slot.
     */
    async hasSpace(userId, templateId, quantity = 1) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        const currentSlots = await prisma.inventoryItem.count({
            where: { userId }
        });

        // Check if item already exists (stackable)
        const existing = await prisma.inventoryItem.findFirst({
            where: { userId, templateId }
        });

        if (existing) return true; // Stacking doesn't cost a slot
        
        return currentSlots < user.maxInventorySlots;
    }

    /**
     * Unified method to add items to inventory with capacity enforcement.
     */
    async addItem(userId, templateId, quantity = 1) {
        const canAdd = await this.hasSpace(userId, templateId, quantity);
        if (!canAdd) {
            throw new Error("Inventory full! Return to town to sell or archive items.");
        }

        // Atomic Upsert
        return await prisma.inventoryItem.upsert({
            where: { 
                // We need a unique constraint on (userId, templateId) for upsert to work perfectly
                // For now, we'll use findFirst + update/create logic
                id: (await prisma.inventoryItem.findFirst({ where: { userId, templateId } }))?.id || -1
            },
            update: { quantity: { increment: quantity } },
            create: { userId, templateId, quantity }
        });
    }

    /**
     * Gets current capacity status.
     */
    async getStatus(userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const count = await prisma.inventoryItem.count({ where: { userId } });
        return {
            used: count,
            max: user.maxInventorySlots,
            isFull: count >= user.maxInventorySlots
        };
    }
}

module.exports = new InventoryService();
