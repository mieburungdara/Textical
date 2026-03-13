/**
 * Consumable Items
 * 
 * Items that can be used in or out of combat.
 * Includes potions, buff items, and status removers.
 */

import { 
  ConsumableItem, 
  ConsumableType, 
  registerConsumable,
  Rarity 
} from './Equipment.js';

// ========== HEALTH POTIONS ==========

export const small_health_potion: ConsumableItem = {
  id: 'small_health_potion',
  name: 'Small Health Potion',
  description: 'Restores 50 HP.',
  type: 'consumable' as any,
  rarity: Rarity.COMMON,
  level: 1,
  consumableType: ConsumableType.HEALTH_POTION,
  effect: {
    healHp: 50,
    usableInCombat: true,
  },
  maxStack: 99,
  price: 25,
  icon: '🧪',
  color: '#EF5350',
};

export const medium_health_potion: ConsumableItem = {
  id: 'medium_health_potion',
  name: 'Medium Health Potion',
  description: 'Restores 150 HP.',
  type: 'consumable' as any,
  rarity: Rarity.UNCOMMON,
  level: 10,
  consumableType: ConsumableType.HEALTH_POTION,
  effect: {
    healHp: 150,
    usableInCombat: true,
  },
  maxStack: 99,
  price: 100,
  icon: '🧪',
  color: '#4CAF50',
};

export const large_health_potion: ConsumableItem = {
  id: 'large_health_potion',
  name: 'Large Health Potion',
  description: 'Restores 500 HP.',
  type: 'consumable' as any,
  rarity: Rarity.RARE,
  level: 25,
  consumableType: ConsumableType.HEALTH_POTION,
  effect: {
    healHp: 500,
    usableInCombat: true,
  },
  maxStack: 99,
  price: 500,
  icon: '🧪',
  color: '#2196F3',
};

export const greater_health_potion: ConsumableItem = {
  id: 'greater_health_potion',
  name: 'Greater Health Potion',
  description: 'Restores 50% of max HP.',
  type: 'consumable' as any,
  rarity: Rarity.EPIC,
  level: 40,
  consumableType: ConsumableType.HEALTH_POTION,
  effect: {
    healHpPercent: 50,
    usableInCombat: true,
  },
  maxStack: 99,
  price: 1500,
  icon: '🧪',
  color: '#9C27B0',
};

// ========== MANA POTIONS ==========

export const small_mana_potion: ConsumableItem = {
  id: 'small_mana_potion',
  name: 'Small Mana Potion',
  description: 'Restores 30 Mana.',
  type: 'consumable' as any,
  rarity: Rarity.COMMON,
  level: 1,
  consumableType: ConsumableType.MANA_POTION,
  effect: {
    healMana: 30,
    usableInCombat: true,
  },
  maxStack: 99,
  price: 30,
  icon: '🧴',
  color: '#42A5F5',
};

export const medium_mana_potion: ConsumableItem = {
  id: 'medium_mana_potion',
  name: 'Medium Mana Potion',
  description: 'Restores 100 Mana.',
  type: 'consumable' as any,
  rarity: Rarity.UNCOMMON,
  level: 15,
  consumableType: ConsumableType.MANA_POTION,
  effect: {
    healMana: 100,
    usableInCombat: true,
  },
  maxStack: 99,
  price: 150,
  icon: '🧴',
  color: '#1E88E5',
};

export const large_mana_potion: ConsumableItem = {
  id: 'large_mana_potion',
  name: 'Large Mana Potion',
  description: 'Restores 300 Mana.',
  type: 'consumable' as any,
  rarity: Rarity.RARE,
  level: 30,
  consumableType: ConsumableType.MANA_POTION,
  effect: {
    healMana: 300,
    usableInCombat: true,
  },
  maxStack: 99,
  price: 600,
  icon: '🧴',
  color: '#0D47A1',
};

// ========== ANTIDOTES & STATUS REMOVERS ==========

export const antidote: ConsumableItem = {
  id: 'antidote',
  name: 'Antidote',
  description: 'Cures poison and toxic status effects.',
  type: 'consumable' as any,
  rarity: Rarity.COMMON,
  level: 5,
  consumableType: ConsumableType.ANTIDOTE,
  effect: {
    removeStatus: ['poison', 'toxic'],
    usableInCombat: true,
  },
  maxStack: 99,
  price: 50,
  icon: '💊',
  color: '#8BC34A',
};

export const stone_skin: ConsumableItem = {
  id: 'stone_skin',
  name: 'Stone Skin Potion',
  description: 'Increases defense by 20 for 30 seconds.',
  type: 'consumable' as any,
  rarity: Rarity.RARE,
  level: 20,
  consumableType: ConsumableType.BUFF_ITEM,
  effect: {
    buff: {
      stat: 'defense',
      value: 20,
      duration: 30,
    },
    usableInCombat: true,
  },
  maxStack: 99,
  price: 400,
  icon: '🪨',
  color: '#795548',
};

export const swiftness_potion: ConsumableItem = {
  id: 'swiftness_potion',
  name: 'Swiftness Potion',
  description: 'Increases speed by 15 for 30 seconds.',
  type: 'consumable' as any,
  rarity: Rarity.UNCOMMON,
  level: 15,
  consumableType: ConsumableType.BUFF_ITEM,
  effect: {
    buff: {
      stat: 'speed',
      value: 15,
      duration: 30,
    },
    usableInCombat: true,
  },
  maxStack: 99,
  price: 250,
  icon: '⚡',
  color: '#FFEB3B',
};

// ========== REGISTER ALL CONSUMABLES ==========

export function registerAllConsumables(): void {
  // Health Potions
  registerConsumable(small_health_potion);
  registerConsumable(medium_health_potion);
  registerConsumable(large_health_potion);
  registerConsumable(greater_health_potion);
  
  // Mana Potions
  registerConsumable(small_mana_potion);
  registerConsumable(medium_mana_potion);
  registerConsumable(large_mana_potion);
  
  // Status Removers
  registerConsumable(antidote);
  
  // Buff Items
  registerConsumable(stone_skin);
  registerConsumable(swiftness_potion);
}

// Auto-register on import
registerAllConsumables();
