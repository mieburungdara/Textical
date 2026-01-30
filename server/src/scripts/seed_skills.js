const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING NORMALIZED SKILL CODEX ---");

  const skills = [
    { id: 9001, name: "First Aid", category: "ACTIVE", type: "HEAL", description: "Bandage.", power: 20 },
    { id: 9002, name: "Hardy", category: "PASSIVE", type: "BUFF", description: "Increases HP.", statKey: "health_max", statValue: 50 },
    { id: 9101, name: "Power Strike", category: "ACTIVE", type: "DAMAGE", description: "Heavy blow.", multiplier: 1.5 },
    { id: 9102, name: "Iron Skin", category: "PASSIVE", type: "BUFF", description: "+10 Def.", statKey: "defense", statValue: 10 }
  ];

  for (const s of skills) {
    await prisma.skillTemplate.upsert({
      where: { id: s.id },
      update: s,
      create: s
    });
  }

  const treeMappings = [
    { classId: 1001, skillId: 9001, unlockLevel: 2 },
    { classId: 1001, skillId: 9002, unlockLevel: 5 }
  ];

  for (const t of treeMappings) {
    await prisma.classSkillTree.upsert({
        where: { classId_skillId: { classId: t.classId, skillId: t.skillId } },
        update: { unlockLevel: t.unlockLevel },
        create: { classId: t.classId, skillId: t.skillId, unlockLevel: t.unlockLevel }
    });
  }

  console.log("✅ Normalized Skills Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
