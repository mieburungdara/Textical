const marketService = require('../services/marketService');
const prisma = require('../db');

async function runAlbionAudit() {
    console.log("--------------------------------------------------");
    console.log("🏛️ STARTING ALBION-STYLE MARKET MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const sellerId = 1;
    const buyerId = 2;
    const town1 = 1;
    const town2 = 10; // Assuming Region 10 exists and is a TOWN
    const graniteId = 2201;

    // 0. Setup: Town position and starting balances
    console.log("[0/5] Preparing environment (Town 1 vs Town 2)...");
    await prisma.regionTemplate.upsert({ where: { id: town1 }, update: { visualType: "TOWN" }, create: { id: town1, name: "Town 1", visualType: "TOWN", description: "City" } });
    await prisma.regionTemplate.upsert({ where: { id: town2 }, update: { visualType: "TOWN" }, create: { id: town2, name: "Town 2", visualType: "TOWN", description: "City" } });

    await prisma.user.update({ where: { id: sellerId }, data: { gold: 1000, currentRegion: town1 } });
    await prisma.user.update({ where: { id: buyerId }, data: { gold: 5000, currentRegion: town2 } });

    // Grant items to seller
    const item = await prisma.inventoryItem.upsert({
        where: { userId_templateId: { userId: sellerId, templateId: graniteId } },
        update: { quantity: 10 },
        create: { userId: sellerId, templateId: graniteId, quantity: 10 }
    });

    // 1. Localized Discovery Test
    console.log("[1/5] Seller creating Sell Order in Town 1...");
    await marketService.createSellOrder(sellerId, item.id, 5, 100); // 5 Granite for 100 gold each

    console.log("[2/5] Buyer checking market in Town 2 (Wilderness/Remote)...");
    const buyerViewTown2 = await marketService.getRegionalOrders(buyerId, "SELL");
    console.log(`   Orders visible in Town 2: ${buyerViewTown2.length} (Expected: 0)`);

    // 2. Cross-Town Match Test
    console.log("[3/5] Buyer traveling to Town 1...");
    await prisma.user.update({ where: { id: buyerId }, data: { currentRegion: town1 } });
    const buyerViewTown1 = await marketService.getRegionalOrders(buyerId, "SELL");
    console.log(`   Orders visible in Town 1: ${buyerViewTown1.length} (Expected: 1)`);

    // 3. Matching Test: Instant Buy (Creating a matching Buy Order)
    console.log("[4/5] Buyer placing a matching Buy Order (Instant Buy)...");
    const initialSellerGold = (await prisma.user.findUnique({ where: { id: sellerId } })).gold;
    
    await marketService.createBuyOrder(buyerId, graniteId, 3, 100); // Wants to buy 3 Granite for 100 ea

    // 4. Verify Final State
    const finalSeller = await prisma.user.findUnique({ where: { id: sellerId } });
    const finalBuyer = await prisma.user.findUnique({ where: { id: buyerId } });
    const buyerInv = await prisma.inventoryItem.findUnique({ where: { userId_templateId: { userId: buyerId, templateId: graniteId } } });

    // Math:
    // Buy 3 at 100 = 300 total.
    // Seller gets 300 - 10% tax = 270.
    // Buyer pays 300.
    console.log(`
📊 FINAL VERIFICATION:`);
    console.log(`   Buyer Items: ${buyerInv.quantity} (Expected: 3)`);
    console.log(`   Buyer Gold: ${finalBuyer.gold} (Expected: 4700)`);
    console.log(`   Seller Gold Profit: +${finalSeller.gold - initialSellerGold} (Expected: +270)`);

    const localizedPass = buyerViewTown2.length === 0 && buyerViewTown1.length === 1;
    const matchPass = buyerInv.quantity === 3 && finalBuyer.gold === 4700 && (finalSeller.gold - initialSellerGold) === 270;

    if (localizedPass && matchPass) {
        console.log("\n🌟 FINAL VERDICT: ALBION-STYLE MARKET SYSTEM PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: AUDIT FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runAlbionAudit().catch(err => console.error(err));
