const userRepository = require('../repositories/userRepository');
const regionRepository = require('../repositories/regionRepository');
const locationService = require('../services/locationService');

class WorldHandler {
    async handleTravel(ws, request) {
        try {
            const user = await userRepository.findByUsername(request.account);
            await locationService.travel(user, request.targetRegion);
            
            // Send back full updated data
            const updatedUser = await userRepository.findByUsername(request.account);
            const regionData = regionRepository.getRegion(updatedUser.currentRegion);
            
            ws.send(JSON.stringify({ 
                type: "login_success", 
                user: updatedUser,
                region_data: regionData 
            }));
        } catch (e) {
            ws.send(JSON.stringify({ type: "error", message: e.message }));
        }
    }

    async getRegionInfo(ws, regionId) {
        const data = regionRepository.getRegion(regionId);
        ws.send(JSON.stringify({ type: "region_update", data }));
    }
}

module.exports = new WorldHandler();
