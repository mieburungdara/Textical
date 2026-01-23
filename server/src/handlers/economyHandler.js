const economyService = require('../services/economyService');
const userRepository = require('../repositories/userRepository');

class EconomyHandler {
    async handleConvert(ws, request) {
        try {
            const user = await userRepository.findByUsername(request.account);
            let updatedUser;

            if (request.direction === "G2C") {
                updatedUser = await economyService.convertGoldToCopper(user.id, request.amount);
            } else if (request.direction === "C2G") {
                updatedUser = await economyService.convertCopperToGold(user.id, request.amount);
            } else {
                throw new Error("Invalid conversion direction.");
            }

            ws.send(JSON.stringify({ 
                type: "login_success", 
                user: updatedUser,
                message: "Currency converted successfully!" 
            }));
        } catch (e) {
            ws.send(JSON.stringify({ type: "error", message: e.message }));
        }
    }
}

module.exports = new EconomyHandler();
