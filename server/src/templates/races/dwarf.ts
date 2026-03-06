/**
 * Dwarf - Defensive Race
 * 
 * Stout and resilient, dwarves are masters of defense and craftsmanship.
 * Bonus: High HP/DEF, lower DEX
 * 
 * Growth: High DEF (1.05), High VIT (1.04), Low DEX (1.02)
 */

import { RaceTemplate, RaceType, RaceGrowthRates } from '../RaceTemplate.js';

const dwarfGrowth: RaceGrowthRates = {
  vit: 1.04,      // +4% HP per level (HIGH - tough)
  attack: 1.03,   // +3% ATK per level (moderate)
  defense: 1.05,  // +5% DEF per level (HIGH - armor mastery)
  dex: 1.01,      // +1% DEX per level (very low - slow)
  magic: 1.01,    // +1% MAG per level (minimal - not magical)
};

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
  
  growthRates: dwarfGrowth,
  
  bonusAbilities: ['stone_resilience', 'craftsmanship'],
  
  description: 'Stout and resilient, dwarves are unmatched in defense and craftsmanship',
};
