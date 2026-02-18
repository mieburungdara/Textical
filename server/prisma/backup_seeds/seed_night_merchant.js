const prisma = require('../src/db');

async function main() {
    console.log("=== SEEDING WANDERING NIGHT MERCHANT ===");

    try {
        // 1. Create the NPCTemplate
        const nightMerchantId = 9001;
        await prisma.nPCTemplate.upsert({
            where: { id: nightMerchantId },
            update: {
                name: "Zalthar the Shadow Peddler",
                title: "Night Merchant",
                type: "TRADER",
                description: "A mysterious figure cloaked in shadows.",
                active_time: "NIGHT",
                travelCost: 0
            },
            create: {
                id: nightMerchantId,
                name: "Zalthar the Shadow Peddler",
                title: "Night Merchant",
                type: "TRADER",
                description: "A mysterious figure cloaked in shadows.",
                active_time: "NIGHT",
                travelCost: 0
            }
        });

        // 2. Map to a region (e.g., Region 1)
        await prisma.regionNPC.deleteMany({
            where: { regionId: 1, npcId: nightMerchantId }
        });
        await prisma.regionNPC.create({
            data: {
                regionId: 1,
                npcId: nightMerchantId
            }
        });

        // 3. Add items
        const nightItems = [
            { id: 6001, name: "Glowstone Dust", price: 100 },
            { id: 6002, name: "Shadow Essence", price: 400 }
        ];

        for (const item of nightItems) {
            await prisma.itemTemplate.upsert({
                where: { id: item.id },
                update: { 
                    name: item.name, 
                    category: "MATERIAL", 
                    rarity: item.id === 6001 ? "UNCOMMON" : "RARE",
                    description: "Mysterious night material."
                },
                create: {
                    id: item.id,
                    name: item.name,
                    description: "Mysterious night material.",
                    category: "MATERIAL",
                    rarity: item.id === 6001 ? "UNCOMMON" : "RARE",
                    baseValue: item.price / 2
                }
            });

            // Cleanup potential old stock to avoid unique constraint issues if we changed logic
            await prisma.nPCShopItem.deleteMany({
                where: { npcId: nightMerchantId, itemId: item.id }
            });

            await prisma.nPCShopItem.create({
                data: {
                    npcId: nightMerchantId,
                    itemId: item.id,
                    priceGold: item.price,
                    stock: 10
                }
            });

            await prisma.shopStock.upsert({
                where: { 
                    npcId_regionId_templateId: { 
                        npcId: nightMerchantId, 
                        regionId: 1, 
                        templateId: item.id
                    } 
                },
                update: { quantity: 10, nextRestock: new Date(Date.now() + 3600000) },
                create: {
                    npcId: nightMerchantId,
                    regionId: 1,
                    templateId: item.id,
                    quantity: 10,
                    maxQuantity: 50,
                    nextRestock: new Date(Date.now() + 3600000)
                }
            });
        }

        console.log("  ✅ Zalthar and his wares have been successfully integrated into the world.");
    } catch (error) {
        console.error("  ❌ Seeding failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
