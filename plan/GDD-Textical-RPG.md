# Textical RPG - Game Design Document

**Project Name:** Textical RPG  
**Engine:** Godot 4.5  
**Genre:** 2D Fantasy Medieval RPG  
**Target Platform:** PC, Mobile  
**Development Status:** Planning Phase  
**Last Updated:** 2026-02-24  
**Game Type:** Online-only (no offline play)

---

## 1. Executive Summary

Textical RPG is a 2D turn-based role-playing game set in a medieval fantasy world. The game combines classic RPG mechanics with modern quality-of-life features, offering players an immersive experience through narrative-driven gameplay, strategic combat, and deep character customization.

### Core Value Proposition

- **Strategic Combat:** Tick-based battle system with deterministic outcomes
- **Rich Narrative:** Branching storylines with meaningful player choices
- **Deep Progression:** Multiple advancement paths including stats, skills, and equipment
- **World Exploration:** Open-world medieval fantasy setting with hidden secrets

### Target Audience

- **Primary:** RPG enthusiasts who enjoy strategic turn-based combat
- **Secondary:** Casual players who appreciate story-driven experiences
- **Age Range:** 16+ (due to combat and mature themes)

---

## 2. Game Overview

### 2.1 Story & Setting

**World Name:** Eldoria

**Setting:** Medieval fantasy world recovering from an ancient catastrophe known as "The Sundering." Magic has returned to the world, but with unpredictable and dangerous consequences. Players take on the role of a "Shardbearer" - one chosen to collect fragments of broken magical artifacts that hold the key to preventing another catastrophe.

**Key Factions:**
- **The Crown:** Ruling monarchy seeking to unify the realm
- **The Arcane Circle:** Mages studying the returned magic
- **The Iron Fellowship:** Mercenary guild with mercantile interests
- **The Shadow Hand:** Secret organization with unknown agendas
- **The Wildborn:** Tribal peoples protecting ancient lands

**Main Quest Hook:** Collect shards of the Sundering Stone while navigating political tensions between factions, uncovering the truth behind the catastrophe, and deciding the fate of Eldoria.

### 2.2 Gameplay Loop

```
┌─────────────────────────────────────────────────────────┐
│                    CORE GAME LOOP                        │
├─────────────────────────────────────────────────────────┤
│  EXPLORE → ENCOUNTER → COMBAT → LOOT → UPGRADE → REPEAT │
└─────────────────────────────────────────────────────────┘
         ↑                                              │
         └──────────────────────────────────────────────┘
```

**Primary Loop (5-15 minutes):**
1. Explore world map
2. Enter dungeon
3. Fight through floors (1-100)
4. Collect loot per floor
5. Face boss every 10 floors
6. Return to town for upgrades

**Secondary Loop (1-2 hours):**
1. Progress deeper into dungeon
2. Face stronger enemies
3. Unlock better equipment
4. Challenge boss floors

**Tertiary Loop (10+ hours):**
1. Reach floor 100
2. Complete all boss floors
3. Achieve max level
4. New Game+ (optional)

---

## 3. Core Mechanics

### 3.1 Tick-Based Combat System (Server-Side)

The combat system uses a deterministic tick-based engine with **auto-battle** mechanics processed entirely on the server. Players cannot control units during combat - they can only watch the battle replay after server processing.

**Pre-Battle (Idle Time Only):**
- Heroes available: 1 to 50 (all owned heroes join)
- Player with 1 hero → fights with 1 unit
- Player with 50 heroes → fights with 50 units
- All formation/order, equip/unequip, and strategy settings are configured during idle time (outside of combat)
- No adjustments possible during pre-battle phase

**Combat Processing:**
- Entire battle executed on server
- Hero stats, abilities, AI decisions, and outcomes calculated server-side
- No combat logic runs on the client
- Results compressed into replay format and transmitted to player

**During Battle (Replay Only):**
- Player watches a replay of the already processed battle
- No manual actions or real-time control possible
- Replay includes all actions, damage numbers, and effects
- Players can only press a "Skip" button to immediately end the battle and view results
- Tick system determines action order and effects in the replay
- **Important:** Combat is not real-time - entire battle is processed on server first
- The client only receives and displays the final battle results in replay format

**Battle Flow:**
```
Setup → Auto-Execute Actions → Watch Results → Victory/Defeat → Loot
```

**Deterministic Design Philosophy:**
This game uses **no random number generation (RNG)** whatsoever. All combat outcomes, status effects, and character actions are completely predictable and repeatable. This ensures fairness and allows for consistent replayability - battles will unfold exactly the same way each time with identical inputs and conditions.

Instead of RNG, the game uses **counter-based systems** for all probabilistic effects, where each action contributes points towards a trigger threshold. This creates the illusion of probability while maintaining complete determinism.

**Key Combat Stats:**
| Stat | Description | Affects |
|------|-------------|---------|
| STR (Strength) | Physical power | Attack damage |
| DEX (Dexterity) | Agility & precision | Speed, Attack Speed, accuracy, evasion |
| INT (Intelligence) | Magic power | Spell damage, Cast Speed |
| DEF (Defense) | Damage mitigation | Damage reduction |

### 3.2 Movement & Exploration

**World Map:**
- Overworld map with tile-based movement
- Multiple regions with varying difficulty
- Hidden areas requiring specific abilities/items

**Town/Hub Areas:**
- Safe zones for trading, questing, and resting
- NPC interactions
- Save points

**Dungeon/Cave Exploration:**
- Grid-based dungeon crawling
- Trap and puzzle mechanics
- Resource management (light, supplies)

### 3.3 Resource Management

**Currencies:**
| Currency | Description | Usage |
|----------|-------------|-------|
| Silver | Primary currency | Basic purchases, upgrades |
| Gold | Premium/Rare currency | Rare items, special upgrades |

**No HP/MP/Energy System:**
- No health points or mana points
- Combat victory/defeat is determined by other mechanics
- No energy for movement or actions
- Simplified resource management

**Online-Only Features (Server-Side Processing):**
- All gameplay requires an active internet connection
- **All combat calculations processed on servers** - client only displays replays
- Character progression and data stored server-side
- Multiplayer and social features integrated
- Deterministic battle replays for consistent outcomes
- Anti-cheat by design (no local combat logic)

---

## 4. Character System

### 4.1 Character Creation

**Hero Roster System:**
- Each player has **1-50 hero slots**
- Minimum: **1 hero** (can fight with just one)
- Maximum: **50 heroes** (full roster)
- Battle uses all owned heroes (1 to 50)

**Main Hero:**
- Created at game start as **Novice** class
- Can be swapped with any other hero in roster
- Previous main hero becomes regular unit after swap
- All owned heroes participate in battle

**Secondary Heroes:**
- 49 additional heroes in roster
- Can be obtained through quests, gacha, or events
- Same base stats as any hero at same level (fixed growth)
- Uniqueness comes from: **Class**, **Equipment**, and **Trait** only
- Can assist main hero in combat or expeditions

