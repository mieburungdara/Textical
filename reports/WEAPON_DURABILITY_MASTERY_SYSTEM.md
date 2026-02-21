# Weapon Durability & Mastery System Design

> This document outlines the complete durability and mastery system for all weapon types in Textical.

---

## 1. DURABILITY SYSTEM

### 1.1 Core Concept

Weapons have **Durability Points (DP)** that decrease with each use. When durability reaches 0, the weapon becomes unusable until repaired.

### 1.2 Base Durability by Weapon Type

| Weapon Category | Base Durability | Durability Per Hit | Notes |
|-----------------|-----------------|-------------------|-------|
| **One-Handed Melee** | 200 | -1 per hit | Sword, Axe, Mace, Dagger, Rapier |
| **Two-Handed Melee** | 300 | -1 per hit | Greatsword, Battle Axe, War Hammer, Spear, Scythe |
| **Ranged Weapons** | 150 | -1 per shot | Bow, Longbow, Crossbow |
| **Thrown Weapons** | 80 | -1 per throw | Non-recoverable |
| **Magic Weapons** | 120 | -1 per spell cast | Wand, Orb, Tome, Staff, Catalyst |
| **Shields** | 250 | -1 per block | Shield, Tower Shield, Buckler |
| **Unarmed** | 150 | -1 per strike | Requires repair based on material type |

### 1.3 Durability Loss Formula

```
Base Loss = 1
Total Loss = Base Loss × Combat Multiplier × Weapon Tier Multiplier × Condition Multiplier
```

#### Combat Multiplier
| Action Type | Multiplier |
|-------------|------------|
| Normal Attack | 1.0x |
| Skill Attack | 1.5x |
| Critical Hit | 1.2x |
| Block/Parry | 0.8x |
| Miss | 0x |

#### Weapon Tier Multiplier
| Tier | Multiplier | Rationale |
|------|------------|-----------|
| TIER_1 | 0.8x | Crude weapons break faster |
| TIER_2 | 0.9x | Basic materials |
| TIER_3 | 1.0x | Standard |
| TIER_4 | 1.1x | Quality materials |
| TIER_5 | 1.2x | Superior craftsmanship |
| TIER_6 | 1.4x | High-quality |
| TIER_7 | 1.6x | Enhanced durability |
| TIER_8 | 1.8x | Reinforced |
| TIER_9 | 2.0x | Legendary craftsmanship |
| TIER_10 | 2.5x | Mythic durability |

#### Condition Multiplier
| Weapon Condition | Multiplier | Effect |
|------------------|------------|--------|
| Optimal | 1.0x | Normal durability loss |
| Worn | 1.2x | 20% more damage taken |
| Damaged | 1.5x | 50% more damage taken |
| Critical | 2.0x | Double damage taken |

### 1.4 Durability Loss by Action Type

#### Melee Weapons (Sword, Axe, Mace, Dagger, Rapier, Greatsword, Battle Axe, War Hammer, Spear, Scythe)
```
Per Hit Loss = 1 × (1 + AttackTypeBonus)

Attack Type Bonus:
- Normal Attack: +0
- Skill Attack: +0.5
- Critical Hit: +0.2
- Kill Blow: +0.3
```

**Example:**
- Sword TIER_5 does normal attack: 1 × 1.0 × 1.2 × 1.0 = 1.2 → rounded to 1 durability
- Sword TIER_5 uses skill: 1 × 1.5 × 1.2 × 1.0 = 1.8 → rounded to 2 durability

#### Ranged Weapons (Bow, Longbow, Crossbow)
```
Per Shot Loss = 1 × (1 + RangePenalty + ShotTypeBonus)

RangePenalty:
- Close Range (1-2 tiles): +0.3
- Medium Range (3-5 tiles): +0
- Long Range (6+ tiles): +0.2

ShotTypeBonus:
- Normal Shot: +0
- Power Shot: +0.5
- Skill Attack: +0.5
- Critical Hit: +0.2
```

**Example:**
- Bow TIER_7 at medium range uses Power Shot: 1 × (1 + 0 + 0.5) × 1.6 = 2.4 → 2 durability
- Longbow TIER_9 at long range critical: 1 × (1 + 0.2 + 0.2) × 2.0 = 2.8 → 3 durability

#### Thrown Weapons
```
Per Throw Loss = 1 × (1 + ThrowTypeBonus)

ThrowTypeBonus:
- Normal Throw: +0
- Aimed Throw: +0.3
- Skill Attack: +0.5
- Ricochet Hit (multiple targets): +0.5 per additional target
```

**Note:** Thrown weapons are CONSUMABLE - they do not return to inventory after use.

#### Magic Weapons (Wand, Orb, Tome, Staff, Catalyst)
```
Per Spell Loss = 1 × (1 + SpellTierBonus + ElementalPenalty)

SpellTierBonus:
- Basic Spell: +0
- Intermediate Spell: +0.3
- Advanced Spell: +0.5
- Ultimate Spell: +1.0

ElementalPenalty:
- Neutral Magic: +0
- Single Element: +0.2
- Dual Element: +0.4
- Ultimate/Forbidden: +0.6
```

**Example:**
- Wand TIER_6 casts Intermediate Fire spell: 1 × (1 + 0.3 + 0.2) × 1.4 = 2.1 → 2 durability
- Tome TIER_10 casts Ultimate Forbidden spell: 1 × (1 + 1.0 + 0.6) × 1.6 = 4.16 → 4 durability

#### Shields (Shield, Tower Shield, Buckler)
```
Per Block Loss = 1 × (1 + BlockTypeBonus)

BlockTypeBonus:
- Normal Block: +0
- Perfect Block (full damage blocked): +0.5
- Counter Block (counterattack triggered): +0.8
- Skill Block: +0.5
```

**Example:**
- Shield TIER_6 performs Perfect Block: 1 × (1 + 0.5) × 1.4 = 2.1 → 2 durability

#### Unarmed Weapons (Gloves, Brass Knuckles, Claws, Kaginawa)
```
Per Hit Loss = 1 × (1 + AttackStyleBonus + MaterialBonus)

AttackStyleBonus:
- Normal Strike: +0
- Combo Attack: +0.2 per combo hit
- Skill Attack: +0.5
- Critical Hit: +0.2
- Kill Blow: +0.3

MaterialBonus:
- Cloth Gloves: +0.3 (fabric wears fast)
- Leather Gloves: +0.2 (durable but not metal)
- Metal-plated Gloves: +0.1 (reinforced)
- Brass Knuckles: +0 (metal, durable)
- Iron Claws: +0 (metal, standard)
- Steel/Adamantite Claws: -0.1 (superior materials)
- Kaginawa (rope): +0.3 (rope wears fast)
- Kaginawa (metal hook): +0 (durable)
```

**Note:** Unarmed weapons CAN BREAK and require repair. Unlike weapons, they are cheaper to repair but need more frequent maintenance.

### 1.5 Durability Restoration

#### NPC Repair at Citadel (Using Silver)
```
Cost = (MaxDurability - CurrentDurability) × TierMultiplier × SilverCost

SilverCost per durability point:
- TIER_1-3: 1 Silver
- TIER_4-5: 2 Silver
- TIER_6-7: 3 Silver
- TIER_8-9: 5 Silver
- TIER_10: 8 Silver
```

**Unarmed Weapon Discount:**
Unarmed weapons cost 50% less silver to repair.
- TIER_1-3: 0.5 Silver
- TIER_4-5: 1 Silver
- TIER_6-7: 1.5 Silver
- TIER_8-9: 2.5 Silver
- TIER_10: 4 Silver

**Example:**
- Repair Sword TIER_5 from 100/200 durability: (200-100) × 1.2 × 2 = 240 Silver

#### Rest at Campfire
```
Rest Duration: 8 hours
Durability Restored: 20% of max durability
Can only be used once per day
```

### 1.6 Durability Events

#### Critical Durability Effects
| Durability % | Effect |
|--------------|--------|
| 100-75% | Normal stats |
| 74-50% | -10% Attack/Magic Attack |
| 49-25% | -25% Attack/Magic Attack, -10% Accuracy |
| 24-10% | -40% Attack/Magic Attack, -20% Accuracy, +10% Crit chance |
| 9-1% | -60% Attack/Magic Attack, -30% Accuracy, +20% Crit chance, -10% Evasion |
| 0% | Weapon unusable until repaired |

### 1.7 Special Traits Affecting Durability

| Trait | Effect | Weapon Types |
|-------|--------|---------------|
| DURABLE | -25% durability loss | Shield, Tower Shield, Mace |
| FRAGILE | +50% durability loss | Glass cannon builds |

---

## 2. MASTERY SYSTEM

### 2.1 Core Concept

Weapon Mastery is a parallel progression system where players become more skilled with specific weapon types through repeated use. Mastery provides permanent bonuses that scale with investment.

### 2.2 Mastery Categories

| Category | Weapons | Mastery Stat |
|----------|---------|--------------|
| **One-Handed Sword** | Sword | +ATK, +Crit |
| **Two-Handed Sword** | Greatsword | +ATK, +AOE |
| **Axe** | Axe, Battle Axe | +ATK, +Execute |
| **Blunt** | Mace, War Hammer | +ATK, +Stun |
| **Piercing** | Dagger, Rapier, Spear | +ATK, +Crit |
| **Ranged** | Bow, Longbow, Crossbow | +ATK, +Range |
| **Thrown** | Thrown Weapons | +ATK, +Utility |
| **Wand** | Wand, Catalyst | +MATK, +Burst |
| **Orb** | Orb | +MATK, +MDEF |
| **Tome** | Tome | +MATK, +Cooldown |
| **Staff** | Staff | +MATK, +Hybrid |
| **Shield** | Shield, Tower Shield, Buckler | +DEF, +Block |
| **Unarmed** | Gloves, Brass Knuckles, Claws, Kaginawa | +ATK, +Combo |

### 2.3 Mastery Point Gain Formula

```
MasteryGain = BaseGain × WeaponTierMultiplier × ActionMultiplier × MasteryBonus

BaseGain per action:
- Melee hit: 1 MP
- Ranged hit: 1 MP
- Spell cast: 2 MP
- Shield block: 1 MP
- Kill: +5 MP
- Boss kill: +20 MP
```

#### Weapon Tier Multiplier
| Tier | Multiplier |
|------|------------|
| TIER_1-2 | 0.5x |
| TIER_3-4 | 1.0x |
| TIER_5-6 | 1.5x |
| TIER_7-8 | 2.0x |
| TIER_9-10 | 3.0x |

#### Action Multiplier
| Action | Multiplier |
|--------|------------|
| Normal Attack | 1.0x |
| Skill Attack | 1.5x |
| Critical Hit | 1.2x |
| Kill | 2.0x |

**Examples:**
- TIER_5 Sword normal hit kill: 1 × 1.5 × 2.0 = 3 MP
- TIER_8 Dagger critical skill: 1 × 2.0 × 1.5 × 1.2 = 3.6 → 3 MP (rounded down)
- TIER_10 Staff ultimate spell: 2 × 3.0 × 1.5 = 9 MP

### 2.4 Mastery Level Requirements

| Mastery Level | Total MP Required | Cumulative MP |
|---------------|-------------------|---------------|
| 1 | 0 | 0 |
| 2 | 100 | 100 |
| 3 | 300 | 400 |
| 4 | 600 | 1000 |
| 5 | 1000 | 2000 |
| 6 | 1500 | 3500 |
| 7 | 2500 | 6000 |
| 8 | 4000 | 10000 |
| 9 | 6000 | 16000 |
| 10 | 9000 | 25000 |
| 11 (Master) | 15000 | 40000 |
| 12 (Grandmaster) | 25000 | 65000 |
| 13 (Legendary) | 40000 | 105000 |
| 14 (Mythic) | 65000 | 170000 |

### 2.5 Mastery Bonuses by Level

#### One-Handed Sword Mastery
| Level | Bonus |
|-------|-------|
| 1 | +2 ATK |
| 2 | +3% Critical Rate |
| 3 | +5 ATK |
| 4 | +5% Critical Damage |
| 5 | +10 ATK, +1 to all sword skills |
| 6 | +10% Critical Rate |
| 7 | +20 ATK |
| 8 | +15% Critical Damage |
| 9 | +30 ATK, +5% All Damage |
| 10 | +20% Critical Rate, Blade Harmony enhanced |
| 11 (Master) | +50 ATK, +10% All Damage |
| 12 (Grandmaster) | +75 ATK, +25% Critical Damage |
| 13 (Legendary) | +100 ATK, "Sword Saint" title |
| 14 (Mythic) | +150 ATK, All sword skills +2 levels |

#### Greatsword Mastery (Two-Handed)
| Level | Bonus |
|-------|-------|
| 1 | +3 ATK |
| 2 | +3% AOE Damage |
| 3 | +6 ATK |
| 4 | +5% Cleave Range |
| 5 | +12 ATK, Cleave hits +1 enemy |
| 6 | +10% AOE Damage |
| 7 | +25 ATK |
| 8 | +15% Cleave Range |
| 9 | +40 ATK, Cleave damage +10% |
| 10 | Momentum effect +50% |
| 11 (Master) | +60 ATK, +20% All AOE Damage |
| 12 (Grandmaster) | +90 ATK, Cleave always hits 3 enemies |
| 13 (Legendary) | +120 ATK, "Greatsword Master" title |
| 14 (Mythic) | +180 ATK, Cleave becomes 180° arc |

#### Axe Mastery
| Level | Bonus |
|-------|-------|
| 1 | +3 ATK |
| 2 | +5% Damage vs <50% HP |
| 3 | +7 ATK |
| 4 | +10% Execute chance |
| 5 | +15 ATK, Execution damage +10% |
| 6 | +15% Damage vs <50% HP |
| 7 | +30 ATK |
| 8 | +20% Execute chance |
| 9 | +50 ATK, Instant kill chance +5% |
| 10 | Execute range expanded to <35% HP |
| 11 (Master) | +75 ATK, +20% All Damage |
| 12 (Grandmaster) | +100 ATK, Execute works on bosses (1% chance) |
| 13 (Legendary) | +130 ATK, "Axe Lord" title |
| 14 (Mythic) | +200 ATK, Execute at 50% HP |

#### Ranged Weapons Mastery
| Level | Bonus |
|-------|-------|
| 1 | +2 ATK, +1 Range |
| 2 | +3% Accuracy |
| 3 | +5 ATK, +2 Range |
| 4 | +5% Critical Rate |
| 5 | +10 ATK, Aimed shot +50% damage |
| 6 | +10% Accuracy |
| 7 | +20 ATK, +5 Range |
| 8 | +15% Critical Rate |
| 9 | +35 ATK, Critical damage +20% |
| 10 | Can attack over obstacles |
| 11 (Master) | +55 ATK, +25% All Ranged Damage |
| 12 (Grandmaster) | +80 ATK, Attacks never miss |
| 13 (Legendary) | +110 ATK, "Master Archer" title |
| 14 (Mythic) | +160 ATK, Unlimited Range |

#### Magic Weapons Mastery
| Level | Bonus |
|-------|-------|
| 1 | +3 MATK |
| 2 | +3% Spell Critical Rate |
| 3 | +7 MATK |
| 4 | +5% Mana Efficiency |
| 5 | +15 MATK, -5% Spell Cooldown |
| 6 | +10% Spell Critical Damage |
| 7 | +30 MATK |
| 8 | +10% Mana Efficiency |
| 9 | +50 MATK, +15% Spell Damage |
| 10 | Spells cost -10% mana |
| 11 (Master) | +80 MATK, +20% All Magic Damage |
| 12 (Grandmaster) | +120 MATK, Dual cast 10% chance |
| 13 (Legendary) | +160 MATK, "Archmage" title |
| 14 (Mythic) | +240 MATK, All spells +2 levels |

