const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL WOOD CODEX (v2.0 - TOOL REQUIREMENTS) ---");

  const woods = [
    // TIER 1: Foundations (Req Tool: Tier 0)
    { id: 2401, name: "Oak Wood", minToolTier: 0, hardness: 1 },
    { id: 2402, name: "Pine Wood", minToolTier: 0, hardness: 1 },
    { id: 2403, name: "Birch Wood", minToolTier: 0, hardness: 2 },
    { id: 2404, name: "Willow Wood", minToolTier: 0, hardness: 1 },
    { id: 2405, name: "Maple Wood", minToolTier: 0, hardness: 2 },

    // TIER 2: Resilient (Req Tool: Tier 1)
    { id: 2406, name: "Teak Wood", minToolTier: 1, hardness: 3 },
    { id: 2407, name: "Ebony Wood", minToolTier: 1, hardness: 5 },
    { id: 2408, name: "Mahogany Wood", minToolTier: 1, hardness: 4 },
    { id: 2409, name: "Cherry Wood", minToolTier: 1, hardness: 3 },
    { id: 2410, name: "Bamboo", minToolTier: 1, hardness: 2 },

    // TIER 3: Specialized (Req Tool: Tier 2)
    { id: 2411, name: "Yew Wood", minToolTier: 2, hardness: 4 },
    { id: 2412, name: "Elder Wood", minToolTier: 2, hardness: 3 },
    { id: 2413, name: "Ironwood", minToolTier: 2, hardness: 8 },
    { id: 2414, name: "Blood Wood", minToolTier: 2, hardness: 5 },
    { id: 2415, name: "Silver Birch", minToolTier: 2, hardness: 4 },

    // TIER 4: Tactical (Req Tool: Tier 3)
    { id: 2416, name: "Sun Wood", minToolTier: 3, hardness: 5 },
    { id: 2417, name: "Moon Wood", minToolTier: 3, hardness: 5 },
    { id: 2418, name: "Ghost Wood", minToolTier: 3, hardness: 3 },
    { id: 2419, name: "Dragon-Breath Wood", minToolTier: 3, hardness: 7 },
    { id: 2420, name: "Frost-Fir", minToolTier: 3, hardness: 6 },

    // TIER 5: Masterwork (Req Tool: Tier 4)
    { id: 2421, name: "Petrified Wood", minToolTier: 4, hardness: 10 },
    { id: 2422, name: "Sky-Cedar", minToolTier: 4, hardness: 2 },
    { id: 2423, name: "Spirit Wood", minToolTier: 4, hardness: 4 },
    { id: 2424, name: "Abyssal Driftwood", minToolTier: 4, hardness: 8 },
    { id: 2425, name: "World-Tree Branch", minToolTier: 4, hardness: 10 }
  ];

  for (const w of woods) {
    await prisma.itemTemplate.update({
      where: { id: w.id },
      data: { minToolTier: w.minToolTier }
    });
  }

  console.log("✅ 25 Woods updated with Tool Tier Requirements.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });