const prisma = require('../db');

class ConsumableService {
    async useItemInstance(userId, heroId, itemInstanceId) {
        const inv = await prisma.inventoryItem.findUnique({
            where: { id: itemInstanceId },
            include: { template: true }
        });

        if (!inv || inv.userId !== userId) throw new Error("Item not found in your inventory.");
        if (inv.template.category !== "CONSUMABLE") throw new Error("Item is not consumable.");

        const templateId = inv.templateId;
        const item = inv.template;

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

            // If no hero provided, try to find user's main hero
            let targetHeroId = heroId;
            if (!targetHeroId || targetHeroId <= 0) {
                const mainHero = await tx.hero.findFirst({
                    where: { userId, isMain: true }
                });
                if (mainHero) targetHeroId = mainHero.id;
            }

            if (!targetHeroId) throw new Error("No hero selected to receive the effect.");

            // PERMANENT STAT LOGIC
            if (buffData.isPermanent) {
                const updateData = {};
                updateData[buffData.statKey] = { increment: buffData.statValue };
                return await tx.hero.update({
                    where: { id: targetHeroId },
                    data: updateData
                });
            }

            // Create Temporary Buff
            const now = new Date();
            const expiresAt = new Date(now.getTime() + (buffData.durationSeconds * 1000));

            return await tx.heroBuff.create({
                data: {
                    heroId: targetHeroId,
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

    async consumeItem(userId, heroId, templateId) {
        // Legacy support or for scripts
        const inv = await prisma.inventoryItem.findFirst({
            where: { userId, templateId }
        });
        if (!inv) throw new Error("Item not found.");
        return this.useItemInstance(userId, heroId, inv.id);
    }

    _getBuffData(id) {
        const data = {
            // BASIC POTIONS
            101: { statKey: "hp_regen", statValue: 10, durationSeconds: 300 }, // Healing Potion: Fast regen for 5 mins
            
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