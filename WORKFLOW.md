# Textical: Implementation Workflow & Roadmap

This document tracks the physical progress of the Textical RPG engine.

## Current Phase: II - Core Engine & Early Game Mechanics
**Goal:** Implement the "Zero-to-Hero" loop (Scavenging -> Quests -> First Gold).

---

| Phase | Task | Status | Description |
| :--- | :--- | :--- | :--- |
| **I: Foundation** | DB Saturation | ✅ COMPLETE | 100% relational saturation across all 60+ tables. |
| | Asset Normalization | ✅ COMPLETE | Zero-JSON architecture for Items, Monsters, and Regions. |
| | Starter State | ✅ COMPLETE | User starts with 1 Novice, 0 Gold, 100 Vitality. |
| | Economy Config | ✅ COMPLETE | No Monster Gold. 90% NPC Penalty. Double Market Tax (5%+5%). |
| **II: Core Engine** | `VitalityService` | ✅ COMPLETE | Account-wide energy consumption & Tavern recovery (24m limit). |
| | `MarketService` | ✅ COMPLETE | Dual-Tax logic, 24h Expiry, and Town-Only Viewing. |
| | `QuestService` | ✅ COMPLETE | Daily Quest generation (The only source of gold injection). |
| | `TravelService` | ✅ COMPLETE | Map transitions (15s) and "On the Road" state. |
| | Networking Refactor| ✅ COMPLETE | Modular, component-based handlers with inheritance. |
| **III: Gameplay** | Task Queue | ✅ COMPLETE | Background processor for all timed actions. |
| | `GatheringService` | ✅ COMPLETE | Resource extraction logic (10s timers for Iron/Twigs). |
| | Tavern Spawner | ✅ COMPLETE | Automated random hero generation (10-60m) and occupancy timers. |
| | `CraftingService` | ✅ COMPLETE | Recipe-based item production with variable timers. |
| **IV: Combat** | Tactical Grid | ✅ COMPLETE | 3x3 formation validation & Dual-Wield passive aggregation. |
| | Battle Engine | ✅ COMPLETE | Turn-based idle logic with zero-gold material drops. |
| **V: Interface** | API Documentation | ✅ COMPLETE | Full endpoint reference (`docs/API.md`) for Client Dev. |
| **V: Interface** | Godot 4 UI | ✅ COMPLETE | Full navigation loop from Login to Town to Wilderness. |
| | Deployment Prep | ✅ COMPLETE | Dockerized backend and hosting guide (`DEPLOYMENT.md`). |
| | Total Brain Purge | ✅ COMPLETE | Removed all local logic, stats, and legacy code from Godot. |
| **VI: Advanced** | Breeding System | ⏳ **NEXT** | Genetics-based hero generation and skill inheritance. |
| **V: Interface** | Godot 4 UI | ⏳ PENDING | HUD, Progress Bars, World Map, and Tavern/Market views. |

---

## Technical Milestones
- [x] Absolute Master Relational Schema (Prisma/SQLite).
- [x] Automatic Asset-to-DB Sync Engine (`AssetService`).
- [x] 100% Seeded Test Environment (`seed.js`).
- [ ] Vitality Heartbeat Processor.
- [ ] Marketplace Archiver (Cron).
