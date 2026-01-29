const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- INTEGRATING WOOD INTO REGION RESOURCES ---");

  const regionalLoot = {
    1: [2401, 2402, 2403], // Oakhaven Hub: Oak, Pine, Birch
    3: [2412, 2417, 2418], // Crystal Depths: Elder, Moon, Ghost
    4: [2404, 2405, 2409, 2411, 2425], // Elm Forest: Willow, Maple, Cherry, Yew, World-Tree
    5: [2407, 2414, 2415, 2423], // Forbidden Grove: Ebony, Blood, Silver Birch, Spirit
    6: [2419, 2421] // Volcano: Dragon-Breath, Petrified
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
                    gatherTimeSeconds: 12 // Base wood time is slightly faster than ore
                }
            });
        }
    }
  }

  console.log("✅ Forest Resource Integration Complete.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
