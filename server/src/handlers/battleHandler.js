const userRepository = require('../repositories/userRepository');
const heroService = require('../services/heroService');
const battleService = require('../services/battleService');
const rewardService = require('../services/rewardService');

class BattleHandler {
    async handleStartBattle(ws, request) {
        const user = await userRepository.findByUsername(request.account);
        if (!user) return;

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
    }
}

module.exports = new BattleHandler();
