const marketService = require('../services/marketService');
const prisma = require('../db');

async function runMultiCurrencyMarketAudit() {
    console.log("--------------------------------------------------");
    console.log("💰 STARTING MULTI-CURRENCY MARKET AUDIT");
    console.log("--------------------------------------------------\n");

    const buyerId = 1;
    const sellerId = 2;
    const templateId = 2201; // Granite
    const price = 1500; // 1 Silver, 500 Copper

    // 0. Setup: 
    // Buyer has 2 Silver (2000 Copper)
    // Seller has 1000 Copper
    console.log("[0/3] Preparing balances (Buyer: 2 Silver, Seller: 1000 Copper)...");
    await prisma.user.update({ where: { id: buyerId }, data: { copper: 0, silver: 2, gold: 0, platinum: 0, diamond: 0, currentRegion: 1 } });
    await prisma.user.update({ where: { id: sellerId }, data: { copper: 1000, silver: 0, gold: 0, platinum: 0, diamond: 0, currentRegion: 1 } });
    await prisma.marketOrder.deleteMany({});
    
    const item = await prisma.inventoryItem.create({
        data: { userId: sellerId, templateId, quantity: 1, currentDurability: 100, maxDurability: 100 }
    });

    // 1. Execute Market Purchase
    console.log("[1/3] Executing 1500 unit purchase (Buyer has 2000 total)...");
    await marketService.createBuyOrder(buyerId, templateId, 1, price);
    await marketService.createSellOrder(sellerId, item.id, 1, price);

    // 2. Verify Final Tiers
    const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
    const seller = await prisma.user.findUnique({ where: { id: sellerId } });

    // Buyer: 2000 - 1500 = 500. Result: 0 Silver, 500 Copper.
    console.log(`   Buyer -> Silver: ${buyer.silver}, Copper: ${buyer.copper} (Expected: 0, 500)`);
    
    // Calculation for Seller:
    // Tax Rate in Region 1: 15% (War) + 20% (Guild) = 35%.
    // Listing Fee (5% Base + 20% Guild) = 25% of 1500 = 375.
    // Net Sale (1500 - 35% Tax) = 1500 - 525 = 975.
    // Total = 1000 (Initial) - 375 (Fee) + 975 (Sale) = 1600.
    // Result: 1 Silver, 600 Copper.
    console.log(`   Seller -> Silver: ${seller.silver}, Copper: ${seller.copper} (Expected: 1, 600)`);

    // VERDICT
    const buyerPass = buyer.silver === 0 && buyer.copper === 500;
    const sellerPass = seller.silver === 1 && seller.copper === 600;

    if (buyerPass && sellerPass) {
        console.log("\n🌟 FINAL VERDICT: MULTI-CURRENCY MARKET PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: TIERED DEDUCTION FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runMultiCurrencyMarketAudit().catch(err => console.error(err));