#### Shield Mastery
| Level | Bonus |
|-------|-------|
| 1 | +3 DEF |
| 2 | +3% Block Chance |
| 3 | +6 DEF |
| 4 | +5% Block Damage Reduction |
| 5 | +12 DEF, Block recovers +5 HP |
| 6 | +10% Block Chance |
| 7 | +25 DEF |
| 8 | +10% Block Damage Reduction |
| 9 | +40 DEF, Allies within 2 tiles +10% DEF |
| 10 | Block triggers counterattack |
| 11 (Master) | +65 DEF, +30% All Block Effects |
| 12 (Grandmaster) | +95 DEF, Perfect block 25% chance |
| 13 (Legendary | +130 DEF, "Guardian" title |
| 14 (Mythic) | +200 DEF, Block redirects 50% damage to self |

### 2.6 Mastery Skill Unlocks

Each mastery level unlocks passive skills:

| Mastery Level | Skill Unlocked |
|---------------|----------------|
| 3 | Basic Weapon Skill |
| 5 | Enhanced Strike |
| 7 | Advanced Technique |
| 9 | Mastery Aura |
| 11 | Ultimate Technique |
| 13 | Legendary Power |
| 14 | Mythic Awakening |

### 2.7 Cross-Weapon Mastery Synergy

Players can gain small bonuses from related weapon masteries:

| Primary Mastery | Synergy Bonus | Secondary Bonus |
|-----------------|---------------|------------------|
| Sword | +2% Crit to Dagger | +2% Crit to Rapier |
| Dagger | +5% Backstab DMG | +5% Crit DMG to Sword |
| Axe | +5% Execute DMG | +5% DMG to Bleeding |
| Ranged | +3% Accuracy | +2% Range |
| Magic | +3% Spell CD | +3% Mana Eff |
| Shield | +3% Block | +3% DEF |

### 2.8 Special Traits Affecting Mastery

Certain unique weapon features can influence the rate of mastery gain or provide immediate mastery-related benefits.

| Trait | Effect | Interaction with Mastery |
|-------|--------|--------------------------|
| KNOWLEDGE_SEEKER | +20% Mastery Point Gain | Weapons with this trait level up their respective mastery category 20% faster. |
| ANCESTRAL_ECHO | Starts with +500 MP in category | The weapon feels familiar, granting a head start in mastering its weapon type. |
| TICK_EFFICIENCY | -10% Attack Ticks | Allows for more frequent actions, indirectly increasing MP gain over time due to more actions occurring. |
| ADAPTIVE_STRIKE | MP Gain applies to two categories | E.g., a hybrid weapon might grant 50% MP to Sword and 50% MP to Magic categories simultaneously. |
| CURSED_BINDING | -30% MP Gain, but +15% Damage | Slower to master, but offers higher immediate power trade-off. |

---

## 3. TIER-SPECIFIC DIFFERENCES

### 3.1 Durability by Tier

| Tier | Base Durability | Max Durability | Repair Cost Multiplier |
|------|-----------------|----------------|----------------------|
| TIER_1 | 100 | 100 | 0.5x |
| TIER_2 | 120 | 120 | 0.7x |
| TIER_3 | 150 | 150 | 1.0x |
| TIER_4 | 180 | 180 | 1.5x |
| TIER_5 | 200 | 200 | 2.0x |
| TIER_6 | 250 | 250 | 3.0x |
| TIER_7 | 320 | 320 | 4.5x |
| TIER_8 | 400 | 400 | 7.0x |
| TIER_9 | 500 | 500 | 10.0x |
| TIER_10 | 650 | 650 | 15.0x |

### 3.2 Mastery Gain by Tier

| Tier | Base MP Gain | Bonus MP |
|------|--------------|----------|
| TIER_1-2 | 0.5x | +0 |
| TIER_3-4 | 1.0x | +0 |
| TIER_5-6 | 1.5x | +1 per kill |
| TIER_7-8 | 2.0x | +3 per kill |
| TIER_9-10 | 3.0x | +5 per kill, +10 per boss kill |

### 3.3 Special Mechanics by Tier

| Tier | Durability Trait | Mastery Trait |
|------|-----------------|---------------|
| TIER_1-3 | Basic materials | No special bonus |
| TIER_4-5 | Standard | +5% Mastery gain |
| TIER_6 | Enhanced | +10% Mastery gain |
| TIER_7 | Reinforced, -25% loss | +20% Mastery gain |
| TIER_8 | Superior, -40% loss | +30% Mastery gain |
| TIER_9 | Legendary, -50% loss | +50% Mastery gain, unlocks Mastery Aura |
| TIER_10 | Superior craftsmanship | +100% Mastery gain, unlocks all bonuses |

---

## 4. ECONOMY BALANCE

### 4.1 Repair Economy

```
Daily Repair Cost Estimate (Active Player):
- 100 battles/day
- Average 2 hits per battle
- TIER_5 weapon: 200 hits × 1.2 = 240 durability loss
- Repair cost: 240 × 2 Silver = 480 Silver/day

Silver Sink from Repairs:
- Casual: ~500 Silver/day
- Mid-game: ~2,000 Silver/day
- End-game: ~10,000 Silver/day
- Ultra-endgame: ~50,000 Silver/day
```

### 4.2 Mastery Progression Timeline

| Mastery Level | Time to Achieve (Active Player) |
|---------------|--------------------------------|
| 1-5 | ~1 week |
| 6-10 | ~1 month |
| 11-13 | ~3 months |
| 14 | ~6+ months (per weapon type) |

### 4.3 Equipment Longevity

| Tier | Average Lifespan | Repair Frequency |
|------|-----------------|------------------|
| TIER_1-3 | 2-3 days | Daily |
| TIER_4-5 | 1 week | 2-3x per week |
| TIER_6-7 | 2 weeks | Weekly |
| TIER_8-9 | 1 month | Bi-weekly |
| TIER_10 | 2+ months | Monthly |

---

## 5. IMPLEMENTATION NOTES

### 5.1 Database Schema

```prisma
model WeaponMastery {
  id              Int       @id @default(autoincrement())
  userId          Int
  weaponCategory  String    // e.g., "ONE_HANDED_SWORD"
  currentLevel    Int       @default(1)
  totalMP         Int       @default(0)
  lastUsed        DateTime  @default(now())
  
  // Bonuses (calculated, not stored)
  // attackBonus: MasteryBonuses[category][level].attack
  // critBonus: MasteryBonuses[category][level].crit
  // skillBonuses: MasteryBonuses[category][level].skills
}

model WeaponDurability {
  id              Int       @id @default(autoincrement())
  weaponInstanceId Int
  currentDurability Int
  maxDurability   Int
  isBroken        Boolean   @default(false)
  lastRepaired    DateTime  @default(now())
}
```

### 5.2 API Endpoints

```
POST /api/weapon/repair
  - Repair weapon by ID
  - Calculate cost based on durability loss
  - Deduct silver from player

POST /api/weapon/mastery
  - Get mastery stats for category
  - Return bonuses based on level

GET /api/weapon/mastery/leaderboard
  - Top players by mastery level
  - Filter by weapon category
```

### 5.3 Client Integration

```
- Display durability bar on weapon icon
- Show mastery level and progress bar
- Notification when mastery level increases
- Visual effect when weapon breaks
- Mastery bonus tooltip on hover
```

---

*Document Version: 1.0*
*System: Complete Durability & Mastery Design*
*Last Updated: Current*
