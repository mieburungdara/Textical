const transactionManager = require('../services/economy/TransactionManager');
const prisma = require('../db');

async function runDualTransactionAudit() {
    console.log("--------------------------------------------------");
    console.log("⚖️ STARTING DUAL-CURRENCY TRANSACTION AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;

    // 0. Setup: Reset
    console.log("[0/3] Resetting user balance to 0...");
    await prisma.user.update({
        where: { id: userId },
        data: { silver: 0, gold: 0 }
    });

    // 1. Test Promotion (Silver -> Gold)
    console.log("[1/3] Adding 2,500,000 Silver (Expect: 2 Gold, 500,000 Silver)...");
    await prisma.$transaction(async (tx) => {
        await transactionManager.addCurrency(tx, userId, 2500000, "DUAL_TEST_ADD");
    });

    const user1 = await prisma.user.findUnique({ where: { id: userId } });
    console.log(`   Result -> Gold: ${user1.gold}, Silver: ${user1.silver}`);

    // 2. Test Breakdown (Gold -> Silver)
    console.log("\n[2/3] Deducting 600,000 Silver (Expect: 1 Gold, 900,000 Silver)...");
    await prisma.$transaction(async (tx) => {
        await transactionManager.removeCurrency(tx, userId, 600000, "DUAL_TEST_SUB");
    });

    const user2 = await prisma.user.findUnique({ where: { id: userId } });
    console.log(`   Result -> Gold: ${user2.gold}, Silver: ${user2.silver}`);

    // 3. Test High Value
    console.log("\n[3/3] Deducting another 1,000,000 Silver (Expect: 0 Gold, 900,000 Silver)...");
    await prisma.$transaction(async (tx) => {
        await transactionManager.removeCurrency(tx, userId, 1000000, "DUAL_TEST_SUB_LARGE");
    });

    const user3 = await prisma.user.findUnique({ where: { id: userId } });
    console.log(`   Result -> Gold: ${user3.gold}, Silver: ${user3.silver}`);

    // VERDICT
    const promoPass = user1.gold === 2 && user1.silver === 500000;
    const subPass = user2.gold === 1 && user2.silver === 900000;
    const finalPass = user3.gold === 0 && user3.silver === 900000;

    if (promoPass && subPass && finalPass) {
        console.log("\n🌟 FINAL VERDICT: DUAL-CURRENCY TRANSACTION MATH PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: DUAL MATH FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runDualTransactionAudit().catch(err => console.error(err));
