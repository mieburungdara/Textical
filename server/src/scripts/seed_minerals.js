const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL MINERAL CODEX (v2.0 - STR REQUIREMENTS) ---");

  const minerals = [
    // TIER 1: Foundations (Req STR: 10-15)
    { id: 2201, name: "Granite", minStr: 10, hardness: 1, baseValue: 5 },
    { id: 2202, name: "Basalt", minStr: 12, hardness: 2, baseValue: 8 },
    { id: 2203, name: "Iron Ore", minStr: 15, hardness: 3, baseValue: 15 },
    { id: 2204, name: "Copper Ore", minStr: 12, hardness: 2, baseValue: 12 },
    { id: 2205, name: "Coal Stone", minStr: 10, hardness: 1, baseValue: 10 },

    // TIER 2: Resilient (Req STR: 20-30)
    { id: 2206, name: "Silver Ore", minStr: 25, hardness: 2, baseValue: 50 },
    { id: 2207, name: "Obsidian", minStr: 30, hardness: 5, baseValue: 45 },
    { id: 2208, name: "Marble", minStr: 20, hardness: 4, baseValue: 40 },
    { id: 2209, name: "Malachite", minStr: 22, hardness: 3, baseValue: 60 },
    { id: 2210, name: "Quartz", minStr: 20, hardness: 4, baseValue: 55 },

    // TIER 3: Specialized (Req STR: 40-55)
    { id: 2211, name: "Lapis Lazuli", minStr: 40, hardness: 3, baseValue: 150 },
    { id: 2212, name: "Hematite", minStr: 50, hardness: 5, baseValue: 180 },
    { id: 2213, name: "Sulfur Stone", minStr: 45, hardness: 2, baseValue: 140 },
    { id: 2214, name: "Mithril Ore", minStr: 55, hardness: 6, baseValue: 350 },
    { id: 2215, name: "Titanium Ore", minStr: 50, hardness: 8, baseValue: 300 },

    // TIER 4: Tactical (Req STR: 65-80)
    { id: 2216, name: "Sunstone", minStr: 65, hardness: 5, baseValue: 1000 },
    { id: 2217, name: "Moonstone", minStr: 65, hardness: 5, baseValue: 1000 },
    { id: 2218, name: "Voidstone", minStr: 75, hardness: 7, baseValue: 1200 },
    { id: 2219, name: "Dragon-Glass", minStr: 80, hardness: 9, baseValue: 1500 },
    { id: 2220, name: "Soul-Quartz", minStr: 70, hardness: 4, baseValue: 2000 },

    // TIER 5: Masterwork (Req STR: 90-100)
    { id: 2221, name: "Adamantite Ore", minStr: 100, hardness: 10, baseValue: 5000 },
    { id: 2222, name: "Ether-Ore", minStr: 90, hardness: 5, baseValue: 6500 },
    { id: 2223, name: "Blood-Ruby", minStr: 95, hardness: 6, baseValue: 8000 },
    { id: 2224, name: "Sky-Sapphire", minStr: 90, hardness: 3, baseValue: 7500 },
    { id: 2225, name: "Abyssal Slate", minStr: 100, hardness: 8, baseValue: 9000 }
  ];

  for (const m of minerals) {
    await prisma.itemTemplate.update({
      where: { id: m.id },
      data: { minStr: m.minStr }
    });
  }

  console.log("✅ 25 Minerals updated with Strength Requirements.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });