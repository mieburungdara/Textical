const WebSocket = require('ws');

const SERVER_URL = 'ws://localhost:3000';
const NUM_CLIENTS = 50; // Jumlah pemain simulasi

console.log(`Starting Stress Test: Spawning ${NUM_CLIENTS} virtual players...`);

for (let i = 0; i < NUM_CLIENTS; i++) {
    const client = new WebSocket(SERVER_URL);
    const clientId = `Player_${i}`;

    client.on('open', () => {
        // console.log(`[${clientId}] Connected.`);
        
        // Request battle immediately
        client.send(JSON.stringify({
            type: "start_battle",
            party: [
                { id: "Novice", name: clientId, pos: {x: 1, y: i % 10}, hp_base: 100, damage_base: 10, speed_base: 5, range_base: 1 }
            ]
        }));
    });

    client.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === "battle_replay") {
            console.log(`[${clientId}] Battle finished. Winner Team: ${msg.winner}. Logs received: ${msg.logs.length}`);
            client.close(); // Close after receiving result
        }
    });

    client.on('error', (err) => {
        console.error(`[${clientId}] Error:`, err.message);
    });
}
