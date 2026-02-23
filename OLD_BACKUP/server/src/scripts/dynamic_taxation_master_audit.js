const marketService = require('../services/marketService');
const factionService = require('../services/faction/FactionWarService');
const taxationService = require('../services/economy/TaxationService');
const prisma = require('../db');

async function runMasterTaxationAudit() {
    console.log("--------------------------------------------------");
    console.log("⚖️ STARTING DYNAMIC TAXATION MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const buyerId = 1;
    const sellerId = 2;
    const templateId = 2201; // Granite
    const price = 1000;
    const regionId = 10; // Town 2 (Controlled test environment)

    // 0. Setup
    console.log("[0/4] Preparing environment (Town 2)...");
    await prisma.regionTemplate.update({ where: { id: regionId }, data: { visualType: "TOWN", factionId: 1 } });
    await prisma.territory.deleteMany({ where: { regionId } });
    await prisma.marketOrder.deleteMany({});
    
    // 1. War State Update
    console.log("[1/4] Setting Faction War status (Empire vs Rebels)...");
    await factionService.setRelation(1, 2, "WAR");
    
    // 2. Run Taxation Orchestrator
    console.log("[2/4] Running TaxationService update...");
    await taxationService.updateAllRegionalTaxes();
    
    const region = await prisma.regionTemplate.findUnique({ where: { id: regionId } });
    console.log(`   Regional Tax Rate for Region ${regionId}: ${region.regionalTaxRate * 100}% (Expected: 15%)`);

    // 3. Match Order
    console.log("[3/4] Executing market transaction in War Zone...");
    await prisma.user.update({ where: { id: buyerId }, data: { gold: 10000, currentRegion: regionId } });
    await prisma.user.update({ where: { id: sellerId }, data: { gold: 1000, currentRegion: regionId } });
    
    const item = await prisma.inventoryItem.create({
        data: { userId: sellerId, templateId, quantity: 1, currentDurability: 100, maxDurability: 100 }
    });

    await marketService.createBuyOrder(buyerId, templateId, 1, price);
    await marketService.createSellOrder(sellerId, item.id, 1, price);

    // 4. Verify Final Balances
    console.log("[4/4] Verifying gold deductions and ledger...");
    const seller = await prisma.user.findUnique({ where: { id: sellerId } });
    
    // Calculation:
    // Initial: 1000.
    // Listing Fee (Base 0.05 + Guild 0): 1000 * 0.05 = 50.
    // Sales Tax (Regional 0.15 + Guild 0): 1000 * 0.15 = 150.
    // Net: 1000 - 150 = 850.
    // Total: 1000 - 50 + 850 = 1800.
    console.log(`   Seller Gold: ${seller.gold} (Expected: 1800)`);

    // VERDICT
    if (region.regionalTaxRate === 0.15 && seller.gold === 1800) {
        console.log("\n🌟 FINAL VERDICT: DYNAMIC TAXATION SYSTEM PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: MASTER AUDIT FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runMasterTaxationAudit().catch(err => console.error(err));
