const math = require('mathjs');

class StatModifier {
    static Type = {
        FLAT: 0,
        PERCENT_ADD: 1,
        PERCENT_MULT: 2
    };

    constructor(value, type, source = "") {
        this.value = value;
        this.type = type;
        this.source = source;
    }
}

class Stat {
    constructor(baseValue) {
        this.baseValue = baseValue;
        this.modifiers = [];
    }

    addModifier(mod) {
        this.modifiers.push(mod);
    }

    getValue() {
        let finalValue = this.baseValue;
        let sumPercentAdd = 0;
        let sumPercentMult = 1.0;

        this.modifiers.forEach(mod => {
            if (mod.type === StatModifier.Type.FLAT) {
                finalValue = math.add(finalValue, mod.value);
            } else if (mod.type === StatModifier.Type.PERCENT_ADD) {
                sumPercentAdd = math.add(sumPercentAdd, mod.value);
            } else if (mod.type === StatModifier.Type.PERCENT_MULT) {
                sumPercentMult = math.multiply(sumPercentMult, mod.value);
            }
        });

        // formula: (base + flat) * (1 + sum_percent_add) * (product_percent_mult)
        finalValue = math.multiply(finalValue, math.add(1, sumPercentAdd));
        finalValue = math.multiply(finalValue, sumPercentMult);

        return finalValue;
    }
}

module.exports = { Stat, StatModifier };
