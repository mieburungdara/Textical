# 🪝 Textical Trait Hooks Reference (v3.0 - AAA Edition)

The Textical Engine provides extreme granularity for tactical combat. Every micro-event in the simulation is a potential trigger for a Trait. This document defines all available hooks for professional-grade RPG development.

---

## ⏳ Battle Lifecycle
| Hook Name | Timing | Context | Strategy |
| :--- | :--- | :--- | :--- |
| `onBattleStart` | Start of battle (Tick 0) | `(unit, sim)` | Permanent buff application (e.g. Giant growth). |
| `onRoundStart` | Every 100 total ticks | `(unit, sim)` | Round-based regenerative logic or timed reinforcements. |
| `onTickStart` | Every single tick | `(unit, sim)` | Continuous sensing or DoT (Burn/Poison) processing. |
| `onBattleEnd` | When a winner is set | `(unit, sim)` | Victory poses or "Coward" escape logic. |

---

## 🔄 Unit Turn Flow
| Hook Name | Timing | Context | Strategy |
| :--- | :--- | :--- | :--- |
| `onTurnStart` | Unit AP reaches 100 | `(unit, sim)` | Purging status effects (e.g. Skeleton immunity). |
| `onPreAction` | Before choosing move/skill | `(unit, sim)` | Chance to skip action (e.g. Fear/Paralysis). |
| `onPostAction` | After action finishes | `(unit, sim)` | Cooldown modifications or "Quick-Step" movement. |
| `onTurnEnd` | Before AP deduction | `(unit, sim)` | Post-turn regeneration or resource balance. |

---

## 🗺️ Movement & Grid Intelligence
| Hook Name | Parameters | Return | Description |
| :--- | :--- | :--- | :--- |
| `onBeforeMove` | `(unit, sim)` | `Boolean` | Return `false` to root the unit in place. |
| `onTileEnter` | `(unit, toPos, sim)` | None | Triggers traps or "Charge" damage bonuses. |
| `onTileExit` | `(unit, fromPos, sim)`| None | Leave fire trails or trigger opportunity attacks. |
| `onMoveStep` | `(unit, nextPos, sim)`| None | Called for every single tile walked. |
| `onAdjacencyGained`| `(unit, target, sim)` | None | Activate auras like **Shield Wall** instantly. |

---

## ⚔️ Combat Micro-Phases (The AAA Core)
These hooks trigger inside the exact calculation window of an attack or skill.

| Hook Name | Perspectives | Context | Impact |
| :--- | :--- | :--- | :--- |
| `onPreAttack` | Attacker | `(atk, def, sim)` | Stat gathering (e.g. "Focus" bonus). |
| `onPreDefend` | Defender | `(def, atk, sim)` | Preparation (e.g. "Brace" for impact). |
| `onDodge` | Defender | `(def, atk, sim)` | Triggers ninja-style counter-attacks. |
| `onCrit` | Attacker | `(atk, def, dmg, sim)`| Apply extra debuffs on critical hits. |
| `onTakeDamage` | Defender | `(def, atk, dmg, sim)`| Mitigation, reflection (Thorns), or mana shield. |
| `onPostHit` | Defender | `(def, atk, dmg, sim)`| "Pain" triggers or reactive healing. |
| `onLifesteal` | Attacker | `(atk, dmg, sim)` | Specialized healing (Vampire logic). |
| `onKill` | Attacker | `(atk, victim, sim)` | "Bloodlust" (AP gain) or "Bounty" (Gold gain). |

---

## 🧪 Status & Resources
| Hook Name | Parameters | Return | Description |
| :--- | :--- | :--- | :--- |
| `onStatusApplied` | `(unit, effect, sim)` | `Boolean` | Return `false` to resist a specific debuff. |
| `onStatusTick` | `(unit, effect, sim)` | None | Modify behavior based on active DoT intensity. |
| `onManaGain` | `(unit, amount, sim)` | None | Visual feedback or synergy with other skills. |
| `onManaSpend` | `(unit, amount, sim)` | None | Triggers "Mana Addict" or "Arcane Overload". |

---

## 🤝 Team Synergy
| Hook Name | Parameters | Logic |
| :--- | :--- | :--- |
| `onAllyDamage` | `(unit, ally, dmg, sim)`| Act as a "Guardian" and take damage for friends. |
| `onAllyKill` | `(unit, ally, vict, sim)`| Morale boost for the whole squad. |
| `onAllyDeath` | `(unit, ally, sim)` | Enter a "Rage" state (Vengeance) when allies die. |

---

## 💀 Finality
| Hook Name | Parameters | Return | Description |
| :--- | :--- | :--- | :--- |
| `onBeforeDeath` | `(unit, sim)` | `Boolean` | Return **`true`** to cancel death (Undead/Phoenix). |
| `onDeath` | `(unit, sim)` | None | Explosive death or spawning mini-units (Slime). |