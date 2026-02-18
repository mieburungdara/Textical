const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL TIER 2 CLASSES (BRANCHING EVOLUTIONS) ---");

  const classes = [
    // --- WARRIOR BRANCH (Parent: 1001) ---
    { 
        id: 1101, name: "Knight", tier: 2, parentClassId: 1001, focus: "Defense",
        hpGrowth: 12.0, mpGrowth: 3.0, atkGrowth: 1.5, defGrowth: 2.5, spdGrowth: 0.1,
        identity: "A bulwark of steel and faith.",
        description: "Specializes in survival and protecting allies. High VIT and DEF growth."
    },
    { 
        id: 1102, name: "Berserker", tier: 2, parentClassId: 1001, focus: "Offense",
        hpGrowth: 10.0, mpGrowth: 1.0, atkGrowth: 3.5, defGrowth: 0.8, spdGrowth: 0.2,
        identity: "Unbridled rage fueled by blood.",
        description: "Sacrifices defense for overwhelming raw power. Massive STR growth."
    },

    // --- RANGER BRANCH (Parent: 1002) ---
    { 
        id: 1103, name: "Sniper", tier: 2, parentClassId: 1002, focus: "Precision",
        hpGrowth: 7.0, mpGrowth: 3.0, atkGrowth: 3.0, defGrowth: 1.0, spdGrowth: 0.3,
        identity: "Death from a thousand paces.",
        description: "Specializes in long-range critical strikes. High DEX and Accuracy growth."
    },
    { 
        id: 1104, name: "Assassin", tier: 2, parentClassId: 1002, focus: "Shadow",
        hpGrowth: 6.0, mpGrowth: 4.0, atkGrowth: 3.2, defGrowth: 0.7, spdGrowth: 0.5,
        identity: "The last thing they never see.",
        description: "Master of speed and fatal strikes. High DEX and SPD growth."
    },

    // --- MAGE BRANCH (Parent: 1003) ---
    { 
        id: 1105, name: "Archmage", tier: 2, parentClassId: 1003, focus: "Arcane",
        hpGrowth: 5.0, mpGrowth: 10.0, atkGrowth: 0.5, defGrowth: 1.0, spdGrowth: 0.2,
        identity: "The living vessel of magic.",
        description: "Wielder of world-shaping spells. High INT and MP growth."
    },
    { 
        id: 1106, name: "Necromancer", tier: 2, parentClassId: 1003, focus: "Death",
        hpGrowth: 8.0, mpGrowth: 7.0, atkGrowth: 0.5, defGrowth: 1.5, spdGrowth: 0.1,
        identity: "Command the dead to serve the living.",
        description: "Specializes in life-drain and summons. Balanced INT and VIT growth."
    }
  ];

  for (const c of classes) {
    await prisma.classTemplate.upsert({
      where: { id: c.id },
      update: c,
      create: c
    });
  }

  console.log("✅ 6 Tier 2 Classes Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
