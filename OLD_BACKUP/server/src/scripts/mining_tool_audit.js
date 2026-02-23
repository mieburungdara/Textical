const gatheringService = require('../services/gatheringService');
const prisma = require('../db');

async function runToolAudit() {
    console.log("--------------------------------------------------");
    console.log("🛠️ STARTING MINING TOOL TIER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 999; 

    await prisma.hero.update({
        where: { id: heroId },
        data: { str: 50 }
    });

    // Ensure resources exist in Region 1
    await prisma.regionResource.upsert({
        where: { id: 9991 },
        update: {},
        create: { id: 9991, regionId: 1, itemId: 2201, gatherTimeSeconds: 10 } // Granite
    });
    await prisma.regionResource.upsert({
        where: { id: 9992 },
        update: {},
        create: { id: 9992, regionId: 1, itemId: 2206, gatherTimeSeconds: 10 } // Silver
    });

    const attemptMining = async (itemId, label) => {
        const resource = await prisma.regionResource.findFirst({
            where: { regionId: 1, itemId: itemId }
        });

        console.log(`   Attempting to mine ${label}...`);
        try {
            await gatheringService.startGathering(userId, heroId, resource.id);
            console.log(`   ✅ Success: Mining started.`);
            const task = await prisma.taskQueue.findFirst({ where: { userId, status: "RUNNING" } });
            if (task) await prisma.taskQueue.delete({ where: { id: task.id } });
        } catch (e) {
            console.log(`   ⛔ Blocked: ${e.message}`);
        }
    };

    // 1. Granite (Req: Tier 0) - No tool
    console.log("[1/3] Testing with NO tool...");
    await attemptMining(2201, "Granite (Req: Tier 0)");

    // 2. Silver (Req: Tier 1) - With Wooden Pickaxe (Tier 0)
    console.log("\n[2/3] Testing with Wooden Pickaxe (Tier 0)...");
    const itemInstance = await prisma.inventoryItem.upsert({
        where: { userId_templateId: { userId, templateId: 2301 } },
        update: {},
        create: { userId, templateId: 2301, quantity: 1 }
    });
    await prisma.heroEquipment.upsert({
        where: { heroId_slotKey: { heroId, slotKey: "MAIN_HAND" } },
        update: { itemInstanceId: itemInstance.id },
        create: { heroId, slotKey: "MAIN_HAND", itemInstanceId: itemInstance.id }
    });
    await attemptMining(2206, "Silver (Req: Tier 1)");

    // 3. Silver (Req: Tier 1) - With Iron Pickaxe (Tier 1)
    console.log("\n[3/3] Testing with Iron Pickaxe (Tier 1)...");
    const ironInstance = await prisma.inventoryItem.upsert({
        where: { userId_templateId: { userId, templateId: 2302 } },
        update: {},
        create: { userId, templateId: 2302, quantity: 1 }
    });
    await prisma.heroEquipment.update({
        where: { heroId_slotKey: { heroId, slotKey: "MAIN_HAND" } },
        data: { itemInstanceId: ironInstance.id }
    });
    await attemptMining(2206, "Silver (Req: Tier 1)");

    console.log("\n--------------------------------------------------");
    console.log("Tool Tier Audit Complete.");
}

runToolAudit().catch(err => console.error(err));