**Hero Acquisition:**
- Main hero: Created at game start
- Secondary heroes: Obtained via:
  - Story quests
  - Gacha/draw system
  - Special events
  - Achievement rewards
  - Trading (if social features enabled)

**Hero Management:**
- View all heroes in roster (1 to 50)
- Equip items, manage skills per hero
- Swap main hero: any hero can become main unit
- When swapped: previous main becomes regular unit
- All owned heroes fight in battle

**Starting Class:**
- Novice (universal base class)

**Class Progression:**
- Novice → Fighter (use shield + sword, level 10+)
- Novice → Hunter (use bow, level 10+)
- Novice → Apprentice (use staff, level 10+)
- Novice → Thief (use dual blades, level 10+)
- Novice → Acolyte (use holy staff, level 10+)

Players start as Novice and evolve into specialized classes at level 10.

### 4.2 Race System

**Available Races:**
Each hero belongs to one of fifteen distinct races, each with unique characteristics and combat-focused passive traits:

| Race | Description | Base Stat Bonuses | Trait |
|------|-------------|------------------|---------------|
| **Human** | Versatile race with balanced stats | +2 STR, +2 DEX, +2 INT, +2 DEF | **Adaptive Tactician:** +5% to all stats when party includes at least 3 different races |
| **Elf** | Agile and magical race from the forests | -5 STR, +10 DEX, +8 INT, -3 DEF | **Wind Step:** Each physical attack received adds 15 dodge points; when dodge reaches 100, attack is avoided and counter resets to 0 |
| **Dwarf** | Sturdy and powerful race from the mountains | +10 STR, -3 DEX, +2 INT, +10 DEF | **Stone Skin:** Takes 10% less damage from physical attacks |
| **Minotaur** | Bull-headed race with incredible strength and endurance | +13 STR, +4 DEX, +0 INT, +12 DEF | **Charging Strike:** First attack of battle deals +30% damage |
| **Orc** | Brutal and aggressive race from the wastelands | +15 STR, -5 DEX, +0 INT, -5 DEF | **Blood Rage:** When HP drops below 50%, gains +20% attack damage |
| **Gnome** | Intelligent and cunning race from the underground | +5 STR, +5 DEX, +15 INT, +0 DEF | **Arcane Precision:** Each spell cast adds 10 ignore resistance points; when points reach 100, next spell ignores 30% of target's magic resistance and counter resets to 0 |
| **Vampire** | Undead race with dark magic and blood thirst | +3 STR, +5 DEX, +7 INT, +0 DEF | **Blood Drain:** Each attack deals adds 5 heal points; when points reach 100, heals 10% HP and counter resets to 0 |
| **Werewolf** | Lycanthrope race with brute strength and speed | +12 STR, +8 DEX, +0 INT, +5 DEF | **Lycanthropic Fury:** At night, gains +15% attack speed and +10% damage |
| **Dragonborn** | Descendants of dragons with elemental powers | +8 STR, +3 DEX, +8 INT, +5 DEF | **Dragon Scale:** Immune to all minor status effects (poison, burn, etc.) |
| **Elemental** | Pure energy beings from the elemental planes | +0 STR, +5 DEX, +12 INT, -2 DEF | **Elemental Absorption:** Each elemental attack received adds 10 absorption points; when points reach 100, next elemental attack is absorbed and counter resets to 0 |
| **Troll** | Regenerative race from the swamps with immense strength | +14 STR, +2 DEX, +1 INT, +8 DEF | **Regenerative Flesh:** Heals 2 HP per tick, even in combat |
| **Centaur** | Half-human, half-horse race with exceptional speed and archery skills | +5 STR, +12 DEX, +3 INT, +4 DEF | **Swift Charge:** First 3 attacks deal +10% damage |
| **Fairy** | Magical race from the Feywild with flight and nature powers | -3 STR, +12 DEX, +9 INT, -5 DEF | **Pixie Dust:** Each attack adds 15 pixie dust points; when points reach 100, reduces target's attack speed by 20% for 2 ticks and counter resets to 0 |
| **Goblin** | Cunning and agile race from the caves with trap-making skills | +3 STR, +10 DEX, +6 INT, +2 DEF | **Stealth Attack:** Each attack from behind adds 15 stealth points; when points reach 100, deals +50% damage and counter resets to 0 |
| **Nymph** | Nature spirits with connection to plants and animals | -1 STR, +7 DEX, +11 INT, +4 DEF | **Nature's Wrath:** Each attack received adds 10 root points; when points reach 100, roots attacker for 1 tick and counter resets to 0 |

### 4.3 Stat System

**Base Stats (4 Primary):**
```
STR (Strength)     → Physical Attack
DEX (Dexterity)    → Speed, Attack Speed, Accuracy, Evasion
INT (Intelligence) → Spell Damage, Cast Speed
DEF (Defense)      → Damage Mitigation
```

**Stat Growth:**
- Fixed growth per Race × Class combination (automatic on level-up)
- Each combination has predetermined stat progression
- Equipment bonuses: Additional stat boosts from gear

### 4.3 Skill System

**Skill Categories:**

| Category | Description | Examples |
|----------|-------------|----------|
| Combat | Active battle skills | Slash, Shoot, Cast |
| Passive | Always-active effects | +10% Attack, Critical Boost |
| Support | Utility skills | Heal, Buff, Summon |
| Special | Unique abilities | Class-specific skills |

**Skill Mechanics:**
- Skills have cooldowns measured in ticks
- MP cost for magic/skills
- Skill proficiency (levels up with use)
- Skill trees per class with branching paths

### 4.4 Trait System

**Traits (Passive Bonuses):**
- Acquired through level-ups, quests, items
- Can be positive, negative, or mixed
- Some traits are class-restricted

**Trait Examples:**
- "Iron Will": +20% magic defense
- "Light Step": +15% evasion
- "Battle Hardened": +10% Defense

### 4.5 Faction System

**Kingdoms (aligned to regions):**
Players can join one of four kingdoms, each aligned to a region.

| Faction | Region | Description | Benefits |
|---------|--------|-------------|----------|
| Frost Kingdom | Frost Peaks | Snow-covered mountain kingdom with rich ore deposits | Ice/Blizzard skills, mountain region access, +15% ore drop rate |
| Bog Empire | Murk Bog | Swamp marsh empire | Poison/Disease skills, swamp region access, +15% hide drop rate |
| Sun Sultanate | Sun Wastes | Desert sun sultanate | Fire/Light skills, desert region access, +15% herb drop rate |
| Forest Covenant | Verdant Wilds | Forest guardian covenant | Nature/Wind skills, forest region access, +15% wood drop rate |

**Faction Ranks / Titles:**
Players progress through a noble rank system within their faction:

| Rank | Title | Reputation Required | Benefits |
|------|-------|---------------------|----------|
| 1 | Commoner | 0-999 | Basic faction access |
| 2 | Squire | 1000-2999 | +5% reputation gain |
| 3 | Knight | 3000-5999 | Access to faction skills |
| 4 | Baron | 6000-9999 | +10% regional resource drop rate |
| 5 | Count | 10000-14999 | Faction event leadership |
| 6 | Duke | 15000-19999 | Access to exclusive faction quests |
| 7 | Prince/Princess | 20000+ | Ability to represent faction in faction wars |

