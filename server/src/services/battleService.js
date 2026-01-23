const BattleSimulation = require('../logic/battleSimulation');
const statService = require('./statService');
const mapService = require('./mapService'); // NEW
const monsters = require('../data/monsters.json');

class BattleService {
    async runSimulation(party, dungeonId = "default") {
        const sim = new BattleSimulation(8, 10);
        
        // 1. Generate Modular Map
        sim.grid.terrainGrid = mapService.generateMap(sim.width, sim.height, dungeonId);

        // 2. Add Players
        party.forEach((h, index) => {
            const finalStats = statService.calculateHeroStats(h);
            sim.addUnit({ ...h, instance_id: `p_hero_${h.id || index}` }, 0, { x: 1, y: 3 + (index * 2) }, finalStats);
        });

        // 3. Add Enemies
        const enemyBlueprint = monsters["mob_orc"];
        for (let i = 0; i < 2; i++) {
            const stats = statService.calculateHeroStats(enemyBlueprint);
            sim.addUnit({ ...enemyBlueprint, instance_id: `e_orc_${i}`, race: "orc" }, 1, { x: 6, y: 4 + (i * 2) }, stats);
        }

        return sim.run();
    }
}

module.exports = new BattleService();