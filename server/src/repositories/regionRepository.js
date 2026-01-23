const worldData = require('../data/world.json');

class RegionRepository {
    getRegion(id) {
        return worldData.regions[id] || null;
    }

    getAllRegions() {
        return worldData.regions;
    }
}

module.exports = new RegionRepository();
