const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TOOL STATS FOR CONTEXT TEST ---");

  // 1. Iron Pickaxe (+10 STR)
  await prisma.itemStat.upsert({
    where: { id: 1 }, // Just for test seeding
    update: { statKey: "str", statValue: 10 },
    create: { id: 1, itemId: 2302, statKey: "str", statValue: 10 }
  });

  // 2. Iron Fishing Rod (+10 DEX)
  await prisma.itemStat.upsert({
    where: { id: 2 },
    update: { statKey: "dex", statValue: 10 },
    create: { id: 2, itemId: 3502, statKey: "dex", statValue: 10 }
  });

  console.log("✅ Tool stats seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
