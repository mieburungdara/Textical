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

        // 2. Define Buff Logic
        const buffData = this._getBuffData(templateId);
        if (!buffData) throw new Error("This item has no effect.");

        // 3. Apply Buff or Permanent Stat in Transaction
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

            // PERMANENT STAT LOGIC
            if (buffData.isPermanent) {
                const updateData = {};
                updateData[buffData.statKey] = { increment: buffData.statValue };
                return await tx.hero.update({
                    where: { id: heroId },
                    data: updateData
                });
            }

            // Create Temporary Buff
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
            // DISHES
            4201: { statKey: "str", statValue: 2, durationSeconds: 600 },
            4202: { statKey: "int", statValue: 2, durationSeconds: 600 },
            4203: { statKey: "dex", statValue: 2, durationSeconds: 600 },
            4204: { statKey: "vit", statValue: 2, durationSeconds: 600 },
            4205: { statKey: "health_max", statValue: 50, durationSeconds: 600 },
            
            // ELIXIRS
            4401: { statKey: "hp_regen", statValue: 5, durationSeconds: 1200 },
            4402: { statKey: "mana_regen", statValue: 5, durationSeconds: 1200 },
            4411: { statKey: "str", statValue: 20, durationSeconds: 1800 },
            
            // PERMANENT STAT ELIXIRS
            4421: { statKey: "str", statValue: 1, isPermanent: true },
            4422: { statKey: "dex", statValue: 1, isPermanent: true },
            4423: { statKey: "int", statValue: 1, isPermanent: true },
            4424: { statKey: "vit", statValue: 1, isPermanent: true },
            4425: { statKey: "str", statValue: 1, isPermanent: true } // Elixir of Gods
        };
        return data[id];
    }
}

module.exports = new ConsumableService();