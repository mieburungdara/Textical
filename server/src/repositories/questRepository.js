const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class QuestRepository {
    /**
     * High-performance join to get player's active quest with all objectives
     */
    async findActiveQuestWithProgress(userId, questId) {
        return await prisma.userQuest.findUnique({
            where: { userId_questId: { userId: parseInt(userId), questId: parseInt(questId) } },
            include: {
                quest: true,
                objectives: {
                    include: { objective: true }
                }
            }
        });
    }

    async acceptQuest(uId, qId, objectiveTemplates) {
        const userId = parseInt(uId);
        const questId = parseInt(qId);
        return await prisma.userQuest.create({
            data: {
                userId,
                questId,
                status: "ACTIVE",
                objectives: {
                    create: objectiveTemplates.map(obj => ({
                        objectiveId: parseInt(obj.id),
                        currentAmount: 0,
                        isCompleted: false
                    }))
                }
            },
            include: { objectives: true }
        });
    }

    async updateObjectiveProgress(id, newAmount, isCompleted) {
        const userObjectiveId = parseInt(id);
        return await prisma.userQuestObjective.update({
            where: { id: userObjectiveId },
            data: { currentAmount: parseInt(newAmount), isCompleted }
        });
    }

    async completeQuest(id) {
        const userQuestId = parseInt(id);
        return await prisma.userQuest.update({
            where: { id: userQuestId },
            data: { status: "COMPLETED", completedAt: new Date() }
        });
    }

    async getPlayerQuests(uId) {
        const userId = parseInt(uId);
        return await prisma.userQuest.findMany({
            where: { userId },
            include: { 
                quest: true,
                objectives: { include: { objective: true } }
            }
        });
    }
}

module.exports = new QuestRepository();
