const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL REFINED AQUATIC MATERIALS (v1.0 - 25 PREPARED FISH) ---");

  const materials = [
    // TIER 1: Foundations (IDs 3401-3405)
    { id: 3401, name: "Fish Fillet", category: "MATERIAL", rarity: "COMMON", baseValue: 5, description: "A simple fillet of common fish." },
    { id: 3402, name: "Trout Steak", category: "MATERIAL", rarity: "COMMON", baseValue: 12, description: "A fresh river trout steak." },
    { id: 3403, name: "Golden Scales", category: "MATERIAL", rarity: "COMMON", baseValue: 20, description: "Polished scales from a Gold Carp." },
    { id: 3404, name: "Catfish Belly", category: "MATERIAL", rarity: "COMMON", baseValue: 15, description: "Rich, oily meat from a mud catfish." },
    { id: 3405, name: "Sardine Oil", category: "MATERIAL", rarity: "COMMON", baseValue: 10, description: "Refined oil from silver sardines." },

    // TIER 2: Resilient (IDs 3406-3410)
    { id: 3406, name: "Perch Roe", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 60, description: "Delicate lake perch eggs." },
    { id: 3407, name: "Deep-Bass Fins", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 90, description: "Strong fins used for stabilizing gear." },
    { id: 3408, name: "Lobster Tail", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 120, description: "Succulent meat from a rock lobster." },
    { id: 3409, name: "Paralyzing Venom", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 100, description: "Extracted venom from a venom-tail eel." },
    { id: 3410, name: "Bioluminescent Eye", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 150, description: "A glowing eye from a cave blindfish." },

    // TIER 3: Specialized (IDs 3411-3415)
    { id: 3411, name: "Glow-Fillet", category: "MATERIAL", rarity: "RARE", baseValue: 600, description: "Fillet that retains its moonlight glow." },
    { id: 3412, name: "Wisdom-Brain", category: "MATERIAL", rarity: "RARE", baseValue: 800, description: "The brain of a salmon of wisdom, used in INT potions." },
    { id: 3413, name: "Electric Gland", category: "MATERIAL", rarity: "RARE", baseValue: 700, description: "A highly conductive organ from an electric ray." },
    { id: 3414, name: "Obsidian Claw", category: "MATERIAL", rarity: "RARE", baseValue: 900, description: "A razor-sharp claw from an obsidian crab." },
    { id: 3415, name: "Spirit Essence", category: "MATERIAL", rarity: "RARE", baseValue: 1000, description: "Ethereal residue from a spirit koi." },

    // TIER 4: Epic (IDs 3416-3420)
    { id: 3416, name: "Gold-Leaf Tuna Steak", category: "MATERIAL", rarity: "EPIC", baseValue: 4000, description: "Premium meat from a golden tuna." },
    { id: 3417, name: "Ever-Frost Scale", category: "MATERIAL", rarity: "EPIC", baseValue: 4500, description: "Scales that never thaw." },
    { id: 3418, name: "Void Tentacle", category: "MATERIAL", rarity: "EPIC", baseValue: 5500, description: "A writhing tentacle from a void jellyfish." },
    { id: 3419, name: "Hydra-Regen Meat", category: "MATERIAL", rarity: "EPIC", baseValue: 6000, description: "Meat that pulses with rapid cell growth." },
    { id: 3420, name: "Shadow-Fin", category: "MATERIAL", rarity: "EPIC", baseValue: 7000, description: "A fin that is hard to track with the naked eye." },

    // TIER 5: Masterwork (IDs 3421-3425)
    { id: 3421, name: "Leviathan Heart-Shard", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 25000, description: "A fragment of an ocean monarch's heart." },
    { id: 3422, name: "Volcanic Shell", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 30000, description: "Indestructible shell from a phoenix seahorse." },
    { id: 3423, name: "Stardust Ambergris", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 35000, description: "Celestial residue from a sky-whale." },
    { id: 3424, name: "Kraken Calamari", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 45000, description: "The most legendary delicacy in the world." },
    { id: 3425, name: "World-Shell Plate", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 60000, description: "A piece of the world-tree turtle's shell." }
  ];

  for (const m of materials) {
    await prisma.itemTemplate.upsert({
      where: { id: m.id },
      update: m,
      create: m
    });
  }

  console.log("✅ 25 Prepared Fish Materials Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
