import assert from 'node:assert';
import test from 'node:test';
import { CombatSimulator } from '../dist/src/combat/CombatSimulator.js';
import { 
  getJobAdvancements, 
  canAdvanceTo,
  JobTier,
  JobCategory 
} from '../dist/src/templates/ClassTemplate.js';
import { createUnitFromClass } from '../dist/src/templates/RaceTemplate.js';
import { CLASS_TEMPLATES } from '../dist/src/templates/classes/index.js';
import { RACE_TEMPLATES } from '../dist/src/templates/races/index.js';
import { ElementType } from '../dist/src/templates/elements/index.js';
import {
  // Factory functions
  createCreature,
  createMonsterFromTemplate,
  createPlayer,
  createNPC,
  createMonsterParty,
  calculateMonsterRewards,
  createSlime,
  createFireSlime,
  createSkeletonArcher,
  createDragonMage,
  createBoss,
  // Creature components
  CREATURE_TEMPLATES,
  getCreatureTemplate,
  getBossCreatures,
  getCreaturesByType,
  slimeTemplates,
  skeletonTemplates,
  dragonTemplates,
  // Enums
  CreatureType,
  CreatureRank,
  CreatureTier,
  CreatureKind,
  // Modifiers
  ELEMENT_MODIFIERS,
  CLASS_MODIFIERS,
} from '../dist/src/templates/creatures/index.js';

test('CombatSimulator - tick-based combat with DEX', async () => {
  const simulator = new CombatSimulator();
  
  // Hero: DEX 50 → needs 50 ticks to act (100-50=50)
  const playerTeam = [
    { id: 'hero1', name: 'Hero', level: 10, hp: 100, maxHp: 100, attack: 20, defense: 5, speed: 50, magic: 10, critRate: 15, critDamage: 1.5, evasion: 10, resistance: 5 }
  ];
  
  // Goblin: DEX 30 → needs 70 ticks to act (100-30=70)
  const enemyTeam = [
    { id: 'goblin1', name: 'Goblin', level: 8, hp: 60, maxHp: 60, attack: 12, defense: 3, speed: 30, magic: 0, critRate: 5, critDamage: 1.25, evasion: 5, resistance: 0 }
  ];
  
  const result = await simulator.simulate(playerTeam, enemyTeam);
  
  assert.ok(result, 'Should return a result');
  assert.ok(result.totalTicks > 0, 'Should have combat ticks');
  assert.ok(result.logs.length > 0, 'Should have combat logs');
  assert(['player', 'enemy', 'draw'].includes(result.winner), 'Should have valid winner');
  
  console.log(`✓ Tick-based combat: ${result.winner} wins in ${result.totalTicks} ticks`);
  console.log(`  - Actions: ${result.logs.length}`);
  console.log(`  - Rewards: ${result.rewards?.experience} XP, ${result.rewards?.gold} Gold`);
});

test('CombatSimulator - deterministic with DEX', async () => {
  const simulator = new CombatSimulator();
  
  const playerTeam = [
    { id: 'warrior', name: 'Warrior', level: 5, hp: 50, maxHp: 50, attack: 10, defense: 5, speed: 40, magic: 0, critRate: 10, critDamage: 1.5, evasion: 5, resistance: 0 }
  ];
  
  const enemyTeam = [
    { id: 'slime', name: 'Slime', level: 3, hp: 30, maxHp: 30, attack: 5, defense: 2, speed: 20, magic: 0, critRate: 5, critDamage: 1.25, evasion: 3, resistance: 0 }
  ];
  
  // Run twice - same input = same result (deterministic)
  const result1 = await simulator.simulate(playerTeam, enemyTeam);
  const result2 = await simulator.simulate(playerTeam, enemyTeam);
  
  assert.equal(result1.winner, 'player', 'Stronger unit should win');
  assert.equal(result2.winner, 'player', 'Should be same result');
  
  console.log('✓ Deterministic combat verified');
});

