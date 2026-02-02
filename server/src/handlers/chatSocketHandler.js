const chatService = require('../services/chatService');

/**
 * ChatSocketHandler
 * Injects chat-related events into the socket connection.
 */
class ChatSocketHandler {
    register(io, socket, userId) {
        // --- GLOBAL CHANNEL ---
        socket.join('chat:global');

        // --- JOIN GUILD ---
        socket.on('chat:join_guild', (guildId) => {
            if (guildId) {
                socket.join(`chat:guild:${guildId}`);
                console.log(`[CHAT] User ${userId} joined Guild ${guildId}`);
            }
        });

        // --- PRIVATE MESSAGING ---
        socket.on('chat:join_private', (otherUserId) => {
            const roomId = this._getPrivateRoomId(userId, otherUserId);
            socket.join(`chat:private:${roomId}`);
            console.log(`[CHAT] User ${userId} joined Private Room with ${otherUserId}`);
        });

        // --- SEND MESSAGE ---
        socket.on('chat:send', async (data) => {
            try {
                const { channelType, channelId, message, otherUserId } = data;
                
                // 1. Process via Service (Validation & Persistence)
                const chatMsg = await chatService.sendMessage(userId, {
                    channelType,
                    channelId,
                    message
                });

                // 2. Resolve Target Room
                let targetRoom = 'chat:global';
                if (channelType === 'GUILD') {
                    targetRoom = `chat:guild:${channelId}`;
                } else if (channelType === 'PRIVATE') {
                    const roomId = this._getPrivateRoomId(userId, otherUserId);
                    targetRoom = `chat:private:${roomId}`;
                }

                // 3. Emit to Room
                io.to(targetRoom).emit('chat:message', chatMsg);

            } catch (e) {
                socket.emit('chat:error', { message: e.message });
            }
        });

        // --- TYPING INDICATOR ---
        socket.on('chat:typing', (data) => {
            const { channelType, channelId, otherUserId, isTyping } = data;
            let targetRoom = 'chat:global';
            
            if (channelType === 'GUILD') {
                targetRoom = `chat:guild:${channelId}`;
            } else if (channelType === 'PRIVATE') {
                const roomId = this._getPrivateRoomId(userId, otherUserId);
                targetRoom = `chat:private:${roomId}`;
            }

            // Broadcast typing to everyone in room except sender
            socket.to(targetRoom).emit('chat:typing', {
                userId,
                username: socket.username || `User_${userId}`, // Ensure username is available
                isTyping
            });
        });
    }

    _getPrivateRoomId(id1, id2) {
        // Deterministic room ID based on sorted user IDs
        const ids = [parseInt(id1), parseInt(id2)].sort((a, b) => a - b);
        return `${ids[0]}-${ids[1]}`;
    }
}

module.exports = new ChatSocketHandler();
