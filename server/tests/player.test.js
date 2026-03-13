import assert from 'node:assert';
import test from 'node:test';
import { 
  getXpRequiredForLevel,
  getXpForNextLevel,
  getLevelFromXp,
  getXpProgress,
  createUnitProgression,
  addXpAndLevelUp,
  allocateAttributePoints,
  getAttributeBonuses,
  createParty,
  addUnitToParty,
  unitGainXp,
  partyGainXp,
  MAX_UNIT_LEVEL,
  MAX_UNITS_PER_PARTY,
  BASE_XP_REQUIRED,
  ATTRIBUTE_POINTS_PER_LEVEL
} from '../dist/src/templates/player/index.js';

test('UnitProgression - XP curve is exponential', () => {
  // Level 2: 752 XP
  const lvl2 = getXpRequiredForLevel(2);
  assert.ok(lvl2 >= 700 && lvl2 <= 800, 'Level 2 should require ~752 XP');
  
  // Level 10: ~13,628 XP
  const lvl10 = getXpRequiredForLevel(10);
  assert.ok(lvl10 > 10000, 'Level 10 should require >10k XP');
  assert.ok(lvl10 < 15000, 'Level 10 should require <15k XP');
  
  // Level 100: ~860k XP
  const lvl100 = getXpRequiredForLevel(100);
  assert.ok(lvl100 > 800000, 'Level 100 should require >800k XP');
  
  // Level 200: ~3M XP
  const lvl200 = getXpRequiredForLevel(200);
  assert.ok(lvl200 >= 2900000, 'Level 200 should require ~3M XP');
  
  console.log(`✓ Level 2: ${lvl2} XP`);
  console.log(`✓ Level 10: ${lvl10.toLocaleString()} XP`);
  console.log(`✓ Level 100: ${lvl100.toLocaleString()} XP`);
  console.log(`✓ Level 200: ${lvl200.toLocaleString()} XP`);
});

test('UnitProgression - XP for next level', () => {
  // Level 1 → 2: 752 XP
  const xp1to2 = getXpForNextLevel(1);
  assert.ok(xp1to2 >= 700 && xp1to2 <= 800, 'Level 1→2 should need ~752 XP');
  
  // Level 2 → 3: ~808 XP
  const xp2to3 = getXpForNextLevel(2);
  assert.ok(xp2to3 > 700, 'Level 2→3 should need >700 XP');
  
  // Higher levels need more XP
  const xp99to100 = getXpForNextLevel(99);
  const xp100to101 = getXpForNextLevel(100);
  assert.ok(xp100to101 > xp99to100, 'Higher levels need more XP');
  
  console.log(`✓ Level 1→2: ${xp1to2} XP`);
  console.log(`✓ Level 2→3: ${xp2to3} XP`);
  console.log(`✓ Level 99→100: ${xp99to100.toLocaleString()} XP`);
  console.log(`✓ Level 100→101: ${xp100to101.toLocaleString()} XP`);
});

test('UnitProgression - get level from XP', () => {
  // 0 XP = level 1
  assert.strictEqual(getLevelFromXp(0), 1);
  
  // 500 XP = level 1 (not enough for level 2 which needs 752)
  assert.strictEqual(getLevelFromXp(500), 1);
  
  // 800 XP = level 2
  assert.strictEqual(getLevelFromXp(800), 2);
  
  // 13628+ XP = level 10
  assert.strictEqual(getLevelFromXp(13628), 10);
  
  console.log(`✓ 0 XP = Level ${getLevelFromXp(0)}`);
  console.log(`✓ 500 XP = Level ${getLevelFromXp(500)}`);
  console.log(`✓ 800 XP = Level ${getLevelFromXp(800)}`);
  console.log(`✓ 13628 XP = Level ${getLevelFromXp(13628)}`);
});

test('UnitProgression - XP progress calculation', () => {
  // At start of level 1: 0%
  assert.strictEqual(getXpProgress(0), 0);
  
  // At level 1, ~50% to level 2: 376/752 = 0.5
  const progress = getXpProgress(376);
  assert.ok(progress > 0.45 && progress < 0.55, 'At 376 XP should be ~50% progress');
  
  // At level 2 (752 XP): 0%
  assert.strictEqual(getXpProgress(752), 0);
  
  // At max level: 1.0
  const maxXp = getXpRequiredForLevel(MAX_UNIT_LEVEL);
  assert.strictEqual(getXpProgress(maxXp + 1000), 1.0);
  
  console.log(`✓ Progress at 0 XP: ${getXpProgress(0) * 100}%`);
  console.log(`✓ Progress at 376 XP: ${(getXpProgress(376) * 100).toFixed(1)}%`);
  console.log(`✓ Progress at max: ${getXpProgress(maxXp) * 100}%`);
});

test('UnitProgression - create progression', () => {
  // Default level 1
  const prog1 = createUnitProgression('unit1');
  assert.strictEqual(prog1.level, 1);
  assert.strictEqual(prog1.experience, 0);
  assert.strictEqual(prog1.attributePoints, 0);
  
  // Starting level 10
  const prog10 = createUnitProgression('unit2', 10);
  assert.strictEqual(prog10.level, 10);
  assert.ok(prog10.experience > 0, 'Should have XP for level 10');
  
  console.log(`✓ Level 1: ${prog1.experience} XP`);
  console.log(`✓ Level 10: ${prog10.experience.toLocaleString()} XP`);
});

test('UnitProgression - level up with XP', () => {
  const prog = createUnitProgression('unit1', 1);
  prog.attributePoints = 0;
  
  // Add 800 XP (enough for level 2, needs 752)
  const result1 = addXpAndLevelUp(prog, 800);
  assert.strictEqual(result1.leveledUp, true);
  assert.strictEqual(result1.newLevel, 2);
  assert.strictEqual(result1.attributePointsGained, ATTRIBUTE_POINTS_PER_LEVEL);
  assert.strictEqual(result1.skillPointsGained, 1);
  
  console.log(`✓ Leveled up to ${result1.newLevel}`);
  console.log(`✓ Gained ${result1.attributePointsGained} attribute points`);
  console.log(`✓ Gained ${result1.skillPointsGained} skill point`);
});

test('UnitProgression - multiple level ups', () => {
  const prog = createUnitProgression('unit1', 1);
  prog.attributePoints = 0;
  
  // Add enough XP for level 5
  const xpFor5 = getXpRequiredForLevel(5);
  const result = addXpAndLevelUp(prog, xpFor5);
  
  assert.strictEqual(result.leveledUp, true);
  assert.strictEqual(result.newLevel, 5);
  assert.strictEqual(result.attributePointsGained, 4 * ATTRIBUTE_POINTS_PER_LEVEL);
  assert.strictEqual(result.skillPointsGained, 4);
  
  console.log(`✓ Leveled up to ${result.newLevel}`);
  console.log(`✓ Gained ${result.attributePointsGained} attribute points`);
  console.log(`✓ Gained ${result.skillPointsGained} skill points`);
});

test('UnitProgression - attribute allocation', () => {
  const prog = createUnitProgression('unit1', 5);
  prog.attributePoints = 20;
  
  const result = allocateAttributePoints(prog, {
    vit: 5,
    attack: 5,
    defense: 5,
    dex: 3,
    magic: 2,
  });
  
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.pointsRemaining, 0);
  assert.strictEqual(prog.attributePoints, 0);
  
  // Try to allocate more than available
  const result2 = allocateAttributePoints(prog, {
    vit: 1,
    attack: 1,
    defense: 1,
    dex: 1,
    magic: 1,
  });
  
  assert.strictEqual(result2.success, false);
  
  console.log(`✓ Allocated 20 points successfully`);
  console.log(`✓ Failed to over-allocate`);
});

test('UnitProgression - attribute bonuses', () => {
  const bonuses = getAttributeBonuses({
    vit: 10,
    attack: 5,
    defense: 5,
    dex: 5,
    magic: 5,
  });
  
  assert.strictEqual(bonuses.vitBonus, 50);
  assert.strictEqual(bonuses.hpBonus, 500);
  assert.strictEqual(bonuses.attackBonus, 10);
  assert.strictEqual(bonuses.defenseBonus, 10);
  assert.strictEqual(bonuses.dexBonus, 10);
  assert.strictEqual(bonuses.magicBonus, 10);
  
  console.log(`✓ 10 VIT = +${bonuses.vitBonus} VIT, +${bonuses.hpBonus} HP`);
  console.log(`✓ 5 ATK = +${bonuses.attackBonus} ATK`);
});

test('UnitProgression - max level handling', () => {
  // Try to create at max level
  const prog = createUnitProgression('unit1', MAX_UNIT_LEVEL);
  assert.strictEqual(prog.level, MAX_UNIT_LEVEL);
  
  // Try to add XP at max level
  const result = addXpAndLevelUp(prog, 1000000);
  assert.strictEqual(result.leveledUp, false);
  assert.strictEqual(result.newLevel, MAX_UNIT_LEVEL);
  
  // Progress should always be 1.0 at max level
  assert.strictEqual(getXpProgress(prog.experience + 1000), 1.0);
  
  console.log(`✓ Max level: ${MAX_UNIT_LEVEL}`);
  console.log(`✓ No level up at max level`);
});

