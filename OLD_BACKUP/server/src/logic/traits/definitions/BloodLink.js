const BaseTrait = require('../BaseTrait');

/**
 * Blood Link Trait
 * Absorbs damage for an ally that is linked to this unit.
 * Tiered Scaling:
 * Lv1: Absorbs 20% of damage
 * Lv2: Absorbs 40% of damage
 * Lv3: Absorbs 60% of damage
 */
class BloodLinkTrait extends BaseTrait {
    constructor() {
        super('bloodlink');
    }

    /**
     * @param {BattleUnit} unit - The Protector
     * @param {BattleSimulation} sim - Simulation context
     * @param {BattleUnit} ally - The unit taking damage
     * @param {number} amount - Damage amount
     */
    onAllyDamage(unit, sim, ally, amount) {
        if (!ally || !sim || unit.isDead) return;

        const link = ally.activeEffects.find(e => e.type === "LINKED" && e.originId === unit.instanceId);
        
        if (link) {
            // Get trait level
            const traitObj = unit.traits.find(t => 
                (typeof t === 'string' && t.toLowerCase() === 'bloodlink') || 
                (t && t.name && t.name.toLowerCase() === 'bloodlink')
            );
            const level = (traitObj && typeof traitObj === 'object') ? (traitObj.level || 1) : 1;

            // Tiering
            const absorbMapping = { 1: 0.20, 2: 0.40, 3: 0.60 };
            const absorbPercent = absorbMapping[level] || 0.20;

            const redirected = Math.floor(amount * absorbPercent);
            
            if (redirected > 0) {
                // Blood Link bypasses standard defense of the protector
                unit.takeDamage(redirected, sim);
                
                sim.logger.addEvent("REACTION", `${unit.data.name} absorbs soul-link damage for ${ally.data.name} (Lv${level})!`, {
                    actor_id: unit.instanceId,
                    target_id: ally.instanceId,
                    damage: redirected,
                    type: "BLOOD_LINK",
                    absorb_percent: absorbPercent
                });
            }
        }
    }
}

module.exports = BloodLinkTrait;