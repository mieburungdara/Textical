const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL REFINED BARS (v1.0 - 25 METAL BARS) ---");

  const bars = [
    // TIER 1: Foundations (IDs 2701-2705)
    { id: 2701, name: "Granite Block", category: "MATERIAL", rarity: "COMMON", baseValue: 10, description: "Refined granite block for construction." },
    { id: 2702, name: "Basalt Slab", category: "MATERIAL", rarity: "COMMON", baseValue: 12, description: "Polished volcanic rock slab." },
    { id: 2703, name: "Iron Bar", category: "MATERIAL", rarity: "COMMON", baseValue: 40, description: "Solid iron bar, ready for smithing." },
    { id: 2704, name: "Copper Bar", category: "MATERIAL", rarity: "COMMON", baseValue: 30, description: "Refined copper, used in alloys." },
    { id: 2705, name: "Coal Brick", category: "MATERIAL", rarity: "COMMON", baseValue: 15, description: "Compressed coal for intense heat." },

    // TIER 2: Resilient (IDs 2706-2710)
    { id: 2706, name: "Silver Bar", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 120, description: "Shining silver bar for holy gear." },
    { id: 2707, name: "Obsidian Shard", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 150, description: "Refined volcanic glass edge." },
    { id: 2708, name: "Marble Pillar", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 100, description: "Smooth white stone block." },
    { id: 2709, name: "Malachite Bar", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 110, description: "Greenish copper-mineral alloy." },
    { id: 2710, name: "Quartz Crystal", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 140, description: "Purified crystal for mana focus." },

    // TIER 3: Specialized (IDs 2711-2715)
    { id: 2711, name: "Lapis Block", category: "MATERIAL", rarity: "RARE", baseValue: 400, description: "Concentrated blue dye and magic stone." },
    { id: 2712, name: "Hematite Ingot", category: "MATERIAL", rarity: "RARE", baseValue: 500, description: "Magnetic iron-oxide ingot." },
    { id: 2713, name: "Sulfur Brick", category: "MATERIAL", rarity: "RARE", baseValue: 450, description: "Smelly but essential for explosives." },
    { id: 2714, name: "Mithril Bar", category: "MATERIAL", rarity: "RARE", baseValue: 1000, description: "A bar of legendary, lightweight Mithril." },
    { id: 2715, name: "Titanium Bar", category: "MATERIAL", rarity: "RARE", baseValue: 1200, description: "Unbreakable metal for masterwork tools." },

    // TIER 4: Tactical (IDs 2716-2720)
    { id: 2716, name: "Sunstone Bar", category: "MATERIAL", rarity: "EPIC", baseValue: 4000, description: "Forged under solar rays." },
    { id: 2717, name: "Moonstone Bar", category: "MATERIAL", rarity: "EPIC", baseValue: 4000, description: "Quenched in moonlit waters." },
    { id: 2718, name: "Voidstone Bar", category: "MATERIAL", rarity: "EPIC", baseValue: 5000, description: "A bar that absorbs light and sound." },
    { id: 2719, name: "Dragon-Glass Slab", category: "MATERIAL", rarity: "EPIC", baseValue: 6000, description: "Forged in dragon-fire." },
    { id: 2720, name: "Soul-Quartz Bar", category: "MATERIAL", rarity: "EPIC", baseValue: 4500, description: "Resonates with the spirit realm." },

    // TIER 5: Masterwork (IDs 2721-2725)
    { id: 2721, name: "Adamantite Bar", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 15000, description: "The hardest metal in existence." },
    { id: 2722, name: "Ether-Bar", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 18000, description: "A bar of solid magic." },
    { id: 2723, name: "Blood-Ruby Bar", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 20000, description: "Crystalized lifeforce ingot." },
    { id: 2724, name: "Sky-Sapphire Bar", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 19000, description: "Light and hard like the frozen sky." },
    { id: 2725, name: "Abyssal Ingot", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 25000, description: "Crushing weight from the void." }
  ];

  for (const b of bars) {
    await prisma.itemTemplate.upsert({
      where: { id: b.id },
      update: b,
      create: b
    });
  }

  console.log("✅ 25 Refined Bars Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
