const prisma = require('../db');
const transactionManager = require('../services/economy/TransactionManager');

async function runAudit() {
    console.log("--------------------------------------------------");
    console.log("💰 STARTING TRANSACTION MANAGER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;

    // 1. Reset Gold
    console.log("[1/3] Resetting gold to 1000...");
    await prisma.user.update({ where: { id: userId }, data: { gold: 1000 } });

    // 2. Test addGold
    console.log("[2/3] Adding 500 gold (Quest Reward)...");
    await prisma.$transaction(async (tx) => {
        await transactionManager.addGold(tx, userId, 500, "QUEST_REWARD", 10, "QUEST");
    });

    const afterAdd = await prisma.user.findUnique({ where: { id: userId } });
    console.log(`   Balance: ${afterAdd.gold} (Expected: 1500)`);

    // 3. Test removeGold
    console.log("[3/3] Removing 300 gold (Market Buy)...");
    await prisma.$transaction(async (tx) => {
        await transactionManager.removeGold(tx, userId, 300, "MARKET_BUY", 101, "MARKET");
    });

    const final = await prisma.user.findUnique({ where: { id: userId } });
    console.log(`   Final Balance: ${final.gold} (Expected: 1200)`);

    // 4. Verify Ledger
    const ledger = await prisma.transactionLedger.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 2
    });

    console.log("\n📊 LEDGER CHECK:");
    ledger.forEach(entry => {
        console.log(`   [${entry.type}] Delta: ${entry.amountDelta}, New Bal: ${entry.newBalance}, Source: ${entry.sourceType}#${entry.sourceId}`);
    });

    if (final.gold === 1200 && ledger.length === 2) {
        console.log("\n🌟 FINAL VERDICT: TRANSACTION MANAGER FULLY OPERATIONAL.");
    } else {
        console.log("\n❌ FINAL VERDICT: AUDIT FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runAudit().catch(err => console.error(err));