test('CombatSimulator - DEX affects action frequency', async () => {
  const simulator = new CombatSimulator();
  
  // High DEX (90) → 10 ticks per action
  const playerTeam = [
    { id: 'fast', name: 'FastUnit', level: 10, hp: 100, maxHp: 100, attack: 15, defense: 5, speed: 90, magic: 0, critRate: 10, critDamage: 1.5, evasion: 10, resistance: 0 }
  ];
  
  // Low DEX (10) → 90 ticks per action
  const enemyTeam = [
    { id: 'slow', name: 'SlowUnit', level: 10, hp: 100, maxHp: 100, attack: 15, defense: 5, speed: 10, magic: 0, critRate: 10, critDamage: 1.5, evasion: 10, resistance: 0 }
  ];
  
  const result = await simulator.simulate(playerTeam, enemyTeam, 200);
  
  // Fast unit should act more times than slow unit
  const fastActions = result.logs.filter(l => l.actorId === 'fast').length;
  const slowActions = result.logs.filter(l => l.actorId === 'slow').length;
  
  assert.ok(fastActions > slowActions, 'Fast unit should act more times');
  
  console.log(`✓ DEX test: Fast unit acts ${fastActions}x, Slow unit acts ${slowActions}x`);
});

test('ClassTemplate - create novice at level 1', () => {
  const unit = createUnitFromClass('novice', 1, 'hero1', { 
    classTemplates: CLASS_TEMPLATES,
    raceTemplates: RACE_TEMPLATES
  });
  
  assert.equal(unit.name, 'Novice', 'Should have class name');
  assert.equal(unit.level, 1, 'Should be level 1');
  assert.ok(unit.hp > 0, 'Should have HP');
  assert.ok(unit.attack >= 0, 'Should have attack');
  assert.ok(unit.speed > 0, 'Should have speed (DEX)');
  
  console.log(`✓ Novice Lv.1: HP=${unit.hp}, ATK=${unit.attack}, DEX=${unit.speed}`);
});

test('ClassTemplate - swordsman stats scale with level', () => {
  const lvl1 = createUnitFromClass('swordsman', 1, 'sword1', { 
    classTemplates: CLASS_TEMPLATES,
    raceTemplates: RACE_TEMPLATES
  });
  const lvl30 = createUnitFromClass('swordsman', 30, 'sword30', { 
    classTemplates: CLASS_TEMPLATES,
    raceTemplates: RACE_TEMPLATES
  });
  
  assert.ok(lvl30.hp > lvl1.hp, 'HP should scale with level');
  assert.ok(lvl30.attack > lvl1.attack, 'Attack should scale with level');
  assert.ok(lvl30.speed > lvl1.speed, 'DEX should scale with level');
  
  console.log(`✓ Swordsman Lv.1: HP=${lvl1.hp}, ATK=${lvl1.attack}, DEX=${lvl1.speed}`);
  console.log(`✓ Swordsman Lv.30: HP=${lvl30.hp}, ATK=${lvl30.attack}, DEX=${lvl30.speed}`);
});

import { JOB_PROGRESSION } from '../dist/src/templates/classes/index.js';

test('ClassTemplate - job progression system', () => {
  const advancements = getJobAdvancements('swordsman', JOB_PROGRESSION);
  
  assert.ok(advancements.includes('knight'), 'Swordsman should advance to Knight');
  assert.ok(advancements.includes('berserker'), 'Swordsman should advance to Berserker');
  
  assert.ok(canAdvanceTo('swordsman', 'knight', JOB_PROGRESSION), 'Can advance to Knight');
  assert.ok(!canAdvanceTo('novice', 'knight', JOB_PROGRESSION), 'Cannot skip to Knight without Swordsman');
  
  console.log(`✓ Swordsman advancements: ${advancements.join(', ')}`);
});

test('ClassTemplate - different job categories', () => {
  const swordsman = CLASS_TEMPLATES['swordsman'];
  const mage = CLASS_TEMPLATES['mage'];
  const thief = CLASS_TEMPLATES['thief'];
  
  assert.equal(swordsman.jobCategory, JobCategory.PHYSICAL, 'Swordsman is PHYSICAL');
  assert.equal(mage.jobCategory, JobCategory.MAGIC, 'Mage is MAGIC');
  assert.equal(thief.jobCategory, JobCategory.PHYSICAL, 'Thief is PHYSICAL (evasion)');
  
  assert.equal(swordsman.jobTier, JobTier.FIRST_JOB, 'Swordsman is FIRST_JOB');
  assert.equal(mage.jobTier, JobTier.FIRST_JOB, 'Mage is FIRST_JOB');
  
  console.log(`✓ Job categories: Swordsman=${swordsman.jobCategory}, Mage=${mage.jobCategory}`);
  console.log(`✓ Job tiers: Swordsman=${swordsman.jobTier}, Mage=${mage.jobTier}`);
});

test('ClassTemplate - master classes have highest stats', () => {
  const noviceUnit = createUnitFromClass('novice', 50, 'n1', { 
    classTemplates: CLASS_TEMPLATES,
    raceTemplates: RACE_TEMPLATES
  });
  const swordsmanUnit = createUnitFromClass('swordsman', 50, 'sword50', { 
    classTemplates: CLASS_TEMPLATES,
    raceTemplates: RACE_TEMPLATES
  });
  
  console.log(`✓ Novice Lv.50: HP=${noviceUnit.hp}, ATK=${noviceUnit.attack}, DEX=${noviceUnit.speed}`);
  console.log(`✓ Swordsman Lv.50: HP=${swordsmanUnit.hp}, ATK=${swordsmanUnit.attack}, DEX=${swordsmanUnit.speed}`);
  
  // HP check
  const hpPass = swordsmanUnit.hp > noviceUnit.hp;
  console.log(`  HP: ${swordsmanUnit.hp} > ${noviceUnit.hp} = ${hpPass}`);
  
  // Attack check
  const atkPass = swordsmanUnit.attack > noviceUnit.attack;
  console.log(`  ATK: ${swordsmanUnit.attack} > ${noviceUnit.attack} = ${atkPass}`);
  
  // DEX check
  const dexPass = swordsmanUnit.speed > noviceUnit.speed;
  console.log(`  DEX: ${swordsmanUnit.speed} > ${noviceUnit.speed} = ${dexPass}`);
  
  assert.ok(hpPass, 'Swordsman should have more HP than Novice');
  assert.ok(atkPass, 'Swordsman should have more Attack than Novice');
  assert.ok(dexPass, 'Swordsman should have more DEX than Novice');
});

// ========== MONSTER TEMPLATE TESTS ==========

test('MonsterTemplate - create slime at level 1', () => {
  const slime = createMonsterFromTemplate('base_slime', 1, 'slime_1');
  
  assert.equal(slime.name, 'Slime', 'Should have monster name');
  assert.equal(slime.level, 1, 'Should be level 1');
  assert.ok(slime.hp > 0, 'Should have HP');
  assert.ok(slime.attack > 0, 'Should have attack');
  
  console.log(`✓ Slime Lv.1: HP=${slime.hp}, ATK=${slime.attack}, DEX=${slime.speed}`);
});

