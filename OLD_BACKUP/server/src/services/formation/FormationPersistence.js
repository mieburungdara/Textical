const BaseService = require('../BaseService');

class FormationPersistence extends BaseService {
    async fullUpdate(userId, presetId, slots) {
        return await this.db.$transaction([
            this.db.formationSlot.deleteMany({ where: { presetId } }),
            this.db.formationSlot.createMany({
                data: slots.map(s => ({
                    presetId,
                    heroId: s.heroId,
                    gridX: s.gridX,
                    gridY: s.gridY
                }))
            })
        ]);
    }

    async moveUnit(presetId, heroId, x, y) {
        return await this.db.formationSlot.update({
            where: { presetId_heroId: { presetId, heroId } },
            data: { gridX: x, gridY: y }
        });
    }

    async swapUnits(presetId, heroA, heroB) {
        const slotA = await this.db.formationSlot.findUnique({ where: { presetId_heroId: { presetId, heroId: heroA } } });
        const slotB = await this.db.formationSlot.findUnique({ where: { presetId_heroId: { presetId, heroId: heroB } } });

        if (!slotA || !slotB) throw new Error("Both heroes must be in the formation.");

        return await this.db.$transaction([
            this.db.formationSlot.update({
                where: { id: slotA.id },
                data: { gridX: slotB.gridX, gridY: slotB.gridY }
            }),
            this.db.formationSlot.update({
                where: { id: slotB.id },
                data: { gridX: slotA.gridX, gridY: slotA.gridY }
            })
        ]);
    }
}

module.exports = new FormationPersistence();
