const WebSocket = require('ws');
const BattleSimulation = require('./logic/battleSimulation');
const StatProcessor = require('./logic/statProcessor');
const monsters = require('./data/monsters.json');

const wss = new WebSocket.Server({ port: 3000 });

console.log("Textical Authoritative Server Active on ws://localhost:3000");

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        try {
            const request = JSON.parse(message);
            
            if (request.type === "start_battle") {
                const sim = new BattleSimulation(8, 10);
                
                // --- TERRAIN GENERATION (Example: Create a Lava Pit in the middle) ---
                for (let x = 3; x <= 4; x++) {
                    for (let y = 4; y <= 6; y++) {
                        sim.grid.terrainGrid[y][x] = 3; // LAVA
                    }
                }
                // Add some forest cover
                sim.grid.terrainGrid[2][1] = 5; 
                sim.grid.terrainGrid[7][1] = 5;

                const players_with_stats = [];
                const enemies_with_stats = [];

                // 1. Setup Players
                request.party.forEach((heroData, index) => {
                    const instId = `${heroData.id}_p${index}`;
                    const finalStats = StatProcessor.calculateHeroStats(heroData);
                    sim.addUnit({ ...heroData, instance_id: instId }, 0, heroData.pos, finalStats);
                    players_with_stats.push({ ...heroData, instance_id: instId, final_stats: finalStats });
                });

                // 2. Setup Enemies
                const enemyId = "mob_orc";
                const enemyBlueprint = monsters[enemyId];
                for (let i = 0; i < 2; i++) {
                    const instId = `${enemyId}_e${i}`;
                    const pos = { x: 6, y: 4 + (i * 2) };
                    const stats = StatProcessor.calculateHeroStats(enemyBlueprint);
                    sim.addUnit({ ...enemyBlueprint, instance_id: instId }, 1, pos, stats);
                    enemies_with_stats.push({ id: enemyId, instance_id: instId, pos: pos, final_stats: stats });
                }

                const result = sim.run();

                // 3. Dispatch with TERRAIN DATA (CRITICAL FIX)
                ws.send(JSON.stringify({
                    type: "battle_replay",
                    winner: result.winner,
                    logs: result.logs,
                    terrain_grid: sim.grid.terrainGrid, // Send the map!
                    initial_state: {
                        players: players_with_stats,
                        enemies: enemies_with_stats
                    }
                }));
            }
        } catch (err) {
            console.error("Server Logic Error:", err);
        }
    });
});
