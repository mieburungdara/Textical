# Textical Error Codes Registry

**Version:** 1.1.0  
**Last Updated:** 2026-02-15  
**Purpose:** Quick reference for error codes - look up the code to understand the problem without detailed error messages.

---

## How to Use This Document

When you encounter an error code in the system:
1. Find the code in the table below
2. Read the description and category
3. Follow the troubleshooting steps

---

## Error Code Naming Convention

```
MODULE_ENTITY_ACTION_STATUS
```

Example: `TRAVEL_USER_UNCONSCIOUS` = Travel module, User entity, unconscious state prevents action

---

## Quick Reference Table

| Code | Category | Description | Solution |
|------|----------|-------------|----------|
| `AUTH_INVALID_CREDENTIALS` | Authentication | Invalid username or password | Check credentials and try again |
| `AUTH_USER_NOT_FOUND` | Authentication | User does not exist | Register a new account |
| `AUTH_SESSION_EXPIRED` | Authentication | Session has expired | Re-login to the system |

---

## Authentication Errors (AUTH_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `AUTH_INVALID_CREDENTIALS` | Invalid username or password | Verify username and password are correct |
| `AUTH_USER_NOT_FOUND` | User account does not exist | Create a new account or check username spelling |
| `AUTH_SESSION_EXPIRED` | User session has timed out | Re-authenticate to continue |
| `AUTH_UNAUTHORIZED` | Missing or invalid authentication token | Include valid token in request header |
| `AUTH_FORBIDDEN` | Insufficient permissions for this action | Contact admin for required permissions |

---

## User Errors (USER_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `USER_NOT_FOUND` | User ID does not exist | Verify user ID is valid |
| `USER_INVALID_ID` | User ID format is invalid | Provide a valid integer user ID |
| `USER_BUSY` | User has active tasks in queue | Wait for current tasks to complete |
| `USER_UNCONSCIOUS` | User is knocked out | Wait for revival or recovery period |
| `USER_IN_RECOVERY` | User is in post-KO recovery window | Wait 1 minute for recovery to end |

---

## Hero Errors (HERO_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `HERO_NOT_FOUND` | Hero ID does not exist | Verify hero ID belongs to your account |
| `HERO_INVALID_ID` | Hero ID format is invalid | Provide a valid integer hero ID |
| `HERO_UNAUTHORIZED` | Hero does not belong to user | Only use heroes you own |
| `HERO_BUSY` | Hero has active task | Wait for hero to finish current task |
| `HERO_DEAD` | Hero is dead | Revive hero before action |
| `HERO_LOW_LEVEL` | Hero level too low | Level up hero to meet requirement |
| `HERO_WRONG_CLASS` | Hero class incompatible | Use correct class for this action |
| `HERO_ALREADY_SPECIALIZED` | Hero already has a profession | Cannot reassign specialization |
| `HERO_NO_JOB` | Hero has no job assigned | Assign a job before work action |
| `HERO_OFFSPRING_LIMIT` | Hero already has offspring | Each hero limited to 1 offspring |
| `HERO_NOT_IN_FORMATION` | Hero not placed in formation | Add hero to formation first |
| `HERO_LISTED_MARKET` | Hero is listed on market | Remove listing before action |

---

## Energy Errors (ENERGY_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `ENERGY_INSUFFICIENT` | Not enough energy | Rest at tavern or use items |
| `ENERGY_ZERO` | Energy completely depleted | Must rest before any action |

---

## Inventory Errors (INVENTORY_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `INVENTORY_FULL` | No available slots | Sell, use, or store items |
| `INVENTORY_ITEM_NOT_FOUND` | Item not in inventory | Verify item ID and ownership |
| `INVENTORY_ITEM_EQUIPPED` | Item currently equipped | Unequip item first |
| `INVENTORY_ITEM_LOCKED` | Item is locked by another system | Remove from market/storage first |
| `INVENTORY_ITEM_STOLEN` | Item is marked as stolen | Sell to fence in bandit hideout |
| `INVENTORY_WRONG_TYPE` | Item type mismatch | Use correct item type |

---

## Equipment Errors (EQUIP_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `EQUIP_INVALID_SLOT` | Invalid equipment slot | Use valid slot: weapon, armor, accessory |
| `EQUIP_WRONG_SLOT` | Item cannot go in this slot | Check item's valid slots |
| `EQUIP_LEVEL_REQUIREMENT` | Hero level too low for item | Level up hero |
| `EQUIP_CLASS_REQUIREMENT` | Hero class cannot use item | Use appropriate class |
| `EQUIP_ALREADY_EQUIPPED` | Slot already has item | Unequip current item first |
| `EQUIP_SLOT_EMPTY` | No item in slot | Cannot unequip empty slot |
| `EQUIP_ITEM_LISTED` | Item is on market | Remove from market first |

---

## Travel Errors (TRAVEL_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `TRAVEL_NO_PATH` | No direct connection between regions | Find intermediate route |
| `TRAVEL_UNCONSCIOUS` | Cannot travel while knocked out | Wait for revival |
| `TRAVEL_IN_RECOVERY` | Cannot travel during recovery | Wait for recovery window to end |
| `TRAVEL_BUSY` | Cannot travel with active tasks | Complete current tasks first |
| `TRAVEL_BLACK_ZONE_MIN_UNITS` | Need 30+ heroes for Black Zone | Recruit more heroes |
| `TRAVEL_ENERGY_COST` | Not enough energy for travel | Restore energy first |
| `TRAVEL_ALREADY_THERE` | Already at destination | Choose different destination |
| `TRAVEL_INVALID_REGION` | Region does not exist | Select valid region ID |

---

## Tavern Errors (TAVERN_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `TAVERN_NOT_IN_TAVERN` | Must be inside tavern | Enter tavern first |
| `TAVERN_NO_INN` | Region has no inn | Travel to region with inn |
| `TAVERN_DAILY_LIMIT` | Daily tavern time exhausted | Return tomorrow |
| `TAVERN_MERCENARY_GONE` | Mercenary no longer available | Recruit different mercenary |
| `TAVERN_INSUFFICIENT_FUNDS` | Not enough gold/silver | Earn more currency |
| `TAVERN_BUSY` | Cannot recruit while busy | Finish current tasks |
| `TAVERN_FAST_TRAVEL_COOLDOWN` | Fast travel on cooldown | Wait for next caravan |
| `TAVERN_FAST_TRAVEL_WRONG_ZONE` | Must be in Royal City | Travel to Royal City first |

---

## Market Errors (MARKET_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `MARKET_NOT_IN_TOWN` | Must be in town for market | Travel to nearest town |
| `MARKET_LISTING_NOT_FOUND` | Listing no longer exists | Refresh market listings |
| `MARKET_LISTING_EXPIRED` | Listing has expired | Create new listing |
| `MARKET_LISTING_SOLD` | Item already sold | Find different item |
| `MARKET_OWN_ITEM` | Cannot buy your own listing | Select different item |
| `MARKET_INSUFFICIENT_FUNDS` | Not enough gold/silver | Add funds to purchase |
| `MARKET_ITEM_EQUIPPED` | Cannot sell equipped items | Unequip first |
| `MARKET_ITEM_STOLEN` | Stolen items need fence | Go to bandit hideout |
| `MARKET_PRICE_TOO_LOW` | Price below minimum | Set price at least 1 gold |
| `MARKET_BUSY` | Cannot use market while busy | Finish current tasks |
| `MARKET_ORDER_NOT_FOUND` | Order does not exist | Verify order ID |
| `MARKET_ORDER_NOT_YOURS` | Cannot cancel others orders | Only cancel your own |
| `MARKET_ORDER_CLOSED` | Order already closed | Cannot modify closed order |

---

## Formation Errors (FORMATION_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `FORMATION_MAX_UNITS` | Exceeded 2500 unit limit | Remove some heroes |
| `FORMATION_INVALID_POSITION` | Position outside valid grid | Use positions in rows 25-49 |
| `FORMATION_OVERLAP` | Position already occupied | Choose empty position |
| `FORMATION_HERO_DUPLICATE` | Hero already in formation | Each hero once only |
| `FORMATION_HERO_NOT_OWNED` | Hero belongs to another user | Use only your heroes |
| `FORMATION_HERO_LISTED` | Cannot add listed hero | Remove from market first |
| `FORMATION_SWAP_FAILED` | One or both heroes not in formation | Add heroes to formation first |

