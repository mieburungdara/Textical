const marketListingService = require('../services/market/MarketListingService');
const marketFee = require('../services/economy/MarketFeeComponent');
const prisma = require('../db');

async function runMarketIncentiveAudit() {
    console.log("--------------------------------------------------");
    console.log("📈 STARTING MARKET INCENTIVE FEE AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const itemValue = 10000; // 10k Silver item

    // 1. Verify Listing Fee (Reduced to 1%)
    const fee = marketFee.calculateListingFee(itemValue, 0, false);
    console.log(`[1/2] Listing Fee for 10,000 item: ${fee} Silver (Expected: 100)`);

    // 2. Verify Dynamic Sales Tax
    // Scenario A: Beginner (0 sales) -> 10% tax = 1000
    const taxA = marketFee.calculateTotalSalesTax(itemValue, 0, false, null, 0);
    console.log(`[2/2] Sales Tax (0 Volume): ${taxA} Silver (Expected: 1000)`);

    // Scenario B: Legendary (100+ sales) -> 5% tax = 500
    const taxB = marketFee.calculateTotalSalesTax(itemValue, 0, false, null, 100);
    console.log(`   Sales Tax (100 Volume): ${taxB} Silver (Expected: 500)`);

    // VERDICT
    if (fee === 100 && taxA === 1000 && taxB === 500) {
        console.log("\n🌟 FINAL VERDICT: MARKET INCENTIVES PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: INCENTIVE CALCULATION FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runMarketIncentiveAudit().catch(err => console.error(err));
