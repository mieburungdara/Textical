# Unit Stat System - Additional Features

## Overview
Aspek-aspek tambahan yang mungkin kurang dalam plan utama dan perlu dipertimbangkan.

---

## 1. Trait System Integration

### Existing Trait Hooks (Sudah Ada)
- `onPreAttack`: Modify stats before attack roll
- `onPostAttack`: Post-attack modifiers
- `onPreDefend`: Modify defense stats
- `onTakeDamage`: Modify incoming damage
- `onPostHit`: Post-hit effects
- `onKill`: On kill rewards
- `onStatusApplied`: Status resistance
- `onStatusTick`: DoT tick effects
- `onStatusExpired`: Status expire effects

### Trait Examples (dari registry.js)
```javascript
// Race bonuses
{ id: "titan", description: "Immense physical power but moves slowly.", bonuses: { hp_mult: 1.5, damage_mult: 1.2, speed_mult: 0.8 } }

// Achievement-based traits
{ id: "dragon_slayer", condition: { type: "KILL_COUNT", target: "dragonkin", amount: 1000 }, bonuses: { damage_mult: 1.1 } }

// Location-based traits
{ id: "lava_walker", condition: { type: "STEP_COUNT", target: "lava", amount: 5000 }, bonuses: { res_fire_bonus: 0.5 } }
```

### Implementation untuk Stat System
```javascript
async function applyTraitBonuses(stats, heroData, applyMod) {
    const traits = heroData.traits || [];
    
    for (const trait of traits) {
        const traitData = await getTraitDefinition(trait);
        if (traitData.bonuses) {
            for (const [stat, value] of Object.entries(traitData.bonuses)) {
                // Parse bonus type (e.g., "hp_mult" -> percentage multiplier)
                if (stat.endsWith('_mult')) {
                    applyMod(stat.replace('_mult', ''), value - 1.0, 1, `Trait:${trait}`);
                } else {
                    applyMod(stat, value, 0, `Trait:${trait}`);
                }
            }
        }
    }
}
```

---

## 2. Status Effects System

### Existing Status Types (Sudah Ada)
| Status | Type | Effect | Stat Modifier |
|--------|------|--------|---------------|
| BURN | DoT | -HP/tick, -ATK | defense *= 0.9 |
| STUN | Debuff | Can't act | speed *= 0 |
| LEADEN | Debuff | -50% speed | speed -= 50% |
| FREEZE | Debuff | Can't act | speed = 0 |
| POISON | DoT | -HP/tick | N/A |
| STEALTH | Buff | Hidden | N/A |
| LINKED | Debuff | Share damage | N/A |

### Status Implementation Pattern
```javascript
class BurnStatus extends BaseStatus {
    constructor(duration, power) {
        super('BURN', duration, power);
    }
    
    onTick(unit, sim) {
        const damage = this.power;
        unit.takeDamage(damage);
        // Reduce attack
        unit.temporaryStats.attack_damage = (unit.temporaryStats.attack_damage || 0) - (unit.stats.attack_damage * 0.1);
    }
    
    onExpire(unit, sim) {
        // Restore stats
        unit.temporaryStats.attack_damage = 0;
    }
}
```

---

## 3. Behavior Tree (AI) Integration

### Existing BT Nodes
- `CheckTrait`: Check if unit has trait
- `CheckHealth`: HP threshold check
- `CheckMana`: MP threshold check
- `HasStatusEffect`: Check status effects
- `IsStunned`: Check stun status
- `CheckTargetStatus`: Check target's status
- `IsTargetInRange`: Range check
- `NearbyUnitsCount`: Count nearby units
- `CheckTerrain`: Check terrain type

### BT Stat Modifiers
```javascript
// Movement strategy selection based on stats
const canSlipstream = actor.traits.includes("disruptor");
const range = unit.stats.attack_range || 1;
const effectiveSpeed = this.getStat("speed");
```

---

## 4. Environment Effects (World Cycle)

### Existing Environmental Resolvers
```javascript
// EnvironmentalResolver.js
resolveModifiers(hour, weatherType) {
    // Time-based modifiers
    const timeMods = {
        'NIGHT': { atkMult: 0.9, defMult: 1.1 },
        'DAY': { atkMult: 1.0, defMult: 1.0 }
    };
    
    // Weather modifiers
    const weatherMods = {
        'RAIN': { atkMult: 0.95, speedMult: 0.9 },
        'STORM': { atkMult: 0.85, defMult: 0.95 }
    };
    
    return combinedModifiers;
}
```

### Terrain Effects (Battle Grid)
| Terrain | Effect | Stat Impact |
|---------|--------|-------------|
| LAVA | BURN | Apply Burn status |
| HEAL | Regenerate | +HP per tick |
| DRAIN | Damage | -HP per tick |
| WATER | Slow | -movement speed |

---

## 5. Faction Influence System

### Existing Faction Buffs
```javascript
// InfluenceResolver.js
resolveFactionBuffs(influencePoints) {
    const buffs = { attack_damage: 0, defense: 0, miningYieldMult: 1.0 };
    
    if (points >= DOMINATION_THRESHOLD) {
        buffs.attack_damage = 0.15;  // 15%
        buffs.defense = 0.15;
        buffs.miningYieldMult = 1.5;
    } else if (points >= 2500) {
        buffs.attack_damage = 0.05;
        buffs.defense = 0.05;
        buffs.miningYieldMult = 1.2;
    }
    
    return buffs;
}
```

---

## 6. Crafting Quality System

### Existing QualityResolver
```javascript
// QualityResolver.js
resolveQuality(materialQuality, skillLevel, luckBonus) {
    const baseChance = 0.3;
    const skillBonus = skillLevel * 0.02;
    const luckFactor = Math.random() * luckBonus;
    
    const totalChance = baseChance + skillBonus + luckFactor;
    const roll = Math.random();
    
    if (roll < 0.1) return 'MYTHIC';
    if (roll < 0.4) return 'LEGENDARY';
    if (roll < 0.7) return 'EPIC';
    if (roll < 0.9) return 'RARE';
    return 'UNCOMMON';
}
```

---

## 7. Race Bonus System

### Existing Race Bonuses
```javascript
// Race bonus data structure
{
    "human": { stat_bonus: { str: 2, dex: 2, int: 2, vit: 2 }, skill_bonus: [] },
    "elf": { stat_bonus: { dex: 4, int: 3 }, skill_bonus: ["archery"] },
    "dwarf": { stat_bonus: { str: 4, vit: 3 }, skill_bonus: ["mining"] },
    "orc": { stat_bonus: { str: 5, vit: 2 }, skill_bonus: ["combat"] }
}
```

---

## 8. Gathering Duration Calculator

### Existing Stat-Based Duration
```javascript
// DurationCalculator.js
calculatePlantOrFishDuration(baseTime, statValue) {
    // Duration = ceil(BaseTime / max(0.5, statValue / 10))
    return Math.ceil(baseTime / Math.max(0.5, statValue / 10));
}

calculateMiningDuration(baseTime, hardness, str) {
    // Duration = baseTime * (hardness / max(1, str / 10))
    return Math.ceil(baseTime * (hardness / Math.max(1, str / 10)));
}
```

---

## 9. Combat Rules Integration

### Existing Combat Calculation
```javascript
// combatRules.js
static calculateDamage(attacker, defender, dmgMult = 1.0, element = 0) {
    // 1. Accuracy Check (DEX based)
    const acc = attacker.getStat("accuracy");
    const dodge = defender.getStat("dodge_rate");
    const hitChance = Math.min(100, Math.max(5, acc - dodge));
    
    // 2. Armor Penetration
    const rawDef = defender.getStat("defense");
    const arPen = attacker.getStat("armor_penetration");
    const effectiveDef = Math.max(0, rawDef - arPen);
    
    // 3. Base Damage & Multipliers
    const baseAtk = attacker.getStat("attack_damage");
    let damage = Math.max(1, (baseAtk * dmgMult) - effectiveDef);
    
    // 4. Critical Hit
    const isCrit = Math.random() < attacker.getStat("crit_chance");
    if (isCrit) {
        damage = Math.floor(damage * attacker.getStat("crit_damage"));
    }
    
    // 5. Block Logic
    const isBlocked = Math.random() < defender.getStat("block_chance");
    if (isBlocked) {
        const blockMitigation = defender.getStat("block_power") || 0.5;
        damage = Math.floor(damage * (1 - blockMitigation));
    }
    
    return { damage, isCrit, isBlocked };
}
```

---

## 10. Evolution/Deed System

### Trait Unlock Based on Deeds
```javascript
// evolutionService.js
async checkEvolutionTriggers(hero) {
    const deeds = JSON.parse(hero.deeds || '{}');
    
    const evolutionCriteria = [
        { deed: "total_kills", threshold: 100, reward: "berserker_trait" },
        { deed: "boss_kills", threshold: 10, reward: "boss_slayer_trait" },
        { deed: "distance_traveled", threshold: 10000, reward: "explorer_trait" }
    ];
    
    for (const criteria of evolutionCriteria) {
        if (deeds[criteria.deed] >= criteria.threshold) {
            await unlockTrait(hero.id, criteria.reward);
        }
    }
}
```

---

## 11. Skill-Based Stat Modifiers

### Passive Skill Effects
```javascript
// skillExecutor.js
_executeBuffSkill(source, target, meta, sim) {
    // Apply stat modifiers from skills
    const statKey = meta.statKey;
    const statValue = meta.statValue;
    
    if (meta.isTemporary) {
        target.temporaryStats[statKey] = (target.temporaryStats[statKey] || 0) + statValue;
    } else {
        // Permanent stat increase
        await modifyHeroStat(target.id, statKey, statValue);
    }
}
```

---

## 12. Resource Type System

### Mana/Rage/Energy Types
```javascript
const RESOURCE_TYPES = {
    MANA: { regenMult: 0.05, startPercent: 1.0 },
    RAGE: { regenMult: 0, startPercent: 0 },
    ENERGY: { regenMult: 0.1, startPercent: 1.0 }
};

// ResourceResolver.js
regenResource(unit, deltaTime) {
    const resConfig = RESOURCE_TYPES[unit.resourceType];
    const regen = Math.floor(unit.stats.mana_max * resConfig.regenMult);
    unit.gainMana(regen, sim);
}
```

---

---

## 14. Action Points (AP) System

### AP Mechanics
- **Starting AP**: Based on `initiative` stat
- **AP per tick**: `speed * delta`
- **AP threshold**: 100.0 untuk take action
- **AP Modifiers**: Skills, buffs, status effects

### Implementation
```javascript
// BattleUnit.js
modifyAP(amount, sim) {
    const old = this._actionPoints;
    this._actionPoints += amount;
    traitService.executeHook("onActionPointsChange", this, old, this._actionPoints, sim);
}

isReady() {
    if (this.activeEffects.some(e => e.type === "STUN" || e.type === "CRYSTALLIZED")) return false;
    return this._actionPoints >= 100.0;
}
```

---

## 15. Dynamic Resource System

### Resource Types
| Type | Starting | Regen | Combat Gain |
|------|----------|-------|-------------|
| MANA | 100% | 5% of max | N/A |
| RAGE | 0% | 0% | +1/10 dmg taken, +5/hit |
| ENERGY | 100% | 20 flat | N/A |

### Stat Requirements
- Mana regen affected by: INT, skill_power
- Rage gain affected by: damage taken, damage dealt
- Energy regen affected by: DEX

### Implementation
```javascript
handleCombatGain(unit, eventType, amount, sim) {
    if (unit.data.resourceType !== "RAGE") return;
    
    if (eventType === "TAKE_DAMAGE") {
        const gain = Math.floor(amount / 10);
        unit.gainMana(gain, sim);
    } else if (eventType === "DEAL_DAMAGE") {
        unit.gainMana(5, sim);
    }
}
```

---

## 16. Stealth System

### Stealth Mechanics
- **Detection**: Units with `truesight` trait can detect stealthed units
- **Reveal on Attack**: Attacking reveals stealth
- **Stat Modifiers**: Stealth may give dodge bonus

### Implementation
```javascript
// BattleUnit.js
reveal(sim) {
    if (this.isStealthed) {
        this.removeEffect("STEALTH", sim);
    }
}

// AI detection
const hasTrueSight = traitService.executeHook("CheckTrait", actor, sim, { traitName: "truesight" });
```

---

## 17. Durability Tracking

### Durability Mechanics
- **Loss**: Damage taken, attacks made
- **Stat Penalty**: Broken items (0 durability) give 0 stats
- **Repair**: NPC or crafting to restore

### Implementation
```javascript
recordDurabilityLoss(slotKey, amount = 1) {
    const item = this.equippedItems.find(i => i.slot === slotKey);
    if (item) {
        this.durabilityLoss[item.instanceId] = (this.durabilityLoss[item.instanceId] || 0) + amount;
    }
}

// In stat calculation
applyEquipmentStats(equipment, stats, applyMod) {
    for (const eq of equipment) {
        const durabilityPercent = eq.currentDurability / eq.maxDurability;
        if (durabilityPercent <= 0) {
            // Skip broken items
            continue;
        }
        const statPenalty = 1.0 - (durabilityPercent * 0.5);
        // Apply stats with penalty
    }
}
```

---

## 18. Directional Combat

### Facing System
- **Directions**: NORTH, SOUTH, EAST, WEST
- **Flanking Bonus**: Attack from behind gives bonus
- **Defense Bonus**: Attack from front gives defense bonus

### Implementation
```javascript
// battleRules.js
const directionalAccBonus = _getDirectionalBonus(attacker.facing, defender.facing);
// Behind: +10% accuracy
// Front: +5% defense
```

---

## 19. Skill Cooldown System

### Cooldown Mechanics
- **Per Skill**: Each skill has its own cooldown
- **CDR Stat**: Cooldown Reduction from stats/skills
- **Max CDR Cap**: Usually 40-75%

### Implementation
```javascript
// In BattleUnit
skillCooldowns = {};

useSkill(skillId, sim) {
    if (this.skillCooldowns[skillId] > 0) {
        throw new Error("Skill on cooldown");
    }
    
    const cdr = this.getStat("cooldown_reduction");
    const cooldown = skill.cooldown * (1 - cdr);
    this.skillCooldowns[skillId] = cooldown;
}

tick(delta, sim) {
    for (const [skillId, cd] of Object.entries(this.skillCooldowns)) {
        this.skillCooldowns[skillId] = Math.max(0, cd - delta);
    }
}
```

---

## 20. Regeneration Tick System

### Regen Mechanics
- **HP Regen**: 2% of max HP per tick (battle)
- **Mana Regen**: 5% of max MP per tick
- **Regen Modifiers**: Buffs, skills, status effects

### Implementation
```javascript
applyRegen(sim) {
    // 1. HP Regen (Standard)
    const regen = Math.floor(this.stats.health_max * 0.02);
    this.currentHealth = Math.min(this.stats.health_max, this.currentHealth + regen);
    
    // 2. Resource Regen
    const resourceResolver = require('./rules/ResourceResolver');
    resourceResolver.applyRegen(this, sim);
}
```

---

## 21. Position/Grid Effects

### Grid-Based Stats
- **Adjacency Bonuses**: Bonus when near allies
- **Obstacle Effects**: Wall/obstacle impact
- **Elevation Effects**: High ground bonus

### Implementation
```javascript
// Movement/AStarMovement.js
// Slipstream capability (disruptor trait)
const canSlipstream = actor.traits.includes("disruptor");

// Adjacency bonus
const allies = units.filter(u => u && u.teamId === actor.teamId && !u.isDead);
for (const ally of allies) {
    const dist = sim.grid.getDistance(unit.gridPos, ally.gridPos);
    if (dist <= 1) unit.temporaryStats.defense = (unit.temporaryStats.defense || 0) + 5;
}
```

