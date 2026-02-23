const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== RESTORING PLAYER1 AND BASE DATA ===");

  // 1. Ensure Premium Tier 0 exists
  await prisma.premiumTierTemplate.upsert({
    where: { id: 0 },
    update: {},
    create: {
      id: 0,
      name: "Free Tier",
      queueSlots: 1,
      speedBonus: 0.0,
      vitalityRegenMult: 1.0,
      maxVitalityBonus: 0
    }
  });
  console.log("✅ Premium Tier 0 ensured.");

  // 2. Ensure Region 1 (Oakhaven) exists
  await prisma.regionTemplate.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Oakhaven",
      description: "A peaceful starter town.",
      visualType: "TOWN",
      zoneType: "GREEN",
      zoneLevel: 1
    }
  });
  console.log("✅ Region 1 ensured.");

  // 3. Ensure Class 1001 (Novice) exists
  await prisma.classTemplate.upsert({
    where: { id: 1001 },
    update: {},
    create: {
      id: 1001,
      name: "Novice",
      tier: 0,
      resourceType: "MANA",
      focus: "Balanced",
      identity: "Starter Class",
      description: "A basic class for new adventurers."
    }
  });
  console.log("✅ Class 1001 ensured.");

  // 4. Create player1
  const player1 = await prisma.user.upsert({
    where: { username: "player1" },
    update: {},
    create: {
      username: "player1",
      password: "password", // Matches simple check in userController
      silver: 1000,
      gold: 0,
      currentRegion: 1,
      premiumTierId: 0
    }
  });
  console.log("✅ User 'player1' restored.");

  // 5. Give player1 a hero if they don't have one
  const heroCount = await prisma.hero.count({ where: { userId: player1.id } });
  if (heroCount === 0) {
    await prisma.hero.create({
      data: {
        userId: player1.id,
        name: "Trainee",
        classId: 1001,
        level: 1,
        xp: 0,
        hp_base: 100,
        damage_base: 10,
        str: 10,
        dex: 10,
        int: 10,
        vit: 10,
        luk: 5,
        isMain: true
      }
    });
    console.log("✅ Default hero 'Trainee' created for player1.");
  }

  // 6. Ensure WorldState exists
  const worldState = await prisma.worldState.findFirst();
  if (!worldState) {
    await prisma.worldState.create({
      data: {
        id: 1,
        currentHour: 12,
        weatherType: "CLEAR"
      }
    });
    console.log("✅ WorldState initialized.");
  }

  console.log("\n=== RESTORATION COMPLETE ===");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });