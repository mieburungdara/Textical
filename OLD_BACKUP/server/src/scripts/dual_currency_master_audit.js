const transactionManager = require('../services/economy/TransactionManager');
const resolver = require('../logic/economy/CurrencyResolver');
const prisma = require('../db');

async function runMasterDualAudit() {
    console.log("--------------------------------------------------");
    console.log("💰 STARTING DUAL-CURRENCY MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;

    // 1. Setup: 1 Gold
    console.log("[1/3] Setting initial balance to 1 Gold...");
    await prisma.user.update({
        where: { id: userId },
        data: { silver: 0, gold: 1 }
    });

    const initial = await prisma.user.findUnique({ where: { id: userId } });
    console.log(`   Denominations: G:${initial.gold} S:${initial.silver}`);

    // 2. Perform Small Transaction (100 Silver)
    console.log("\n[2/3] Deducting 100 Silver (Expect: 0 Gold, 999,900 Silver)...");
    await prisma.$transaction(async (tx) => {
        await transactionManager.removeCurrency(tx, userId, 100, "MASTER_DUAL_SMALL_BUY");
    });

    const final = await prisma.user.findUnique({ where: { id: userId } });
    console.log(`   Final: G:${final.gold} S:${final.silver}`);

    // 3. Verify Total Math
    const totalSilver = resolver.getTotalSilver(final);
    const expected = 999900;
    console.log(`\n[3/3] Verifying total base silver: ${totalSilver}`);
    console.log(`   Expected: ${expected}`);

    // VERDICT
    const breakdownPass = final.gold === 0 && final.silver === 999900;
    const mathPass = BigInt(totalSilver) === BigInt(expected);

    if (breakdownPass && mathPass) {
        console.log("\n🌟 FINAL VERDICT: DUAL-CURRENCY ARCHITECTURE PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: MASTER AUDIT FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runMasterDualAudit().catch(err => console.error(err));
