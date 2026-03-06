/**
 * Orc - Offensive Race
 * 
 * Fierce and strong, orcs are natural warriors.
 * Bonus: High ATK/HP, lower DEF/MAG
 */

import { RaceTemplate, RaceType } from '../RaceTemplate.js';

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
  
  bonusAbilities: ['berserker_blood', 'intimidation'],
  
  description: 'Fierce and strong, orcs are born warriors',
};
