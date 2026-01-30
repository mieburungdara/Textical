const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL SKILL CODEX & CLASS TREES ---");

  const skills = [
    // --- NOVICE (IDs 9000s) ---
    { id: 9001, name: "First Aid", category: "ACTIVE", type: "HEAL", description: "A simple bandage. Restores 20 HP.", metadata: { power: 20 } },
    { id: 9002, name: "Hardy", category: "PASSIVE", type: "BUFF", description: "Increases base HP by 50.", metadata: { statKey: "health_max", statValue: 50 } },

    // --- WARRIOR (IDs 9100s) ---
    { id: 9101, name: "Power Strike", category: "ACTIVE", type: "DAMAGE", description: "A heavy blow dealing 150% damage.", metadata: { multiplier: 1.5 } },
    { id: 9102, name: "Iron Skin", category: "PASSIVE", type: "BUFF", description: "Toughened skin grants +10 Defense.", metadata: { statKey: "defense", statValue: 10 } },

    // --- KNIGHT (IDs 11100s) ---
    { id: 11101, name: "Holy Shield", category: "ACTIVE", type: "BUFF", description: "Blocks 50% of incoming damage for 2 turns.", metadata: { mitigation: 0.5, duration: 2 } },
    { id: 11102, name: "Vanguard", category: "PASSIVE", type: "BUFF", description: "Protective aura grants +20 VIT.", metadata: { statKey: "vit", statValue: 20 } }
  ];

  // 1. Seed Templates
  for (const s of skills) {
    await prisma.skillTemplate.upsert({
      where: { id: s.id },
      update: { name: s.name, category: s.category, type: s.type, description: s.description, metadata: JSON.stringify(s.metadata) },
      create: { id: s.id, name: s.name, category: s.category, type: s.type, description: s.description, metadata: JSON.stringify(s.metadata) }
    });
  }

  // 2. Map Trees using CORRECT DB IDs from findMany
  const treeMappings = [
    // Novice (1001)
    { classId: 1001, skillId: 9001, unlockLevel: 2 },
    { classId: 1001, skillId: 9002, unlockLevel: 5 },
    // Knight (1101) - In the list provided earlier as id:1101 name:Knight
    { classId: 1101, skillId: 11101, unlockLevel: 5 },
    { classId: 1101, skillId: 11102, unlockLevel: 10 }
  ];

  for (const t of treeMappings) {
    await prisma.classSkillTree.upsert({
        where: { classId_skillId: { classId: t.classId, skillId: t.skillId } },
        update: { unlockLevel: t.unlockLevel },
        create: { classId: t.classId, skillId: t.skillId, unlockLevel: t.unlockLevel }
    });
  }

  console.log("✅ Skill Codex and Tree Mappings Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });