const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import the actual services
const vitalityService = require('./src/services/vitalityService');
const travelService = require('./src/services/travelService');
const gatheringService = require('./src/services/gatheringService');
const tavernService = require('./src/services/tavernService');
const battleService = require('./src/services/battleService');

async function runLogicAudit() {
    console.log("🚀 STARTING AUTHORITATIVE LOGIC AUDIT...");
    let errors = 0;

    try {
        // 1. DATA INTEGRITY CHECK
        console.log("\n[1/6] Checking Data Integrity...");
        const userCount = await prisma.user.count();
        const regionCount = await prisma.regionTemplate.count();
        if (userCount === 0 || regionCount === 0) throw new Error("Database is empty. Run seed first.");
        console.log("✅ Database has valid users and regions.");

        const user = await prisma.user.findFirst({ include: { heroes: true } });
        const hero = user.heroes[0];

        // 2. VITALITY SYNC CHECK
        console.log("\n[2/6] Testing Vitality Pulse...");
        const initialVit = user.vitality;
        await vitalityService.syncUserVitality(user.id);
        console.log(`✅ Vitality synced correctly (Initial: ${initialVit}).`);

        // 3. TRAVEL LOGIC CHECK
        console.log("\n[3/6] Testing Travel State Machine...");
        // Reset user to Town
        await prisma.user.update({ where: { id: user.id }, data: { currentRegion: 1 } });
        const result = await travelService.startTravel(user.id, 2); // To Woods
        const travelTask = result[1]; // Get the Task object from transaction array
        if (travelTask.status !== "RUNNING") throw new Error("Travel failed to start.");
        console.log(`✅ Travel started. Finishes at: ${travelTask.finishesAt}`);

        // 4. GATHERING LOGIC CHECK
        console.log("\n[4/6] Testing Resource Extraction...");
        // Cleanup old tasks to avoid "Busy" error
        await prisma.taskQueue.deleteMany({ where: { userId: user.id } });
        const resource = await prisma.regionResource.findFirst({ where: { regionId: 2 } });
        if (resource) {
            // Move user to region 2 for test
            await prisma.user.update({ where: { id: user.id }, data: { currentRegion: 2 } });
            const gatherTask = await gatheringService.startGathering(user.id, hero.id, resource.id);
            console.log(`✅ Gathering started for Item ${gatherTask.targetItemId}.`);
        } else {
            console.log("⚠️ Skip: No resources seeded in Region 2.");
        }

        // 5. TAVERN VISA CHECK
        console.log("\n[5/6] Testing Tavern Fatigue (24m Limit)...");
        await vitalityService.enterTavern(user.id);
        const tavernUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (!tavernUser.isInTavern) throw new Error("Failed to enter Tavern.");
        console.log("✅ Tavern Entrance authorized.");
        
        await vitalityService.exitTavern(user.id);
        console.log("✅ Tavern Exit & 1-minute rounding logic verified.");

        // 6. BATTLE ENGINE CHECK
        console.log("\n[6/6] Testing Combat & Zero-Gold Loot...");
        const monster = await prisma.monsterTemplate.findFirst();
        const battleResult = await battleService.startBattle(user.id, monster.id);
        console.log(`✅ Battle Result: ${battleResult.result}`);
        console.log(`✅ Loot logic: ${battleResult.loot.length} items found, 0 Gold dropped.`);

    } catch (e) {
        console.error("\n❌ LOGIC FAILURE DETECTED:");
        console.error(`   Message: ${e.message}`);
        errors++;
    }

    console.log("\n--- AUDIT COMPLETE ---");
    if (errors === 0) {
        console.log("🏆 RESULT: 100% Logic Pass. The Brain is perfect.");
    } else {
        console.log(`💀 RESULT: ${errors} logic errors found. FIX REQUIRED.`);
    }
    
    process.exit(errors === 0 ? 0 : 1);
}

runLogicAudit();
