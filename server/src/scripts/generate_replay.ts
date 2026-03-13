/**
 * Generate a new combat replay
 * Run with: npx tsx src/scripts/generate_replay.ts
 */

import { CombatEngine } from '../combat/CombatSimulator.js';
import { WinCondition } from '../combat/TickCost.js';
import { writeFileSync } from 'fs';

const simulator = new CombatEngine();

// Create player team - full Unit objects
const playerTeam = [
  { 
    id: 'player_1', 
    name: 'Knight', 
    level: 10, 
    vit: 20,
    hp: 200, 
    maxHp: 200, 
    mana: 50,
    maxMana: 50,
    attack: 35, 
    defense: 15, 
    speed: 50,  // DEX 50 → 50 tick cooldown
    magic: 10,
    critRate: 15, 
    critDamage: 1.5, 
    evasion: 5,
    accuracy: 75,
    block: 10,
    resistance: 5,
    damageReduction: 0,
    statusResistance: 5,
    tenacity: 0,
    attackSpeed: 1.0,
    lifeSteal: 0,
    spellVamp: 0,
    castSpeed: 100,
    attackRange: 1,
    moveRange: 3,
    minRange: 1,
    team: 'player',
    position: { x: 2, y: 1 }
  },
  { 
    id: 'player_2', 
    name: 'Mage', 
    level: 10, 
    vit: 12,
    hp: 120, 
    maxHp: 120, 
    mana: 200,
    maxMana: 200,
    attack: 30, 
    defense: 8, 
    speed: 70,  // DEX 70 → 30 tick cooldown (fast)
    magic: 50,
    critRate: 10, 
    critDamage: 2.0, 
    evasion: 10,
    accuracy: 80,
    block: 5,
    resistance: 20,
    damageReduction: 0,
    statusResistance: 10,
    tenacity: 0,
    attackSpeed: 1.0,
    lifeSteal: 0,
    spellVamp: 10,
    castSpeed: 120,
    attackRange: 4,
    moveRange: 3,
    minRange: 2,
    team: 'player',
    position: { x: 3, y: 1 }
  },
  { 
    id: 'player_3', 
    name: 'Healer', 
    level: 10, 
    vit: 10,
    hp: 100, 
    maxHp: 100, 
    mana: 150,
    maxMana: 150,
    attack: 20, 
    defense: 8, 
    speed: 60,  // DEX 60 → 40 tick cooldown
    magic: 40,
    critRate: 10, 
    critDamage: 1.5, 
    evasion: 10,
    accuracy: 75,
    block: 5,
    resistance: 15,
    damageReduction: 0,
    statusResistance: 10,
    tenacity: 0,
    attackSpeed: 1.0,
    lifeSteal: 0,
    spellVamp: 5,
    castSpeed: 110,
    attackRange: 3,
    moveRange: 3,
    minRange: 2,
    team: 'player',
    position: { x: 4, y: 1 }
  },
];

