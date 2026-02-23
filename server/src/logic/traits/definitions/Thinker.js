const BaseTrait = require('../BaseTrait');

/**
 * Thinker Trait
 * Restores mana at the start of each turn.
 * Tiered Scaling:
 * Lv1: +5 Mana
 * Lv2: +12 Mana
 * Lv3: +25 Mana
 */
class ThinkerTrait extends BaseTrait {
    constructor() {
        super('thinker');
    }

    onTurnStart(unit, sim) {
        if (unit.isDead) return;

        const traitObj = unit.traits.find(t => 
            (typeof t === 'string' && t.toLowerCase() === 'thinker') || 
            (t && t.name && t.name.toLowerCase() === 'thinker')
        );
        const level = (traitObj && typeof traitObj === 'object') ? (traitObj.level || 1) : 1;

        const regenMapping = { 1: 5, 2: 12, 3: 25 };
        const regen = regenMapping[level] || 5;

        const maxMana = unit.getStat("mana_max") || 100;
        const oldMana = unit.currentMana;
        unit.currentMana = Math.min(maxMana, unit.currentMana + regen);
        
        if (unit.currentMana > oldMana) {
            sim.logger.addEvent("VFX", `${unit.data.name} contemplates strategy (+${regen} Mana)...`, { 
                actor_id: unit.instanceId, 
                vfx: "mana_regen",
                level: level 
            });
        }
    }
}

module.exports = ThinkerTrait;
