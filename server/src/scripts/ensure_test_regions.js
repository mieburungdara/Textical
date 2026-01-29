const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- ENSURING TEST REGIONS EXIST ---");

  const regions = [
    { id: 1, name: "Oakhaven Hub", visualType: "TOWN", description: "The central trading hub." },
    { id: 2, name: "Iron Mine", visualType: "MINE", description: "A dark cave rich in minerals." },
    { id: 3, name: "Crystal Depths", visualType: "CAVE", description: "Mysterious depths glowing with mana." },
    { id: 4, name: "Elm Forest", visualType: "FOREST", description: "A vast green expansion of tall trees." },
    { id: 5, name: "Forbidden Grove", visualType: "SWAMP", description: "A dark, cursed woods." },
    { id: 6, name: "Volcano", visualType: "LAVA", description: "A place of heat and destruction." }
  ];

  for (const r of regions) {
    await prisma.regionTemplate.upsert({
      where: { id: r.id },
      update: r,
      create: r
    });
  }

  console.log("✅ All regions verified.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
