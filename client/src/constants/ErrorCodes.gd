## Textical Error Codes Registry (Client)
## 
## Centralized error code constants for the Godot client.
## All error codes follow the naming convention: MODULE_ENTITY_STATUS
## 
## @see docs/ERROR_CODES.md for full documentation
class_name ErrorCodes

# ===========================================
# Authentication Errors (AUTH_*)
# ===========================================
const AUTH_INVALID_CREDENTIALS: String = "AUTH_INVALID_CREDENTIALS"
const AUTH_USER_NOT_FOUND: String = "AUTH_USER_NOT_FOUND"
const AUTH_SESSION_EXPIRED: String = "AUTH_SESSION_EXPIRED"
const AUTH_UNAUTHORIZED: String = "AUTH_UNAUTHORIZED"
const AUTH_FORBIDDEN: String = "AUTH_FORBIDDEN"

# ===========================================
# User Errors (USER_*)
# ===========================================
const USER_NOT_FOUND: String = "USER_NOT_FOUND"
const USER_INVALID_ID: String = "USER_INVALID_ID"
const USER_BUSY: String = "USER_BUSY"
const USER_UNCONSCIOUS: String = "USER_UNCONSCIOUS"
const USER_IN_RECOVERY: String = "USER_IN_RECOVERY"

# ===========================================
# Hero Errors (HERO_*)
# ===========================================
const HERO_NOT_FOUND: String = "HERO_NOT_FOUND"
const HERO_INVALID_ID: String = "HERO_INVALID_ID"
const HERO_UNAUTHORIZED: String = "HERO_UNAUTHORIZED"
const HERO_BUSY: String = "HERO_BUSY"
const HERO_DEAD: String = "HERO_DEAD"
const HERO_LOW_LEVEL: String = "HERO_LOW_LEVEL"
const HERO_WRONG_CLASS: String = "HERO_WRONG_CLASS"
const HERO_ALREADY_SPECIALIZED: String = "HERO_ALREADY_SPECIALIZED"
const HERO_NO_JOB: String = "HERO_NO_JOB"
const HERO_OFFSPRING_LIMIT: String = "HERO_OFFSPRING_LIMIT"
const HERO_NOT_IN_FORMATION: String = "HERO_NOT_IN_FORMATION"
const HERO_LISTED_MARKET: String = "HERO_LISTED_MARKET"
const HERO_ALREADY_REPRODUCED: String = "HERO_ALREADY_REPRODUCED"
const HERO_INVALID_GENDER: String = "HERO_INVALID_GENDER"
const HERO_PROMOTION_LEVEL_LOW: String = "HERO_PROMOTION_LEVEL_LOW"
const HERO_CLASS_BRANCH_INVALID: String = "HERO_CLASS_BRANCH_INVALID"

# ===========================================
# Energy Errors (ENERGY_*)
# ===========================================
const ENERGY_INSUFFICIENT: String = "ENERGY_INSUFFICIENT"
const ENERGY_ZERO: String = "ENERGY_ZERO"

# ===========================================
# Inventory Errors (INVENTORY_*)
# ===========================================
const INVENTORY_FULL: String = "INVENTORY_FULL"
const INVENTORY_ITEM_NOT_FOUND: String = "INVENTORY_ITEM_NOT_FOUND"
const INVENTORY_ITEM_EQUIPPED: String = "INVENTORY_ITEM_EQUIPPED"
const INVENTORY_ITEM_LOCKED: String = "INVENTORY_ITEM_LOCKED"
const INVENTORY_ITEM_STOLEN: String = "INVENTORY_ITEM_STOLEN"
const INVENTORY_WRONG_TYPE: String = "INVENTORY_WRONG_TYPE"

# ===========================================
# Equipment Errors (EQUIP_*)
# ===========================================
const EQUIP_INVALID_SLOT: String = "EQUIP_INVALID_SLOT"
const EQUIP_WRONG_SLOT: String = "EQUIP_WRONG_SLOT"
const EQUIP_LEVEL_REQUIREMENT: String = "EQUIP_LEVEL_REQUIREMENT"
const EQUIP_CLASS_REQUIREMENT: String = "EQUIP_CLASS_REQUIREMENT"
const EQUIP_ALREADY_EQUIPPED: String = "EQUIP_ALREADY_EQUIPPED"
const EQUIP_SLOT_EMPTY: String = "EQUIP_SLOT_EMPTY"
const EQUIP_ITEM_LISTED: String = "EQUIP_ITEM_LISTED"

# ===========================================
# Travel Errors (TRAVEL_*)
# ===========================================
const TRAVEL_NO_PATH: String = "TRAVEL_NO_PATH"
const TRAVEL_UNCONSCIOUS: String = "TRAVEL_UNCONSCIOUS"
const TRAVEL_IN_RECOVERY: String = "TRAVEL_IN_RECOVERY"
const TRAVEL_BUSY: String = "TRAVEL_BUSY"
const TRAVEL_BLACK_ZONE_MIN_UNITS: String = "TRAVEL_BLACK_ZONE_MIN_UNITS"
const TRAVEL_ENERGY_COST: String = "TRAVEL_ENERGY_COST"
const TRAVEL_ALREADY_THERE: String = "TRAVEL_ALREADY_THERE"
const TRAVEL_INVALID_REGION: String = "TRAVEL_INVALID_REGION"

# ===========================================
# Tavern Errors (TAVERN_*)
# ===========================================
const TAVERN_NOT_IN_TAVERN: String = "TAVERN_NOT_IN_TAVERN"
const TAVERN_NO_INN: String = "TAVERN_NO_INN"
const TAVERN_DAILY_LIMIT: String = "TAVERN_DAILY_LIMIT"
const TAVERN_MERCENARY_GONE: String = "TAVERN_MERCENARY_GONE"
const TAVERN_INSUFFICIENT_FUNDS: String = "TAVERN_INSUFFICIENT_FUNDS"
const TAVERN_BUSY: String = "TAVERN_BUSY"
const TAVERN_FAST_TRAVEL_COOLDOWN: String = "TAVERN_FAST_TRAVEL_COOLDOWN"
const TAVERN_FAST_TRAVEL_WRONG_ZONE: String = "TAVERN_FAST_TRAVEL_WRONG_ZONE"

