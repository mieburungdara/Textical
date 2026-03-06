/**
 * Orc - Offensive Race
 * 
 * Fierce and strong, orcs are natural warriors.
 * Bonus: High ATK/HP, lower DEF/MAG
 * 
 * Growth: High ATK (1.05), High VIT (1.04), Low DEF (1.01), Low MAG (1.00)
 */

import { RaceTemplate, RaceType, RaceGrowthRates } from '../RaceTemplate.js';

const orcGrowth: RaceGrowthRates = {
  vit: 1.04,      // +4% HP per level (HIGH - tough)
  attack: 1.05,   // +5% ATK per level (HIGH - rage grows)
  defense: 1.01,  // +1% DEF per level (low - relies on offense)
  dex: 1.02,      // +2% DEX per level (moderate)
  magic: 1.00,    // +0% MAG per level (none - not magical)
};

export const orc: RaceTemplate = {
  id: 'orc',
  name: 'Orc',
  raceType: RaceType.ORC,
  
  statModifiers: {
    vit: 1,        // +1 VIT (+10 HP)
    hp: 0,         // Additional flat HP (now from VIT)
    attack: 15,   // High STR bonus (+15 ATK)
    defense: -5,  // Lower DEF
    dex: 5,        // Moderate DEX (different from GDD which says -5)
    magic: 0,      // No INT bonus
    mana: 0,       // No additional Mana bonus
    critRate: 5,
    evasion: 0,
  },
  
  growthRates: orcGrowth,
  
  bonusAbilities: ['berserker_blood', 'intimidation'],
  
  description: 'Fierce and strong, orcs are born warriors',
};
