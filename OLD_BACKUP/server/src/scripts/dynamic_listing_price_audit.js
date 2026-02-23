const marketListingService = require('../services/market/MarketListingService');
const extractionTracker = require('../services/economy/ExtractionTrackerService');
const prisma = require('../db');

async function runDynamicPriceAudit() {
    console.log("--------------------------------------------------");
    console.log("⚖️ STARTING DYNAMIC LISTING PRICE AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const regionId = 1;
    const templateId = 2005; // Iron Ingot (Base Value: 20)

    // 0. Setup
    console.log("[0/3] Preparing environment...");
    await prisma.marketOrder.deleteMany({ where: { templateId, regionId } });
    await prisma.regionalExtractionStats.deleteMany({ where: { regionId, templateId } });
    await prisma.inventoryItem.deleteMany({ where: { userId, templateId } });
    
    const heroes = await prisma.hero.findMany({ where: { userId } });
    for (const h of heroes) await prisma.heroEquipment.deleteMany({ where: { heroId: h.id } });

    await prisma.user.update({ where: { id: userId }, data: { gold: 10000, currentRegion: regionId } });

    // 1. Scenario: Scarcity (0 volume)
    console.log("[1/3] Scenario: Scarcity (0 volume) -> Expected 1.5x Base Value...");
    // Item Base Value is 20. 1.5x = 30.
    // Listing at price 1 should use 30 for fee.
    // Fee: 30 * 0.05 = 1.5 -> floor 1.
    
    const item1 = await prisma.inventoryItem.create({
        data: { userId, templateId, quantity: 1, currentDurability: 100, maxDurability: 100 }
    });

    const order1 = await marketListingService.listItem(userId, item1.id, 1);
    const ledger1 = await prisma.transactionLedger.findFirst({
        where: { userId, type: "MARKET_LISTING_FEE" },
        orderBy: { id: 'desc' }
    });
    console.log(`   Listing Fee (Scarcity): ${Math.abs(ledger1.amountDelta)} gold.`);

    // 2. Scenario: Surplus (1000 volume)
    console.log("\n[2/3] Scenario: Surplus (1000 volume) -> Expected 0.8x Base Value...");
    // 20 * 0.8 = 16.
    await extractionTracker.recordExtraction(regionId, templateId, 1000);
    
    const item2 = await prisma.inventoryItem.create({
        data: { userId, templateId, quantity: 1, currentDurability: 100, maxDurability: 100 }
    });

    const order2 = await marketListingService.listItem(userId, item2.id, 1);
    const ledger2 = await prisma.transactionLedger.findFirst({
        where: { userId, type: "MARKET_LISTING_FEE" },
        orderBy: { id: 'desc' }
    });
    console.log(`   Listing Fee (Surplus): ${Math.abs(ledger2.amountDelta)} gold.`);

    // 3. Comparison
    // For 1 item, fee might be too small to see diff if base is low.
    // Let's test with 100 items.
    console.log("\n[3/3] High Volume Comparison (100 units)...");
    
    // Scarcity Fee (100 units): 30 * 100 * 0.05 = 150.
    // Surplus Fee (100 units): 16 * 100 * 0.05 = 80.
    
    await prisma.regionalExtractionStats.deleteMany({ where: { regionId, templateId } });
    const itemH1 = await prisma.inventoryItem.create({ data: { userId, templateId, quantity: 100 } });
    await marketListingService.listItem(userId, itemH1.id, 1);
    const feeH1 = Math.abs((await prisma.transactionLedger.findFirst({ where: { userId, type: "MARKET_LISTING_FEE" }, orderBy: { id: 'desc' } })).amountDelta);
    
    await extractionTracker.recordExtraction(regionId, templateId, 1000);
    const itemH2 = await prisma.inventoryItem.create({ data: { userId, templateId, quantity: 100 } });
    await marketListingService.listItem(userId, itemH2.id, 1);
    const feeH2 = Math.abs((await prisma.transactionLedger.findFirst({ where: { userId, type: "MARKET_LISTING_FEE" }, orderBy: { id: 'desc' } })).amountDelta);

    console.log(`   Fee for 100 units (Scarcity): ${feeH1} gold.`);
    console.log(`   Fee for 100 units (Surplus): ${feeH2} gold.`);

    // VERDICT
    if (feeH1 > feeH2) {
        console.log("\n🌟 FINAL VERDICT: DYNAMIC LISTING PRICE PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: PRICE SCALING FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runDynamicPriceAudit().catch(err => console.error(err));