# ===========================================
# Market Errors (MARKET_*)
# ===========================================
const MARKET_NOT_IN_TOWN: String = "MARKET_NOT_IN_TOWN"
const MARKET_LISTING_NOT_FOUND: String = "MARKET_LISTING_NOT_FOUND"
const MARKET_LISTING_EXPIRED: String = "MARKET_LISTING_EXPIRED"
const MARKET_LISTING_SOLD: String = "MARKET_LISTING_SOLD"
const MARKET_LISTING_INACTIVE: String = "MARKET_LISTING_INACTIVE"
const MARKET_OWN_ITEM: String = "MARKET_OWN_ITEM"
const MARKET_SELF_PURCHASE: String = "MARKET_SELF_PURCHASE"
const MARKET_INSUFFICIENT_FUNDS: String = "MARKET_INSUFFICIENT_FUNDS"
const MARKET_ITEM_EQUIPPED: String = "MARKET_ITEM_EQUIPPED"
const MARKET_EQUIPPED_ITEM: String = "MARKET_EQUIPPED_ITEM"
const MARKET_ITEM_STOLEN: String = "MARKET_ITEM_STOLEN"
const MARKET_STOLEN_GOODS: String = "MARKET_STOLEN_GOODS"
const MARKET_PRICE_TOO_LOW: String = "MARKET_PRICE_TOO_LOW"
const MARKET_BUSY: String = "MARKET_BUSY"
const MARKET_ITEM_NOT_FOUND: String = "MARKET_ITEM_NOT_FOUND"
const MARKET_ITEM_NOT_OWNED: String = "MARKET_ITEM_NOT_OWNED"
const MARKET_ORDER_NOT_FOUND: String = "MARKET_ORDER_NOT_FOUND"
const MARKET_ORDER_NOT_YOURS: String = "MARKET_ORDER_NOT_YOURS"
const MARKET_NOT_ORDER_OWNER: String = "MARKET_NOT_ORDER_OWNER"
const MARKET_ORDER_CLOSED: String = "MARKET_ORDER_CLOSED"
const MARKET_ORDER_NOT_OPEN: String = "MARKET_ORDER_NOT_OPEN"
const MARKET_ITEM_LOCKED: String = "MARKET_ITEM_LOCKED"
const MARKET_INSUFFICIENT_QUANTITY: String = "MARKET_INSUFFICIENT_QUANTITY"

# ===========================================
# Formation Errors (FORMATION_*)
# ===========================================
const FORMATION_MAX_UNITS: String = "FORMATION_MAX_UNITS"
const FORMATION_INVALID_POSITION: String = "FORMATION_INVALID_POSITION"
const FORMATION_OVERLAP: String = "FORMATION_OVERLAP"
const FORMATION_HERO_DUPLICATE: String = "FORMATION_HERO_DUPLICATE"
const FORMATION_HERO_NOT_OWNED: String = "FORMATION_HERO_NOT_OWNED"
const FORMATION_HERO_LISTED: String = "FORMATION_HERO_LISTED"
const FORMATION_SWAP_FAILED: String = "FORMATION_SWAP_FAILED"

# ===========================================
# Combat Errors (COMBAT_*)
# ===========================================
const COMBAT_NO_ACTIVE_BATTLE: String = "COMBAT_NO_ACTIVE_BATTLE"
const COMBAT_HERO_NOT_IN_BATTLE: String = "COMBAT_HERO_NOT_IN_BATTLE"
const COMBAT_HERO_DEAD: String = "COMBAT_HERO_DEAD"
const COMBAT_POTION_COOLDOWN: String = "COMBAT_POTION_COOLDOWN"
const COMBAT_NO_POTIONS: String = "COMBAT_NO_POTIONS"
const COMBAT_NO_POTIONS_REMAINING: String = "COMBAT_NO_POTIONS_REMAINING"
const COMBAT_PVP_NOT_ALLOWED: String = "COMBAT_PVP_NOT_ALLOWED"
const COMBAT_NO_FORMATION: String = "COMBAT_NO_FORMATION"
const COMBAT_MONSTER_NOT_FOUND: String = "COMBAT_MONSTER_NOT_FOUND"
const COMBAT_MONSTER_UNAVAILABLE: String = "COMBAT_MONSTER_UNAVAILABLE"
const COMBAT_BUSY: String = "COMBAT_BUSY"
const COMBAT_ATTACKER_NOT_FOUND: String = "COMBAT_ATTACKER_NOT_FOUND"
const COMBAT_DEFENDER_NOT_FOUND: String = "COMBAT_DEFENDER_NOT_FOUND"
const COMBAT_PRESET_MISSING: String = "COMBAT_PRESET_MISSING"

# ===========================================
# Consumable Errors (CONSUMABLE_*)
# ===========================================
const CONSUMABLE_ITEM_NOT_FOUND: String = "CONSUMABLE_ITEM_NOT_FOUND"
const CONSUMABLE_NOT_CONSUMABLE: String = "CONSUMABLE_NOT_CONSUMABLE"
const CONSUMABLE_NO_EFFECT: String = "CONSUMABLE_NO_EFFECT"
const CONSUMABLE_NO_HERO_SELECTED: String = "CONSUMABLE_NO_HERO_SELECTED"
const CONSUMABLE_INVALID_STAT: String = "CONSUMABLE_INVALID_STAT"
const CONSUMABLE_BUFF_DURATION_EXCEEDED: String = "CONSUMABLE_BUFF_DURATION_EXCEEDED"
const CONSUMABLE_BLACK_ZONE_RESTRICTION: String = "CONSUMABLE_BLACK_ZONE_RESTRICTION"
const CONSUMABLE_INVALID_INPUT: String = "CONSUMABLE_INVALID_INPUT"

# ===========================================
# Crafting Errors (CRAFT_*)
# ===========================================
const CRAFT_NOT_IN_TOWN: String = "CRAFT_NOT_IN_TOWN"
const CRAFT_RECIPE_NOT_FOUND: String = "CRAFT_RECIPE_NOT_FOUND"
const CRAFT_MISSING_MATERIAL: String = "CRAFT_MISSING_MATERIAL"
const CRAFT_INVENTORY_FULL: String = "CRAFT_INVENTORY_FULL"
const CRAFT_AFFIX_MISSING: String = "CRAFT_AFFIX_MISSING"
const CRAFT_BUSY: String = "CRAFT_BUSY"
const CRAFT_SALVAGE_NO_ITEMS: String = "CRAFT_SALVAGE_NO_ITEMS"
const CRAFT_SALVAGE_INVALID: String = "CRAFT_SALVAGE_INVALID"
const CRAFTING_INVALID_REQUEST: String = "CRAFTING_INVALID_REQUEST"
const CRAFTING_AFFIX_MATERIAL_NOT_FOUND: String = "CRAFTING_AFFIX_MATERIAL_NOT_FOUND"

# ===========================================
# Gathering Errors (GATHER_*)
# ===========================================
const GATHER_RESOURCE_NOT_FOUND: String = "GATHER_RESOURCE_NOT_FOUND"
const GATHER_WRONG_REGION: String = "GATHER_WRONG_REGION"
const GATHER_INVENTORY_FULL: String = "GATHER_INVENTORY_FULL"
const GATHER_LOW_STRENGTH: String = "GATHER_LOW_STRENGTH"
const GATHER_WRONG_TOOL: String = "GATHER_WRONG_TOOL"
const GATHER_BUSY: String = "GATHER_BUSY"
const GATHER_UNAUTHORIZED: String = "GATHER_UNAUTHORIZED"

# ===========================================
# Quest Errors (QUEST_*)
# ===========================================
const QUEST_NOT_FOUND: String = "QUEST_NOT_FOUND"
const QUEST_INVALID_TEMPLATE: String = "QUEST_INVALID_TEMPLATE"
const QUEST_LOW_REPUTATION: String = "QUEST_LOW_REPUTATION"
const QUEST_USER_QUEST_NOT_FOUND: String = "QUEST_USER_QUEST_NOT_FOUND"
const QUEST_ALREADY_COMPLETED: String = "QUEST_ALREADY_COMPLETED"
const QUEST_STAGE_INCOMPLETE: String = "QUEST_STAGE_INCOMPLETE"
const QUEST_NO_ACTIVE_STAGE: String = "QUEST_NO_ACTIVE_STAGE"
const QUEST_OBJECTIVE_INCOMPLETE: String = "QUEST_OBJECTIVE_INCOMPLETE"
const QUEST_DIALOGUE_NOT_FOUND: String = "QUEST_DIALOGUE_NOT_FOUND"
const QUEST_WRONG_REGION: String = "QUEST_WRONG_REGION"
const QUEST_KILLS_INSUFFICIENT: String = "QUEST_KILLS_INSUFFICIENT"
const QUEST_NO_DIALOGUE: String = "QUEST_NO_DIALOGUE"
const QUEST_INVALID_DIALOGUE: String = "QUEST_INVALID_DIALOGUE"
const QUEST_UNSUPPORTED_OBJECTIVE: String = "QUEST_UNSUPPORTED_OBJECTIVE"

# ===========================================
# Guild Errors (GUILD_*)
# ===========================================
const GUILD_NOT_IN_GUILD: String = "GUILD_NOT_IN_GUILD"
const GUILD_NOT_MEMBER: String = "GUILD_NOT_MEMBER"
const GUILD_ALREADY_IN_GUILD: String = "GUILD_ALREADY_IN_GUILD"
const GUILD_ALREADY_MEMBER: String = "GUILD_ALREADY_MEMBER"
const GUILD_NOT_FOUND: String = "GUILD_NOT_FOUND"
const GUILD_NAME_TAKEN: String = "GUILD_NAME_TAKEN"
const GUILD_INVALID_TEMPLATE: String = "GUILD_INVALID_TEMPLATE"
const GUILD_INSUFFICIENT_FUNDS: String = "GUILD_INSUFFICIENT_FUNDS"
const GUILD_NOT_ENOUGH_HEROES: String = "GUILD_NOT_ENOUGH_HEROES"
const GUILD_NO_PERMISSION: String = "GUILD_NO_PERMISSION"
const GUILD_MASTER_LEAVE: String = "GUILD_MASTER_LEAVE"
const GUILD_CANNOT_KICK_MASTER: String = "GUILD_CANNOT_KICK_MASTER"
const GUILD_CANNOT_KICK_SELF: String = "GUILD_CANNOT_KICK_SELF"
const GUILD_USER_NOT_MEMBER: String = "GUILD_USER_NOT_MEMBER"
const GUILD_CANNOT_PROMOTE_MASTER: String = "GUILD_CANNOT_PROMOTE_MASTER"
const GUILD_INVALID_PROMOTION: String = "GUILD_INVALID_PROMOTION"
const GUILD_CANNOT_DEMOTE_MASTER: String = "GUILD_CANNOT_DEMOTE_MASTER"
const GUILD_CANNOT_DEMOTE_SELF: String = "GUILD_CANNOT_DEMOTE_SELF"
const GUILD_CANNOT_DEMOTE_RECRUIT: String = "GUILD_CANNOT_DEMOTE_RECRUIT"
const GUILD_MIN_RANK_REACHED: String = "GUILD_MIN_RANK_REACHED"
const GUILD_MASTER_ONLY: String = "GUILD_MASTER_ONLY"
const GUILD_OFFICER_ONLY: String = "GUILD_OFFICER_ONLY"
const GUILD_ALREADY_MASTER: String = "GUILD_ALREADY_MASTER"
const GUILD_INVITE_INVALID: String = "GUILD_INVITE_INVALID"
const GUILD_INVITE_EXPIRED: String = "GUILD_INVITE_EXPIRED"
const GUILD_INVITE_NOT_PENDING: String = "GUILD_INVITE_NOT_PENDING"
const GUILD_INVITE_NOT_YOURS: String = "GUILD_INVITE_NOT_YOURS"
const GUILD_INVITE_NOT_FOUND: String = "GUILD_INVITE_NOT_FOUND"
const GUILD_TREASURY_INSUFFICIENT: String = "GUILD_TREASURY_INSUFFICIENT"
const GUILD_ONLY_MASTER: String = "GUILD_ONLY_MASTER"
const GUILD_ONLY_OFFICER: String = "GUILD_ONLY_OFFICER"
const GUILD_FACILITY_EXISTS: String = "GUILD_FACILITY_EXISTS"
const GUILD_FACILITY_NOT_FOUND: String = "GUILD_FACILITY_NOT_FOUND"
const GUILD_FACILITY_NOT_YOURS: String = "GUILD_FACILITY_NOT_YOURS"
const GUILD_INVALID_FACILITY: String = "GUILD_INVALID_FACILITY"
const GUILD_AMOUNT_POSITIVE: String = "GUILD_AMOUNT_POSITIVE"

