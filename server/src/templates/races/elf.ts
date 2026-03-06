/**
 * Elf - Magic/Agile Race
 * 
 * Graceful and long-lived, elves excel in INT and DEX-based combat.
 * Bonus: High DEX/INT, lower DEF
 * 
 * Growth: High INT (1.05), Moderate DEX (1.03), Low DEF (1.02)
 */

import { RaceTemplate, RaceType, RaceGrowthRates } from '../RaceTemplate.js';

const elfGrowth: RaceGrowthRates = {
  vit: 1.02,      // +2% HP per level (low - fragile)
  attack: 1.02,   // +2% ATK per level (low - not warriors)
  defense: 1.01,  // +1% DEF per level (very low - squishy)
  dex: 1.03,      // +3% DEX per level (moderate)
  magic: 1.05,    // +5% MAG per level (HIGH - magic affinity!)
};

export const elf: RaceTemplate = {
  id: 'elf',
  name: 'Elf',
  raceType: RaceType.ELF,
  
  statModifiers: {
    vit: 0,        // No VIT bonus
    hp: 0,         // No additional HP bonus
    attack: 0,     // STR - no bonus
    defense: -3,   // Lower DEF
    dex: 12,       // High DEX
    magic: 10,     // High INT
    mana: 0,       // No additional Mana bonus
    critRate: 5,   // +5% crit rate
    evasion: 6,   // +6% evasion
  },
  
  growthRates: elfGrowth,
  
  bonusAbilities: ['sharp_sense', 'night_vision'],
  
  description: 'Graceful and agile, masters of ranged combat and magic',
};
