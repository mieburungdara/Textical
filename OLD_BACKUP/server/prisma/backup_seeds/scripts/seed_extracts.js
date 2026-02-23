const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL ALCHEMICAL EXTRACTS (v1.0 - 25 REFINED ESSENCES) ---");

  const extracts = [
    // TIER 1: Common (IDs 4301-4305)
    { id: 4301, name: "Green Extract", category: "MATERIAL", rarity: "COMMON", baseValue: 10, description: "Concentrated essence of healing herbs." },
    { id: 4302, name: "Mana-Dew", category: "MATERIAL", rarity: "COMMON", baseValue: 12, description: "Condensed mana particles from blue blossoms." },
    { id: 4303, name: "Energy Pith", category: "MATERIAL", rarity: "COMMON", baseValue: 15, description: "Stimulating plant matter for endurance." },
    { id: 4304, name: "Swift-Pollen", category: "MATERIAL", rarity: "COMMON", baseValue: 15, description: "Refined pollen for reflex enhancement." },
    { id: 4305, name: "Nightshade Oil", category: "MATERIAL", rarity: "COMMON", baseValue: 18, description: "Dangerous oil distilled from nightshade." },

    // TIER 2: Uncommon (IDs 4306-4310)
    { id: 4306, name: "Ginseng Elixir-Base", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 60, description: "Root extract used as a base for tonic elixirs." },
    { id: 4307, name: "Silverleaf Dust", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 80, description: "Ground silverleaf with purifying properties." },
    { id: 4308, name: "Garlic Concentrate", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 50, description: "Pungent oil that wards off minor ailments." },
    { id: 4309, name: "Calming Resin", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 40, description: "Resin distilled from peaceful blooms." },
    { id: 4310, name: "Spore-Ink", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 85, description: "Luminous ink harvested from amanita spores." },

    // TIER 3: Rare (IDs 4311-4315)
    { id: 4311, name: "Mandrake Shriek-Oil", category: "MATERIAL", rarity: "RARE", baseValue: 450, description: "Oil that retains the mandrake's magical voice." },
    { id: 4312, name: "Fireweed Resin", category: "MATERIAL", rarity: "RARE", baseValue: 500, description: "Highly flammable and heat-resistant resin." },
    { id: 4313, name: "Frost-Petal Fluid", category: "MATERIAL", rarity: "RARE", baseValue: 500, description: "A liquid that remains frozen at room temperature." },
    { id: 4314, name: "Lightning-Sap", category: "MATERIAL", rarity: "RARE", baseValue: 480, description: "Sap that conducts high-voltage alchemy." },
    { id: 4315, name: "Void-Nectar", category: "MATERIAL", rarity: "RARE", baseValue: 550, description: "Nectar that seems to absorb all light." },

    // TIER 4: Epic (IDs 4316-4320)
    { id: 4316, name: "Solar-Plasma", category: "MATERIAL", rarity: "EPIC", baseValue: 3000, description: "Radiant plasma distilled from sunflowers." },
    { id: 4317, name: "Lunar-Tears", category: "MATERIAL", rarity: "EPIC", baseValue: 3000, description: "Pure liquid wisdom from moon-lilies." },
    { id: 4318, name: "Vital-Crimson", category: "MATERIAL", rarity: "EPIC", baseValue: 3800, description: "Concentrated life-blood from rare roses." },
    { id: 4319, name: "Dragon-Sap", category: "MATERIAL", rarity: "EPIC", baseValue: 4500, description: "Thick fluid extracted from dragon-lilies." },
    { id: 4320, name: "Shadow-Mist", category: "MATERIAL", rarity: "EPIC", baseValue: 3500, description: "Gaseous shadow distilled from ghost-grass." },

    // TIER 5: Legendary (IDs 4321-4325)
    { id: 4321, name: "Petrified Milk", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 15000, description: "Ancient sap that has become hard as stone." },
    { id: 4322, name: "Sky-Vapor", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 18000, description: "Floating gaseous extract from sky-orchids." },
    { id: 4323, name: "Spirit-Ether", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 20000, description: "The literal essence of forest spirits." },
    { id: 4324, name: "Abyssal Brine", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 22000, description: "Concentrated salts from the void trench." },
    { id: 4325, name: "World-Tree Essence", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 45000, description: "A single drop contains the blueprint of life." }
  ];

  for (const e of extracts) {
    await prisma.itemTemplate.upsert({
      where: { id: e.id },
      update: e,
      create: e
    });
  }

  console.log("✅ 25 Alchemical Extracts Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
