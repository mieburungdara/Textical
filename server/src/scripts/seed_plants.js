const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL HERBAL CODEX (v1.0 - 25 UNIQUE PLANTS) ---");

  const plants = [
    // TIER 1: Common (IDs 2801-2805)
    { id: 2801, name: "Green Herb", category: "MATERIAL", rarity: "COMMON", baseValue: 3, description: "A common herb with mild healing properties." },
    { id: 2802, name: "Blue Blossom", category: "MATERIAL", rarity: "COMMON", baseValue: 4, description: "A small flower that resonates with mana." },
    { id: 2803, name: "Red Poppy", category: "MATERIAL", rarity: "COMMON", baseValue: 5, description: "A vibrant flower used in energy stimulants." },
    { id: 2804, name: "Yellow Bell", category: "MATERIAL", rarity: "COMMON", baseValue: 5, description: "Bells that ring with dexterity-enhancing pollen." },
    { id: 2805, name: "Purple Nightshade", category: "MATERIAL", rarity: "COMMON", baseValue: 6, description: "A poisonous plant used in toxic concoctions." },

    // TIER 2: Uncommon (IDs 2806-2810)
    { id: 2806, name: "Ginseng Root", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 25, description: "A sturdy root for vitality restoration." },
    { id: 2807, name: "Silverleaf", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 30, description: "Leaves that shine with a faint holy light." },
    { id: 2808, name: "Wild Garlic", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 20, description: "A pungent bulb that wards off diseases." },
    { id: 2809, name: "Dandelion of Peace", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 15, description: "Used in brewing relaxing tavern ales." },
    { id: 2810, name: "Amanita Mushroom", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 35, description: "A spotted fungus with unpredictable effects." },

    // TIER 3: Rare (IDs 2811-2815)
    { id: 2811, name: "Mandrake Root", category: "MATERIAL", rarity: "RARE", baseValue: 180, description: "A screaming root with high magical potency." },
    { id: 2812, name: "Fireweed", category: "MATERIAL", rarity: "RARE", baseValue: 200, description: "A plant that thrives in extreme heat." },
    { id: 2813, name: "Ice Lotus", category: "MATERIAL", rarity: "RARE", baseValue: 200, description: "A frozen flower found on mountain peaks." },
    { id: 2814, name: "Lightning Moss", category: "MATERIAL", rarity: "RARE", baseValue: 190, description: "Moss that crackles with electricity." },
    { id: 2815, name: "Void Petal", category: "MATERIAL", rarity: "RARE", baseValue: 220, description: "Petals that seem to disappear when stared at." },

    // TIER 4: Epic (IDs 2816-2820)
    { id: 2816, name: "Sun-Sunflower", category: "MATERIAL", rarity: "EPIC", baseValue: 1200, description: "Radiates pure solar energy." },
    { id: 2817, name: "Moon-Lily", category: "MATERIAL", rarity: "EPIC", baseValue: 1200, description: "Petals that glow with soft lunar wisdom." },
    { id: 2818, name: "Blood-Rose", category: "MATERIAL", rarity: "EPIC", baseValue: 1500, description: "Thorny roses that thirst for vital essence." },
    { id: 2819, name: "Dragon-Lily", category: "MATERIAL", rarity: "EPIC", baseValue: 1800, description: "A flower born from dragon blood." },
    { id: 2820, name: "Ghost-Grass", category: "MATERIAL", rarity: "EPIC", baseValue: 1400, description: "Grass that allows one to step between shadows." },

    // TIER 5: Legendary (IDs 2821-2825)
    { id: 2821, name: "Petrified Moss", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 6000, description: "Ancient moss that has hardened into stone." },
    { id: 2822, name: "Sky-Orchid", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 7500, description: "A floating flower from the highest peaks." },
    { id: 2823, name: "Spirit-Fern", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 8000, description: "Linked to the essence of nature spirits." },
    { id: 2824, name: "Abyssal Kelp", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 9000, description: "Flora from the deepest, darkest trenches." },
    { id: 2825, name: "World-Tree Bud", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 15000, description: "A nascent bloom from the origin of life." }
  ];

  for (const p of plants) {
    await prisma.itemTemplate.upsert({
      where: { id: p.id },
      update: p,
      create: p
    });
  }

  console.log("✅ 25 Unique Plants Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
