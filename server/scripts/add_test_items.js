const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const userId = 1;
    console.log(`--- Adding items to User ID ${userId} ---`);

    const itemsToAdd = [
        { templateId: 101, quantity: 10 },  // Healing Potion
        { templateId: 7002, quantity: 1 },  // Steel Longsword
        { templateId: 7301, quantity: 1 },  // Iron Plate
        { templateId: 7303, quantity: 1 }   // Iron Helm
    ];

    for (const item of itemsToAdd) {
        // Create inventory item
        const newItem = await prisma.inventoryItem.create({
            data: {
                userId: userId,
                templateId: item.templateId,
                quantity: item.quantity
            }
        });
        console.log(`Added: ${item.quantity}x Template ID ${item.templateId} (Instance ID: ${newItem.id})`);
    }

    console.log("--- Items added successfully ---");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
