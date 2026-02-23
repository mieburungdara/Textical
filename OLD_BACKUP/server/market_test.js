const marketService = require('./src/services/marketService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    console.log("--- TESTING MARKET SERVICE (ROBUST) ---");
    
    // 1. Setup Data
    const user = await prisma.user.findFirst({ include: { inventory: true } });
    if (!user || user.inventory.length === 0) {
        console.log("❌ ERROR: No user or items found. Seed might have failed.");
        process.exit(1);
    }
    const item = user.inventory[0];

    // 2. Town Rule Test
    console.log("1. Testing Town-Only Rule...");
    await prisma.user.update({ where: { id: user.id }, data: { currentRegion: 2 } }); // Region 2 is WILDERNESS
    try {
        await marketService.getActiveListings(user.id);
        console.log("❌ FAILURE: Market browse allowed in Wilderness.");
    } catch (e) {
        console.log("✅ SUCCESS: Blocked market browse in Wilderness.");
    }

    // 3. Dual-Tax Test
    console.log("2. Testing Listing (5% Upfront Tax)...");
    await prisma.user.update({ where: { id: user.id }, data: { currentRegion: 1, gold: 100 } }); // Back to TOWN
    await marketService.listItem(user.id, item.id, 100);
    
    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    console.log(`Initial Gold: 100 | Gold after 100g listing: ${updatedUser.gold} (Expected 95)`);
    if (updatedUser.gold === 95) console.log("✅ SUCCESS: 5% Listing tax deducted.");

    // 4. NPC Sell Test
    console.log("3. Testing NPC Sell (90% Penalty)...");
    const item2 = await prisma.inventoryItem.create({ data: { userId: user.id, templateId: 2005 } }); // Ingot baseValue 10
    await marketService.npcSell(user.id, item2.id);
    const finalUser = await prisma.user.findUnique({ where: { id: user.id } });
    console.log(`Gold after selling item (Base 10): ${finalUser.gold} (Expected 95 + 1 = 96)`);
    if (finalUser.gold === 96) console.log("✅ SUCCESS: 90% NPC penalty enforced.");

    process.exit();
}

test();