const chatService = require('../services/chatService');
const BaseController = require('./BaseController');

/**
 * ChatController
 * REST endpoints for chat history and management.
 */
class ChatController extends BaseController {
    async sendMessage(req, res) {
        try {
            const { channelType, channelId, message } = req.body;
            const userId = req.user.id; // Assume auth middleware sets req.user

            const result = await chatService.sendMessage(userId, {
                channelType,
                channelId,
                message
            });

            return res.status(201).json(result);
        } catch (e) {
            return res.status(400).json({ error: e.message });
        }
    }

    async getHistory(req, res) {
        try {
            const { channelType, channelId, limit, offset } = req.query;
            
            const history = await chatService.getHistory(
                channelType, 
                channelId ? parseInt(channelId) : null, 
                limit ? parseInt(limit) : 50, 
                offset ? parseInt(offset) : 0
            );

            return res.status(200).json(history);
        } catch (e) {
            return res.status(400).json({ error: e.message });
        }
    }

    async getOnlineUsers(req, res) {
        // Placeholder for online users logic
        return res.status(200).json({ online: 0 });
    }
}

module.exports = new ChatController();
