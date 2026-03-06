/**
 * Human - Balanced Race
 * 
 * Most versatile race with no significant weaknesses.
 * Bonus: +5 to all stats (VIT, ATK/STR, DEF, DEX, MAG)
 * This translates to: +5 VIT (+50 HP), +5 to all primary stats
 * 
 * Growth: Balanced - all stats grow equally at 1.03 per level
 */

import { RaceTemplate, RaceType, RaceStatModifier, RaceGrowthRates } from '../RaceTemplate.js';

const humanGrowth: RaceGrowthRates = {
  vit: 1.03,      // +3% HP per level
  attack: 1.03,   // +3% ATK per level
  defense: 1.03,  // +3% DEF per level
  dex: 1.03,      // +3% DEX per level
  magic: 1.03,    // +3% MAG per level
};

export const human: RaceTemplate = {
  id: 'human',
  name: 'Human',
  raceType: RaceType.HUMAN,
  
  statModifiers: {
    vit: 5,        // +5 VIT (+50 HP via vit * 10)
    hp: 0,         // Additional flat HP bonus
    attack: 5,     // STR
    defense: 5,   // DEF
    dex: 5,        // DEX
    magic: 5,      // INT
    mana: 0,       // Additional flat Mana bonus
    critRate: 0,
    evasion: 0,
  },
  
  growthRates: humanGrowth,
  
  bonusAbilities: ['versatile'],
  
  description: 'Versatile and ambitious, humans excel in any profession',
};
