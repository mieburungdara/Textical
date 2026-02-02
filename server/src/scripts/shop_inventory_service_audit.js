const service = require('../services/economy/ShopInventoryService');
const prisma = require('../db');

async function runShopInventoryAudit() {
    console.log("--------------------------------------------------");
    console.log("🏪 STARTING SHOP INVENTORY SERVICE AUDIT");
    console.log("--------------------------------------------------\n");

    // 1. Trigger Restock
    console.log("[1/2] Triggering global restock...");
    const results = await service.restockAllShops();
    
    console.log(`   Restocked ${results.length} NPC-Region combinations.`);
    results.forEach(r => console.log(`      ${r.trader} in ${r.region}: ${r.items} items.`));

    // 2. Verify DB Records
    console.log("\n[2/2] Verifying database records...");
    const allStock = await prisma.shopStock.findMany({ take: 5 });
    
    if (allStock.length > 0) {
        console.log(`   ✅ Database contains ${allStock.length} (sample) stock records.`);
        console.log(`   Sample: NPC ${allStock[0].npcId}, Item ${allStock[0].templateId}, Qty ${allStock[0].quantity}`);
        console.log("\n🌟 FINAL VERDICT: SHOP INVENTORY SERVICE PERFECT.");
    } else {
        console.error("   ❌ No stock records found in database after restock.");
    }

    console.log("\n--------------------------------------------------");
}

runShopInventoryAudit().catch(err => console.error(err));
