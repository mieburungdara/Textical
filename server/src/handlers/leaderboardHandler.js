const leaderboardService = require('../services/leaderboardService');

class LeaderboardHandler {
    async handleFetchLeaderboard(ws, request) {
        try {
            let data = [];
            switch (request.category) {
                case "wealth": data = await leaderboardService.getWealthLeaderboard(); break;
                case "territory": data = await leaderboardService.getTerritoryLeaderboard(); break;
                case "power": data = await leaderboardService.getPowerLeaderboard(); break;
                default: throw new Error("Invalid leaderboard category.");
            }

            ws.send(JSON.stringify({
                type: "leaderboard_data",
                category: request.category,
                rankings: data
            }));
        } catch (e) {
            ws.send(JSON.stringify({ type: "error", message: e.message }));
        }
    }
}

module.exports = new LeaderboardHandler();