---

## 22. Coverage/Dodge Mechanics

### Dodge Types
- **Dodge Rate**: Flat dodge chance
- **Miss**: Accuracy check failure
- **Perfect Dodge**: Rare chance to dodge (LUK-based)

### Implementation
```javascript
// combatRules.js
const dodgeChance = (defender.stats.dodge_rate || 0) + (defMods.bonusDodge || 0);
const accuracy = (attacker.getStat("accuracy") || 100) + (atkMods.bonusAcc || 0);

if (Math.random() * 100 > (accuracy - dodgeChance)) {
    // Miss
    traitService.executeHook("onDodge", defender, attacker, sim);
}

// Perfect dodge (LUK-based)
const perfectDodgeChance = attacker.getStat("perfect_dodge_chance") || 0;
if (Math.random() < perfectDodgeChance) {
    return { damage: 0, isPerfectDodge: true };
}
```

---

## Summary of Battle System Integration

| Feature | Priority | Source File | Notes |
|---------|----------|-------------|-------|
| Action Points | HIGH | battleUnit.js | Initiative-based |
| Resource Types | HIGH | ResourceResolver.js | Mana/Rage/Energy |
| Stealth | MEDIUM | battleUnit.js | Truesight detection |
| Durability | HIGH | battleUnit.js | Broken items = 0 stats |
| Directional | LOW | combatRules.js | Flanking/cover |
| Skill Cooldowns | MEDIUM | skillResolver.js | CDR stat |
| Regen System | HIGH | battleUnit.js | HP/MP regen |
| Grid Effects | MEDIUM | AStarMovement.js | Adjacency bonus |
| Dodge/Miss | HIGH | combatRules.js | Accuracy check |

---

## 2. Equipment Quality Impact

### Quality Tiers
| Tier | Stat Multiplier | Color | Chance |
|------|-----------------|-------|--------|
| Common | 1.0x | Gray | 40% |
| Uncommon | 1.2x | Green | 30% |
| Rare | 1.5x | Blue | 15% |
| Epic | 2.0x | Purple | 10% |
| Legendary | 3.0x | Orange | 4% |
| Mythic | 5.0x | Red | 1% |

### Implementation
```javascript
function calculateQualityMultiplier(quality) {
    const multipliers = {
        COMMON: 1.0,
        UNCOMMON: 1.2,
        RARE: 1.5,
        EPIC: 2.0,
        LEGENDARY: 3.0,
        MYTHIC: 5.0
    };
    return multipliers[quality] || 1.0;
}

function applyQualityScaling(stats, item) {
    const multiplier = calculateQualityMultiplier(item.quality);
    
    for (const stat of item.template.stats) {
        const scaledValue = stat.statValue * multiplier * item.powerScale;
        applyMod(stat.statKey, scaledValue, 0, `Quality:${item.quality}`);
    }
}
```

---

## 3. Skill-Based Stats

### Passive Skills
```prisma
model SkillTemplate {
  id            Int      @id
  name          String
  category      String   // ACTIVE, PASSIVE
  type          String   // DAMAGE, HEAL, BUFF, DEBUFF
  
  // Passive effects
  isPassive     Boolean  @default(false)
  statKey       String?
  statValue     Float?
  multiplier    Float?   // Per skill level
  
  // Requirements
  requiredClassId Int?
  requiredLevel  Int      @default(1)
  
  heroes        HeroSkill[]
}

model HeroSkill {
  id            Int      @id @default(autoincrement())
  heroId        Int
  hero          Hero     @relation(fields: [heroId], references: [id])
  skillId       Int
  skill         SkillTemplate @relation(fields: [skillId], references: [id])
  
  level         Int      @default(1)
  isActive      Boolean  @default(true)
  unlockedAt    DateTime @default(now())
  
  @@unique([heroId, skillId])
}
```

---

## 4. Promotion/Tier System

### Promotion Effects
```prisma
model PromotionTier {
  id              Int      @id
  name            String   // Bronze, Silver, Gold, Platinum
  statMultiplier  Float    @default(1.0)
  statBonus       Json     // { "str": 10, "vit": 15 }
  
  requiredLevel   Int
  requiredClassLevel Int
  
  costSilver      Int      @default(0)
  costGold        Int      @default(0)
  
  heroes          HeroPromotion[]
}

model HeroPromotion {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  tierId          Int
  tier            PromotionTier @relation(fields: [tierId], references: [id])
  
  promotedAt      DateTime @default(now())
  
  @@unique([heroId, tierId])
}
```

### Stat Bonus from Promotion
```javascript
async function applyPromotionBonuses(stats, heroId) {
    const promotions = await db.heroPromotion.findMany({
        where: { heroId },
        include: { tier: true }
    });
    
    for (const promo of promotions) {
        // Apply multiplier
        if (promo.tier.statMultiplier !== 1.0) {
            for (const [key, stat] of Object.entries(stats)) {
                if (stat instanceof EnhancedStat) {
                    stat.addModifier({
                        value: promo.tier.statMultiplier - 1.0,
                        type: StatModifier.Type.PERCENT_ADD,
                        source: `Promotion:${promo.tier.name}`
                    });
                }
            }
        }
        
        // Apply flat bonuses
        if (promo.tier.statBonus) {
            for (const [key, value] of Object.entries(promo.tier.statBonus)) {
                applyMod(key, value, 0, `Promotion:${promo.tier.name}`);
            }
        }
    }
}
```

---

## 5. Mastery System

### Class Mastery Effects
```prisma
model MasteryTemplate {
  id              Int      @id
  name            String
  classId         Int      // Related combat class
  
  // Mastery bonuses per level
  bonusStats      Json     // { "atkGrowth": 0.1, "critChance": 0.02 }
  
  // Unlock requirements
  requiredLevel   Int      @default(50
  
  heroes          HeroMastery[]
}

model HeroMastery {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  masteryId       Int
  mastery         MasteryTemplate @relation(fields: [masteryId], references: [id])
  
  level           Int      @default(1)
  xp              Int      @default(0)
  isUnlocked      Boolean  @default(false)
  unlockedAt      DateTime?
  
  @@unique([heroId, masteryId])
}
```

---

## 6. Status Effects Integration

### Status Effect Types
| Type | Stat Impact | Duration | Example |
|------|-------------|----------|---------|
| Poison | -HP/tick | 10s | Damage over time |
| Burn | -HP/tick + -ATK | 8s | Fire damage |
| Freeze | -SPD, -ATK | 3s | Stun |
| Shock | -DEF, can't act | 2s | Stun |
| Bleed | -HP/tick | 6s | Physical DoT |
| Heal | +HP/tick | Until full | Regeneration |

### Implementation
```javascript
async function applyStatusEffects(stats, heroId, combatState) {
    const activeStatuses = await getActiveStatuses(heroId);
    
    for (const status of activeStatuses) {
        switch (status.type) {
            case 'POISON':
                // -10 HP per tick
                stats.health_max.addModifier({
                    value: -10,
                    type: StatModifier.Type.FLAT,
                    source: `Status:${status.name}`
                });
                break;
                
            case 'BURN':
                // -5% ATK
                stats.attack_damage.addModifier({
                    value: -0.05,
                    type: StatModifier.Type.PERCENT_ADD,
                    source: `Status:${status.name}`
                });
                break;
                
            case 'FREEZE':
                // -50% SPD
                stats.speed.addModifier({
                    value: -0.5,
                    type: StatModifier.Type.PERCENT_ADD,
                    source: `Status:${status.name}`
                });
                break;
        }
    }
}
```

---

## 7. Food/Consumable Effects

