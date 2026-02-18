/**
 * Seed script for Private Island crops and seeds
 * Run with: node prisma/seed_island_crops.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding Private Island crops and seeds...');

  // Create 3 crop types with different growth times
  // Crop 1: Quick Grow - 10 minutes (600 seconds)
  // Crop 2: Medium Grow - 30 minutes (1800 seconds)  
  // Crop 3: Slow Grow - 60 minutes (3600 seconds)

  const crops = [
    {
      name: 'Sunflower Seeds',
      description: 'Quick-growing sunflower seeds. Ready in 10 minutes.',
      seedName: 'Sunflower Seed',
      harvestName: 'Sunflower',
      growthTimeSeconds: 600, // 10 minutes
      minYield: 1,
      maxYield: 3,
      experienceReward: 5,
      seedBaseValue: 5,
      harvestBaseValue: 10,
      season: 'ALL',
      isPremium: false
    },
    {
      name: 'Moonflower Seeds',
      description: 'Medium-growth moonflower seeds. Ready in 30 minutes.',
      seedName: 'Moonflower Seed',
      harvestName: 'Moonflower',
      growthTimeSeconds: 1800, // 30 minutes
      minYield: 2,
      maxYield: 4,
      experienceReward: 15,
      seedBaseValue: 15,
      harvestBaseValue: 35,
      season: 'ALL',
      isPremium: false
    },
    {
      name: 'Starfruit Seeds',
      description: 'Premium starfruit seeds. Takes 60 minutes to grow.',
      seedName: 'Starfruit Seed',
      harvestName: 'Starfruit',
      growthTimeSeconds: 3600, // 60 minutes
      minYield: 3,
      maxYield: 5,
      experienceReward: 30,
      seedBaseValue: 50,
      harvestBaseValue: 120,
      season: 'ALL',
      isPremium: true
    }
  ];

  for (const crop of crops) {
    // Create seed item template
    const seedTemplate = await prisma.itemTemplate.create({
      data: {
        name: crop.seedName,
        description: crop.description,
        category: 'SEED',
        baseValue: crop.seedBaseValue,
        rarity: crop.isPremium ? 'UNCOMMON' : 'COMMON',
        maxStack: 99,
        isQuestItem: false
      }
    });

    // Create harvest item template
    const harvestTemplate = await prisma.itemTemplate.create({
      data: {
        name: crop.harvestName,
        description: `Harvested ${crop.harvestName.toLowerCase()}. Can be sold or used for crafting.`,
        category: 'MATERIAL',
        baseValue: crop.harvestBaseValue,
        rarity: crop.isPremium ? 'UNCOMMON' : 'COMMON',
        maxStack: 99,
        isQuestItem: false
      }
    });

    // Create crop template
    const cropTemplate = await prisma.cropTemplate.create({
      data: {
        name: crop.name,
        description: crop.description,
        seedItemId: seedTemplate.id,
        harvestItemId: harvestTemplate.id,
        growthTimeSeconds: crop.growthTimeSeconds,
        minYield: crop.minYield,
        maxYield: crop.maxYield,
        experienceReward: crop.experienceReward,
        season: crop.season,
        isPremium: crop.isPremium ? 1 : 0
      }
    });

    console.log(`✅ Created crop: ${crop.name} (seed: ${seedTemplate.id}, harvest: ${harvestTemplate.id})`);
  }

  console.log('🎉 Private Island crops seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding crops:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
