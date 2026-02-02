const marketService = require('../services/marketService');
const factionService = require('../services/faction/FactionWarService');
const taxationService = require('../services/economy/TaxationService');
const prisma = require('../db');

async function runMarketTaxAudit() {
    console.log("--------------------------------------------------");
    console.log("⚖️ STARTING MARKET DYNAMIC TAX AUDIT");
    console.log("--------------------------------------------------\n");

    const buyerId = 1;
    const sellerId = 2;
    const templateId = 2201; // Granite
    const price = 1000;

    // Helper to calculate expected gold
    // Fee: 0.05 * 1000 = 50.
    // Net (Peace 10%): 1000 - 100 = 900. Total = 1000 - 50 + 900 = 1850.
    // Net (War 15%): 1000 - 150 = 850. Total = 1000 - 50 + 850 = 1800.

    // 1. Setup Region 10 (Peace TOWN)
    console.log("[1/2] Testing Profit in Peace Region 10 (10% Tax)...");
    await prisma.regionTemplate.update({ where: { id: 10 }, data: { visualType: "TOWN", factionId: 1 } });
    await prisma.territory.deleteMany({ where: { regionId: 10 } });
    
    await factionService.setRelation(1, 2, "PEACE");
    await taxationService.updateAllRegionalTaxes();
    
    await prisma.marketOrder.deleteMany({});
    await prisma.user.update({ where: { id: buyerId }, data: { gold: 10000, currentRegion: 10 } });
    await prisma.user.update({ where: { id: sellerId }, data: { gold: 1000, currentRegion: 10 } });
    
    const item1 = await prisma.inventoryItem.create({
        data: { userId: sellerId, templateId, quantity: 1, currentDurability: 100, maxDurability: 100 }
    });

    await marketService.createBuyOrder(buyerId, templateId, 1, price);
    await marketService.createSellOrder(sellerId, item1.id, 1, price);

    const sellerPeace = await prisma.user.findUnique({ where: { id: sellerId } });
    console.log(`   Seller Gold after Peace Sale: ${sellerPeace.gold} (Expected: 1850)`);

    // 2. Setup Region 6 (War TOWN)
    console.log("\n[2/2] Testing Profit in War Region 6 (15% Tax)...");
    await prisma.regionTemplate.update({ where: { id: 6 }, data: { visualType: "TOWN", factionId: 1 } });
    await prisma.territory.deleteMany({ where: { regionId: 6 } });

    await factionService.setRelation(1, 2, "WAR");
    await taxationService.updateAllRegionalTaxes();

    await prisma.marketOrder.deleteMany({});
    await prisma.user.update({ where: { id: buyerId }, data: { gold: 10000, currentRegion: 6 } });
    await prisma.user.update({ where: { id: sellerId }, data: { gold: 1000, currentRegion: 6 } });

    const item3 = await prisma.inventoryItem.create({
        data: { userId: sellerId, templateId, quantity: 1, currentDurability: 100, maxDurability: 100 }
    });

    await marketService.createBuyOrder(buyerId, templateId, 1, price);
    await marketService.createSellOrder(sellerId, item3.id, 1, price);

    const sellerWar = await prisma.user.findUnique({ where: { id: sellerId } });
    console.log(`   Seller Gold after War Sale: ${sellerWar.gold} (Expected: 1800)`);

    // VERDICT
    if (sellerPeace.gold === 1850 && sellerWar.gold === 1800) {
        console.log("\n🌟 FINAL VERDICT: DYNAMIC TAXATION INTEGRATION PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: TAX CALCULATION FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runMarketTaxAudit().catch(err => console.error(err));