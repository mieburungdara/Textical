const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- MAPPING EXPANDED NPCs TO WORLD REGIONS ---");

  const mappings = [
    // REGION 1: Oakhaven (Town)
    { regionId: 1, npcId: 21 }, // Gorton (Gambler)
    { regionId: 1, npcId: 24 }, // Zephyr (Teleporter)
    { regionId: 1, npcId: 27 }, // Elara (Buffer)
    { regionId: 1, npcId: 30 }, // Borin (Upgrader)
    { regionId: 1, npcId: 33 }, // Silas (Collector)
    { regionId: 1, npcId: 34 }, // Varis (Lore)

    // REGION 2: Novice Plain (Wilderness)
    { regionId: 2, npcId: 22 }, // Lennie (Gambler)
    { regionId: 2, npcId: 36 }, // Kael (Quest)

    // REGION 3: Forbidden Grove (Remote)
    { regionId: 3, npcId: 25 }, // Orym (Teleporter)
    { regionId: 3, npcId: 28 }, // Hobb (Buffer)
    { regionId: 3, npcId: 37 }, // Willow (Healer)
  ];

  for (const m of mappings) {
    await prisma.regionNPC.upsert({
        where: { regionId_npcId: { regionId: m.regionId, npcId: m.npcId } },
        update: {},
        create: { regionId: m.regionId, npcId: m.npcId, spawnChance: 1.0 }
    });
  }

  console.log(`✅ ${mappings.length} NPC-Region Mappings established.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