**Faction Events / Wars:**
- **Faction Wars (PvP):** Monthly wars between factions for territory and resources
- **Faction Raids (PvE):** Cooperative events to defeat powerful bosses in faction territories
- **Faction Competitions:** Resource gathering contests or battle challenges with unique rewards
- **Faction Diplomacy:** Temporary alliances or truces between factions for shared goals

**Faction Skills / Buffs:**
Each faction offers unique passive skills and buffs:

| Faction | Skills / Buffs |
|---------|----------------|
| Frost Kingdom | Ice Resistance +20%, Frost skill damage +10%, Mountain movement speed +15% |
| Bog Empire | Poison Resistance +20%, Disease skill damage +10%, Swamp movement speed +15% |
| Sun Sultanate | Fire Resistance +20%, Light skill damage +10%, Desert movement speed +15% |
| Forest Covenant | Nature Resistance +20%, Wind skill damage +10%, Forest movement speed +15% |

**Faction Reputation Decay / Conflict:**
- Reputation decays by 1 point per hour if no faction-specific actions are taken
- Actions conflicting with faction values cause reputation loss (e.g., killing friendly faction members)
- Declining reputation reduces access to faction benefits and may result in rank demotion
- Faction conflicts can cause temporary reputation penalties for members of opposing factions

**Faction Quests / Storyline:**
- **Faction-specific Story Quests:** Narrative quests that explore the faction's history and goals
- **Daily Faction Quests:** Repeatable quests for reputation and faction resources
- **Faction Prestige Quests:** High-difficulty quests with unique rewards for high-ranking members
- **Faction Loyalty Quests:** Choices that test a player's loyalty to their faction

**Faction Mechanics:**
- Join one primary faction
- Gain reputation through quests and actions
- Higher reputation = better rewards and access
- Some actions may conflict with faction values

### 4.6 Guild System

**Guild Features:**
| Feature | Description |
|---------|-------------|
| Guild Hall | Base of operations with storage and crafting facilities |
| Guild Chat | Real-time communication with guild members |
| Guild Quests | Cooperative missions for guild rewards |
| Guild Bank | Shared item storage for members |
| Guild Ranks | Hierarchical permissions (Leader, Officer, Member, Recruit) |
| Recruitment | Application system for new members (approval by leader/officer) |
| Guild Events | Special coordinated events or raids for rewards |
| Guild Achievements | Titles or badges for guild or members based on contributions |
| Resource Contribution | Members can donate items or resources for guild upgrades |
| Guild Skills / Buffs | Passive bonuses or special skills unlocked as guild levels up |
| Guild History / Logs | Records of member activity, rank changes, and achievements |

**Guild Progression:**
- Levels up through member activity, quest completion, and contributions
- Higher levels unlock more features, buffs, and events
- Guild vs Guild competitions (PvP optional) for ranking and rewards
- Guild hall and skills improve as guild levels increase

**Notes:**
- Guilds are separate from kingdoms; players can join one guild and one kingdom simultaneously
- Guild rank determines permissions for chat, bank access, and event management

---

## 5. Combat System Detailed

### 5.1 Battle Mechanics (Server-Side Processing)

**Pre-Battle (Idle Time Only):**
- All heroes available: 1 to 50 (all owned heroes join)
- Player with 1 hero → fights with 1 unit
- Player with 50 heroes → fights with 50 units
- All formation/order, equip/unequip, and strategy settings are configured during idle time (outside of combat)
- No adjustments possible once combat begins

**Battle Processing (Server-Side):**
- All combat calculations processed on the server
- Hero stats, abilities, and AI decisions evaluated on server
- Turn order, damage calculations, and battle outcomes determined server-side
- Results compressed into a replay format and sent to client

**During Battle (Client Display Only):**
- Player watches a replay of the battle processed on server
- No real-time combat interaction possible
- Replay includes all actions, damage numbers, and effects
- Players can only press a "Skip" button to immediately end the battle and view results

**Turn Structure:**
1. **Initiative Phase:** Calculate turn order based on speed
2. **Action Phase:** AI executes actions for each unit
3. **Effect Phase:** Apply damage, healing, status effects
4. **Resolution Phase:** Check win/lose conditions

### 5.2 Damage Formula

```
Raw Damage = (Attack × AttackMultiplier) - (Defense × DefenseMultiplier)
Final Damage = Raw Damage × Elemental Modifier × Critical Modifier × Random Variance
```

**Damage Types:**
- Physical: Reduced by defense, armor
- Magical: Reduced by magic defense, resistance
- True: Ignores most mitigations (rare)

### 5.3 Elemental System

**Elements:**
| Element | Description |
|---------|-------------|
| Neutral | Default, no elemental effect |
| Fire | Heat, burn damage |
| Water | Ice, splash damage |
| Earth | Stone, heavy damage |
| Wind | Air, fast attacks |
| Light | Holy, pure energy |
| Dark | Shadow, corrupted power |

**Elemental Interactions:**
| Element | Strong Against | Weak Against |
|---------|----------------|---------------|
| Fire | Wind | Water |
| Water | Fire | Earth |
| Earth | Water | Wind |
| Wind | Earth | Fire |
| Light | Dark | Dark |
| Dark | Light | Light |
| Neutral | None | None |

**Elemental Effect Examples (Per Unit):**
Each unit can have 1 or more elemental affinities. Here are some examples:

| Unit Name | Element(s) | Strong Against | Weak Against | Bonus Effect |
|-----------|-----------|----------------|---------------|---------------|
| **Fire Mage** | Fire | Wind units | Water units | +10% fire damage, each attack adds 5 burn points; when burn reaches 100, target is burned and counter resets to 0 |
| **Ice Warrior** | Water | Fire units | Earth units | +8% ice damage, each attack adds 3 freeze points; when freeze reaches 100, target is frozen and counter resets to 0 |
| **Stone Golem** | Earth | Water units | Wind units | +15% defense, 20% poison resistance |
| **Wind Archer** | Wind | Earth units | Fire units | +5% attack speed, each attack adds 3 critical points; when critical reaches 100, next attack is a critical hit and counter resets to 0 |
| **Holy Paladin** | Light | Dark units | Dark units | +10% holy damage, +5% heal power |
| **Shadow Assassin** | Dark | Light units | Light units | +10% shadow damage, each attack received adds 3 evasion points; when evasion reaches 100, next attack is evaded and counter resets to 0 |
| **Fire-Wind Dragon** | Fire + Wind | Wind & Earth units | Water units | +5% fire damage, +3% attack speed |
| **Water-Light Priest** | Water + Light | Fire & Dark units | Earth & Dark units | +5% heal power, +5% water damage |

**Multi-Element Interaction Example:**
A unit with **Fire + Wind** elements:
- Deals bonus damage to Wind and Earth units
- Takes extra damage from Water units
- Resists Wind damage (from fire element)
- Vulnerable to Earth damage (from wind element)

