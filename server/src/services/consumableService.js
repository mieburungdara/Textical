const prisma = require('../db');

class ConsumableService {
    async consumeItem(userId, heroId, templateId) {
        const item = await prisma.itemTemplate.findUnique({ where: { id: templateId } });
        if (!item || item.category !== "CONSUMABLE") throw new Error("Item is not consumable.");

        // 1. Check inventory
        const inv = await prisma.inventoryItem.findUnique({
            where: { userId_templateId: { userId, templateId } }
        });
        if (!inv || inv.quantity < 1) throw new Error("Insufficient quantity.");

        // 2. Define Buff Logic (Simplified for 25 dishes)
        const buffData = this._getBuffData(templateId);
        if (!buffData) throw new Error("This item has no effect.");

        // 3. Apply Buff in Transaction
        return await prisma.$transaction(async (tx) => {
            // Decrement inventory
            if (inv.quantity === 1) {
                await tx.inventoryItem.delete({ where: { id: inv.id } });
            } else {
                await tx.inventoryItem.update({
                    where: { id: inv.id },
                    data: { quantity: { decrement: 1 } }
                });
            }

            // Create Buff
            const now = new Date();
            const expiresAt = new Date(now.getTime() + (buffData.durationSeconds * 1000));

            return await tx.heroBuff.create({
                data: {
                    heroId,
                    itemId: templateId,
                    name: item.name,
                    statKey: buffData.statKey,
                    statValue: buffData.statValue,
                    isPercent: buffData.isPercent || false,
                    expiresAt
                }
            });
        });
    }

    _getBuffData(id) {
        const data = {
            4201: { statKey: "str", statValue: 2, durationSeconds: 600 },
            4202: { statKey: "int", statValue: 2, durationSeconds: 600 },
            4203: { statKey: "dex", statValue: 2, durationSeconds: 600 },
            4204: { statKey: "vit", statValue: 2, durationSeconds: 600 },
            4205: { statKey: "health_max", statValue: 50, durationSeconds: 600 },
            4206: { statKey: "str", statValue: 5, durationSeconds: 900 },
            4211: { statKey: "dex", statValue: 10, durationSeconds: 1200 },
            4221: { statKey: "str", statValue: 50, durationSeconds: 3600 },
            4225: { statKey: "str", statValue: 25, durationSeconds: 3600 } // Ambrosia (multiple buffs handled differently in real AAA, but keeping simple)
        };
        return data[id];
    }
}

module.exports = new ConsumableService();