---

## Combat Errors (COMBAT_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `COMBAT_NO_ACTIVE_BATTLE` | Battle not found or ended | Start new battle |
| `COMBAT_HERO_NOT_IN_BATTLE` | Hero not participating | Add hero to formation |
| `COMBAT_HERO_DEAD` | Hero is dead | Cannot act while dead |
| `COMBAT_POTION_COOLDOWN` | Potion on cooldown | Wait for cooldown |
| `COMBAT_NO_POTIONS` | No potions in inventory | Purchase potions |
| `COMBAT_NO_POTIONS_REMAINING` | Potion charges depleted | Get more potions |
| `COMBAT_PVP_NOT_ALLOWED` | PvP disabled in this zone | Go to PvP-enabled zone |
| `COMBAT_NO_FORMATION` | No formation preset found | Create formation preset |
| `COMBAT_MONSTER_NOT_FOUND` | Monster does not exist | Select valid monster |
| `COMBAT_MONSTER_UNAVAILABLE` | Monster not in this region | Find monster in correct region |
| `COMBAT_BUSY` | Cannot start battle while busy | Finish current tasks |

---

## Consumable Errors (CONSUMABLE_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `CONSUMABLE_ITEM_NOT_FOUND` | Item not in inventory | Verify item exists |
| `CONSUMABLE_NOT_CONSUMABLE` | Item cannot be consumed | Use appropriate item |
| `CONSUMABLE_NO_EFFECT` | Item has no defined effect | Contact admin |
| `CONSUMABLE_NO_HERO_SELECTED` | Must select target hero | Choose a hero to apply |
| `CONSUMABLE_INVALID_STAT` | Invalid stat key | Use valid stat key |
| `CONSUMABLE_BUFF_DURATION_EXCEEDED` | Buff duration too long | Use shorter duration |
| `CONSUMABLE_BLACK_ZONE_RESTRICTION` | Cannot use in Black Zone | Leave Black Zone first |
| `CONSUMABLE_INVALID_INPUT` | Invalid input parameters | Check all required fields |

---

## Crafting Errors (CRAFT_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `CRAFT_NOT_IN_TOWN` | Complex crafting requires town | Go to town with forge/lab |
| `CRAFT_RECIPE_NOT_FOUND` | Recipe does not exist | Select valid recipe |
| `CRAFT_MISSING_MATERIAL` | Missing required materials | Gather or buy materials |
| `CRAFT_INVENTORY_FULL` | No space for crafted item | Free inventory space |
| `CRAFT_AFFIX_MISSING` | Missing affix material | Obtain required affix item |
| `CRAFT_BUSY` | Cannot craft while busy | Finish current tasks |
| `CRAFT_SALVAGE_NO_ITEMS` | No items selected for salvage | Select items to salvage |
| `CRAFT_SALVAGE_INVALID` | Items cannot be salvaged | Use valid salvageable items |

---

## Gathering Errors (GATHER_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `GATHER_RESOURCE_NOT_FOUND` | Resource not in this region | Find correct region |
| `GATHER_WRONG_REGION` | Not in resource region | Travel to resource location |
| `GATHER_INVENTORY_FULL` | No space for gathered items | Free inventory space |
| `GATHER_LOW_STRENGTH` | Strength below requirement | Increase STR stat |
| `GATHER_WRONG_TOOL` | Missing required tool tier | Equip better tool |
| `GATHER_BUSY` | Hero has active task | Wait for task completion |
| `GATHER_UNAUTHORIZED` | Hero not owned by user | Use your own hero |

---

## Quest Errors (QUEST_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `QUEST_NOT_FOUND` | Quest does not exist | Select valid quest |
| `QUEST_INVALID_TEMPLATE` | Quest template corrupted | Contact admin |
| `QUEST_LOW_REPUTATION` | Reputation below requirement | Increase faction reputation |
| `QUEST_USER_QUEST_NOT_FOUND` | Quest not started | Accept quest first |
| `QUEST_ALREADY_COMPLETED` | Quest already finished | Find new quest |
| `QUEST_STAGE_INCOMPLETE` | Current stage not finished | Complete stage objectives |
| `QUEST_NO_ACTIVE_STAGE` | No active quest stage | Progress quest first |
| `QUEST_OBJECTIVE_INCOMPLETE` | Objective not met | Complete objective |
| `QUEST_WRONG_REGION` | Not at target location | Travel to objective region |
| `QUEST_KILLS_INSUFFICIENT` | Not enough kills | Defeat more monsters |

---

## Guild Errors (GUILD_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `GUILD_NOT_IN_GUILD` | Not a guild member | Join a guild first |
| `GUILD_NOT_MEMBER` | User is not a member of this guild | Verify guild membership |
| `GUILD_ALREADY_IN_GUILD` | Already in a guild | Leave current guild first |
| `GUILD_ALREADY_MEMBER` | User is already a guild member | No action needed |
| `GUILD_NOT_FOUND` | Guild does not exist | Verify guild ID/name |
| `GUILD_NAME_TAKEN` | Guild name already used | Choose different name |
| `GUILD_INVALID_TEMPLATE` | Invalid guild template | Select valid template |
| `GUILD_INSUFFICIENT_FUNDS` | Not enough gold | Earn more gold |
| `GUILD_NOT_ENOUGH_HEROES` | Below minimum hero count | Recruit more heroes |
| `GUILD_NO_PERMISSION` | Insufficient guild rank | Need OFFICER or MASTER rank |
| `GUILD_MASTER_LEAVE` | Master cannot leave directly | Transfer leadership first |
| `GUILD_CANNOT_KICK_MASTER` | Cannot kick guild master | Transfer leadership first |
| `GUILD_CANNOT_KICK_SELF` | Cannot kick yourself | Use leave instead |
| `GUILD_USER_NOT_MEMBER` | Target user not in guild | Verify user's guild membership |
| `GUILD_CANNOT_PROMOTE_MASTER` | Master cannot be promoted | Already at highest rank |
| `GUILD_INVALID_PROMOTION` | Cannot promote to same/higher rank | Use valid promotion target |
| `GUILD_CANNOT_DEMOTE_MASTER` | Master cannot be demoted | Transfer leadership first |
| `GUILD_CANNOT_DEMOTE_SELF` | Cannot demote yourself | Ask another officer |
| `GUILD_CANNOT_DEMOTE_RECRUIT` | Cannot demote below recruit | Already at lowest rank |
| `GUILD_MIN_RANK_REACHED` | Cannot demote below recruit | Already at lowest rank |
| `GUILD_MASTER_ONLY` | Only guild master can do this | Contact guild master |
| `GUILD_OFFICER_ONLY` | Only officers can do this | Need OFFICER+ rank |
| `GUILD_ALREADY_MASTER` | User is already guild master | No action needed |
| `GUILD_INVITE_INVALID` | Invite code invalid | Get new invite code |
| `GUILD_INVITE_EXPIRED` | Invite has expired | Request new invite |
| `GUILD_INVITE_NOT_PENDING` | Invite already used/cancelled | Get new invite |
| `GUILD_INVITE_NOT_YOURS` | Cannot cancel others invites | Only cancel your invites |
| `GUILD_INVITE_NOT_FOUND` | Invite does not exist | Request new invite |
| `GUILD_TREASURY_INSUFFICIENT` | Not enough in treasury | Deposit more gold |
| `GUILD_ONLY_MASTER` | Only guild master can do this | Contact guild master |
| `GUILD_ONLY_OFFICER` | Only officers can do this | Need OFFICER+ rank |
| `GUILD_FACILITY_EXISTS` | Facility already built | Upgrade existing facility |
| `GUILD_FACILITY_NOT_FOUND` | Facility does not exist | Verify facility ID |
| `GUILD_FACILITY_NOT_YOURS` | Facility belongs to another guild | Use your own guild facilities |
| `GUILD_INVALID_FACILITY` | Invalid facility template | Select valid facility |
| `GUILD_AMOUNT_POSITIVE` | Amount must be positive | Enter amount greater than 0 |

---

