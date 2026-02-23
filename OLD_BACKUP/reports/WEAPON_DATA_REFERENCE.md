# Weapon Data Reference - REVISED EDITION


## Weapon Database Schema Design

> **Note**: Weapons use a **relational database design** with proper IDs, foreign keys, and enums. No arrays or JSON fields.

### Entity Relationship Overview

```
WeaponRarity (1) ----< (N) WeaponTemplate
WeaponTier (1) ----< (N) WeaponTemplate
WeaponType (1) ----< (N) WeaponTemplate (1) ----< (N) WeaponTrait
WeaponTemplate (1) ----< (N) WeaponUniquePassive
```

### Prisma Schema (Relational, No JSON/Arrays)

```prisma
// ============================================
// ENUMS
// ============================================

enum WeaponRarity {
  COMMON
  UNCOMMON
  REFINED
  SUPERIOR
  RARE
  HEROIC
  EPIC
  RELIC
  ANCIENT
  MYTHIC
}

enum WeaponTierLevel {
  TIER_1
  TIER_2
  TIER_3
  TIER_4
  TIER_5
  TIER_6
  TIER_7
  TIER_8
  TIER_9
  TIER_10
}

enum WeaponCategory {
  MELEE
  RANGED
  MAGIC
  SHIELD
  UNARMED
}

enum HandType {
  ONE_HANDED
  TWO_HANDED
  HYBRID
}

enum DamageType {
  SLASH
  PIERCE
  BLUNT
  CHOP
  CRUSH
  STRIKE
  REND
  MAGIC
  DEFENSE
}

// ============================================
// WEAPON TAG ENUM
// ============================================

enum WeaponTag {
  // Damage Roles
  BURST_DPS       // High damage in short time
  DOT_SPECIALIST  // Damage over time / bleed focus
  SINGLE_TARGET   // Boss hunting
  AOE             // Multi-target damage
  SUSTAIN         // Heal/lifesteal/regen
  
  // Defense Roles
  TANK            // Defensive/survival
  DEFENSIVE       // Shield/ward/mitigation
  GLASS_CANNON    // High damage, low defense
  
  // Utility Roles
  CROWD_CONTROL   // CC/area denial
  ASSASSIN        // Stealth/backstab/critical
  HYBRID          // Mix damage types
  BUFFER          // Support/buff ally
  CASTER          // Magic damage/skill
  
  // Combat Styles
  MELEE
  RANGED
}
```

---

## Weapon Type ID Reference

| Type ID | Name | Display Name | Category | Hand Type | Damage Type | Primary Role |
|---------|------|--------------|----------|-----------|-------------|--------------|
| 1 | SWORD | Sword | MELEE | ONE_HANDED | SLASH | Balanced DPS |
| 2 | GREATSWORD | Greatsword | MELEE | TWO_HANDED | SLASH | AOE Cleave |
| 3 | AXE | Axe | MELEE | ONE_HANDED | CHOP | Executioner |
| 4 | BATTLE_AXE | Battle Axe | MELEE | TWO_HANDED | CHOP | Bleed DOT |
| 5 | MACE | Mace | MELEE | ONE_HANDED | BLUNT | Stun Lock |
| 6 | WAR_HAMMER | War Hammer | MELEE | TWO_HANDED | CRUSH | Armor Break |
| 7 | DAGGER | Dagger | MELEE | ONE_HANDED | PIERCE | Assassin |
| 8 | RAPIER | Rapier | MELEE | ONE_HANDED | PIERCE | Duelist |
| 9 | SPEAR | Spear | MELEE | TWO_HANDED | PIERCE | Frontliner |
| 10 | BOW | Bow | RANGED | TWO_HANDED | PIERCE | Precision |
| 11 | GREATBOW | Longbow/Greatbow | RANGED | TWO_HANDED | PIERCE | Sniper |
| 12 | CROSSBOW | Crossbow | RANGED | TWO_HANDED | PIERCE | Armor Break |
| 13 | THROWN | Thrown Weapons | RANGED | ONE_HANDED | PIERCE | Utility |
| 14 | WAND | Wand | MAGIC | ONE_HANDED | MAGIC | Burst Mage |
| 15 | ORB | Orb | MAGIC | ONE_HANDED | MAGIC | Battle Mage |
| 16 | TOME | Tome | MAGIC | TWO_HANDED | MAGIC | Nuker |
| 17 | STAFF | Staff | MAGIC | TWO_HANDED | MAGIC | Hybrid |
| 18 | SHIELD | Shield | SHIELD | ONE_HANDED | DEFENSE | Tank |
| 19 | TOWER_SHIELD | Tower Shield | SHIELD | TWO_HANDED | DEFENSE | Protector |
| 20 | BUCKLER | Buckler | SHIELD | ONE_HANDED | DEFENSE | Counter |
| 21 | GLOVES | Gloves | UNARMED | ONE_HANDED | STRIKE | Combo |
| 22 | BRASS_KNUCKLES | Brass Knuckles | UNARMED | ONE_HANDED | STRIKE | Brawler |
| 23 | CLAWS | Claws | UNARMED | ONE_HANDED | REND | Bleeder |
| 24 | KAGINAWA | Kaginawa/Grappling Hook | UNARMED | ONE_HANDED | PIERCE | Mobility |
| 25 | SCYTHE | Scythe | MELEE | TWO_HANDED | REND | Soul Reaper |
| 26 | CATALYST | Catalyst | MAGIC | ONE_HANDED | MAGIC | Glass Cannon |

---

## UNIQUE IDENTITY MATRIX

### Melee Weapons - Distinct Identity

| Weapon | Damage Type | Unique Mechanic | Primary Stat | Defense Stat | Special Role |
|--------|-------------|-----------------|--------------|--------------|--------------|
| **Sword** | SLASH | Critical Focus | ATK | Moderate DEF | Balanced combat, crit builds |
| **Greatsword** | SLASH | Cleave AOE | High ATK | No DEF | Mob clearing, area damage |
| **Axe** | CHOP | Execution | High ATK | Low DEF | Boss killer, finisher |
| **Battle Axe** | CHOP | Bleed DOT | High ATK | No DEF | DoT specialist, bleed build |
| **Mace** | BLUNT | Stun Lock | Moderate ATK | Moderate DEF | CC specialist, stunner |
| **War Hammer** | CRUSH | Armor Break | Extreme ATK | No DEF | Tank killer, armor shred |
| **Dagger** | PIERCE | Backstab | Low ATK | Negative DEF | Assassin, stealth crit |
| **Rapier** | PIERCE | Parry/Dodge | Moderate ATK | Evasion | 1v1 duelist, PvP |
| **Spear** | PIERCE | Reach/Crowd | Moderate ATK | Moderate DEF | Frontliner, area denial |
| **Scythe** | REND | Soul Harvest | High ATK | No DEF | DoT + sustain, life steal |

### Ranged Weapons - Distinct Identity

| Weapon | Damage Type | Unique Mechanic | Primary Stat | Range | Special Role |
|--------|-------------|-----------------|--------------|-------|--------------|
| **Bow** | PIERCE | Precision | High ATK | Medium | Consistent DPS |
| **Longbow** | PIERCE | Sniping | High ATK | Extreme | Sniper, crit at range |
| **Crossbow** | PIERCE | Armor Pierce | High ATK | Medium | Anti-armor, slow |
| **Thrown** | PIERCE | Ricochet | Moderate ATK | Short | AOE, utility |

### Magic Weapons - Distinct Identity

| Weapon | Damage Type | Unique Mechanic | MATK | MDEF | Special Role |
|--------|-------------|-----------------|------|------|--------------|
| **Wand** | MAGIC | Arcane Burst | Very High | Low | Burst mage |
| **Orb** | MAGIC | Ward/Shield | Moderate | Very High | Battle mage |
| **Tome** | MAGIC | Spell Nuke | Extreme | None | Nuker |
| **Staff** | MAGIC | Elemental | High | Moderate | Hybrid |
| **Catalyst** | MAGIC | Overcharge | Extreme | None | Glass cannon |

### Shield Weapons - Distinct Identity

| Weapon | Damage Type | Unique Mechanic | DEF | MDEF | Special Role |
|--------|-------------|-----------------|-----|------|--------------|
| **Shield** | DEFENSE | Block | High | High | Balanced tank |
| **Tower Shield** | DEFENSE | Fortress | Extreme | High | Main tank |
| **Buckler** | DEFENSE | Counter | Moderate | Low | Off-tank, dodge |

### Unarmed Weapons - Distinct Identity

| Weapon | Damage Type | Unique Mechanic | ATK | DEF | Special Role |
|--------|-------------|-----------------|-----|-----|--------------|
| **Gloves** | STRIKE | Combo Chain | Moderate | Moderate | Combo master |
| **Brass Knuckles** | STRIKE | Stun | High | Low | Brawler |
| **Claws** | REND | Bleed | High | Negative | DoT bleeder |
| **Kaginawa** | PIERCE | Pull/Grapple | Moderate | Low | Mobility |

---

## Weapon Type to Tag Mapping (REVISED)

> **CRITICAL**: Each weapon type now has EXCLUSIVE tags to prevent overlap.

| Weapon Type | Tag 1 | Tag 2 | Rationale (Distinct Identity) |
|-------------|-------|-------|-------------------------------|
| **Sword** | BURST_DPS | SINGLE_TARGET | Balanced DPS, crit build - versatile |
| **Greatsword** | AOE | BURST_DPS | Cleave focus, mob clearing - NOT single target |
| **Axe** | SINGLE_TARGET | ASSASSIN | Executioner, boss killer - finisher role |
| **Battle Axe** | DOT_SPECIALIST | BURST_DOS | Bleed DOT, crit bleed - DoT focus |
| **Mace** | CROWD_CONTROL | TANK | Stun lock, CC specialist |
| **War Hammer** | TANK | SINGLE_TARGET | Armor break, tank killer |
| **Dagger** | ASSASSIN | SINGLE_TARGET | Backstab, stealth crit |
| **Rapier** | SINGLE_TARGET | DEFENSIVE | 1v1 duelist, evasion tank |
| **Spear** | CROWD_CONTROL | AOE | Area denial, frontliner |
| **Bow** | SINGLE_TARGET | BURST_DPS | Precision, consistent DPS |
| **Longbow** | ASSASSIN | SINGLE_TARGET | Sniper, max range crit |
| **Crossbow** | TANK | CROWD_CONTROL | Armor break, slow effects |
| **Thrown** | AOE | UTILITY | Multi-target, reposition |
| **Wand** | BURST_DPS | CASTER | Burst mage, spell damage |
| **Orb** | DEFENSIVE | TANK | Battle mage, sustain |
| **Tome** | BURST_DPS | CASTER | Nuke, cooldown reduction |
| **Staff** | HYBRID | CASTER | Elementalist, hybrid |
| **Shield** | TANK | DEFENSIVE | Mitigation, support |
| **Tower Shield** | TANK | DEFENSIVE | Main tank, ally protect |
| **Buckler** | ASSASSIN | TANK | Counter, dodge tank |
| **Gloves** | BURST_DPS | ASSASSIN | Combo, fast attack |
| **Brass Knuckles** | CROWD_CONTROL | BURST_DPS | Stun lock, brawler |
| **Claws** | DOT_SPECIALIST | SUSTAIN | Bleed, lifesteal |
| **Kaginawa** | ASSASSIN | UTILITY | Mobility, pull |
| **Scythe** | DOT_SPECIALIST | SUSTAIN | Soul harvest, bleed |
| **Catalyst** | GLASS_CANNON | CASTER | Max damage, risky |

