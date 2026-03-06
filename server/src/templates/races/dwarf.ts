/**
 * Dwarf - Defensive Race
 * 
 * Stout and resilient, dwarves are masters of defense and craftsmanship.
 * Bonus: High HP/DEF, lower DEX
 */

import { RaceTemplate, RaceType } from '../RaceTemplate.js';

export const dwarf: RaceTemplate = {
  id: 'dwarf',
  name: 'Dwarf',
  raceType: RaceType.DWARF,
  
  statModifiers: {
    vit: 6,        // +6 VIT (+60 HP via vit * 10) - highest HP bonus
    hp: 0,         // Additional flat HP (now from VIT)
    attack: 5,     // STR bonus
    defense: 10,   // High DEF bonus
    dex: -3,       // Lower DEX
    magic: 0,      // No INT bonus
    mana: 0,       // No additional Mana bonus
    critRate: 0,
    evasion: 0,
  },
  
  bonusAbilities: ['stone_resilience', 'craftsmanship'],
  
  description: 'Stout and resilient, dwarves are unmatched in defense and craftsmanship',
};