# ===========================================
# Territory Errors (TERRITORY_*)
# ===========================================
const TERRITORY_NOT_FOUND: String = "TERRITORY_NOT_FOUND"
const TERRITORY_NOT_CLAIMABLE: String = "TERRITORY_NOT_CLAIMABLE"
const TERRITORY_ALREADY_OWNED: String = "TERRITORY_ALREADY_OWNED"
const TERRITORY_UNDER_SIEGE: String = "TERRITORY_UNDER_SIEGE"
const TERRITORY_SIEGE_NOT_ACTIVE: String = "TERRITORY_SIEGE_NOT_ACTIVE"
const TERRITORY_TAX_INVALID: String = "TERRITORY_TAX_INVALID"
const TERRITORY_TAX_UNAUTHORIZED: String = "TERRITORY_TAX_UNAUTHORIZED"
const TERRITORY_SIEGE_COST: String = "TERRITORY_SIEGE_COST"

# ===========================================
# Property Errors (PROPERTY_*)
# ===========================================
const PROPERTY_NO_PLOTS: String = "PROPERTY_NO_PLOTS"
const PROPERTY_INSUFFICIENT_FUNDS: String = "PROPERTY_INSUFFICIENT_FUNDS"
const PROPERTY_NOT_FOUND: String = "PROPERTY_NOT_FOUND"
const PROPERTY_ACCESS_DENIED: String = "PROPERTY_ACCESS_DENIED"
const PROPERTY_MAX_TIER: String = "PROPERTY_MAX_TIER"
const PROPERTY_NAME_INVALID: String = "PROPERTY_NAME_INVALID"
const PROPERTY_MESSAGE_TOO_LONG: String = "PROPERTY_MESSAGE_TOO_LONG"

# ===========================================
# NPC Errors (NPC_*)
# ===========================================
const NPC_NOT_FOUND: String = "NPC_NOT_FOUND"
const NPC_NO_DIALOGUE: String = "NPC_NO_DIALOGUE"
const NPC_FACTION_ENEMY: String = "NPC_FACTION_ENEMY"
const NPC_ACTION_UNSUPPORTED: String = "NPC_ACTION_UNSUPPORTED"
const NPC_TELEPORT_INVALID: String = "NPC_TELEPORT_INVALID"
const NPC_TELEPORT_WRONG_ZONE: String = "NPC_TELEPORT_WRONG_ZONE"
const NPC_INSUFFICIENT_FUNDS: String = "NPC_INSUFFICIENT_FUNDS"
const NPC_SHOP_OUT_OF_STOCK: String = "NPC_SHOP_OUT_OF_STOCK"
const NPC_ITEM_NOT_AVAILABLE: String = "NPC_ITEM_NOT_AVAILABLE"

# ===========================================
# Chat Errors (CHAT_*)
# ===========================================
const CHAT_EMPTY_MESSAGE: String = "CHAT_EMPTY_MESSAGE"
const CHAT_TOO_LONG: String = "CHAT_TOO_LONG"
const CHAT_SPAM_DETECTED: String = "CHAT_SPAM_DETECTED"

# ===========================================
# Mail Errors (MAIL_*)
# ===========================================
const MAIL_NOT_FOUND: String = "MAIL_NOT_FOUND"
const MAIL_ACCESS_DENIED: String = "MAIL_ACCESS_DENIED"
const MAIL_ALREADY_CLAIMED: String = "MAIL_ALREADY_CLAIMED"

# ===========================================
# Inn Errors (INN_*)
# ===========================================
const INN_NO_INN: String = "INN_NO_INN"
const INN_INSUFFICIENT_FUNDS: String = "INN_INSUFFICIENT_FUNDS"
const INN_CANNOT_STORE_EQUIPPED: String = "INN_CANNOT_STORE_EQUIPPED"
const INN_ITEM_NOT_IN_VAULT: String = "INN_ITEM_NOT_IN_VAULT"
const INN_ITEM_NOT_IN_INVENTORY: String = "INN_ITEM_NOT_IN_INVENTORY"

# ===========================================
# Gambling Errors (GAMBLE_*)
# ===========================================
const GAMBLE_INVALID_GUESS: String = "GAMBLE_INVALID_GUESS"
const GAMBLE_INVALID_BET: String = "GAMBLE_INVALID_BET"
const GAMBLE_NOT_IN_INN: String = "GAMBLE_NOT_IN_INN"
const GAMBLE_INSUFFICIENT_FUNDS: String = "GAMBLE_INSUFFICIENT_FUNDS"

# ===========================================
# Faction Errors (FACTION_*)
# ===========================================
const FACTION_ALREADY_JOINED: String = "FACTION_ALREADY_JOINED"
const FACTION_NOT_FOUND: String = "FACTION_NOT_FOUND"

# ===========================================
# Bounty Errors (BOUNTY_*)
# ===========================================
const BOUNTY_SELF_TARGET: String = "BOUNTY_SELF_TARGET"
const BOUNTY_BELOW_MINIMUM: String = "BOUNTY_BELOW_MINIMUM"
const BOUNTY_ISSUER_NOT_FOUND: String = "BOUNTY_ISSUER_NOT_FOUND"
const BOUNTY_TARGET_NOT_FOUND: String = "BOUNTY_TARGET_NOT_FOUND"
const BOUNTY_INSUFFICIENT_FUNDS: String = "BOUNTY_INSUFFICIENT_FUNDS"

# ===========================================
# Siege Errors (SIEGE_*)
# ===========================================
const SIEGE_NOT_ACTIVE: String = "SIEGE_NOT_ACTIVE"
const SIEGE_OWN_TERRITORY: String = "SIEGE_OWN_TERRITORY"

# ===========================================
# Black Zone Errors (BLACKZONE_*)
# ===========================================
const BLACKZONE_MIN_UNITS: String = "BLACKZONE_MIN_UNITS"
const BLACKZONE_POTION_BANNED: String = "BLACKZONE_POTION_BANNED"
const BLACKZONE_DEATH_PENALTY: String = "BLACKZONE_DEATH_PENALTY"

# ===========================================
# Fast Travel Errors (FASTTRAVEL_*)
# ===========================================
const FASTTRAVEL_NOT_IN_TAVERN: String = "FASTTRAVEL_NOT_IN_TAVERN"
const FASTTRAVEL_WRONG_ZONE: String = "FASTTRAVEL_WRONG_ZONE"
const FASTTRAVEL_INVALID_DESTINATION: String = "FASTTRAVEL_INVALID_DESTINATION"
const FASTTRAVEL_ALREADY_THERE: String = "FASTTRAVEL_ALREADY_THERE"
const FASTTRAVEL_COOLDOWN: String = "FASTTRAVEL_COOLDOWN"
const FASTTRAVEL_INSUFFICIENT_FUNDS: String = "FASTTRAVEL_INSUFFICIENT_FUNDS"

# ===========================================
# Rumor Errors (RUMOR_*)
# ===========================================
const RUMOR_NOT_FOUND: String = "RUMOR_NOT_FOUND"
const RUMOR_NOT_IN_INN: String = "RUMOR_NOT_IN_INN"
const RUMOR_INSUFFICIENT_FUNDS: String = "RUMOR_INSUFFICIENT_FUNDS"
const RUMOR_INVALID_PURCHASE: String = "RUMOR_INVALID_PURCHASE"
const RUMOR_ALREADY_RATED: String = "RUMOR_ALREADY_RATED"
const RUMOR_RATING_INVALID: String = "RUMOR_RATING_INVALID"
const RUMOR_TOO_SHORT: String = "RUMOR_TOO_SHORT"

# ===========================================
# Daily Task Errors (DAILY_*)
# ===========================================
const DAILY_TASK_NOT_FOUND: String = "DAILY_TASK_NOT_FOUND"
const DAILY_ALREADY_ACCEPTED: String = "DAILY_ALREADY_ACCEPTED"
const DAILY_INVALID_PROGRESS: String = "DAILY_INVALID_PROGRESS"
const DAILY_NOT_COMPLETED: String = "DAILY_NOT_COMPLETED"

# ===========================================
# Treasure Errors (TREASURE_*)
# ===========================================
const TREASURE_NOT_FOUND: String = "TREASURE_NOT_FOUND"

# ===========================================
# Repair Errors (REPAIR_*)
# ===========================================
const REPAIR_INSUFFICIENT_FUNDS: String = "REPAIR_INSUFFICIENT_FUNDS"
const REPAIR_ITEM_NOT_FOUND: String = "REPAIR_ITEM_NOT_FOUND"
const REPAIR_ALREADY_FULL: String = "REPAIR_ALREADY_FULL"

# ===========================================
# Breeding Errors (BREED_*)
# ===========================================
const BREED_PARENTS_NOT_FOUND: String = "BREED_PARENTS_NOT_FOUND"
const BREED_UNAUTHORIZED: String = "BREED_UNAUTHORIZED"
const BREED_OFFSPRING_LIMIT: String = "BREED_OFFSPRING_LIMIT"
const BREED_WRONG_GENDER: String = "BREED_WRONG_GENDER"
const BREED_INVALID_PARENTS: String = "BREED_INVALID_PARENTS"

# ===========================================
# Hero Auction Errors (AUCTION_*)
# ===========================================
const AUCTION_LISTING_NOT_FOUND: String = "AUCTION_LISTING_NOT_FOUND"
const AUCTION_OWN_HERO: String = "AUCTION_OWN_HERO"
const AUCTION_ORDER_NOT_FOUND: String = "AUCTION_ORDER_NOT_FOUND"
const AUCTION_ORDER_NOT_YOURS: String = "AUCTION_ORDER_NOT_YOURS"
const AUCTION_ORDER_CLOSED: String = "AUCTION_ORDER_CLOSED"

# ===========================================
# Mastery Extraction Errors (MASTERY_*)
# ===========================================
const MASTERY_HERO_NOT_FOUND: String = "MASTERY_HERO_NOT_FOUND"
const MASTERY_LEVEL_TOO_LOW: String = "MASTERY_LEVEL_TOO_LOW"
const MASTERY_UNAUTHORIZED: String = "MASTERY_UNAUTHORIZED"

# ===========================================
# Escort Errors (ESCORT_*)
# ===========================================
const ESCORT_ALREADY_ACTIVE: String = "ESCORT_ALREADY_ACTIVE"
const ESCORT_USER_NOT_FOUND: String = "ESCORT_USER_NOT_FOUND"

# ===========================================
# Wagon/Hauling Errors (WAGON_*)
# ===========================================
const WAGON_INVALID_TIER: String = "WAGON_INVALID_TIER"
const WAGON_ALREADY_ACTIVE: String = "WAGON_ALREADY_ACTIVE"
const WAGON_NOT_AT_ORIGIN: String = "WAGON_NOT_AT_ORIGIN"
const WAGON_NOT_FOUND: String = "WAGON_NOT_FOUND"
const WAGON_NOT_LOADING: String = "WAGON_NOT_LOADING"
const WAGON_FULL: String = "WAGON_FULL"
const WAGON_CARGO_NOT_FOUND: String = "WAGON_CARGO_NOT_FOUND"
const WAGON_PERSONAL_INVENTORY_FULL: String = "WAGON_PERSONAL_INVENTORY_FULL"

