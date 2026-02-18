const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING ADVANCED MULTI-STAGE QUEST: THE DRAGON'S TRIAL ---");

  const questId = 10;

  // 1. Create Quest Template
  await prisma.questTemplate.upsert({
    where: { id: questId },
    update: { name: "The Dragon's Trial", description: "Prove your worth through travel, combat, and diplomacy." },
    create: { id: questId, name: "The Dragon's Trial", description: "Prove your worth through travel, combat, and diplomacy." }
  });

  // 2. Create Stages
  const stages = [
    { order: 1, name: "The Journey", description: "Travel to the Forbidden Grove to begin your trial." },
    { order: 2, name: "The Hunt", description: "Slay the predators that infest the grove." },
    { order: 3, name: "The Return", description: "Report your success to Elder Thorne." }
  ];

  for (const s of stages) {
    const stage = await prisma.questStage.upsert({
        where: { questId_order: { questId, order: s.order } },
        update: { name: s.name, description: s.description },
        create: { questId, order: s.order, name: s.name, description: s.description }
    });

    // Clear existing objectives/rewards for re-seed
    await prisma.questObjective.deleteMany({ where: { stageId: stage.id } });
    await prisma.questReward.deleteMany({ where: { stageId: stage.id } });

    // 3. Add Objectives per Stage
    if (s.order === 1) {
        await prisma.questObjective.create({ data: { stageId: stage.id, type: "TRAVEL", targetId: 3, amount: 1, description: "Reach Forbidden Grove (Region 3)" } });
    } else if (s.order === 2) {
        await prisma.questObjective.create({ data: { stageId: stage.id, type: "KILL", targetId: 6003, amount: 5, description: "Slay 5 Forest Wolves" } });
    } else if (s.order === 3) {
        await prisma.questObjective.create({ data: { stageId: stage.id, type: "INTERACT", targetId: 6, amount: 1, description: "Talk to Elder Thorne" } });
    }

    // 4. Add Rewards per Stage
    if (s.order === 3) { // Final Stage Reward
        await prisma.questReward.create({ data: { stageId: stage.id, type: "GOLD", amount: 5000 } });
        await prisma.questReward.create({ data: { stageId: stage.id, type: "ITEM", itemId: 4425, amount: 1 } }); // Elixir of the Gods
    } else {
        await prisma.questReward.create({ data: { stageId: stage.id, type: "EXP", amount: 100 } });
    }
  }

  console.log("✅ Advanced Quest 'The Dragon's Trial' Seeded with 3 Stages.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