// Create enemy team
const enemyTeam = [
  { 
    id: 'enemy_1', 
    name: 'Orc Warrior', 
    level: 8, 
    vit: 18,
    hp: 180, 
    maxHp: 180, 
    mana: 20,
    maxMana: 20,
    attack: 28, 
    defense: 12, 
    speed: 45,  // DEX 45 → 55 tick cooldown
    magic: 5,
    critRate: 10, 
    critDamage: 1.5, 
    evasion: 3,
    accuracy: 70,
    block: 8,
    resistance: 5,
    damageReduction: 0,
    statusResistance: 5,
    tenacity: 0,
    attackSpeed: 1.0,
    lifeSteal: 3,
    spellVamp: 0,
    castSpeed: 100,
    attackRange: 1,
    moveRange: 3,
    minRange: 1,
    team: 'enemy',
    position: { x: 5, y: 8 }
  },
  { 
    id: 'enemy_2', 
    name: 'Dark Mage', 
    level: 8, 
    vit: 9,
    hp: 90, 
    maxHp: 90, 
    mana: 120,
    maxMana: 120,
    attack: 25, 
    defense: 6, 
    speed: 55,  // DEX 55 → 45 tick cooldown
    magic: 35,
    critRate: 8, 
    critDamage: 2.0, 
    evasion: 8,
    accuracy: 75,
    block: 3,
    resistance: 15,
    damageReduction: 0,
    statusResistance: 5,
    tenacity: 0,
    attackSpeed: 1.0,
    lifeSteal: 0,
    spellVamp: 8,
    castSpeed: 110,
    attackRange: 3,
    moveRange: 3,
    minRange: 2,
    team: 'enemy',
    position: { x: 6, y: 8 }
  },
  { 
    id: 'enemy_3', 
    name: 'Goblin', 
    level: 5, 
    vit: 6,
    hp: 60, 
    maxHp: 60, 
    mana: 10,
    maxMana: 10,
    attack: 15, 
    defense: 3, 
    speed: 80,  // DEX 80 → 20 tick cooldown (very fast)
    magic: 5,
    critRate: 5, 
    critDamage: 1.5, 
    evasion: 15,
    accuracy: 70,
    block: 2,
    resistance: 3,
    damageReduction: 0,
    statusResistance: 3,
    tenacity: 0,
    attackSpeed: 1.2,
    lifeSteal: 0,
    spellVamp: 0,
    castSpeed: 100,
    attackRange: 1,
    moveRange: 4,
    minRange: 1,
    team: 'enemy',
    position: { x: 4, y: 8 }
  },
];

// Test 2 vs 5 vs 10 team battle
console.log('Running 2v5v10 battle simulation...');

// Create teams
const baseUnit = {
  id: 'unit',
  name: 'Soldier',
  level: 10,
  vit: 10,
  hp: 100,
  maxHp: 100,
  mana: 50,
  maxMana: 50,
  attack: 20,
  defense: 5,
  speed: 50,
  magic: 10,
  critRate: 10,
  critDamage: 1.5,
  evasion: 5,
  accuracy: 80,
  block: 5,
  resistance: 5,
  damageReduction: 0,
  statusResistance: 5,
  tenacity: 0,
  attackSpeed: 1.0,
  lifeSteal: 0,
  spellVamp: 0,
  castSpeed: 100,
  attackRange: 1,
  moveRange: 3,
  minRange: 1,
  team: 'team',
  position: { x: 0, y: 0 }
};

// Team 1: 2 units (left side)
const team1 = [
  { ...baseUnit, id: 't1_u1', team: 'team1', position: { x: 1, y: 1 } },
  { ...baseUnit, id: 't1_u2', team: 'team1', position: { x: 1, y: 2 } },
];

// Team 2: 5 units (middle - adjacent to team1)
const team2 = [
  { ...baseUnit, id: 't2_u1', team: 'team2', position: { x: 2, y: 1 } },
  { ...baseUnit, id: 't2_u2', team: 'team2', position: { x: 2, y: 2 } },
  { ...baseUnit, id: 't2_u3', team: 'team2', position: { x: 2, y: 3 } },
  { ...baseUnit, id: 't2_u4', team: 'team2', position: { x: 3, y: 1 } },
  { ...baseUnit, id: 't2_u5', team: 'team2', position: { x: 3, y: 2 } },
];

// Team 3: 10 units (right side - adjacent to team2)
const team3 = [];
for (let i = 0; i < 10; i++) {
  team3.push({
    ...baseUnit,
    id: `t3_u${i+1}`,
    name: 'Dragon',
    team: 'team3',
    level: 20,
    hp: 500,
    maxHp: 500,
    attack: 50,
    defense: 20,
    speed: 30,
    position: { x: 4 + (i % 5), y: 1 + Math.floor(i / 5) }
  });
}

// Test different win conditions
console.log('\n=== Testing Win Conditions ===\n');

