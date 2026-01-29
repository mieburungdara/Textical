const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SAFE INTEGRATION: MINERALS INTO REGION RESOURCES ---");

  const regionalLoot = {
    1: [2201, 2208, 2210], 
    2: [2203, 2204, 2215], 
    3: [2211, 2220, 2222], 
    4: [2209, 2214, 2224], 
    5: [2212, 2218, 2223]  
  };

  for (const [regionId, itemIds] of Object.entries(regionalLoot)) {
    const rid = parseInt(regionId);
    console.log(`   Syncing Region ${rid}...`);
    
    for (const itemId of itemIds) {
        // Upsert based on compound unique if available, or findFirst then create
        const existing = await prisma.regionResource.findFirst({
            where: { regionId: rid, itemId: itemId }
        });

        if (!existing) {
            await prisma.regionResource.create({
                data: {
                    regionId: rid,
                    itemId: itemId,
                    gatherTimeSeconds: 15
                }
            });
        }
    }
  }

  console.log("✅ Region Mineral Integration Complete.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });