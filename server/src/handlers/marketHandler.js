const marketService = require('../services/marketService');
const marketRepository = require('../repositories/marketRepository');
const userRepository = require('../repositories/userRepository');

class MarketHandler {
    async handleListItems(ws, request) {
        const listings = await marketRepository.getActiveListings(request.templateId);
        ws.send(JSON.stringify({ type: "market_list", listings }));
    }

    async handlePostListing(ws, request) {
        try {
            const user = await userRepository.findByUsername(request.account);
            await marketService.listItem(user, request.itemId, request.price, request.quantity);
            
            ws.send(JSON.stringify({ type: "success", message: "Item listed on market!" }));
        } catch (e) {
            ws.send(JSON.stringify({ type: "error", message: e.message }));
        }
    }

    async handleBuy(ws, request) {
        try {
            const user = await userRepository.findByUsername(request.account);
            await marketService.buyItem(user, request.listingId);
            
            // Sync updated state
            const updatedUser = await userRepository.findByUsername(request.account);
            ws.send(JSON.stringify({ type: "login_success", user: updatedUser, message: "Purchase complete!" }));
        } catch (e) {
            ws.send(JSON.stringify({ type: "error", message: e.message }));
        }
    }
}

module.exports = new MarketHandler();