---

## Weapon Special Traits

> **REVISED**: Each legendary+ weapon now has thematic traits based on weapon identity, not random assignment.

### Trait Distribution by Weapon Identity

| Weapon Type | Common Traits | Legendary Traits |
|-------------|---------------|------------------|
| **Sword** | CRITICAL_FOCUS | DRAGON_SLAYER, DIVINE_BLESSING |
| **Greatsword** | SWEEP | GIANT_SLAYER, DEMON_BANE |
| **Axe** | EXECUTION | BEAST_SLAYER, DEMON_BANE |
| **Battle Axe** | BLEED | VOID_TOUCH, BEAST_SLAYER |
| **Mace** | STUN_LOCK | DIVINE_BLESSING, TEMPEST_CALL |
| **War Hammer** | SHATTER | GIANT_SLAYER, TEMPEST_CALL |
| **Dagger** | BACKSTAB | VOID_TOUCH, PHANTOM_STRIKE |
| **Rapier** | DUELIST | PHANTOM_STRIKE, DIVINE_BLESSING |
| **Spear** | PIERCE | BEAST_SLAYER, PHANTOM_STRIKE |
| **Scythe** | SOUL_HARVEST | VOID_TOUCH, PHANTOM_STRIKE |
| **Bow** | PRECISION | BEAST_SLAYER, DRAGON_SLAYER |
| **Longbow** | SNIPING | PHANTOM_STRIKE, ELEMENTAL_MASTERY |
| **Crossbow** | PIERCING | MECHANICAL_EXPERT, GIANT_SLAYER |
| **Thrown** | RICOCHET | VOID_TOUCH, PHANTOM_STRIKE |
| **Wand** | ARCANE_BURST | ELEMENTAL_MASTERY, VOID_TOUCH |
| **Orb** | WARD | DIVINE_BLESSING, ELEMENTAL_MASTERY |
| **Tome** | SPELL_NUKE | VOID_TOUCH, ELEMENTAL_MASTERY |
| **Staff** | ELEMENTAL | ELEMENTAL_MASTERY, DIVINE_BLESSING |
| **Catalyst** | OVERCHARGE | VOID_TOUCH, ELEMENTAL_MASTERY |
| **Shield** | BLOCK | DIVINE_BLESSING, VOID_TOUCH |
| **Tower Shield** | FORTRESS | GIANT_SLAYER, DIVINE_BLESSING |
| **Buckler** | COUNTER | PHANTOM_STRIKE, VOID_TOUCH |
| **Gloves** | COMBO | DIVINE_BLESSING, PHANTOM_STRIKE |
| **Brass Knuckles** | STUN | TEMPEST_CALL, DIVINE_BLESSING |
| **Claws** | BLEED | VOID_TOUCH, BEAST_SLAYER |
| **Kaginawa** | GRAPPLE | VOID_TOUCH, PHANTOM_STRIKE |

---

## Weapon Unique Passives (REVISED)

Each weapon type has **2 unique passive abilities** that define its playstyle. These are INHERENT to the weapon type and scale with the weapon.

### Melee Weapon Unique Passives (REVISED)

| Weapon Type | Unique Passive 1 | Unique Passive 2 |
|-------------|-----------------|-------------------|
| **Sword** | Precision Strike: +10% Critical Rate when attacking from side or rear | Blade Harmony: +5% damage for each consecutive hit (max 25%), resets after 3 turns without attacking |
| **Greatsword** | Cleave: Attacks hit all enemies in front arc (adjacent tiles), +10% damage per enemy hit (max +30%) | Momentum: +15% Attack Speed after killing an enemy, stacks 2x |
| **Axe** | Cleaving Power: +25% damage vs enemies below 50% HP, 15% chance to instant-kill non-boss enemies below 20% HP | Executioner: +30% Critical Damage against enemies below 30% HP |
| **Battle Axe** | Decapitate: +50% Critical Damage, 10% chance to cause Bleed (5% HP/turn, 3 turns) | Hemorrhage: Attacks apply Bleed, +25% damage to bleeding enemies |
| **Mace** | Impact: 20% chance to stun for 1 turn, 30% chance vs unarmored enemies | Skull Breaker: +40% damage against stunned enemies |
| **War Hammer** | Shatter Defense: Ignores 30% of target's DEF, 15% chance to reduce target's DEF by 20% for 3 turns | Crushing Blow: +35% damage against armored enemies, +10% per armor piece (max +30%) |
| **Dagger** | Backstab: +30% Critical Rate when attacking from rear, +50% Critical Damage on backstab attacks | Quick Strike: +15% Attack Speed, 10% chance to perform double attack |
| **Rapier** | Duelist's Pride: +25% damage jika hanya ada 1 target dalam 2 tile radius | Elegant Footwork: +15% dodge setelah menyerang, +10% evasion for each attack (max 30%), +5% counter attack |
| **Spear** | Piercing Thrust: Attacks hit 2 enemies in a line, 20% chance to pierce through (hit 3 enemies) | Phalanx: +15% DEF for each ally adjacent, +10% damage when adjacent to ally |
| **Scythe** | Soul Reap: Semua hit apply Bleed (4% HP/turn, 3 turns) | Death Harvest: Heal 5% HP jika target mati dalam 3 turn setelah apply bleed |

### Ranged Weapon Unique Passives (REVISED)

| Weapon Type | Unique Passive 1 | Unique Passive 2 |
|-------------|-----------------|-------------------|
| **Bow** | Eagle Eye: Attacks cannot be dodged (100% accuracy), +15% Critical Rate at max range | Rain of Arrows: 25% chance to fire an additional arrow at nearby enemy |
| **Longbow** | Sniping: +50% Critical Damage at max range, can attack over obstacles | Steady Hand: +10% accuracy for each turn not attacking (max 30%), +5% crit per stack |
| **Crossbow** | Armor Piercing: Ignores 30% of target's DEF, 20% chance to cause Slow for 2 turns | Heavy Bolt: +25% damage, -5% Attack Speed, +10% stun chance |
| **Thrown Weapons** | Ricochet: 30% chance to bounce to nearby enemy, can hit up to 3 enemies per throw | Volley: Can target up to 2 enemies simultaneously, +15% damage per target |

### Magic Weapon Unique Passives (REVISED)

| Weapon Type | Unique Passive 1 | Unique Passive 2 |
|-------------|-----------------|-------------------|
| **Wand** | Arcane Focus: +12% Critical Rate, +25% Mana regeneration | Mana Surge: 20% chance to not consume mana on spell cast, +10% spell damage |
| **Orb** | Arcane Ward: Creates shield equal to 15% of MATK after each attack, shield persists for 2 turns | Spell Shield: +20% Magic DEF, reflects 15% magic damage |
| **Tome** | Spell Amplification: +30% damage for all spells, -10% cooldown for all skills | Knowledge Power: +25% experience gain from combat |
| **Staff** | Elemental Mastery: Basic attacks inherit weapon's element, +20% damage effectiveness against weakness element | Channeling: +15% spell duration, +15% Mana efficiency |
| **Catalyst** | Overcharge: +35% skill damage, -15% mana regen | Arcane Amplification: +25% Critical Damage, -8% accuracy |

### Shield Weapon Unique Passives (REVISED)

| Weapon Type | Unique Passive 1 | Unique Passive 2 |
|-------------|-----------------|-------------------|
| **Shield** | Block: 25% chance to block incoming attacks, block reduces damage by 50%, +12% DEF when below 50% HP | Iron Will: +20% Magic DEF, -15% chance to be stunned |
| **Tower Shield** | Fortress: 35% chance to block incoming attacks, block reduces damage by 75%, protects adjacent allies (15% damage reduction) | Impenetrable: +30% DEF when adjacent to ally, -25% movement speed |
| **Buckler** | Counter: 20% chance to counterattack when blocking, +25% Counter Damage, enables counterattack reactions | Reflex: +12% Dodge, +7% Counter Attack Rate per successful block (max 25%) |

### Unarmed Weapon Unique Passives (REVISED)

| Weapon Type | Unique Passive 1 | Unique Passive 2 |
|-------------|-----------------|-------------------|
| **Gloves** | Flurry: 35% chance to perform extra attack, extra attack deals 50% damage | Combination: +7% damage for each different attack used in sequence (max 25%) |
| **Brass Knuckles** | Stun Punch: 30% chance to stun for 1 turn, 45% chance to stun when below 30% HP | Iron Fist: +18% damage, reduces incoming melee damage by 12% |
| **Claws** | Rending Claws: All attacks cause Bleed (4% HP/turn, 3 turns), +25% damage to Bleeding enemies | Predator: +30% damage when enemy has negative status, +12% lifesteal |
| **Kaginawa** | Pull: 35% chance to pull enemy toward you, pulled enemies cannot act for 1 turn | Grappling Hook: Can attack enemies 1 tile away, +25% Critical Rate on pulled enemies |

---

## Crafting Materials Legend

| Material Type | Source | Used For |
|---------------|--------|----------|
| **Iron Bar** | Smelting Iron Ore | Tier 1 Weapons |
| **Steel Bar** | Smelting Steel Ore | Tier 2 Weapons |
| **Mithril Bar** | Smelting Mithril Ore | Tier 3 Weapons |
| **Adamantite Bar** | Smelting Adamantite Ore | Tier 4-5 Weapons |
| **Ether-Bar** | Rare crafting | Tier 6 Weapons |
| **Oak Wood** | Logging | Tier 1 Weapons |
| **Yew Wood** | Logging | Tier 2-3 Weapons |
| **Ironwood** | Logging | Tier 3-4 Weapons |
| **Spirit Wood** | Logging | Tier 5 Weapons |
| **World-Tree Branch** | Rare logging | Tier 6 Weapons |
| **Leather** | Skinning | Handle/Wrap materials |
| **Monster Parts** | Hunting | Special additives |

