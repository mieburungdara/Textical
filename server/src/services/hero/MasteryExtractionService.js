const BaseService = require('../BaseService');
const inventoryService = require('../inventoryService');

/**
 * MasteryExtractionService
 * Logic for converting hero class expertise into tradeable items.
 */
class MasteryExtractionService extends BaseService {
    constructor() {
        super();
        this.MIN_EXTRACTION_LEVEL = 5;
    }

    /**
     * Extracts a hero's current class level into a Mastery Tome.
     * Resets the hero's class level to 1.
     */
    async extractMastery(userId, heroId) {
        const hero = await this.db.hero.findUnique({
            where: { id: heroId },
            include: { combatClass: true }
        });

        if (!hero || hero.userId !== userId) throw new Error("Hero not found.");
        if (hero.classLevel < this.MIN_EXTRACTION_LEVEL) {
            throw new Error(`Hero must be at least Class Level ${this.MIN_EXTRACTION_LEVEL} to extract mastery.`);
        }

        const tomeTemplateId = 9000 + hero.classId;

        return await this.runTransaction(async (tx) => {
            // 1. Reset Hero Class Level
            await tx.hero.update({
                where: { id: heroId },
                data: {
                    classLevel: 1,
                    classXp: 0
                }
            });

            // 2. Award Mastery Tome
            await inventoryService.addItem(userId, tomeTemplateId, 1, tx);

            this.log(`Mastery Extracted: Hero ${heroId} reset. User ${userId} received Tome ${tomeTemplateId}`, "Mastery");
            return { success: true, tomeId: tomeTemplateId };
        });
    }
}

module.exports = new MasteryExtractionService();
