/**
 * Seed Health Potion Template
 * 
 * Run: node src/scripts/seed_health_potion.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== SEEDING HEALTH POTION (ID 2001) ===\n");

  const healthPotion = {
    id: 2001,
    name: "Health Potion",
    description: "Restores 50 health instantly during combat. Can only be used in battle.",
    category: "CONSUMABLE",
    rarity: "COMMON",
    baseValue: 25,
    price: 25,
    icon: "res://assets/icons/items/health_potion.png",
    data: JSON.stringify({
      effects: [
        {
          type: "HEAL",
          value: 50
        }
      ],
      combatOnly: true,
      cooldownTicks: 10,
      maxUsesPerBattle: null // Unlimited, based on inventory
    })
  };

  try {
    const result = await prisma.itemTemplate.upsert({
      where: { id: healthPotion.id },
      update: healthPotion,
      create: healthPotion
    });

    console.log(`✅ Health Potion seeded successfully!`);
    console.log(`   ID: ${result.id}`);
    console.log(`   Name: ${result.name}`);
    console.log(`   Description: ${result.description}`);
    console.log(`   Category: ${result.category}`);
    console.log(`   Base Value: ${result.baseValue}`);

    // Verify it's in the database
    const verify = await prisma.itemTemplate.findUnique({
      where: { id: 2001 }
    });
    
    if (verify) {
      console.log(`\n✅ Verification: Health Potion exists in database`);
    } else {
      console.log(`\n❌ Verification failed: Health Potion not found`);
    }

  } catch (error) {
    console.error("❌ Error seeding Health Potion:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
