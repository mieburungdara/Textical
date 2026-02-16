const economyService = require('../services/economyService');
const userRepository = require('../repositories/userRepository');
const ErrorCodes = require('../constants/ErrorCodes');

class EconomyHandler {
    async handleConvert(ws, request) {
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

            if (!request.from || !request.to) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.INVALID_INPUT,
                    message: "Currency from and to are required" 
                }));
                return;
            }

            if (!request.amount || request.amount <= 0) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.INVALID_INPUT,
                    message: "Valid amount is required" 
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
            ws.send(JSON.stringify({ 
                type: "error", 
                code: ErrorCodes.INVALID_INPUT,
                message: e.message || "Conversion failed" 
            }));
        }
    }
}

module.exports = new EconomyHandler();
