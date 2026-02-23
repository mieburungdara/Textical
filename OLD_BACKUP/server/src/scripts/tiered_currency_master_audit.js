const transactionManager = require('../services/economy/TransactionManager');
const resolver = require('../logic/economy/CurrencyResolver');
const prisma = require('../db');

async function runMasterCurrencyAudit() {
    console.log("--------------------------------------------------");
    console.log("💰 STARTING TIERED CURRENCY MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;

    // 1. Setup: 1 Diamond (1,000,000,000,000 Copper)
    console.log("[1/3] Setting initial balance to 1 Diamond...");
    await prisma.user.update({
        where: { id: userId },
        data: { copper: 0, silver: 0, gold: 0, platinum: 0, diamond: 1 }
    });

    const initial = await prisma.user.findUnique({ where: { id: userId } });
    console.log(`   Denominations: D:${initial.diamond} P:${initial.platinum} G:${initial.gold} S:${initial.silver} C:${initial.copper}`);

    // 2. Perform Small Transaction (1 Copper)
    console.log("\n[2/3] Deducting 1 Copper (Expect: 999 Platinum, 999 Gold, 999 Silver, 999 Copper)...");
    await prisma.$transaction(async (tx) => {
        await transactionManager.removeCurrency(tx, userId, 1, "MASTER_AUDIT_SMALL_BUY");
    });

    const final = await prisma.user.findUnique({ where: { id: userId } });
    console.log(`   Final: D:${final.diamond} P:${final.platinum} G:${final.gold} S:${final.silver} C:${final.copper}`);

    // 3. Verify Total Math
    const totalCopper = resolver.getTotalCopper(final);
    const expected = 999999999999;
    console.log(`\n[3/3] Verifying total base copper: ${totalCopper}`);
    console.log(`   Expected: ${expected}`);

    // VERDICT
    const breakDownPass = final.diamond === 0 && final.platinum === 999 && final.copper === 999;
    const mathPass = totalCopper === expected;

    if (breakDownPass && mathPass) {
        console.log("\n🌟 FINAL VERDICT: TIERED CURRENCY ARCHITECTURE PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: MASTER AUDIT FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runMasterCurrencyAudit().catch(err => console.error(err));
