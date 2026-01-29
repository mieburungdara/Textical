const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL MINERAL CODEX (v1.0 - 25 UNIQUE STONES) ---");

  const minerals = [
    // TIER 1: Foundations (IDs 2201-2205)
    { id: 2201, name: "Granite", category: "MATERIAL", baseValue: 5, rarity: "COMMON", hardness: 1, elementalAffinity: 4, description: "Common stone used for crushing weapons." },
    { id: 2202, name: "Basalt", category: "MATERIAL", baseValue: 8, rarity: "COMMON", hardness: 2, elementalAffinity: 1, description: "Heat-resistant volcanic stone." },
    { id: 2203, name: "Iron Ore", category: "MATERIAL", baseValue: 15, rarity: "COMMON", hardness: 3, elementalAffinity: 0, description: "The core material for standard weaponry." },
    { id: 2204, name: "Copper Ore", category: "MATERIAL", baseValue: 12, rarity: "COMMON", hardness: 2, elementalAffinity: 5, description: "Conductive ore used in magical foci." },
    { id: 2205, name: "Coal Stone", category: "MATERIAL", baseValue: 10, rarity: "COMMON", hardness: 1, elementalAffinity: 1, description: "High-energy fuel for refining." },

    // TIER 2: Resilient (IDs 2206-2210)
    { id: 2206, name: "Silver Ore", category: "MATERIAL", baseValue: 50, rarity: "UNCOMMON", hardness: 2, elementalAffinity: 6, description: "Holy metal effective against the undead." },
    { id: 2207, name: "Obsidian", category: "MATERIAL", baseValue: 45, rarity: "UNCOMMON", hardness: 5, elementalAffinity: 7, description: "Razor-sharp volcanic glass." },
    { id: 2208, name: "Marble", category: "MATERIAL", baseValue: 40, rarity: "UNCOMMON", hardness: 4, elementalAffinity: 0, description: "Heavy stone used for high-end shield-work." },
    { id: 2209, name: "Malachite", category: "MATERIAL", baseValue: 60, rarity: "UNCOMMON", hardness: 3, elementalAffinity: 3, description: "A verdant stone pulsed with nature energy." },
    { id: 2210, name: "Quartz", category: "MATERIAL", baseValue: 55, rarity: "UNCOMMON", hardness: 4, elementalAffinity: 0, description: "Crystal used for precision engineering." },

    // TIER 3: Specialized (IDs 2211-2215)
    { id: 2211, name: "Lapis Lazuli", category: "MATERIAL", baseValue: 150, rarity: "RARE", hardness: 3, elementalAffinity: 2, description: "Deep blue stone rich in mana resonance." },
    { id: 2212, name: "Hematite", category: "MATERIAL", baseValue: 180, rarity: "RARE", hardness: 5, elementalAffinity: 7, description: "Also known as Blood Stone." },
    { id: 2213, name: "Sulfur Stone", category: "MATERIAL", baseValue: 140, rarity: "RARE", hardness: 2, elementalAffinity: 1, description: "Stinks of rot, burns with fury." },
    { id: 2214, name: "Mithril Ore", category: "MATERIAL", baseValue: 350, rarity: "RARE", hardness: 6, elementalAffinity: 6, description: "Legendary light metal." },
    { id: 2215, name: "Titanium Ore", category: "MATERIAL", baseValue: 300, rarity: "RARE", hardness: 8, elementalAffinity: 0, description: "Unmatched strength-to-weight ratio." },

    // TIER 4: Tactical (IDs 2216-2220)
    { id: 2216, name: "Sunstone", category: "MATERIAL", baseValue: 1000, rarity: "EPIC", hardness: 5, elementalAffinity: 6, description: "Radiates eternal morning light." },
    { id: 2217, name: "Moonstone", category: "MATERIAL", baseValue: 1000, rarity: "EPIC", hardness: 5, elementalAffinity: 7, description: "Cold to the touch, reflects the night." },
    { id: 2218, name: "Voidstone", category: "MATERIAL", baseValue: 1200, rarity: "EPIC", hardness: 7, elementalAffinity: 7, description: "Absorbs light and mana greedily." },
    { id: 2219, name: "Dragon-Glass", category: "MATERIAL", baseValue: 1500, rarity: "EPIC", hardness: 9, elementalAffinity: 1, description: "Sharp enough to cut a dragon's soul." },
    { id: 2220, name: "Soul-Quartz", category: "MATERIAL", baseValue: 2000, rarity: "EPIC", hardness: 4, elementalAffinity: 0, description: "Vibrates with the echoes of the fallen." },

    // TIER 5: Masterwork (IDs 2221-2225)
    { id: 2221, name: "Adamantite Ore", category: "MATERIAL", baseValue: 5000, rarity: "LEGENDARY", hardness: 10, elementalAffinity: 4, description: "The hardest material in existence." },
    { id: 2222, name: "Ether-Ore", category: "MATERIAL", baseValue: 6500, rarity: "LEGENDARY", hardness: 5, elementalAffinity: 5, description: "Exists partially in the spiritual plane." },
    { id: 2223, name: "Blood-Ruby", category: "MATERIAL", baseValue: 8000, rarity: "LEGENDARY", hardness: 6, elementalAffinity: 7, description: "Forged from a thousand years of conflict." },
    { id: 2224, name: "Sky-Sapphire", category: "MATERIAL", baseValue: 7500, rarity: "LEGENDARY", hardness: 3, elementalAffinity: 2, description: "Lighter than the air it displaces." },
    { id: 2225, name: "Abyssal Slate", category: "MATERIAL", baseValue: 9000, rarity: "LEGENDARY", hardness: 8, elementalAffinity: 2, description: "Pulled from the crushing depths of the void-ocean." }
  ];

  for (const m of minerals) {
    await prisma.itemTemplate.upsert({
      where: { id: m.id },
      update: m,
      create: m
    });
  }

  console.log("✅ 25 Unique Minerals Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