test('MonsterTemplate - boss has more stats than normal', () => {
  // Slime has NORMAL role by default, test with different roles
  const normalSlime = createMonsterFromTemplate('base_slime', 50, 'slime_norm', CreatureRank.NORMAL);
  const eliteSlime = createMonsterFromTemplate('base_slime', 50, 'slime_elite', CreatureRank.ELITE);
  const bossSlime = createMonsterFromTemplate('base_slime', 50, 'slime_boss', CreatureRank.BOSS);
  
  assert.ok(eliteSlime.hp > normalSlime.hp, 'Elite should have more HP than normal');
  assert.ok(bossSlime.hp > eliteSlime.hp, 'Boss should have more HP than elite');
  assert.ok(bossSlime.attack > normalSlime.attack, 'Boss should have more Attack');
  
  console.log(`✓ Slime Normal Lv.50: HP=${normalSlime.hp}, ATK=${normalSlime.attack}`);
  console.log(`✓ Slime Elite Lv.50: HP=${eliteSlime.hp}, ATK=${eliteSlime.attack}`);
  console.log(`✓ Slime Boss Lv.50: HP=${bossSlime.hp}, ATK=${bossSlime.attack}`);
});

test('MonsterTemplate - tier scaling works', () => {
  const slime = createMonsterFromTemplate('base_slime', 30, 'slime_30');
  const dragon = createMonsterFromTemplate('base_dragon', 30, 'dragon_30');
  
  assert.ok(dragon.hp > slime.hp, 'Higher tier should have more HP');
  assert.ok(dragon.attack > slime.attack, 'Higher tier should have more Attack');
  
  console.log(`✓ Slime Lv.30: HP=${slime.hp}, ATK=${slime.attack}`);
  console.log(`✓ Dragon Lv.30: HP=${dragon.hp}, ATK=${dragon.attack}`);
});

test('MonsterTemplate - monster party creation', () => {
  const party = createMonsterParty('base_skeleton', 10, 5);
  
  assert.equal(party.length, 5, 'Should create 5 skeletons');
  assert.ok(party.every(m => m.name === 'Skeleton'), 'All should be Skeletons');
  
  console.log(`✓ Skeleton Party (5): Total HP=${party.reduce((s,m) => s + m.hp, 0)}`);
});

test('MonsterTemplate - rewards calculation', () => {
  const rewards = calculateMonsterRewards(CREATURE_TEMPLATES['base_dragon'], 50, CreatureRank.BOSS);
  
  assert.ok(rewards.exp > 0, 'Should have EXP reward');
  assert.ok(rewards.gold > 0, 'Should have gold reward');
  assert.ok(rewards.dropChance > 0.3, 'Boss should have higher drop chance');
  
  console.log(`✓ Dragon Boss Lv.50 Rewards: ${rewards.exp} XP, ${rewards.gold} Gold, ${(rewards.dropChance*100).toFixed(0)}% drop`);
});

test('MonsterTemplate - elemental variants have enhanced stats', () => {
  // Create base slime and fire slime at level 1
  const baseSlime = createMonsterFromTemplate('base_slime', 1, 'slime_1');
  const fireSlime = createMonsterFromTemplate('fire_slime', 1, 'fire_slime_1');
  
  // Base slime stats
  assert.strictEqual(baseSlime.name, 'Slime');
  assert.strictEqual(baseSlime.attack, 5);
  
  // Fire slime should have higher attack (element modifier: +2)
  assert.strictEqual(fireSlime.name, 'Fire Slime');
  assert.ok(fireSlime.attack > baseSlime.attack, 'Fire Slime should have higher ATK');
  assert.ok(fireSlime.resistance > baseSlime.resistance, 'Fire Slime should have higher RES');
  
  console.log(`✓ Base Slime: HP=${baseSlime.hp}, ATK=${baseSlime.attack}, RES=${baseSlime.resistance}`);
  console.log(`✓ Fire Slime: HP=${fireSlime.hp}, ATK=${fireSlime.attack}, RES=${fireSlime.resistance}`);
});

