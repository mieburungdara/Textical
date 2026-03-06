/**
 * Human - Balanced Race
 * 
 * Most versatile race with no significant weaknesses.
 * Bonus: +5 to all stats (VIT, ATK/STR, DEF, DEX, MAG)
 * This translates to: +5 VIT (+50 HP), +5 to all primary stats
 */

import { RaceTemplate, RaceType, RaceStatModifier } from '../RaceTemplate.js';

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
  
  bonusAbilities: ['versatile'],
  
  description: 'Versatile and ambitious, humans excel in any profession',
};
