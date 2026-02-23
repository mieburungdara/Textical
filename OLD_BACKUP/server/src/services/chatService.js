const chatRepository = require('../repositories/ChatRepository');

/**
 * ChatService
 * Orchestrates real-time communication logic and validation.
 */
class ChatService {
    constructor() {
        this.MESSAGE_MAX_LENGTH = 200;
        this.SPAM_THRESHOLD_MS = 1000; // 1 message per second
        this.userLastMessageTime = new Map();
    }

    async sendMessage(userId, data) {
        const { channelType, channelId, message } = data;

        // 1. Validation
        this._validateMessage(message);
        await this._checkSpam(userId);

        // 2. Persist
        const chatMessage = await chatRepository.create({
            userId,
            channelType,
            channelId,
            message: this._filterProfanity(message)
        });

        // 3. Update Last Message Time
        this.userLastMessageTime.set(userId, Date.now());

        return chatMessage;
    }

    async getHistory(channelType, channelId = null, limit = 50, offset = 0) {
        const where = {
            channelType,
            isDeleted: false
        };

        if (channelId) {
            where.channelId = channelId;
        }

        const messages = await chatRepository.findMany({
            where,
            take: limit,
            skip: offset,
            orderBy: { timestamp: 'desc' }
        });

        return messages.reverse(); // Show oldest first for UI
    }

    _validateMessage(message) {
        if (!message || message.trim().length === 0) {
            throw new Error("Message cannot be empty.");
        }
        if (message.length > this.MESSAGE_MAX_LENGTH) {
            throw new Error(`Message exceeds maximum length of ${this.MESSAGE_MAX_LENGTH} characters.`);
        }
    }

    async _checkSpam(userId) {
        const lastTime = this.userLastMessageTime.get(userId);
        if (lastTime && (Date.now() - lastTime) < this.SPAM_THRESHOLD_MS) {
            throw new Error("Slow down! You are sending messages too fast.");
        }
    }

    _filterProfanity(message) {
        // AAA: Professional Filter Expansion
        const badWords = [
            /fuck/gi, /shit/gi, /asshole/gi, /bitch/gi, /dick/gi, 
            /pussy/gi, /cunt/gi, /bastard/gi, /nigger/gi, /faggot/gi
        ];
        let filtered = message;
        badWords.forEach(pattern => {
            filtered = filtered.replace(pattern, (match) => "*".repeat(match.length));
        });
        return filtered;
    }
}

module.exports = new ChatService();