# ===========================================
# Mana Charging Errors (MANA_*)
# ===========================================
const MANA_INTENSITY_LOW: String = "MANA_INTENSITY_LOW"
const MANA_ITEM_NOT_FOUND: String = "MANA_ITEM_NOT_FOUND"
const MANA_CANNOT_CHARGE: String = "MANA_CANNOT_CHARGE"
const MANA_TEMPLATE_MISSING: String = "MANA_TEMPLATE_MISSING"

# ===========================================
# Event Errors (EVENT_*)
# ===========================================
const EVENT_TEMPLATE_NOT_FOUND: String = "EVENT_TEMPLATE_NOT_FOUND"

# ===========================================
# Replay Errors (REPLAY_*)
# ===========================================
const REPLAY_NOT_FOUND: String = "REPLAY_NOT_FOUND"

# ===========================================
# Leaderboard Errors (LEADERBOARD_*)
# ===========================================
const LEADERBOARD_INVALID_CATEGORY: String = "LEADERBOARD_INVALID_CATEGORY"

# ===========================================
# Building Errors (BUILDING_*)
# ===========================================
const BUILDING_RECIPE_NOT_FOUND: String = "BUILDING_RECIPE_NOT_FOUND"
const BUILDING_FACILITY_MISSING: String = "BUILDING_FACILITY_MISSING"

# ===========================================
# Stat Errors (STAT_*)
# ===========================================
const STAT_HERO_NOT_FOUND: String = "STAT_HERO_NOT_FOUND"
const STAT_INSUFFICIENT_POINTS: String = "STAT_INSUFFICIENT_POINTS"
const STAT_CAP_EXCEEDED: String = "STAT_CAP_EXCEEDED"

# ===========================================
# Economy Errors (ECONOMY_*)
# ===========================================
const ECONOMY_INSUFFICIENT_TOTAL: String = "ECONOMY_INSUFFICIENT_TOTAL"

# ===========================================
# Promotion Errors (PROMOTION_*)
# ===========================================
const PROMO_LEVEL_REQUIREMENT: String = "PROMO_LEVEL_REQUIREMENT"
const PROMO_INVALID_CLASS: String = "PROMO_INVALID_CLASS"
const PROMO_WRONG_BRANCH: String = "PROMO_WRONG_BRANCH"
const PROMOTION_TARGET_CLASS_NOT_FOUND: String = "PROMOTION_TARGET_CLASS_NOT_FOUND"

# ===========================================
# Asset Errors (ASSET_*)
# ===========================================
const ASSET_NOT_FOUND: String = "ASSET_NOT_FOUND"

# ===========================================
# Generic Errors (GENERIC_*)
# ===========================================
const GENERIC_NOT_IMPLEMENTED: String = "GENERIC_NOT_IMPLEMENTED"
const GENERIC_INVALID_INPUT: String = "GENERIC_INVALID_INPUT"

# ===========================================
# Network Errors (NETWORK_*)
# Client-side only - for connection/protocol errors
# ===========================================
const NETWORK_CONNECTION_ERROR: String = "NETWORK_CONNECTION_ERROR"
const NETWORK_INVALID_RESPONSE: String = "NETWORK_INVALID_RESPONSE"
const NETWORK_TIMEOUT: String = "NETWORK_TIMEOUT"
const NETWORK_UNKNOWN_ERROR: String = "NETWORK_UNKNOWN_ERROR"


