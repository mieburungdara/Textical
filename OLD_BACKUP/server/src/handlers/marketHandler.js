const marketService = require('../services/marketService');
const marketRepository = require('../repositories/marketRepository');
const userRepository = require('../repositories/userRepository');
const ErrorCodes = require('../constants/ErrorCodes');

class MarketHandler {
    async handleListItems(ws, request) {
        try {
            if (!request.templateId) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.MARKET_ITEM_NOT_AVAILABLE,
                    message: "templateId is required" 
                }));
                return;
            }
            
            const listings = await marketRepository.getActiveListings(request.templateId);
            ws.send(JSON.stringify({ type: "market_list", listings }));
        } catch (e) {
            ws.send(JSON.stringify({ 
                type: "error", 
                code: ErrorCodes.INVALID_INPUT,
                message: e.message 
            }));
        }
    }

    async handlePostListing(ws, request) {
        try {
            if (!request.account) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.AUTH_USER_NOT_FOUND,
                    message: "Account is required" 
                }));
                return;
            }
            
            if (!request.itemId) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.INVENTORY_ITEM_NOT_FOUND,
                    message: "itemId is required" 
                }));
                return;
            }
            
            if (!request.price || request.price <= 0) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.MARKET_PRICE_TOO_LOW,
                    message: "Price must be at least 1 gold" 
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
            
            await marketService.listItem(user, request.itemId, request.price, request.quantity);
            
            ws.send(JSON.stringify({ type: "success", message: "Item listed on market!" }));
        } catch (e) {
            ws.send(JSON.stringify({ 
                type: "error", 
                code: ErrorCodes.MARKET_BUSY,
                message: e.message 
            }));
        }
    }

    async handleBuy(ws, request) {
        try {
            if (!request.account) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.AUTH_USER_NOT_FOUND,
                    message: "Account is required" 
                }));
                return;
            }
            
            if (!request.listingId) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.MARKET_LISTING_NOT_FOUND,
                    message: "listingId is required" 
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
            
            await marketService.buyItem(user, request.listingId);
            
            // Sync updated state
            const updatedUser = await userRepository.findByUsername(request.account);
            ws.send(JSON.stringify({ type: "login_success", user: updatedUser, message: "Purchase complete!" }));
        } catch (e) {
            ws.send(JSON.stringify({ 
                type: "error", 
                code: ErrorCodes.MARKET_BUSY,
                message: e.message 
            }));
        }
    }
}

module.exports = new MarketHandler();
