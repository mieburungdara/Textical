const prisma = require('../db');

async function verifyGunnerPath() {
    console.log("--------------------------------------------------");
    console.log("🎯 VERIFYING ARCHER -> SNIPER -> GUNNER PATH");
    console.log("--------------------------------------------------\n");

    // 1. Verify Archer (T1)
    const archer = await prisma.classTemplate.findUnique({ where: { id: 1107 } });
    console.log(`   Tier 1: ${archer.name} (ID: ${archer.id})`);

    // 2. Verify Sniper (T2)
    const sniper = await prisma.classTemplate.findFirst({ where: { parentClassId: 1107, name: "Sniper" } });
    console.log(`   Tier 2: ${sniper.name} (ID: ${sniper.id}, Parent: ${sniper.parentClassId})`);

    // 3. Verify Gunner (T3)
    const gunner = await prisma.classTemplate.findFirst({ where: { parentClassId: sniper.id, tier: 3 } });
    console.log(`   Tier 3: ${gunner.name} (ID: ${gunner.id}, Parent: ${gunner.parentClassId})`);

    if (archer.name === "Archer" && sniper && gunner.name === "Gunner") {
        console.log("\n✅ GUNNER PATH VERIFIED: Hierarchy is logically sound.");
    } else {
        console.log("\n❌ HIERARCHY BUG DETECTED.");
    }
}

verifyGunnerPath().catch(err => console.error(err));
