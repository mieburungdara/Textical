const sortService = require('../services/inventorySortService');
const prisma = require('../db');

async function runInventorySortAudit() {
    console.log("--------------------------------------------------");
    console.log("🧹 STARTING INVENTORY SORT & MERGE MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const potionId = 101; // maxStack 10
    const ironOreId = 2201; // maxStack 99
    const swordId = 7001; // maxStack 1

    // 0. Setup: Clean messy state
    console.log("[0/4] Preparing messy inventory...");
    await prisma.marketOrder.deleteMany({ where: { creatorId: userId } });
    await prisma.heroEquipment.deleteMany({ where: { hero: { userId } } });
    await prisma.inventoryItem.deleteMany({ where: { userId } });
    
    await prisma.itemTemplate.upsert({
        where: { id: potionId },
        update: { maxStack: 10, category: "CONSUMABLE", rarity: "COMMON" },
        create: { id: potionId, name: "Healing Potion", category: "CONSUMABLE", rarity: "COMMON", maxStack: 10, description: "Heals" }
    });
    await prisma.itemTemplate.upsert({
        where: { id: ironOreId },
        update: { maxStack: 99, category: "MATERIAL", rarity: "COMMON" },
        create: { id: ironOreId, name: "Iron Ore", category: "MATERIAL", rarity: "COMMON", maxStack: 99, description: "Metal" }
    });
    await prisma.itemTemplate.upsert({
        where: { id: swordId },
        update: { maxStack: 1, category: "EQUIPMENT", rarity: "UNCOMMON" },
        create: { id: swordId, name: "Iron Broadsword", category: "EQUIPMENT", rarity: "UNCOMMON", maxStack: 1, description: "Sword" }
    });

    // Create mess manually (SQLite compatible)
    const messyData = [
        { userId, templateId: potionId, quantity: 4 },
        { userId, templateId: potionId, quantity: 4 },
        { userId, templateId: potionId, quantity: 4 },
        { userId, templateId: ironOreId, quantity: 5 },
        { userId, templateId: ironOreId, quantity: 5 },
        { userId, templateId: swordId, quantity: 1 }
    ];

    for (const data of messyData) {
        await prisma.inventoryItem.create({ data });
    }

    console.log("   Initial state: 6 rows created.");

    // 1. Run Sort & Merge
    console.log("[1/4] Running Sort & Merge service...");
    const sorted = await sortService.sortAndMerge(userId);

    // 2. Verify Consolidation
    console.log("[2/4] Verifying consolidation...");
    const potionRows = sorted.filter(i => i.templateId === potionId);
    const oreRows = sorted.filter(i => i.templateId === ironOreId);
    
    console.log(`   Potion Rows: ${potionRows.length} (Expected: 2 -> 10 and 2)`);
    console.log(`   Ore Rows: ${oreRows.length} (Expected: 1 -> 10)`);

    // 3. Verify Conservation of Quantity
    console.log("[3/4] Verifying quantity conservation...");
    const totalPotions = potionRows.reduce((acc, curr) => acc + curr.quantity, 0);
    const totalOre = oreRows.reduce((acc, curr) => acc + curr.quantity, 0);
    
    console.log(`   Total Potions: ${totalPotions} (Expected: 12)`);
    console.log(`   Total Ore: ${totalOre} (Expected: 10)`);

    // 4. Verify Sort Order
    console.log("[4/4] Verifying sort order (Category: EQUIP > CONS > MAT)...");
    const categories = sorted.map(i => i.template.category);
    console.log(`   Order: ${categories.join(" -> ")}`);

    // VERDICT
    const consolidationPass = potionRows.length === 2 && oreRows.length === 1;
    const conservationPass = totalPotions === 12 && totalOre === 10;
    const sortPass = categories[0] === "EQUIPMENT" && categories[1] === "CONSUMABLE";

    if (consolidationPass && conservationPass && sortPass) {
        console.log("\n🌟 FINAL VERDICT: INVENTORY SORT & MERGE SYSTEM PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: AUDIT FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runInventorySortAudit().catch(err => console.error(err));