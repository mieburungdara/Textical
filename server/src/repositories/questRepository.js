const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class QuestRepository {
    /**
     * High-performance join to get player's active quest with all objectives
     */
    async findActiveQuestWithProgress(userId, questId) {
        return await prisma.userQuest.findUnique({
            where: { userId_questId: { userId, questId } },
            include: {
                quest: true,
                objectives: {
                    include: { objective: true }
                }
            }
        });
    }

    async acceptQuest(userId, questId, objectiveTemplates) {
        return await prisma.userQuest.create({
            data: {
                userId,
                questId,
                status: "ACTIVE",
                objectives: {
                    create: objectiveTemplates.map(obj => ({
                        objectiveId: obj.id,
                        currentAmount: 0,
                        isCompleted: false
                    }))
                }
            },
            include: { objectives: true }
        });
    }

    async updateObjectiveProgress(userObjectiveId, newAmount, isCompleted) {
        return await prisma.userQuestObjective.update({
            where: { id: userObjectiveId },
            data: { currentAmount: newAmount, isCompleted }
        });
    }

    async completeQuest(userQuestId) {
        return await prisma.userQuest.update({
            where: { id: userQuestId },
            data: { status: "COMPLETED", completedAt: new Date() }
        });
    }

    async getPlayerQuests(userId) {
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