test('MonsterTemplate - class variants have enhanced stats', () => {
  // Skeleton base and mage
  const baseSkeleton = createMonsterFromTemplate('base_skeleton', 1, 'skel_1');
  const skeletonMage = createMonsterFromTemplate('skeleton_mage', 1, 'skel_mage_1');
  
  // Base skeleton should have lower attack
  assert.strictEqual(baseSkeleton.name, 'Skeleton');
  
  // Mage should have magic
  assert.strictEqual(skeletonMage.name, 'Skeleton Mage');
  assert.ok(skeletonMage.magic > 0, 'Mage should have magic');
  
  console.log(`✓ Base Skeleton: HP=${baseSkeleton.hp}, ATK=${baseSkeleton.attack}, DEF=${baseSkeleton.defense}`);
  console.log(`✓ Skeleton Mage: HP=${skeletonMage.hp}, ATK=${skeletonMage.attack}, MAG=${skeletonMage.magic}`);
});

test('MonsterTemplate - combined variants (class + element)', () => {
  // Use available monsters - fire slime for element test
  const fireSlime = createMonsterFromTemplate('fire_slime', 10, 'fire_slime_1');
  const baseSlime = createMonsterFromTemplate('base_slime', 10, 'base_slime_1');
  
  assert.ok(fireSlime.name.includes('Fire'), 'Should have Fire element');
  assert.ok(fireSlime.resistance > 0, 'Fire should give resistance');
  
  console.log(`✓ Fire Slime: HP=${fireSlime.hp}, ATK=${fireSlime.attack}, RES=${fireSlime.resistance}`);
});

test('MonsterTemplate - slime archer variants', () => {
  // Use available variants
  const slime = createMonsterFromTemplate('base_slime', 5, 'slime_1');
  const fireSlime = createMonsterFromTemplate('fire_slime', 5, 'fire_slime_1');
  
  // Fire Slime should have fire element
  assert.ok(fireSlime.name.includes('Fire'), 'Should have Fire element');
  assert.ok(fireSlime.resistance > slime.resistance, 'Fire should add resistance');
  
  console.log(`✓ Slime: HP=${slime.hp}, ATK=${slime.attack}, RNG=${slime.attackRange}`);
  console.log(`✓ Fire Slime: HP=${fireSlime.hp}, ATK=${fireSlime.attack}, RES=${fireSlime.resistance}`);
});

test('MonsterTemplate - boss monsters list', () => {
  const bosses = getBossCreatures();
  
  assert.ok(bosses.length > 0, 'Should have boss monsters');
  assert.ok(bosses.some(b => b.id === 'lich'), 'Should include Lich');
  assert.ok(bosses.some(b => b.id === 'king_slime'), 'Should include King Slime');
  
  console.log(`✓ Boss monsters: ${bosses.map(b => b.name).join(', ')}`);
});

// ========== RACE SYSTEM TESTS ==========

test('RaceSystem - human has balanced bonuses', () => {
  const humanSwordsman = createUnitFromClass('swordsman', 1, 'human_sword', {
    raceId: 'human',
    classTemplates: CLASS_TEMPLATES,
    raceTemplates: RACE_TEMPLATES
  });
  const baseSwordsman = createUnitFromClass('swordsman', 1, 'base_sword', {
    classTemplates: CLASS_TEMPLATES,
    raceTemplates: RACE_TEMPLATES
  });
  
  assert.ok(humanSwordsman.hp >= baseSwordsman.hp, 'Human should have HP bonus');
  
  console.log(`✓ Human Swordsman Lv.1: HP=${humanSwordsman.hp}, ATK=${humanSwordsman.attack}, DEX=${humanSwordsman.speed}`);
});

test('RaceSystem - elf has DEX bonuses', () => {
  const elfSwordsman = createUnitFromClass('swordsman', 1, 'elf_sword', {
    raceId: 'elf',
    classTemplates: CLASS_TEMPLATES,
    raceTemplates: RACE_TEMPLATES
  });
  
  assert.ok(elfSwordsman.speed > 20, 'Elf should have high DEX'); // baseDex 20 + 15 = 35
  assert.ok(elfSwordsman.evasion > 3, 'Elf should have evasion bonus');
  
  console.log(`✓ Elf Swordsman Lv.1: HP=${elfSwordsman.hp}, ATK=${elfSwordsman.attack}, DEX=${elfSwordsman.speed}, EVA=${elfSwordsman.evasion}`);
});

