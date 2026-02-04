# Skill Variety Expansion Plan - Textical RPG

## Current State
- **AoE Skills:** 17 skills (9 basic + 8 advanced)
- **Basic Skills:** 4 skills (First Aid, Hardy, Power Strike, Iron Skin)
- **Total:** ~21 skills in database

## Proposed Skill Categories Expansion

### 1. Elemental Skills (6 elements x 3 tiers = 18 skills)

| Element | Tier 1 | Tier 2 | Tier 3 |
|---------|--------|--------|--------|
| **Fire** | Fireball | Inferno | Firestorm |
| **Ice** | Ice Shard | Frost Nova | Blizzard |
| **Lightning** | Zap | Thunder | Chain Lightning (exists) |
| **Poison** | Venom Strike | Poison Cloud | Plague |
| **Holy** | Holy Light | Divine Beam | Sanctuary |
| **Dark** | Shadow Bolt | Dark Pulse | Void |

### 2. Buff/Debuff Skills

**Self-Buffs:**
- Rage Mode (+50% ATK, -20% DEF)
- Guard Stance (+50% DEF, -20% ATK)
- Haste (+30% SPD, +20% ATK speed)
- Bloodlust (+40% ATK, lose HP each turn)
- Enrage (免疫debuffs, +20% ATK)

**Team Buffs:**
- War Cry (All allies +10% ATK)
- Shield Wall (All allies +20% DEF)
- Blessed (All allies +10% all stats)
- Focus (All allies +20% crit)
- Regen (All allies +5 HP/turn)

**Debuffs:**
- Intimidate (-10% enemy ATK)
- Slow (-20% enemy SPD)
- Weakness (-10% enemy DEF)
- Blind (-20% enemy accuracy)
- Silence (Cannot cast spells)
- Taunt (Forces enemy to attack you)

### 3. Summon Skills

**Minion Summons:**
- Fire Imp (Tier 1, 2 HP, 5 ATK)
- Ice Golem (Tier 2, 8 HP, 8 ATK)
- Thunder Drake (Tier 3, 15 HP, 20 ATK)
- Bone Warrior (Undead, 12 HP, 15 ATK)
- Shadow Assassin (Stealth, 8 HP, 25 ATK)

**Spirit Summons:**
- Light Spirit (Heals allies)
- Earth Spirit (Tanky, provokes)
- Wind Spirit (Fast, debuffs)
- Fire Spirit (High damage)

**Ultimate Summons:**
- Phoenix (Revives on death)
- Dragon (Massive AoE)
- Demon Lord (High stats, debuffs)

### 4. Transform Skills

**Transformation Forms:**
- Werewolf (Physical form)
- Vampire (Life steal)
- Elemental Form (Fire/Ice/Lightning)
- Shadow Form (Stealth + crit)
- Demon Form (High stats, HP drain)
- Angel Form (Healing + buffs)

**Partial Transforms:**
- Wings (Flight, +SPD)
- Claws (+ATK, extra attacks)
- Shell (High DEF, cannot move)
- Horns (Charge attack)

### 5. Counter/Reaction Skills

**Counter Attacks:**
- Parry (Chance to counter)
- Riposte (Counter + counter-attack)
- Blade Barrier (Reflect damage)
- Spike Armor (Damage attackers)

**Reaction Defenses:**
- Dodge (Evade attack)
- Intervene (Protect ally)
- Sanctuary (Teleport to safety)
- Time Warp (Rewind HP)

### 6. Combo/Chain Skills

**Combo Systems:**
- Double Strike (2 hits)
- Triple Slash (3 hits, last is crit)
- Finisher (More damage to low HP)
- Aerial Combo (Jump + 3 hits)
- Ground Slam (Knockdown + damage)

**Chain Reactions:**
- Explosion Trigger (Explode on hit)
- Poison Stacks (Each hit adds stack)
- Burn Damage (DoT, spreads)
- Freeze Chain (Freeze spreads)

### 7. Support Skills

**Healing:**
- Single Target Heal (30 HP)
- Group Heal (15 HP all)
- Regeneration (10 HP/turn x 3)
- Life Drain (Drain enemy HP)
- Revive (Restore fallen ally)

**Utility:**
- Teleport (Move anywhere)
- Speed Boost (+30% SPD)
- Remove Debuff (Cleanse)
- True Sight (See stealth)
- Dispel (Remove enemy buffs)

### 8. Ultimate/Signature Skills

**Class-Specific Ultimates:**
- **Warrior:** Berserker Rage (+100% ATK, self-damage)
- **Mage:** Meteor Shower (Massive AoE)
- **Rogue:** Assassin's Strike (Instant kill below 30% HP)
- **Paladin:** Divine Wrath (Holy damage + heal)
- **Necromancer:** Army of Dead (Summon 5 minions)
- **Monk:** Thousand Fists (10 rapid hits)
- **Bard:** Symphony of Power (+50% team stats)
- **Ranger:** Rain of Arrows (AoE arrows)

**Cross-Class Skills:**
- Dragon Slash (Warrior + Mage)
- Shadow Step (Rogue + Assassin)
- Holy Smite (Paladin + Cleric)
- Nature's Wrath (Druid + Ranger)

## Implementation Phases

### Phase 1: Elemental Skills
- [ ] Add 18 elemental skills (fire, ice, lightning, poison, holy, dark)
- [ ] Create elemental damage system
- [ ] Add element-based multipliers

### Phase 2: Buff/Debuff System
- [ ] Implement buff stacking system
- [ ] Add duration tracking
- [ ] Create 15+ buff/debuff skills
- [ ] Add buff UI display

### Phase 3: Summon System
- [ ] Create minion AI behavior
- [ ] Implement summon lifecycle
- [ ] Add 10+ summon skills
- [ ] Add minion stat scaling

### Phase 4: Transform Skills
- [ ] Create transformation states
- [ ] Add stat modifiers for forms
- [ ] Implement 8+ transform skills
- [ ] Add duration and cooldown

### Phase 5: Counter/Reaction System
- [ ] Create reaction skill framework
- [ ] Implement counter-attack logic
- [ ] Add 8+ counter skills
- [ ] Add counter rate calculations

### Phase 6: Combo/Chain System
- [ ] Implement combo multiplier
- [ ] Create chain reaction logic
- [ ] Add 10+ combo skills
- [ ] Add combo UI display

### Phase 7: Support Skills
- [ ] Enhance healing system
- [ ] Create utility skill framework
- [ ] Add 12+ support skills
- [ ] Add teleport/utility mechanics

### Phase 8: Ultimate Skills
- [ ] Create ultimate skill framework
- [ ] Implement class-specific ults
- [ ] Add 16+ ultimate skills
- [ ] Add ultimate charge system

## Skill Count Target

| Category | Count |
|----------|-------|
| Basic Skills | 4 |
| AoE Skills | 17 |
| Elemental Skills | 18 |
| Buff/Debuff Skills | 25 |
| Summon Skills | 15 |
| Transform Skills | 10 |
| Counter/Reaction Skills | 10 |
| Combo/Chain Skills | 12 |
| Support Skills | 15 |
| Ultimate Skills | 16 |
| **TOTAL** | **~142 skills** |

## New Skill IDs Range
- 9400-9599: Elemental Skills
- 9600-9799: Buff/Debuff Skills
- 9800-9999: Summon Skills
- 10000-10099: Transform Skills
- 10100-10199: Counter/Reaction Skills
- 10200-10299: Combo/Chain Skills
- 10300-10399: Support Skills
- 10400-10499: Ultimate Skills