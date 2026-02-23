const questService = require('../services/questService');
const questRepository = require('../repositories/questRepository');
const userRepository = require('../repositories/userRepository');
const ErrorCodes = require('../constants/ErrorCodes');

class QuestHandler {
    async handleAcceptQuest(ws, request) {
        try {
            if (!request.account) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.AUTH_USER_NOT_FOUND,
                    message: "Account is required" 
                }));
                return;
            }
            
            if (!request.questId) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.QUEST_NOT_FOUND,
                    message: "questId is required" 
                }));
                return;
            }
            
            const user = await userRepository.findByUsername(request.account);
            if (!user) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.AUTH_USER_NOT_FOUND,
                    message: "User not found" 
                }));
                return;
            }
            
            await questService.acceptQuest(user, request.questId);
            
            const updatedUser = await userRepository.findByUsername(request.account);
            ws.send(JSON.stringify({ 
                type: "login_success", 
                user: updatedUser,
                message: "Mission accepted!"
            }));
        } catch (e) {
            ws.send(JSON.stringify({ 
                type: "error", 
                code: ErrorCodes.INVALID_INPUT,
                message: e.message 
            }));
        }
    }

    async handleFetchActiveQuests(ws, request) {
        try {
            if (!request.account) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.AUTH_USER_NOT_FOUND,
                    message: "Account is required" 
                }));
                return;
            }
            
            const user = await userRepository.findByUsername(request.account);
            if (!user) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.AUTH_USER_NOT_FOUND,
                    message: "User not found" 
                }));
                return;
            }
            
            const activeQuests = await questRepository.getPlayerQuests(user.id);
            ws.send(JSON.stringify({ type: "quest_list", quests: activeQuests }));
        } catch (e) {
            ws.send(JSON.stringify({ 
                type: "error", 
                code: ErrorCodes.INVALID_INPUT,
                message: e.message 
            }));
        }
    }
}

module.exports = new QuestHandler();