## Territory Errors (TERRITORY_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `TERRITORY_NOT_FOUND` | Territory does not exist | Select valid territory |
| `TERRITORY_NOT_CLAIMABLE` | Region cannot be claimed | Find claimable territory |
| `TERRITORY_ALREADY_OWNED` | Already owned by your guild | Choose different territory |
| `TERRITORY_UNDER_SIEGE` | Territory already being sieged | Wait or choose different target |
| `TERRITORY_SIEGE_NOT_ACTIVE` | No active siege | Start siege first |
| `TERRITORY_TAX_INVALID` | Tax rate must be 0-10% | Set valid tax rate |
| `TERRITORY_TAX_UNAUTHORIZED` | Only guild master can set tax | Contact guild master |
| `TERRITORY_SIEGE_COST` | Insufficient treasury for siege | Add gold to treasury |

---

## Property Errors (PROPERTY_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `PROPERTY_NO_PLOTS` | No plots available in region | Try different region |
| `PROPERTY_INSUFFICIENT_FUNDS` | Not enough silver | Earn more silver |
| `PROPERTY_NOT_FOUND` | Property does not exist | Verify property ID |
| `PROPERTY_ACCESS_DENIED` | Property not owned by you | Only modify your properties |
| `PROPERTY_MAX_TIER` | Already at maximum tier | Cannot upgrade further |
| `PROPERTY_NAME_INVALID` | Name too long or empty | Use 1-32 characters |
| `PROPERTY_MESSAGE_TOO_LONG` | Bulletin message too long | Max 140 characters |

---

## NPC Errors (NPC_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `NPC_NOT_FOUND` | NPC does not exist | Find valid NPC |
| `NPC_NO_DIALOGUE` | NPC has nothing to say | Try different NPC |
| `NPC_FACTION_ENEMY` | NPC refuses to deal with enemy | Improve faction reputation |
| `NPC_ACTION_UNSUPPORTED` | NPC cannot perform action | Try different action |
| `NPC_TELEPORT_INVALID` | NPC cannot teleport there | Choose valid destination |
| `NPC_TELEPORT_WRONG_ZONE` | Teleport only between Royal Cities | Go to Royal City |
| `NPC_INSUFFICIENT_FUNDS` | Not enough for service | Earn more silver |
| `NPC_SHOP_OUT_OF_STOCK` | Item out of stock | Wait for restock |
| `NPC_ITEM_NOT_AVAILABLE` | Item not sold here | Find different vendor |

---

## Chat Errors (CHAT_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `CHAT_EMPTY_MESSAGE` | Message cannot be empty | Enter message content |
| `CHAT_TOO_LONG` | Message exceeds limit | Keep under 500 characters |
| `CHAT_SPAM_DETECTED` | Sending messages too fast | Slow down messaging |

---

## Mail Errors (MAIL_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `MAIL_NOT_FOUND` | Mail does not exist | Verify mail ID |
| `MAIL_ACCESS_DENIED` | Mail not addressed to you | Check your own mail |
| `MAIL_ALREADY_CLAIMED` | Attachments already claimed | No items to claim |

---

## Inn Errors (INN_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `INN_NO_INN` | Region has no inn | Travel to region with inn |
| `INN_INSUFFICIENT_FUNDS` | Not enough silver | Earn more silver |
| `INN_CANNOT_STORE_EQUIPPED` | Cannot store equipped items | Unequip first |
| `INN_ITEM_NOT_IN_VAULT` | Item not in regional vault | Check correct vault |
| `INN_ITEM_NOT_IN_INVENTORY` | Item not in inventory | Verify item location |

---

## Gambling Errors (GAMBLE_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `GAMBLE_INVALID_GUESS` | Guess must be 1-6 | Enter valid number |
| `GAMBLE_INVALID_BET` | Bet must be positive | Enter valid bet amount |
| `GAMBLE_NOT_IN_INN` | Can only gamble in inn | Go to inn |
| `GAMBLE_INSUFFICIENT_FUNDS` | Not enough silver | Get more silver |

---

## Faction Errors (FACTION_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `FACTION_ALREADY_JOINED` | Already in a faction | Leave current faction first |
| `FACTION_NOT_FOUND` | Faction does not exist | Select valid faction |

---

## Bounty Errors (BOUNTY_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `BOUNTY_SELF_TARGET` | Cannot place bounty on yourself | Target another player |
| `BOUNTY_BELOW_MINIMUM` | Bounty below minimum amount | Minimum 100 silver |
| `BOUNTY_ISSUER_NOT_FOUND` | Issuer does not exist | Verify player ID |
| `BOUNTY_TARGET_NOT_FOUND` | Target does not exist | Verify target player |
| `BOUNTY_INSUFFICIENT_FUNDS` | Not enough silver | Get more silver |

