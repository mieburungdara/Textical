const prisma = require('../db');

async function runHuntingAudit() {
    console.log("--------------------------------------------------");
    console.log("🏹 STARTING HUNTING & LOOT AUDIT (LEATHER)");
    console.log("--------------------------------------------------\n");

    const targets = [
        { name: "Forest Wolf", id: 6003, targetItemId: 2603, expectedChance: 0.60 },
        { name: "Red Dragon", id: 6008, targetItemId: 2621, expectedChance: 0.40 }
    ];

    for (const target of targets) {
        console.log(`🔍 Auditing Loot for: ${target.name}...`);
        
        // Step 1: Fetch Loot Entries
        const lootTable = await prisma.monsterLootEntry.findMany({
            where: { monsterId: target.id }
        });

        if (lootTable.length === 0) {
            console.log(`   ❌ Error: No loot table found for ${target.name}.`);
            continue;
        }

        console.log(`   Found ${lootTable.length} potential drops:`);
        
        for (const entry of lootTable) {
            // Step 2: Manually Fetch Item Metadata to bypass include bug
            const item = await prisma.itemTemplate.findUnique({ where: { id: entry.itemId } });
            console.log(`     - ${item.name}: ${entry.chance * 100}%`);
        }

        const targetEntry = lootTable.find(e => e.itemId === target.targetItemId);
        if (targetEntry && targetEntry.chance === target.expectedChance) {
            console.log(`
   ✅ SUCCESS: ${target.name} loot logic is correct.`);
        } else {
            console.log(`
   ❌ FAILURE: ${target.name} loot logic mismatch.`);
            console.log(`      Found: ${targetEntry?.chance || 'NULL'}, Expected: ${target.expectedChance}`);
        }
        console.log("--------------------------------------------------");
    }

    console.log("\nLegendary Hunting System Audit Complete.");
}

runHuntingAudit().catch(err => console.error(err));
