const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL REFINED PLANKS (v1.0 - 25 WOOD PLANKS) ---");

  const planks = [
    // TIER 1: Foundations (IDs 2901-2905)
    { id: 2901, name: "Oak Plank", category: "MATERIAL", rarity: "COMMON", baseValue: 8, description: "Smooth oak plank for construction." },
    { id: 2902, name: "Pine Plank", category: "MATERIAL", rarity: "COMMON", baseValue: 10, description: "Resinous pine plank, good for arrows." },
    { id: 2903, name: "Birch Plank", category: "MATERIAL", rarity: "COMMON", baseValue: 12, description: "Flexible birch plank for polearms." },
    { id: 2904, name: "Willow Plank", category: "MATERIAL", rarity: "COMMON", baseValue: 15, description: "Supple willow plank for wands." },
    { id: 2905, name: "Maple Plank", category: "MATERIAL", rarity: "COMMON", baseValue: 12, description: "Sturdy maple plank for shields." },

    // TIER 2: Resilient (IDs 2906-2910)
    { id: 2906, name: "Teak Plank", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 50, description: "Water-resistant plank from the coast." },
    { id: 2907, name: "Ebony Plank", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 90, description: "Dense and heavy blackwood plank." },
    { id: 2908, name: "Mahogany Plank", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 75, description: "Rich mahogany plank for luxury gear." },
    { id: 2909, name: "Cherry Plank", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 65, description: "Lightweight cherry wood plank." },
    { id: 2910, name: "Bamboo Slat", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 40, description: "Reinforced bamboo for light tools." },

    // TIER 3: Specialized (IDs 2911-2915)
    { id: 2911, name: "Yew Plank", category: "MATERIAL", rarity: "RARE", baseValue: 300, description: "The premier material for legendary bows." },
    { id: 2912, name: "Elder Plank", category: "MATERIAL", rarity: "RARE", baseValue: 350, description: "Ancient wood plank with high mana flow." },
    { id: 2913, name: "Ironwood Plank", category: "MATERIAL", rarity: "RARE", baseValue: 450, description: "Plank that is hard as steel." },
    { id: 2914, name: "Bloodwood Plank", category: "MATERIAL", rarity: "RARE", baseValue: 400, description: "Crimson-stained plank with vitality." },
    { id: 2915, name: "Silver Birch Plank", category: "MATERIAL", rarity: "RARE", baseValue: 380, description: "Purified white wood for holy tools." },

    // TIER 4: Tactical (IDs 2916-2920)
    { id: 2916, name: "Sunwood Plank", category: "MATERIAL", rarity: "EPIC", baseValue: 1800, description: "Plank that radiates warmth." },
    { id: 2917, name: "Moonwood Plank", category: "MATERIAL", rarity: "EPIC", baseValue: 1800, description: "Plank that shimmers in the dark." },
    { id: 2918, name: "Ghostwood Plank", category: "MATERIAL", rarity: "EPIC", baseValue: 2200, description: "A semi-translucent, ethereal plank." },
    { id: 2919, name: "Dragon-Breath Plank", category: "MATERIAL", rarity: "EPIC", baseValue: 2500, description: "Heat-treated draconic timber." },
    { id: 2920, name: "Frost-Fir Plank", category: "MATERIAL", rarity: "EPIC", baseValue: 2000, description: "Plank that remains cold to the touch." },

    // TIER 5: Masterwork (IDs 2921-2925)
    { id: 2921, name: "Petrified Plank", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 9000, description: "Wood turned to stone, then polished." },
    { id: 2922, name: "Sky-Cedar Plank", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 12000, description: "A plank that defies gravity." },
    { id: 2923, name: "Spirit-Wood Plank", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 13000, description: "Infused with the essence of spirits." },
    { id: 2924, name: "Abyssal Driftplank", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 15000, description: "Timber salvaged from the crushing deep." },
    { id: 2925, name: "World-Tree Plank", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 25000, description: "A fragment of the world's heart." }
  ];

  for (const p of planks) {
    await prisma.itemTemplate.upsert({
      where: { id: p.id },
      update: p,
      create: p
    });
  }

  console.log("✅ 25 Refined Planks Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
