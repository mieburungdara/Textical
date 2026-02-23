# Textical Tier 1 Class Documentation

## Table of Contents
1. [Overview of Tier 1 Classes](#overview)
2. [Complete Class Reference](#complete-class-reference)
3. [Base Statistics by Class](#base-statistics-by-class)
4. [Default Skills](#default-skills)
5. [Role and Function in Combat](#role-and-function-in-combat)
6. [Strengths and Weaknesses](#strengths-and-weaknesses)
7. [Combat Strategies](#combat-strategies)
8. [Progression Paths](#progression-paths)
9. [Optimal Builds](#optimal-builds)

---

## Overview of Tier 1 Classes

Tier 1 classes are the foundational character classes in Textical. All players begin their journey with either the **Novice** class (Tier 0) or directly select a Tier 1 class. There are **7 Tier 1 classes** currently defined in the game:

| Class ID | Name | Focus | Playstyle |
|----------|------|-------|-----------|
| 1101 | Warrior | Defense/Tank | Melee |
| 1102 | Scout | Mobility/Recon | Hybrid |
| 1103 | Apprentice | Magic | Ranged |
| 1104 | Votary | Endurance | Melee |
| 1105 | Brute | Strength | Melee |
| 1106 | Duelist | Precision | Melee |
| 1107 | Archer | Ranged DPS | Ranged |

---

## Complete Class Reference

### 1. Warrior (ID: 1101)

**Description:**
> "The backbone of any civilized army, the Warrior is a student of steel and stamina. Clad in toughened hide and iron, they stand at the frontlines, absorbing the impact of the enemy's first wave. They believe that a battle is won not by the swiftness of the blade, but by the resilience of the heart."

**Lore:** Warriors form the backbone of every army. Trained in the use of heavy weapons and shields, they excel at absorbing damage while protecting more vulnerable allies.

**Base Statistics (Level 1):**
| Stat | Value | Growth/Level |
|------|-------|-------------|
| HP | 1500 | +100 |
| MP | 200 | +15 |
| Attack | 150 | +12 |
| Defense | 250 | +20 |
| Magic Attack | 30 | +2 |
| Magic Defense | 80 | +5 |
| Speed | 50 | +3 |
| Crit Chance | 5% | +0.3% |
| Crit Damage | 150% | +2% |
| Block Chance | 15% | +1% |

**Default Skills:**
- **Slash** (Active): Basic melee attack
- **Block** (Active): Defensive stance
- **Charge** (Active): Rush toward enemy

**Passive Traits:**
- Endurance (+10% max HP)
- Toughness (+5% defense)

**Progression:**
- → Knight (Tier 2, ID: 2101) - Focus on Defense
- → Berserker (Tier 2) - Focus on Offense

---

### 2. Scout (ID: 1102)

**Description:**
> "Moving like a whisper through the undergrowth, the Scout is the ultimate explorer. They are trained to see what others miss and to tread where others fear to step. A Scout relies on their superior mobility and keen senses to navigate the 50x50 grid, identifying enemy positions and striking from the shadows."

**Lore:** Scouts are masters of reconnaissance and stealth. They move swiftly across the battlefield, gathering intelligence and striking at vulnerable targets.

**Base Statistics (Level 1):**
| Stat | Value | Growth/Level |
|------|-------|-------------|
| HP | 1100 | +70 |
| MP | 350 | +25 |
| Attack | 200 | +18 |
| Defense | 120 | +8 |
| Magic Attack | 100 | +8 |
| Magic Defense | 150 | +10 |
| Speed | 150 | +12 |
| Crit Chance | 12% | +0.8% |
| Crit Damage | 160% | +3% |
| Dodge Rate | 15% | +1% |

**Default Skills:**
- **Quick Shot** (Active): Fast ranged attack
- **Stealth** (Active): Become invisible temporarily
- **Trap** (Active): Place a trap for enemies

**Passive Traits:**
- Alertness (+10% accuracy)
- Evasion (+5% dodge)

**Progression:**
- → Sniper (Tier 2) - Focus on Precision
- → Assassin (Tier 2) - Focus on Shadow

---

### 3. Apprentice (ID: 1103)

**Description:**
> "The path of magic is long and fraught with peril, and the Apprentice has only just begun to scratch the surface of the universe's secrets. They spend their days studying ancient scrolls and practicing the precise movements required to channel raw mana into cohesive spells."

**Lore:** Apprentices are novice magic users who have begun their journey into the arcane arts. They can cast basic spells but lack the power of fully trained mages.

**Base Statistics (Level 1):**
| Stat | Value | Growth/Level |
|------|-------|-------------|
| HP | 900 | +50 |
| MP | 600 | +50 |
| Attack | 50 | +3 |
| Defense | 80 | +5 |
| Magic Attack | 250 | +25 |
| Magic Defense | 200 | +15 |
| Speed | 70 | +5 |
| Crit Chance | 5% | +0.3% |
| Crit Damage | 150% | +2% |
| Mana Regen | 5 | +0.5 |

**Default Skills:**
- **Fireball** (Active): Ranged fire damage (1.8x multiplier, AOE)
- **Ice Shard** (Active): Single target ice damage (1.6x multiplier)
- **Zap** (Active): Quick lightning damage (1.7x multiplier)

**Passive Traits:**
- Mana Boost (+15% max MP)
- Focus (+5% spell accuracy)

**Progression:**
- → Wizard (Tier 2, ID: 2111) - Focus on Arcane AOE
- → Necromancer (Tier 2) - Focus on Death Magic

---

### 4. Votary (ID: 1104)

**Description:**
> "The Votary does not seek to conquer the world, but to conquer themselves. Through meditation and rigorous physical conditioning, they have developed a body that can endure the most hostile environments. A Votary believes that true power comes from resilience."

**Lore:** Votaries are spiritual warriors who have dedicated themselves to physical and mental discipline. They can survive in harsh environments and resist adverse conditions.

**Base Statistics (Level 1):**
| Stat | Value | Growth/Level |
|------|-------|-------------|
| HP | 1800 | +120 |
| MP | 300 | +20 |
| Attack | 120 | +10 |
| Defense | 200 | +15 |
| Magic Attack | 80 | +5 |
| Magic Defense | 180 | +12 |
| Speed | 55 | +3 |
| Crit Chance | 5% | +0.3% |
| Crit Damage | 150% | +2% |
| Tenacity | 10% | +1% |

**Default Skills:**
- **Meditate** (Active): Recover HP and MP
- **Endure** (Active): Temporary damage resistance
- **Focus Mind** (Active): Clear debuffs

**Passive Traits:**
- Fortitude (+10% HP)
- Willpower (+10% status resistance)

**Progression:**
- → Paladin (Tier 2) - Holy warrior
- → Monk (Tier 2) - Hand-to-hand specialist

---

### 5. Brute (ID: 1105)

**Description:**
> "In the wild places of the world, strength is the only law. The Brute is a primal force of nature, eschewing the refined techniques of the city-born for raw, unbridled power. They do not fight for honor or duty, but for the thrill of the hunt."

**Lores:** Brutes are powerful warriors who rely on overwhelming strength rather than technique. They wield massive weapons and can deal devastating damage through sheer force.

**Base Statistics (Level 1):**
| Stat | Value | Growth/Level |
|------|-------|-------------|
| HP | 2000 | +130 |
| MP | 150 | +10 |
| Attack | 280 | +25 |
| Defense | 150 | +10 |
| Magic Attack | 30 | +2 |
| Magic Defense | 80 | +5 |
| Speed | 45 | +2 |
| Crit Chance | 8% | +0.5% |
| Crit Damage | 180% | +3% |
| Life Steal | 3% | +0.3% |

**Default Skills:**
- **Smash** (Active): Heavy damage attack (2.0x multiplier)
- **Bellow** (Active): Fear enemies
- **Rage** (Active): Increase attack power

**Passive Traits:**
- Titan Strength (+15% attack)
- Beast Nature (+5% life steal)

**Progression:**
- → Berserker (Tier 2) - High damage dealer
- → Juggernaut (Tier 2) - Unstoppable tank

---

### 6. Duelist (ID: 1106)

**Description:**
> "The Duelist treats every pertempuran as a high-stakes game of chess. They are masters of the blade who prioritize technique and precision over raw power. A Duelist spends years perfecting their footwork and timing."

**Lore:** Duelists are elegant fighters who rely on precision and technique. They study their opponents and wait for the perfect moment to strike with lethal accuracy.

**Base Statistics (Level 1):**
| Stat | Value | Growth/Level |
|------|-------|-------------|
| HP | 1200 | +75 |
| MP | 280 | +18 |
| Attack | 220 | +20 |
| Defense | 130 | +8 |
| Magic Attack | 50 | +3 |
| Magic Defense | 120 | +8 |
| Speed | 130 | +10 |
| Crit Chance | 20% | +1.5% |
| Crit Damage | 200% | +5% |
| Parry Chance | 12% | +0.8% |

**Default Skills:**
- **Thrust** (Active): Precise piercing attack
- **Parry** (Active): Deflect incoming attacks
- **Riposte** (Active): Counterattack after parry

**Passive Traits:**
- Precision (+10% crit chance)
- Counter (+5% parry chance)

**Progression:**
- → Fencer (Tier 2) - Parry specialist
- → Blademaster (Tier 2) - Sword mastery

---

### 7. Archer (ID: 1107)

**Description:**
> "The Archer is the master of death from a distance. Trained from childhood to read the wind and the arc of a shot, they can pinpoint a target from across the battlefield with uncanny accuracy."

**Lore:** Archers are lethal ranged combatants who specialize in dealing damage from a distance. They can rain arrows upon enemies while remaining safely out of melee range.

**Base Statistics (Level 1):**
| Stat | Value | Growth/Level |
|------|-------|-------------|
| HP | 1000 | +60 |
| MP | 250 | +15 |
| Attack | 280 | +22 |
| Defense | 100 | +6 |
| Magic Attack | 50 | +3 |
| Magic Defense | 100 | +6 |
| Speed | 110 | +8 |
| Crit Chance | 15% | +1% |
| Crit Damage | 175% | +3% |
| Range | 8 | +0.5 |

**Default Skills:**
- **Aim Shot** (Active): Precise shot (1.5x multiplier)
- **Volley** (Active): Multiple arrows in area (AOE)
- **Piercing Shot** (Active):穿透攻击

**Passive Traits:**
- Eagle Eye (+10% accuracy)
- Quick Draw (+5% attack speed)

**Progression:**
- → Sniper (Tier 2) - Long-range specialist
- → Ranger (Tier 2) - Trap and pet specialist

---

## Base Statistics Comparison

| Stat | Warrior | Scout | Apprentice | Votary | Brute | Duelist | Archer |
|------|---------|-------|------------|--------|-------|---------|--------|
| HP | 1500 | 1100 | 900 | 1800 | 2000 | 1200 | 1000 |
| MP | 200 | 350 | 600 | 300 | 150 | 280 | 250 |
| Attack | 150 | 200 | 50 | 120 | 280 | 220 | 280 |
| Defense | 250 | 120 | 80 | 200 | 150 | 130 | 100 |
| Magic Attack | 30 | 100 | 250 | 80 | 30 | 50 | 50 |
| Magic Defense | 80 | 150 | 200 | 180 | 80 | 120 | 100 |
| Speed | 50 | 150 | 70 | 55 | 45 | 130 | 110 |
| Crit % | 5% | 12% | 5% | 5% | 8% | 20% | 15% |
| Crit Dmg | 150% | 160% | 150% | 150% | 180% | 200% | 175% |

---

## Default Skills

### Warrior Skills
| Skill ID | Name | Type | Description | Mana Cost |
|----------|------|------|-------------|-----------|
| 9101 | Slash | DAMAGE | Basic melee attack (1.5x) | 10 |
| N/A | Block | DEFENSIVE | Increase defense temporarily | 15 |
| N/A | Charge | UTILITY | Rush toward enemy | 20 |

### Scout Skills
| Skill ID | Name | Type | Description | Mana Cost |
|----------|------|------|-------------|-----------|
| N/A | Quick Shot | DAMAGE | Fast ranged attack | 10 |
| 10308 | Stealth | BUFF | Become invisible | 25 |
| N/A | Trap | UTILITY | Place trap | 15 |

### Apprentice Skills
| Skill ID | Name | Type | Description | Mana Cost |
|----------|------|------|-------------|-----------|
| 9401 | Fireball | DAMAGE | Fire AOE (1.8x, SQUARE 1) | 25 |
| 9404 | Ice Shard | DAMAGE | Ice single target (1.6x) | 20 |
| 9407 | Zap | DAMAGE | Lightning quick strike (1.7x) | 18 |

### Votary Skills
| Skill ID | Name | Type | Description | Mana Cost |
|----------|------|------|-------------|-----------|
| 9001 | First Aid | HEAL | Restore HP (20 power) | 15 |
| N/A | Meditate | HEAL | Recover HP and MP | 20 |
| 10307 | Remove Debuff | UTILITY | Clear debuffs | 25 |

### Brute Skills
| Skill ID | Name | Type | Description | Mana Cost |
|----------|------|------|-------------|-----------|
| N/A | Smash | DAMAGE | Heavy blow (2.0x) | 25 |
| 9610 | Intimidate | DEBUFF | Fear enemy | 20 |
| 9601 | Rage Mode | BUFF | +50% ATK, -20% DEF | 30 |

### Duelist Skills
| Skill ID | Name | Type | Description | Mana Cost |
|----------|------|------|-------------|-----------|
| N/A | Thrust | DAMAGE | Piercing attack (1.5x) | 12 |
| 10101 | Parry | COUNTER | Chance to counter | 15 |
| 10102 | Riposte | COUNTER | Counterattack (1.5x) | 20 |

### Archer Skills
| Skill ID | Name | Type | Description | Mana Cost |
|----------|------|------|-------------|-----------|
| N/A | Aim Shot | DAMAGE | Precise shot (1.5x) | 15 |
| N/A | Volley | DAMAGE | Area arrows (AOE) | 25 |
| N/A | Piercing Shot | DAMAGE |穿透 attack | 20 |

---

## Role and Function in Combat

### Warrior
- **Primary Role:** Main Tank / Frontline Defender
- **Function:** Absorbs enemy attacks, protects allies with shields, controls enemy positioning
- **Battle Style:** Defensive positioning, taunting enemies, maintaining aggro

### Scout
- **Primary Role:** Reconnaissance / Flanker
- **Function:** Gather intel, harass from shadows, set up traps
- **Battle Style:** Hit-and-run tactics, stealth positioning, targeting healers/archers

### Apprentice
- **Primary Role:** Ranged Magic DPS
- **Function:** Deal elemental damage from distance, control battlefield with AOE
- **Battle Style:** Keep distance, use terrain, chain elemental attacks

### Votary
- **Primary Role:** Support / Off-Tank
- **Function:** Sustain team, resist crowd control, survive longer
- **Battle Style:** Position in middle of team, clear debuffs, sustain fights

### Brute
- **Primary Role:** Burst Melee DPS / Skirmisher
- **Function:** Deal massive damage, fear enemies, overwhelm defenses
- **Battle Style:** Aggressive frontlining, target low-defense enemies, sustain with lifesteal

### Duelist
- **Primary Role:** Assassin / Crit Fighter
- **Function:** Delete high-value targets, evade attacks, counterattack
- **Battle Style:** Wait for opening, exploit positioning bonuses, finish wounded enemies

### Archer
- **Primary Role:** Ranged Physical DPS
- **Function:** Consistent damage from distance, kite enemies, zone control
- **Battle Style:** Maintain range, focus fire, AOE pressure

---

## Strengths and Weaknesses

### Warrior
| Strengths | Weaknesses |
|-----------|------------|
| Highest base defense | Low mobility |
| Excellent survivability | Weak magic resistance |
| Strong block/parry | Limited damage output |
| Team protection | Slow speed |

### Scout
| Strengths | Weaknesses |
|-----------|------------|
| Highest speed | Low base HP |
| Stealth capabilities | Weak defense |
| High crit potential | Low sustained damage |
| Mobility | Mana dependent |

### Apprentice
| Strengths | Weaknesses |
|-----------|------------|
| Highest magic attack | Lowest HP |
| Elemental versatility | Physical vulnerability |
| AOE control | Slow speed |
| Mana pool | Melee range = death |

### Votary
| Strengths | Weaknesses |
|-----------|------------|
| High HP pool | Low damage |
| Debuff immunity | Limited offense |
| Sustained fighting | Slow |
| Self-healing | No burst |

### Brute
| Strengths | Weaknesses |
|-----------|------------|
| Highest attack | Vulnerable to kiting |
| High HP | Low speed |
| Life steal | Weak magic defense |
| Fear utility | Positioning dependent |

### Duelist
| Strengths | Weaknesses |
|-----------|------------|
| Highest crit chance | Squishy |
| Parry mechanics | Mana hungry |
| High burst | Positioning required |
| Versatile | Low defense |

### Archer
| Strengths | Weaknesses |
|-----------|------------|
| High ranged DPS | Low defense |
| AOE pressure | Vulnerable to flank |
| Speed | Mana management |
| Range advantage | Weaker up close |

---

## Combat Strategies

### Warrior Combat Strategy
1. **Opening:** Use Charge to reach enemy frontline
2. **Mid-fight:** Maintain Block stance, taunt high-threat enemies
3. **Coordination:** Position between enemies and healers/archers
4. **Ultimate:** Use shield wall to protect team during enemy burst

### Scout Combat Strategy
1. **Opening:** Stealth into position, target enemy squishies
2. **Mid-fight:** Quick hit-and-run, set traps on pursuit
3. **Coordination:** Scout enemy positions, call targets
4. **Ultimate:** Use stealth burst to eliminate priority targets

### Apprentice Combat Strategy
1. **Opening:** Fireball into clustered enemies
2. **Mid-fight:** Chain elemental attacks, maintain distance
3. **Coordination:** AOE damage on grouped enemies
4. **Ultimate:** Maximum AOE coverage with all spells

### Votary Combat Strategy
1. **Opening:** Meditate to full health before engagement
2. **Mid-fight:** Clear team debuffs, sustain injured allies
3. **Coordination:** Position centrally, absorb collateral damage
4. **Ultimate:** Survive and outlast opposing team

### Brute Combat Strategy
1. **Opening:** Rage mode + Charge into backline
2. **Mid-fight:** Smash on lowest defense targets, Bellow to fear
3. **Coordination:** Force enemies to focus you, create space
4. **Ultimate:** All-out attack while rage active

### Duelist Combat Strategy
1. **Opening:** Wait for enemy to commit, position for backstab
2. **Mid-fight:** Parry incoming attacks, Riposte for damage
3. **Coordination:** Target wounded enemies, finish kills
4. **Ultimate:** Exploit crit bonuses for burst deletion

### Archer Combat Strategy
1. **Opening:** Volley into approaching enemies
2. **Mid-fight:** Maintain range, Aim Shot priority targets
3. **Coordination:** Focus fire, slow/kite enemies
4. **Ultimate:** Rain of Arrows for maximum area damage

---

## Progression Paths

### Warrior Evolution Tree
```
Tier 0: Novice
    ↓
Tier 1: Warrior (1101)
    ├──→ Tier 2: Knight (2101) - Tank/Protector
    │       └──→ Tier 3: Lord Commander - Team Leader
    │
    └──→ Tier 2: Berserker - High Damage
            └──→ Tier 3: (TBD) - Berserker Master
```

### Scout Evolution Tree
```
Tier 0: Novice
    ↓
Tier 1: Scout (1102)
    ├──→ Tier 2: Sniper - Long Range
    │       └──→ Tier 3: (TBD) - Death from Afar
    │
    └──→ Tier 2: Assassin - Stealth/Burst
            └──→ Tier 3: (TBD) - Shadow Killer
```

### Apprentice Evolution Tree
```
Tier 0: Novice
    ↓
Tier 1: Apprentice (1103)
    ├──→ Tier 2: Wizard (2111) - AOE Control
    │       └──→ Tier 3: Archmage - Arcane Master
    │
    └──→ Tier 2: Necromancer - Summoning/Dark
            └──→ Tier 3: (TBD) - Death Lord
```

### Votary Evolution Tree
```
Tier 0: Novice
    ↓
Tier 1: Votary (1104)
    ├──→ Tier 2: Paladin - Holy Warrior
    │       └──→ Tier 3: (TBD) - Divine Guardian
    │
    └──→ Tier 2: Monk - Hand-to-Hand
            └──→ Tier 3: (TBD) - Fist Master
```

### Brute Evolution Tree
```
Tier 0: Novice
    ↓
Tier 1: Brute (1105)
    ├──→ Tier 2: Berserker - Pure Damage
    │       └──→ Tier 3: (TBD) - Mad God
    │
    └──→ Tier 2: Juggernaut - Unstoppable
            └──→ Tier 3: (TBD) - Mountain
```

### Duelist Evolution Tree
```
Tier 0: Novice
    ↓
Tier 1: Duelist (1106)
    ├──→ Tier 2: Fencer - Parry Master
    │       └──→ Tier 3: (TBD) - Blade Saint
    │
    └──→ Tier 2: Blademaster - Sword Expert
            └──→ Tier 3: (TBD) - Sword Legend
```

### Archer Evolution Tree
```
Tier 0: Novice
    ↓
Tier 1: Archer (1107)
    ├──→ Tier 2: Sniper - Extreme Range
    │       └──→ Tier 3: (TBD) - One Shot One Kill
    │
    └──→ Tier 2: Ranger - Trap/Pet Hybrid
            └──→ Tier 3: (TBD) - Beast Master
```

---

## Optimal Builds

### Warrior - Tank Build
**Stat Priority:**
1. Defense (+20)
2. HP (+15)
3. Block Chance (+10)
4. Speed (+5)

**Equipment Focus:** Heavy armor, shield, defensive accessories

**Skill Priority:**
- Block (max)
- Shield Wall
- Taunt
- Battle Rush

---

### Warrior - DPS Build
**Stat Priority:**
1. Attack (+20)
2. Crit Damage (+15)
3. Crit Chance (+10)
4. Speed (+5)

**Equipment Focus:** Balanced armor, two-handed weapons

**Skill Priority:**
- Power Strike (max)
- Charge
- Cleave

---

### Apprentice - Pure DPS Build
**Stat Priority:**
1. Magic Attack (+25)
2. Magic Defense (+15)
3. Mana Pool (+15)
4. Speed (+5)

**Equipment Focus:** Robes, staff, magic accessories

**Skill Priority:**
- Fireball (max)
- Inferno
- Frost Nova

---

### Apprentice - AOE Control Build
**Stat Priority:**
1. Magic Attack (+20)
2. Mana Pool (+20)
3. Magic Defense (+10)
4. Speed (+10)

**Equipment Focus:** Robes with AOE bonuses

**Skill Priority:**
- Thunderstorm (max)
- Chain Lightning
- Blizzard

---

### Scout - Assassin Build
**Stat Priority:**
1. Crit Chance (+20)
2. Crit Damage (+15)
3. Speed (+15)
4. Attack (+10)

**Equipment Focus:** Light armor, dual daggers

**Skill Priority:**
- Backstab (max)
- Stealth
- Shadow Walk

---

### Scout - Ranged Build
**Stat Priority:**
1. Attack (+20)
2. Speed (+15)
3. Crit Chance (+10)
4. Dodge (+10)

**Equipment Focus:** Medium armor, bow

**Skill Priority:**
- Volley (max)
- Piercing Shot
- Trap

---

### Brute - Glass Cannon Build
**Stat Priority:**
1. Attack (+25)
2. Crit Damage (+15)
3. Life Steal (+10)
4. Speed (+10)

**Equipment Focus:** Balance offense/defense

**Skill Priority:**
- Smash (max)
- Rage
- Bellow

---

### Brute - Sustain Build
**Stat Priority:**
1. HP (+20)
2. Defense (+15)
3. Life Steal (+15)
4. Attack (+10)

**Equipment Focus:** Heavy armor, lifesteal weapons

**Skill Priority:**
- Smash
- Rage (duration up)
- Regeneration

---

### Duelist - Crit Build
**Stat Priority:**
1. Crit Chance (+25)
2. Crit Damage (+20)
3. Attack (+10)
4. Speed (+10)

**Equipment Focus:** Light/medium armor, precision weapons

**Skill Priority:**
- Thrust (max)
- Parry
- Riposte

---

### Archer - DPS Build
**Stat Priority:**
1. Attack (+25)
2. Crit Damage (+15)
3. Speed (+10)
4. Range (+10)

**Equipment Focus:** Bow, light armor

**Skill Priority:**
- Aim Shot (max)
- Volley
- Piercing Shot

---

### Archer - Control Build
**Stat Priority:**
1. Speed (+20)
2. Attack (+15)
3. Dodge (+10)
4. Range (+10)

**Equipment Focus:** Mobility gear, traps

**Skill Priority:**
- Volley (max)
- Trap
- Slow Shot

---

### Votary - Support Build
**Stat Priority:**
1. HP (+20)
2. Magic Defense (+15)
3. Mana Pool (+10)
4. Tenacity (+10)

**Equipment Focus:** Robes, healing items

**Skill Priority:**
- First Aid (max)
- Meditate
- Remove Debuff

---

## Appendix: Class ID Reference

| ID | Name | Tier | Parent Class |
|----|------|------|-------------|
| 1001 | Novice | 0 | - |
| 1101 | Warrior | 1 | 1001 |
| 1102 | Scout | 1 | 1001 |
| 1103 | Apprentice | 1 | 1001 |
| 1104 | Votary | 1 | 1001 |
| 1105 | Brute | 1 | 1001 |
| 1106 | Duelist | 1 | 1001 |
| 1107 | Archer | 1 | 1001 |
| 2101 | Knight | 2 | 1101 |
| 2103 | Rogue | 2 | 1102 |
| 2111 | Wizard | 2 | 1103 |
| 3101 | Lord Commander | 3 | 2101 |
| 3105 | Archmage | 3 | 2111 |

---

*Document Version: 1.0*
*Last Updated: 2026-02-19*
*Data Sources: schema.prisma, seed_classes.js, seed_skills.js, Hero model*
