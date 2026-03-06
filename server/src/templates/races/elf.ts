/**
 * Elf - Agile/Magic Race
 * 
 * Graceful and long-lived, elves excel in DEX and INT-based combat.
 * Bonus: High DEX/INT, lower DEF
 */

import { RaceTemplate, RaceType } from '../RaceTemplate.js';

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
  
  bonusAbilities: ['sharp_sense', 'night_vision'],
  
  description: 'Graceful and agile, masters of ranged combat and magic',
};
