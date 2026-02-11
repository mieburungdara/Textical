const prisma = require('../db');

class InventoryRepository {
    async addItem(userId, templateId, quantity = 1, uniqueData = {}) {
        const isStackable = Object.keys(uniqueData).length === 0;
        if (isStackable) {
            const existing = await prisma.inventoryItem.findFirst({ where: { userId, templateId, isEquipped: false } });
            if (existing) return await prisma.inventoryItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + quantity } });
        }
        return await prisma.inventoryItem.create({ data: { userId, templateId, quantity, uniqueData: JSON.stringify(uniqueData) } });
    }

    async updateEquipStatus(id, isEquipped) {
        const itemId = parseInt(id);
        return await prisma.inventoryItem.update({ where: { id: itemId }, data: { isEquipped } });
    }

    async findItemById(id, uId) {
        const itemId = parseInt(id);
        const userId = parseInt(uId);
        return await prisma.inventoryItem.findFirst({
            where: { id: itemId, userId },
            include: { template: true }
        });
    }

    async updateOwner(id, newUserId) {
        const itemId = parseInt(id);
        const uId = parseInt(newUserId);
        return await prisma.inventoryItem.update({
            where: { id: itemId },
            data: { userId: uId, isEquipped: false, ownerHeroId: null }
        });
    }

    async updateQuantity(id, quantity) {
        const itemId = parseInt(id);
        if (quantity <= 0) return await prisma.inventoryItem.delete({ where: { id: itemId } });
        return await prisma.inventoryItem.update({ where: { id: itemId }, data: { quantity } });
    }

    async updateDurability(id, durability) {
        const itemId = parseInt(id);
        return await prisma.inventoryItem.update({ where: { id: itemId }, data: { currentDurability: durability } });
    }
}

module.exports = new InventoryRepository();
