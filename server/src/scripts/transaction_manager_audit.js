const prisma = require('../db');
const transactionManager = require('../services/economy/TransactionManager');
const resolver = require('../logic/economy/CurrencyResolver');

async function runAudit() {
    console.log("--------------------------------------------------");
    console.log("💰 STARTING TRANSACTION MANAGER AUDIT (SILVER-BASED)");
    console.log("--------------------------------------------------\n");

    const userId = 1;

    // 1. Reset to 1000 Silver
    console.log("[1/3] Resetting balance to 1000 silver...");
    await prisma.user.update({ where: { id: userId }, data: { silver: 1000, gold: 0 } });

    // 2. Test addCurrency (Silver-based)
    console.log("[2/3] Adding 500 silver (Quest Reward)...");
    await prisma.$transaction(async (tx) => {
        await transactionManager.addCurrency(tx, userId, 500, "QUEST_REWARD", 10, "QUEST");
    });

    const afterAdd = await prisma.user.findUnique({ where: { id: userId } });
    const totalAfterAdd = resolver.getTotalSilver(afterAdd);
    console.log(`   Balance: ${totalAfterAdd} silver (Expected: 1500)`);

    // 3. Test removeCurrency (Silver-based)
    console.log("[3/3] Removing 300 silver (Market Buy)...");
    await prisma.$transaction(async (tx) => {
        await transactionManager.removeCurrency(tx, userId, 300, "MARKET_BUY", 101, "MARKET");
    });

    const final = await prisma.user.findUnique({ where: { id: userId } });
    const totalFinal = resolver.getTotalSilver(final);
    console.log(`   Final Balance: ${totalFinal} silver (Expected: 1200)`);

    // 4. Verify Ledger
    const ledger = await prisma.transactionLedger.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 2
    });

    console.log("\n📊 LEDGER CHECK:");
    ledger.forEach(entry => {
        console.log(`   [${entry.type}] Delta: ${entry.silverDelta}, Balance: ${entry.silverBalance}, Source: ${entry.sourceType}#${entry.sourceId}`);
    });

    const expectedBalance = BigInt(1200);
    const balancePass = String(totalFinal) === String(expectedBalance);
    const ledgerPass = ledger.length >= 2;
    
    console.log(`   Expected: ${expectedBalance}, Actual: ${totalFinal}, Pass: ${balancePass}`);
    console.log(`   Ledger entries: ${ledger.length}, Pass: ${ledgerPass}`);
    
    const pass = balancePass && ledgerPass;
    if (pass) {
        console.log("\n🌟 FINAL VERDICT: TRANSACTION MANAGER FULLY OPERATIONAL.");
    } else {
        console.log("\n❌ FINAL VERDICT: AUDIT FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runAudit().catch(err => console.error(err));
