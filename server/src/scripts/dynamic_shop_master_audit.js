const shopService = require('../services/economy/ShopInventoryService');
const tradeHandler = require('../services/npc/TradeHandler');
const prisma = require('../db');

async function runMasterShopAudit() {
    console.log("--------------------------------------------------");
    console.log("🏪 STARTING DYNAMIC SHOP MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const npcId = 11; // Zev
    const itemId = 4425;
    const regionId = 1;

    // 0. Setup
    console.log("[0/4] Preparing environment...");
    await prisma.user.update({ where: { id: userId }, data: { gold: 1000000, currentRegion: regionId } });
    await prisma.inventoryItem.deleteMany({ where: { userId } });
    await prisma.shopStock.deleteMany({ where: { npcId, regionId } });

    // 1. Initial Restock
    console.log("[1/4] Triggering initial restock...");
    await shopService.restockAllShops();
    
    const stockBefore = await prisma.shopStock.findUnique({
        where: { npcId_regionId_templateId: { npcId, regionId, templateId: itemId } }
    });
    console.log(`   Initial Stock for Item ${itemId}: ${stockBefore.quantity}`);

    // 2. Deplete Stock via Purchase
    console.log("[2/4] Purchasing item to test depletion...");
    await tradeHandler.handlePurchase(prisma, userId, npcId, itemId);
    
    const stockAfter = await prisma.shopStock.findUnique({
        where: { npcId_regionId_templateId: { npcId, regionId, templateId: itemId } }
    });
    console.log(`   Stock after purchase: ${stockAfter.quantity} (Expected: ${stockBefore.quantity - 1})`);

    // 3. Trigger Second Restock (Rotation/Replenish)
    console.log("[3/4] Triggering second restock...");
    await shopService.restockAllShops();
    
    const stockFinal = await prisma.shopStock.findUnique({
        where: { npcId_regionId_templateId: { npcId, regionId, templateId: itemId } }
    });
    console.log(`   Stock after restock: ${stockFinal.quantity} (Expected: ${stockBefore.quantity})`);

    // 4. Verify Verdict
    const depletionPass = stockAfter.quantity === stockBefore.quantity - 1;
    const replenishPass = stockFinal.quantity === stockBefore.quantity;

    if (depletionPass && replenishPass) {
        console.log("\n🌟 FINAL VERDICT: DYNAMIC SHOP SYSTEM PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: MASTER AUDIT FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runMasterShopAudit().catch(err => console.error(err));
