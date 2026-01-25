const axios = require('axios'); // We need axios or http
// Since I can't npm install easily, I'll use built-in http, 
// OR I'll just run the server and use a node script with fetch (Node 18+)

async function testAPI() {
    const BASE = 'http://localhost:3000/api';
    
    // Wait for server to start? I'll assume I run this separately or spawn it.
    // For this environment, I'll just check if I can require the app? 
    // No, integration test is best via HTTP.
    
    console.log("--- API SMOKE TEST ---");
    
    try {
        // 1. Login
        console.log("1. Login...");
        const loginRes = await fetch(`${BASE}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username: 'player1' })
        });
        const user = await loginRes.json();
        
        if (!user.id) throw new Error("Login failed");
        console.log(`Logged in as ID ${user.id}`);

        // 2. Get Inventory
        console.log("2. Get Inventory...");
        const invRes = await fetch(`${BASE}/user/${user.id}/inventory`);
        const inv = await invRes.json();
        console.log(`Inventory Items: ${inv.items.length}`);

        // 3. Check Quests
        console.log("3. Check Quests...");
        const questRes = await fetch(`${BASE}/quests/${user.id}`);
        const quests = await questRes.json();
        console.log(`Active Quests: ${quests.length}`);

        console.log("✅ API is responding correctly.");

    } catch (e) {
        console.error("❌ API Test Failed:", e.message);
        // If fetch failed, server might not be running.
    }
}

// I will run the server in background then run this test.
testAPI();
