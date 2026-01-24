const siegeService = require('../services/siegeService');
const siegeRepository = require('../repositories/siegeRepository');

class SiegeHandler {
    async handleGetSiegeStatus(ws, request) {
        try {
            const siege = await siegeRepository.getSiegeById(request.siegeId);
            ws.send(JSON.stringify({ type: "siege_status", siege }));
        } catch (e) {
            ws.send(JSON.stringify({ type: "error", message: e.message }));
        }
    }

    /**
     * Trigger Simulation (In production, this would be a timer-based event)
     */
    async handleTriggerSiege(ws, request) {
        try {
            const result = await siegeService.simulateSiege(request.siegeId);
            ws.send(JSON.stringify({ 
                type: "siege_finished", 
                winnerId: result.winnerId, 
                score: result.score 
            }));
        } catch (e) {
            ws.send(JSON.stringify({ type: "error", message: e.message }));
        }
    }
}

module.exports = new SiegeHandler();
