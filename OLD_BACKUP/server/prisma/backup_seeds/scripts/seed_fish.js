const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL AQUATIC CODEX (v1.0 - 25 RAW FISH) ---");

  const fish = [
    // TIER 1: Common (IDs 3301-3305)
    { id: 3301, name: "Pond Minnow", category: "MATERIAL", rarity: "COMMON", baseValue: 2, description: "A tiny, ubiquitous fish found in still waters." },
    { id: 3302, name: "River Trout", category: "MATERIAL", rarity: "COMMON", baseValue: 5, description: "A standard freshwater fish with decent flavor." },
    { id: 3303, name: "Gold Carp", category: "MATERIAL", rarity: "COMMON", baseValue: 8, description: "Shiny carp that bring good luck to fishermen." },
    { id: 3304, name: "Mud Catfish", category: "MATERIAL", rarity: "COMMON", baseValue: 6, description: "Bottom-feeders found in murky riverbeds." },
    { id: 3305, name: "Silver Sardine", category: "MATERIAL", rarity: "COMMON", baseValue: 4, description: "Small, schooling fish used for bait and oil." },

    // TIER 2: Uncommon (IDs 3306-3310)
    { id: 3306, name: "Lake Perch", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 25, description: "A prize catch for novice anglers." },
    { id: 3307, name: "Bass of the Deep", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 40, description: "Strong and fighting fish from deep lakes." },
    { id: 3308, name: "Rock Lobster", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 50, description: "Hard-shelled crustacean from coastal rocks." },
    { id: 3309, name: "Venom-Tail Eel", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 45, description: "Slippery eel with a mild paralyzing sting." },
    { id: 3310, name: "Cave Blindfish", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 60, description: "Pale fish that have adapted to total darkness." },

    // TIER 3: Rare (IDs 3311-3315)
    { id: 3311, name: "Moon-Carp", category: "MATERIAL", rarity: "RARE", baseValue: 250, description: "Glows with a soft light under the full moon." },
    { id: 3312, name: "Salmon of Wisdom", category: "MATERIAL", rarity: "RARE", baseValue: 300, description: "Ancient fish said to grant clarity of mind." },
    { id: 3313, name: "Electric Ray", category: "MATERIAL", rarity: "RARE", baseValue: 280, description: "Shocks anything that touches its wings." },
    { id: 3314, name: "Obsidian Crab", category: "MATERIAL", rarity: "RARE", baseValue: 350, description: "Crab with a shell as hard as volcanic glass." },
    { id: 3315, name: "Spirit Koi", category: "MATERIAL", rarity: "RARE", baseValue: 400, description: "Translucent fish that swims between worlds." },

    // TIER 4: Epic (IDs 3316-3320)
    { id: 3316, name: "Golden Tuna", category: "MATERIAL", rarity: "EPIC", baseValue: 1500, description: "A massive, shimmering tuna of immense value." },
    { id: 3317, name: "Glacier Cod", category: "MATERIAL", rarity: "EPIC", baseValue: 1800, description: "Frozen fish harvested from arctic depths." },
    { id: 3318, name: "Void Jellyfish", category: "MATERIAL", rarity: "EPIC", baseValue: 2200, description: "Pulsing with the energy of the void." },
    { id: 3319, name: "Hydra-Fin Bass", category: "MATERIAL", rarity: "EPIC", baseValue: 2500, description: "A multi-finned fish with regenerative scales." },
    { id: 3320, name: "Ghost Shark", category: "MATERIAL", rarity: "EPIC", baseValue: 2800, description: "A terrifying predator that phases through nets." },

    // TIER 5: Legendary (IDs 3321-3325)
    { id: 3321, name: "Leviathan Spawn", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 10000, description: "A juvenile of the great ocean monarchs." },
    { id: 3322, name: "Phoenix Seahorse", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 12000, description: "A seahorse born from underwater volcanic vents." },
    { id: 3323, name: "Celestial Whale-Calf", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 15000, description: "A creature that fell from the starlit sky into the sea." },
    { id: 3324, name: "Abyssal Kraken", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 20000, description: "A fragment of the legendary deep-sea terror." },
    { id: 3325, name: "World-Tree Turtle", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 30000, description: "A tiny turtle carrying the essence of the world's origin." }
  ];

  for (const f of fish) {
    await prisma.itemTemplate.upsert({
      where: { id: f.id },
      update: f,
      create: f
    });
  }

  console.log("✅ 25 Raw Fish Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
