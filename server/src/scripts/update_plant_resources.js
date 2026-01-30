const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- INTEGRATING PLANTS INTO REGION RESOURCES ---");

  const regionalLoot = {
    1: [2801, 2802, 2803, 2804, 2805], // Oakhaven Hub: Common Herbs
    3: [2813, 2814, 2817], // Crystal Depths: Ice Lotus, Lightning Moss, Moon-Lily
    4: [2806, 2807, 2808, 2809, 2825], // Elm Forest: Ginseng, Silverleaf, Garlic, Dandelion, World-Tree
    5: [2810, 2811, 2815, 2818, 2820, 2823], // Forbidden Grove: Amanita, Mandrake, Void Petal, Blood-Rose, Ghost-Grass, Spirit-Fern
    6: [2812, 2816, 2819, 2821] // Volcano: Fireweed, Sun-Sunflower, Dragon-Lily, Petrified Moss
  };

  for (const [regionId, itemIds] of Object.entries(regionalLoot)) {
    const rid = parseInt(regionId);
    console.log(`   Syncing Region ${rid}...`);
    
    for (const itemId of itemIds) {
        const existing = await prisma.regionResource.findFirst({
            where: { regionId: rid, itemId: itemId }
        });

        if (!existing) {
            await prisma.regionResource.create({
                data: {
                    regionId: rid,
                    itemId: itemId,
                    gatherTimeSeconds: 8 // Foraging is faster than lumbering/mining
                }
            });
        }
    }
  }

  console.log("✅ Herbal Resource Integration Complete.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
