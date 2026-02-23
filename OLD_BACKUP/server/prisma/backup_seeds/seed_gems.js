/**
 * Seed Script: Gem Templates
 * Creates 30 elemental gems (6 elements × 5 tiers)
 * 
 * Elements: FIRE, WATER, EARTH, WIND, LIGHT, DARK
 * Tiers: I, II, III, IV, V (1-5)
 * 
 * Stat scaling per tier:
 * - Tier 1: Base (e.g., 10 flat, 1% bonus)
 * - Tier 2: 2x base
 * - Tier 3: 3x base
 * - Tier 4: 4x base
 * - Tier 5: 5x base
 */

const { PrismaClient } = require('@prisma/client');
const prisma = require('../src/db');

const ELEMENTS = ['FIRE', 'WATER', 'EARTH', 'WIND', 'LIGHT', 'DARK'];

const GEM_DEFINITIONS = {
  FIRE: {
    name: 'Fire Gem',
    statKey: 'elemental_damage_FIRE',
    description: 'Increases Fire damage',
    baseStatValue: 10,
    basePercentValue: 0.02,
    baseValue: 100,
    dropChance: 0.01,
    bossDropChance: 0.10
  },
  WATER: {
    name: 'Water Gem',
    statKey: 'elemental_damage_WATER',
    description: 'Increases Water damage',
    baseStatValue: 10,
    basePercentValue: 0.02,
    baseValue: 100,
    dropChance: 0.01,
    bossDropChance: 0.10
  },
  EARTH: {
    name: 'Earth Gem',
    statKey: 'defense',
    description: 'Increases Defense',
    baseStatValue: 8,
    basePercentValue: 0.01,
    baseValue: 100,
    dropChance: 0.01,
    bossDropChance: 0.10
  },
  WIND: {
    name: 'Wind Gem',
    statKey: 'dodge_chance',
    description: 'Increases Evasion',
    baseStatValue: 0.01,
    basePercentValue: 0,
    baseValue: 150,
    dropChance: 0.008,
    bossDropChance: 0.08
  },
  LIGHT: {
    name: 'Light Gem',
    statKey: 'crit_chance',
    description: 'Increases Critical Chance',
    baseStatValue: 0.01,
    basePercentValue: 0,
    baseValue: 200,
    dropChance: 0.005,
    bossDropChance: 0.05
  },
  DARK: {
    name: 'Dark Gem',
    statKey: 'attack_damage',
    description: 'Increases Attack Damage',
    baseStatValue: 12,
    basePercentValue: 0.02,
    baseValue: 150,
    dropChance: 0.008,
    bossDropChance: 0.08
  }
};

const ROMAN_TIERS = ['I', 'II', 'III', 'IV', 'V'];

async function seedGems() {
  console.log('🌱 Starting gem template seeding...\n');

  const createdGems = {};

  for (const element of ELEMENTS) {
    console.log(`Processing ${element} gems...`);
    createdGems[element] = [];

    const def = GEM_DEFINITIONS[element];

    for (let tier = 1; tier <= 5; tier++) {
      const tierMultiplier = tier;
      const statValue = Math.round(def.baseStatValue * tierMultiplier);
      const percentValue = def.basePercentValue * tierMultiplier;
      const value = def.baseValue * tierMultiplier;

      const gem = await prisma.gemTemplate.upsert({
        where: { element_tier: { element, tier } },
        update: {
          name: `${def.name} ${ROMAN_TIERS[tier - 1]}`,
          description: `${def.description} (+${tierMultiplier * 100}% effectiveness)`,
          statValue,
          percentValue,
          baseValue: value,
          dropChance: def.dropChance,
          bossDropChance: def.bossDropChance
        },
        create: {
          name: `${def.name} ${ROMAN_TIERS[tier - 1]}`,
          element,
          tier,
          description: `${def.description} (+${tierMultiplier * 100}% effectiveness)`,
          statKey: def.statKey,
          statValue,
          percentValue,
          baseValue: value,
          dropChance: def.dropChance,
          bossDropChance: def.bossDropChance
        }
      });

      createdGems[element].push(gem);
      console.log(`  ✓ Created: ${gem.name} (${gem.statKey}: ${gem.statValue}, ${gem.percentValue * 100}%)`);
    }

    // Set up tier upgrade relationships
    for (let tier = 1; tier < 5; tier++) {
      const currentGem = createdGems[element][tier - 1];
      const nextGem = createdGems[element][tier];

      await prisma.gemTemplate.update({
        where: { id: currentGem.id },
        data: { nextTierGemId: nextGem.id }
      });
    }

    console.log(`  ✓ Set up tier upgrades for ${element}\n`);
  }

  // Summary
  console.log('✅ Gem seeding complete!\n');
  console.log('📊 Summary:');
  console.log(`  - Elements: ${ELEMENTS.length}`);
  console.log(`  - Tiers per element: 5`);
  console.log(`  - Total gems: ${ELEMENTS.length * 5}`);

  // Display gem tier info
  console.log('\n📈 Tier progression example (FIRE):');
  const fireGems = createdGems['FIRE'];
  for (const gem of fireGems) {
    console.log(`  ${gem.name}: ${gem.statKey} +${gem.statValue}, +${gem.percentValue * 100}%, Value: ${gem.baseValue}g`);
  }

  console.log('\n🎯 Drop rates:');
  console.log('  - Normal monsters: 0.5% - 1%');
  console.log('  - Boss monsters: 5% - 10%');

  console.log('\n💎 Upgrade recipe: 3x Tier N = 1x Tier N+1');
}

seedGems()
  .catch((e) => {
    console.error('❌ Error seeding gems:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