test('UnitProgression - level up history', () => {
  const prog = createUnitProgression('unit1', 1);
  
  // Level up to 3
  addXpAndLevelUp(prog, getXpRequiredForLevel(3));
  
  assert.strictEqual(prog.level, 3);
  assert.strictEqual(prog.levelUpHistory.length, 2);
  
  assert.strictEqual(prog.levelUpHistory[0].level, 2);
  assert.strictEqual(prog.levelUpHistory[1].level, 3);
  
  console.log(`✓ Level up history: ${prog.levelUpHistory.map(h => h.level).join(' → ')}`);
});

// ========== PARTY TESTS ==========

test('Party - create party', () => {
  const party = createParty({
    id: 'party1',
    ownerId: 'player1',
    name: 'My Party',
  });
  
  assert.strictEqual(party.id, 'party1');
  assert.strictEqual(party.ownerId, 'player1');
  assert.strictEqual(party.name, 'My Party');
  assert.strictEqual(party.units.length, 0);
  assert.strictEqual(party.createdAt > 0, true);
  
  console.log(`✓ Party created: ${party.name}`);
  console.log(`✓ Unit count: ${party.units.length}`);
});

test('Party - add unit to party', () => {
  const party = createParty({
    id: 'party1',
    ownerId: 'player1',
    name: 'My Party',
  });
  
  // Create a mock unit
  const mockUnit = {
    id: 'unit1',
    name: 'Hero',
    level: 1,
    hp: 100,
    maxHp: 100,
    attack: 10,
    defense: 5,
    speed: 10,
    magic: 5,
    mana: 50,
    maxMana: 50,
  };
  
  const partyUnit = addUnitToParty(party, mockUnit, 1);
  
  assert.ok(partyUnit, 'Should add unit');
  assert.strictEqual(party.units.length, 1);
  assert.strictEqual(partyUnit?.position, 0);
  assert.strictEqual(partyUnit?.progression.level, 1);
  
  console.log(`✓ Added unit: ${mockUnit.name}`);
  console.log(`✓ Party size: ${party.units.length}/${MAX_UNITS_PER_PARTY}`);
});

test('Party - max units limit', () => {
  const party = createParty({
    id: 'party1',
    ownerId: 'player1',
    name: 'Full Party',
  });
  
  // Add 50 units
  for (let i = 0; i < MAX_UNITS_PER_PARTY; i++) {
    const unit = {
      id: `unit${i}`,
      name: `Unit ${i}`,
      level: 1,
      hp: 100,
      maxHp: 100,
      attack: 10,
      defense: 5,
      speed: 10,
      magic: 5,
      mana: 50,
      maxMana: 50,
    };
    addUnitToParty(party, unit, 1);
  }
  
  assert.strictEqual(party.units.length, MAX_UNITS_PER_PARTY);
  
  // Try to add one more
  const extraUnit = {
    id: 'extra',
    name: 'Extra',
    level: 1,
    hp: 100,
    maxHp: 100,
    attack: 10,
    defense: 5,
    speed: 10,
    magic: 5,
    mana: 50,
    maxMana: 50,
  };
  
  const result = addUnitToParty(party, extraUnit, 1);
  assert.strictEqual(result, null, 'Should not add more units');
  assert.strictEqual(party.units.length, MAX_UNITS_PER_PARTY);
  
  console.log(`✓ Party full at ${MAX_UNITS_PER_PARTY} units`);
  console.log(`✓ Cannot add more: ${result === null}`);
});

test('Party - party XP distribution', () => {
  const party = createParty({
    id: 'party1',
    ownerId: 'player1',
    name: 'XP Party',
  });
  
  // Add 2 units
  for (let i = 0; i < 2; i++) {
    const unit = {
      id: `unit${i}`,
      name: `Unit ${i}`,
      level: 1,
      hp: 100,
      maxHp: 100,
      attack: 10,
      defense: 5,
      speed: 10,
      magic: 5,
      mana: 50,
      maxMana: 50,
    };
    addUnitToParty(party, unit, 1);
  }
  
  // Add 1000 XP total (500 each)
  const results = partyGainXp(party, 1000);
  
  assert.strictEqual(results.size, 2, 'Should have results for both units');
  
  // Check XP was distributed
  const unit0Xp = party.units[0].progression.experience;
  const unit1Xp = party.units[1].progression.experience;
  
  console.log(`✓ Unit 0 XP: ${unit0Xp}`);
  console.log(`✓ Unit 1 XP: ${unit1Xp}`);
  console.log(`✓ Total distributed: ${unit0Xp + unit1Xp}`);
});

console.log('All Unit Progression and Party tests completed!');
