# 🧠 Textical Trait Lexicon (v1.1)

---

## 🛡️ Core Combat & Stat Traits

| Trait Name | Type | Hook | Mechanical Description | Tactical Advice |
| :--- | :--- | :--- | :--- | :--- |
| **Giant** | Stat | `onBattleStart` | **+50% Max HP**, but **-5 SPD**. The unit becomes a massive tank but acts less frequently. | Best for frontline units designed to soak up damage and block paths. |
| **Glass Cannon**| Stat | `onBattleStart` | **+80% ATK**, but **-60% Max HP**. Deals extreme damage but dies very easily. | Keep them in the backline or protected by a "Giant" unit. |
| **Berserker** | Dynamic | `onTurnStart` | Increases ATK by up to **50%** based on missing HP. The lower the health, the harder they hit. | Synergizes with "Undead" to stay alive at 1 HP while dealing max damage. |
| **Thinker** | Utility | `onTurnStart` | Regenerates **5 MP** at the start of every turn. | Essential for Mages and units that rely on expensive active skills. |
| **Coward** | Dynamic | `onTickStart` | Grants **+10 SPD** when health is below 30%. | Allows vulnerable units to escape and regroup when near death. |
| **Thorns** | Reactive | `onAfterDefend` | Reflects **20%** of incoming physical damage back to the attacker. | High DEF units with this trait can kill attackers just by standing still. |
| **Vampire** | Reactive | `onLifesteal` | Converts **30%** of outgoing physical damage into HP. | Best for units with high SPD to keep their health topped off. |

---

## 💀 Racial & Special Traits

| Trait Name | Hook | Detailed Description |
| :--- | :--- | :--- |
| **Skeleton** | `onTurnStart` | Naturally immune to **POISON** and **BURN**. Purges these effects instantly. |
| **Undead** | `onBeforeDeath`| 20% chance to survive a fatal blow at **1 HP**. (Once per battle). |
| **Slime** | `onDeath` | Splits into 2 **Mini Slimes** (40% HP) upon death. |

---

## 🏗️ Technical Integration

### How to use with AI Behavior Trees
Use the `CheckTrait` node in the AI Architect to trigger specific logic:
- `CheckTrait: "Coward"` -> `CheckHealth: 0.3` -> **Action: KiteTarget**.
- `CheckTrait: "Giant"` -> **Action: MoveToTarget** (Always lead the charge).

### Priority of Execution
The `TraitsManager` now supports **Multiple Traits**. If a unit has both "Giant" and "Thorns", both effects will trigger in their respective hooks.