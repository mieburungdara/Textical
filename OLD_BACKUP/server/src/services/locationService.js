const userRepository = require('../repositories/userRepository');
const regionRepository = require('../repositories/regionRepository');

class LocationService {
    async travel(user, targetRegionId) {
        const currentRegion = regionRepository.getRegion(user.currentRegion);
        
        // AAA Validation: Can only travel to connected regions
        if (!currentRegion.connections.includes(targetRegionId)) {
            throw new Error(`Cannot travel to ${targetRegionId} from ${user.currentRegion}`);
        }

        // Update DB
        return await userRepository.updateLocation(user.id, targetRegionId);
    }
}

module.exports = new LocationService();
