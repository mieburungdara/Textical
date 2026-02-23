const BaseService = require('../BaseService');

class FormationValidator extends BaseService {
    validatePositions(slots) {
        if (slots.length > 2500) throw new Error("Formation cannot exceed 2500 units.");

        const usedPositions = new Set();
        const usedHeroes = new Set();

        for (const slot of slots) {
            if (slot.gridX < 0 || slot.gridX > 49 || slot.gridY < 25 || slot.gridY > 49) {
                throw new Error(`Invalid position [${slot.gridX}, ${slot.gridY}]. Must be Rows 25-49.`);
            }
            
            const posKey = `${slot.gridX},${slot.gridY}`;
            if (usedPositions.has(posKey)) throw new Error("Overlap detected.");
            if (usedHeroes.has(slot.heroId)) throw new Error("Hero duplication detected.");
            
            usedPositions.add(posKey);
            usedHeroes.add(slot.heroId);
        }
    }

    async verifyOwnership(userId, heroIds) {
        const ownedCount = await this.db.hero.count({
            where: { id: { in: heroIds }, userId }
        });
        if (ownedCount !== heroIds.length) throw new Error("Unauthorized hero ownership.");
    }
}

module.exports = new FormationValidator();
