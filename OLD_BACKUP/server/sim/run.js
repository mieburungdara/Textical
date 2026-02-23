const factory = require('./OracleFactory');
const OracleRunner = require('./OracleRunner');
const prisma = require('../src/db');

async function launchOracle() {
    console.log("==================================================");
    console.log("🔮 ELDORIA WORLD ORACLE (EWO)");
    console.log("   Simulasi Masa Depan Eldoria");
    console.log("==================================================\n");

    const BOT_COUNT = 50;
    const SIM_HOURS = 100;

    // 1. Initialize Population
    await factory.cleanupBots();
    const bots = await factory.spawnBots(BOT_COUNT);

    const runner = new OracleRunner(bots);

    // 1.5 Setup Regional Network for Migration
    console.log("🗺️  Establishing regional trade routes...");
    await prisma.regionTemplate.upsert({
        where: { id: 2 },
        update: { specialization: "BLACKSMITH_HUB", regionalTaxRate: 0.15, zoneType: "BLUE" },
        create: { id: 2, name: "Master Forge Hub", description: "B", visualType: "TOWN", specialization: "BLACKSMITH_HUB", zoneType: "BLUE" }
    });
    // Add a RED ZONE for elite bots
    await prisma.regionTemplate.upsert({
        where: { id: 3 },
        update: { specialization: null, regionalTaxRate: 0.25, zoneType: "RED" },
        create: { id: 3, name: "The Badlands", description: "C", visualType: "FOREST", zoneType: "RED" }
    });

    await prisma.regionConnection.upsert({
        where: { originRegionId_targetRegionId: { originRegionId: 1, targetRegionId: 2 } },
        update: {},
        create: { originRegionId: 1, targetRegionId: 2 }
    });
    await prisma.regionConnection.upsert({
        where: { originRegionId_targetRegionId: { originRegionId: 2, targetRegionId: 3 } },
        update: {},
        create: { originRegionId: 2, targetRegionId: 3 }
    });

    const startRegions = await prisma.user.groupBy({
        by: ['currentRegion'],
        where: { id: { in: bots.map(b => b.userId) } },
        _count: true
    });

    // 2. Execute Time Progression
    for (let h = 1; h <= SIM_HOURS; h++) {
        await runner.runHour(h);
    }

    // 3. Collect Predictive Data
    console.log("\n--------------------------------------------------");
    console.log("📊 ORACLE ANALYSIS REPORT (50 PROFESSIONAL BOTS)");
    console.log("--------------------------------------------------\n");

    const stats = await prisma.user.aggregate({ _sum: { silver: true } });
    const items = await prisma.inventoryItem.count();
    const activeListings = await prisma.marketOrder.count({ where: { status: "OPEN" } });
    const extractions = await prisma.regionalExtractionStats.aggregate({ _sum: { volume24h: true } });
    
    const endRegions = await prisma.user.groupBy({
        by: ['currentRegion'],
        where: { id: { in: bots.map(b => b.userId) } },
        _count: true
    });

    const redZoneCount = endRegions.find(r => r.currentRegion === 3)?._count || 0;
    const avgLevel = await prisma.hero.aggregate({ _avg: { unitLevel: true }, where: { id: { gte: 1000 } } });
    const maxLevel = await prisma.hero.aggregate({ _max: { unitLevel: true }, where: { id: { gte: 1000 } } });

    console.log(`🌍 Current World Metric Predictions:`);
    console.log(`   - Silver Velocity: ${stats._sum.silver} units in circulation.`);
    console.log(`   - Resource Throughput: ${extractions._sum.volume24h || 0} units extracted.`);
    console.log(`   - Inventory Pressure: ${items} items stored.`);
    console.log(`   - Market Activity: ${activeListings} active trade orders.`);
    console.log(`   - Regional Migration: ${redZoneCount} elites reached the RED ZONE.`);
    console.log(`   - Population Growth: Avg Lv ${Math.round(avgLevel._avg.unitLevel)}, Max Lv ${maxLevel._max.unitLevel}.`);

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
