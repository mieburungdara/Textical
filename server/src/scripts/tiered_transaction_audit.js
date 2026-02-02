const transactionManager = require('../services/economy/TransactionManager');
const prisma = require('../db');

async function runTieredMathAudit() {
    console.log("--------------------------------------------------");
    console.log("⚖️ STARTING TIERED TRANSACTION AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;

    // 0. Setup: Reset to 0
    console.log("[0/3] Resetting user balance to 0...");
    await prisma.user.update({
        where: { id: userId },
        data: { copper: 0, silver: 0, gold: 0, platinum: 0, diamond: 0 }
    });

    // 1. Test "Carry" (Promotion)
    console.log("[1/3] Adding 1500 Copper (Expect: 1 Silver, 500 Copper)...");
    await prisma.$transaction(async (tx) => {
        await transactionManager.addCurrency(tx, userId, 1500, "TEST_ADD");
    });

    const user1 = await prisma.user.findUnique({ where: { id: userId } });
    console.log(`   Result -> Silver: ${user1.silver}, Copper: ${user1.copper}`);

    // 2. Test "Borrow" (Breaking higher tiers)
    console.log("\n[2/3] Deducting 600 Copper (Expect: 0 Silver, 900 Copper)...");
    await prisma.$transaction(async (tx) => {
        await transactionManager.removeCurrency(tx, userId, 600, "TEST_REMOVE");
    });

    const user2 = await prisma.user.findUnique({ where: { id: userId } });
    console.log(`   Result -> Silver: ${user2.silver}, Copper: ${user2.copper}`);

    // 3. Test High Tier Carry
    console.log("\n[3/3] Adding 1,000,000 Copper (Expect: +1 Gold)...");
    await prisma.$transaction(async (tx) => {
        await transactionManager.addCurrency(tx, userId, 1000000, "TEST_GOLD");
    });

    const user3 = await prisma.user.findUnique({ where: { id: userId } });
    console.log(`   Result -> Gold: ${user3.gold}, Silver: ${user3.silver}, Copper: ${user3.copper}`);

    // VERDICT
    const carryPass = user1.silver === 1 && user1.copper === 500;
    const borrowPass = user2.silver === 0 && user2.copper === 900;
    const goldPass = user3.gold === 1 && user3.silver === 0 && user3.copper === 900;

    if (carryPass && borrowPass && goldPass) {
        console.log("\n🌟 FINAL VERDICT: TIERED TRANSACTION MATH PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: TIERED MATH FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runTieredMathAudit().catch(err => console.error(err));
