const marketListingService = require('../services/market/MarketListingService');
const marketTransactionService = require('../services/market/MarketTransactionService');
const prisma = require('../db');

async function runAudit() {
    console.log("--------------------------------------------------");
    console.log("🏪 STARTING MARKET TRANSACTION MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const sellerId = 1;
    const buyerId = 2; 
    const swordTemplateId = 7001; // Iron Broadsword

    // 0. Setup: Ensure Users Exist
    console.log("[0/4] Preparing users and materials...");
    
    // Ensure Basic Tier Exists
    await prisma.premiumTierTemplate.upsert({
        where: { id: 0 },
        update: {},
        create: { id: 0, name: "Basic" }
    });

    await prisma.user.upsert({
        where: { id: sellerId },
        update: { gold: 100, currentRegion: 1 }, // Give 100 gold for listing fee
        create: { id: sellerId, username: "Seller", password: "pw", gold: 100, currentRegion: 1, premiumTierId: 0 }
    });
    await prisma.user.upsert({
        where: { id: buyerId },
        update: { gold: 5000, currentRegion: 1 },
        create: { id: buyerId, username: "Buyer", password: "pw", gold: 5000, currentRegion: 1, premiumTierId: 0 }
    });
    
    // Ensure Region is valid for market (must be TOWN visualType)
    await prisma.regionTemplate.update({
        where: { id: 1 }, 
        data: { visualType: "TOWN" } 
    });

    // Grant item to seller
    const sword = await prisma.inventoryItem.upsert({
        where: { userId_templateId: { userId: sellerId, templateId: swordTemplateId } },
        update: { quantity: 1 },
        create: { userId: sellerId, templateId: swordTemplateId, quantity: 1 }
    });

    // 1. List Item (Price: 1000)
    console.log("[1/4] Seller listing item for 1000 gold...");
    const listing = await marketListingService.listItem(sellerId, sword.id, 1000);
    console.log(`   ✅ Listing created (ID: ${listing.id})`);

    // 2. Purchase Item
    console.log("[2/4] Buyer purchasing item...");
    const purchaseRes = await marketTransactionService.purchaseItem(buyerId, listing.id);
    console.log(`   ✅ Purchase Success: ${purchaseRes.message}`);

    // 3. Verify Balances & Tax
    const finalSeller = await prisma.user.findUnique({ where: { id: sellerId } });
    const finalBuyer = await prisma.user.findUnique({ where: { id: buyerId } });

    console.log(`
📊 BALANCE CHECK:`);
    console.log(`   Buyer Gold: ${finalBuyer.gold} (Expected: 4000)`);
    console.log(`   Seller Gold: ${finalSeller.gold} (Expected: 950 - Net 900 gain - 50 fee)`);

    // 4. Verify Ledger
    const ledger = await prisma.transactionLedger.findMany({
        where: { sourceId: listing.id, sourceType: "MARKET" },
        orderBy: { createdAt: 'desc' }
    });

    console.log(`
📊 LEDGER AUDIT: Found ${ledger.length} entries for this trade.`);
    ledger.forEach(e => {
        console.log(`   [${e.type}] User ${e.userId} Delta: ${e.amountDelta}, New Bal: ${e.newBalance}`);
    });

    // VERDICT
    // Net gain for seller: +900. Total gold should be 100 - 50 + 900 = 950.
    if (finalBuyer.gold === 4000 && finalSeller.gold === 950 && ledger.length >= 2) {
        console.log("\n🌟 FINAL VERDICT: ADVANCED ECONOMY SYSTEM PERFECT.");
    } else {
        console.log(`\n❌ FINAL VERDICT: AUDIT FAILURE. Buyer: ${finalBuyer.gold}, Seller: ${finalSeller.gold}`);
    }

    console.log("\n--------------------------------------------------");
}

runAudit().catch(err => console.error(err));