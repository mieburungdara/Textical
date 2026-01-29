const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING LEGENDARY CLASS HIERARCHY ---");

  const classes = [
    // TIER 1
    { id: 1001, name: "Novice", tier: 1, resourceType: "MANA", hpGrowth: 5, mpGrowth: 2, atkGrowth: 1, defGrowth: 0.5, spdGrowth: 0.1, promotionReqLevel: 10 },

    // TIER 2
    { id: 2001, name: "Warrior", tier: 2, resourceType: "RAGE", hpGrowth: 15, mpGrowth: 0, atkGrowth: 3, defGrowth: 2, spdGrowth: 0.2, promotionReqLevel: 30, parentClassId: 1001 },
    { id: 2002, name: "Archer", tier: 2, resourceType: "ENERGY", hpGrowth: 8, mpGrowth: 5, atkGrowth: 4, defGrowth: 1, spdGrowth: 0.5, promotionReqLevel: 30, parentClassId: 1001 },
    { id: 2003, name: "Mage", tier: 2, resourceType: "MANA", hpGrowth: 6, mpGrowth: 15, atkGrowth: 1, defGrowth: 0.5, spdGrowth: 0.3, promotionReqLevel: 30, parentClassId: 1001 },

    // TIER 3 (Knight example)
    { id: 3001, name: "Knight", tier: 3, resourceType: "RAGE", hpGrowth: 25, mpGrowth: 0, atkGrowth: 5, defGrowth: 5, spdGrowth: 0.3, promotionReqLevel: 60, parentClassId: 2001 }
  ];

  for (const c of classes) {
    await prisma.classTemplate.upsert({
      where: { id: c.id },
      update: c,
      create: c
    });
  }

  console.log("✅ Classes Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
