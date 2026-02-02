const factory = require('./OracleFactory');
const OracleRunner = require('./OracleRunner');
const prisma = require('../src/db');

async function launchMarathon() {
    console.log("==================================================");
    console.log("🏃 ELDORIA SUPER-AGENT MARATHON (10 BOTS)");
    console.log("   Simulasi End-to-End Player Progression");
    console.log("==================================================\n");

    const BOT_COUNT = 10;
    const SIM_HOURS = 50; // Requested duration 50 hours

    // 1. Initialize Population using the Factory
    await factory.cleanupBots();
    
    // We'll use the standard factory but force SUPER_AGENT archetype for this test
    const bots = await factory.spawnBots(BOT_COUNT);
    bots.forEach(b => b.archetype = "SUPER_AGENT");

    const runner = new OracleRunner(bots);

    // 2. Execute Time Progression
    for (let h = 1; h <= SIM_HOURS; h++) {
        await runner.runHour(h);
        
        if (h % 20 === 0) {
            const stats = await prisma.hero.aggregate({ 
                where: { id: { gte: 1000, lte: 1000 + BOT_COUNT } },
                _avg: { unitLevel: true },
                _max: { unitLevel: true }
            });
            console.log(`\n📢 SNAPSHOT HOUR ${h}: Avg Lv ${Math.round(stats._avg.unitLevel || 1)}, Max Lv ${stats._max.unitLevel || 1}`);
        }
    }

    // 3. Final Performance Audit
    console.log("\n--------------------------------------------------");
    console.log("📊 MARATHON FINAL REPORT");
    console.log("--------------------------------------------------\n");

    const finalBots = await prisma.user.findMany({
        where: { username: { startsWith: "Bot_" } },
        include: { heroes: true, inventory: { include: { template: true } } }
    });

    for (const b of finalBots) {
        const hero = b.heroes[0];
        const gearCount = b.inventory.filter(i => i.template.category === "EQUIPMENT").length;
        console.log(`👤 ${b.username}:`);
        console.log(`   - Level: ${hero.unitLevel}`);
        console.log(`   - Silver: ${b.silver}`);
        console.log(`   - Inventory: ${b.inventory.length} items (${gearCount} Gear)`);
    }

    console.log("\n🌟 MARATHON COMPLETE.");
    console.log("==================================================");
}

launchMarathon().catch(err => {
    console.error("❌ MARATHON CRASHED:", err);
});