# ===========================================
# Error Messages Dictionary
# ===========================================
const ERROR_MESSAGES: Dictionary = {
    # Authentication
    AUTH_INVALID_CREDENTIALS: "Invalid username or password",
    AUTH_USER_NOT_FOUND: "User account does not exist",
    AUTH_SESSION_EXPIRED: "Your session has expired. Please log in again.",
    AUTH_UNAUTHORIZED: "Authentication required",
    AUTH_FORBIDDEN: "You do not have permission for this action",
    
    # User
    USER_NOT_FOUND: "User not found",
    USER_INVALID_ID: "Invalid user ID format",
    USER_BUSY: "You have active tasks in progress",
    USER_UNCONSCIOUS: "You are unconscious",
    USER_IN_RECOVERY: "You are in recovery period",
    
    # Hero
    HERO_NOT_FOUND: "Hero not found",
    HERO_INVALID_ID: "Invalid hero ID format",
    HERO_UNAUTHORIZED: "You do not own this hero",
    HERO_BUSY: "Hero has an active task",
    HERO_DEAD: "Hero is dead",
    HERO_LOW_LEVEL: "Hero level is too low",
    HERO_WRONG_CLASS: "Hero class is incompatible",
    HERO_ALREADY_SPECIALIZED: "Hero already has a profession",
    HERO_NO_JOB: "Hero has no job assigned",
    HERO_OFFSPRING_LIMIT: "Hero already has offspring",
    HERO_NOT_IN_FORMATION: "Hero is not in formation",
    HERO_LISTED_MARKET: "Hero is listed on the market",
    
    # Energy
    ENERGY_INSUFFICIENT: "Not enough energy",
    ENERGY_ZERO: "Energy is completely depleted",
    
    # Inventory
    INVENTORY_FULL: "Inventory is full",
    INVENTORY_ITEM_NOT_FOUND: "Item not found in inventory",
    INVENTORY_ITEM_EQUIPPED: "Item is currently equipped",
    INVENTORY_ITEM_LOCKED: "Item is locked by another system",
    INVENTORY_ITEM_STOLEN: "Item is marked as stolen",
    INVENTORY_WRONG_TYPE: "Item type mismatch",
    
    # Equipment
    EQUIP_INVALID_SLOT: "Invalid equipment slot",
    EQUIP_WRONG_SLOT: "Item cannot go in this slot",
    EQUIP_LEVEL_REQUIREMENT: "Hero level too low for this item",
    EQUIP_CLASS_REQUIREMENT: "Hero class cannot use this item",
    EQUIP_ALREADY_EQUIPPED: "Slot already has an item",
    EQUIP_SLOT_EMPTY: "No item in slot",
    EQUIP_ITEM_LISTED: "Item is listed on market",
    
    # Travel
    TRAVEL_NO_PATH: "No direct path to destination",
    TRAVEL_UNCONSCIOUS: "Cannot travel while unconscious",
    TRAVEL_IN_RECOVERY: "Cannot travel during recovery",
    TRAVEL_BUSY: "Cannot travel with active tasks",
    TRAVEL_BLACK_ZONE_MIN_UNITS: "Need 30+ heroes for Black Zone",
    TRAVEL_ENERGY_COST: "Not enough energy for travel",
    TRAVEL_ALREADY_THERE: "Already at destination",
    TRAVEL_INVALID_REGION: "Region does not exist",
    
    # Tavern
    TAVERN_NOT_IN_TAVERN: "Must be inside tavern",
    TAVERN_NO_INN: "Region has no inn",
    TAVERN_DAILY_LIMIT: "Daily tavern time exhausted",
    TAVERN_MERCENARY_GONE: "Mercenary no longer available",
    TAVERN_INSUFFICIENT_FUNDS: "Not enough gold/silver",
    TAVERN_BUSY: "Cannot use tavern while busy",
    TAVERN_FAST_TRAVEL_COOLDOWN: "Fast travel on cooldown",
    TAVERN_FAST_TRAVEL_WRONG_ZONE: "Must be in Royal City",
    
    # Market
    MARKET_NOT_IN_TOWN: "Must be in town for market",
    MARKET_LISTING_NOT_FOUND: "Listing no longer exists",
    MARKET_INSUFFICIENT_FUNDS: "Not enough gold/silver",
    MARKET_ITEM_EQUIPPED: "Cannot sell equipped items",
    MARKET_PRICE_TOO_LOW: "Price below minimum",
    MARKET_BUSY: "Cannot use market while busy",
    
    # Formation
    FORMATION_MAX_UNITS: "Exceeded 2500 unit limit",
    FORMATION_INVALID_POSITION: "Position outside valid grid",
    FORMATION_OVERLAP: "Position already occupied",
    FORMATION_HERO_DUPLICATE: "Hero already in formation",
    FORMATION_HERO_NOT_OWNED: "Hero belongs to another user",
    FORMATION_HERO_LISTED: "Cannot add listed hero",
    FORMATION_SWAP_FAILED: "Swap failed - heroes not in formation",
    
    # Combat
    COMBAT_NO_ACTIVE_BATTLE: "No active battle found",
    COMBAT_HERO_NOT_IN_BATTLE: "Hero not participating",
    COMBAT_HERO_DEAD: "Hero is dead",
    COMBAT_POTION_COOLDOWN: "Potion on cooldown",
    COMBAT_NO_POTIONS: "No potions in inventory",
    COMBAT_NO_POTIONS_REMAINING: "Potion charges depleted",
    COMBAT_PVP_NOT_ALLOWED: "PvP disabled in this zone",
    COMBAT_NO_FORMATION: "No formation preset found",
    COMBAT_MONSTER_NOT_FOUND: "Monster does not exist",
    COMBAT_MONSTER_UNAVAILABLE: "Monster not in this region",
    COMBAT_BUSY: "Cannot start battle while busy",
    
    # Consumable
    CONSUMABLE_ITEM_NOT_FOUND: "Item not in inventory",
    CONSUMABLE_NOT_CONSUMABLE: "Item cannot be consumed",
    CONSUMABLE_NO_EFFECT: "Item has no defined effect",
    CONSUMABLE_NO_HERO_SELECTED: "Must select target hero",
    CONSUMABLE_INVALID_STAT: "Invalid stat key",
    CONSUMABLE_BLACK_ZONE_RESTRICTION: "Cannot use in Black Zone",
    
    # Crafting
    CRAFT_NOT_IN_TOWN: "Complex crafting requires town",
    CRAFT_RECIPE_NOT_FOUND: "Recipe does not exist",
    CRAFT_MISSING_MATERIAL: "Missing required materials",
    CRAFT_INVENTORY_FULL: "No space for crafted item",
    CRAFT_AFFIX_MISSING: "Missing affix material",
    CRAFT_BUSY: "Cannot craft while busy",
    CRAFT_SALVAGE_NO_ITEMS: "No items selected for salvage",
    CRAFT_SALVAGE_INVALID: "Items cannot be salvaged",
    
    # Gathering
    GATHER_RESOURCE_NOT_FOUND: "Resource not in this region",
    GATHER_WRONG_REGION: "Not in resource region",
    GATHER_INVENTORY_FULL: "No space for gathered items",
    GATHER_LOW_STRENGTH: "Strength below requirement",
    GATHER_WRONG_TOOL: "Missing required tool tier",
    GATHER_BUSY: "Hero has active task",
    GATHER_UNAUTHORIZED: "Hero not owned by user",
    
    # Quest
    QUEST_NOT_FOUND: "Quest does not exist",
    QUEST_LOW_REPUTATION: "Reputation below requirement",
    QUEST_USER_QUEST_NOT_FOUND: "Quest not started",
    QUEST_ALREADY_COMPLETED: "Quest already finished",
    QUEST_STAGE_INCOMPLETE: "Current stage not finished",
    QUEST_NO_ACTIVE_STAGE: "No active quest stage",
    QUEST_OBJECTIVE_INCOMPLETE: "Objective not met",
    QUEST_WRONG_REGION: "Not at target location",
    QUEST_KILLS_INSUFFICIENT: "Not enough kills",
    
    # Guild
    GUILD_NOT_IN_GUILD: "Not a guild member",
    GUILD_ALREADY_IN_GUILD: "Already in a guild",
    GUILD_NOT_FOUND: "Guild does not exist",
    GUILD_NAME_TAKEN: "Guild name already used",
    GUILD_INSUFFICIENT_FUNDS: "Not enough gold",
    GUILD_NO_PERMISSION: "Insufficient guild rank",
    GUILD_INVITE_INVALID: "Invite code invalid",
    GUILD_INVITE_EXPIRED: "Invite has expired",
    GUILD_TREASURY_INSUFFICIENT: "Not enough in treasury",
    
    # Territory
    TERRITORY_NOT_FOUND: "Territory does not exist",
    TERRITORY_NOT_CLAIMABLE: "Region cannot be claimed",
    TERRITORY_ALREADY_OWNED: "Already owned by your guild",
    TERRITORY_UNDER_SIEGE: "Territory already being sieged",
    TERRITORY_SIEGE_NOT_ACTIVE: "No active siege",
    
    # Property
    PROPERTY_NO_PLOTS: "No plots available in region",
    PROPERTY_INSUFFICIENT_FUNDS: "Not enough silver",
    PROPERTY_NOT_FOUND: "Property does not exist",
    PROPERTY_ACCESS_DENIED: "Property not owned by you",
    PROPERTY_MAX_TIER: "Already at maximum tier",
    
    # NPC
    NPC_NOT_FOUND: "NPC does not exist",
    NPC_NO_DIALOGUE: "NPC has nothing to say",
    NPC_FACTION_ENEMY: "NPC refuses to deal with enemy",
    NPC_INSUFFICIENT_FUNDS: "Not enough for service",
    NPC_SHOP_OUT_OF_STOCK: "Item out of stock",
    
    # Chat
    CHAT_EMPTY_MESSAGE: "Message cannot be empty",
    CHAT_TOO_LONG: "Message exceeds limit",
    CHAT_SPAM_DETECTED: "Sending messages too fast",
    
    # Mail
    MAIL_NOT_FOUND: "Mail does not exist",
    MAIL_ACCESS_DENIED: "Mail not addressed to you",
    MAIL_ALREADY_CLAIMED: "Attachments already claimed",
    
    # Inn
    INN_NO_INN: "Region has no inn",
    INN_INSUFFICIENT_FUNDS: "Not enough silver",
    INN_CANNOT_STORE_EQUIPPED: "Cannot store equipped items",
    
    # Gambling
    GAMBLE_INVALID_GUESS: "Guess must be 1-6",
    GAMBLE_INVALID_BET: "Bet must be positive",
    GAMBLE_NOT_IN_INN: "Can only gamble in inn",
    GAMBLE_INSUFFICIENT_FUNDS: "Not enough silver",
    
    # Faction
    FACTION_ALREADY_JOINED: "Already in a faction",
    FACTION_NOT_FOUND: "Faction does not exist",
    
    # Bounty
    BOUNTY_SELF_TARGET: "Cannot place bounty on yourself",
    BOUNTY_BELOW_MINIMUM: "Bounty below minimum amount",
    BOUNTY_INSUFFICIENT_FUNDS: "Not enough silver",
    
    # Siege
    SIEGE_NOT_ACTIVE: "No active siege",
    SIEGE_OWN_TERRITORY: "Cannot siege own territory",
    
    # Black Zone
    BLACKZONE_MIN_UNITS: "Need 30+ heroes to enter",
    BLACKZONE_POTION_BANNED: "Potions prohibited in Black Zone",
    BLACKZONE_DEATH_PENALTY: "Hero died in Black Zone",
    
    # Fast Travel
    FASTTRAVEL_NOT_IN_TAVERN: "Must be in tavern/inn",
    FASTTRAVEL_WRONG_ZONE: "Must start from Royal City",
    FASTTRAVEL_INVALID_DESTINATION: "Destination not a Royal City",
    FASTTRAVEL_ALREADY_THERE: "Already at destination",
    FASTTRAVEL_COOLDOWN: "Caravan not departed yet",
    FASTTRAVEL_INSUFFICIENT_FUNDS: "Not enough for ticket",
    
    # Rumor
    RUMOR_NOT_IN_INN: "Must be in inn to post",
    
    # Escort
    ESCORT_USER_NOT_FOUND: "User does not exist",
    
    # Mana
    MANA_INTENSITY_LOW: "Mana intensity below 1.5",
    MANA_ITEM_NOT_FOUND: "Item not in inventory",
    MANA_CANNOT_CHARGE: "Item cannot be charged here",
    
    # Stat
    STAT_HERO_NOT_FOUND: "Hero does not exist",
    STAT_INSUFFICIENT_POINTS: "Not enough stat points",
    STAT_CAP_EXCEEDED: "Stat at maximum value",
    
    # Promotion
    PROMO_LEVEL_REQUIREMENT: "Need Class Level 20",
    PROMO_INVALID_CLASS: "Target class not found",
    PROMO_WRONG_BRANCH: "Class not in evolution line",
    
    # Generic
    GENERIC_NOT_IMPLEMENTED: "Feature not implemented",
    GENERIC_INVALID_INPUT: "Invalid input parameters",
    
    # Network (client-side only)
    NETWORK_CONNECTION_ERROR: "Unable to connect to server",
    NETWORK_INVALID_RESPONSE: "Invalid response from server",
    NETWORK_TIMEOUT: "Connection timed out",
    NETWORK_UNKNOWN_ERROR: "An unknown network error occurred",
}


