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
                const players_with_stats = [];
                const enemies_with_stats = [];

                request.party.forEach((heroData, index) => {
                    const instId = `${heroData.id}_p${index}`;
                    const procResult = StatProcessor.calculateHeroStats(heroData);
                    sim.addUnit({ ...heroData, instance_id: instId, traits: procResult.all_traits }, 0, heroData.pos, procResult.final_stats);
                    players_with_stats.push({ ...heroData, instance_id: instId, final_stats: procResult.final_stats });
                });

                const enemyId = "mob_orc";
                const enemyBlueprint = monsters[enemyId];
                if (enemyBlueprint) {
                    for (let i = 0; i < 2; i++) {
                        const instId = `${enemyId}_e${i}`;
                        const pos = { x: 6, y: 4 + (i * 2) };
                        const procResult = StatProcessor.calculateHeroStats(enemyBlueprint);
                        sim.addUnit({ ...enemyBlueprint, id: enemyId, instance_id: instId, traits: procResult.all_traits }, 1, pos, procResult.final_stats);
                        enemies_with_stats.push({ id: enemyId, instance_id: instId, pos: pos, final_stats: procResult.final_stats });
                    }
                }

                const result = sim.run();

                ws.send(JSON.stringify({
                    type: "battle_replay",
                    winner: result.winner,
                    logs: result.logs,
                    rewards: result.rewards, // FIXED: Use rewards from simulation logic
                    killed_monsters: result.killed_monsters,
                    initial_state: { players: players_with_stats, enemies: enemies_with_stats }
                }));
            }
        } catch (err) {
            console.error("Critical Server Error:", err);
        }
    });
});