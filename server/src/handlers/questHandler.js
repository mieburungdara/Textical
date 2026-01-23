const questService = require('../services/questService');
const questRepository = require('../repositories/questRepository');
const userRepository = require('../repositories/userRepository');

class QuestHandler {
    async handleAcceptQuest(ws, request) {
        try {
            const user = await userRepository.findByUsername(request.account);
            await questService.acceptQuest(user, request.questId);
            
            const updatedUser = await userRepository.findByUsername(request.account);
            ws.send(JSON.stringify({ 
                type: "login_success", 
                user: updatedUser,
                message: "Mission accepted!"
            }));
        } catch (e) {
            ws.send(JSON.stringify({ type: "error", message: e.message }));
        }
    }

    async handleFetchActiveQuests(ws, request) {
        try {
            const user = await userRepository.findByUsername(request.account);
            const activeQuests = await questRepository.getPlayerQuests(user.id);
            ws.send(JSON.stringify({ type: "quest_list", quests: activeQuests }));
        } catch (e) {
            ws.send(JSON.stringify({ type: "error", message: e.message }));
        }
    }
}

module.exports = new QuestHandler();
