const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Unit Stat System - Seed Data
 * Phase 1: Database Foundation - Data Migration
 * 
 * Includes:
 * 1. Elemental Types (FIRE, WATER, EARTH, WIND, LIGHT, DARK)
 * 2. Stat Allocation Templates for each class
 * 3. Equipment Set Templates with bonuses
 * 4. Set Bonus Conditions
 */

async function main() {
  console.log("=== UNIT STAT SYSTEM SEED DATA ===");
  console.log("Phase 1: Database Foundation - Data Migration\n");

  // ============================================
  // 1. ELEMENTAL TYPES
  // ============================================
  console.log("Seeding Elemental Types...");
  
  const elementalTypes = [
    { 
      id: 'FIRE', 
      name: 'Fire', 
      weaknessTo: 'WATER', 
      resistOf: 'WIND',
      description: 'Fire element burns enemies with flame damage. Strong against Wind, weak against Water.'
    },
    { 
      id: 'WATER', 
      name: 'Water', 
      weaknessTo: 'EARTH', 
      resistOf: 'FIRE',
      description: 'Water element douses enemies with water damage. Strong against Fire, weak against Earth.'
    },
    { 
      id: 'EARTH', 
      name: 'Earth', 
      weaknessTo: 'WIND', 
      resistOf: 'WATER',
      description: 'Earth element crushes enemies with earth damage. Strong against Water, weak against Wind.'
    },
    { 
      id: 'WIND', 
      name: 'Wind', 
      weaknessTo: 'FIRE', 
      resistOf: 'EARTH',
      description: 'Wind element slices enemies with wind damage. Strong against Earth, weak against Fire.'
    },
    { 
      id: 'LIGHT', 
      name: 'Light', 
      weaknessTo: 'DARK', 
      resistOf: 'DARK',
      description: 'Light element purifies enemies with holy damage. Strong against Dark, weak against Dark.'
    },
    { 
      id: 'DARK', 
      name: 'Dark', 
      weaknessTo: 'LIGHT', 
      resistOf: 'LIGHT',
      description: 'Dark element corrupts enemies with shadow damage. Strong against Light, weak against Light.'
    }
  ];

  // For SQLite, we need to handle the enum differently - insert into table if exists
  // The ElementalType is used as a relation reference
  // We'll seed the affinity data when heroes are created

  // ============================================
  // 2. STAT ALLOCATION TEMPLATES
  // ============================================
  console.log("Seeding Stat Allocation Templates...");

  // Class ID mappings based on seed_classes.js:
  // Tier 0: 1001 - Novice
  // Tier 1: 1101-Warrior, 1102-Scout, 1103-Apprentice, 1104-Votary, 1105-Brute, 1106-Duelist, 1107-Archer
  // Tier 2: 2101-Knight, 2103-Rogue, 2111-Wizard
  // Tier 3: 3101-Lord Commander, 3105-Archmage

  const statTemplates = [
    // TIER 0 - Novice (Balanced starter)
    {
      classId: 1001,
      strGrowthCurve: 'linear',
      dexGrowthCurve: 'linear',
      intGrowthCurve: 'linear',
      vitGrowthCurve: 'linear',
      lukGrowthCurve: 'linear',
      strGrowthFactor: 1.0,
      dexGrowthFactor: 1.0,
      intGrowthFactor: 1.0,
      vitGrowthFactor: 1.0,
      lukGrowthFactor: 1.0,
      basePointsPerLevel: 5,
      maxStatCap: 255,
      recommendedStr: 10,
      recommendedDex: 10,
      recommendedInt: 10,
      recommendedVit: 10,
      recommendedLuk: 5
    },
    // TIER 1 - Warrior (STR/VIT focus)
    {
      classId: 1101,
      strGrowthCurve: 'linear',
      dexGrowthCurve: 'linear',
      intGrowthCurve: 'sigmoid',
      vitGrowthCurve: 'linear',
      lukGrowthCurve: 'linear',
      strGrowthFactor: 2.0,
      dexGrowthFactor: 1.0,
      intGrowthFactor: 0.5,
      vitGrowthFactor: 1.5,
      lukGrowthFactor: 1.0,
      basePointsPerLevel: 5,
      maxStatCap: 255,
      recommendedStr: 15,
      recommendedDex: 8,
      recommendedInt: 5,
      recommendedVit: 12,
      recommendedLuk: 5
    },
    // TIER 1 - Scout (DEX focus)
    {
      classId: 1102,
      strGrowthCurve: 'linear',
      dexGrowthCurve: 'exponential',
      intGrowthCurve: 'linear',
      vitGrowthCurve: 'linear',
      lukGrowthCurve: 'sigmoid',
      strGrowthFactor: 1.0,
      dexGrowthFactor: 2.0,
      intGrowthFactor: 0.8,
      vitGrowthFactor: 0.8,
      lukGrowthFactor: 1.5,
      basePointsPerLevel: 5,
      maxStatCap: 255,
      recommendedStr: 8,
      recommendedDex: 15,
      recommendedInt: 8,
      recommendedVit: 7,
      recommendedLuk: 7
    },
    // TIER 1 - Apprentice (INT focus)
    {
      classId: 1103,
      strGrowthCurve: 'linear',
      dexGrowthCurve: 'linear',
      intGrowthCurve: 'exponential',
      vitGrowthCurve: 'linear',
      lukGrowthCurve: 'linear',
      strGrowthFactor: 0.5,
      dexGrowthFactor: 1.0,
      intGrowthFactor: 2.0,
      vitGrowthFactor: 1.0,
      lukGrowthFactor: 1.0,
      basePointsPerLevel: 5,
      maxStatCap: 255,
      recommendedStr: 5,
      recommendedDex: 8,
      recommendedInt: 15,
      recommendedVit: 10,
      recommendedLuk: 7
    },
    // TIER 1 - Votary (VIT focus)
    {
      classId: 1104,
      strGrowthCurve: 'sigmoid',
      dexGrowthCurve: 'linear',
      intGrowthCurve: 'linear',
      vitGrowthCurve: 'exponential',
      lukGrowthCurve: 'linear',
      strGrowthFactor: 1.0,
      dexGrowthFactor: 0.8,
      intGrowthFactor: 1.0,
      vitGrowthFactor: 2.0,
      lukGrowthFactor: 1.0,
      basePointsPerLevel: 5,
      maxStatCap: 255,
      recommendedStr: 8,
      recommendedDex: 7,
      recommendedInt: 10,
      recommendedVit: 15,
      recommendedLuk: 5
    },
    // TIER 1 - Brute (STR/VIT focus)
    {
      classId: 1105,
      strGrowthCurve: 'exponential',
      dexGrowthCurve: 'linear',
      intGrowthCurve: 'linear',
      vitGrowthCurve: 'linear',
      lukGrowthCurve: 'linear',
      strGrowthFactor: 2.0,
      dexGrowthFactor: 0.8,
      intGrowthFactor: 0.5,
      vitGrowthFactor: 1.5,
      lukGrowthFactor: 1.0,
      basePointsPerLevel: 6,
      maxStatCap: 300,
      recommendedStr: 18,
      recommendedDex: 5,
      recommendedInt: 3,
      recommendedVit: 14,
      recommendedLuk: 5
    },
    // TIER 1 - Duelist (DEX/LUK focus)
    {
      classId: 1106,
      strGrowthCurve: 'linear',
      dexGrowthCurve: 'exponential',
      intGrowthCurve: 'linear',
      vitGrowthCurve: 'linear',
      lukGrowthCurve: 'exponential',
      strGrowthFactor: 1.2,
      dexGrowthFactor: 2.0,
      intGrowthFactor: 0.8,
      vitGrowthFactor: 0.8,
      lukGrowthFactor: 2.0,
      basePointsPerLevel: 5,
      maxStatCap: 255,
      recommendedStr: 10,
      recommendedDex: 15,
      recommendedInt: 5,
      recommendedVit: 5,
      recommendedLuk: 10
    },
    // TIER 1 - Archer (DEX focus)
    {
      classId: 1107,
      strGrowthCurve: 'linear',
      dexGrowthCurve: 'exponential',
      intGrowthCurve: 'linear',
      vitGrowthCurve: 'linear',
      lukGrowthCurve: 'sigmoid',
      strGrowthFactor: 1.0,
      dexGrowthFactor: 2.5,
      intGrowthFactor: 0.8,
      vitGrowthFactor: 0.8,
      lukGrowthFactor: 1.2,
      basePointsPerLevel: 5,
      maxStatCap: 255,
      recommendedStr: 7,
      recommendedDex: 18,
      recommendedInt: 7,
      recommendedVit: 6,
      recommendedLuk: 7
    },
    // TIER 2 - Knight (STR/VIT tank)
    {
      classId: 2101,
      strGrowthCurve: 'linear',
      dexGrowthCurve: 'linear',
      intGrowthCurve: 'sigmoid',
      vitGrowthCurve: 'exponential',
      lukGrowthCurve: 'linear',
      strGrowthFactor: 2.0,
      dexGrowthFactor: 1.0,
      intGrowthFactor: 0.5,
      vitGrowthFactor: 2.0,
      lukGrowthFactor: 1.0,
      basePointsPerLevel: 6,
      maxStatCap: 300,
      recommendedStr: 18,
      recommendedDex: 8,
      recommendedInt: 5,
      recommendedVit: 18,
      recommendedLuk: 6
    },
    // TIER 2 - Rogue (DEX/LUK burst)
    {
      classId: 2103,
      strGrowthCurve: 'linear',
      dexGrowthCurve: 'exponential',
      intGrowthCurve: 'linear',
      vitGrowthCurve: 'linear',
      lukGrowthCurve: 'exponential',
      strGrowthFactor: 1.0,
      dexGrowthFactor: 2.5,
      intGrowthFactor: 1.0,
      vitGrowthFactor: 0.8,
      lukGrowthFactor: 2.5,
      basePointsPerLevel: 5,
      maxStatCap: 255,
      recommendedStr: 8,
      recommendedDex: 20,
      recommendedInt: 8,
      recommendedVit: 5,
      recommendedLuk: 14
    },
    // TIER 2 - Wizard (INT nuke)
    {
      classId: 2111,
      strGrowthCurve: 'linear',
      dexGrowthCurve: 'linear',
      intGrowthCurve: 'exponential',
      vitGrowthCurve: 'sigmoid',
      lukGrowthCurve: 'linear',
      strGrowthFactor: 0.5,
      dexGrowthFactor: 1.0,
      intGrowthFactor: 3.0,
      vitGrowthFactor: 1.0,
      lukGrowthFactor: 1.0,
      basePointsPerLevel: 5,
      maxStatCap: 255,
      recommendedStr: 4,
      recommendedDex: 6,
      recommendedInt: 25,
      recommendedVit: 8,
      recommendedLuk: 7
    },
    // TIER 3 - Lord Commander (Balanced elite)
    {
      classId: 3101,
      strGrowthCurve: 'linear',
      dexGrowthCurve: 'linear',
      intGrowthCurve: 'linear',
      vitGrowthCurve: 'linear',
      lukGrowthCurve: 'exponential',
      strGrowthFactor: 2.5,
      dexGrowthFactor: 1.5,
      intGrowthFactor: 1.5,
      vitGrowthFactor: 2.5,
      lukGrowthFactor: 2.0,
      basePointsPerLevel: 7,
      maxStatCap: 350,
      recommendedStr: 25,
      recommendedDex: 15,
      recommendedInt: 15,
      recommendedVit: 25,
      recommendedLuk: 15
    },
    // TIER 3 - Archmage (INT elite)
    {
      classId: 3105,
      strGrowthCurve: 'linear',
      dexGrowthCurve: 'linear',
      intGrowthCurve: 'exponential',
      vitGrowthCurve: 'linear',
      lukGrowthCurve: 'exponential',
      strGrowthFactor: 0.5,
      dexGrowthFactor: 1.0,
      intGrowthFactor: 3.5,
      vitGrowthFactor: 1.0,
      lukGrowthFactor: 2.0,
      basePointsPerLevel: 6,
      maxStatCap: 300,
      recommendedStr: 4,
      recommendedDex: 8,
      recommendedInt: 35,
      recommendedVit: 10,
      recommendedLuk: 15
    }
  ];

  for (const template of statTemplates) {
    await prisma.statAllocationTemplate.upsert({
      where: { classId: template.classId },
      update: template,
      create: template
    });
  }
  console.log(`  ✅ Seeded ${statTemplates.length} stat allocation templates`);

  // ============================================
  // 3. EQUIPMENT SET TEMPLATES
  // ============================================
  console.log("\nSeeding Equipment Set Templates...");

  const equipmentSets = [
    {
      id: 1,
      name: 'Fire Lord Set',
      description: 'A legendary armor set forged in volcanic forges. Grants immense fire damage bonuses.'
    },
    {
      id: 2,
      name: 'Guardian Set',
      description: 'Heavy armor set designed for frontline defenders. Provides exceptional defense bonuses.'
    },
    {
      id: 3,
      name: 'Shadow Walker Set',
      description: 'Light armor set favored by rogues and assassins. Enhances critical hit damage and evasion.'
    },
    {
      id: 4,
      name: 'Mage Supreme Set',
      description: 'Robes imbued with ancient arcane wisdom. Dramatically increases spell power and mana regeneration.'
    },
    {
      id: 5,
      name: 'Nature\'s Blessing Set',
      description: 'Armor infused with the power of nature. Provides balanced bonuses and elemental resistances.'
    },
    {
      id: 6,
      name: 'War Champion Set',
      description: 'The mark of a true warrior. Grants bonuses to attack speed and combat effectiveness.'
    }
  ];

  for (const set of equipmentSets) {
    await prisma.equipmentSetTemplate.upsert({
      where: { id: set.id },
      update: set,
      create: set
    });
  }
  console.log(`  ✅ Seeded ${equipmentSets.length} equipment set templates`);

  // ============================================
  // 4. SET PIECES (using placeholder itemTemplateIds)
  // ============================================
  console.log("\nSeeding Equipment Set Pieces...");

  const setPieces = [
    // Fire Lord Set (5 pieces)
    { setId: 1, pieceOrder: 1, itemTemplateId: 5001 },
    { setId: 1, pieceOrder: 2, itemTemplateId: 5002 },
    { setId: 1, pieceOrder: 3, itemTemplateId: 5003 },
    { setId: 1, pieceOrder: 4, itemTemplateId: 5004 },
    { setId: 1, pieceOrder: 5, itemTemplateId: 5005 },
    
    // Guardian Set (5 pieces)
    { setId: 2, pieceOrder: 1, itemTemplateId: 5011 },
    { setId: 2, pieceOrder: 2, itemTemplateId: 5012 },
    { setId: 2, pieceOrder: 3, itemTemplateId: 5013 },
    { setId: 2, pieceOrder: 4, itemTemplateId: 5014 },
    { setId: 2, pieceOrder: 5, itemTemplateId: 5015 },
    
    // Shadow Walker Set (5 pieces)
    { setId: 3, pieceOrder: 1, itemTemplateId: 5021 },
    { setId: 3, pieceOrder: 2, itemTemplateId: 5022 },
    { setId: 3, pieceOrder: 3, itemTemplateId: 5023 },
    { setId: 3, pieceOrder: 4, itemTemplateId: 5024 },
    { setId: 3, pieceOrder: 5, itemTemplateId: 5025 },
    
    // Mage Supreme Set (5 pieces)
    { setId: 4, pieceOrder: 1, itemTemplateId: 5031 },
    { setId: 4, pieceOrder: 2, itemTemplateId: 5032 },
    { setId: 4, pieceOrder: 3, itemTemplateId: 5033 },
    { setId: 4, pieceOrder: 4, itemTemplateId: 5034 },
    { setId: 4, pieceOrder: 5, itemTemplateId: 5035 },
    
    // Nature's Blessing Set (5 pieces)
    { setId: 5, pieceOrder: 1, itemTemplateId: 5041 },
    { setId: 5, pieceOrder: 2, itemTemplateId: 5042 },
    { setId: 5, pieceOrder: 3, itemTemplateId: 5043 },
    { setId: 5, pieceOrder: 4, itemTemplateId: 5044 },
    { setId: 5, pieceOrder: 5, itemTemplateId: 5045 },
    
    // War Champion Set (5 pieces)
    { setId: 6, pieceOrder: 1, itemTemplateId: 5051 },
    { setId: 6, pieceOrder: 2, itemTemplateId: 5052 },
    { setId: 6, pieceOrder: 3, itemTemplateId: 5053 },
    { setId: 6, pieceOrder: 4, itemTemplateId: 5054 },
    { setId: 6, pieceOrder: 5, itemTemplateId: 5055 }
  ];

  for (const piece of setPieces) {
    await prisma.equipmentSetPiece.upsert({
      where: { setId_pieceOrder: { setId: piece.setId, pieceOrder: piece.pieceOrder } },
      update: piece,
      create: piece
    });
  }
  console.log(`  ✅ Seeded ${setPieces.length} set pieces`);

  // ============================================
  // 5. SET BONUSES
  // ============================================
  console.log("\nSeeding Equipment Set Bonuses...");

  const setBonuses = [
    // Fire Lord Set Bonuses
    { setId: 1, requiredPieces: 2, description: '+10% Fire Damage', bonusStats: JSON.stringify({ fire_damage_mult: 0.10 }) },
    { setId: 1, requiredPieces: 3, description: '+20 Fire Damage & +5% Fire Resist', bonusStats: JSON.stringify({ fire_damage: 20, fire_resistance: 0.05 }) },
    { setId: 1, requiredPieces: 4, description: '+30% Fire Damage & Burn Chance', bonusStats: JSON.stringify({ fire_damage_mult: 0.30, burn_chance: 0.15 }) },
    { setId: 1, requiredPieces: 5, description: 'Inferno: Ultimate Fire Mastery', bonusStats: JSON.stringify({ fire_damage_mult: 0.50, fire_resistance: 0.20, burn_damage_mult: 0.50 }) },
    
    // Guardian Set Bonuses
    { setId: 2, requiredPieces: 2, description: '+10 Defense', bonusStats: JSON.stringify({ defense: 10 }) },
    { setId: 2, requiredPieces: 3, description: '+20 Defense & +5% Block', bonusStats: JSON.stringify({ defense: 20, block_chance: 0.05 }) },
    { setId: 2, requiredPieces: 4, description: '+40 Defense & +10% Block', bonusStats: JSON.stringify({ defense: 40, block_chance: 0.10, block_power: 0.25 }) },
    { setId: 2, requiredPieces: 5, description: 'Fortress: Unbreakable Defense', bonusStats: JSON.stringify({ defense: 80, block_chance: 0.20, damage_reduction: 0.15 }) },
    
    // Shadow Walker Set Bonuses
    { setId: 3, requiredPieces: 2, description: '+5% Crit Chance', bonusStats: JSON.stringify({ crit_chance: 0.05 }) },
    { setId: 3, requiredPieces: 3, description: '+10% Crit Chance & +10% Evasion', bonusStats: JSON.stringify({ crit_chance: 0.10, dodge_chance: 0.10 }) },
    { setId: 3, requiredPieces: 4, description: '+25% Crit Damage & +15% Evasion', bonusStats: JSON.stringify({ crit_damage: 0.25, dodge_chance: 0.15, accuracy: 15 }) },
    { setId: 3, requiredPieces: 5, description: 'Shadow Strike: Death from Shadows', bonusStats: JSON.stringify({ crit_chance: 0.15, crit_damage: 0.50, backstab_mult: 1.0, speed: 20 }) },
    
    // Mage Supreme Set Bonuses
    { setId: 4, requiredPieces: 2, description: '+10% Spell Power', bonusStats: JSON.stringify({ skill_power_mult: 0.10 }) },
    { setId: 4, requiredPieces: 3, description: '+20 Spell Power & +10% Mana Regen', bonusStats: JSON.stringify({ skill_power: 20, mana_regen_mult: 0.10 }) },
    { setId: 4, requiredPieces: 4, description: '+40% Spell Power & +20% Mana Regen', bonusStats: JSON.stringify({ skill_power_mult: 0.40, mana_regen_mult: 0.20, cooldown_reduction: 0.10 }) },
    { setId: 4, requiredPieces: 5, description: 'Arcane Supremacy: Ultimate Magic', bonusStats: JSON.stringify({ skill_power_mult: 0.80, mana_regen_mult: 0.50, cooldown_reduction: 0.20, spell_vamp: 0.15 }) },
    
    // Nature's Blessing Set Bonuses
    { setId: 5, requiredPieces: 2, description: '+5 All Elemental Resistances', bonusStats: JSON.stringify({ elemental_resistance_all: 5 }) },
    { setId: 5, requiredPieces: 3, description: '+10 All Stats & +10% HP Regen', bonusStats: JSON.stringify({ str: 10, dex: 10, int: 10, vit: 10, hp_regen_mult: 0.10 }) },
    { setId: 5, requiredPieces: 4, description: '+20 All Stats & +20% HP Regen', bonusStats: JSON.stringify({ str: 20, dex: 20, int: 20, vit: 20, hp_regen_mult: 0.20, status_resistance: 0.15 }) },
    { setId: 5, requiredPieces: 5, description: 'Harmony: Perfect Balance', bonusStats: JSON.stringify({ all_stats_mult: 0.15, hp_regen_mult: 0.50, mana_regen_mult: 0.30, status_immunity: 0.10 }) },
    
    // War Champion Set Bonuses
    { setId: 6, requiredPieces: 2, description: '+5% Attack Speed', bonusStats: JSON.stringify({ attack_speed_mult: 0.05 }) },
    { setId: 6, requiredPieces: 3, description: '+15 Attack & +10% Attack Speed', bonusStats: JSON.stringify({ damage_base: 15, attack_speed_mult: 0.10 }) },
    { setId: 6, requiredPieces: 4, description: '+30 Attack & +15% Attack Speed', bonusStats: JSON.stringify({ damage_base: 30, attack_speed_mult: 0.15, armor_penetration: 10 }) },
    { setId: 6, requiredPieces: 5, description: 'Champion\'s Glory: Ultimate Warrior', bonusStats: JSON.stringify({ damage_base_mult: 0.30, attack_speed_mult: 0.25, lifesteal: 0.15, intimidate: 0.20 }) }
  ];

  for (const bonus of setBonuses) {
    await prisma.equipmentSetBonus.upsert({
      where: { setId_requiredPieces: { setId: bonus.setId, requiredPieces: bonus.requiredPieces } },
      update: bonus,
      create: bonus
    });
  }
  console.log(`  ✅ Seeded ${setBonuses.length} set bonuses`);

  // ============================================
  // 6. SET BONUS CONDITIONS
  // ============================================
  console.log("\nSeeding Set Bonus Conditions...");

  const setBonusConditions = [
    // Fire Lord - Conditional bonus when enemy is burning
    { bonusId: 4, conditionType: 'ENEMY_STATUS', conditionValue: 'BURN' },
    
    // Guardian - Conditional bonus when HP is low
    { bonusId: 8, conditionType: 'SELF_HP_PERCENT', conditionValue: 'lt:30' },
    
    // Shadow Walker - Conditional bonus when attacking from behind
    { bonusId: 12, conditionType: 'ATTACK_DIRECTION', conditionValue: 'BACK' },
    
    // Mage Supreme - Conditional bonus when mana is full
    { bonusId: 16, conditionType: 'SELF_MANA_PERCENT', conditionValue: 'eq:100' },
    
    // Nature's Blessing - Conditional bonus when affected by status
    { bonusId: 20, conditionType: 'SELF_HAS_STATUS', conditionValue: 'true' },
    
    // War Champion - Conditional bonus when enemy is vulnerable
    { bonusId: 24, conditionType: 'ENEMY_STATUS', conditionValue: 'STUN,SLOW,ROOT' }
  ];

  for (const condition of setBonusConditions) {
    await prisma.setBonusCondition.create({
      data: condition
    });
  }
  console.log(`  ✅ Seeded ${setBonusConditions.length} set bonus conditions`);

  console.log("\n=== UNIT STAT SYSTEM SEED COMPLETE ===");
  console.log("\nSummary:");
  console.log(`  - Elemental Types: 6 (FIRE, WATER, EARTH, WIND, LIGHT, DARK)`);
  console.log(`  - Stat Allocation Templates: ${statTemplates.length}`);
  console.log(`  - Equipment Set Templates: ${equipmentSets.length}`);
  console.log(`  - Set Pieces: ${setPieces.length}`);
  console.log(`  - Set Bonuses: ${setBonuses.length}`);
  console.log(`  - Set Bonus Conditions: ${setBonusConditions.length}`);
}

main()
  .catch(e => { 
    console.error(e); 
    process.exit(1); 
  })
  .finally(async () => { 
    await prisma.$disconnect(); 
  });
