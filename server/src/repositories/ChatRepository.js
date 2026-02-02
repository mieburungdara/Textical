const prisma = require('../db');

/**
 * ChatRepository
 * Handles relational persistence for chat messages.
 */
class ChatRepository {
    async create(data) {
        return await prisma.chatMessage.create({
            data: {
                channelType: data.channelType,
                channelId: data.channelId,
                userId: data.userId,
                message: data.message
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        });
    }

    async findMany(options) {
        return await prisma.chatMessage.findMany({
            where: options.where,
            orderBy: options.orderBy || { timestamp: 'desc' },
            take: options.take || 50,
            skip: options.skip || 0,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        });
    }

    async delete(messageId) {
        return await prisma.chatMessage.update({
            where: { id: messageId },
            data: { isDeleted: true }
        });
    }
}

module.exports = new ChatRepository();