### 5.4 Weather System

**Weather Types:**
| Weather | Region | Effects | Reasoning |
|---------|--------|--------|----------|
| Rain | Murk Bog, Verdant Wilds | Water element boost, movement speed -10% | Wet and slippery terrain slows movement |
| Snow | Frost Peaks | Ice element boost, movement speed -15% | Deep snow makes it harder to walk |
| Storm | Sun Wastes (rare) | Wind element boost, accuracy -20% | Strong winds disrupt aim and precision |
| Heatwave | Sun Wastes | Fire element boost, attack speed -10% | Intense desert heat causes fatigue and slows attacks |
| Earthquake | All Regions (rare) | Earth element boost, defense -15% | Tremors weaken defensive positions and structures |
| Aurora | Frost Peaks (night only) | Light element boost, cast speed -10% | Mystical light enhances magic but disrupts concentration |
| Eclipse | All Regions (rare, night only) | Dark element boost, evasion -15%, accuracy -15% | Shadowy darkness enhances dark magic but reduces visibility for both attackers and defenders |

**Weather Effects:**
- Weather changes dynamically in each region
- Affects elemental damage bonuses
- Some skills/abilities work better in certain weather
- Visual atmosphere changes with weather

### 5.4 Status Effects

**Negative Effects:**
| Effect | Duration | Impact |
|--------|----------|--------|
| Poison | Until battle ends (or cured) | Damage per tick; persists until battle ends unless cured by healing skill or anti-poison potion |
| Burn | 5 ticks per stack (max 5 stacks) | Damage per tick; stacks up to 5 times, increasing duration with each stack |
| Freeze | 2-4 ticks | Cannot act, immune to other unit's attacks, takes 5-10 damage per tick from freeze effect |
| Stun | 2-3 ticks | Cannot act |
| Sleep | 3-5 ticks | Cannot act, wake on damage |
| Bleed | 5-8 ticks | Damage per tick |
| Blind | 3-5 ticks | 50% miss chance |
| Silence | 2-4 ticks | Can move and use basic attacks, but cannot use skills or cast spells |
| Root | 2-3 ticks | Can attack and use skills, but cannot move |
| Slow | 3-6 ticks | Speed and attack speed reduced by 30% |
| Curse | 4-7 ticks | All stats reduced by 15% |
| Confusion | 2-4 ticks | Alternates actions: attacks ally → misses → acts normally → repeats |
| Weakness | 3-5 ticks | Damage output reduced by 40% |
| Vulnerability | 3-6 ticks | Damage taken increased by 35% |
| Petrify | 1-3 ticks | Cannot act, immune to all damage, but defense increased by 100% |
| Exhaustion | 4-8 ticks | Skill effectiveness reduced by 50% |
| Corruption | 5-9 ticks | Applies a new negative status effect every 10 ticks |
| Delirium | 3-6 ticks | Skill cooldowns increased by 100% |
| Decay | 4-7 ticks | Max HP reduced by 25%, healing received reduced by 50% |
| Disarm | 2-4 ticks | Cannot use weapons (basic attack and weapon skills disabled) |
| Paralyze | 1-3 ticks | Skips every 3rd turn |
| Nightmare | 3-5 ticks | Takes 50% more damage from magic attacks |
| Drain | 4-8 ticks | MP reduced by 2 per tick, transferred to attacker |
| Fragile | 2-4 ticks | Next hit takes 200% damage |
| Taunt | 1-3 ticks | Must attack the taunter (can't use skills or switch targets) |
| Charm | 2-4 ticks | Controlled by enemy AI, attacks allies |
| Mute | 2-4 ticks | Cannot use items |
| Contagion | 3-6 ticks | Spreads to nearby allies after 2 ticks |
| Temporal Distortion | 4-8 ticks | Turn order delayed by 1 tick each turn |
| Healing Reduction | 3-5 ticks | Heal received reduced by 75% |
| Soul Drain | Until attacker is killed or battle ends | Loses 1% max HP per tick; effect ends when the attacker who applied this status is killed |
| Unstable | 2-4 ticks | Explodes on the 4th tick, dealing damage to self and nearby units |
| Curse of the Weak | 3-6 ticks | Attack reduced by 10% per nearby enemy (max 50%) |
| Sleepwalking | 2-5 ticks | Moves in a fixed pattern, attacks nearest target |
| Vulnerable to Crits | 3-5 ticks | Every 2nd hit is a critical hit |
| Magic Lock | 2-4 ticks | Cannot use magic skills (but can use physical skills and basic attacks) |

**Positive Effects:**
| Effect | Duration | Impact |
|--------|----------|--------|
| Shield | Until broken | Absorbs damage |
| Haste | 5-8 ticks | Speed boost |
| Regen | 5-10 ticks | Heal per tick |
| Barrier | Until broken | Elemental protection |
| Buff | 5-10 ticks | Stat boost |
| Reflect | 3-5 ticks | Reflects 25% of incoming damage back to attacker |
| Stealth | 2-4 ticks | Evasion increased by 80%, cannot be targeted by single-target skills |
| Berserk | 3-6 ticks | Attack increased by 60%, defense reduced by 40% |
| Focus | 3-5 ticks | Critical chance +30%, accuracy +40% |
| Cleanse | Instant | Removes all negative status effects |
| Invulnerability | 1-2 ticks | Immune to all damage and status effects |
| Mana Regen | 4-8 ticks | Restores 5 MP per tick |
| Lifesteal | 3-6 ticks | Heals for 20% of damage dealt |
| Precision | 3-5 ticks | 100% accuracy, ignores enemy evasion |
| Fortify | 4-7 ticks | Defense increased by 50%, reduces crowd control duration by 30% |
| Inspiration | 3-6 ticks | Skill cooldowns reduced by 50% |
| Radiance | 4-8 ticks | Deals 10 damage per tick to all nearby enemies |
| Empower | 3-5 ticks | Next skill deals 150% damage |
| Resilience | 4-7 ticks | Status effect duration reduced by 60% |
| Overcharge | 2-4 ticks | Magic damage +50%, but takes 20% more physical damage |
| Unity | 3-6 ticks | All nearby allies gain +10% attack and defense |
| Preserve | 2-3 ticks | Prevents max HP reduction effects |
| Evasion | 2-4 ticks | Evasion increased by 50% |
| Counterstrike | 3-5 ticks | Each hit received adds 30 counter points; when counter reaches 100, counterattack is triggered and counter resets to 0 |
| Transcendence | 1-2 ticks | Converts 50% of incoming damage to MP |

| Time Warp | 1-2 ticks | Next turn comes 2 ticks faster |
| Shield Bash | 1-2 ticks | Blocks an attack and counterattacks for 50% damage |
| Mana Shield | 3-6 ticks | Converts 50% of incoming damage to MP instead of HP |
| Group Heal | 3-6 ticks | Heals all allies for 10% HP per tick |
| Elemental Overdrive | 2-4 ticks | Elemental damage +70%, but takes 30% more damage from opposing elements |
| Steadfast | 3-5 ticks | Cannot be pushed or pulled, and knockback effects are negated |
| Lucky Star | 2-4 ticks | Each attack received adds 20 dodge points; when dodge reaches 100, attack is dodged and counter resets to 0 |

---

## 6. Progression System

### 6.1 Experience & Leveling

**Single Unified Progression System (Level 1-100):**

Combines Unit Level and Class Level into a single system with integrated Race System.

#### Hero Progression:
- **Level 1-100:** Unified level representing both individual hero and class mastery
- **Fixed Stat Growth:** Automatic stat increases per level based on Race + Class combination
- **No Manual Allocation:** All stats increase automatically with fixed growth rates

**Level Curve (Gentle Exponential):**
Using EXP formula: **EXP_next = Base × Level^1.3**

```
Novice (1–10):      EXP_next = 50 × Level^1.3 (very fast early game)
Tier 1 (11–30):     EXP_next = 60 × Level^1.3 (steady growth)  
Tier 2 (31–55):     EXP_next = 75 × Level^1.3 (mid game)
Tier 3 (56–80):     EXP_next = 90 × Level^1.3 (late game)
Tier 4 (81–90):     EXP_next = 110 × Level^1.3 (elite tier)
Tier 4 Soft Cap (91–100): EXP_next = 110 × Level^1.3 × 1.2 (growth slows by 20%)
```

**Level-Up Rewards:**
- **Novice (1-10):** Unlock basic class skills, initial stat bonuses
- **Tier 1 (11-30):** Unlock intermediate skills, improved stat growth
- **Tier 2 (31-55):** Unlock advanced skills, class-specific passive bonuses
- **Tier 3 (56-80):** Unlock master skills, significant stat bonuses
- **Tier 4 (81-100):** Unlock elite skills, exclusive class bonuses

**Race Integration:**
Each hero's base stats and skill progression are determined by **Race × Class combination**:

| Hero | Race | Class | Base Stats (Level 1) | Bonus Stats per Level |
|------|------|-------|----------------------|-----------------------|
| Legolas | Elf | Hunter | 10 STR, 20 DEX, 5 INT, 8 DEF | +1 STR, +3 DEX, +0.5 INT, +1 DEF |
| Gimli | Dwarf | Warrior | 20 STR, 8 DEX, 3 INT, 15 DEF | +3 STR, +0.5 DEX, +0.5 INT, +2 DEF |
| Gandalf | Human | Mage | 5 STR, 7 DEX, 25 INT, 6 DEF | +0.5 STR, +1 DEX, +4 INT, +0.5 DEF |

**Experience Sources:**
- Combat (gives EXP to all participating heroes)
- Quests (bonus EXP rewards)
- Exploration (discovery bonuses)

### 6.2 Skill Progression

**Skill Leveling:**
- Each skill has levels (1-10)
- Use skill in combat to gain proficiency
- Higher levels = better effects
- Skill points from level-ups to learn new skills

**Skill Tree Structure:**
```
[Base Skill]
    ├── [Branch A] → Advanced A → Master A
    ├── [Branch B] → Advanced B → Master B
    └── [Branch C] → Advanced C → Master C
```

### 6.3 Reputation System

**Faction Reputation:**
- Each major faction tracks player standing
- Standing levels: Hostile → Unfriendly → Neutral → Friendly → Honored → Exalted
- Affects: Quest availability, shop prices, NPC dialogue

**Reputation Gains/Losses:**
- Quest completion: +Faction reputation
- Quest failure/betrayal: -Faction reputation
- Killing faction members: -Large reputation

---

## 7. Item & Equipment System

### 7.1 Item Categories

| Category | Description | Examples |
|----------|-------------|----------|
| Weapons | Attack equipment | Sword, Bow, Crossbow, Staff, Dagger |
| Armor | Defense equipment | Light armor, Medium armor, Heavy armor, Robes |
| Head Gear | Head protection | Helmets, Caps, Bandanas |
| Foot Gear | Foot protection | Boots, Sandals, Shoes |
| Accessories | Utility gear | Rings, Amulets, Belts |
| Consumables | One-time use | Potions, Scrolls |
| Materials | Crafting ingredients | Herbs, Ores, Monster parts |
| Quest Items | Story progression | Keys, Letters, Artifacts |
| Currency | Trading medium | Silver, Gold |

### 7.2 Equipment Quality & Layered Stat System

The item system uses a layered approach to create depth and variety:

**Base Stats → Rarity Modifier → Affix Modifier → Enhancement Level → Weather/Element Interaction**

**Rarity Tiers:**
| Rarity | Color | Drop Rate | Stat Bonus | Max Durability | Repair Cost Multiplier | Max Affixes | Max Enhancement |
|--------|-------|-----------|------------|----------------|------------------------|-------------|-----------------|
| Common | Gray | 60% | +0-10% | 50 | 1.0x | 0 | 0 |
| Uncommon | Green | 25% | +10-25% | 75 | 1.2x | 1 | 5 |
| Rare | Blue | 10% | +25-50% | 100 | 1.5x | 2 | 10 |
| Epic | Purple | 4% | +50-75% | 125 | 2.0x | 3 | 15 |
| Legendary | Orange | 0.9% | +75-100% | 150 | 2.5x | 4 | 20 |
| Mythic | Gold | 0.1% | +100-150% | 200 | 3.0x | 5 | 25 |

**Balance Note**: For standard progression, use moderate scaling values:
- Common: 1.0x
- Uncommon: 1.15x  
- Rare: 1.35x
- Epic: 1.25x (for balanced progression)
- Legendary: 1.75x
- Mythic: 2.25x

**Item Layer Details:**

1. **Base Stats (B):** Fundamental properties of the item (attack/defense values)
2. **Rarity Modifier (R):** Bonus stats based on item rarity (+0-150%)
3. **Affix Modifier (A):** Random or crafted effects that add special properties
4. **Enhancement Level (E):** Upgrade level that increases base stats (+5% per level)
5. **Durability Degradation (D):** Stat reduction based on equipment condition (0-100%)
6. **Weather/Element Interaction (W):** Temporary stat changes based on weather or elemental affinities

**Formula Perhitungan Stat Final dari Equipment (Modular Approach):**

The formula is designed for clarity, ease of debugging, and consistent game feel:

```
1. BaseTotal = Base Stat + Affix Flat Modifier
2. ScaledBase = BaseTotal × Rarity Multiplier
3. Enhanced = ScaledBase × Enhancement Multiplier
4. DurabilityAdjusted = Enhanced × Durability Modifier
5. Final = DurabilityAdjusted × Weather/Element Modifier
```

**Breakdown Komponen:**

| Langkah | Komponen | Deskripsi | Nilai | Contoh |
|---------|----------|-----------|-------|--------|
| 1 | Base Stat (B) | Stat dasar item | Fixed per item type | Sword: 10 Attack |
| 1 | Affix Modifier (A) | Bonus afiks flat | Fixed per afiks | +5 Attack |
| 2 | Rarity Modifier (R) | Bonus rarity | +0-150% | Epic: +75% |
| 3 | Enhancement Bonus (E) | Bonus enhancement | +5% per level | Level 10: +50% |
| 4 | Durability Modifier (D) | Modifier ketahanan | 0.75 + (0.25 × DurabilityRatio) | Durability 50/100: 0.75 + (0.25 × 0.5) = 0.875 |
| 5 | Weather/Element Bonus (W) | Bonus cuaca/elemen | ±0-25% | Rain: +20% Water Damage |

**Contoh Perhitungan (Step-by-Step - Balanced Scaling):**

Item: Epic Sword (Base Attack = 10)
- Rarity Modifier: +25% (moderate scaling for balance)
- Enhancement Level: 10 (+30%) (moderate scaling for balance)
- Current Durability: 50/100 (0.5)
- Weather: Rain (+20% Water Damage)
- Affix: +5 Attack

```
1. BaseTotal = 10 + 5 = 15
2. ScaledBase = 15 × 1.25 = 18.75
3. Enhanced = 18.75 × 1.30 = 24.375
4. DurabilityAdjusted = 24.375 × 0.875 = 21.328125
5. Final = 21.328125 × 1.2 = **25.59 (≈26 Attack)**
```

**Note**: This balanced version uses the moderate scaling values from the power simulation to ensure the game's progression curve remains within 13-18× total scaling from level 1 to 100.

**Game Feel Philosophy & Balance Guidelines:**

This modular approach ensures:
- Clear sense of progression with each enhancement level
- Consistent scaling that feels rewarding without being overwhelming
- Easy debugging and balance adjustments
- Players can easily understand how each component contributes to final stats

### Critical Balance Principle

**Total Power Scaling Limit: <25× from level 1 to 100**

Power scaling should be carefully managed to maintain game balance. A simulation of level 1-100 progression shows:
- **Level 1**: ~19.5 Attack Power
- **Level 100**: ~271 Attack Power  
- **Total Scaling**: ~13.9× (well within acceptable range)

If scaling exceeds 25×, it typically leads to:
- DPS that becomes too powerful
- Enemy health and difficulty curves becoming unsustainable
- Late-game content feeling trivial
- Early-game progression feeling too slow in comparison

### Balance Targets for Each System

| System | Target Scaling Range | Purpose |
|--------|----------------------|---------|
| Character Stats | 3-4× | Primary progression driver |
| Equipment Base | 4-5× | Rewards item acquisition |
| Rarity Bonuses | 1.25-1.5× | Adds item variety |
| Enhancements | 1.3-1.5× | Rewards investment |
| Total Combined | 13-18× | Maintains balanced gameplay |

**Item Stats:**
- Base stats (attack/defense)
- Bonus stats (from rarity)
- Special properties (enchantments)
- Set bonuses (matching equipment)
- **Durability:** Measures equipment condition, decreases with use

**Durability System:**
- Equipment starts with full durability
- Each use (attack, block, skill) reduces durability by 1
- Durability can be repaired using materials at repair stations
- **Stat Degradation**: For every 10% durability lost, base stats are reduced by 10%
- Example: Equipment with 50% durability will have 50% of its base stats
- When durability reaches 0, equipment becomes broken and unusable until repaired
- Broken equipment loses all stat bonuses and cannot be used in combat

**Affix System:**
Affixes are special properties that add unique effects to equipment:

| Affix Type | Example Effects | Rarity Required |
|------------|-----------------|-----------------|
| Offensive | +10% Fire Damage, +5% Critical Rate | Uncommon+ |
| Defensive | +15% Ice Resistance, +10% Max HP | Uncommon+ |
| Utility | +20% Gold Find, +15% Experience Gain | Rare+ |
| Elemental | +25% Water Damage, -10% Fire Resistance | Epic+ |
| Special | Chance to Stun on Hit, Life Leech | Legendary+ |

**Enhancement System:**
Equipment can be enhanced up to level 10 for balanced progression:

| Enhancement Level | Base Stat Increase | Materials Required | Success Rate |
|-------------------|--------------------|--------------------|--------------|
| 1 | +5% | 1 Ingot + 50 Silver | 100% |
| 2 | +10% | 2 Ingot + 100 Silver | 100% |
| 3 | +15% | 3 Ingot + 150 Silver | 100% |
| 4 | +20% | 4 Ingot + 200 Silver | 100% |
| 5 | +25% | 5 Ingot + 250 Silver | 100% |
| 6 | +26% | 6 Ingot + 350 Silver | 95% |
| 7 | +27% | 7 Ingot + 450 Silver | 90% |
| 8 | +28% | 8 Ingot + 550 Silver | 85% |
| 9 | +29% | 9 Ingot + 650 Silver | 80% |
| 10 | +30% | 10 Ingot + 800 Silver | 75% |

**Balance Design**:
- First 5 levels: Linear +5% per level with 100% success rate (easy to reach)
- Levels 6-10: Diminishing returns (only +1% per level) with increasing materials and decreasing success rates
- Max +30% total enhancement ensures balanced scaling within the 13-18× total power range

**Weather/Element Interaction:**
Equipment stats change based on weather and elemental conditions:

| Weather/Element | Effect on Equipment |
|-----------------|---------------------|
| Rain (Water) | Water damage +20%, Fire damage -10% |
| Snow (Ice) | Ice damage +15%, Fire damage -15% |
| Heatwave (Fire) | Fire damage +25%, Water damage -10% |
| Storm (Wind) | Wind damage +20%, Earth damage -5% |
| Earthquake (Earth) | Earth damage +15%, Wind damage -10% |

**Repair System:**
- Repair stations located in towns and guild halls
- Repair cost: Based on equipment rarity and current damage
- Materials required: Ingot for weapons/armor, Plank for wooden items, Leather for leather items
- Example: Repairing a 50-durability Common Sword: 5 Ingot + 10 Silver
- Durability can be repaired up to maximum value for the equipment
- Enchantments and bonuses are preserved during repair

**Resource Sink Effect:**
The durability system creates a continuous demand for materials and currency, preventing economic inflation by:
- Requiring players to spend resources on repair instead of accumulating them infinitely
- Creating a balance between equipment acquisition and maintenance
- Encouraging crafting and material gathering as core activities
- Preventing "gear hoarding" by requiring ongoing investment in equipment maintenance

### 7.3 Crafting System

**Crafting Categories:**
- Blacksmithing: Weapons, Armor (uses ingot)
- Woodworking: Furniture, Buildings (uses plank)
- Tailoring: Clothing, Accessories (uses leather)
- Alchemy: Potions, Poisons (uses essence)
- Enchanting: Magic enhancements (uses various materials)
- Cooking: Food buffs (uses various materials)

**Crafting Components:**
- Materials (gathered/crafted)
- Recipes (unlocked via skill/quest)
- Crafting station (town buildings)

### 7.4 Inventory Management

**Equipment Slots (per hero):**
| Slot | Type | Examples |
|------|------|----------|
| Head | Helmet/bandana | Helmets, caps, bandanas |
| Body | Armor | Light armor, Medium armor, Heavy armor, Robes |
| Main Hand | Primary weapon | Sword, Staff, Bow, Crossbow |
| Off Hand | Secondary weapon/shield | Shield, Dagger, Sword |
| Feet | Shoes | Boots, sandals, shoes |
| Accessory | Flexible slots (x3) | Rings, Necklace, Amulet |

**Weapon Type Rules:**
- **Two-Handed Weapons:** Occupy both Main Hand and Off Hand slots
  - Greatswords, Bows, Crossbows, Two-handed staffs
- **Dual Wielding:** Allowed (2 one-handed weapons)
  - Example: Poison dagger (left) + Fire dagger (right)
- **One-Handed + Shield:** Standard setup
  - Sword + Shield, Dagger + Shield

**Inventory Slots:**
- Stack limits for consumables/materials
- Equipment slots: 8 per hero (Head, Body, Main Hand, Off Hand, Feet, Accessory x3)

**Stacking Rules:**
| Item Type | Max Stack |
|-----------|-----------|
| Herbs | 99 |
| Ores | 99 |
| Potions | 20 |
| Scrolls | 10 |
| Weapons | 1 |
| Armor | 1 |

---

## 8. Enemy & Monster Design

### 8.1 Enemy Categories

| Category | Examples | Behavior |
|----------|----------|----------|
| Humanoid | Bandits, Knights | Tactical, equipment |
| Beast | Wolves, Bears | Aggressive, pack |
| Undead | Skeletons, Zombies | Relentless,Fear |
| Demon | Imps, Fiends | Magic, dangerous |
| Construct | Golems, Automatons | Durable, predictable |
| Elemental | Fire spirits | Special attacks |
| Dragon | Ancient dragons | Boss-tier |

### 8.2 Enemy Stats

**Base Template:**
```
Name: [Enemy Name]
Level: X
HP: Base + (Level × Multiplier)
Attack: Base + (Level × Multiplier)
Defense: Base + (Level × Multiplier)
Speed: Base + (Level × Multiplier)
XP Reward: Base × Level
Gold Reward: Base × Level
Drop Table: [Items]
```

**Enemy Scaling:**
- Normal: Standard difficulty
- Elite: +50% stats, better drops
- Champion: +100% stats, guaranteed rare
- Boss: +200%+ stats, unique drops
- Minion Split: Some enemies (e.g., Slime) split into 2 smaller minions with -50% stats each when killed

### 8.3 AI Behavior Patterns

**Behavior Tiers:**
| Tier | Description | Example |
|------|-------------|---------|
| Passive | Won't attack unless provoked | rabbits, deer |
| Defensive | Attacks when threatened | bears, slimes |
| Aggressive | Attacks on sight | wolves, bandits |
| Territorial | Attacks in range | trolls, dragons |
| Intelligent | Tactics, flanking | humanoids, bosses |

### 8.4 Difficulty Curve

**Recommended Progression:**
| Area Level | Player Level | Enemy Level |
|------------|--------------|-------------|
| Starting Zone | 1-5 | 1-6 |
| Early Game | 6-15 | 5-16 |
| Mid Game | 16-30 | 15-32 |
| Late Game | 31-45 | 30-48 |
| End Game | 46-50 | 45-55 |
| Post-Game | 50+ | 50-70 |

---

## 9. World & Map Design

### 9.1 World Structure

**World Map:**
- **Island** surrounded by ocean
- **Size:** 69x69 grid (0-based or 1-based coordinates)
- **Center Point:** (34, 34)
- **Island Radius:** 30 grid units
- 4 symmetric regions, each with unique characteristics
- Each region has its own ecosystem and resources

### 9.2 Regions

| Region | Theme | Resources |
|--------|-------|-----------|
| Frost Peaks | Mountain & Snow | Ore → Ingot |
| Murk Bog | Swamp | Hide → Leather |
| Sun Wastes | Desert | Herb → Essence |
| Verdant Wilds | Forest | Wood → Plank |

**Region Features:**
- Each region has unique monsters and challenges
- Different difficulty levels per region
- Region-specific items and equipment

### 9.3 Resources

**Raw Materials:**
| Resource | Source Region | Refined Into |
|----------|---------------|--------------|
| Ore | Frost Peaks | Ingot |
| Wood | Verdant Wilds | Plank |
| Hide | Murk Bog | Leather |
| Herb | Sun Wastes | Essence |

**Refining:**
- Ore → Ingot (metal bars)
- Wood → Plank (processed wood)
- Hide → Leather (tanned material)

Used for crafting weapons, armor, and equipment.

---

## 10. Quest System

### 10.1 Quest Types

| Type | Description | Examples |
|------|-------------|----------|
| Main | Story progression | Collect shards |
| Side | Optional story | Help NPCs |
| Daily | Repeatable | Hunt monsters |
| Weekly | Long cooldown | Major events |
| Achievement | Milestone rewards | Collect items |
| Event | Limited time | Holiday content |

### 10.2 Quest Structure

**Quest Template:**
```
Quest Name: [Title]
Type: [Main/Side/Daily]
Prerequisite: [Required quests/level]
Description: [Story text]
Objectives:
  - [Objective 1]
  - [Objective 2]
Rewards:
  - XP: [Amount]
  - Gold: [Amount]
  - Items: [List]
  - Reputation: [Faction +/-]
```

### 10.3 Quest Flow

```
Accept Quest → Track Objectives → Complete Objectives 
    → Return to Quest Giver → Receive Rewards
```

**Quest Features:**
- Auto-tracking of active quests
- Objective markers on map
- Hint system for stuck players
- Quest log with details

---

## 11. UI/UX Design

### 11.1 Screen Layout

**Main Game Screen:**
```
┌────────────────────────────────────────────┐
│  [Menu] [Quests] [Character]    [Map] ⚙️   │  ← Top Bar
├────────────────────────────────────────────┤
│                                            │
│           GAME WORLD VIEW                  │
│                                            │
├────────────────────────────────────────────┤
│ [HP Bar] [MP Bar] [Status Effects]        │  ← Status Bar
└────────────────────────────────────────────┘
```

**Battle Screen:**
```
┌────────────────────────────────────────────┐
│              ENEMY NAMES/HP                │
├────────────────────────────────────────────┤
│                                            │
│         BATTLE ANIMATION AREA              │
│                                            │
├────────────────────────────────────────────┤
│ PLAYER HP/MP    BATTLE MENU               │
│ [Attack] [Skill] [Item] [Defend] [Flee]  │
└────────────────────────────────────────────┘
```

### 11.2 Menus

**Character Menu:**
- Stats display
- Equipment slots
- Skill tree
- Traits
- Level/progression

**Inventory Menu:**
- Item grid
- Filter tabs (Weapons/Armor/Consumables)
- Sort options
- Item details panel

**Quest Menu:**
- Active quests
- Completed quests
- Quest tracking

### 11.3 Accessibility Features

- Adjustable text size
- Colorblind modes
- Sound/visual feedback options
- Auto-save functionality
- Controller support

---

## 12. Technical Specification

### 12.1 Engine Requirements

**Godot Version:** 4.5+
**Export Targets:**
- Windows (primary)
- macOS
- Linux
- Android (optional)
- iOS (optional)

**Network Requirements:**
- Internet connection required for all gameplay
- Multiplayer functionality built-in
- Server-side progression storage

### 12.2 Architecture

**Client-Server Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Godot 4.5)                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  UI Layer (Menus, HUD, Battle Display)                  │ │
│ │  - Scene management                                     │ │
│ │  - Input handling (only for pre-battle configuration)   │ │
│ │  - Replay visualization                                 │ │
│ │  - Local settings management                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                          ↕️ WebSocket                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  Network Layer                                          │ │
│ │  - Connection management                                │ │
│ │  - Replay data reception & decoding                     │ │
│ │  - Pre-battle data transmission                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           ↕️ HTTPS/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js + Redis)                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  Combat Engine                                         │ │
│ │  - All combat calculations & processing                 │ │
│ │  - Hero stats, abilities, and AI decisions              │ │
│ │  - Turn order, damage calculations, battle outcomes     │ │
│ │  - Replay generation                                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  Progression & Data Management                          │ │
│ │  - Player data storage (MongoDB)                        │ │
│ │  - Inventory, equipment, quest progress                 │ │
│ │  - Skill/level tracking                                 │ │
│ │  - Faction & guild management                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  Matchmaking & Session Management                       │ │
│ │  - Battle session creation                              │ │
│ │  - Player authentication                                │ │
│ │  - Anti-cheat measures                                  │ │
│ │  - Server-side validation                               │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Client Project Structure:**
```
Textical/
├── assets/
│   ├── art/
│   │   ├── sprites/
│   │   ├── tilesets/
│   │   └── backgrounds/
│   ├── audio/
│   │   ├── music/
│   │   └── sfx/
│   └── fonts/
├── scenes/
│   ├── world/          # Overworld exploration
│   ├── battle/         # Battle replay display
│   ├── ui/             # Menus, HUD, configuration
│   └── menus/          # Main menu, settings
├── scripts/
│   ├── core/           # Game state management
│   ├── battle/         # Replay visualization & animation
│   ├── entities/       # Player/hero/enemy display
│   ├── systems/        # UI, input, network
│   └── ui/             # Menu & HUD controllers
├── resources/
│   ├── items/
│   ├── enemies/
│   ├── skills/
│   └── quests/
└── data/
    ├── configs/
    └── save/
```

