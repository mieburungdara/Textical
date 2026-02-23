const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL FISHING TOOLS (RODS) ---");

  const rods = [
    { 
        id: 3501, name: "Wooden Fishing Rod", category: "FISHING_ROD", 
        rarity: "COMMON", baseValue: 25, toolTier: 0, 
        description: "A simple wooden rod. Grants 1.1x DEX bonus for fishing." 
    },
    { 
        id: 3502, name: "Iron Fishing Rod", category: "FISHING_ROD", 
        rarity: "COMMON", baseValue: 120, toolTier: 1, 
        description: "Sturdy iron-reinforced rod. Grants 1.25x DEX bonus for fishing." 
    },
    { 
        id: 3503, name: "Steel Fishing Rod", category: "FISHING_ROD", 
        rarity: "UNCOMMON", baseValue: 600, toolTier: 2, 
        description: "High-tension steel rod. Grants 1.5x DEX bonus for fishing." 
    },
    { 
        id: 3504, name: "Mithril Fishing Rod", category: "FISHING_ROD", 
        rarity: "RARE", baseValue: 3000, toolTier: 3, 
        description: "Weightless elven rod. Grants 2.0x DEX bonus for fishing." 
    },
    { 
        id: 3505, name: "Adamantite Fishing Rod", category: "FISHING_ROD", 
        rarity: "LEGENDARY", baseValue: 12000, toolTier: 4, 
        description: "The ultimate angling tool. Grants 3.0x DEX bonus for fishing." 
    }
  ];

  for (const r of rods) {
    await prisma.itemTemplate.upsert({
      where: { id: r.id },
      update: r,
      create: r
    });
  }

  console.log("✅ 5 Fishing Rods Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
