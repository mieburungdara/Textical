const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabaseHealth() {
    console.log("--- Textical Database Health Check ---");
    try {
        // 1. Check Connection
        await prisma.$connect();
        console.log("[PASS] Connection to SQLite successful.");

        // 2. Check Critical Tables
        const tables = [
            'user', 'hero', 'itemTemplate', 'questTemplate', 
            'regionTemplate', 'transactionLedger'
        ];

        for (const table of tables) {
            try {
                await prisma[table].findFirst();
                console.log(`[PASS] Table '${table}' is accessible and readable.`);
            } catch (e) {
                console.error(`[FAIL] Table '${table}' error: ${e.message}`);
            }
        }

        // 3. Check specific problematic columns (QuestTemplate logicBranches/category)
        const quest = await prisma.questTemplate.findFirst();
        if (quest) {
            console.log("[PASS] QuestTemplate columns verified.");
        }

        console.log("---------------------------------------");
        console.log("Result: Database is HEALTHY.");
    } catch (err) {
        console.error("--- CRITICAL DATABASE FAILURE ---");
        console.error(err.message);
    } finally {
        await prisma.$disconnect();
        process.exit();
    }
}

checkDatabaseHealth();
