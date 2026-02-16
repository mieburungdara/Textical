const userRepository = require('../repositories/userRepository');
const heroService = require('../services/heroService');
const battleService = require('../services/battleService');
const rewardService = require('../services/rewardService');
const ErrorCodes = require('../constants/ErrorCodes');

class BattleHandler {
    async handleStartBattle(ws, request) {
        try {
            // Validate required parameters
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

            const party = heroService.prepareBattleParty(user);
            const result = await battleService.runSimulation(party);
            const post = await rewardService.processPostBattle(user, result, request.mode || "ADVENTURE");
            
            const finalUser = await userRepository.findByUsername(request.account);
            ws.send(JSON.stringify({ 
                type: "battle_replay", ...result, 
                evolution_alerts: post.alerts.evolution, 
                death_alerts: post.alerts.death, 
                progression: post.progression, 
                user: finalUser 
            }));
        } catch (e) {
            ws.send(JSON.stringify({ 
                type: "error", 
                code: ErrorCodes.COMBAT_BUSY,
                message: e.message || "Battle failed" 
            }));
        }
    }
}

module.exports = new BattleHandler();