**Key Architectural Principles:**
- **Server-Side Truth:** All combat logic, calculations, and state management happen exclusively on the server
- **Client as Renderer:** Client only receives battle replays and displays them - no combat logic runs locally
- **Deterministic Replays:** Battle replays are compressed data sequences that the client renders identically each time
- **Anti-Cheat by Design:** Since no combat logic runs on the client, most forms of cheating are impossible

### 12.3 Save System

**Save Data Structure:**
```
Save File:
├── Player Data
│   ├── Name, Level, Class
│   ├── Stats, Skills, Traits
│   ├── Inventory, Equipment
│   └── Quest Progress
├── World State
│   ├── Visited locations
│   ├── NPC relationships
│   └── World flags
└── Game Settings
    ├── Audio levels
    └── Display options
```

**Save Slots:** 6 (3 manual, 3 auto)

---

## 13. Art & Audio Direction

### 13.1 Visual Style

**Art Style:** Pixel Art with Modern Touches
- 16x16 to 64x64 sprite sizes
- Detailed pixel work with smooth animations
- Medieval fantasy color palette

**Color Palette:**
- Solara Plains: Warm greens, golden wheat
- Darkwood Forest: Deep greens, browns
- Iron Mountains: Grays, metallic blues
- Frostholm: Whites, icy blues
- Ember Wastes: Reds, oranges, charcoals

