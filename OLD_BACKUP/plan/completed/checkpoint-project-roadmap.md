# Textical Project Master Roadmap

## Feature summary (high-level, 5–10 lines)
- Goal: Consolidate all previously completed and planned feature logs into a single high-fidelity roadmap to reduce file clutter and provide a unified source of truth.
- User-facing behavior: Professional documentation of all implemented engine features, from the Albion economy to dynamic world AI.
- Scope (in): Summary of all 50+ checkpoints covering Core Architecture, Combat, Economy, Faction, Guild, and Resource systems.
- Scope (out): Deletion of redundant individual checkpoint files.
- Assumptions: The master roadmap will serve as the reference for all future development.
- Risks: Losing granular task history (mitigated by Git history and comprehensive summaries).

## Checklist (TDD-first, actionable)

- [x] Draft Master Roadmap: Core Architecture & Systems
  - Files: `plan/checkpoint-project-roadmap.md`
  - TEST: N/A
  - IMPLEMENT: Summarize all Modular Refactors, DB Audits, Dual-Level Architecture, and README Overhauls into a "Core Engine" section.
  - VERIFY: Section is complete.

- [x] Draft Master Roadmap: Combat, Skills & Classes
  - Files: `plan/checkpoint-project-roadmap.md`
  - TEST: N/A
  - IMPLEMENT: Summarize Active Skills, Tactical Combat, Legendary Class System (T1-T3), and Skill Trees into a "Combat & Progression" section.
  - VERIFY: Section is complete.

- [x] Draft Master Roadmap: Economy, Market & Heroes
  - Files: `plan/checkpoint-project-roadmap.md`
  - TEST: N/A
  - IMPLEMENT: Summarize Albion-style Localized Markets, Buy/Sell Orders, Hero Auction, and Advanced Economy logic.
  - VERIFY: Section is complete.

- [x] Draft Master Roadmap: World Simulation & Social
  - Files: `plan/checkpoint-project-roadmap.md`
  - TEST: N/A
  - IMPLEMENT: Summarize Dynamic World Spawner, Events, NPC AI, Factions, Guild Conquest, and Facilities.
  - VERIFY: Section is complete.

- [x] Draft Master Roadmap: Resource & Production Loop
  - Files: `plan/checkpoint-project-roadmap.md`
  - TEST: N/A
  - IMPLEMENT: Summarize Mining, Lumbering, Fishing, Hunting, Alchemy, Culinary, and all refining/smithing systems.
  - VERIFY: Section is complete.

- [x] Perform Plan Cleanup (Deletion)
  - Files: `plan/*.md` (Excluding Master Roadmap)
  - TEST: Verify files are summarized correctly before deletion.
  - IMPLEMENT: Delete all 50+ redundant checkpoint files from the `/plan` directory.
  - VERIFY: `/plan` only contains the Master Roadmap.

- [x] Notify Completion via Telegram
  - Files: `server/notify.js`
  - TEST: N/A
  - IMPLEMENT: Run the notification script with a high-fidelity DevLog status message using the new AAA template.
  - VERIFY: Telegram message received.

## Progress log (append-only)
- 2026-01-31T22:00:00 - Master Roadmap plan created to consolidate 50+ checkpoints.
- 2026-01-31T22:15:00 - Master Roadmap drafted across all 5 logical pilar categories.
- 2026-01-31T22:20:00 - Cleaned up 50+ redundant checkpoint files from /plan directory.
- 2026-01-31T22:25:00 - Project roadmap finalized and high-fidelity DevLog sent to Telegram.

---

# 📜 TEXTICAL: PROJECT MASTER ROADMAP (v1.0)

## 🏛️ PART I: CORE ENGINE & ARCHITECTURAL FOUNDATION

### 1. Modular Service Refactor (The "Thin Service" Pattern)
Refactored the entire backend service layer into specialized, decoupled components.
- **BaseService Foundation**: Established unified DB access, centralized logging, and secure transaction wrappers.
- **Decoupled Logic**: Moved heavy formulas (XP, gathering durations, stat scaling) from monolithic orchestrators into pure logic components.
- **Strategy Implementation**: Task processors now use a strategy pattern for varied activities (Travel, Gather, Craft).

### 2. Strict Relational Integrity (Normalization Audit)
Performed a 100% full relational audit of the database schema.
- **Zero JSON Policy**: Removed all String-encoded JSON and CSV arrays from `NPCTemplate`, `SkillTemplate`, `WorldEventTemplate`, and `TransactionLedger`.
- **Relational Mapping**: Implemented explicit join tables and columns for all metadata, enabling high-performance queries and robust data analytics.

### 3. Dual-Level Architecture (Physical vs Professional)
Implemented a sophisticated progression model that decouples permanent strength from resettable mastery.
- **Unit Level (1-100)**: Represents permanent physical attributes (STR, DEX, INT, VIT).
- **Class Level (1-Max)**: Represents professional expertise and skill unlocks.
- **Class Mastery Tracking**: Professional progress is archived per hero, allowing them to retain strength while exploring new specializations.

### 4. High-Fidelity Communication & Documentation
- **AAA README Overhaul**: Compiled a 100% comprehensive engine guide covering all 10+ core systems.
- **DevLog Pipeline**: Established a professional Telegram notification system for real-time architectural updates.

## ⚔️ PART II: COMBAT, SKILLS & CLASS PROGRESSION

