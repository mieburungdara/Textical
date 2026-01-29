const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL WOOD CODEX (v1.0 - 25 UNIQUE TIMBERS) ---");

  const woods = [
    // TIER 1: Foundations (IDs 2401-2405)
    { id: 2401, name: "Oak Wood", category: "MATERIAL", baseValue: 2, rarity: "COMMON", hardness: 1, description: "Standard wood used for handles and basic tools." },
    { id: 2402, name: "Pine Wood", category: "MATERIAL", baseValue: 3, rarity: "COMMON", hardness: 1, description: "Light wood ideal for arrows." },
    { id: 2403, name: "Birch Wood", category: "MATERIAL", baseValue: 4, rarity: "COMMON", hardness: 2, description: "Flexible wood for polearms." },
    { id: 2404, name: "Willow Wood", category: "MATERIAL", baseValue: 5, rarity: "COMMON", hardness: 1, description: "Magic-receptive wood for wands." },
    { id: 2405, name: "Maple Wood", category: "MATERIAL", baseValue: 4, rarity: "COMMON", hardness: 2, description: "Shock-absorbent wood for shields." },

    // TIER 2: Resilient (IDs 2406-2410)
    { id: 2406, name: "Teak Wood", category: "MATERIAL", baseValue: 20, rarity: "UNCOMMON", hardness: 3, description: "Water-resistant wood from the coast." },
    { id: 2407, name: "Ebony Wood", category: "MATERIAL", baseValue: 35, rarity: "UNCOMMON", hardness: 5, description: "Heavy and dense wood for precision." },
    { id: 2408, name: "Mahogany Wood", category: "MATERIAL", baseValue: 30, rarity: "UNCOMMON", hardness: 4, description: "Prestigious and expensive timber." },
    { id: 2409, name: "Cherry Wood", category: "MATERIAL", baseValue: 25, rarity: "UNCOMMON", hardness: 3, description: "Fruit-bearing wood used for speed." },
    { id: 2410, name: "Bamboo", category: "MATERIAL", baseValue: 15, rarity: "UNCOMMON", hardness: 2, description: "Ultra-light hollow stalks." },

    // TIER 3: Specialized (IDs 2411-2415)
    { id: 2411, name: "Yew Wood", category: "MATERIAL", baseValue: 120, rarity: "RARE", hardness: 4, description: "The definitive choice for longbows." },
    { id: 2412, name: "Elder Wood", category: "MATERIAL", baseValue: 150, rarity: "RARE", hardness: 3, description: "Ancient wood with magic resonance." },
    { id: 2413, name: "Ironwood", category: "MATERIAL", baseValue: 200, rarity: "RARE", hardness: 8, description: "Wood that is harder than most steels." },
    { id: 2414, name: "Blood Wood", category: "MATERIAL", baseValue: 180, rarity: "RARE", hardness: 5, description: "A dark crimson wood that pulses." },
    { id: 2415, name: "Silver Birch", category: "MATERIAL", baseValue: 160, rarity: "RARE", hardness: 4, description: "A bright white wood used for holy tools." },

    // TIER 4: Tactical (IDs 2416-2420)
    { id: 2416, name: "Sun Wood", category: "MATERIAL", baseValue: 800, rarity: "EPIC", hardness: 5, description: "Absorbs and radiates sunlight." },
    { id: 2417, name: "Moon Wood", category: "MATERIAL", baseValue: 800, rarity: "EPIC", hardness: 5, description: "Glows with a soft lunar light." },
    { id: 2418, name: "Ghost Wood", category: "MATERIAL", baseValue: 1000, rarity: "EPIC", hardness: 3, description: "Exists between planes of reality." },
    { id: 2419, name: "Dragon-Breath Wood", category: "MATERIAL", baseValue: 1200, rarity: "EPIC", hardness: 7, description: "Petrified wood from ancient nests." },
    { id: 2420, name: "Frost-Fir", category: "MATERIAL", baseValue: 900, rarity: "EPIC", hardness: 6, description: "Wood that never melts." },

    // TIER 5: Masterwork (IDs 2421-2425)
    { id: 2421, name: "Petrified Wood", category: "MATERIAL", baseValue: 4000, rarity: "LEGENDARY", hardness: 10, description: "Ancient wood turned to stone." },
    { id: 2422, name: "Sky-Cedar", category: "MATERIAL", baseValue: 5500, rarity: "LEGENDARY", hardness: 2, description: "Light enough to drift in the wind." },
    { id: 2423, name: "Spirit Wood", category: "MATERIAL", baseValue: 6000, rarity: "LEGENDARY", hardness: 4, description: "Linked to the essence of spirits." },
    { id: 2424, name: "Abyssal Driftwood", category: "MATERIAL", baseValue: 7000, rarity: "LEGENDARY", hardness: 8, description: "Timber from the crushing void ocean." },
    { id: 2425, name: "World-Tree Branch", category: "MATERIAL", baseValue: 10000, rarity: "LEGENDARY", hardness: 10, description: "A tiny piece of the world's origin." }
  ];

  for (const w of woods) {
    await prisma.itemTemplate.upsert({
      where: { id: w.id },
      update: w,
      create: w
    });
  }

  console.log("✅ 25 Unique Woods Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
