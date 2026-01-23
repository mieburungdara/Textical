const guildService = require('../services/guildService');
const userRepository = require('../repositories/userRepository');

class GuildHandler {
    async handleCreateGuild(ws, request) {
        try {
            const user = await userRepository.findByUsername(request.account);
            const guild = await guildService.createGuild(user, request.templateId, request.name, request.description);
            
            // Sync user data
            const updatedUser = await userRepository.findByUsername(request.account);
            ws.send(JSON.stringify({ 
                type: "login_success", 
                user: updatedUser,
                message: `Guild '${guild.name}' established successfully!`
            }));
        } catch (e) {
            ws.send(JSON.stringify({ type: "error", message: e.message }));
        }
    }

    async handleJoinGuild(ws, request) {
        try {
            const user = await userRepository.findByUsername(request.account);
            await guildService.joinGuild(user, request.guildId);
            
            const updatedUser = await userRepository.findByUsername(request.account);
            ws.send(JSON.stringify({ type: "login_success", user: updatedUser }));
        } catch (e) {
            ws.send(JSON.stringify({ type: "error", message: e.message }));
        }
    }
}

module.exports = new GuildHandler();
