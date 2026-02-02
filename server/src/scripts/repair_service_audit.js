const repairService = require('../services/economy/RepairService');
const prisma = require('../db');

async function runRepairServiceAudit() {
    console.log("--------------------------------------------------");
    console.log("♻️ STARTING REPAIR SERVICE AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const templateId = 7001; // Iron Broadsword

    // 0. Setup: Item with 50% durability
    console.log("[0/2] Preparing environment...");
    await prisma.user.update({ where: { id: userId }, data: { silver: 1000 } });
    await prisma.inventoryItem.deleteMany({ where: { userId } });
    
    const item = await prisma.inventoryItem.create({
        data: { userId, templateId, currentDurability: 50, maxDurability: 100 }
    });

    // 1. Repair Item
    console.log("[1/2] Repairing item (50/100)...");
    const result = await repairService.repairItem(userId, item.id);
    
    // 2. Verify Result
    const user = await prisma.user.findUnique({ where: { id: userId } });
    console.log(`   Final Durability: ${result.currentDurability}/${result.maxDurability}`);
    console.log(`   Final Silver Balance: ${user.silver} (Expected < 1000)`);

    // VERDICT
    if (result.currentDurability === 100 && user.silver < 1000) {
        console.log("\n🌟 FINAL VERDICT: REPAIR SERVICE PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: SERVICE FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runRepairServiceAudit().catch(err => console.error(err));
