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

module.exports = StatModifier;
