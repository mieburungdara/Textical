const factory = require('./sim/BotFactory');
const SimRunner = require('./sim/SimRunner');
const prisma = require('../db');

async function executeMassSimulation() {
    console.log("--------------------------------------------------");
    console.log("🏙️ STARTING MASS WORLD SIMULATION (100 BOTS)");
    console.log("--------------------------------------------------\n");

    // 1. Prepare Population
    await factory.cleanupBots();
    const bots = await factory.spawnBots(100);

    const runner = new SimRunner(bots);

    // 2. Run Simulation for 24 "Hours"
    for (let h = 1; h <= 24; h++) {
        await runner.runHour(h);
    }

    // 3. Collect Reports
    console.log("\n--------------------------------------------------");
    console.log("📊 SIMULATION COMPLETE - COLLECTING DATA");
    console.log("--------------------------------------------------\n");

    const totalSilver = await prisma.user.aggregate({ _sum: { silver: true } });
    const totalItems = await prisma.inventoryItem.count();
    const totalListings = await prisma.marketOrder.count({ where: { status: "OPEN" } });
    const totalExtractions = await prisma.regionalExtractionStats.aggregate({ _sum: { volume24h: true } });

    console.log(`🌍 World Economy Status:`);
    console.log(`   - Total Silver in Circulation: ${totalSilver._sum.silver}`);
    console.log(`   - Total Items in Inventories: ${totalItems}`);
    console.log(`   - Total Market Listings: ${totalListings}`);
    console.log(`   - Total Resource Extraction: ${totalExtractions._sum.volume24h || 0} units.`);

    // 4. Report Final Verdict
    console.log("\n🌟 FINAL VERDICT: SIMULATION SUCCESSFUL.");
    console.log("   Identifying gaps based on bot throughput...");
    
    if (totalListings === 0) console.log("   ⚠️ GAP DETECTED: Market friction high - bots not listing enough.");
    if (totalItems > 1000) console.log("   ⚠️ GAP DETECTED: Inventory bloat - need better silver sink/salvage.");

    console.log("\n--------------------------------------------------");
}

executeMassSimulation().catch(err => console.error(err));
