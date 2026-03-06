import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create test player
  const testPlayer = await prisma.player.create({
    data: {
      name: 'TestPlayer',
      classType: 'warrior',
      level: 1,
      experience: 0,
      gold: 100,
    }
  });

  console.log('Test player created:', testPlayer);

  // Create initial inventory
  await prisma.inventory.create({
    data: {
      playerId: testPlayer.id,
      itemId: 'health_potion',
      quantity: 5
    }
  });

  await prisma.inventory.create({
    data: {
      playerId: testPlayer.id,
      itemId: 'iron_sword',
      quantity: 1
    }
  });

  console.log('Seeding completed');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