// Test 1: LAST_STANDING (default)
console.log('--- LAST_STANDING (3 teams) ---');
const result1 = await simulator.battle({
  teams: [team1, team2, team3],
  winCondition: WinCondition.LAST_STANDING,
  maxTicks: 300
});
console.log('Winner:', result1.winner);
console.log('Stats:', result1.finalState?.teamStats?.map(s => `k${s.kills}/d${s.deaths}`));

// Test 2: FIRST_BLOOD
console.log('\n--- FIRST_BLOOD (3 teams) ---');
const result2 = await simulator.battle({
  teams: [team1, team2, team3],
  winCondition: WinCondition.FIRST_BLOOD,
  maxTicks: 300
});
console.log('Winner:', result2.winner);
console.log('Stats:', result2.finalState?.teamStats?.map(s => `kills:${s.kills}`));

// Test 3: TIME_LIMIT
console.log('\n--- TIME_LIMIT (3 teams) ---');
const result3 = await simulator.battle({
  teams: [team1, team2, team3],
  winCondition: WinCondition.TIME_LIMIT,
  maxTicks: 100
});
console.log('Winner:', result3.winner);
console.log('Alive units:', result3.finalState?.teams?.map(t => t.filter(u => u.isAlive).length));

// Test 4: TOTAL_KILLS
console.log('\n--- TOTAL_KILLS (3 teams) ---');
const result4 = await simulator.battle({
  teams: [team1, team2, team3],
  winCondition: WinCondition.TOTAL_KILLS,
  minKillsToWin: 5,
  maxTicks: 300
});
console.log('Winner:', result4.winner);
console.log('Stats:', result4.finalState?.teamStats?.map(s => `kills:${s.kills}`));

// Test 5: KING_HILL with capture point
console.log('\n--- KING_HILL (3 teams) ---');
const result5 = await simulator.battle({
  teams: [team1, team2, team3],
  winCondition: WinCondition.KING_HILL,
  capturePoint: { x: 3, y: 2 },
  captureRadius: 2,
  maxTicks: 200
});
console.log('Winner:', result5.winner);
console.log('Capture points:', result5.finalState?.teamStats?.map(s => s.capturePoints));

// Test 6: SURVIVAL (HP percentage)
console.log('\n--- SURVIVAL (3 teams) ---');
const result6 = await simulator.battle({
  teams: [team1, team2, team3],
  winCondition: WinCondition.SURVIVAL,
  maxTicks: 150
});
console.log('Winner:', result6.winner);

// Also run original simulate for compatibility
const result = await simulator.simulate(playerTeam, enemyTeam, 200);

console.log('\n=== Original 3v3 Combat ===');
console.log('Combat finished:', result.winner);
console.log('Ticks:', result.totalTicks);

// Save replay to client folder
if (result.replay) {
  // Build the output object matching the expected format
  const output = {
    version: "1.0",
    winner: result.replay.winner,
    totalTicks: result.replay.totalTicks,
    seed: result.replay.seed,
    gridWidth: 10,
    gridHeight: 10,
    units: result.replay.units,
    initialPositions: result.replay.initialPositions,
    events: result.replay.events
  };
  
  const outputPath = 'C:/Users/Administrator/Documents/GitHub/Textical/client/replays/sample_replay_fixed.json';
  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log('Replay saved to:', outputPath);
  
  // Check for overlapping positions
  const tickPositions = new Map<number, Map<string, string>>();
  let hasOverlap = false;
  
  for (const event of result.replay.events) {
    if (event.eventType === 'move' && event.position) {
      if (!tickPositions.has(event.tick)) {
        tickPositions.set(event.tick, new Map());
      }
      const tickMap = tickPositions.get(event.tick)!;
      const key = `${event.position.x},${event.position.y}`;
      
      if (tickMap.has(key)) {
        const existingUnit = tickMap.get(key) || 'unknown';
        console.log(`⚠️ OVERLAP at tick ${event.tick}: ${event.unitId} moved to ${key} but ${existingUnit} is already there!`);
        hasOverlap = true;
      }
      tickMap.set(key, event.unitId || 'unknown');
    }
  }
  
  if (!hasOverlap) {
    console.log('✅ No overlapping positions found!');
  }
}
