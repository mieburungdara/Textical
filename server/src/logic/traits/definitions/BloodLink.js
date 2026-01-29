const BaseTrait = require('../BaseTrait');

class BloodLinkTrait extends BaseTrait {
    constructor() { super('bloodlink'); }

    /**
     * @param {BattleUnit} unit - The Protector
     * @param {BattleSimulation} sim - Simulation context
     * @param {BattleUnit} ally - The unit taking damage
     * @param {number} amount - Damage amount
     */
    onAllyDamage(unit, sim, ally, amount) {
        if (!ally || !sim) return;

        const link = ally.activeEffects.find(e => e.type === "LINKED" && e.originId === unit.instanceId);
        
        if (link && !unit.isDead) {
            const redirected = Math.floor(amount * 0.5);
            unit.takeDamage(redirected);
            
            sim.logger.addEvent("REACTION", `${unit.data.name} absorbs soul-link damage for ${ally.data.name}!`, {
                actor_id: unit.instanceId,
                damage: redirected,
                type: "BLOOD_LINK"
            });
        }
    }
}

module.exports = BloodLinkTrait;