---

## Siege Errors (SIEGE_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `SIEGE_NOT_ACTIVE` | No active siege | Start siege first |
| `SIEGE_OWN_TERRITORY` | Cannot siege own territory | Choose enemy territory |

---

## Event Errors (EVENT_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `EVENT_TEMPLATE_NOT_FOUND` | Event template missing | Contact admin |

---

## Stat Errors (STAT_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `STAT_HERO_NOT_FOUND` | Hero does not exist | Verify hero ID |
| `STAT_INSUFFICIENT_POINTS` | Not enough stat points | Level up to get points |
| `STAT_CAP_EXCEEDED` | Stat at maximum value | Allocate to different stat |

---

## Promotion Errors (PROMO_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `PROMO_LEVEL_REQUIREMENT` | Need Class Level 20 | Level up hero |
| `PROMO_INVALID_CLASS` | Target class not found | Select valid class |
| `PROMO_WRONG_BRANCH` | Class not in evolution line | Check class tree |

---

## Black Zone Errors (BLACKZONE_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `BLACKZONE_MIN_UNITS` | Need 30+ heroes to enter | Recruit more heroes |
| `BLACKZONE_POTION_BANNED` | Potions prohibited in Black Zone | No consumables allowed |
| `BLACKZONE_DEATH_PENALTY` | Hero died in Black Zone | Revive at town |

---

## Wagon/Hauling Errors (WAGON_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `WAGON_INVALID_TIER` | Invalid wagon tier | Select valid tier |
| `WAGON_ALREADY_ACTIVE` | Already have active wagon | Complete current haul |
| `WAGON_WRONG_LOCATION` | Must be at origin city | Travel to origin first |
| `WAGON_INSUFFICIENT_FUNDS` | Not enough silver | Get more silver |
| `WAGON_NOT_LOADING` | Wagon not in loading phase | Start loading first |
| `WAGON_FULL` | Wagon at capacity | Remove items or upgrade |
| `WAGON_NO_ACTIVE` | No active wagon | Rent a wagon first |
| `WAGON_ITEM_NOT_FOUND` | Cargo item not found | Verify item in wagon |
| `WAGON_INVENTORY_FULL` | Personal inventory full | Free inventory space |

---

## Mana Charging Errors (MANA_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `MANA_INTENSITY_LOW` | Mana intensity below 1.5 | Find higher intensity region |
| `MANA_ITEM_NOT_FOUND` | Item not in inventory | Verify item ownership |
| `MANA_CANNOT_CHARGE` | Item cannot be charged here | Find appropriate charging station |
| `MANA_TEMPLATE_MISSING` | Missing item template | Contact admin |

---

## Fast Travel Errors (FASTTRAVEL_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `FASTTRAVEL_NOT_IN_TAVERN` | Must be in tavern/inn | Enter tavern first |
| `FASTTRAVEL_WRONG_ZONE` | Must start from Royal City | Go to Royal City |
| `FASTTRAVEL_INVALID_DESTINATION` | Destination not a Royal City | Choose Royal City destination |
| `FASTTRAVEL_ALREADY_THERE` | Already at destination | Choose different city |
| `FASTTRAVEL_COOLDOWN` | Caravan not departed yet | Wait for cooldown |
| `FASTTRAVEL_INSUFFICIENT_FUNDS` | Not enough for ticket | Get more silver |

---

## Escort Errors (ESCORT_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `ESCORT_ALREADY_ACTIVE` | Already have active escort | Complete current escort |
| `ESCORT_USER_NOT_FOUND` | User does not exist | Verify user ID |

---

## Rumor Errors (RUMOR_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `RUMOR_TOO_SHORT` | Content under 10 characters | Write longer rumor |
| `RUMOR_NOT_IN_INN` | Must be in inn to post | Go to inn |
| `RUMOR_NOT_FOUND` | Rumor does not exist | Verify rumor ID |
| `RUMOR_INSUFFICIENT_FUNDS` | Not enough silver | Get more silver |
| `RUMOR_INVALID_PURCHASE` | Invalid purchase record | Contact admin |
| `RUMOR_ALREADY_RATED` | Already rated this rumor | Cannot rate twice |
| `RUMOR_RATING_INVALID` | Rating must be 1-5 | Enter valid rating |