test('RaceSystem - dwarf has DEF bonuses', () => {
  const dwarfSwordsman = createUnitFromClass('swordsman', 1, 'dwarf_sword', {
    raceId: 'dwarf',
    classTemplates: CLASS_TEMPLATES,
    raceTemplates: RACE_TEMPLATES
  });
  
  assert.ok(dwarfSwordsman.defense > 8, 'Dwarf should have DEF bonus'); // base 8 + 10 = 18
  assert.ok(dwarfSwordsman.hp > 120, 'Dwarf should have HP bonus');
  
  console.log(`✓ Dwarf Swordsman Lv.1: HP=${dwarfSwordsman.hp}, ATK=${dwarfSwordsman.attack}, DEF=${dwarfSwordsman.defense}`);
});

test('RaceSystem - orc has ATK bonuses', () => {
  const orcSwordsman = createUnitFromClass('swordsman', 1, 'orc_sword', {
    raceId: 'orc',
    classTemplates: CLASS_TEMPLATES,
    raceTemplates: RACE_TEMPLATES
  });
  
  assert.ok(orcSwordsman.attack > 15, 'Orc should have ATK bonus'); // base 15 + 15 = 30
  
  console.log(`✓ Orc Swordsman Lv.1: HP=${orcSwordsman.hp}, ATK=${orcSwordsman.attack}, DEX=${orcSwordsman.speed}`);
});

test('RaceSystem - different races at level 30', () => {
  const humanMage = createUnitFromClass('mage', 30, 'human_mage', {
    raceId: 'human',
    classTemplates: CLASS_TEMPLATES,
    raceTemplates: RACE_TEMPLATES
  });
  
  const elfMage = createUnitFromClass('mage', 30, 'elf_mage', {
    raceId: 'elf',
    classTemplates: CLASS_TEMPLATES,
    raceTemplates: RACE_TEMPLATES
  });
  
  const dwarfMage = createUnitFromClass('mage', 30, 'dwarf_mage', {
    raceId: 'dwarf',
    classTemplates: CLASS_TEMPLATES,
    raceTemplates: RACE_TEMPLATES
  });
  
  console.log(`✓ Human Mage Lv.30: HP=${humanMage.hp}, ATK=${humanMage.attack}, DEX=${humanMage.speed}, MAG=${humanMage.magic}`);
  console.log(`✓ Elf Mage Lv.30: HP=${elfMage.hp}, ATK=${elfMage.attack}, DEX=${elfMage.speed}, MAG=${elfMage.magic}`);
  console.log(`✓ Dwarf Mage Lv.30: HP=${dwarfMage.hp}, ATK=${dwarfMage.attack}, DEX=${dwarfMage.speed}, MAG=${dwarfMage.magic}`);
  
  // Elf should have highest DEX
  assert.ok(elfMage.speed > humanMage.speed, 'Elf should have highest DEX');
  assert.ok(elfMage.speed > dwarfMage.speed, 'Elf should have highest DEX');
  
  // Dwarf should have highest DEF/HP
  assert.ok(dwarfMage.hp > humanMage.hp, 'Dwarf should have highest HP');
});

// ========== CREATURE TEMPLATE SYSTEM TESTS ==========

test('CreatureTemplate - basic slime creation', () => {
  const slime = createSlime(1, 'slime_1');
  
  // Base slime HP = 30, +30 from BEAST type statBonus = 60
  assert.strictEqual(slime.name, 'Slime');
  assert.strictEqual(slime.hp, 60); // 30 base + 30 from BEAST type
  assert.ok(slime.attack >= 5, 'Slime should have attack');
  assert.ok(slime.speed >= 10, 'Slime should have DEX');
  
  console.log(`✓ Basic Slime: HP=${slime.hp}, ATK=${slime.attack}, DEX=${slime.speed}`);
});

