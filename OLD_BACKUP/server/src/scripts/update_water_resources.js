const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- INTEGRATING FISH INTO REGION RESOURCES ---");

  const regionalLoot = {
    1: [3301, 3302, 3303, 3304, 3305], // Oakhaven Hub: Common Fish
    3: [3310, 3313, 3317, 3321], // Crystal Depths: Blindfish, Ray, Cod, Leviathan
    4: [3306, 3307, 3311, 3312, 3325], // Elm Forest: Perch, Bass, Moon-Carp, Salmon, World-Tree
    5: [3308, 3309, 3315, 3318, 3320, 3324], // Forbidden Grove: Lobster, Eel, Koi, Jellyfish, Shark, Kraken
    6: [3314, 3316, 3319, 3322, 3323] // Volcano: Obsidian Crab, Golden Tuna, Hydra Bass, Seahorse, Whale
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
                    gatherTimeSeconds: 10 // Fishing is moderately paced
                }
            });
        }
    }
  }

  console.log("✅ Water Resource Integration Complete.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
