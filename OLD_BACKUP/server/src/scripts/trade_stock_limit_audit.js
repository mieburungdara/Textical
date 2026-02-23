const tradeHandler = require('../services/npc/TradeHandler');
const prisma = require('../db');

async function runTradeStockAudit() {
    console.log("--------------------------------------------------");
    console.log("🏪 STARTING TRADE STOCK LIMIT AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const npcId = 11; // Zev the Wandering
    const itemId = 4425; // Simple Necklace
    const regionId = 1;

    // 0. Setup: Ensure stock is set to 1
    console.log("[0/3] Setting NPC stock to 1...");
    await prisma.user.update({ where: { id: userId }, data: { gold: 1000000, currentRegion: regionId } });
    
    // Cleanup inventory
    await prisma.inventoryItem.deleteMany({ where: { userId } });

    const stock = await prisma.shopStock.upsert({
        where: { npcId_regionId_templateId: { npcId, regionId, templateId: itemId } },
        update: { quantity: 1 },
        create: { npcId, regionId, templateId: itemId, quantity: 1, nextRestock: new Date() }
    });

    const shopItem = await prisma.nPCShopItem.findFirst({ where: { npcId, itemId } });
    console.log(`[DEBUG] Shop Item Price: ${shopItem.priceGold}`);

    // 1. First Purchase (Success)
    const debugUser = await prisma.user.findUnique({ where: { id: userId } });
    console.log(`[DEBUG] User Gold: ${debugUser.gold}`);

    console.log("[1/3] Attempting 1st purchase (Stock: 1)...");
    const res1 = await tradeHandler.handlePurchase(prisma, userId, npcId, itemId);
    console.log(`   Result: ${res1.success ? 'SUCCESS' : 'FAILED'} - ${res1.message}`);

    // 2. Second Purchase (Failure)
    console.log("[2/3] Attempting 2nd purchase (Stock: 0)...");
    try {
        await tradeHandler.handlePurchase(prisma, userId, npcId, itemId);
        console.error("   ❌ Error: Purchase succeeded but stock should be empty.");
    } catch (e) {
        console.log(`   ✅ Correct: ${e.message}`);
    }

    // 3. Verify Final Stock
    const finalStock = await prisma.shopStock.findUnique({ where: { id: stock.id } });
    console.log(`   Final DB Stock Quantity: ${finalStock.quantity}`);

    // VERDICT
    if (res1.success && finalStock.quantity === 0) {
        console.log("\n🌟 FINAL VERDICT: TRADE STOCK ENFORCEMENT PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: STOCK LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runTradeStockAudit().catch(err => console.error(err));
