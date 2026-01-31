const extractionService = require('../services/hero/MasteryExtractionService');
const auctionService = require('../services/heroAuctionService');
const marketService = require('../services/marketService');
const prisma = require('../db');

async function runAdvancedAuctionAudit() {
    console.log("--------------------------------------------------");
    console.log("🏛️ STARTING ADVANCED HERO AUCTION MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const sellerId = 1;
    const buyerId = 2;
    const heroId = 39; // Arthur
    const regionId = 1;

    // 0. Setup: Hero with Class Level 10 and clean orders
    console.log("[0/5] Preparing hero for mastery extraction...");
    await prisma.heroOrder.deleteMany({ where: { heroId } });
    await prisma.inventoryItem.deleteMany({ where: { userId: sellerId, templateId: { gte: 10000 } } });

    await prisma.hero.update({
        where: { id: heroId },
        data: { userId: sellerId, classLevel: 10, classXp: 5000 }
    });
    await prisma.user.update({ where: { id: sellerId }, data: { gold: 5000 } });
    await prisma.user.update({ where: { id: buyerId }, data: { gold: 10000 } });

    // 1. Mastery Extraction
    console.log("[1/5] Extracting Mastery from Hero 39...");
    const extractRes = await extractionService.extractMastery(sellerId, heroId);
    
    const heroAfter = await prisma.hero.findUnique({ where: { id: heroId } });
    const tome = await prisma.inventoryItem.findFirst({ 
        where: { userId: sellerId, templateId: extractRes.tomeId } 
    });

    console.log(`   Hero Class Level: ${heroAfter.classLevel} (Expected: 1)`);
    console.log(`   Mastery Tome Recieved: ${tome ? 'YES' : 'NO'} (ID: ${extractRes.tomeId})`);

    // 2. Sell Mastery Tome
    console.log("[2/5] Selling Mastery Tome on market...");
    const tomeOrder = await marketService.createSellOrder(sellerId, tome.id, 1, 2000);
    console.log(`   ✅ Tome Order Created: ID ${tomeOrder.id}`);

    // 3. Purchase Hero & Tome
    console.log("[3/5] Buyer purchasing Hero and Tome...");
    // List Hero first
    const heroOrder = await auctionService.listHero(sellerId, heroId, 5000);
    
    await auctionService.purchaseHero(buyerId, heroOrder.id);
    await marketService.createBuyOrder(buyerId, extractRes.tomeId, 1, 2000);

    // 4. Verify Market Analytics
    console.log("[4/5] Checking Market Analytics for Class...");
    const stats = await auctionService.getClassMarketAnalytics(heroAfter.classId);
    console.log(`   Avg Sale Price: ${stats.avgPrice} (Expected: 5000)`);
    console.log(`   Market Volume: ${stats.volume} (Expected: 1)`);

    // 5. Final Verification
    const finalHero = await prisma.hero.findUnique({ where: { id: heroId } });

    // VERDICT
    const extractPass = heroAfter.classLevel === 1 && tome;
    const analyticsPass = stats.avgPrice === 5000;
    const purchasePass = finalHero.userId === buyerId;

    if (extractPass && analyticsPass && purchasePass) {
        console.log("\n🌟 FINAL VERDICT: ADVANCED AUCTION SYSTEM PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: SYSTEM LOOP FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runAdvancedAuctionAudit().catch(err => console.error(err));