### Consumable System
```prisma
model ConsumableTemplate {
  id              Int      @id
  name            String
  description     String
  category        String   // FOOD, POTION, SCROLL
  
  // Effect
  effectType      String   // BUFF, HEAL, RESTORE, TELEPORT
  effectDuration  Int      @default(0) // 0 = instant
  
  // Stats
  buffStatKey     String?
  buffStatValue   Float?
  buffIsPercent   Boolean  @default(false)
  
  // Requirements
  requiredLevel   Int      @default(1)
  
  instances       InventoryItem[]
}

model ConsumableEffect {
  id              Int      @id
  heroId          Int
  itemId          Int
  effectType      String
  expiresAt       DateTime
  statKey         String?
  statValue       Float?
}
```

---

## 8. Guild/Party Buffs

### Guild Facility Buffs
```javascript
function getGuildBuffs(guildId) {
    return {
        // From facilities
        'smithy': { attack_damage: 0.05 },
        'armory': { defense: 0.1 },
        'alchemy_lab': { skill_power: 0.08 },
        'guild_hall': { all_stats_bonus: 0.02 },
        
        // From active buffs
        'guild_feast': { hp_regen: 0.5, mana_regen: 0.3 },
        'rallying_cry': { attack_damage: 0.1, speed: 0.1 }
    };
}
```

### Party Buffs
```javascript
async function applyPartyBuffs(stats, heroId) {
    const party = await getHeroParty(heroId);
    
    for (const member of party.members) {
        if (member.id === heroId) continue;
        
        // Check for party-wide buffs
        const activeBuffs = await getActiveBuffs(member.id);
        for (const buff of activeBuffs) {
            if (buff.isPartyWide) {
                applyMod(buff.statKey, buff.statValue * buff.partyMultiplier, 
                    buff.isPercent ? 1 : 0, `PartyBuff:${buff.name}`);
            }
        }
    }
}
```

---

## 9. Environment Effects

### Terrain/Weather Modifiers
```prisma
model TerrainEffect {
  id              Int      @id
  terrainTypeId   String
  effectType      String   // BURN, SLOW, HEAL, DRAIN
  chance          Float    @default(1.0)
  power           Float    @default(0)
  statKey         String?
  statValue       Float?
}

model WeatherEffect {
  id              Int      @id
  weatherTypeId   String
  effectType      String
  statModifier    Float    @default(0)
  description     String
}
```

### Implementation
```javascript
async function applyEnvironmentEffects(stats, heroId) {
    const location = await getHeroLocation(heroId);
    
    // Terrain effects
    const terrain = await getTerrainEffects(location.terrainType);
    if (Math.random() < terrain.chance) {
        applyMod(terrain.statKey, terrain.statValue, 0, `Terrain:${terrain.effectType}`);
    }
    
    // Weather effects
    const weather = await getCurrentWeather(location.regionId);
    if (weather.statModifier) {
        applyMod('all_stats_bonus', weather.statModifier, 1, `Weather:${weather.name}`);
    }
    
    // Time of day effects
    const timeBonus = getTimeOfDayBonus();
    if (timeBonus) {
        applyMod(timeBonus.statKey, timeBonus.value, 0, `TimeOfDay:${timeBonus.period}`);
    }
}
```

---

## 10. Title System Effects

### Title Bonuses
```prisma
model TitleTemplate {
  id              Int      @id
  name            String   @unique
  description     String
  icon            String?
  
  // Requirements
  requirementType String   // KILL_COUNT, LEVEL_REACH, ACHIEVEMENT
  requirementValue Int
  
  // Bonus
  bonusStats      Json     // { "attack_damage": 10, "crit_chance": 0.05 }
  
  isPrefix        Boolean  @default(false)
  isHidden        Boolean  @default(false)
  
  heroes          HeroTitle[]
}

model HeroTitle {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  titleId         Int
  title           TitleTemplate @relation(fields: [titleId], references: [id])
  
  isActive        Boolean  @default(false)
  earnedAt        DateTime @default(now())
  
  @@unique([heroId, titleId])
}
```

