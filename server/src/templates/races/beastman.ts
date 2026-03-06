/**
 * Beastman - Agile Race
 * 
 * Humanoid creatures with beast-like traits, masters of speed and evasion.
 * Bonus: High DEX, moderate ATK, low DEF/MAG
 * 
 * Growth: High DEX (1.05), Moderate ATK (1.03), Low DEF (1.02)
 */

import { RaceTemplate, RaceType, RaceGrowthRates } from '../RaceTemplate.js';

const beastmanGrowth: RaceGrowthRates = {
  vit: 1.02,      // +2% HP per level (low - not tanky)
  attack: 1.03,   // +3% ATK per level (moderate - agile fighters)
  defense: 1.01,  // +1% DEF per level (low - relies on evasion)
  dex: 1.05,      // +5% DEX per level (HIGH - beast agility!)
  magic: 1.01,    // +1% MAG per level (minimal - not magical)
};

export const beastman: RaceTemplate = {
  id: 'beastman',
  name: 'Beastman',
  raceType: RaceType.BEASTMAN,
  
  statModifiers: {
    vit: 0,        // No VIT bonus
    hp: 0,         // No additional HP bonus
    attack: 8,     // Moderate STR bonus
    defense: -2,   // Lower DEF (light armor)
    dex: 15,       // High DEX (beast agility!)
    magic: 0,      // No INT bonus
    mana: 0,       // No additional Mana bonus
    critRate: 8,   // +8% crit rate (predator instincts)
    evasion: 10,   // +10% evasion (hard to hit)
  },
  
  growthRates: beastmanGrowth,
  
  bonusAbilities: ['predator_instinct', 'night_vision', 'berserker_blood'],
  
  description: 'Savage and swift, beastmen are deadly hunters',
};
