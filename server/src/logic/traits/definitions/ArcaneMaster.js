const BaseTrait = require('../BaseTrait');

/**
 * Arcane Master Trait
 * Increases damage of skills and grants a chance to reset the skill's cooldown immediately after use.
 * Tiered Scaling:
 * Lv1: 1.2x Skill Damage, 15% Reset Chance
 * Lv2: 1.5x Skill Damage, 30% Reset Chance
 * Lv3: 2.0x Skill Damage, 50% Reset Chance
 */
class ArcaneMasterTrait extends BaseTrait {
    constructor() {
        super('arcanemaster');
    }

    onPreAttack(attacker, sim, target, skill) {
        if (!skill) return {};

        const traitObj = attacker.traits.find(t => 
            (typeof t === 'string' && t.toLowerCase() === 'arcanemaster') || 
            (t && t.name && t.name.toLowerCase() === 'arcanemaster')
        );
        const level = (traitObj && typeof traitObj === 'object') ? (traitObj.level || 1) : 1;

        const dmgMultMapping = { 1: 1.2, 2: 1.5, 3: 2.0 };
        const dmgMult = dmgMultMapping[level] || 1.2;

        return { dmgMult: dmgMult };
    }

    onPostAction(unit, sim, skill) {
        if (!skill || unit.isDead) return;

        const traitObj = unit.traits.find(t => 
            (typeof t === 'string' && t.toLowerCase() === 'arcanemaster') || 
            (t && t.name && t.name.toLowerCase() === 'arcanemaster')
        );
        const level = (traitObj && typeof traitObj === 'object') ? (traitObj.level || 1) : 1;

        const resetChanceMapping = { 1: 0.15, 2: 0.30, 3: 0.50 };
        const resetChance = resetChanceMapping[level] || 0.15;

        if (Math.random() < resetChance) {
            unit.skillCooldowns[skill.id] = 0;
            
            sim.logger.addEvent("VFX", `${unit.data.name} manipulates time to reset ${skill.name}!`, { 
                actor_id: unit.instanceId,
                vfx: "arcane_reset",
                level: level
            });
        }
    }
}

module.exports = ArcaneMasterTrait;
