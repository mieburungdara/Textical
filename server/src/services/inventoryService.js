const prisma = require('../db');
const manager = require('./inventory/InventoryManager');

/**
 * InventoryService
 * Centralizes slot-based capacity logic.
 * Refactored to support Multi-Stacking and Wagon Capacity.
 */
class InventoryService {
    /**
     * Checks if a user or a wagon has space for a quantity of items.
     */
    async hasSpace(userId, templateId, quantity = 1, wagonId = null) {
        if (wagonId) {
            return await this._hasWagonSpace(wagonId, templateId, quantity);
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return false;

        const currentSlotCount = await prisma.inventoryItem.count({ where: { userId } });
        const newSlotsRequired = await manager.predictRequiredNewSlots(prisma, userId, templateId, quantity);
        
        return (currentSlotCount + newSlotsRequired) <= user.maxInventorySlots;
    }

    async _hasWagonSpace(wagonId, templateId, quantity) {
        const wagon = await prisma.wagon.findUnique({ 
            where: { id: wagonId },
            include: { items: true }
        });
        if (!wagon) return false;

        // Note: Wagon capacity logic is simplified for now (non-stacking slots for items in wagon as per Albionesque specs)
        const currentSlots = wagon.items.length;
        return currentSlots < wagon.capacity;
    }

    /**
     * Unified method to add items to inventory.
     */
    async addItem(userId, templateId, quantity = 1, tx = null) {
        if (quantity <= 0) return;
        const client = tx || prisma;

        const hasSpace = await this.hasSpace(userId, templateId, quantity);
        if (!hasSpace) {
            throw new Error("Inventory full! No more slots available.");
        }

        const ops = await manager.resolveStackingOps(client, userId, templateId, quantity);
        return await Promise.all(ops);
    }

    /**
     * Gets current capacity status.
     */
    async getStatus(userId, wagonId = null) {
        if (wagonId) {
            const wagon = await prisma.wagon.findUnique({ where: { id: wagonId }, include: { items: true } });
            return {
                used: wagon.items.length,
                max: wagon.capacity,
                isFull: wagon.items.length >= wagon.capacity,
                type: "WAGON"
            };
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        const count = await prisma.inventoryItem.count({ where: { userId } });
        return {
            used: count,
            max: user.maxInventorySlots,
            isFull: count >= user.maxInventorySlots,
            type: "PERSONAL"
        };
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
}

module.exports = new InventoryService();