---

## Daily Task Errors (DAILY_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `DAILY_TASK_NOT_FOUND` | Task does not exist | Verify task ID |
| `DAILY_ALREADY_ACCEPTED` | Task already accepted | Choose different task |
| `DAILY_INVALID_PROGRESS` | Progress record invalid | Contact admin |
| `DAILY_NOT_COMPLETED` | Task not finished yet | Complete task first |

---

## Treasure Errors (TREASURE_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `TREASURE_NOT_FOUND` | Treasure does not exist | Verify treasure location |

---

## Repair Errors (REPAIR_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `REPAIR_INSUFFICIENT_FUNDS` | Not enough for repairs | Get more silver |
| `REPAIR_ITEM_NOT_FOUND` | Item not in inventory | Verify item |
| `REPAIR_ALREADY_FULL` | Item at full durability | No repair needed |

---

## Breeding Errors (BREED_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `BREED_PARENTS_NOT_FOUND` | One or both parents missing | Verify hero IDs |
| `BREED_UNAUTHORIZED` | Do not own one or both parents | Use your own heroes |
| `BREED_OFFSPRING_LIMIT` | Parent already has offspring | Use different parents |
| `BREED_WRONG_GENDER` | Need male and female parents | Check parent genders |

---

## Hero Auction Errors (AUCTION_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `AUCTION_LISTING_NOT_FOUND` | Hero listing does not exist | Verify listing ID |
| `AUCTION_OWN_HERO` | Cannot buy your own hero | Choose different hero |
| `AUCTION_ORDER_NOT_FOUND` | Order does not exist | Verify order ID |
| `AUCTION_ORDER_NOT_YOURS` | Not your order | Can only cancel your orders |
| `AUCTION_ORDER_CLOSED` | Order already closed | Cannot modify |

---

## Mastery Extraction Errors (MASTERY_*)

| Code | Description | Troubleshooting |
|------|-------------|-----------------|
| `MASTERY_HERO_NOT_FOUND` | Hero does not exist | Verify hero ID |
| `MASTERY_LEVEL_TOO_LOW` | Need Class Level 30+ | Level up hero |
| `MASTERY_UNAUTHORIZED` | Hero not owned by you | Use your own hero |

---

## HTTP Status Code Reference

| Status | Meaning | Common Causes |
|--------|---------|---------------|
| 200 | Success | Request completed |
| 400 | Bad Request | Invalid input format |
| 401 | Unauthorized | Missing/invalid auth token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 422 | Unprocessable | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal error - contact admin |

---

## Error Response Format

All errors follow this JSON structure:

```json
{
  "success": false,
  "error": "ERROR_CODE_HERE",
  "message": "Human readable description"
}
```

---

## Implementation Notes

### For Developers

1. **Always use error codes from this registry** - Do not create new codes without documentation
2. **Error codes are uppercase with underscores** - Format: `MODULE_ENTITY_STATUS`
3. **Include error code in all error responses** - Both client and server
4. **Keep messages user-friendly** - Technical details in logs only

### Adding New Error Codes

1. Check if similar code exists
2. Follow naming convention: `MODULE_ENTITY_STATUS`
3. Add to this documentation
4. Add to centralized error constants file
5. Update affected service

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-02-15 | Implementation audit: Added missing codes (STAT_HERO_NOT_FOUND, SIEGE_OWN_TERRITORY, BLACKZONE_*, FASTTRAVEL_*, ESCORT_USER_NOT_FOUND, RUMOR_NOT_IN_INN, PROMO_*, MANA_* fixes). Created client ErrorCodes.gd. Refactored ConsumableConstants.js to use centralized codes. Added error validation to BaseNetworkHandler.gd. |
| 1.0.0 | 2026-02-15 | Initial error code registry |

---

## Related Documentation

- [API Documentation](./API.md)
- [Combat System](./COMBAT_SYSTEM.md)
- [Travel System](./TRAVEL_SYSTEM.md)