### 1. Legendary 4-Tier Class Evolution
Implemented a massive 115+ class hierarchy with branching specializations.
- **Foundations (T1)**: The core 23 archetypes (Warrior, Archer, etc.).
- **Specializations (T2)**: Exactly two branching paths for every Tier 1 class.
- **Mastery (T3)**: Hyper-specialized "Legendary" forms for Tier 2 heroes.
- **Automatic Promotion**: Seamless class advancement at Level 20 (T1->T2) and Level 75 (T2->T3).

### 2. Tactical Combat Engine (Authoritative)
Developed a grid-based, authoritative battle simulation rewarded strategic positioning.
- **Directional Bonuses**: SIDE attacks (1.1x) and BACK attacks (1.5x damage + 50 Accuracy).
- **Behavior Tree AI**: Fully autonomous AI using `SimpleAI` or specialized template-driven trees.
- **Action Points (AP)**: Initiative-driven turn-based logic based on Speed attributes.

### 3. Unique Class Skill Trees
Implemented dynamic skill unlocking and execution.
- **Active Skills**: Integrated with `SkillExecutor` for damage, healing, and buffs during battle.
- **Passive Perks**: Automatically integrated into `StatService` for real-time attribute boosts.
- **Resource Engine**: Unique mechanics for Rage (Warriors), Energy (Rogues), and Mana (Mages).

## 🏪 PART III: PLAYER-DRIVEN ECONOMY & MARKETPLACE

### 1. Albion-Style Localized Markets
Revolutionized trading by isolating markets into regional town hubs.
- **Geographic Liquidity**: Items listed in Town A are invisible in Town B, fostering a hauling/trading economy.
- **Order-Driven Engine**: Implemented Stock Market-style Sell Orders and gold-escrowed Buy Orders.
- **Automatic Matching**: The `OrderMatcher` fulfills demands instantly when prices align, supporting partial fills.

### 2. Advanced Hero Auction System
Established a localized contract market for the world's legends.
- **Asset Liquidity**: Heroes can be listed for sale, automatically locking them from combat/tasks to ensure integrity.
- **Criteria Gating**: Buy orders can target specific Classes and Minimum Levels.
- **Atomic Transfer**: Single-transaction ownership transfer and net-profit payouts.

### 3. Advanced Economy Components
- **TransactionManager**: Central single-point-of-truth for gold movement and audit logging.
- **Relational Ledger**: Explicit `sourceId` and `sourceType` tracking for 100% financial transparency.
- **Fee Infrastructure**: Automated Imperial taxes (gold sink) and localized guild revenues.

## 🌌 PART IV: LIVING WORLD & SOCIAL INFRASTRUCTURE

### 1. Dynamic Phenomena & Spawning
- **World Event Engine**: Regional triggers (e.g., Meteor Shower) that dynamically alter gathering yields and combat stats.
- **Dynamic Spawner**: Injects event-exclusive resources (Star-Iron) and monsters (Raid Elites) in real-time.

### 2. Advanced NPC AI (Autonomous)
- **Schedule-Driven Movement**: NPCs follow daily routines, moving between regions based on the global clock.
- **Event-Reactive Behavior**: NPCs override schedules during events, changing location, dialogue, or shops.
- **Faction Hostility**: Enemy NPCs refuse service, issue threats, and trigger combat encounter during war.

### 3. Guild Territory Conquest (GvG)
- **Regional Capture**: Guilds can seize towns, establishing them as territorial hubs.
- **Custom Taxation**: Owning guilds receive market and gathering tithes directly into their Treasury.
- **Automated Upkeep**: Control is maintained through daily gold deductions from the guild vault.
- **Facility Infrastructure**: Template-driven building system (Armory, Library) providing collective buffs.

### 4. Advanced Quest Narrative Engine
- **Branching Dialogues**: NPC conversations with multi-choice options and logical side-effects.
- **Faction Standing**: Reputation-based rank progression unlocking gated quests and exclusive perks.

## ⚒️ PART V: RESOURCE ECONOMY & PRODUCTION PIPELINE

### 1. The 5-Pillar Gathering Loop
Implemented a deep, attribute-scaled resource system across the world.
- **Minerals & Timber (STR)**: Tiered mining and lumbering with 25+ unique materials each.
- **Botany & Foraging (INT)**: 25+ herb types used for alchemical brews.
- **Aquatic & Water (DEX)**: Deep fishing system with specialized speed scaling.
- **Hunting & Butchery (Loot)**: Specialized tools (Knives/Cleavers) to enhance leather and meat yields from logical monster types.

### 2. Tiered Tool Progression
- **Specialized Mastery**: 5 tiers of tools (Pickaxes, Axes, Rods, Sickles) with strict physical and level requirements.
- **Contextual Stats**: Tool bonuses apply ONLY during their relevant activities, preventing combat power-creep.

### 3. Multi-Step Refining & Crafting
- **2:1 Material Conversion**: Standardized refining pipeline through `CraftingService`.
- **Primary Refining**: Smelting (Metal Bars), Tanning (Leather), Weaving (Cloth), Processing (Planks).
- **Consumable Mastery**: Advanced Alchemy (Permanent/Temporary Elixirs) and Culinary (Stat-buffing dishes).
- **Equipment Smithing**: Production of tiered weapons and armor sets using 100% refined materials.

### 4. Advanced Inventory Management
- **Multi-Stacking**: Robust system with explicit `maxStack` limits and automatic overflow slots.
- **Auto-Sort & Merge**: One-click consolidation of partial stacks and categorical organization.