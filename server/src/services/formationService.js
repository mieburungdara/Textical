const formationValidator = require('./formation/FormationValidator');
const profileCalculator = require('./formation/ProfileCalculator');
const formationPersistence = require('./formation/FormationPersistence');
const prisma = require('../db');

/**
 * FormationService (v2.0 - Modular Orchestrator)
 */
class FormationService {
    async updateFormation(userId, presetId, slots) {
        formationValidator.validatePositions(slots);
        await formationValidator.verifyOwnership(userId, slots.map(s => s.heroId));

        // AAA: Market Protection - Check if any hero is currently listed for sale
        const heroIds = slots.map(s => s.heroId);
        const listedHeroes = await prisma.heroOrder.count({
            where: { heroId: { in: heroIds }, status: "OPEN" }
        });
        if (listedHeroes > 0) throw new Error("Cannot add a hero to formation while they are listed in the market.");

        return await formationPersistence.fullUpdate(userId, presetId, slots);
    }

    async moveUnit(userId, presetId, heroId, x, y) {
        // Ownership check
        const hero = await prisma.hero.findFirst({ where: { id: heroId, userId } });
        if (!hero) throw new Error("Unauthorized.");
        
        return await formationPersistence.moveUnit(presetId, heroId, x, y);
    }

    async swapUnits(userId, presetId, heroA, heroB) {
        const owned = await prisma.hero.count({ where: { id: { in: [heroA, heroB] }, userId } });
        if (owned !== 2) throw new Error("Unauthorized.");
        
        return await formationPersistence.swapUnits(presetId, heroA, heroB);
    }

    async getHeroCombatProfile(heroId) {
        return await profileCalculator.getHeroCombatProfile(heroId);
    }

    async getPartyProfile(presetId) {
        const slots = await prisma.formationSlot.findMany({
            where: { presetId },
            include: { hero: true }
        });

        const party = [];
        for (const slot of slots) {
            const profile = await this.getHeroCombatProfile(slot.heroId);
            party.push({
                heroId: slot.heroId,
                grid: { x: slot.gridX, y: slot.gridY },
                profile
            });
        }
        return party;
    }
}

module.exports = new FormationService();
