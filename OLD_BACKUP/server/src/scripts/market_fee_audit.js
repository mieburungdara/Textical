const marketFee = require('../services/economy/MarketFeeComponent');

async function runAudit() {
    console.log("--------------------------------------------------");
    console.log("📈 STARTING MARKET FEE COMPONENT AUDIT");
    console.log("--------------------------------------------------\n");

    const price = 1000;

    // 1. Check Listing Fee
    const listingFee = marketFee.calculateListingFee(price);
    console.log(`   Price: ${price}, Listing Fee: ${listingFee} (Expected: 50)`);

    // 2. Check Sales Tax
    const salesTax = marketFee.calculateSalesTax(price);
    console.log(`   Price: ${price}, Sales Tax: ${salesTax} (Expected: 100)`);

    // 3. Check Seller Net
    const sellerNet = marketFee.calculateSellerNet(price);
    console.log(`   Price: ${price}, Seller Net: ${sellerNet} (Expected: 900)`);

    if (listingFee === 50 && salesTax === 100 && sellerNet === 900) {
        console.log("\n🌟 FINAL VERDICT: MARKET FEE COMPONENT ACCURATE.");
    } else {
        console.log("\n❌ FINAL VERDICT: CALCULATION MISMATCH.");
    }

    console.log("\n--------------------------------------------------");
}

runAudit().catch(err => console.error(err));
