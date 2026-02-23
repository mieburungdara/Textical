const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING NORMALIZED NPC POPULATION ---");

  const npcs = [
    { id: 1, name: "Grandmaster Kaelen", title: "Master of Disciplines", type: "JOB_CHANGER", description: "Ancient warrior." },
    { id: 6, name: "Elder Thorne", title: "Village Patriarch", type: "QUEST_GIVER", description: "Wise leader." },
    { id: 11, name: "Zev the Wandering", title: "Merchant of Shadows", type: "TRADER", description: "Mysterious figure.", isWanderer: true },
    { id: 16, name: "Sister Maria", title: "Caretaker of Souls", type: "HEALER", description: "Mends wounds.", healCost: 50 },
    { id: 21, name: "Gorton the Bold", title: "High-Stakes Gambler", type: "GAMBLER", description: "Fortune favors brave.", betMultiplier: 2.0, betWinChance: 0.45 },
    { id: 24, name: "Zephyr", title: "Rift-Walker", type: "TELEPORTER", description: "Bends space.", travelCost: 200 }
  ];

  for (const n of npcs) {
    await prisma.nPCTemplate.upsert({
      where: { id: n.id },
      update: n,
      create: n
    });
  }

  // Seed Teleport Routes for Zephyr (ID 24)
  await prisma.nPCTeleportRoute.deleteMany({ where: { npcId: 24 } });
  const routes = [1, 2, 3, 4, 5];
  for (const rid of routes) {
    await prisma.nPCTeleportRoute.create({
        data: { npcId: 24, targetRegionId: rid }
    });
  }

  console.log("✅ Normalized NPC Data Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
