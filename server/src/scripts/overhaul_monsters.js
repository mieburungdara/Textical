const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- OVERHAULING MONSTER CATEGORIES & TEMPLATES ---");

  // 1. Correct Categories
  const categories = [
    { id: 1, name: "BEAST" },
    { id: 2, name: "REPTILE" },
    { id: 3, name: "SLIME" },
    { id: 4, name: "DRAGON" },
    { id: 5, name: "UNDEAD" },
    { id: 6, name: "INSECT" },
    { id: 7, name: "ORC" }
  ];

  for (const cat of categories) {
    await prisma.monsterCategory.upsert({
      where: { id: cat.id },
      update: { name: cat.name },
      create: cat
    });
  }

  // 2. Define Comprehensive Monster Roster
  const monsters = [
    { id: 6001, name: "Green Slime", categoryId: 3, hp_base: 50, damage_base: 5 },
    { id: 6002, name: "Cave Spider", categoryId: 6, hp_base: 40, damage_base: 8 },
    { id: 6003, name: "Forest Wolf", categoryId: 1, hp_base: 80, damage_base: 12 },
    { id: 6004, name: "Wild Boar", categoryId: 1, hp_base: 120, damage_base: 15 },
    { id: 6005, name: "Forest Snake", categoryId: 2, hp_base: 60, damage_base: 10 },
    { id: 6006, name: "Grizzly Bear", categoryId: 1, hp_base: 300, damage_base: 40 },
    { id: 6007, name: "Swamp Crocodile", categoryId: 2, hp_base: 250, damage_base: 35 },
    { id: 6008, name: "Red Dragon", categoryId: 4, hp_base: 5000, damage_base: 250 },
    { id: 6009, name: "Shadow Panther", categoryId: 1, hp_base: 400, damage_base: 60 },
    { id: 6010, name: "Gryphon", categoryId: 1, hp_base: 800, damage_base: 100 }
  ];

  for (const m of monsters) {
    await prisma.monsterTemplate.upsert({
      where: { id: m.id },
      update: m,
      create: m
    });
  }

  console.log("✅ Monsters Overhauled.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
