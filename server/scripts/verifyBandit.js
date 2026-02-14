const prisma = require('../src/db');
const banditService = require('../src/services/BanditService');
const travelService = require('../src/services/travelService');
const escortService = require('../src/services/EscortService');
const marketService = require('../src/services/marketService');

async function verifyBanditSystem() {
    console.log("=== STARTING BANDIT SYSTEM VERIFICATION ===");

    // 0. Setup Prerequisites (Templates)
    let tier = await prisma.premiumTierTemplate.findFirst();
    if (!tier) {
        tier = await prisma.premiumTierTemplate.create({
            data: { name: "Free" }
        });
    }

    let startRegion = await prisma.regionTemplate.findUnique({ where: { id: 1 } });
    if (!startRegion) {
        startRegion = await prisma.regionTemplate.create({
            data: { id: 1, name: "Starting City", description: "The beginning.", zoneType: "GREEN" }
        });
    }

    let targetRegion = await prisma.regionTemplate.findUnique({ where: { id: 999 } });
    if (!targetRegion) {
        targetRegion = await prisma.regionTemplate.create({
            data: { 
                id: 999, 
                name: "Bandit Peak", 
                description: "Danger zone.", 
                banditThreatLevel: 1.0, 
                zoneType: "RED" 
            }
        });
    } else {
        await prisma.regionTemplate.update({
            where: { id: 999 },
            data: { banditThreatLevel: 1.0 }
        });
    }
    
    // Connect region 1 to 999
    await prisma.regionConnection.upsert({
        where: { originRegionId_targetRegionId: { originRegionId: 1, targetRegionId: 999 } },
        update: {},
        create: { originRegionId: 1, targetRegionId: 999, travelTimeSeconds: 1 }
    });

    // 1. Setup Test User
    await prisma.taskQueue.deleteMany({ where: { username: "bandit_tester" } }).catch(() => {});
    await prisma.taskQueue.deleteMany({ where: { userId: 1 } }).catch(() => {});

    const user = await prisma.user.upsert({
        where: { username: "bandit_tester" },
        update: { 
            silver: 1000, 
            banditReputation: 0.0, 
            escortGridsRemaining: 0,
            activeEscortName: null,
            currentRegion: 1
        },
        create: {
            username: "bandit_tester",
            password: "hashed_password",
            silver: 1000,
            currentRegion: 1,
            premiumTierId: tier.id
        }
    });
    console.log(`- Test User created: ${user.username} (ID: ${user.id})`);

    // 3. Test Ambush Trigger
    console.log("\n[TEST 1] Travel into 100% threat zone...");
    const travelResult = await travelService.startTravel(user.id, 999);
    if (travelResult.status === "AMBUSHED") {
        console.log("✓ SUCCESS: Ambush triggered as expected.");
        console.log(`  Message: ${travelResult.message}`);
        console.log(`  Ransom Cost: ${travelResult.ransomCost} silver`);
    } else {
        console.log("✗ FAILED: Ambush NOT triggered or error occurred.");
    }

    // 4. Test Ransom Logic
    console.log("\n[TEST 2] Processing Ransom...");
    const ransomResult = await banditService.processRansom(user.id);
    if (ransomResult.silver < 1000 && ransomResult.banditReputation < 0) {
        console.log(`✓ SUCCESS: Ransom paid. New Silver: ${ransomResult.silver}, Reputation: ${ransomResult.banditReputation}`);
    } else {
        console.log(`✗ FAILED: Ransom calculation incorrect.`);
    }

    // 5. Test Escort Immunity
    console.log("\n[TEST 3] Hiring Escort and traveling again...");
    await escortService.hireEscort(user.id);
    // Need to reset location to 1 first to travel to 999 again
    await prisma.user.update({ where: { id: user.id }, data: { currentRegion: 1 } });
    
    const travelResultWithEscort = await travelService.startTravel(user.id, 999);
    if (travelResultWithEscort.status === "RUNNING") {
        console.log("✓ SUCCESS: Traveled safely with Escort.");
        const userWithEscort = await prisma.user.findUnique({ where: { id: user.id } });
        console.log(`  Remaining Escort Grids: ${userWithEscort.escortGridsRemaining}/10`);
    } else {
        console.log("✗ FAILED: Still ambushed despite having Escort!");
    }

    // 6. Test Stolen Goods Fencing
    console.log("\n[TEST 4] Stolen Goods Check...");
    let itemTemplate = await prisma.itemTemplate.findFirst({ where: { name: "Stolen Iron Ore" } });
    if (!itemTemplate) {
        itemTemplate = await prisma.itemTemplate.create({
            data: { 
                name: "Stolen Iron Ore", 
                description: "Ore that doesn't belong to you.",
                category: "MATERIAL", 
                baseValue: 10
            }
        });
    }

    const stolenItem = await prisma.inventoryItem.create({
        data: {
            userId: user.id,
            templateId: itemTemplate.id,
            quantity: 1,
            isStolen: true
        }
    });

    try {
        await marketService.npcSell(user.id, stolenItem.id);
        console.log("✗ FAILED: Stolen item sold to a regular NPC.");
    } catch (e) {
        console.log(`✓ SUCCESS: Sale blocked: "${e.message}"`);
    }

    console.log("\n=== VERIFICATION COMPLETE ===");
}

verifyBanditSystem().catch(console.error);
