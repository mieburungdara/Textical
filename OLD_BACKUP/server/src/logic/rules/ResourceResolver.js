/**
 * ResourceResolver
 * Specialized logic for dynamic resources: MANA, RAGE, ENERGY.
 */
class ResourceResolver {
    /**
     * Handles passive regeneration per turn.
     */
    applyRegen(unit, sim) {
        const type = unit.data.resourceType || "MANA";
        
        switch (type) {
            case "ENERGY":
                // Fast fixed regen for Rogues/Archers
                unit.gainMana(20, sim); 
                break;
            case "MANA":
                // Use mana_regen stat
                const manaRegen = unit.getStat("mana_regen") || 0;
                if (manaRegen > 0) {
                    unit.gainMana(manaRegen, sim);
                }
                break;
            case "RAGE":
                // Rage usually decays out of combat, but stays flat here.
                // Warriors don't regen Rage passively.
                break;
        }
    }

    /**
     * Handles active gains during combat events.
     */
    handleCombatGain(unit, eventType, amount, sim) {
        const type = unit.data.resourceType || "MANA";
        if (type !== "RAGE") return;

        if (eventType === "TAKE_DAMAGE") {
            // Gain 1 Rage for every 10 damage taken
            const gain = Math.floor(amount / 10);
            if (gain > 0) unit.gainMana(gain, sim);
        } else if (eventType === "DEAL_DAMAGE") {
            // Gain 5 Rage per hit
            unit.gainMana(5, sim);
        }
    }
}

module.exports = new ResourceResolver();