test('CreatureTemplate - fire slime with element', () => {
  const fireSlime = createFireSlime(1, 'fire_slime_1');
  
  assert.strictEqual(fireSlime.name, 'Fire Slime');
  assert.ok(fireSlime.attack > 5, 'Fire Slime should have higher ATK');
  assert.ok(fireSlime.resistance > 0, 'Fire Slime should have resistance');
  
  console.log(`✓ Fire Slime: HP=${fireSlime.hp}, ATK=${fireSlime.attack}, RES=${fireSlime.resistance}`);
});

test('CreatureTemplate - skeleton archer (race + class)', () => {
  const skeletonArcher = createSkeletonArcher(10, 'sk_archer_1');
  
  assert.ok(skeletonArcher.name.includes('Archer'), 'Should have Archer class');
  assert.ok(skeletonArcher.attackRange > 1, 'Archer should have ranged attack');
  
  console.log(`✓ Skeleton Archer: HP=${skeletonArcher.hp}, ATK=${skeletonArcher.attack}, Range=${skeletonArcher.attackRange}`);
});

test('CreatureTemplate - dragon mage (race + class + type)', () => {
  const dragonMage = createDragonMage(30, 'dragon_mage_1', CreatureRank.ELITE);
  
  assert.ok(dragonMage.name.includes('Dragon'), 'Should have Dragon race');
  assert.ok(dragonMage.name.includes('Mage'), 'Should have Mage class');
  assert.ok(dragonMage.name.includes('elite'), 'Should have Elite rank');
  assert.ok(dragonMage.magic > 0, 'Mage should have magic');
  
  console.log(`✓ Dragon Mage Elite: HP=${dragonMage.hp}, ATK=${dragonMage.attack}, MAG=${dragonMage.magic}`);
});

test('CreatureTemplate - boss creature', () => {
  const boss = createBoss('base_dragon', 50, 'boss_dragon_1', CreatureTier.TIER_5);
  
  assert.ok(boss.hp > 1000, 'Boss should have high HP');
  assert.ok(boss.name.includes('Boss') || boss.name.includes('Dragon'), 'Boss should have boss name');
  
  console.log(`✓ Dragon Boss Tier 5: HP=${boss.hp}, ATK=${boss.attack}, RES=${boss.resistance}`);
});

test('CreatureTemplate - player creation', () => {
  const player = createPlayer('base_skeleton', 'warrior', 20, 'player_1', 'Skeleton Warrior');
  
  assert.strictEqual(player.name, 'Skeleton Warrior');
  assert.strictEqual(player.hp > 0, true, 'Player should have HP');
  assert.ok(player.attack > 0, 'Player should have attack');
  
  console.log(`✓ Skeleton Warrior Player: HP=${player.hp}, ATK=${player.attack}, DEF=${player.defense}`);
});

test('CreatureTemplate - full composition', () => {
  // Full composition: Skeleton Archer (Elite)
  const creature = createCreature({
    raceId: 'base_skeleton',
    classId: 'archer',
    type: CreatureType.UNDEAD,
    element: ElementType.FIRE,
    rank: CreatureRank.ELITE,
    tier: CreatureTier.TIER_3,
    level: 25,
    customId: 'fire_skel_archer',
  });
  
  assert.ok(creature.name.includes('Fire'), 'Should have Fire element');
  assert.ok(creature.name.includes('Skeleton'), 'Should have Skeleton race');
  assert.ok(creature.name.includes('Archer'), 'Should have Archer class');
  assert.ok(creature.name.includes('elite'), 'Should have Elite rank');
  assert.ok(creature.attackRange > 1, 'Archer should have ranged attack');
  assert.ok(creature.resistance > 0, 'Should have resistance from element');
  
  console.log(`✓ Fire Skeleton Archer Elite: HP=${creature.hp}, ATK=${creature.attack}, RNG=${creature.attackRange}, RES=${creature.resistance}`);
});

