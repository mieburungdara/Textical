const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL LUMBERING TOOLS (AXES) ---");

  const tools = [
    { 
        id: 2501, name: "Flint Axe", category: "AXE", 
        rarity: "COMMON", baseValue: 15, toolTier: 0, 
        description: "A simple stone axe. Can harvest common timber." 
    },
    { 
        id: 2502, name: "Iron Axe", category: "AXE", 
        rarity: "COMMON", baseValue: 80, toolTier: 1, 
        description: "A standard iron axe. Required for uncommon woods." 
    },
    { 
        id: 2503, name: "Steel Axe", category: "AXE", 
        rarity: "UNCOMMON", baseValue: 400, toolTier: 2, 
        description: "A sharp steel tool. Capable of cutting specialized timbers." 
    },
    { 
        id: 2504, name: "Mithril Axe", category: "AXE", 
        rarity: "RARE", baseValue: 2000, toolTier: 3, 
        description: "Legendary edge. Can harvest tactical-grade woods." 
    },
    { 
        id: 2505, name: "Adamantite Axe", category: "AXE", 
        rarity: "LEGENDARY", baseValue: 8000, toolTier: 4, 
        description: "The world-cutter. No tree can resist its bite." 
    }
  ];

  for (const t of tools) {
    await prisma.itemTemplate.upsert({
      where: { id: t.id },
      update: t,
      create: t
    });
  }

  console.log("✅ Lumbering Axes Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
