const inventoryService = require('../services/inventoryService');
const prisma = require('../db');

async function runInventoryAudit() {
    console.log("--------------------------------------------------");
    console.log("🎒 STARTING INVENTORY MULTI-STACK MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const potionId = 101; // Healing Potion
    const swordId = 7001; // Iron Broadsword

    // 0. Setup: Clean everything related to this user
    console.log("[0/4] Preparing items and limits...");
    await prisma.marketOrder.deleteMany({ where: { creatorId: userId } });
    await prisma.heroEquipment.deleteMany({ where: { hero: { userId } } });
    await prisma.inventoryItem.deleteMany({ where: { userId } });
    
    // Ensure Templates Exist
    await prisma.itemTemplate.upsert({
        where: { id: potionId },
        update: { maxStack: 10 },
        create: { id: potionId, name: "Healing Potion", description: "Heals HP", category: "CONSUMABLE", maxStack: 10 }
    });
    await prisma.itemTemplate.upsert({
        where: { id: swordId },
        update: { maxStack: 1 },
        create: { id: swordId, name: "Iron Broadsword", description: "A simple sword", category: "EQUIPMENT", maxStack: 1 }
    });

    await prisma.user.update({ where: { id: userId }, data: { maxInventorySlots: 20 } });

    // 1. Test Multi-Stack (Potions)
    console.log("[1/4] Adding 25 Potions (Max Stack: 10)...");
    await inventoryService.addItem(userId, potionId, 25);
    
    const potionSlots = await prisma.inventoryItem.findMany({ where: { userId, templateId: potionId } });
    console.log(`   Slots created: ${potionSlots.length} (Expected: 3)`);
    potionSlots.forEach((s, i) => console.log(`      Slot ${i+1} Qty: ${s.quantity}`));

    // 2. Test Smart Filling
    console.log("[2/4] Adding 3 more Potions (Should fill existing stack)...");
    await inventoryService.addItem(userId, potionId, 3);
    const updatedPotions = await prisma.inventoryItem.findMany({ where: { userId, templateId: potionId }, orderBy: { id: 'asc' } });
    console.log(`   Updated Slot 3 Qty: ${updatedPotions[2].quantity} (Expected: 8)`);
    console.log(`   Total Slots: ${updatedPotions.length} (Expected: 3)`);

    // 3. Test Non-Stackable (Swords)
    console.log("[3/4] Adding 5 Swords (Max Stack: 1)...");
    await inventoryService.addItem(userId, swordId, 5);
    const swordSlots = await prisma.inventoryItem.findMany({ where: { userId, templateId: swordId } });
    console.log(`   Sword Slots created: ${swordSlots.length} (Expected: 5)`);

    // 4. Test Capacity Enforcement
    console.log("[4/4] Testing capacity limit (Adding 15 more swords)...");
    try {
        await inventoryService.addItem(userId, swordId, 15);
        console.log("   ❌ Error: Capacity check failed (Should have thrown error)");
    } catch (e) {
        console.log(`   ✅ Expected Failure: ${e.message}`);
    }

    // VERDICT
    const potionPass = potionSlots.length === 3 && updatedPotions[2].quantity === 8;
    const swordPass = swordSlots.length === 5;
    
    if (potionPass && swordPass) {
        console.log("\n🌟 FINAL VERDICT: INVENTORY MULTI-STACKING SYSTEM PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: AUDIT FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runInventoryAudit().catch(err => console.error(err));
