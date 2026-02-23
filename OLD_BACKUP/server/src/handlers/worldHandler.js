const userRepository = require('../repositories/userRepository');
const regionRepository = require('../repositories/regionRepository');
const locationService = require('../services/locationService');
const ErrorCodes = require('../constants/ErrorCodes');

class WorldHandler {
    async handleTravel(ws, request) {
        try {
            if (!request.account) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.AUTH_USER_NOT_FOUND,
                    message: "Account is required" 
                }));
                return;
            }
            
            if (!request.targetRegion) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.TRAVEL_INVALID_REGION,
                    message: "targetRegion is required" 
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
            ws.send(JSON.stringify({ 
                type: "error", 
                code: ErrorCodes.INVALID_INPUT,
                message: e.message 
            }));
        }
    }

    async getRegionInfo(ws, regionId) {
        try {
            if (!regionId) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.TRAVEL_INVALID_REGION,
                    message: "regionId is required" 
                }));
                return;
            }
            
            const data = regionRepository.getRegion(regionId);
            if (!data) {
                ws.send(JSON.stringify({ 
                    type: "error", 
                    code: ErrorCodes.TRAVEL_INVALID_REGION,
                    message: "Region not found" 
                }));
                return;
            }
            
            ws.send(JSON.stringify({ type: "region_update", data }));
        } catch (e) {
            ws.send(JSON.stringify({ 
                type: "error", 
                code: ErrorCodes.INVALID_INPUT,
                message: e.message 
            }));
        }
    }
}

module.exports = new WorldHandler();
