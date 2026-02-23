const economyService = require('../services/economyService');
const prisma = require('../db');

async function runAudit() {
    console.log("--------------------------------------------------");
    console.log("💰 STARTING ECONOMY SERVICE INTEGRITY AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;

    // 1. Check Initial Balance
    const initial = await economyService.getBalance(userId);
    console.log(`[1/3] Initial Balance: ${initial}`);

    // 2. Test Credit
    console.log("[2/3] Crediting 1000 gold...");
    await economyService.creditUser(userId, 1000, "ADMIN_AWARD", 999, "ADMIN");
    const afterCredit = await economyService.getBalance(userId);
    console.log(`   Balance: ${afterCredit} (Expected: ${initial + 1000})`);

    // 3. Test Debit
    console.log("[3/3] Debiting 500 gold...");
    await economyService.debitUser(userId, 500, "MARKET_FEE", 101, "MARKET");
    const afterDebit = await economyService.getBalance(userId);
    console.log(`   Balance: ${afterDebit} (Expected: ${initial + 500})`);

    // 4. Verify Ledger Integrity
    const ledgerCount = await prisma.transactionLedger.count({ where: { userId } });
    console.log(`\n📊 LEDGER INTEGRITY: ${ledgerCount} entries found for user.`);

    if (afterDebit === initial + 500 && ledgerCount >= 2) {
        console.log("\n🌟 FINAL VERDICT: ECONOMY SERVICE MODULARITY VERIFIED.");
    } else {
        console.log("\n❌ FINAL VERDICT: AUDIT FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runAudit().catch(err => console.error(err));