### 13.2 Character Art

**Player Characters:**
- 4-directional movement sprites
- Battle poses (attack, hurt, defend)
- Class-specific equipment visuals

**NPCs:**
- Unique portraits for key characters
- Basic sprites for generic NPCs

### 13.3 Audio Direction

**Music:**
- Regional themes per area
- Combat music (tension, battle, victory)
- Town themes (peaceful, shop, inn)
- Boss themes (epic, dramatic)

**Sound Effects:**
- Combat: Sword swings, spell casts, impacts
- UI: Menu clicks, confirmations
- Environment: Footsteps, ambient sounds

---

## 14. Monetization (Future Consideration)

### 14.1 Base Game Model

**Initial Release:** Premium purchase ($14.99-$19.99)
- Full game content
- No pay-to-win mechanics
- No loot boxes

### 14.2 Post-Launch (Optional)

**Potential Expansions:**
- New story chapters
- Additional regions
- New character classes

**Cosmetic MTX (if implemented):**
- Alternative character portraits
- Cosmetic equipment skins
- UI themes

---

## 15. Development Roadmap

### Phase 1: Pre-Production (Week 1-2)
- [ ] Finalize game design document
- [ ] Create art style guide
- [ ] Prototype combat system
- [ ] Set up project architecture

### Phase 2: Core Systems (Week 3-8)
- [ ] Implement tick-based combat engine
- [ ] Build character creation system
- [ ] Create stat and skill systems
- [ ] Develop inventory and equipment

