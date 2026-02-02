const BaseService = require('../BaseService');
const detector = require('../../logic/economy/ShortageDetector');

/**
 * MerchantQuestService
 * Orchestrates the generation of time-sensitive supply quests based on economic shortages.
 */
class MerchantQuestService extends BaseService {
    constructor() {
        super();
        this.DYNAMIC_QUEST_ID_START = 100000;
        this.QUEST_DURATION_HOURS = 12;
    }

    /**
     * Scans all regional shop stocks and generates delivery quests for items in shortage.
     */
    async generateShortageQuests() {
        // 1. Fetch all stock
        const stocks = await this.db.shopStock.findMany({
            include: { itemTemplate: true, npc: true, region: true }
        });

        // 2. Detect Shortages
        const shortages = detector.detect(stocks);
        const createdQuests = [];

        return await this.runTransaction(async (tx) => {
            for (const s of shortages) {
                const stockRecord = stocks.find(rec => rec.npcId === s.npcId && rec.templateId === s.templateId && rec.regionId === s.regionId);
                
                // Construct Dynamic Quest ID (Composite of NPC and Item for relative uniqueness)
                // In real prod, we might use auto-inc or UUID
                const dynamicId = this.DYNAMIC_QUEST_ID_START + stockRecord.id;

                const expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + this.QUEST_DURATION_HOURS);

                // Create Quest Template
                const quest = await tx.questTemplate.upsert({
                    where: { id: dynamicId },
                    update: { expiresAt },
                    create: {
                        id: dynamicId,
                        name: `Urgent Supply: ${stockRecord.itemTemplate.name}`,
                        description: `The local merchant ${stockRecord.npc.name} in ${stockRecord.region.name} is running dangerously low on ${stockRecord.itemTemplate.name}. Deliver some immediately for a premium reward!`,
                        isDynamic: true,
                        expiresAt: expiresAt,
                        factionId: stockRecord.npc.factionId
                    }
                });

                // Create Delivery Stage
                await tx.questStage.upsert({
                    where: { questId_order: { questId: quest.id, order: 1 } },
                    update: {},
                    create: {
                        questId: quest.id,
                        order: 1,
                        name: "Delivery",
                        description: `Bring ${s.shortageQty} ${stockRecord.itemTemplate.name} to ${stockRecord.npc.name}.`
                    }
                });

                // Add Objective (DELIVER_ITEM)
                // Note: Assuming 'DELIVER_ITEM' is a supported type in objectiveValidator
                await tx.questObjective.create({
                    data: {
                        stage: { connect: { questId_order: { questId: quest.id, order: 1 } } },
                        type: "DELIVER_ITEM",
                        targetId: s.templateId,
                        amount: s.shortageQty,
                        description: `Deliver ${s.shortageQty} units.`
                    }
                });

                createdQuests.push(quest);
            }
            return createdQuests;
        });
    }

    /**
     * Cleans up quests that have passed their expiration date.
     */
    async cleanupExpiredQuests() {
        const now = new Date();
        return await this.runTransaction(async (tx) => {
            const expired = await tx.questTemplate.findMany({
                where: { isDynamic: true, expiresAt: { lte: now } }
            });

            for (const q of expired) {
                // Cascading delete relations (Objectives, Stages, Rewards)
                // Prisma should handle this if defined in schema, but being explicit for safety
                const stages = await tx.questStage.findMany({ where: { questId: q.id } });
                for (const stage of stages) {
                    await tx.questObjective.deleteMany({ where: { stageId: stage.id } });
                    await tx.questReward.deleteMany({ where: { stageId: stage.id } });
                }
                await tx.questStage.deleteMany({ where: { questId: q.id } });
                await tx.userQuest.deleteMany({ where: { questId: q.id } });
                await tx.questTemplate.delete({ where: { id: q.id } });
            }
            return expired.length;
        });
    }
}

module.exports = new MerchantQuestService();