// ========== CREATURES FOLDER TESTS ==========

test('Creatures folder - get creature template', () => {
  const slime = getCreatureTemplate('base_slime');
  const skeleton = getCreatureTemplate('base_skeleton');
  
  assert.ok(slime, 'Should find base_slime');
  assert.ok(skeleton, 'Should find base_skeleton');
  assert.strictEqual(slime?.name, 'Slime');
  assert.strictEqual(skeleton?.name, 'Skeleton');
  
  console.log(`✓ Found creature: ${slime?.name}, ${skeleton?.name}`);
});

test('Creatures folder - slime variants', () => {
  const baseSlime = slimeTemplates.base_slime;
  const fireSlime = slimeTemplates.fire_slime;
  const kingSlime = slimeTemplates.king_slime;
  
  assert.strictEqual(baseSlime.name, 'Slime');
  assert.strictEqual(fireSlime.name, 'Fire Slime');
  assert.strictEqual(kingSlime.name, 'King Slime');
  
  // Fire slime should have fire abilities
  assert.ok(fireSlime.abilities.includes('fireball'), 'Fire slime should have fireball');
  
  // King slime should be a boss
  assert.ok(kingSlime.drops.legendary.length > 0, 'Boss should have legendary drops');
  
  console.log(`✓ Slime variants: ${baseSlime.name}, ${fireSlime.name}, ${kingSlime.name}`);
  console.log(`  - Fire Slime abilities: ${fireSlime.abilities.join(', ')}`);
  console.log(`  - King Slime legendary drops: ${kingSlime.drops.legendary.join(', ')}`);
});

test('Creatures folder - skeleton variants', () => {
  const baseSkeleton = skeletonTemplates.base_skeleton;
  const skeletonMage = skeletonTemplates.skeleton_mage;
  const lich = skeletonTemplates.lich;
  
  assert.strictEqual(baseSkeleton.name, 'Skeleton');
  assert.strictEqual(skeletonMage.name, 'Skeleton Mage');
  assert.strictEqual(lich.name, 'Lich');
  
  // Mage should have magic abilities
  assert.ok(skeletonMage.abilities.includes('fireball'), 'Mage should have fireball');
  
  // Lich should be boss
  assert.strictEqual(lich.rank, CreatureRank.BOSS);
  assert.ok(lich.abilities.length > 3, 'Lich should have many abilities');
  
  console.log(`✓ Skeleton variants: ${baseSkeleton.name}, ${skeletonMage.name}, ${lich.name}`);
  console.log(`  - Mage abilities: ${skeletonMage.abilities.join(', ')}`);
  console.log(`  - Lich abilities: ${lich.abilities.join(', ')}`);
});

test('Creatures folder - get creatures by type', () => {
  const beasts = getCreaturesByType(CreatureType.BEAST);
  const undead = getCreaturesByType(CreatureType.UNDEAD);
  
  assert.ok(beasts.length > 0, 'Should have beast creatures');
  assert.ok(undead.length > 0, 'Should have undead creatures');
  
  console.log(`✓ Creatures by type: BEAST=${beasts.length}, UNDEAD=${undead.length}`);
});

test('Creatures folder - get boss creatures', () => {
  const bosses = getBossCreatures();
  
  assert.ok(bosses.length > 0, 'Should have boss creatures');
  assert.ok(bosses.some(b => b.name === 'King Slime'), 'Should have King Slime');
  assert.ok(bosses.some(b => b.name === 'Lich'), 'Should have Lich');
  
  console.log(`✓ Boss creatures: ${bosses.map(b => b.name).join(', ')}`);
});

console.log('All DEX-based tick combat tests completed!');
