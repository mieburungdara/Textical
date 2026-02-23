# 🤖 Textical AI Node Manual (v1.0)

This reference guide details all available **Conditions (IF Gates)** and **Actions (DO Blocks)** within the Textical Behavior Tree engine. These nodes allow you to architect complex, authoritative logic for both Monsters and Heroes.

---

## 🏗️ Structural Nodes (The Skeleton)

These nodes define the flow of logic. They do not perform checks or actions themselves but decide which branches to execute.

| Node Name | Visual Type | Logic Pattern | Description |
| :--- | :--- | :--- | :--- |
| **Priority** | Selector | **OR** | Tries children from left to right. Stops and returns SUCCESS at the first child that succeeds. Ideal for "Fallback" logic. |
| **Switch** | Sequence | **AND** | Executes children from left to right. If any child fails, the whole sequence fails. Ideal for "Combo" steps. |
| **Inverter** | IF NOT | **NOT** | Flips the result of its child. If the child succeeds, this node fails. |

---

## 🔍 Conditions (The "IF" Gates)

Conditions are **Logic Gates**. In our engine, most conditions support an **IF-THEN-ELSE** structure:
- **THEN (Child 0)**: Executed if the condition is TRUE.
- **ELSE (Child 1)**: Executed if the condition is FALSE.

| Node Name | Parameter (JSON) | Description | Example Use |
| :--- | :--- | :--- | :--- |
| **CheckHealth** | `{"threshold": 0.4}` | Checks if current HP % is below the threshold (0.0 to 1.0). | `{"threshold": 0.2}` triggers panic behavior at 20% HP. |
| **CheckMana** | `{"threshold": 0.5}` | Checks if current MP % is **above** or equal to the threshold. | Used to ensure unit has enough mana for high-tier skills. |
| **CheckDistance** | `{"distance": 5, "operator": ">"}` | Compares distance to target using operators: `>`, `<`, `==`, `>=`, `<=`. | `{"distance": 2, "operator": "<="}` checks if target is in melee range. |
| **CheckSkillReady**| `{"skillId": 101}` | Returns TRUE if the specified skill is off cooldown. | `{"skillId": 1}` ensures unit doesn't waste turns trying a charging skill. |
| **CheckTargetStatus**| `{"effectType": "BURN"}`| Checks if the current target has a specific status effect. | Useful for combos (e.g., use "Extinguish" only if target is "BURN"). |
| **CheckAllyCount** | `{"minCount": 2, "comparison": ">="}` | Counts living allies in the battle. | Logic: "If I am alone, retreat." |
| **CheckLineOfSight**| None | Checks if the path to the target is clear of obstacles. | Prevents Archers from shooting through solid stone walls. |
| **CheckTrait** | `{"traitName": "Undead"}`| Checks if the unit possesses a specific Trait. | `{"traitName": "Fireborn"}` allows AI to ignore fire hazards. |
| **NearbyUnitsCount**| `{"range": 3, "team": "OTHER", "minCount": 3}` | Counts units within radius. Team: `SAME` (Ally) or `OTHER` (Enemy). | Perfect for triggering AoE skills when surrounded. |
| **RandomProbability**| `{"chance": 0.3}` | A "Dice Roll". Returns TRUE based on chance (0.0 to 1.0). | `{"chance": 0.1}` for rare "Elite" maneuvers. |
| **HasStatusEffect** | `{"effectType": "STUN"}`| Checks if the *owner* of the brain has this effect. | Used to skip turns or change priority when debuffed. |
| **IsTargetInRange** | None | Simple check: Is target within `stats.attack_range`? | The most common gate for basic combat loops. |

---

## ⚔️ Actions (The "DO" Blocks)

Actions are leaf nodes. They perform physical changes to the unit or the grid and usually return SUCCESS once the order is issued.

| Node Name | Parameter (JSON) | Description | Result |
| :--- | :--- | :--- | :--- |
| **AttackTarget** | None | Performs a standard physical attack on the current target. | Triggers damage calculation & VFX. |
| **MoveToTarget** | None | Uses A* Pathfinding to move 1 step closer to the current target. | Changes unit position on the grid. |
| **KiteTarget** | None | Moves 1 step **away** from the target while staying in attack range. | Strategic retreat for Archers/Mages. |
| **FindTarget** | `{"strategy": "ENEMIES"}` | Sets the "Current Target" in memory. Strategies: `ENEMIES`, `ALLIES`, `LOWEST_HP`. | Updates the unit's "Blackboard" target. |
| **UseSkill** | `{"skillId": 5}` | Executes a specific skill from the database. | Consumes Mana and applies skill effects. |

---

## 💡 Pro-Tips for AI Design

1.  **Memory (The Blackboard)**:
    -   `FindTarget` is usually the first node. It "remembers" a target.
    -   Subsequent nodes like `AttackTarget` or `UseSkill` "read" that target from memory.
2.  **The "Safety" Priority**:
    -   Always put your **Survival Logic** (HP checks, fleeing) at the top-left of a `Priority` node.
    -   Always put your **Default Behavior** (Idle, random walk) at the bottom-right.
3.  **Efficiency**:
    -   Use `CheckSkillReady` before `UseSkill`. If you don't, the `UseSkill` node will just fail, wasting time in the execution loop.
4.  **Combinations**:
    -   `CheckDistance` + `KiteTarget` = A unit that perfectly maintains its range without ever getting hit.
