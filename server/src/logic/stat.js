const StatModifier = require('./statModifier');

class Stat {
    constructor(baseValue) {
        this.baseValue = baseValue;
        this.modifiers = [];
    }

    addModifier(modifier) {
        this.modifiers.push(modifier);
    }

    getValue() {
        let finalValue = this.baseValue;
        let pAdd = 0.0;
        let pMult = 1.0;

        // 1. Flat modifiers
        this.modifiers.forEach(mod => {
            if (mod.type === StatModifier.Type.FLAT) finalValue += mod.value;
            else if (mod.type === StatModifier.Type.PERCENT_ADD) pAdd += mod.value;
            else if (mod.type === StatModifier.Type.PERCENT_MULT) pMult *= mod.value;
        });

        // 2. Additive percentage
        finalValue *= (1.0 + pAdd);
        
        // 3. Multiplicative percentage
        finalValue *= pMult;

        // CRITICAL FIX: Do NOT floor here to support decimal chances (0.05 etc)
        // Rounding should only happen at the final damage calculation step.
        return finalValue;
    }
}

module.exports = Stat;