## Get user-friendly error message for an error code
## @param error_code: The error code string
## @return: User-friendly message or the code itself if not found
static func get_message(error_code: String) -> String:
    if ERROR_MESSAGES.has(error_code):
        return ERROR_MESSAGES[error_code]
    return error_code


## Check if error code is an authentication error
## @param error_code: The error code to check
## @return: True if authentication-related error
static func is_auth_error(error_code: String) -> bool:
    return error_code.begins_with("AUTH_")


## Check if error code indicates user/hero is busy
## @param error_code: The error code to check
## @return: True if busy-related error
static func is_busy_error(error_code: String) -> bool:
    return error_code.ends_with("_BUSY") or error_code == "USER_BUSY"


## Check if error code is related to insufficient funds
## @param error_code: The error code to check
## @return: True if funds-related error
static func is_funds_error(error_code: String) -> bool:
    return error_code.find("INSUFFICIENT") != -1 or error_code.find("FUNDS") != -1


## Check if error is recoverable (user can retry)
## @param error_code: The error code to check
## @return: True if error is recoverable
static func is_recoverable(error_code: String) -> bool:
    # Non-recoverable errors require user action
    var non_recoverable: Array = [
        AUTH_SESSION_EXPIRED,
        AUTH_FORBIDDEN,
        USER_UNCONSCIOUS,
        USER_IN_RECOVERY,
        HERO_DEAD,
        INVENTORY_ITEM_STOLEN,
    ]
    return not non_recoverable.has(error_code)
