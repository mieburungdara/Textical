const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL MINERAL CODEX (v3.0 - TOOL REQUIREMENTS) ---");

  const minerals = [
    // TIER 1: Foundations (Req Tool: Tier 0 - Wooden)
    { id: 2201, name: "Granite", minToolTier: 0, minStr: 10, hardness: 1 },
    { id: 2202, name: "Basalt", minToolTier: 0, minStr: 12, hardness: 2 },
    { id: 2203, name: "Iron Ore", minToolTier: 0, minStr: 15, hardness: 3 },
    { id: 2204, name: "Copper Ore", minToolTier: 0, minStr: 12, hardness: 2 },
    { id: 2205, name: "Coal Stone", minToolTier: 0, minStr: 10, hardness: 1 },

    // TIER 2: Resilient (Req Tool: Tier 1 - Iron)
    { id: 2206, name: "Silver Ore", minToolTier: 1, minStr: 25, hardness: 2 },
    { id: 2207, name: "Obsidian", minToolTier: 1, minStr: 30, hardness: 5 },
    { id: 2208, name: "Marble", minToolTier: 1, minStr: 20, hardness: 4 },
    { id: 2209, name: "Malachite", minToolTier: 1, minStr: 22, hardness: 3 },
    { id: 2210, name: "Quartz", minToolTier: 1, minStr: 20, hardness: 4 },

    // TIER 3: Specialized (Req Tool: Tier 2 - Steel)
    { id: 2211, name: "Lapis Lazuli", minToolTier: 2, minStr: 40, hardness: 3 },
    { id: 2212, name: "Hematite", minToolTier: 2, minStr: 50, hardness: 5 },
    { id: 2213, name: "Sulfur Stone", minToolTier: 2, minStr: 45, hardness: 2 },
    { id: 2214, name: "Mithril Ore", minToolTier: 2, minStr: 55, hardness: 6 },
    { id: 2215, name: "Titanium Ore", minToolTier: 2, minStr: 50, hardness: 8 },

    // TIER 4: Tactical (Req Tool: Tier 3 - Mithril)
    { id: 2216, name: "Sunstone", minToolTier: 3, minStr: 65, hardness: 5 },
    { id: 2217, name: "Moonstone", minToolTier: 3, minStr: 65, hardness: 5 },
    { id: 2218, name: "Voidstone", minToolTier: 3, minStr: 75, hardness: 7 },
    { id: 2219, name: "Dragon-Glass", minToolTier: 3, minStr: 80, hardness: 9 },
    { id: 2220, name: "Soul-Quartz", minToolTier: 3, minStr: 70, hardness: 4 },

    // TIER 5: Masterwork (Req Tool: Tier 4 - Adamantite)
    { id: 2221, name: "Adamantite Ore", minToolTier: 4, minStr: 100, hardness: 10 },
    { id: 2222, name: "Ether-Ore", minToolTier: 4, minStr: 90, hardness: 5 },
    { id: 2223, name: "Blood-Ruby", minToolTier: 4, minStr: 95, hardness: 6 },
    { id: 2224, name: "Sky-Sapphire", minToolTier: 4, minStr: 90, hardness: 3 },
    { id: 2225, name: "Abyssal Slate", minToolTier: 4, minStr: 100, hardness: 8 }
  ];

  for (const m of minerals) {
    await prisma.itemTemplate.upsert({
      where: { id: m.id },
      update: { minToolTier: m.minToolTier, minStr: m.minStr, hardness: m.hardness },
      create: { 
        id: m.id, 
        name: m.name, 
        minToolTier: m.minToolTier, 
        minStr: m.minStr, 
        hardness: m.hardness,
        description: `Material: ${m.name}`,
        category: "MATERIAL"
      }
    });
  }

  console.log("✅ 25 Minerals updated with Tool Tier Requirements.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
