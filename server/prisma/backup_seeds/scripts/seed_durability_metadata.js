const prisma = require('../db');

async function seedDurability() {
    console.log("🛠️ INITIALIZING DURABILITY METADATA FOR ALL ITEMS...");

    const result = await prisma.inventoryItem.updateMany({
        data: {
            currentDurability: 100,
            maxDurability: 100
        }
    });

    console.log(`✅ Success: Initialized durability for ${result.count} inventory items.`);
}

seedDurability().catch(err => console.error(err));
