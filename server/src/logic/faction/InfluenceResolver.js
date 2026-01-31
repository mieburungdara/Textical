/**
 * AAA InfluenceResolver
 * Pure component for determining regional domination benefits and siege states.
 */
class InfluenceResolver {
    constructor() {
        this.DOMINATION_THRESHOLD = 5000;
        this.REINFORCEMENT_THRESHOLD = 1000; // Low influence triggers guards
    }

    /**
     * Resolves active buffs for a faction based on their influence points.
     */
    resolveDominationBuffs(points) {
        if (points < this.REINFORCEMENT_THRESHOLD) return {};

        const buffs = {
            attack_damage: 0,
            defense: 0,
            miningYieldMult: 1.0
        };

        // Tiered Bonuses
        if (points >= this.DOMINATION_THRESHOLD) {
            buffs.attack_damage = 0.15; // 15%
            buffs.defense = 0.15;
            buffs.miningYieldMult = 1.5;
        } else if (points >= 2500) {
            buffs.attack_damage = 0.05; // 5%
            buffs.defense = 0.05;
            buffs.miningYieldMult = 1.2;
        }

        return buffs;
    }

    /**
     * Checks if a region requires NPC reinforcements.
     * Triggered by very low influence OR an active War event.
     */
    isSiegeState(points, hasWarEvent = false) {
        return points < this.REINFORCEMENT_THRESHOLD || hasWarEvent;
    }
}

module.exports = new InfluenceResolver();
