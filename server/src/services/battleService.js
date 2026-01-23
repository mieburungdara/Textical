const BattleSimulation = require('../logic/battleSimulation');
const StatProcessor = require('../logic/statProcessor');
const monsters = require('../data/monsters.json');

class BattleService {
    async runSimulation(party) {
        const sim = new BattleSimulation(8, 10);
        // Terrain setup
        for (let x = 3; x <= 4; x++) for (let y = 4; y <= 6; y++) sim.grid.terrainGrid[y][x] = 3; 

        party.forEach((h, index) => {
            const finalStats = StatProcessor.calculateHeroStats(h);
            sim.addUnit({ ...h, instance_id: `p_hero_${h.id || index}` }, 0, { x: 1, y: 3 + (index * 2) }, finalStats);
        });

        const enemyBlueprint = monsters["mob_orc"];
        for (let i = 0; i < 2; i++) {
            const stats = StatProcessor.calculateHeroStats(enemyBlueprint);
            sim.addUnit({ ...enemyBlueprint, instance_id: `e_orc_${i}`, race: "orc" }, 1, { x: 6, y: 4 + (i * 2) }, stats);
        }

        return sim.run();
    }
}

module.exports = new BattleService();
