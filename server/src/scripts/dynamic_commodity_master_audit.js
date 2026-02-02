const gatheringService = require('../services/gatheringService');
const marketListingService = require('../services/market/MarketListingService');
const extractionTracker = require('../services/economy/ExtractionTrackerService');
const prisma = require('../db');

async function runMasterCommodityAudit() {
    console.log("--------------------------------------------------");
    console.log("💰 STARTING DYNAMIC COMMODITY MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 39;
    const templateId = 2005; // Iron Ingot
    const regionId = 1;

    // 0. Setup
    console.log("[0/4] Preparing environment...");
    const heroes = await prisma.hero.findMany({ where: { userId } });
    for (const h of heroes) await prisma.heroEquipment.deleteMany({ where: { heroId: h.id } });
    
    await prisma.regionalExtractionStats.deleteMany({ where: { regionId, templateId } });
    await prisma.inventoryItem.deleteMany({ where: { userId } });
    await prisma.marketOrder.deleteMany({ where: { templateId, regionId } });
    await prisma.taskQueue.deleteMany({ where: { userId } });
    await prisma.user.update({ where: { id: userId }, data: { gold: 10000, currentRegion: regionId } });

    // 1. Gather Item
    console.log("[1/4] Simulating gathering event...");
    const task = await prisma.taskQueue.create({
        data: {
            userId, heroId, type: "GATHERING", targetItemId: templateId,
            status: "RUNNING", startedAt: new Date(), finishesAt: new Date()
        }
    });
    await gatheringService.completeGathering(userId, task.id);

    const stats = await extractionTracker.getStats(regionId, templateId);
    console.log(`   Extraction Stats updated: ${stats ? stats.volume24h : 0} units.`);

    // 2. Initial Scarcity Fee
    console.log("[2/4] Testing Market Listing with Scarcity...");
    // 1 unit at price 1. Dynamic Base Value: 20 * 1.5 = 30. Fee: floor(30 * 0.05) = 1.
    // wait, my earlier audit showed fee 4 because base listing is 5% + guild tax? 
    // Region 1 has guild tax 0.2? (Check previous turns)
    // Actually, fee = price * (0.05 + guildTax). 30 * (0.05 + 0) = 1.5 -> 1.
    const item = await prisma.inventoryItem.findFirst({ where: { userId, templateId } });
    await marketListingService.listItem(userId, item.id, 1);
    
    const fee1 = Math.abs((await prisma.transactionLedger.findFirst({
        where: { userId, type: "MARKET_LISTING_FEE" },
        orderBy: { id: 'desc' }
    })).amountDelta);
    console.log(`   Fee (Scarcity): ${fee1} gold.`);

    // 3. Flood Market (Surplus)
    console.log("[3/4] Recording massive regional extraction (+1000)...");
    await extractionTracker.recordExtraction(regionId, templateId, 1000);
    
    const item2 = await prisma.inventoryItem.create({
        data: { userId, templateId, quantity: 100, currentDurability: 100, maxDurability: 100 }
    });
    
    await marketListingService.listItem(userId, item2.id, 1);
    const fee2 = Math.abs((await prisma.transactionLedger.findFirst({
        where: { userId, type: "MARKET_LISTING_FEE" },
        orderBy: { id: 'desc' }
    })).amountDelta);
    console.log(`   Fee for 100 units (Surplus): ${fee2} gold.`);

    // VERDICT
    if (stats && stats.volume24h > 0 && fee2 < (fee1 * 100)) {
        console.log("\n🌟 FINAL VERDICT: DYNAMIC COMMODITY PRICING PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: MASTER AUDIT FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runMasterCommodityAudit().catch(err => console.error(err));
