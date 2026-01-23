const economyService = require('../services/economyService');
const userRepository = require('../repositories/userRepository');

class EconomyHandler {
    async handleConvert(ws, request) {
        try {
            const user = await userRepository.findByUsername(request.account);
            
            const updatedUser = await economyService.convertCurrency(
                user.id, 
                request.from, 
                request.to, 
                request.amount
            );

            ws.send(JSON.stringify({ 
                type: "login_success", 
                user: updatedUser,
                message: `Converted ${request.amount} ${request.from} into ${request.to}!` 
            }));
        } catch (e) {
            ws.send(JSON.stringify({ type: "error", message: e.message }));
        }
    }
}

module.exports = new EconomyHandler();