/**
 * Consumable Constants
 * 
 * NOTE: Error codes are now imported from centralized ErrorCodes.js
 * This file provides backward-compatible aliases for the legacy local error codes.
 */
const ErrorCodes = require('../../constants/ErrorCodes');

// Backward-compatible error code aliases
// Maps legacy local names to centralized CONSUMABLE_* and COMBAT_* codes
const ERROR_CODES = {
    // Combat-related errors (used by potion system)
    NO_ACTIVE_BATTLE: ErrorCodes.COMBAT_NO_ACTIVE_BATTLE,
    HERO_NOT_IN_BATTLE: ErrorCodes.COMBAT_HERO_NOT_IN_BATTLE,
    HERO_IS_DEAD: ErrorCodes.COMBAT_HERO_DEAD,
    POTION_COOLDOWN: ErrorCodes.COMBAT_POTION_COOLDOWN,
    NO_POTIONS: ErrorCodes.COMBAT_NO_POTIONS,
    NO_POTIONS_REMAINING: ErrorCodes.COMBAT_NO_POTIONS_REMAINING,
    
    // Inventory-related errors
    INVENTORY_ERROR: ErrorCodes.INVENTORY_FULL,
    ITEM_NOT_FOUND: ErrorCodes.CONSUMABLE_ITEM_NOT_FOUND,
    
    // Consumable-specific errors
    ITEM_NOT_CONSUMABLE: ErrorCodes.CONSUMABLE_NOT_CONSUMABLE,
    NO_ITEM_EFFECT: ErrorCodes.CONSUMABLE_NO_EFFECT,
    NO_HERO_SELECTED: ErrorCodes.CONSUMABLE_NO_HERO_SELECTED,
    INVALID_INPUT: ErrorCodes.CONSUMABLE_INVALID_INPUT,
    HERO_NOT_FOUND: ErrorCodes.HERO_NOT_FOUND,
    INVALID_STAT_KEY: ErrorCodes.CONSUMABLE_INVALID_STAT,
    BUFF_DURATION_EXCEEDED: ErrorCodes.CONSUMABLE_BUFF_DURATION_EXCEEDED,
    BLACK_ZONE_RESTRICTION: ErrorCodes.CONSUMABLE_BLACK_ZONE_RESTRICTION
};

const CONSUMABLE_CONSTANTS = {
    HEALTH_POTION_ID: 2001,
    BASE_HEAL_AMOUNT: 50,
    ALCHEMY_BONUS_PER_LEVEL: 0.03,
    POTION_COOLDOWN_TICKS: 180,
    TICKS_PER_SECOND: 60,
    BUFF_DURATIONS_TICKS: {
        BASIC_POTION: 18000,
        DISH_BUFF: 36000,
        ELIXIR_NORMAL: 72000,
        ELIXIR_STRONG: 108000
    },
    MAX_BUFF_DURATION_TICKS: 5184000,
    VALID_STAT_KEYS: [
        'hp_regen', 'mana_regen', 'str', 'int', 'dex', 'vit', 
        'health_max', 'mana_max', 'attack', 'defense', 'speed'
    ]
};

const TICK_UTILS = {
    secondsToTicks(seconds) {
        return Math.round(seconds * CONSUMABLE_CONSTANTS.TICKS_PER_SECOND);
    },
    calculateExpiresTick(currentTick, durationTicks) {
        return currentTick + durationTicks;
    }
};

module.exports = {
    ERROR_CODES,
    CONSUMABLE_CONSTANTS,
    TICK_UTILS
};
