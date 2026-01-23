const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class InventoryRepository {
    async addItem(userId, templateId, quantity = 1, uniqueData = {}) {
        const isStackable = Object.keys(uniqueData).length === 0;
        if (isStackable) {
            const existing = await prisma.inventoryItem.findFirst({ where: { userId, templateId, isEquipped: false } });
            if (existing) return await prisma.inventoryItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + quantity } });
        }
        return await prisma.inventoryItem.create({ data: { userId, templateId, quantity, uniqueData: JSON.stringify(uniqueData) } });
    }

    async updateEquipStatus(itemId, isEquipped) {
        return await prisma.inventoryItem.update({ where: { id: itemId }, data: { isEquipped } });
    }

    async findItemById(itemId, userId) {
        return await prisma.inventoryItem.findFirst({ where: { id: itemId, userId } });
    }
}

module.exports = new InventoryRepository();
