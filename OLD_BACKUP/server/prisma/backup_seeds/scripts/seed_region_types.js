const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING FOUNDATIONAL REGION TYPES ---");

  const types = [
    { id: "TOWN", name: "Township" },
    { id: "MINE", name: "Mining Site" },
    { id: "CAVE", name: "Underground Cave" },
    { id: "FOREST", name: "Deep Forest" },
    { id: "SWAMP", name: "Murky Swamp" },
    { id: "LAVA", name: "Volcanic Zone" }
  ];

  for (const t of types) {
    await prisma.regionType.upsert({
      where: { id: t.id },
      update: t,
      create: t
    });
  }

  console.log("✅ Region types seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
