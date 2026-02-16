const prisma = require('../db');
const AppError = require('../utils/AppError');
const ErrorCodes = require('../constants/ErrorCodes');

/**
 * EquipmentService
 * Manages the relational equipping/unequipping of items.
 * Enforces slot rules and item locking.
 */
class EquipmentService {
    async equipItem(userId, heroId, itemInstanceId, slotKey) {
        // 1. Validation
        const item = await prisma.inventoryItem.findUnique({
            where: { id: itemInstanceId },
            include: { 
                template: { include: { equipSlots: true } },
                marketOrders: { where: { status: "OPEN" } }
            }
        });

        if (!item || item.userId !== userId) {
            throw new AppError(ErrorCodes.INVENTORY_ITEM_NOT_FOUND, 'Item not found in inventory.');
        }
        if (item.marketOrders.length > 0) {
            throw new AppError(ErrorCodes.EQUIP_ITEM_LISTED, 'Cannot equip an item that is listed on the market.');
        }

        const hero = await prisma.hero.findUnique({
            where: { id: heroId }
        });
        if (!hero || hero.userId !== userId) {
            throw new AppError(ErrorCodes.HERO_NOT_FOUND, 'Hero not found.');
        }

        // 2. Slot Validation
        const validSlots = item.template.equipSlots.map(s => s.slotKey);
        if (!validSlots.includes(slotKey)) {
            throw new AppError(ErrorCodes.EQUIP_WRONG_SLOT, `Item cannot be equipped in slot: ${slotKey}. Valid slots: ${validSlots.join(", ")}`);
        }

        // 3. Atomic Transaction: Unequip old -> Equip new
        return await prisma.$transaction(async (tx) => {
            // Unequip current item in that slot if exists
            const existing = await tx.heroEquipment.findUnique({
                where: { heroId_slotKey: { heroId, slotKey } }
            });

            if (existing) {
                await tx.heroEquipment.delete({ where: { id: existing.id } });
            }

            // Also ensure this specific instance isn't equipped elsewhere (prevent duplicates)
            await tx.heroEquipment.deleteMany({
                where: { itemInstanceId: itemInstanceId }
            });

            // Create new equipment record
            return await tx.heroEquipment.create({
                data: {
                    heroId,
                    slotKey,
                    itemInstanceId
                }
            });
        });
    }

    async unequipItem(userId, heroId, slotKey) {
        const hero = await prisma.hero.findUnique({ where: { id: heroId } });
        if (!hero || hero.userId !== userId) {
            throw new AppError(ErrorCodes.HERO_NOT_FOUND, 'Hero not found.');
        }

        const existing = await prisma.heroEquipment.findUnique({
            where: { heroId_slotKey: { heroId, slotKey } }
        });

        if (!existing) {
            throw new AppError(ErrorCodes.EQUIP_SLOT_EMPTY, 'No item equipped in that slot.');
        }

        return await prisma.heroEquipment.delete({
            where: { id: existing.id }
        });
    }
}

module.exports = new EquipmentService();
