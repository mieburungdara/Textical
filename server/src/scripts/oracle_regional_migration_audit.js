const factory = require('../../sim/OracleFactory');
const OracleRunner = require('../../sim/OracleRunner');
const prisma = require('../db');

async function runRegionalMigrationAudit() {
    console.log("--------------------------------------------------");
    console.log("✈️ STARTING REGIONAL MIGRATION AUDIT");
    console.log("--------------------------------------------------\n");

    // 0. Setup: Town A (1) and Town B (2)
    console.log("[0/3] Configuring regions...");
    await prisma.regionTemplate.upsert({
        where: { id: 1 },
        update: { specialization: null, regionalTaxRate: 0.15 },
        create: { id: 1, name: "Default Town", description: "A", visualType: "TOWN" }
    });
    await prisma.regionTemplate.upsert({
        where: { id: 2 },
        update: { specialization: "BLACKSMITH_HUB", regionalTaxRate: 0.15 },
        create: { id: 2, name: "Blacksmith Hub", description: "B", visualType: "TOWN" }
    });

    // Connect them (Bi-directional)
    await prisma.regionConnection.upsert({
        where: { originRegionId_targetRegionId: { originRegionId: 1, targetRegionId: 2 } },
        update: {},
        create: { originRegionId: 1, targetRegionId: 2 }
    });
    await prisma.regionConnection.upsert({
        where: { originRegionId_targetRegionId: { originRegionId: 2, targetRegionId: 1 } },
        update: {},
        create: { originRegionId: 2, targetRegionId: 1 }
    });

    // 1. Spawn Crafter Bots in Region 1
    await factory.cleanupBots();
    const bots = [];
    console.log("[1/3] Spawning 10 CRAFTER bots in Default Town...");
    for (let i = 1; i <= 10; i++) {
        const username = `Audit_Crafter_${i}`;
        const user = await prisma.user.upsert({
            where: { username },
            update: { currentRegion: 1, vitality: 100 },
            create: { username, password: "pw", currentRegion: 1, silver: 5000 }
        });
        await prisma.hero.upsert({
            where: { id: 2000 + i },
            update: { userId: user.id },
            create: { id: 2000 + i, userId: user.id, name: `Hero_${i}`, unitLevel: 1, classId: 1001 }
        });
        bots.push({ userId: user.id, archetype: "CRAFTER" });
    }

    // 2. Run Simulation Hour
    console.log("\n[2/3] Running Oracle simulation tick...");
    const runner = new OracleRunner(bots);
    await runner.runHour(1);

    // 3. Verify Migration
    const migrated = await prisma.user.count({
        where: { username: { startsWith: "Audit_Crafter_" }, currentRegion: 2 }
    });

    console.log(`\n[3/3] Migration Results:`);
    console.log(`   Bots moved to Blacksmith Hub: ${migrated}/10`);

    // VERDICT
    if (migrated > 0) {
        console.log("\n🌟 FINAL VERDICT: REGIONAL AI MIGRATION PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: BOTS REFUSE TO MOVE.");
    }

    console.log("\n--------------------------------------------------");
}

runRegionalMigrationAudit().catch(err => console.error(err));
