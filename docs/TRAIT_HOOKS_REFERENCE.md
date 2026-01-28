# 🪝 Textical Trait Hooks Reference (v1.0)

Hooks are the bridge between a unit's **Traits** and the **Battle Engine**. By overriding these methods in a modular trait file, you can influence every aspect of combat, from movement to death prevention.

---

## ⏳ Battle Lifecycle Hooks
These hooks trigger based on the flow of time and turn order.

| Hook Name | Timing | Context | Use Case |
| :--- | :--- | :--- | :--- |
| `onBattleStart` | Once, at Tick 0. | `(unit, sim)` | Permenant stat boosts, spawning unique VFX, or setting initial unit state. |
| `onTickStart` | Every single simulation tick. | `(unit, sim)` | Continuous regen, poison damage, or speed adjustments based on distance. |
| `onTurnStart` | When unit AP reaches 100. | `(unit, sim)` | Purging debuffs, calculating "Berserker" bonuses, or mana regeneration. |
| `onTurnEnd` | After unit completes its action. | `(unit, sim)` | Post-action cooldown reduction or "End of Turn" damage effects. |
| `onBattleEnd` | When a winner is declared. | `(unit, sim)` | Awarding unique trophies or triggering "Escape" emotes. |

---

## 🏹 Movement & Targeting Hooks
Used to control how units navigate the 50x50 grid and choose their prey.

| Hook Name | Parameters | Return Value | Effect |
| :--- | :--- | :--- | :--- |
| `onTargetAcquisition` | `(unit, sim)` | `targetUnit` or `null` | Return a unit to **force** the AI to target them (e.g. Taunt mechanics). |
| `onBeforeMove` | `(unit, sim)` | `Boolean` | Return `false` to prevent the unit from moving this turn (e.g. Root/Entangle). |
| `onMoveStep` | `(unit, nextPos, sim)` | None | Triggers for **every ubin** walked. Useful for traps or "Trail" effects (e.g. leaving fire behind). |
| `onMoveEnd` | `(unit, sim)` | None | Triggers after the unit finishes its full path. |

---

## ⚔️ Combat & Damage Hooks
The heart of the system. These hooks allow you to modify damage, reflect hits, or heal on hit.

| Hook Name | Parameters | Return Value | Effect |
| :--- | :--- | :--- | :--- |
| `onBeforeAction` | `(unit, sim)` | `Boolean` | Return `false` to cancel the current attack/skill (e.g. Confusion/Fear). |
| `onActionImpact` | `(attacker, defender, sim)`| `Object` | Return `{ damageMult: 1.5 }` to modify the damage of the hit before it lands. |
| `onTakeDamage` | `(defender, amount, sim)` | `Object` | Return `{ reflectPercent: 0.2 }` to damage the attacker back (Thorns logic). |
| `onLifesteal` | `(attacker, damage, sim)` | None | Triggers after damage is dealt. Apply healing here (Vampire logic). |
| `onKill` | `(attacker, victim, sim)` | None | Triggers when the attacker deals a killing blow. (Bloodlust/Bounty logic). |

---

## 💀 Vitality & Death Hooks
Control the boundary between life and death.

| Hook Name | Parameters | Return Value | Effect |
| :--- | :--- | :--- | :--- |
| `onBeforeDeath` | `(unit, sim)` | `Boolean` | Return **`true`** to cancel death and keep unit at 1 HP (Undead/Revive logic). |
| `onDeath` | `(unit, sim)` | None | Final triggers before unit removal. (Explosion on death or Slime splitting). |

---

## 💻 Developer Implementation Example

To use a hook, simply create a file in `server/src/logic/traits/definitions/` and override the method:

```javascript
const BaseTrait = require('../BaseTrait');

class CounterAttackTrait extends BaseTrait {
    constructor() { super('counter'); }

    onTakeDamage(defender, amount, sim) {
        if (Math.random() < 0.25) {
            // 20% chance to emote a counter-threat
            sim.logger.addEvent("EMOTE", `${defender.data.name} is preparing to strike back!`, { actor_id: defender.instanceId });
        }
        return {};
    }
}

module.exports = CounterAttackTrait;
```

---

## 💡 Notes on Return Values
- **Boolean Hooks**: If a hook expects a Boolean (like `onBeforeMove`), returning `false` will strictly cancel the engine's next step.
- **Object Hooks**: If a hook returns an object (like `onActionImpact`), the engine will merge that object into its current calculation context.
- **Multiple Traits**: If a unit has 3 traits that all implement `onTakeDamage`, the engine will execute them in order and the **last non-null return** will take priority.
