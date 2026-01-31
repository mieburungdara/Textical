const heroAuctionService = require('../services/heroAuctionService');
const formationService = require('../services/formationService');
const prisma = require('../db');

async function runHeroAuctionAudit() {
    console.log("--------------------------------------------------");
    console.log("🏛️ STARTING ADVANCED HERO AUCTION MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const sellerId = 1;
    const buyerId = 2;
    const town1 = 1;
    const town2 = 10;
    const heroId = 39; // Arthur

    // 0. Setup: Town positions and initial balances
    console.log("[0/5] Preparing environment...");
    await prisma.regionTemplate.upsert({ where: { id: town1 }, update: { visualType: "TOWN" }, create: { id: town1, name: "Town 1", visualType: "TOWN", description: "City" } });
    await prisma.regionTemplate.upsert({ where: { id: town2 }, update: { visualType: "TOWN" }, create: { id: town2, name: "Town 2", visualType: "TOWN", description: "City" } });

    await prisma.user.update({ where: { id: sellerId }, data: { gold: 1000, currentRegion: town1 } });
    await prisma.user.update({ where: { id: buyerId }, data: { gold: 10000, currentRegion: town2 } });

    // 1. List Hero
    console.log("[1/5] Seller listing Hero 39 for 5000 gold...");
    const order = await heroAuctionService.listHero(sellerId, heroId, 5000);
    console.log(`   ✅ Order Created: ID ${order.id}`);

    // 2. Protection Test: Attempt to add to formation
    console.log("[2/5] Testing Market Protection (Formation lock)...");
    try {
        await formationService.updateFormation(sellerId, 1, [{ heroId, gridX: 0, gridY: 0 }]);
        console.log("   ❌ Error: Hero should be locked from formations.");
    } catch (e) {
        console.log(`   ✅ Success: ${e.message}`);
    }

    // 3. Localization Test
    console.log("[3/5] Testing Localization (Town 2)...");
    const town2Orders = await heroAuctionService.getRegionalHeroOrders(buyerId);
    console.log(`   Visible in Town 2: ${town2Orders.length} (Expected: 0)`);

    // 4. Purchase Test
    console.log("[4/5] Buyer traveling to Town 1 and purchasing...");
    await prisma.user.update({ where: { id: buyerId }, data: { currentRegion: town1 } });
    
    const initialSellerGold = (await prisma.user.findUnique({ where: { id: sellerId } })).gold;
    await heroAuctionService.purchaseHero(buyerId, order.id);

    // 5. Verify Results
    const finalHero = await prisma.hero.findUnique({ where: { id: heroId } });
    const finalSeller = await prisma.user.findUnique({ where: { id: sellerId } });
    const finalBuyer = await prisma.user.findUnique({ where: { id: buyerId } });

    // Math:
    // 5000 gold - 10% tax = 4500 profit.
    // Seller: 1000 + 4500 = 5500.
    // Buyer: 10000 - 5000 = 5000.
    console.log(`\n📊 FINAL VERIFICATION:`);
    console.log(`   Hero Owner: ${finalHero.userId} (Expected: ${buyerId})`);
    console.log(`   Seller Gold: ${finalSeller.gold} (Expected: 5500)`);
    console.log(`   Buyer Gold: ${finalBuyer.gold} (Expected: 5000)`);

    // VERDICT
    if (finalHero.userId === buyerId && finalSeller.gold === 5500 && finalBuyer.gold === 5000) {
        console.log("\n🌟 FINAL VERDICT: ADVANCED HERO AUCTION SYSTEM PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: AUDIT FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runHeroAuctionAudit().catch(err => console.error(err));
