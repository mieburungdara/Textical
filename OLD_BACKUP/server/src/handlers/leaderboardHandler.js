const leaderboardService = require('../services/leaderboardService');
const ErrorCodes = require('../constants/ErrorCodes');

class LeaderboardHandler {
    async handleFetchLeaderboard(ws, request) {
        try {
            const validCategories = ['wealth', 'territory', 'power'];
            if (!request.category || !validCategories.includes(request.category)) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.INVALID_INPUT,
                    message: `Invalid category '${request.category}'. Valid categories: ${validCategories.join(', ')}` 
                }));
                return;
            }
            
            let data = [];
            switch (request.category) {
                case "wealth": data = await leaderboardService.getWealthLeaderboard(); break;
                case "territory": data = await leaderboardService.getTerritoryLeaderboard(); break;
                case "power": data = await leaderboardService.getPowerLeaderboard(); break;
            }

            ws.send(JSON.stringify({
                type: "leaderboard_data",
                category: request.category,
                rankings: data
            }));
        } catch (e) {
            ws.send(JSON.stringify({ 
                type: "error", 
                code: ErrorCodes.INVALID_INPUT,
                message: e.message 
            }));
        }
    }
}

module.exports = new LeaderboardHandler();
