const marketService = require('../services/marketService');
const priceIndexService = require('../services/market/PriceIndexService');
const prisma = require('../db');

async function runMasterPriceAudit() {
    console.log("--------------------------------------------------");
    console.log("📈 STARTING REGIONAL PRICE INDEX MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const buyerId = 1;
    const sellerId = 2;
    const templateId = 2201; // Granite
    const regionId = 1;

    // 0. Setup: Clean History and Ensure Inventory
    console.log("[0/3] Preparing audit state...");
    await prisma.itemSaleHistory.deleteMany({ where: { templateId, regionId } });
    await prisma.marketOrder.deleteMany({ where: { templateId, regionId } });
    
    // Give seller Granite
    await prisma.inventoryItem.deleteMany({ where: { userId: sellerId, templateId } });
    const item = await prisma.inventoryItem.create({
        data: { userId: sellerId, templateId, quantity: 10, currentDurability: 100, maxDurability: 100 }
    });

    await prisma.user.update({ where: { id: buyerId }, data: { gold: 10000, currentRegion: regionId } });
    await prisma.user.update({ where: { id: sellerId }, data: { gold: 1000, currentRegion: regionId } });

    // 1. Execute Market Match
    console.log("[1/3] Creating and matching market orders (Sale Price: 150)...");
    await marketService.createBuyOrder(buyerId, templateId, 5, 150);
    await marketService.createSellOrder(sellerId, item.id, 5, 150);

    // 2. Verify History Generation
    console.log("[2/3] Verifying ItemSaleHistory record...");
    const history = await priceIndexService.getPriceHistory(templateId, regionId);
    
    console.log(`   History Entries: ${history.length} (Expected: 1)`);
    if (history.length > 0) {
        console.log(`   Points: Price ${history[0].price} | Quantity ${history[0].quantity}`);
    }

    // VERDICT
    const entryPass = history.length === 1 && history[0].price === 150;

    if (entryPass) {
        console.log("\n🌟 FINAL VERDICT: REGIONAL PRICE INDEX LIFECYCLE PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: AUDIT FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runMasterPriceAudit().catch(err => console.error(err));
