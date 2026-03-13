/**
 * Demon Type Template
 * 
 * Base stats for demon-type creatures: demons, demon lords, etc.
 * Uses exponential growth: stat = base * growthRate^(level-1)
 */

import { CreatureType, CreatureTypeTemplate, CreatureCombatBonuses, CreatureGrowthRates } from './_base.js';

// Demons: high attack, high magic, high life steal
const demonGrowth: CreatureGrowthRates = {
  vit: 1.04,     // +4% VIT per level
  hp: 1.03,      // +3% HP bonus per level
  attack: 1.06,  // +6% ATK per level (high damage)
  defense: 1.04, // +4% DEF per level
  dex: 1.05,     // +5% DEX per level
  magic: 1.05,   // +5% MAG per level
  mana: 1.05,    // +5% MANA per level
};

export const DEMON_TYPE: CreatureTypeTemplate = {
  type: CreatureType.DEMON,
  name: 'Demon',
  
  baseHp: 150,
  baseVit: 15,
  baseAttack: 30,
  baseDefense: 12,
  baseDex: 30,
  baseMagic: 20,
  baseMana: 200,
  
  growth: demonGrowth,
  
  bonuses: {
    critRate: 15,
    critDamage: 0.5,
    evasion: 10,
    resistance: 25,
    lifeSteal: 8,
  },
  
  abilities: ['dark_bolt', 'hellfire', 'teleport'],
  drops: ['demon_horn', 'demon_skin', 'demon_heart'],
  
  description: 'Creature from the demon realm',
};

// ========== VARIANTS ==========

// Demon Lord: boss-level demon
export const DEMON_LORD_TYPE: CreatureTypeTemplate = {
  ...DEMON_TYPE,
  type: CreatureType.DEMON,
  name: 'Demon Lord',
  
  baseHp: 800,
  baseVit: 80,
  baseAttack: 65,
  baseDefense: 45,
  baseDex: 40,
  baseMagic: 55,
  baseMana: 550,
  
  growth: {
    vit: 1.07,    // +7% VIT per level (boss-level)
    hp: 1.05,     // +5% HP per level
    attack: 1.08, // +8% ATK per level
    defense: 1.06, // +6% DEF per level
    dex: 1.05,    // +5% DEX per level
    magic: 1.07,  // +7% MAG per level
    mana: 1.07,   // +7% MANA per level
  },
  
  bonuses: {
    critRate: 25,
    critDamage: 1.0,
    evasion: 15,
    resistance: 50,
    lifeSteal: 20,
  },
  
  abilities: ['meteor_strike', 'dark_pulse', 'summon_minions', 'immortality'],
  drops: ['demon_heart', 'hellfire_orb', 'demon_sword'],
  description: 'Ruler of the demon realm',
};
