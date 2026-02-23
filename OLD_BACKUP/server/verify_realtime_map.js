const { io } = require("socket.io-client");
const axios = require("axios");

const BASE_URL = "http://localhost:5000";
const ADMIN_TOKEN = "textical-admin-2024";

async function runTest() {
    console.log("🚀 Starting Real-time Map Verification...");

    // 1. Connect Socket
    const socket = io(BASE_URL);

    socket.on("connect", () => {
        console.log("✅ Socket connected. ID:", socket.id);
        
        // Subscribe to map updates
        socket.emit("admin:map:subscribe");
        console.log("📡 Subscribed to admin:map_updates");
    });

    socket.on("map:weather_update", (data) => {
        console.log("🌤️ Weather Update Received:", data.regions ? Object.keys(data.regions).length + " regions updated" : "No regions");
    });

    socket.on("map:density_update", (data) => {
        console.log("👥 Player Density Update Received:", data.counts);
    });

    socket.on("map:npc_update", (data) => {
        console.log("🚶 NPC Update Received:", data.npcs.length + " NPCs found");
    });

    socket.on("map:elite_boss_update", (data) => {
        console.log("👾 Elite Boss Update Received:", data.bosses.length + " bosses active");
    });

    // 2. Test REST Endpoints
    try {
        const endpoints = [
            "/api/admin/regions/weather-snapshot",
            "/api/admin/regions/npc-snapshot",
            "/api/admin/regions/elite-boss-snapshot",
            "/api/admin/regions/player-density"
        ];

        for (const endpoint of endpoints) {
            console.log(`\n🔍 Testing REST endpoint: ${endpoint}`);
            const res = await axios.get(`${BASE_URL}${endpoint}`, {
                headers: { "x-admin-token": ADMIN_TOKEN }
            });
            console.log(`📊 Response: Success=${res.data.success}, Data size=${JSON.stringify(res.data.data).length} chars`);
        }

    } catch (err) {
        console.error("❌ REST Test Failed:", err.message);
    }

    // Wait for some socket updates
    console.log("\n⏳ Waiting 15 seconds for socket broadcasts...");
    setTimeout(() => {
        console.log("\n🏁 Verification script finished.");
        socket.disconnect();
        process.exit(0);
    }, 15000);
}

runTest().catch(console.error);