---

## Weapon Tiers & Rarity (10 Levels)

### Rarity Enum Reference

| Rarity Enum | Display Name | Color | Stat Multiplier | Notes |
|-------------|--------------|-------|-----------------|-------|
| COMMON | Common | Gray (#888888) | 1.00x | Starting gear |
| UNCOMMON | Uncommon | Green (#00FF00) | 1.10x | Early game |
| REFINED | Refined | Light Green (#88FF00) | 1.20x | Crafted basics |
| SUPERIOR | Superior | Yellow-Green (#CCFF00) | 1.35x | Mid-tier |
| RARE | Rare | Blue (#0088FF) | 1.50x | Standard rare |
| HEROIC | Heroic | Cyan (#00FFFF) | 1.70x | Heroic tier |
| EPIC | Epic | Purple (#9900FF) | 2.00x | End-game rare |
| RELIC | Relic | Orange (#FF8800) | 2.40x | Relic tier |
| ANCIENT | Ancient | Gold (#FFD700) | 3.00x | Ancient power |
| MYTHIC | Mythic | Red (#FF0000) | 3.80x | Maximum tier |

### Tier Level Enum Reference

| Tier Enum | Level Range | Stat Multiplier | Notes |
|-----------|-------------|-----------------|-------|
| TIER_1 | 1-10 | 1.0x | Starting gear |
| TIER_2 | 11-20 | 1.2x | Basic progression |
| TIER_3 | 21-30 | 1.5x | Early mid-game |
| TIER_4 | 31-40 | 1.9x | Mid-game |
| TIER_5 | 41-50 | 2.4x | Late mid-game |
| TIER_6 | 51-60 | 3.0x | End-game starter |
| TIER_7 | 61-70 | 3.7x | High-end |
| TIER_8 | 71-80 | 4.5x | Elite tier |
| TIER_9 | 81-90 | 5.5x | Master tier |
| TIER_10 | 91-99 | 6.8x | Maximum power |

---

## Weapon Tables by Category (TIER 1-10)

### Melee Weapons - Distinct Identity Focus

#### Sword (One-Handed) - Balanced Combat

| Name | Tier | Level | Base ATK | Base DEF | Attack Ticks | Crafting Materials | Special Trait |
|------|------|-------|----------|----------|--------------|--------------------|---------------|
| Rusty Sword | 1 | 1 | 8 | 2 | 60 | 2 Iron Bar + 1 Oak Wood | - |
| Iron Sword | 1 | 5 | 15 | 3 | 60 | 5 Iron Bar + 2 Oak Wood | - |
| Steel Sword | 2 | 15 | 30 | 5 | 60 | 8 Steel Bar + 3 Yew Wood | - |
| Mithril Sword | 3 | 30 | 60 | 8 | 60 | 5 Mithril Bar + 3 Ironwood | - |
| Adamantite Sword | 4 | 45 | 100 | 12 | 60 | 5 Adamantite Bar + 3 Spirit Wood | - |
| Dragon Slayer | 5 | 60 | 180 | 18 | 60 | 8 Adamantite Bar + 2 Ether-Bar + 1 World-Tree Branch | DRAGON_SLAYER |
| Excalibur | 6 | 75 | 350 | 30 | 60 | 10 Ether-Bar + 3 World-Tree Branch + 5 Legendary Monster Parts | DEMON_BANE |
| Soul Breaker | 7 | 85 | 520 | 42 | 60 | 15 Ether-Bar + 5 World-Tree Branch + 10 Void Essence + 8 Legendary Parts | VOID_TOUCH |
| Godslayer | 8 | 90 | 720 | 55 | 60 | 20 Ether-Bar + 8 World-Tree Branch + 15 Divine Essence + 12 Legendary Parts | DIVINE_BLESSING |
| Eternal Champion | 9 | 95 | 980 | 70 | 60 | 25 Ether-Bar + 10 World-Tree Branch + 20 Divine Essence + 15 Legendary Parts | DRAGON_SLAYER |
| Primordial Edge | 10 | 99 | 1500 | 100 | 60 | 30 Ether-Bar + 12 World-Tree Branch + 25 Void Essence + 20 Legendary Parts | DUELIST |

#### Greatsword (Two-Handed) - AOE Cleave Focus

| Name | Tier | Level | Base ATK | Base DEF | Attack Ticks | Crafting Materials | Special Trait |
|------|------|-------|----------|----------|--------------|--------------------|---------------|
| Wooden Greatsword | 1 | 1 | 12 | 0 | 80 | 6 Oak Wood + 2 Leather | - |
| Iron Greatsword | 1 | 10 | 25 | 0 | 80 | 10 Iron Bar + 4 Oak Wood | - |
| Steel Greatsword | 2 | 20 | 50 | 0 | 80 | 15 Steel Bar + 6 Yew Wood | - |
| Mithril Greatsword | 3 | 35 | 95 | 0 | 80 | 8 Mithril Bar + 4 Ironwood | - |
| Adamantite Greatsword | 4 | 50 | 160 | 0 | 80 | 8 Adamantite Bar + 4 Spirit Wood | - |
| Deathbringer | 5 | 65 | 280 | 0 | 80 | 12 Adamantite Bar + 3 Ether-Bar + 2 World-Tree Branch | DEMON_BANE |
| World Ender | 6 | 80 | 500 | 0 | 80 | 15 Ether-Bar + 5 World-Tree Branch + 8 Legendary Monster Parts | GIANT_SLAYER |
| Void Reaper | 7 | 85 | 720 | 0 | 80 | 20 Ether-Bar + 8 World-Tree Branch + 10 Void Essence + 12 Legendary Parts | VOID_TOUCH |
| Chaos Bringer | 8 | 90 | 980 | 0 | 80 | 25 Ether-Bar + 10 World-Tree Branch + 15 Dark Essence + 15 Legendary Parts | DEMON_BANE |
| Titan Splitter | 9 | 95 | 1350 | 0 | 80 | 30 Ether-Bar + 12 World-Tree Branch + 20 Divine Essence + 18 Legendary Parts | GIANT_SLAYER |
| Primordial Cleaver | 10 | 99 | 2000 | 0 | 80 | 35 Ether-Bar + 15 World-Tree Branch + 25 Void Essence + 25 Legendary Parts | BEAST_SLAYER |

#### Axe (One-Handed) - Executioner/Boss Killer

| Name | Tier | Level | Base ATK | Base DEF | Attack Ticks | Crafting Materials | Special Trait |
|------|------|-------|----------|----------|--------------|--------------------|---------------|
| Stone Axe | 1 | 1 | 10 | 1 | 70 | 3 Stone + 2 Oak Wood | - |
| Iron Axe | 1 | 8 | 20 | 2 | 70 | 6 Iron Bar + 2 Oak Wood | - |
| Steel Axe | 2 | 18 | 40 | 3 | 70 | 10 Steel Bar + 4 Yew Wood | - |
| Mithril Axe | 3 | 32 | 75 | 5 | 70 | 6 Mithril Bar + 3 Ironwood | - |
| Adamantite Axe | 4 | 48 | 130 | 7 | 70 | 6 Adamantite Bar + 3 Spirit Wood | - |
| Doom Axe | 5 | 62 | 230 | 10 | 70 | 10 Adamantite Bar + 2 Ether-Bar + 2 World-Tree Branch | BEAST_SLAYER |
| Chaos Axe | 6 | 78 | 420 | 15 | 70 | 12 Ether-Bar + 4 World-Tree Branch + 6 Legendary Monster Parts | DEMON_BANE |
| Grim Reaper | 7 | 85 | 580 | 20 | 70 | 18 Ether-Bar + 6 World-Tree Branch + 8 Void Essence + 10 Legendary Parts | VOID_TOUCH |
| Annihilator | 8 | 90 | 780 | 25 | 70 | 22 Ether-Bar + 8 World-Tree Branch + 12 Dark Essence + 14 Legendary Parts | DEMON_BANE |
| World Cleaver | 9 | 95 | 1050 | 32 | 70 | 28 Ether-Bar + 10 World-Tree Branch + 18 Divine Essence + 18 Legendary Parts | GIANT_SLAYER |
| Primordial Ruin | 10 | 99 | 1600 | 45 | 70 | 32 Ether-Bar + 12 World-Tree Branch + 22 Void Essence + 22 Legendary Parts | BEAST_SLAYER |

#### Battle Axe (Two-Handed) - Bleed DOT Specialist

| Name | Tier | Level | Base ATK | Base DEF | Attack Ticks | Crafting Materials | Special Trait |
|------|------|-------|----------|----------|--------------|--------------------|---------------|
| Crude Battle Axe | 1 | 5 | 18 | 0 | 85 | 8 Iron Bar + 4 Oak Wood | - |
| Iron Battle Axe | 2 | 15 | 38 | 0 | 85 | 12 Iron Bar + 6 Oak Wood | - |
| Steel Battle Axe | 2 | 25 | 65 | 0 | 85 | 18 Steel Bar + 8 Yew Wood | - |
| Mithril Battle Axe | 3 | 40 | 110 | 0 | 85 | 10 Mithril Bar + 5 Ironwood | - |
| Adamantite Battle Axe | 4 | 55 | 185 | 0 | 85 | 10 Adamantite Bar + 5 Spirit Wood | - |
| Hellfire Axe | 5 | 70 | 320 | 0 | 85 | 15 Adamantite Bar + 4 Ether-Bar + 3 World-Tree Branch | GIANT_SLAYER |
| Apocalypse | 6 | 85 | 550 | 0 | 85 | 18 Ether-Bar + 6 World-Tree Branch + 10 Legendary Monster Parts | GIANT_SLAYER |
| Death Dealer | 7 | 88 | 720 | 0 | 85 | 22 Ether-Bar + 8 World-Tree Branch + 12 Void Essence + 14 Legendary Parts | VOID_TOUCH |
| Oblivion | 8 | 92 | 950 | 0 | 85 | 26 Ether-Bar + 10 World-Tree Branch + 16 Dark Essence + 18 Legendary Parts | DEMON_BANE |
| Armageddon | 9 | 96 | 1250 | 0 | 85 | 30 Ether-Bar + 12 World-Tree Branch + 20 Divine Essence + 22 Legendary Parts | GIANT_SLAYER |
| Primordial Havoc | 10 | 99 | 1800 | 0 | 85 | 35 Ether-Bar + 14 World-Tree Branch + 24 Void Essence + 25 Legendary Parts | BEAST_SLAYER |

#### Mace (One-Handed) - Stun Lock Specialist

| Name | Tier | Level | Base ATK | Base DEF | Attack Ticks | Crafting Materials | Special Trait |
|------|------|-------|----------|----------|--------------|--------------------|---------------|
| Wooden Club | 1 | 1 | 7 | 3 | 65 | 4 Oak Wood + 1 Leather | - |
| Iron Mace | 1 | 8 | 16 | 5 | 65 | 5 Iron Bar + 2 Oak Wood | - |
| Steel Mace | 2 | 18 | 32 | 8 | 65 | 8 Steel Bar + 3 Yew Wood | - |
| Mithril Mace | 3 | 33 | 60 | 12 | 65 | 5 Mithril Bar + 3 Ironwood | - |
| Adamantite Mace | 4 | 48 | 100 | 18 | 65 | 5 Adamantite Bar + 3 Spirit Wood | - |
| Justice Hammer | 5 | 63 | 175 | 25 | 65 | 8 Adamantite Bar + 2 Ether-Bar + 2 World-Tree Branch | DIVINE_BLESSING |
| Tribunal | 6 | 78 | 320 | 40 | 65 | 10 Ether-Bar + 3 World-Tree Branch + 5 Legendary Monster Parts | DIVINE_BLESSING |
| Condemner | 7 | 85 | 450 | 52 | 65 | 15 Ether-Bar + 5 World-Tree Branch + 8 Divine Essence + 10 Legendary Parts | DIVINE_BLESSING |
| Executioner's Call | 8 | 90 | 620 | 65 | 65 | 20 Ether-Bar + 8 World-Tree Branch + 12 Dark Essence + 14 Legendary Parts | TEMPEST_CALL |
| Divine Verdict | 9 | 95 | 850 | 80 | 65 | 25 Ether-Bar + 10 World-Tree Branch + 16 Divine Essence + 18 Legendary Parts | DIVINE_BLESSING |
| Primordial Judgment | 10 | 99 | 1300 | 100 | 65 | 30 Ether-Bar + 12 World-Tree Branch + 20 Lightning Essence + 22 Legendary Parts | TEMPEST_CALL |

#### War Hammer (Two-Handed) - Armor Break Specialist

| Name | Tier | Level | Base ATK | Base DEF | Attack Ticks | Crafting Materials | Special Trait |
|------|------|-------|----------|----------|--------------|--------------------|---------------|
| Stone Hammer | 1 | 8 | 22 | 0 | 90 | 10 Stone + 4 Oak Wood | - |
| Iron War Hammer | 2 | 18 | 45 | 0 | 90 | 15 Iron Bar + 6 Oak Wood | - |
| Steel War Hammer | 2 | 28 | 75 | 0 | 90 | 20 Steel Bar + 8 Yew Wood | - |
| Mithril War Hammer | 3 | 43 | 125 | 0 | 90 | 12 Mithril Bar + 5 Ironwood | - |
| Adamantite War Hammer | 4 | 58 | 210 | 0 | 90 | 12 Adamantite Bar + 5 Spirit Wood | - |
| Earthquake | 5 | 73 | 360 | 0 | 90 | 18 Adamantite Bar + 5 Ether-Bar + 3 World-Tree Branch | GIANT_SLAYER |
| Cataclysm | 6 | 88 | 600 | 0 | 90 | 20 Ether-Bar + 8 World-Tree Branch + 12 Legendary Monster Parts | GIANT_SLAYER |
| Apocalypse Now | 7 | 90 | 820 | 0 | 90 | 25 Ether-Bar + 10 World-Tree Branch + 14 Divine Essence + 16 Legendary Parts | DIVINE_BLESSING |
| Seismic Wrath | 8 | 93 | 1080 | 0 | 90 | 28 Ether-Bar + 12 World-Tree Branch + 18 Earth Essence + 20 Legendary Parts | TEMPEST_CALL |
| World Shaker | 9 | 96 | 1450 | 0 | 90 | 32 Ether-Bar + 14 World-Tree Branch + 22 Divine Essence + 24 Legendary Parts | GIANT_SLAYER |
| Primordial Tremor | 10 | 99 | 2100 | 0 | 90 | 38 Ether-Bar + 16 World-Tree Branch + 26 Earth Essence + 28 Legendary Parts | BEAST_SLAYER |

#### Dagger (One-Handed) - Assassin/Backstab

| Name | Tier | Level | Base ATK | Base DEF | Attack Ticks | Crafting Materials | Special Trait |
|------|------|-------|----------|----------|--------------|--------------------|---------------|
| Sharp Stone | 1 | 1 | 6 | 0 | 35 | 2 Stone + 1 Leather | - |
| Iron Dagger | 1 | 5 | 12 | -1 | 35 | 3 Iron Bar + 1 Oak Wood | - |
| Steel Dagger | 2 | 15 | 25 | -1 | 35 | 5 Steel Bar + 2 Yew Wood | - |
| Mithril Dagger | 3 | 28 | 50 | -2 | 35 | 3 Mithril Bar + 2 Ironwood | - |
| Adamantite Dagger | 4 | 42 | 85 | -3 | 35 | 3 Adamantite Bar + 2 Spirit Wood | - |
| Assassin's Blade | 5 | 57 | 150 | -4 | 35 | 5 Adamantite Bar + 1 Ether-Bar + 1 World-Tree Branch | VOID_TOUCH |
| Shadow Fang | 6 | 72 | 280 | -5 | 35 | 8 Ether-Bar + 2 World-Tree Branch + 3 Legendary Monster Parts | VOID_TOUCH |
| Night's Edge | 7 | 85 | 400 | -6 | 35 | 12 Ether-Bar + 4 World-Tree Branch + 6 Void Essence + 8 Legendary Parts | VOID_TOUCH |
| Death's Whisper | 8 | 90 | 560 | -7 | 35 | 16 Ether-Bar + 6 World-Tree Branch + 10 Dark Essence + 12 Legendary Parts | PHANTOM_STRIKE |
| Soul Reaver | 9 | 95 | 780 | -8 | 35 | 20 Ether-Bar + 8 World-Tree Branch + 14 Void Essence + 16 Legendary Parts | VOID_TOUCH |
| Primordial Sting | 10 | 99 | 1150 | -10 | 35 | 25 Ether-Bar + 10 World-Tree Branch + 18 Dark Essence + 20 Legendary Parts | PHANTOM_STRIKE |

#### Rapier (One-Handed) - Duelist/Evasion

| Name | Tier | Level | Base ATK | Base DEF | Attack Ticks | Crafting Materials | Special Trait |
|------|------|-------|----------|----------|--------------|--------------------|---------------|
| Iron Rapier | 1 | 8 | 18 | -2 | 45 | 5 Iron Bar + 2 Oak Wood + 1 Leather | - |
| Steel Rapier | 2 | 18 | 35 | -3 | 45 | 8 Steel Bar + 3 Yew Wood + 2 Leather | - |
| Mithril Rapier | 3 | 32 | 65 | -4 | 45 | 5 Mithril Bar + 3 Ironwood + 3 Leather | - |
| Adamantite Rapier | 4 | 48 | 110 | -5 | 45 | 5 Adamantite Bar + 3 Spirit Wood + 3 Leather | - |
| Duelist's Blade | 5 | 62 | 190 | -6 | 45 | 8 Adamantite Bar + 2 Ether-Bar + 3 World-Tree Branch + 5 Leather | DUELIST |
| Sovereign's Needle | 6 | 77 | 340 | -8 | 45 | 12 Ether-Bar + 4 World-Tree Branch + 8 Legendary Monster Parts + 5 Leather | DUELIST |
| Phantom Thrust | 7 | 85 | 480 | -10 | 45 | 15 Ether-Bar + 5 World-Tree Branch + 8 Void Essence + 10 Legendary Parts + 8 Leather | PHANTOM_STRIKE |
| King's Gambit | 8 | 90 | 650 | -12 | 45 | 20 Ether-Bar + 8 World-Tree Branch + 12 Dark Essence + 14 Legendary Parts + 10 Leather | DUELIST |
| Emperor's Justice | 9 | 95 | 880 | -15 | 45 | 25 Ether-Bar + 10 World-Tree Branch + 16 Divine Essence + 18 Legendary Parts + 12 Leather | PHANTOM_STRIKE |
| Primordial Precision | 10 | 99 | 1350 | -18 | 45 | 30 Ether-Bar + 12 World-Tree Branch + 20 Void Essence + 22 Legendary Parts + 15 Leather | DUELIST |

> **Rapier Design Rationale**: Rapier specializes in 1v1 combat with high evasion and dodge mechanics. It sacrifices defense for offense and mobility. The DUELIST trait provides bonus damage in single-target scenarios.

#### Spear (Two-Handed) - Frontliner/Area Denial

| Name | Tier | Level | Base ATK | Base DEF | Attack Ticks | Crafting Materials | Special Trait |
|------|------|-------|----------|----------|--------------|--------------------|---------------|
| Wooden Spear | 1 | 3 | 10 | 2 | 65 | 4 Oak Wood + 2 Leather | - |
| Iron Spear | 1 | 12 | 22 | 3 | 65 | 8 Iron Bar + 3 Oak Wood | - |
| Steel Spear | 2 | 22 | 42 | 5 | 65 | 12 Steel Bar + 5 Yew Wood | - |
| Mithril Spear | 3 | 36 | 80 | 7 | 65 | 8 Mithril Bar + 4 Ironwood | - |
| Adamantite Spear | 4 | 50 | 135 | 10 | 65 | 8 Adamantite Bar + 4 Spirit Wood | - |
| Trident of the Seas | 5 | 65 | 230 | 14 | 65 | 12 Adamantite Bar + 3 Ether-Bar + 2 World-Tree Branch | AQUATIC_HUNTER |
| Gae Bolg | 6 | 80 | 400 | 20 | 65 | 15 Ether-Bar + 5 World-Tree Branch + 8 Legendary Monster Parts | BEAST_SLAYER |
| Pandemonium | 7 | 85 | 560 | 28 | 65 | 20 Ether-Bar + 8 World-Tree Branch + 10 Void Essence + 12 Legendary Parts | VOID_TOUCH |
| Death's Horizon | 8 | 90 | 750 | 35 | 65 | 25 Ether-Bar + 10 World-Tree Branch + 15 Dark Essence + 16 Legendary Parts | PHANTOM_STRIKE |
| Omega Point | 9 | 95 | 1000 | 45 | 65 | 30 Ether-Bar + 12 World-Tree Branch + 20 Divine Essence + 20 Legendary Parts | BEAST_SLAYER |
| Primordial Lance | 10 | 99 | 1500 | 60 | 65 | 35 Ether-Bar + 14 World-Tree Branch + 25 Void Essence + 25 Legendary Parts | PHANTOM_STRIKE |

#### Scythe (Two-Handed) - Soul Reaper/DoT

| Name | Tier | Level | Base ATK | Base DEF | Attack Ticks | Crafting Materials | Special Trait |
|------|------|-------|----------|----------|--------------|--------------------|---------------|
| Bone Scythe | 1 | 5 | 12 | 0 | 75 | 6 Bone + 4 Oak Wood | - |
| Iron Scythe | 2 | 15 | 28 | 0 | 75 | 10 Iron Bar + 5 Oak Wood | - |
| Steel Scythe | 2 | 25 | 50 | 0 | 75 | 15 Steel Bar + 8 Yew Wood | - |
| Mithril Scythe | 3 | 38 | 85 | 0 | 75 | 10 Mithril Bar + 6 Ironwood | - |
| Adamantite Scythe | 4 | 52 | 140 | 0 | 75 | 10 Adamantite Bar + 6 Spirit Wood | - |
| Soul Reaper | 5 | 66 | 240 | 0 | 75 | 15 Adamantite Bar + 3 Ether-Bar + 3 World-Tree Branch + 5 Bone | VOID_TOUCH |
| Death's Touch | 6 | 81 | 420 | 0 | 75 | 18 Ether-Bar + 5 World-Tree Branch + 10 Legendary Monster Parts + 8 Dark Essence | VOID_TOUCH |
| Void Harvester | 7 | 85 | 580 | 0 | 75 | 22 Ether-Bar + 8 World-Tree Branch + 10 Void Essence + 14 Legendary Parts + 8 Dark Essence | VOID_TOUCH |
| Soul Obliterator | 8 | 90 | 780 | 0 | 75 | 26 Ether-Bar + 10 World-Tree Branch + 14 Dark Essence + 18 Legendary Parts + 12 Void Essence | VOID_TOUCH |
| Omega Reaper | 9 | 95 | 1050 | 0 | 75 | 30 Ether-Bar + 12 World-Tree Branch + 18 Divine Essence + 22 Legendary Parts + 16 Dark Essence | VOID_TOUCH |
| Primordial Harvestor | 10 | 99 | 1550 | 0 | 75 | 35 Ether-Bar + 14 World-Tree Branch + 22 Void Essence + 25 Legendary Parts + 20 Dark Essence | VOID_TOUCH |

---

## Ranged Weapons - Distinct Identity Focus

### Bow - Precision/Consistent DPS

| Name | Tier | Level | Base ATK | Base DEF | Attack Ticks | Crafting Materials | Special Trait |
|------|------|-------|----------|----------|--------------|--------------------|---------------|
| Shortbow | 1 | 1 | 9 | -1 | 60 | 3 Oak Wood + 2 Leather | - |
| Longbow | 1 | 10 | 20 | -2 | 60 | 6 Yew Wood + 3 Leather | - |
| Composite Bow | 2 | 20 | 38 | -3 | 60 | 10 Yew Wood + 5 Iron Bar + Leather | - |
| Mithril Bow | 3 | 34 | 70 | -4 | 60 | 6 Mithril Bar + 5 Ironwood + Leather | - |
| Adamantite Bow | 4 | 48 | 120 | -5 | 60 | 6 Adamantite Bar + 5 Spirit Wood + Leather | - |
| Bow of Artemis | 5 | 62 | 200 | -6 | 60 | 10 Adamantite Bar + 3 Ether-Bar + World-Tree Branch + Leather | BEAST_SLAYER |
| Celestial Bow | 6 | 77 | 360 | -8 | 60 | 12 Ether-Bar + 4 World-Tree Branch + 5 Legendary Monster Parts + Leather | DRAGON_SLAYER |
| Phantom Shot | 7 | 85 | 500 | -10 | 60 | 15 Ether-Bar + 6 World-Tree Branch + 8 Void Essence + 10 Legendary Parts + Leather | PHANTOM_STRIKE |
| Death's Bane | 8 | 90 | 680 | -12 | 60 | 20 Ether-Bar + 8 World-Tree Branch + 12 Dark Essence + 14 Legendary Parts + Leather | VOID_TOUCH |
| Artemis' Curse | 9 | 95 | 920 | -15 | 60 | 25 Ether-Bar + 10 World-Tree Branch + 16 Divine Essence + 18 Legendary Parts + Leather | BEAST_SLAYER |
| Primordial Aim | 10 | 99 | 1400 | -18 | 60 | 30 Ether-Bar + 12 World-Tree Branch + 20 Void Essence + 22 Legendary Parts + Leather | PHANTOM_STRIKE |

### Longbow/Greatbow - Sniper/Crit at Range

| Name | Tier | Level | Base ATK | Base DEF | Attack Ticks | Crafting Materials | Special Trait |
|------|------|-------|----------|----------|--------------|--------------------|---------------|
| Hunter's Bow | 1 | 8 | 18 | -2 | 80 | 5 Yew Wood + 3 Oak Wood | - |
| Greatbow | 2 | 18 | 35 | -3 | 80 | 10 Yew Wood + 5 Steel Bar | - |
| Warbow | 2 | 28 | 60 | -4 | 80 | 15 Yew Wood + 8 Steel Bar | - |
| Mithril Greatbow | 3 | 42 | 100 | -5 | 80 | 10 Mithril Bar + 8 Ironwood | - |
| Adamantite Greatbow | 4 | 56 | 170 | -6 | 80 | 10 Adamantite Bar + 8 Spirit Wood | - |
| Merlin's Bow | 5 | 70 | 290 | -8 | 80 | 15 Adamantite Bar + 5 Ether-Bar + 3 World-Tree Branch | ELEMENTAL_MASTERY |
| Star Shooter | 6 | 85 | 500 | -10 | 80 | 20 Ether-Bar + 6 World-Tree Branch + 10 Legendary Monster Parts | ELEMENTAL_MASTERY |
| Void Hunter | 7 | 88 | 680 | -12 | 80 | 22 Ether-Bar + 8 World-Tree Branch + 12 Void Essence + 14 Legendary Parts | VOID_TOUCH |
| Omega Bow | 8 | 92 | 900 | -15 | 80 | 26 Ether-Bar + 10 World-Tree Branch + 16 Dark Essence + 18 Legendary Parts | PHANTOM_STRIKE |
| Apollo's Glory | 9 | 96 | 1200 | -18 | 80 | 30 Ether-Bar + 12 World-Tree Branch + 20 Divine Essence + 22 Legendary Parts | ELEMENTAL_MASTERY |
| Primordial Wrath | 10 | 99 | 1700 | -22 | 80 | 35 Ether-Bar + 14 World-Tree Branch + 25 Void Essence + 25 Legendary Parts | PHANTOM_STRIKE |

> **Longbow vs Bow**: Longbow has lower defense but higher attack, designed for sniping with critical hits at maximum range. Bow is more balanced for consistent DPS.

### Crossbow - Armor Break/Slow

| Name | Tier | Level | Base ATK | Base DEF | Attack Ticks | Crafting Materials | Special Trait |
|------|------|-------|----------|----------|--------------|--------------------|---------------|
| Light Crossbow | 1 | 5 | 14 | 0 | 75 | 5 Iron Bar + 4 Oak Wood | - |
| Heavy Crossbow | 2 | 15 | 30 | 0 | 75 | 10 Steel Bar + 6 Yew Wood | - |
| Siege Crossbow | 2 | 25 | 55 | 0 | 75 | 15 Steel Bar + 8 Ironwood | - |
| Mithril Crossbow | 3 | 38 | 90 | 0 | 75 | 10 Mithril Bar + 6 Ironwood | - |
| Adamantite Crossbow | 4 | 52 | 150 | 0 | 75 | 10 Adamantite Bar + 6 Spirit Wood | - |
| Ballista | 5 | 66 | 260 | 0 | 75 | 15 Adamantite Bar + 4 Ether-Bar + 3 World-Tree Branch | MECHANICAL_EXPERT |
| Doom Harquebus | 6 | 81 | 450 | 0 | 75 | 20 Ether-Bar + 6 World-Tree Branch + 12 Legendary Monster Parts | MECHANICAL_EXPERT |
| Siege Engine | 7 | 85 | 620 | 0 | 75 | 22 Ether-Bar + 8 World-Tree Branch + 10 Void Essence + 14 Legendary Parts | VOID_TOUCH |
| Annihilation | 8 | 90 | 820 | 0 | 75 | 26 Ether-Bar + 10 World-Tree Branch + 14 Dark Essence + 18 Legendary Parts | MECHANICAL_EXPERT |
| Omega Payload | 9 | 95 | 1100 | 0 | 75 | 30 Ether-Bar + 12 World-Tree Branch + 18 Divine Essence + 22 Legendary Parts | GIANT_SLAYER |
| Primordial Cannon | 10 | 99 | 1600 | 0 | 75 | 35 Ether-Bar + 14 World-Tree Branch + 22 Void Essence + 25 Legendary Parts | MECHANICAL_EXPERT |

### Thrown Weapons - Utility/AOE

| Name | Tier | Level | Base ATK | Base DEF | Attack Ticks | Crafting Materials | Special Trait |
|------|------|-------|----------|----------|--------------|--------------------|---------------|
| Stone | 1 | 1 | 7 | 0 | 45 | 3 Stone | - |
| Throwing Knife | 1 | 8 | 14 | 0 | 45 | 5 Iron Bar | - |
| Javelin | 2 | 18 | 28 | 0 | 45 | 8 Steel Bar + 4 Yew Wood | - |
| Mithril Shuriken | 3 | 32 | 55 | 0 | 45 | 5 Mithril Bar + 3 Ironwood | - |
| Adamantite Javelin | 4 | 46 | 95 | 0 | 45 | 5 Adamantite Bar + 3 Spirit Wood | - |
| Death Stars | 5 | 60 | 165 | 0 | 45 | 8 Adamantite Bar + 2 Ether-Bar + 2 World-Tree Branch | VOID_TOUCH |
| Void Chakram | 6 | 75 | 300 | 0 | 45 | 10 Ether-Bar + 3 World-Tree Branch + 5 Legendary Monster Parts | VOID_TOUCH |
| Death Spiral | 7 | 85 | 420 | 0 | 45 | 15 Ether-Bar + 5 World-Tree Branch + 8 Void Essence + 10 Legendary Parts | VOID_TOUCH |
| Omega Disc | 8 | 90 | 580 | 0 | 45 | 20 Ether-Bar + 8 World-Tree Branch + 12 Dark Essence + 14 Legendary Parts | PHANTOM_STRIKE |
| Apocalypse Ring | 9 | 95 | 800 | 0 | 45 | 25 Ether-Bar + 10 World-Tree Branch + 16 Divine Essence + 18 Legendary Parts | VOID_TOUCH |
| Primordial Vortex | 10 | 99 | 1200 | 0 | 45 | 30 Ether-Bar + 12 World-Tree Branch + 20 Void Essence + 22 Legendary Parts | PHANTOM_STRIKE |

---

## Magic Weapons - Distinct Identity Focus

### Wand (One-Handed) - Burst Mage

| Name | Tier | Level | Base MATK | Base MDEF | Crafting Materials | Special Trait |
|------|------|-------|-----------|-----------|-------------------|---------------|
| Apprentice Wand | 1 | 1 | 10 | 2 | 2 Oak Wood + 1 Quartz Crystal | - |
| Sorcerer Wand | 1 | 10 | 22 | 4 | 5 Yew Wood + 3 Quartz Crystal | - |
| Battle Wand | 2 | 20 | 42 | 6 | 8 Yew Wood + 5 Mithril Bar + 3 Mana Essence | - |
| Mithril Wand | 3 | 34 | 75 | 10 | 5 Mithril Bar + 4 Ironwood + 5 Mana Essence | - |
| Adamantite Wand | 4 | 48 | 125 | 15 | 5 Adamantite Bar + 4 Spirit Wood + 8 Arcane Essence | - |
| Wizard's Staff | 5 | 62 | 210 | 22 | 8 Adamantite Bar + 2 Ether-Bar + 3 World-Tree Branch + 10 Arcane Essence | ELEMENTAL_MASTERY |
| Arcane Master | 6 | 77 | 380 | 35 | 10 Ether-Bar + 5 World-Tree Branch + 15 Arcane Essence + 5 Legendary Monster Parts | ELEMENTAL_MASTERY |
| Nether Conduit | 7 | 85 | 520 | 48 | 15 Ether-Bar + 6 World-Tree Branch + 12 Void Essence + 10 Legendary Parts + 8 Dark Essence | VOID_TOUCH |
| Void Scepter | 8 | 90 | 700 | 62 | 20 Ether-Bar + 8 World-Tree Branch + 16 Dark Essence + 14 Legendary Parts + 10 Arcane Essence | VOID_TOUCH |
| Omega Catalyst | 9 | 95 | 950 | 80 | 25 Ether-Bar + 10 World-Tree Branch + 20 Divine Essence + 18 Legendary Parts + 15 Arcane Essence | ELEMENTAL_MASTERY |
| Primordial Spark | 10 | 99 | 1450 | 100 | 30 Ether-Bar + 12 World-Tree Branch + 25 Void Essence + 22 Legendary Parts + 20 Arcane Essence | PHANTOM_STRIKE |

### Orb (One-Handed) - Battle Mage/Defensive

| Name | Tier | Level | Base MATK | Base MDEF | Crafting Materials | Special Trait |
|------|------|-------|-----------|-----------|-------------------|---------------|
| Crystal Orb | 1 | 5 | 12 | 4 | 5 Quartz Crystal + 2 Silver Bar | - |
| Enchanted Orb | 2 | 15 | 28 | 8 | 8 Quartz Crystal + 5 Mithril Bar + 3 Mana Essence | - |
| Sorcerer's Orb | 2 | 25 | 50 | 12 | 12 Quartz Crystal + 8 Mithril Bar + 5 Mana Essence | - |
| Mithril Orb | 3 | 38 | 85 | 18 | 8 Mithril Bar + 5 Ironwood + 8 Arcane Essence | - |
| Adamantite Orb | 4 | 52 | 140 | 25 | 8 Adamantite Bar + 5 Spirit Wood + 12 Arcane Essence | - |
| Guardian Orb | 5 | 66 | 240 | 35 | 12 Adamantite Bar + 3 Ether-Bar + 4 World-Tree Branch + 15 Arcane Essence | DIVINE_BLESSING |
| Aegis Orb | 6 | 81 | 420 | 50 | 15 Ether-Bar + 6 World-Tree Branch + 20 Arcane Essence + 8 Legendary Monster Parts | DIVINE_BLESSING |
| Soul Guardian | 7 | 85 | 580 | 68 | 18 Ether-Bar + 8 World-Tree Branch + 15 Divine Essence + 12 Legendary Parts + 10 Arcane Essence | DIVINE_BLESSING |
| Void Ward | 8 | 90 | 780 | 88 | 22 Ether-Bar + 10 World-Tree Branch + 18 Dark Essence + 16 Legendary Parts + 14 Arcane Essence | VOID_TOUCH |
| Omega Shield | 9 | 95 | 1050 | 110 | 28 Ether-Bar + 12 World-Tree Branch + 22 Divine Essence + 20 Legendary Parts + 18 Arcane Essence | DIVINE_BLESSING |
| Primordial Aegis | 10 | 99 | 1550 | 140 | 32 Ether-Bar + 14 World-Tree Branch + 26 Void Essence + 24 Legendary Parts + 22 Arcane Essence | PHANTOM_STRIKE |

> **Orb vs Wand**: Orb has lower MATK but higher MDEF, designed for sustained magical combat with defensive capabilities. Wand focuses on burst damage.

### Tome (Two-Handed) - Nuker/Spell Amp

| Name | Tier | Level | Base MATK | Base MDEF | Crafting Materials | Special Trait |
|------|------|-------|-----------|-----------|-------------------|---------------|
| Spellbook | 1 | 8 | 18 | 0 | 5 Yew Wood + 10 Parchment + 3 Mana Essence | - |
| Grimoire | 2 | 18 | 38 | 0 | 8 Yew Wood + 15 Parchment + 5 Mithril Bar + 5 Mana Essence | - |
| Book of Magic | 2 | 28 | 65 | 0 | 12 Ironwood + 20 Parchment + 8 Mithril Bar + 8 Arcane Essence | - |
| Mithril Tome | 3 | 42 | 105 | 0 | 10 Mithril Bar + 10 Ironwood + 25 Parchment + 10 Arcane Essence | - |
| Adamantite Tome | 4 | 56 | 175 | 0 | 10 Adamantite Bar + 10 Spirit Wood + 30 Parchment + 15 Arcane Essence | - |
| Necronomicon | 5 | 70 | 300 | 0 | 15 Adamantite Bar + 4 Ether-Bar + 5 World-Tree Branch + 40 Parchment + 20 Arcane Essence | VOID_TOUCH |
| Codex Eternal | 6 | 85 | 520 | 0 | 20 Ether-Bar + 8 World-Tree Branch + 60 Parchment + 30 Arcane Essence + 10 Legendary Monster Parts | ELEMENTAL_MASTERY |
| Grimoire of Chaos | 7 | 88 | 700 | 0 | 22 Ether-Bar + 10 World-Tree Branch + 80 Parchment + 40 Arcane Essence + 14 Legendary Parts + 8 Dark Essence | VOID_TOUCH |
| Necronomicon Prime | 8 | 92 | 950 | 0 | 26 Ether-Bar + 12 World-Tree Branch + 100 Parchment + 50 Arcane Essence + 18 Legendary Parts + 12 Dark Essence | VOID_TOUCH |
| Omega Tome | 9 | 96 | 1280 | 0 | 30 Ether-Bar + 14 World-Tree Branch + 120 Parchment + 60 Arcane Essence + 22 Legendary Parts + 16 Divine Essence | ELEMENTAL_MASTERY |
| Primordial Knowledge | 10 | 99 | 1850 | 0 | 35 Ether-Bar + 16 World-Tree Branch + 150 Parchment + 70 Arcane Essence + 25 Legendary Parts + 20 Void Essence | PHANTOM_STRIKE |

### Staff (Two-Handed) - Hybrid/Elemental

| Name | Tier | Level | Base MATK | Base DEF | Crafting Materials | Special Trait |
|------|------|-------|-----------|----------|-------------------|---------------|
| Wooden Staff | 1 | 3 | 14 | 3 | 4 Oak Wood + 2 Quartz Crystal | - |
| Iron Staff | 2 | 15 | 32 | 5 | 8 Iron Bar + 5 Yew Wood + 3 Quartz Crystal | - |
| Arcane Staff | 2 | 25 | 55 | 7 | 12 Yew Wood + 6 Steel Bar + 5 Quartz Crystal | - |
| Elemental Staff | 3 | 38 | 90 | 10 | 8 Mithril Bar + 6 Ironwood + 8 Elemental Essence | ELEMENTAL_MASTERY |
| Staff of Power | 4 | 52 | 150 | 14 | 8 Adamantite Bar + 6 Spirit Wood + 12 Elemental Essence | ELEMENTAL_MASTERY |
| Staff of the Archmage | 5 | 66 | 260 | 20 | 12 Adamantite Bar + 3 Ether-Bar + 3 World-Tree Branch + 15 Elemental Essence | ELEMENTAL_MASTERY |
| Eternal Staff | 6 | 81 | 450 | 30 | 15 Ether-Bar + 5 World-Tree Branch + 20 Elemental Essence + 8 Legendary Monster Parts | ELEMENTAL_MASTERY |
| Celestial Rod | 7 | 85 | 620 | 42 | 18 Ether-Bar + 8 World-Tree Branch + 15 Divine Essence + 12 Legendary Parts + 10 Elemental Essence | DIVINE_BLESSING |
| Void Channeler | 8 | 90 | 850 | 55 | 22 Ether-Bar + 10 World-Tree Branch + 18 Dark Essence + 16 Legendary Parts + 14 Elemental Essence | VOID_TOUCH |
| Omega Staff | 9 | 95 | 1150 | 70 | 28 Ether-Bar + 12 World-Tree Branch + 22 Divine Essence + 20 Legendary Parts + 18 Elemental Essence | ELEMENTAL_MASTERY |
| Primordial Conduit | 10 | 99 | 1700 | 90 | 32 Ether-Bar + 14 World-Tree Branch + 26 Void Essence + 24 Legendary Parts + 22 Elemental Essence | PHANTOM_STRIKE |

### Catalyst (One-Handed) - Glass Cannon

| Name | Tier | Level | Base MATK | Base MDEF | Crafting Materials | Special Trait |
|------|------|-------|-----------|-----------|-------------------|---------------|
| Apprentice Catalyst | 1 | 5 | 14 | 0 | 4 Oak Wood + 3 Quartz Crystal + 2 Leather | - |
| Sorcerer Catalyst | 2 | 15 | 30 | 0 | 8 Yew Wood + 5 Mithril Bar + 5 Mana Essence + 3 Leather | - |
| Arcane Focus | 2 | 25 | 55 | 0 | 12 Yew Wood + 8 Mithril Bar + 8 Arcane Essence + 5 Leather | - |
| Mithril Catalyst | 3 | 38 | 90 | 0 | 10 Mithril Bar + 6 Ironwood + 12 Arcane Essence + 5 Leather | - |
| Adamantite Catalyst | 4 | 52 | 150 | 0 | 10 Adamantite Bar + 6 Spirit Wood + 18 Arcane Essence + 5 Leather | - |
| Spell Amplifier | 5 | 66 | 260 | 0 | 15 Adamantite Bar + 4 Ether-Bar + 4 World-Tree Branch + 25 Arcane Essence + 5 Leather | ELEMENTAL_MASTERY |
| Mana Battery | 6 | 81 | 450 | 0 | 20 Ether-Bar + 6 World-Tree Branch + 35 Arcane Essence + 10 Legendary Monster Parts + 5 Leather | ELEMENTAL_MASTERY |
| Overcharge | 7 | 85 | 620 | 0 | 22 Ether-Bar + 8 World-Tree Branch + 20 Void Essence + 14 Legendary Parts + 8 Dark Essence + 8 Arcane Essence | VOID_TOUCH |
| Arcane Cannon | 8 | 90 | 850 | 0 | 26 Ether-Bar + 10 World-Tree Branch + 24 Dark Essence + 18 Legendary Parts + 12 Arcane Essence | VOID_TOUCH |
| Omega Catalyst | 9 | 95 | 1150 | 0 | 30 Ether-Bar + 12 World-Tree Branch + 28 Divine Essence + 22 Legendary Parts + 16 Arcane Essence | ELEMENTAL_MASTERY |
| Primordial Spark | 10 | 99 | 1700 | 0 | 35 Ether-Bar + 14 World-Tree Branch + 32 Void Essence + 25 Legendary Parts + 20 Arcane Essence | PHANTOM_STRIKE |

> **Catalyst Design**: Catalyst has extreme MATK but ZERO MDEF. This is the ultimate glass cannon - maximum damage output with no defensive capabilities. Players using Catalyst must rely on positioning and timing.

---

## Shield Weapons - Distinct Identity Focus

### Shield (One-Handed) - Balanced Tank

| Name | Tier | Level | Base DEF | Base MDEF | Crafting Materials | Special Trait |
|------|------|-------|----------|-----------|-------------------|---------------|
| Wooden Shield | 1 | 1 | 8 | 2 | 4 Oak Wood + 2 Iron Bar | - |
| Iron Shield | 1 | 10 | 18 | 4 | 8 Iron Bar + 4 Oak Wood | - |
| Steel Shield | 2 | 20 | 35 | 7 | 12 Steel Bar + 6 Yew Wood | - |
| Mithril Shield | 3 | 34 | 60 | 12 | 8 Mithril Bar + 4 Ironwood | - |
| Adamantite Shield | 4 | 48 | 100 | 18 | 8 Adamantite Bar + 4 Spirit Wood | - |
| Aegis | 5 | 62 | 170 | 25 | 12 Adamantite Bar + 3 Ether-Bar + 2 World-Tree Branch | DIVINE_BLESSING |
| Bulwark | 6 | 77 | 300 | 40 | 15 Ether-Bar + 5 World-Tree Branch + 8 Legendary Monster Parts | DIVINE_BLESSING |
| Divine Shield | 7 | 85 | 420 | 55 | 18 Ether-Bar + 8 World-Tree Branch + 10 Divine Essence + 12 Legendary Parts | DIVINE_BLESSING |
| Void Guardian | 8 | 90 | 580 | 72 | 22 Ether-Bar + 10 World-Tree Branch + 14 Dark Essence + 16 Legendary Parts | VOID_TOUCH |
| Omega Bulwark | 9 | 95 | 800 | 95 | 28 Ether-Bar + 12 World-Tree Branch + 18 Divine Essence + 20 Legendary Parts | DIVINE_BLESSING |
| Primordial Ward | 10 | 99 | 1200 | 120 | 32 Ether-Bar + 14 World-Tree Branch + 22 Void Essence + 24 Legendary Parts | PHANTOM_STRIKE |

### Tower Shield (Two-Handed) - Ultimate Defense

| Name | Tier | Level | Base DEF | Base MDEF | Crafting Materials | Special Trait |
|------|------|-------|----------|-----------|-------------------|---------------|
| Pavise | 1 | 8 | 15 | 3 | 6 Oak Wood + 4 Iron Bar | - |
| Kite Shield | 2 | 18 | 32 | 6 | 10 Steel Bar + 6 Yew Wood | - |
| Tower Shield | 2 | 28 | 55 | 9 | 15 Steel Bar + 8 Ironwood | - |
| Mithril Tower Shield | 3 | 42 | 90 | 14 | 12 Mithril Bar + 6 Ironwood | - |
| Adamantite Tower Shield | 4 | 56 | 150 | 20 | 12 Adamantite Bar + 6 Spirit Wood | - |
| Iron Fortress | 5 | 70 | 260 | 28 | 18 Adamantite Bar + 5 Ether-Bar + 4 World-Tree Branch | GIANT_SLAYER |
| Wall of Titans | 6 | 85 | 450 | 42 | 25 Ether-Bar + 8 World-Tree Branch + 15 Legendary Monster Parts | GIANT_SLAYER |
| Iron Will | 7 | 88 | 620 | 58 | 28 Ether-Bar + 10 World-Tree Branch + 12 Divine Essence + 16 Legendary Parts | DIVINE_BLESSING |
| Fortress Eternal | 8 | 92 | 850 | 75 | 32 Ether-Bar + 12 World-Tree Branch + 16 Dark Essence + 20 Legendary Parts | GIANT_SLAYER |
| Omega Fortress | 9 | 96 | 1150 | 95 | 36 Ether-Bar + 14 World-Tree Branch + 20 Divine Essence + 24 Legendary Parts | GIANT_SLAYER |
| Primordial Bastion | 10 | 99 | 1650 | 120 | 40 Ether-Bar + 16 World-Tree Branch + 24 Void Essence + 28 Legendary Parts | PHANTOM_STRIKE |

### Buckler (One-Handed) - Counter/Off-Tank

| Name | Tier | Level | Base DEF | Base MDEF | Crafting Materials | Special Trait |
|------|------|-------|----------|-----------|-------------------|---------------|
| Small Shield | 1 | 1 | 5 | 1 | 2 Iron Bar + 2 Oak Wood | - |
| Buckler | 1 | 8 | 12 | 2 | 4 Iron Bar + 2 Yew Wood | - |
| Round Shield | 2 | 18 | 25 | 4 | 6 Steel Bar + 4 Yew Wood + Leather | - |
| Mithril Buckler | 3 | 32 | 45 | 7 | 5 Mithril Bar + 3 Ironwood + Leather | - |
| Adamantite Buckler | 4 | 46 | 75 | 10 | 5 Adamantite Bar + 3 Spirit Wood + Leather | - |
| Reflex Shield | 5 | 60 | 130 | 15 | 8 Adamantite Bar + 2 Ether-Bar + 2 World-Tree Branch + Leather | PHANTOM_STRIKE |
| Phantom Guard | 6 | 75 | 230 | 22 | 10 Ether-Bar + 3 World-Tree Branch + 5 Legendary Monster Parts + Leather | PHANTOM_STRIKE |
| Shadow Reflector | 7 | 85 | 320 | 30 | 15 Ether-Bar + 5 World-Tree Branch + 8 Void Essence + 10 Legendary Parts + Leather | VOID_TOUCH |
| Eclipse Shield | 8 | 90 | 440 | 40 | 20 Ether-Bar + 8 World-Tree Branch + 12 Dark Essence + 14 Legendary Parts + Leather | PHANTOM_STRIKE |
| Omega Reflex | 9 | 95 | 600 | 52 | 25 Ether-Bar + 10 World-Tree Branch + 16 Divine Essence + 18 Legendary Parts + Leather | PHANTOM_STRIKE |
| Primordial Parry | 10 | 99 | 900 | 68 | 30 Ether-Bar + 12 World-Tree Branch + 20 Void Essence + 22 Legendary Parts + Leather | PHANTOM_STRIKE |

> **Buckler Design**: Lower defense than Tower Shield but enables counterattacks. Best for dodge-based or counter-based tank builds.

---

## Unarmed Weapons - Distinct Identity Focus

### Gloves - Combo Master

| Name | Tier | Level | Base ATK | Base DEF | Crafting Materials | Special Trait |
|------|------|-------|----------|----------|-------------------|---------------|
| Cloth Gloves | 1 | 1 | 6 | 2 | 3 Cloth | - |
| Leather Gloves | 1 | 10 | 14 | 4 | 5 Leather + 2 Iron Bar | - |
| Combat Gloves | 2 | 20 | 28 | 6 | 8 Leather + 5 Steel Bar | - |
| Mithril Knuckles | 3 | 34 | 50 | 9 | 5 Mithril Bar + 5 Leather + 3 Ironwood | - |
| Adamantite Knuckles | 4 | 48 | 85 | 12 | 5 Adamantite Bar + 5 Leather + 3 Spirit Wood | - |
| Fist of Fury | 5 | 62 | 145 | 17 | 8 Adamantite Bar + 2 Ether-Bar + 5 Leather + 3 World-Tree Branch | BEAST_SLAYER |
| Divine Gauntlets | 6 | 77 | 260 | 25 | 10 Ether-Bar + 5 World-Tree Branch + 8 Legendary Monster Parts + 5 Divine Essence | DIVINE_BLESSING |
| Phantom Fists | 7 | 85 | 360 | 35 | 15 Ether-Bar + 6 World-Tree Branch + 8 Void Essence + 10 Legendary Parts + 6 Divine Essence | PHANTOM_STRIKE |
| Void Striker | 8 | 90 | 500 | 45 | 20 Ether-Bar + 8 World-Tree Branch + 12 Dark Essence + 14 Legendary Parts + 8 Dark Essence | VOID_TOUCH |
| Omega Fury | 9 | 95 | 680 | 58 | 25 Ether-Bar + 10 World-Tree Branch + 16 Divine Essence + 18 Legendary Parts + 10 Divine Essence | DIVINE_BLESSING |
| Primordial Wraps | 10 | 99 | 1000 | 75 | 30 Ether-Bar + 12 World-Tree Branch + 20 Void Essence + 22 Legendary Parts + 12 Divine Essence | PHANTOM_STRIKE |

### Brass Knuckles - Stun Brawler

| Name | Tier | Level | Base ATK | Base DEF | Crafting Materials | Special Trait |
|------|------|-------|----------|----------|-------------------|---------------|
| Knuckles | 1 | 3 | 8 | 1 | 3 Iron Bar + 2 Leather | - |
| Brass Knuckles | 2 | 15 | 18 | 2 | 6 Steel Bar + 4 Leather | - |
| Iron Knuckles | 2 | 25 | 32 | 3 | 10 Steel Bar + 6 Leather | - |
| Mithril Knuckles | 3 | 38 | 55 | 5 | 6 Mithril Bar + 5 Leather + 3 Ironwood | - |
| Adamantite Knuckles | 4 | 52 | 95 | 7 | 6 Adamantite Bar + 5 Leather + 3 Spirit Wood | - |
| Thunder Fists | 5 | 66 | 160 | 10 | 10 Adamantite Bar + 3 Ether-Bar + 5 Leather + 5 Lightning Essence | TEMPEST_CALL |
| Tempest Fists | 6 | 81 | 290 | 15 | 12 Ether-Bar + 4 World-Tree Branch + 8 Legendary Monster Parts + 8 Lightning Essence | TEMPEST_CALL |
| Thunder God | 7 | 85 | 400 | 20 | 16 Ether-Bar + 6 World-Tree Branch + 10 Lightning Essence + 12 Legendary Parts | TEMPEST_CALL |
| Storm Bringer | 8 | 90 | 550 | 28 | 20 Ether-Bar + 8 World-Tree Branch + 14 Lightning Essence + 16 Legendary Parts | TEMPEST_CALL |
| Omega Thunder | 9 | 95 | 750 | 36 | 25 Ether-Bar + 10 World-Tree Branch + 18 Lightning Essence + 20 Legendary Parts | TEMPEST_CALL |
| Primordial Shock | 10 | 99 | 1100 | 48 | 30 Ether-Bar + 12 World-Tree Branch + 22 Lightning Essence + 24 Legendary Parts | TEMPEST_CALL |

> **Brass Knuckles vs Gloves**: Brass Knuckles focus on stun mechanics and burst damage. Gloves focus on combo chains and sustained damage.

### Claws - Bleed/DoT Specialist

| Name | Tier | Level | Base ATK | Base DEF | Attack Ticks | Crafting Materials | Special Trait |
|------|------|-------|----------|----------|--------------|--------------------|---------------|
| Bone Claws | 1 | 5 | 10 | 0 | 35 | 5 Bone + 2 Leather | - |
| Iron Claws | 2 | 15 | 22 | -1 | 35 | 6 Iron Bar + 4 Leather | - |
| Steel Claws | 2 | 25 | 40 | -2 | 35 | 10 Steel Bar + 6 Leather | - |
| Mithril Claws | 3 | 38 | 75 | -3 | 35 | 6 Mithril Bar + 8 Leather | - |
| Adamantite Claws | 4 | 52 | 125 | -4 | 35 | 6 Adamantite Bar + 10 Leather | - |
| Beast Fang | 5 | 66 | 210 | -5 | 35 | 10 Adamantite Bar + 2 Ether-Bar + 5 Legendary Monster Parts | BEAST_SLAYER |
| Dragon Claw | 6 | 81 | 380 | -6 | 35 | 12 Ether-Bar + 3 World-Tree Branch + 8 Legendary Monster Parts | DRAGON_SLAYER |
| Void Rippers | 7 | 85 | 540 | -8 | 35 | 15 Ether-Bar + 5 World-Tree Branch + 10 Void Essence | VOID_TOUCH |
| Nightmare Talons | 8 | 90 | 720 | -10 | 35 | 20 Ether-Bar + 6 World-Tree Branch + 15 Dark Essence | PHANTOM_STRIKE |
| Omega Shredder | 9 | 95 | 980 | -12 | 35 | 25 Ether-Bar + 8 World-Tree Branch + 20 Blood Essence | BEAST_SLAYER |
| Primordial Fang | 10 | 99 | 1450 | -15 | 35 | 30 Ether-Bar + 10 World-Tree Branch + 25 Void Essence + 25 Legendary Parts + 18 Dark Essence | VOID_TOUCH |

### Kaginawa - Mobility/Grapple

| Name | Tier | Level | Base ATK | Base DEF | Attack Ticks | Crafting Materials | Special Trait |
|------|------|-------|----------|----------|--------------|--------------------|---------------|
| Rope Hook | 1 | 5 | 8 | 1 | 40 | 5 Rope + 2 Oak Wood | - |
| Iron Kaginawa | 2 | 15 | 18 | 2 | 40 | 6 Iron Bar + 4 Steel Bar + 2 Rope | - |
| Steel Kaginawa | 2 | 25 | 32 | 3 | 40 | 10 Steel Bar + 5 Yew Wood + 3 Rope | - |
| Mithril Kaginawa | 3 | 38 | 55 | 5 | 40 | 8 Mithril Bar + 5 Ironwood + 3 Rope | - |
| Adamantite Kaginawa | 4 | 52 | 90 | 7 | 40 | 8 Adamantite Bar + 5 Spirit Wood + 3 Rope | - |
| Grapple Hook | 5 | 66 | 155 | 10 | 40 | 12 Adamantite Bar + 3 Ether-Bar + 3 World-Tree Branch + 5 Rope | VOID_TOUCH |
| Widow's Reach | 6 | 81 | 280 | 15 | 40 | 15 Ether-Bar + 5 World-Tree Branch + 10 Legendary Monster Parts + 8 Dark Essence | VOID_TOUCH |
| Shadow Grapple | 7 | 85 | 390 | 20 | 40 | 18 Ether-Bar + 7 World-Tree Branch + 8 Void Essence + 12 Legendary Parts + 6 Dark Essence | VOID_TOUCH |
| Void Hook | 8 | 90 | 540 | 28 | 40 | 22 Ether-Bar + 10 World-Tree Branch + 12 Dark Essence + 16 Legendary Parts + 10 Void Essence | VOID_TOUCH |
| Omega Pull | 9 | 95 | 740 | 36 | 40 | 28 Ether-Bar + 12 World-Tree Branch + 16 Divine Essence + 20 Legendary Parts + 14 Dark Essence | PHANTOM_STRIKE |
| Primordial Grasp | 10 | 99 | 1100 | 48 | 40 | 32 Ether-Bar + 14 World-Tree Branch + 20 Void Essence + 24 Legendary Parts + 18 Dark Essence | VOID_TOUCH |

---

## UNIQUE IDENTITY SUMMARY

### Key Differentiators by Category

| Category | Weapon Type | Primary Identity | Stat Focus | Defense |
|----------|-------------|-----------------|------------|---------|
| **Melee** | Sword | Balanced | ATK | Medium |
| | Greatsword | AOE Cleave | ATK (High) | None |
| | Axe | Boss Killer | ATK (High) | Low |
| | Battle Axe | Bleed DoT | ATK (High) | None |
| | Mace | Stun Lock | ATK | Medium |
| | War Hammer | Armor Break | ATK (Extreme) | None |
| | Dagger | Assassin | ATK (Low) | Negative |
| | Rapier | Duelist | ATK | Evasion |
| | Spear | Frontliner | ATK | Medium |
| | Scythe | Soul Reaper | ATK | None |
| **Ranged** | Bow | Precision | ATK | Low |
| | Longbow | Sniper | ATK (High) | Low |
| | Crossbow | Armor Break | ATK | None |
| | Thrown | Utility | ATK | None |
| **Magic** | Wand | Burst Mage | MATK | Low MDEF |
| | Orb | Battle Mage | MATK | High MDEF |
| | Tome | Nuker | MATK (Extreme) | No MDEF |
| | Staff | Hybrid | MATK | Medium MDEF |
| | Catalyst | Glass Cannon | MATK (Extreme) | No MDEF |
| **Shield** | Shield | Tank | DEF | High MDEF |
| | Tower Shield | Protector | DEF (Extreme) | High MDEF |
| | Buckler | Counter | DEF | Low MDEF |
| **Unarmed** | Gloves | Combo | ATK | Medium |
| | Brass Knuckles | Brawler | ATK (High) | Low |
| | Claws | Bleeder | ATK (High) | Negative |
| | Kaginawa | Mobility | ATK | Low |

---

## TIER PROGRESSION CONSISTENCY

### Stat Scaling by Tier (Balanced Progression)

| Tier | Level | ATK/MATK Multiplier | DEF/MDEF Multiplier |
|------|-------|-------------------|---------------------|
| T1 | 1-10 | 1.0x | 1.0x |
| T2 | 11-20 | 1.2x | 1.2x |
| T3 | 21-30 | 1.5x | 1.5x |
| T4 | 31-40 | 1.9x | 1.9x |
| T5 | 41-50 | 2.4x | 2.4x |
| T6 | 51-60 | 3.0x | 3.0x |
| T7 | 61-70 | 3.7x | 3.7x |
| T8 | 71-80 | 4.5x | 4.5x |
| T9 | 81-90 | 5.5x | 5.5x |
| T10 | 91-99 | 6.8x | 6.8x |

### TIER 7-10 Naming Themes

| Tier | Theme | Naming Pattern |
|------|-------|----------------|
| T7 | Void/Shadow | Death's X, Void X, Phantom X |
| T8 | Omega/Dark | Omega X, Dark X, Eclipse X |
| T9 | Divine/Legendary | Divine X, Apollo's X, Titan X |
| T10 | Primordial | Primordial X, Eternal X |

---

*Document Version: 2.0 - Revised Edition*
*Last Updated: Weapon Polish Complete*
