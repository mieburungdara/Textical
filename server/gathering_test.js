const gatheringService = require('./src/services/gatheringService');
const taskProcessor = require('./src/services/taskProcessor');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    console.log("--- TESTING GATHERING SERVICE (ROBUST) ---");
    
    // 1. Setup - Move user to the resource region
    const user = await prisma.user.findFirst();
    const resource = await prisma.regionResource.findFirst(); // Ingot is in Region 2
    
    await prisma.user.update({
        where: { id: user.id },
        data: { currentRegion: resource.regionId, vitality: 100 }
    });

    const hero = await prisma.hero.findFirst({ where: { userId: user.id } });

    console.log(`Initial Vitality: 100`);
    console.log(`Location: Region ${resource.regionId} | Targeting Item: ${resource.itemId}`);

    // 2. Start Gathering
    console.log("1. Starting Gathering Task...");
    await gatheringService.startGathering(user.id, hero.id, resource.id);
    
    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    console.log(`Vitality after start: ${updatedUser.vitality} (Expected 97)`);

    // 3. Wait for Heartbeat
    console.log("2. Waiting for 12 seconds (10s Timer + Heartbeat)...");
    taskProcessor.start();
    await new Promise(r => setTimeout(r, 12000));
    taskProcessor.stop();

    // 4. Verify Inventory
    const inv = await prisma.inventoryItem.findFirst({
        where: { userId: user.id, templateId: resource.itemId }
    });

    if (inv && inv.quantity > 0) {
        console.log(`✅ SUCCESS: Item ${resource.itemId} found in inventory (Qty: ${inv.quantity})`);
    } else {
        console.log("❌ FAILURE: Item not found in inventory.");
    }

    process.exit();
}

test();