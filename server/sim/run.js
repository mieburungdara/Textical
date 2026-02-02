const factory = require('./OracleFactory');
const OracleRunner = require('./OracleRunner');
const prisma = require('../src/db');

async function launchOracle() {
    console.log("==================================================");
    console.log("🔮 ELDORIA WORLD ORACLE (EWO)");
    console.log("   Simulasi Masa Depan Eldoria");
    console.log("==================================================\n");

    const BOT_COUNT = 100;
    const SIM_HOURS = 24;

    // 1. Initialize Population
    await factory.cleanupBots();
    const bots = await factory.spawnBots(BOT_COUNT);

    const runner = new OracleRunner(bots);

    // 2. Execute Time Progression
    for (let h = 1; h <= SIM_HOURS; h++) {
        await runner.runHour(h);
    }

    // 3. Collect Predictive Data
    console.log("\n--------------------------------------------------");
    console.log("📊 ORACLE ANALYSIS REPORT");
    console.log("--------------------------------------------------\n");

    const stats = await prisma.user.aggregate({ _sum: { silver: true } });
    const items = await prisma.inventoryItem.count();
    const activeListings = await prisma.marketOrder.count({ where: { status: "OPEN" } });
    const extractions = await prisma.regionalExtractionStats.aggregate({ _sum: { volume24h: true } });

    console.log(`🌍 Current World Metric Predictions:`);
    console.log(`   - Silver Velocity: ${stats._sum.silver} units in circulation.`);
    console.log(`   - Resource Throughput: ${extractions._sum.volume24h || 0} units extracted.`);
    console.log(`   - Inventory Pressure: ${items} items stored.`);
    console.log(`   - Market Activity: ${activeListings} active trade orders.`);

    // 4. Recommendation Logic
    console.log("\n💡 ORACLE RECOMMENDATIONS:");
    if (activeListings === 0) {
        console.log("   ❌ CRITICAL: Market is stagnating. Reduce listing fees or increase material scarcity.");
    }
    if (items > 1000) {
        console.log("   ⚠️ WARNING: Inventory bloat detected. Implement item salvaging sinks immediately.");
    }

    console.log("\n==================================================");
}

launchOracle().catch(err => {
    console.error("❌ ORACLE CRASHED:", err);
});
