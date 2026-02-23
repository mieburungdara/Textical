const prisma = require('../db');
const { buildPaginationArgs, buildPaginationMeta } = require('../utils/PaginationHelper');

class QuestRepository {
    /**
     * Get a player's active quest with full progress data.
     * @param {number} userId - User ID.
     * @param {number} questId - Quest template ID.
     * @returns {Promise<Object|null>}
     */
    async findActiveQuestWithProgress(userId, questId) {
        return await prisma.userQuest.findUnique({
            where: { userId_questId: { userId: parseInt(userId), questId: parseInt(questId) } },
            include: {
                quest: {
                    select: { id: true, title: true, description: true, xpReward: true, goldReward: true }
                },
                objectives: { include: { objective: true } },
                progressData: true,
                variables: true,
            }
        });
    }

    /**
     * Accept a quest and create progress tracking records.
     * @param {number} uId - User ID.
     * @param {number} qId - Quest template ID.
     * @param {Object[]} objectiveTemplates - List of objective templates.
     * @returns {Promise<Object>}
     */
    async acceptQuest(uId, qId, objectiveTemplates) {
        const userId = parseInt(uId);
        const questId = parseInt(qId);
        return await prisma.userQuest.create({
            data: {
                userId,
                questId,
                status: 'ACTIVE',
                objectives: {
                    create: objectiveTemplates.map(obj => ({
                        objectiveId: parseInt(obj.id),
                        currentAmount: 0,
                        isCompleted: false,
                    }))
                }
            },
            include: { objectives: true }
        });
    }

    /**
     * Update progress for a single quest objective.
     * @param {number} id - UserQuestObjective ID.
     * @param {number} newAmount - New current amount.
     * @param {boolean} isCompleted - Whether objective is done.
     * @returns {Promise<Object>}
     */
    async updateObjectiveProgress(id, newAmount, isCompleted) {
        const userObjectiveId = parseInt(id);
        return await prisma.userQuestObjective.update({
            where: { id: userObjectiveId },
            data: { currentAmount: parseInt(newAmount), isCompleted },
        });
    }

    /**
     * Mark a quest as completed.
     * @param {number} id - UserQuest ID.
     * @returns {Promise<Object>}
     */
    async completeQuest(id) {
        const userQuestId = parseInt(id);
        return await prisma.userQuest.update({
            where: { id: userQuestId },
            data: { status: 'COMPLETED', completedAt: new Date() },
        });
    }

    /**
     * Get a player's quests with optional status filter and pagination.
     * @param {number} uId - User ID.
     * @param {string|null} status - Filter by status (ACTIVE, COMPLETED, FAILED). Null = all.
     * @param {number} page - Page number (1-indexed).
     * @param {number} limit - Items per page.
     * @returns {Promise<{ data: Object[], meta: Object }>}
     */
    async getPlayerQuests(uId, status = null, page = 1, limit = 20) {
        const userId = parseInt(uId);
        const where = { userId };
        if (status) where.status = status;

        const { skip, take } = buildPaginationArgs(page, limit);

        const [data, total] = await prisma.$transaction([
            prisma.userQuest.findMany({
                where,
                include: {
                    quest: { select: { id: true, title: true, description: true, xpReward: true, goldReward: true } },
                    objectives: { include: { objective: true } },
                },
                orderBy: { updatedAt: 'desc' },
                skip,
                take,
            }),
            prisma.userQuest.count({ where }),
        ]);

        return { data, meta: buildPaginationMeta(page, limit, total) };
    }
}

module.exports = new QuestRepository();