### Apply Title Bonuses
```javascript
async function applyTitleBonuses(stats, heroId) {
    const activeTitle = await getActiveTitle(heroId);
    if (!activeTitle) return;
    
    const title = activeTitle.title;
    if (title.bonusStats) {
        for (const [key, value] of Object.entries(title.bonusStats)) {
            applyMod(key, value, 0, `Title:${title.name}`);
        }
    }
}
```

---

## 11. Faction Perks

### Faction Reputation Rewards
```prisma
model FactionPerk {
  id              Int      @id
  factionId       Int
  faction         Faction @relation(fields: [factionId], references: [id])
  
  rankRequired    Int
  perkName        String
  description     String
  
  statBonus       Json     // { "attack_damage": 0.1 }
  skillUnlockId   Int?
  
  heroes          HeroFactionPerk[]
}

model HeroFactionPerk {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  perkId          Int
  perk            FactionPerk @relation(fields: [perkId], references: [id])
  
  isActive        Boolean  @default(true)
  
  @@unique([heroId, perkId])
}
```

---

## 12. Durability Effects

### Broken Items Give 0 Stats
```javascript
function applyEquipmentStats(equipment, stats, applyMod) {
    for (const eq of equipment) {
        const instance = eq.itemInstance;
        
        // Skip broken items
        if (instance.currentDurability <= 0) {
            console.log(`[STATS] Skipping broken item: ${instance.template.name}`);
            continue;
        }
        
        // Apply durability penalty
        const durabilityPercent = instance.currentDurability / instance.maxDurability;
        const statPenalty = 1.0 - (durabilityPercent * 0.5); // Max 50% penalty at 0 durability
        
        // Apply stats with durability penalty
        for (const stat of instance.template.stats) {
            const adjustedValue = stat.statValue * statPenalty;
            applyMod(stat.statKey, adjustedValue, 0, `Equip:${instance.template.name}`);
        }
    }
}
```

---

## 13. Power Scale Integration

### Item Power Scaling
```javascript
function calculatePowerScale(item) {
    // Power scale based on item level and quality
    const baseScale = item.template.basePowerScale || 1.0;
    const qualityMultiplier = getQualityMultiplier(item.quality);
    const levelMultiplier = 1 + (item.level - 1) * 0.1;
    
    return baseScale * qualityMultiplier * levelMultiplier;
}

function applyPowerScaledStats(item, stats, applyMod) {
    const powerScale = calculatePowerScale(item);
    
    for (const stat of item.template.stats) {
        const scaledValue = stat.statValue * powerScale;
        applyMod(stat.statKey, scaledValue, 0, `Equip:${item.template.name}`);
    }
}
```

---

## Summary of Additional Features

| Feature | Priority | Complexity | Files Affected |
|---------|----------|------------|----------------|
| Buff/Debuff System | High | Medium | DB, Backend, Client |
| Equipment Quality | High | Low | Backend, Client |
| Skill-Based Stats | High | Medium | DB, Backend |
| Promotion/Tier | Medium | Medium | DB, Backend |
| Mastery System | Medium | Medium | DB, Backend |
| Status Effects | High | High | DB, Backend, Client |
| Consumables | Medium | Low | DB, Backend |
| Guild/Party Buffs | Low | Medium | Backend |
| Environment Effects | Low | Medium | DB, Backend |
| Title System | Low | Low | DB, Backend |
| Faction Perks | Low | Low | DB, Backend |
| Durability Effects | Medium | Low | Backend |
| Power Scale | Medium | Low | Backend |

## Recommendations

**High Priority (Should Include):**
1. Buff/Debuff System - Core untuk combat
2. Equipment Quality - Langsung mempengaruhi stats
3. Skill-Based Stats - Passive skills penting
4. Status Effects - Combat nuance
5. Durability Effects - Already partially implemented

**Medium Priority (Nice to Have):**
6. Promotion/Tier System
7. Mastery System
8. Consumables
9. Power Scale Integration

**Low Priority (Future):**
10. Guild/Party Buffs
11. Environment Effects
12. Title System
13. Faction Perks
