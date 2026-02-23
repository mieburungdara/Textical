const conflictService = require('../services/faction/ConflictEventService');
const worldSpawner = require('../services/worldSpawnerService');
const prisma = require('../db');

async function runConflictAudit() {
    console.log("--------------------------------------------------");
    console.log("⚔️ STARTING REGIONAL CONFLICT MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const regionId = 1;
    const empireId = 1;
    const rebelId = 2;

    // 0. Setup: War Status and Influence Parity
    console.log("[0/4] Preparing warring factions and influence parity...");
    await prisma.factionRelation.upsert({
        where: { factionAId_factionBId: { factionAId: 1, factionBId: 2 } },
        update: { status: "WAR" },
        create: { factionAId: 1, factionBId: 2, status: "WAR" }
    });

    // Set high parity (3000 vs 2800)
    await prisma.regionalInfluence.upsert({
        where: { factionId_regionId: { factionId: empireId, regionId } },
        update: { points: 3000 },
        create: { factionId: empireId, regionId, points: 3000 }
    });
    await prisma.regionalInfluence.upsert({
        where: { factionId_regionId: { factionId: rebelId, regionId } },
        update: { points: 2800 },
        create: { factionId: rebelId, regionId, points: 2800 }
    });

    // Ensure Skirmish Template exists
    await prisma.worldEventTemplate.upsert({
        where: { id: 10 },
        update: { name: "Frontline Skirmish" },
        create: { id: 10, name: "Frontline Skirmish", description: "War is here." }
    });

    await prisma.activeEvent.deleteMany({ where: { regionId, templateId: 10 } });

    // 1. Run Conflict Check
    console.log("[1/4] Running Conflict Service check...");
    await conflictService.checkAndTriggerConflicts();
    
    const active = await prisma.activeEvent.findFirst({
        where: { regionId, templateId: 10 }
    });
    console.log(`   Active Conflict Event: ${active ? 'YES' : 'NO'} (Expected: YES)`);

    // 2. Verify Spawning Logic
    console.log("[2/4] Verifying military unit spawning...");
    const monsters = await worldSpawner.getAvailableMonsters(regionId);
    const skirmishers = monsters.filter(m => m.instanceId && m.instanceId.startsWith('frontline'));
    
    console.log(`   Frontline Units Found: ${skirmishers.length} (Expected: 2)`);
    skirmishers.forEach(s => console.log(`      Spawned: ${s.name} (Faction: ${s.factionId})`));

    // 3. Final Verification
    console.log("[3/4] Testing parity-gap sensitivity...");
    // Update parity to exceed gap (3000 vs 1500)
    await prisma.regionalInfluence.update({
        where: { factionId_regionId: { factionId: rebelId, regionId } },
        data: { points: 1500 }
    });
    
    // Cleanup event
    await prisma.activeEvent.deleteMany({ where: { regionId, templateId: 10 } });
    
    await conflictService.checkAndTriggerConflicts();
    const activeAfter = await prisma.activeEvent.findFirst({
        where: { regionId, templateId: 10 }
    });
    console.log(`   Active after gap increase: ${activeAfter ? 'YES' : 'NO'} (Expected: NO)`);

    // VERDICT
    if (active && skirmishers.length === 2 && !activeAfter) {
        console.log("\n🌟 FINAL VERDICT: REGIONAL CONFLICT SYSTEM PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: CONFLICT LOGIC FAILURE.");
    }

    // Cleanup
    await prisma.activeEvent.deleteMany({ where: { regionId, templateId: 10 } });
    console.log("\n--------------------------------------------------");
}

runConflictAudit().catch(err => console.error(err));
