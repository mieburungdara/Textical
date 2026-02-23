const BaseTrait = require('../BaseTrait');

/**
 * Undying Will Trait (Renamed from Skeleton)
 * Grants immunity to certain status effects and a chance to revive upon taking lethal damage.
 * Tiered Scaling:
 * Lv1: Poison immunity, 10% chance to revive with 1 HP.
 * Lv2: Poison/Burn immunity, 25% chance to revive with 1 HP.
 * Lv3: Poison/Burn/Bleed immunity, 50% chance to revive with 10% Max HP.
 */
class UndyingWillTrait extends BaseTrait {
    constructor() {
        super('undyingwill');
    }

    onTurnStart(unit, sim) {
        if (unit.isDead) return;

        // Get trait level
        const traitObj = unit.traits.find(t => 
            (typeof t === 'string' && t.toLowerCase() === 'undyingwill') || 
            (t && t.name && t.name.toLowerCase() === 'undyingwill')
        );
        const level = (traitObj && typeof traitObj === 'object') ? (traitObj.level || 1) : 1;

        // Natural immunity to status effects based on level
        if (level >= 1) {
            unit.activeEffects = unit.activeEffects.filter(e => e.type !== "POISON");
        }
        if (level >= 2) {
            unit.activeEffects = unit.activeEffects.filter(e => e.type !== "BURN");
        }
        if (level >= 3) {
            unit.activeEffects = unit.activeEffects.filter(e => e.type !== "BLEED");
        }
    }

    onBeforeDeath(unit, sim) {
        // Initialization
        if (!unit._traitState) unit._traitState = {};
        if (!unit._traitState.undyingWill) unit._traitState.undyingWill = { did_revive: false };

        if (unit._traitState.undyingWill.did_revive) return false;

        // Get trait level
        const traitObj = unit.traits.find(t => 
            (typeof t === 'string' && t.toLowerCase() === 'undyingwill') || 
            (t && t.name && t.name.toLowerCase() === 'undyingwill')
        );
        const level = (traitObj && typeof traitObj === 'object') ? (traitObj.level || 1) : 1;

        // Tiering
        const chanceMapping = { 1: 0.10, 2: 0.25, 3: 0.50 };
        const reviveChance = chanceMapping[level] || 0.10;

        if (Math.random() < reviveChance) {
            const maxHP = unit.getStat("health_max");
            
            if (level >= 3) {
                unit.currentHealth = Math.floor(maxHP * 0.1);
            } else {
                unit.currentHealth = 1;
            }
            
            unit._traitState.undyingWill.did_revive = true;
            sim.logger.addEvent("VFX", `${unit.data.name} refused to die!`, { 
                actor_id: unit.instanceId, 
                vfx: "revive",
                level: level,
                hp_restored: unit.currentHealth 
            });
            return true; 
        }
        return false;
    }
}

module.exports = UndyingWillTrait;
