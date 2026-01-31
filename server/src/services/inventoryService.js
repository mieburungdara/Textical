const prisma = require('../db');
const manager = require('./inventory/InventoryManager');

/**
 * InventoryService
 * Centralizes slot-based capacity logic.
 * Refactored to support Multi-Stacking and MaxStack limits.
 */
class InventoryService {
    /**
     * Checks if a user has space for a quantity of items, respecting stack limits.
     */
    async hasSpace(userId, templateId, quantity = 1) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return false;

        const currentSlotCount = await prisma.inventoryItem.count({ where: { userId } });
        
        // Predict required new slots via InventoryManager
        const newSlotsRequired = await manager.predictRequiredNewSlots(prisma, userId, templateId, quantity);
        
        return (currentSlotCount + newSlotsRequired) <= user.maxInventorySlots;
    }

    /**
     * Unified method to add items to inventory with stacking enforcement.
     */
    async addItem(userId, templateId, quantity = 1) {
        if (quantity <= 0) return;

        const hasSpace = await this.hasSpace(userId, templateId, quantity);
        if (!hasSpace) {
            throw new Error("Inventory full! No more slots available for this item stack.");
        }

        // Execute stacking operations in a single transaction
        return await prisma.$transaction(async (tx) => {
            const ops = await manager.resolveStackingOps(tx, userId, templateId, quantity);
            // We cannot just return 'ops' because they are Promises/Prisma objects. 
            // We must await the results of the transaction.
            return await Promise.all(ops);
        });
    }

    async removeItem(userId, itemInstanceId, quantity = 1) {
        const item = await prisma.inventoryItem.findUnique({ where: { id: itemInstanceId } });
        if (!item || item.userId !== userId) throw new Error("Item not found.");

        if (item.quantity <= quantity) {
            return await prisma.inventoryItem.delete({ where: { id: itemInstanceId } });
        } else {
            return await prisma.inventoryItem.update({
                where: { id: itemInstanceId },
                data: { quantity: { decrement: quantity } }
            });
        }
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