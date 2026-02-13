const BaseService = require('./BaseService');
const objectiveValidator = require('./quest/ObjectiveValidator');
const rewardDistributor = require('./quest/RewardDistributor');
const dialogueResolver = require('../logic/quest/DialogueResolver');
const reputationService = require('./reputationService');

/**
 * QuestService (Narrative-Enhanced)
 * Orchestrates multi-stage quest progression and branching dialogues.
 */
class QuestService extends BaseService {
    
    /**
     * Initiates a conversation with an NPC.
     * Returns the root dialogue node.
     */
    async startDialogue(userId, npcId) {
        const rootNode = await this.db.dialogueNode.findFirst({
            where: { npcId, isRoot: true },
            include: { choices: true }
        });

        if (!rootNode) throw new Error("This NPC has nothing to say.");
        return rootNode;
    }

    /**
     * Processes a player's choice in a dialogue branch.
     * Handles side-effects like quest acceptance and reputation changes.
     */
    async processDialogueChoice(userId, choiceId) {
        return await this.runTransaction(async (tx) => {
            // 1. Resolve logical effects of the choice
            const effects = await dialogueResolver.resolveChoice(tx, userId, choiceId);

            // 2. Apply Reputation Changes
            if (effects.reputationUpdate) {
                await reputationService.addReputation(userId, effects.reputationUpdate.factionId, effects.reputationUpdate.amount, tx);
            }

            // 3. Auto-Accept Quest if offered
            let questRecord = null;
            if (effects.questToOffer) {
                questRecord = await this.acceptQuest(userId, effects.questToOffer, tx);
            }

            // 4. Fetch Next Node
            let nextNode = null;
            if (effects.nextNodeId) {
                nextNode = await tx.dialogueNode.findUnique({
                    where: { id: effects.nextNodeId },
                    include: { choices: true }
                });
            }

            return { nextNode, questAccepted: !!questRecord, triggerCombat: effects.triggerCombat };
        });
    }

    async acceptQuest(userId, questId, tx = null) {
        const client = tx || this.db;

        const quest = await client.questTemplate.findUnique({
            where: { id: questId },
            include: { stages: { orderBy: { order: 'asc' } } }
        });

        if (!quest || quest.stages.length === 0) throw new Error("Quest template invalid.");

        // Check Reputation Requirement
        const hasRep = await reputationService.checkReputationRequirement(userId, quest.factionId, quest.minReputation);
        if (!hasRep) throw new Error("You lack the reputation required for this task.");

        return await client.userQuest.create({
            data: {
                userId,
                questId,
                currentStageId: quest.stages[0].id,
                status: "ACTIVE"
            }
        });
    }

    async completeCurrentStage(userId, userQuestId) {
        const uQuest = await this.db.userQuest.findUnique({
            where: { id: userQuestId },
            include: { 
                currentStage: { include: { objectives: true, rewards: true } }
            }
        });

        if (!uQuest || uQuest.userId !== userId) throw new Error("User quest record not found.");
        if (uQuest.status === "COMPLETED") throw new Error("Quest already fully finished.");

        this.log(`Hero attempting to complete stage: ${uQuest.currentStage.name}`, "Quest");

        // 1. Validate Current Stage Objectives
        await objectiveValidator.validateAndConsume(userId, uQuest);

        // 2. Award Stage Rewards & Handle Transitions
        return await rewardDistributor.award(userId, uQuest);
    }

    async getActiveQuests(userId) {
        return await this.db.userQuest.findMany({
            where: { userId, status: "ACTIVE" },
            include: { currentStage: { include: { objectives: true } }, quest: true }
        });
    }

    async updateQuestProgress(userId, type, targetId, amount = 1) {
        const activeQuests = await this.getActiveQuests(userId);
        
        for (const uQuest of activeQuests) {
            const currentStage = uQuest.currentStage;
            if (!currentStage) continue;

            let updated = false;
            const progress = JSON.parse(uQuest.progressData || "{}");

            for (const obj of currentStage.objectives) {
                if (obj.type === type && obj.targetId === targetId) {
                    progress[targetId] = (progress[targetId] || 0) + amount;
                    updated = true;
                }
            }

            if (updated) {
                await this.db.userQuest.update({
                    where: { id: uQuest.id },
                    data: { progressData: JSON.stringify(progress) }
                });
                this.log(`Updated quest ${uQuest.questId} progress for User ${userId}: ${type} ${targetId} -> ${progress[targetId]}`, "Quest");
            }
        }
    }
}

module.exports = new QuestService();
