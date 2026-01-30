# ⚔️ TEXTICAL: High-Fantasy Tactical RPG Engine ⚔️

**Textical** is a state-of-the-art, AAA-standard 2D Tactical RPG engine built with a focus on authoritative simulation, modular economy, and deep relational progression. It features a sophisticated client-server architecture where every calculation—from combat phases to resource gathering—is verified and processed on the server to ensure absolute integrity and tactical depth.

---

## 🏛️ Core Architecture & Design Philosophy

### 1. Authoritative Simulation Model
Every action in Textical is a server-side event. The client acts strictly as a high-fidelity visualizer, while the engine handles A* pathfinding, trait hooks, and combat resolution in a strictly controlled environment.

### 2. The "Thin Service" Pattern
The backend is structured into modular, decoupled layers:
- **Orchestrators (Services)**: Lightweight managers that coordinate high-level flows (e.g., `GatheringService`, `NPCService`).
- **Logic Components**: Specialized files containing pure formulas and rules (e.g., `XPFormula`, `DurationCalculator`).
- **BaseService Foundation**: A unified parent class providing standardized database access, centralized logging, and secure transaction wrappers.

### 3. Strict Relational Database (100% Normalized)
The database operates on a pure relational schema using **Prisma ORM**. We have eliminated all JSON/Array fields in favor of explicit columns and join tables, enabling high-performance queries and robust data analytics.

---

## ⚔️ Tactical Combat System

Textical features a grid-based, tick-driven combat simulation that rewards strategic positioning and hero composition.

### 🎮 Battle Mechanics
- **Action Points (AP) & Initiative**: Units gain AP based on their Speed. When a unit reaches 100 AP, they take a turn. Initiative determines the starting AP advantage.
- **Directional Combat**: Attacking from the **SIDE** grants a 1.1x damage bonus, while **BACK** attacks grant a 1.5x bonus and a +50 Accuracy boost.
- **Cover & Obstacles**: Units can utilize environmental cover to gain significant Defense bonuses (+15 DEF).
- **Authoritative SkillExecutor**: A centralized engine that processes active skills using metadata-driven multipliers for damage, healing, and buffs.

### 🤖 Intelligent Battle AI
- **Behavior Tree Integration**: Units use complex JSON-based Behavior Trees (e.g., `SimpleAI`) for tactical decision-making.
- **Fallback Logic**: In the absence of a tree, units use a smart fallback system that prioritizes active skills based on range and resource availability.

---

## 📈 Progression & Mastery

### 🧬 Dual-Level Architecture
Textical decouples physical growth from professional expertise:
- **Unit Level (1-100)**: Represents the hero's permanent physical foundation. Increasing Unit Level grants permanent base attributes (STR, DEX, INT, VIT).
- **Class Level (1-20/Max)**: Represents professional mastery. Increasing Class Level unlocks skills and class-specific growth bonuses.
- **Class Mastery Table**: When a hero promotes or switches jobs, their professional progress is archived, allowing them to retain their strength while exploring new disciplines.

### 🛡️ Tiered Evolutions
Heroes follow branching promotion paths (e.g., Warrior ➡️ Knight or Berserker). Promotions grant a permanent **+5 Promotion Bonus** to all attributes and reset the Class Level to 1 for a new mastery cycle.

### 📜 Unique Skill Trees
Every class features a dedicated tree of **Active** and **Passive** skills. Passives are dynamically integrated into the `StatService`, while Actives are executed by the `SkillExecutor` during combat.

---

## 💎 Economy & World Simulation

### ⚒️ The 5-Pillar Resource Loop
The world is rich with raw materials categorized into 5 pillars: **Minerals (STR)**, **Wood (STR)**, **Hides (Loot)**, **Herbs (INT)**, and **Fish (DEX)**.
- **Tiered Gathering**: 5 tiers of resources requiring specialized tools (Pickaxes, Axes, Sickles, Rods) of appropriate tiers.
- **2:1 Refining Pipeline**: All raw materials are processed through the `CraftingService` into refined goods (Bars, Planks, Leathers, Cloths, Extracts).

### 🧪 Advanced Alchemy & Culinary Arts
- **Alchemy**: Refine herbs into concentrated extracts to brew powerful temporary elixirs or rare **Permanent Stat Potions**.
- **Culinary**: Cook monster meat and fish into dishes that grant strategic temporary buffs.

### 👥 Dynamic NPC & World Population
- **NPC Roles**: The world is inhabited by Job Changers, Quest Givers, Healers, and Gamblers.
- **Wandering Merchants**: Rare traders like *Zev the Wandering* appear randomly in wilderness regions with temporary inventories.
- **Multi-Stage Quests**: Narrative-driven questlines that evolve through sequential phases with unique regional objectives.

### 🌌 World Events
Temporary regional phenomena (e.g., **Meteor Showers**, **Orc Raids**) that dynamically alter resource yields (+2.0x Mining) and combat stats in real-time.

---

## 🛠️ Technical Stack
- **Backend**: Node.js
- **Database**: SQLite / PostgreSQL via Prisma ORM
- **Simulation**: Custom Authoritative Engine (Tick-based)
- **Communication**: High-fidelity DevLog pipeline via Telegram API

---
**Textical: Where Professional Architecture Meets Legendary Adventure.**