### Phase 3: Content (Week 9-20)
- [ ] Design and implement all regions
- [ ] Create enemy types and AI
- [ ] Build quest system and content
- [ ] Implement NPC interactions

### Phase 4: Polish (Week 21-26)
- [ ] UI/UX refinement
- [ ] Balance tuning
- [ ] Bug fixing
- [ ] Performance optimization

### Phase 5: Launch (Week 27-28)
- [ ] Beta testing
- [ ] Marketing push
- [ ] Release preparation
- [ ] Launch

---

## 16. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Scope creep | High | High | Strict milestone tracking |
| Balance issues | Medium | High | Continuous playtesting |
| Technical debt | Medium | Medium | Code reviews, documentation |
| Art delays | Medium | Medium | Asset pipeline planning |
| Budget overrun | Low | High | Buffer in timeline |

---

## Appendix A: Reference Games

- **Turn-based RPGs:** Final Fantasy series, Persona, Dragon Quest
- **Indie RPGs:** Undertale, Stardew Valley, Hollow Knight
- **Action RPGs:** Zelda (top-down), Hyper Light Drifter
- **Tick-based games:** Disgaea, October RPG

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| Tick | Unit of time in combat system |
| DPS | Damage Per Second |
| CC | Crowd Control (stun, freeze, etc.) |
| DoT | Damage over Time |
| HoT | Heal over Time |
| RNG | Random Number Generator |
| Meta | Most Effective Tactics Available |
| CC0 | Creative Commons Zero (assets) |
| GDD | Game Design Document |
| MVP | Minimum Viable Product |

---

*Document Version: 1.0*  
*Created for: Textical RPG Project*  
*Engine: Godot 4.5*
