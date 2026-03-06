/**
 * Demon Type Template
 * 
 * Base stats for demon-type creatures: demons, demon lords, etc.
 */

import { CreatureType, CreatureTypeTemplate, CreatureStatGrowth, CreatureCombatBonuses } from './_base.js';

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
  
  growth: {
    vit: 2,
    hp: 15,
    attack: 4,
    defense: 1.5,
    dex: 3,
    magic: 3,
    mana: 25,
  },
  
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
    vit: 10,
    hp: 100,
    attack: 8,
    defense: 6,
    dex: 4,
    magic: 7,
    mana: 70,
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
