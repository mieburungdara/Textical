const vitalityService = require('./src/services/vitalityService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    console.log("--- TESTING VITALITY SERVICE ---");
    const user = await prisma.user.findFirst();
    if (!user) return console.log("No user found. Run seed first.");

    // 1. Enter Tavern
    console.log("1. Entering Tavern...");
    await vitalityService.enterTavern(user.id);
    
    // 2. Wait 2 seconds
    console.log("2. Waiting 2 seconds (Simulating short visit)...");
    await new Promise(r => setTimeout(r, 2000));

    // 3. Exit Tavern (Should round to 60s)
    console.log("3. Exiting Tavern...");
    const updated = await vitalityService.exitTavern(user.id);
    
    console.log(`Initial Tavern Time: ${user.tavernTimeSecondsToday}s`);
    console.log(`Updated Tavern Time: ${updated.tavernTimeSecondsToday}s (Expected increase of 60s)`);

    if (updated.tavernTimeSecondsToday - user.tavernTimeSecondsToday === 60) {
        console.log("✅ SUCCESS: 1-minute minimum rule enforced.");
    } else {
        console.log("❌ FAILURE: Rounding logic failed.");
    }

    process.exit();
}

test();
