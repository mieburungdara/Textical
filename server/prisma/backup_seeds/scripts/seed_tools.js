const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL MINING TOOLS (PICKAXES) ---");

  const tools = [
    { 
        id: 2301, name: "Wooden Pickaxe", category: "PICKAXE", 
        rarity: "COMMON", baseValue: 20, toolTier: 0, 
        description: "A crude tool made of sturdy wood. Can mine basic stones." 
    },
    { 
        id: 2302, name: "Iron Pickaxe", category: "PICKAXE", 
        rarity: "COMMON", baseValue: 100, toolTier: 1, 
        description: "A reliable iron tool. Required for mining uncommon ores." 
    },
    { 
        id: 2303, name: "Steel Pickaxe", category: "PICKAXE", 
        rarity: "UNCOMMON", baseValue: 500, toolTier: 2, 
        description: "A hardened steel tool. Capable of extracting specialized minerals." 
    },
    { 
        id: 2304, name: "Mithril Pickaxe", category: "PICKAXE", 
        rarity: "RARE", baseValue: 2500, toolTier: 3, 
        description: "Extremely light and sharp. Can mine tactical-grade minerals." 
    },
    { 
        id: 2305, name: "Adamantite Pickaxe", category: "PICKAXE", 
        rarity: "LEGENDARY", baseValue: 10000, toolTier: 4, 
        description: "The ultimate mining tool. Can carve through any material." 
    }
  ];

  for (const t of tools) {
    await prisma.itemTemplate.upsert({
      where: { id: t.id },
      update: t,
      create: t
    });
  }

  console.log("✅ Mining Tools Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });